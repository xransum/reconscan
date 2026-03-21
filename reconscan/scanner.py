"""Scan orchestrator -- coordinates all collection modules."""

from __future__ import annotations

import asyncio
import datetime
import logging
from pathlib import Path

from playwright.async_api import BrowserType, Playwright, async_playwright

from reconscan import db as database
from reconscan.models import Job, ScanResult
from reconscan.modules.console import capture_console
from reconscan.modules.cookies import capture_cookies
from reconscan.modules.dns import capture_dns
from reconscan.modules.dom import capture_dom
from reconscan.modules.links import capture_links
from reconscan.modules.network import capture_network
from reconscan.modules.redirects import capture_redirects
from reconscan.modules.screenshot import capture_screenshot
from reconscan.modules.technologies import capture_technologies
from reconscan.modules.tls import capture_tls

logger = logging.getLogger(__name__)

_BROWSER_PREFERENCE = ("chromium", "firefox", "webkit")


def _browser_type(pw: Playwright, name: str) -> BrowserType:
    return getattr(pw, name)


async def _launch_browser(pw: Playwright, browser: str | None, headless: bool):
    """Launch the requested browser, or auto-detect the first available one."""
    candidates = [browser] if browser else list(_BROWSER_PREFERENCE)
    last_exc: Exception | None = None
    for name in candidates:
        bt = _browser_type(pw, name)
        try:
            return await bt.launch(headless=headless)
        except Exception as exc:
            logger.debug("managed %r binary not available: %s", name, exc)
            last_exc = exc
    raise RuntimeError(
        f"No usable browser found (tried: {candidates}). "
        "Install a browser with `playwright install firefox`."
    ) from last_exc


async def run_scan(
    job_id: str,
    url: str,
    data_dir: Path,
    headless: bool = True,
    timeout: int = 30,
    browser: str | None = None,
) -> ScanResult:
    """Run all collection modules against *url*, persist results, and return ScanResult."""
    db_path = data_dir / "reconscan.db"

    conn = database.get_connection(db_path)
    created_at = datetime.datetime.now(datetime.UTC).isoformat()

    job = Job(
        id=job_id,
        url=url,
        status="running",
        created_at=created_at,
    )
    database.insert_job(conn, job)
    # Print job_id immediately so the web API can read it without waiting for the scan
    print(job_id, flush=True)

    result = ScanResult(job=job)

    try:
        async with async_playwright() as pw:
            launched = await _launch_browser(pw, browser, headless)
            context = await launched.new_context(
                ignore_https_errors=False,
                java_script_enabled=True,
            )
            page = await context.new_page()

            # Attach listeners before navigation so we capture everything
            network_requests = await capture_network(page, job_id)
            console_logs = await capture_console(page, job_id)
            redirects = await capture_redirects(page, job_id)

            await page.goto(url, timeout=timeout * 1000, wait_until="networkidle")

            # Collect all data in parallel where possible
            (
                snapshot,
                technologies,
                links,
                (screenshot_jpg, screenshot_gif),
            ) = await asyncio.gather(
                capture_dom(page, job_id),
                capture_technologies(page, job_id),
                capture_links(page, job_id),
                capture_screenshot(page, job_id),
            )

            snapshot.screenshot_jpg = screenshot_jpg
            snapshot.screenshot_gif = screenshot_gif

            cookies = await capture_cookies(context, job_id)
            await launched.close()

        # Async but not browser-dependent
        tls_info, dns_records = await asyncio.gather(
            capture_tls(job_id, url),
            capture_dns(job_id, url),
        )

        # Persist all results
        database.insert_snapshot(conn, snapshot)
        database.insert_network_requests(conn, network_requests)
        database.insert_console_logs(conn, console_logs)
        database.insert_cookies(conn, cookies)
        database.insert_redirects(conn, redirects)
        database.insert_technologies(conn, technologies)
        database.insert_links(conn, links)
        database.insert_dns_records(conn, dns_records)
        if tls_info is not None:
            database.insert_tls_info(conn, tls_info)

        completed_at = datetime.datetime.now(datetime.UTC).isoformat()
        database.update_job_status(conn, job_id, "complete", completed_at)

        result.snapshot = snapshot
        result.network_requests = network_requests
        result.console_logs = console_logs
        result.cookies = cookies
        result.tls_info = tls_info
        result.redirects = redirects
        result.technologies = technologies
        result.links = links
        result.dns_records = dns_records
        result.job.status = "complete"
        result.job.completed_at = completed_at

    except Exception as exc:
        logger.exception("scan failed for %s: %s", url, exc)
        database.update_job_status(
            conn,
            job_id,
            "failed",
            datetime.datetime.now(datetime.UTC).isoformat(),
        )
        result.job.status = "failed"
        conn.close()
        raise

    conn.close()
    return result
