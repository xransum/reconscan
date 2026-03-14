"""Scan orchestrator -- coordinates all collection modules."""

from __future__ import annotations

import datetime
from pathlib import Path

from reconscan.models import Job, ScanResult


async def run_scan(
    job_id: str,
    url: str,
    data_dir: Path,
    headless: bool = True,
    timeout: int = 30,
) -> ScanResult:
    """Run all collection modules against *url* and return a ScanResult.

    Modules are wired in as they are implemented.
    """
    job = Job(
        id=job_id,
        url=url,
        status="running",
        created_at=datetime.datetime.utcnow().isoformat(),
    )
    return ScanResult(job=job)
