"""Capture all network requests made during page load."""

from __future__ import annotations

from playwright.async_api import Page, Request, Response

from reconscan.models import NetworkRequest


async def capture_network(page: Page, job_id: str) -> list[NetworkRequest]:
    """Attach request/response listeners before navigation and return results.

    Call this function before navigating to the URL.  The returned list will
    be populated as the page loads when used together with the scanner
    orchestrator that drives the Playwright page object.
    """
    results: list[NetworkRequest] = []
    timings: dict[str, float] = {}

    def on_request(request: Request) -> None:
        timings[request.url] = 0.0

    async def on_response(response: Response) -> None:
        try:
            body = await response.body()
            size = len(body)
        except Exception:
            size = 0

        timing = response.request.timing
        elapsed = (
            timing.get("responseEnd", 0.0) - timing.get("requestStart", 0.0)
            if timing
            else 0.0
        )

        results.append(
            NetworkRequest(
                job_id=job_id,
                url=response.url,
                method=response.request.method,
                status_code=response.status,
                mime_type=response.headers.get("content-type", "").split(";")[0],
                size=size,
                timing_ms=max(elapsed, 0.0),
            )
        )

    page.on("request", on_request)
    page.on("response", on_response)
    return results
