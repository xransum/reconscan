"""Capture the HTTP redirect chain leading to the final URL."""

from __future__ import annotations

from playwright.async_api import Page, Request, Response

from reconscan.models import Redirect


async def capture_redirects(page: Page, job_id: str) -> list[Redirect]:
    """Attach listeners to record all HTTP redirects during navigation.

    Returns the list in-place as the page loads.
    """
    redirects: list[Redirect] = []
    step = 0

    async def on_response(response: Response) -> None:
        nonlocal step
        if response.status in (301, 302, 303, 307, 308):
            location = response.headers.get("location", "")
            redirects.append(
                Redirect(
                    job_id=job_id,
                    step=step,
                    from_url=response.url,
                    to_url=location,
                    status_code=response.status,
                )
            )
            step += 1

    page.on("response", on_response)
    return redirects
