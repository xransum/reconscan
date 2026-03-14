"""Tests for dataclass models."""

from __future__ import annotations

from reconscan.models import (
    ConsoleLog,
    Cookie,
    DnsRecord,
    Job,
    Link,
    NetworkRequest,
    Redirect,
    ScanResult,
    Snapshot,
    Technology,
    TlsInfo,
)


def test_job_instantiation() -> None:
    job = Job(id="x", url="https://example.com", status="complete", created_at="now")
    assert job.id == "x"
    assert job.completed_at is None


def test_scan_result_defaults() -> None:
    job = Job(id="x", url="https://example.com", status="complete", created_at="now")
    result = ScanResult(job=job)
    assert result.network_requests == []
    assert result.console_logs == []
    assert result.cookies == []
    assert result.redirects == []
    assert result.technologies == []
    assert result.links == []
    assert result.dns_records == []
    assert result.snapshot is None
    assert result.tls_info is None
    assert result.screenshot_path is None


def test_all_model_types_instantiate() -> None:
    """Smoke test -- every model can be instantiated without error."""
    Snapshot(job_id="j", html="<html>", final_url="https://example.com")
    NetworkRequest(
        job_id="j",
        url="https://x.com",
        method="GET",
        status_code=200,
        mime_type="text/html",
        size=100,
        timing_ms=10.0,
    )
    ConsoleLog(
        job_id="j", level="error", text="oops", source_url="https://x.com", line_no=1
    )
    Cookie(
        job_id="j",
        name="sid",
        value="abc",
        domain="x.com",
        path="/",
        secure=True,
        http_only=True,
        same_site="Lax",
    )
    TlsInfo(
        job_id="j",
        issuer="CA",
        subject="example.com",
        san="example.com",
        not_before="2024-01-01",
        not_after="2025-01-01",
        chain_json="[]",
    )
    Redirect(
        job_id="j",
        step=0,
        from_url="http://x.com",
        to_url="https://x.com",
        status_code=301,
    )
    Technology(job_id="j", name="React", version="18", category="JavaScript frameworks")
    Link(job_id="j", url="https://x.com/about", type="internal")
    DnsRecord(job_id="j", record_type="A", value="93.184.216.34", ttl=3600)
