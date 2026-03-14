"""Shared pytest fixtures."""

from __future__ import annotations

import sqlite3
from collections.abc import Generator
from pathlib import Path

import pytest

from reconscan.db import get_connection


@pytest.fixture()
def tmp_db(tmp_path: Path) -> Generator[sqlite3.Connection, None, None]:
    """Return a SQLite connection backed by a temp file, closed after test."""
    db_path = tmp_path / "test.db"
    conn = get_connection(db_path)
    try:
        yield conn
    finally:
        conn.close()
