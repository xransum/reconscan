"""Capture the final rendered DOM / HTML snapshot."""

from __future__ import annotations

from playwright.async_api import Page

from reconscan.models import Snapshot


async def capture_dom(page: Page, job_id: str) -> Snapshot:
    """Return a Snapshot containing the full rendered HTML and final URL."""
    html = await page.content()
    final_url = page.url
    return Snapshot(job_id=job_id, html=html, final_url=final_url)
