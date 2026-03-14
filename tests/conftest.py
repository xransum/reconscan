"""Shared pytest fixtures."""

from __future__ import annotations

import sqlite3
import tempfile
from pathlib import Path

import pytest

from reconscan.db import get_connection


@pytest.fixture()
def tmp_db(tmp_path: Path) -> sqlite3.Connection:
    """Return an in-memory-equivalent SQLite connection backed by a temp file."""
    db_path = tmp_path / "test.db"
    conn = get_connection(db_path)
    yield conn
    conn.close()
