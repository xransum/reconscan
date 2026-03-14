"""Tests for the SQLite schema and read/write helpers."""

from __future__ import annotations

import sqlite3

from reconscan.db import (
    get_job,
    get_network_requests,
    get_snapshot,
    insert_job,
    insert_network_requests,
    insert_snapshot,
    update_job_status,
)
from reconscan.models import Job, NetworkRequest, Snapshot


def test_schema_creates_all_tables(tmp_db: sqlite3.Connection) -> None:
    tables = {
        row[0]
        for row in tmp_db.execute(
            "SELECT name FROM sqlite_master WHERE type='table'"
        ).fetchall()
    }
    expected = {
        "jobs",
        "snapshots",
        "network_requests",
        "console_logs",
        "cookies",
        "tls_info",
        "redirects",
        "technologies",
        "links",
        "dns_records",
    }
    assert expected.issubset(tables)


def test_insert_and_get_job(tmp_db: sqlite3.Connection) -> None:
    job = Job(
        id="abc-123",
        url="https://example.com",
        status="complete",
        created_at="2024-01-01T00:00:00",
        completed_at="2024-01-01T00:00:05",
    )
    insert_job(tmp_db, job)
    fetched = get_job(tmp_db, "abc-123")
    assert fetched is not None
    assert fetched.id == job.id
    assert fetched.url == job.url
    assert fetched.status == job.status


def test_get_job_returns_none_for_missing(tmp_db: sqlite3.Connection) -> None:
    assert get_job(tmp_db, "does-not-exist") is None


def test_update_job_status(tmp_db: sqlite3.Connection) -> None:
    job = Job(
        id="job-1",
        url="https://example.com",
        status="running",
        created_at="2024-01-01T00:00:00",
    )
    insert_job(tmp_db, job)
    update_job_status(tmp_db, "job-1", "complete", "2024-01-01T00:00:10")
    fetched = get_job(tmp_db, "job-1")
    assert fetched is not None
    assert fetched.status == "complete"
    assert fetched.completed_at == "2024-01-01T00:00:10"


def test_insert_and_get_snapshot(tmp_db: sqlite3.Connection) -> None:
    job = Job(
        id="snap-job",
        url="https://example.com",
        status="complete",
        created_at="2024-01-01T00:00:00",
    )
    insert_job(tmp_db, job)
    snapshot = Snapshot(
        job_id="snap-job", html="<html></html>", final_url="https://example.com/"
    )
    insert_snapshot(tmp_db, snapshot)
    fetched = get_snapshot(tmp_db, "snap-job")
    assert fetched is not None
    assert fetched.html == snapshot.html
    assert fetched.final_url == snapshot.final_url


def test_insert_and_get_network_requests(tmp_db: sqlite3.Connection) -> None:
    job = Job(
        id="net-job",
        url="https://example.com",
        status="complete",
        created_at="2024-01-01T00:00:00",
    )
    insert_job(tmp_db, job)
    reqs = [
        NetworkRequest(
            job_id="net-job",
            url="https://example.com/style.css",
            method="GET",
            status_code=200,
            mime_type="text/css",
            size=1024,
            timing_ms=45.2,
        ),
        NetworkRequest(
            job_id="net-job",
            url="https://example.com/app.js",
            method="GET",
            status_code=200,
            mime_type="application/javascript",
            size=8192,
            timing_ms=120.5,
        ),
    ]
    insert_network_requests(tmp_db, reqs)
    fetched = get_network_requests(tmp_db, "net-job")
    assert len(fetched) == 2
    assert fetched[0].url == reqs[0].url
    assert fetched[1].mime_type == reqs[1].mime_type
