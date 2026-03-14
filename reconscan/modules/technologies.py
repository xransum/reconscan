"""Detect technologies used by the page via python-Wappalyzer."""

from __future__ import annotations

from playwright.async_api import Page

from reconscan.models import Technology


async def capture_technologies(page: Page, job_id: str) -> list[Technology]:
    """Detect technologies present on the loaded page."""
    try:
        from Wappalyzer import Wappalyzer, WebPage
    except ImportError:
        return []

    try:
        html = await page.content()
        url = page.url
        headers: dict[str, str] = {}

        wappalyzer = Wappalyzer.latest()
        webpage = WebPage(url, html, headers)
        detected = wappalyzer.analyze_with_categories(webpage)
    except Exception:
        return []

    results: list[Technology] = []
    for name, meta in detected.items():
        categories = meta.get("categories", [])
        category = ", ".join(categories) if categories else "Unknown"
        results.append(
            Technology(
                job_id=job_id,
                name=name,
                version=meta.get("version", "") or "",
                category=category,
            )
        )
    return results
