"""Basic CLI invocation tests."""

from __future__ import annotations

import uuid
from pathlib import Path

from click.testing import CliRunner

from reconscan.cli import cli
from reconscan.db import get_connection, get_job


def test_cli_version() -> None:
    runner = CliRunner()
    result = runner.invoke(cli, ["--version"])
    assert result.exit_code == 0
    assert "0.1.0" in result.output


def test_scan_command_help() -> None:
    runner = CliRunner()
    result = runner.invoke(cli, ["scan", "--help"])
    assert result.exit_code == 0
    assert "URL" in result.output


def test_scan_creates_job_in_db(tmp_path: Path) -> None:
    """Scan a fast, reliable URL and verify a job row is written to the DB."""

    runner = CliRunner()
    data_dir = tmp_path / "data"
    result = runner.invoke(
        cli,
        ["scan", "https://example.com", "--data-dir", str(data_dir)],
    )

    # CLI must exit cleanly
    assert result.exit_code == 0, result.output

    # Output must be a valid UUID
    job_id = result.output.strip()
    try:
        uuid.UUID(job_id)
    except ValueError as err:
        raise AssertionError(f"output is not a valid UUID: {job_id!r}") from err

    # Job must exist in the database with status 'complete'
    conn = get_connection(data_dir / "reconscan.db")
    job = get_job(conn, job_id)
    conn.close()

    assert job is not None
    assert job.url == "https://example.com"
    assert job.status == "complete"
