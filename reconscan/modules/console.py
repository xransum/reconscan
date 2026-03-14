"""Capture browser console log messages."""

from __future__ import annotations

from playwright.async_api import ConsoleMessage, Page

from reconscan.models import ConsoleLog


async def capture_console(page: Page, job_id: str) -> list[ConsoleLog]:
    """Attach a console listener and return the collected log list.

    The list is populated in-place as the page loads.
    """
    logs: list[ConsoleLog] = []

    def on_console(msg: ConsoleMessage) -> None:
        location = msg.location
        logs.append(
            ConsoleLog(
                job_id=job_id,
                level=msg.type,
                text=msg.text,
                source_url=location.get("url", "") if location else "",
                line_no=location.get("lineNumber", 0) if location else 0,
            )
        )

    page.on("console", on_console)
    return logs
