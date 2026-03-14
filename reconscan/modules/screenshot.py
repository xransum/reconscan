"""Capture a full-page JPEG screenshot via Playwright."""

from __future__ import annotations

from pathlib import Path

from playwright.async_api import Page


async def capture_screenshot(page: Page, job_id: str, screenshots_dir: Path) -> str:
    """Save a full-page JPEG screenshot and return the file path."""
    screenshots_dir.mkdir(parents=True, exist_ok=True)
    path = screenshots_dir / f"{job_id}.jpg"
    await page.screenshot(path=str(path), full_page=True, type="jpeg", quality=85)
    return str(path)
