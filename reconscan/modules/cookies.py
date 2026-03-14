"""Collect all cookies set during the page load."""

from __future__ import annotations

from playwright.async_api import BrowserContext

from reconscan.models import Cookie


async def capture_cookies(context: BrowserContext, job_id: str) -> list[Cookie]:
    """Return all cookies present in the browser context after page load."""
    raw = await context.cookies()
    return [
        Cookie(
            job_id=job_id,
            name=c.get("name", ""),
            value=c.get("value", ""),
            domain=c.get("domain", ""),
            path=c.get("path", "/"),
            secure=bool(c.get("secure", False)),
            http_only=bool(c.get("httpOnly", False)),
            same_site=c.get("sameSite", "None") or "None",
        )
        for c in raw
    ]
