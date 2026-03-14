"""Extract all links from the rendered page."""

from __future__ import annotations

from urllib.parse import urljoin, urlparse

from playwright.async_api import Page

from reconscan.models import Link


def _is_internal(base_url: str, href: str) -> bool:
    base_host = urlparse(base_url).netloc
    href_host = urlparse(href).netloc
    return href_host == "" or href_host == base_host


async def capture_links(page: Page, job_id: str) -> list[Link]:
    """Extract all anchor hrefs and classify them as internal or external."""
    base_url = page.url
    raw_hrefs: list[str] = await page.eval_on_selector_all(
        "a[href]",
        "els => els.map(el => el.getAttribute('href'))",
    )

    seen: set[str] = set()
    links: list[Link] = []

    for href in raw_hrefs:
        if not href or href.startswith(("#", "mailto:", "tel:", "javascript:")):
            continue
        absolute = urljoin(base_url, href)
        if absolute in seen:
            continue
        seen.add(absolute)
        link_type = "internal" if _is_internal(base_url, absolute) else "external"
        links.append(Link(job_id=job_id, url=absolute, type=link_type))

    return links
