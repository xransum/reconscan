"""SQLite schema initialisation and read/write helpers."""

from __future__ import annotations

import sqlite3
from pathlib import Path

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

_MIGRATIONS = [
    # v1: path columns -- kept so existing DBs don't error, values are no longer written
    "ALTER TABLE snapshots ADD COLUMN screenshot_path TEXT",
    "ALTER TABLE snapshots ADD COLUMN screenshot_gif TEXT",
    # v2: blob columns
    "ALTER TABLE snapshots ADD COLUMN screenshot_jpg BLOB",
]

_SCHEMA = """
PRAGMA journal_mode=WAL;
PRAGMA foreign_keys=ON;

CREATE TABLE IF NOT EXISTS jobs (
    id           TEXT PRIMARY KEY,
    url          TEXT NOT NULL,
    status       TEXT NOT NULL DEFAULT 'pending',
    created_at   TEXT NOT NULL,
    completed_at TEXT
);

CREATE TABLE IF NOT EXISTS snapshots (
    job_id          TEXT PRIMARY KEY REFERENCES jobs(id),
    html            TEXT NOT NULL,
    final_url       TEXT NOT NULL,
    screenshot_jpg  BLOB,
    screenshot_gif  TEXT
);

CREATE TABLE IF NOT EXISTS network_requests (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    job_id      TEXT NOT NULL REFERENCES jobs(id),
    url         TEXT NOT NULL,
    method      TEXT NOT NULL,
    status_code INTEGER NOT NULL,
    mime_type   TEXT NOT NULL,
    size        INTEGER NOT NULL,
    timing_ms   REAL NOT NULL
);

CREATE TABLE IF NOT EXISTS console_logs (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    job_id     TEXT NOT NULL REFERENCES jobs(id),
    level      TEXT NOT NULL,
    text       TEXT NOT NULL,
    source_url TEXT NOT NULL,
    line_no    INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS cookies (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    job_id     TEXT NOT NULL REFERENCES jobs(id),
    name       TEXT NOT NULL,
    value      TEXT NOT NULL,
    domain     TEXT NOT NULL,
    path       TEXT NOT NULL,
    secure     INTEGER NOT NULL,
    http_only  INTEGER NOT NULL,
    same_site  TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS tls_info (
    job_id      TEXT PRIMARY KEY REFERENCES jobs(id),
    issuer      TEXT NOT NULL,
    subject     TEXT NOT NULL,
    san         TEXT NOT NULL,
    not_before  TEXT NOT NULL,
    not_after   TEXT NOT NULL,
    chain_json  TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS redirects (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    job_id      TEXT NOT NULL REFERENCES jobs(id),
    step        INTEGER NOT NULL,
    from_url    TEXT NOT NULL,
    to_url      TEXT NOT NULL,
    status_code INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS technologies (
    id       INTEGER PRIMARY KEY AUTOINCREMENT,
    job_id   TEXT NOT NULL REFERENCES jobs(id),
    name     TEXT NOT NULL,
    version  TEXT NOT NULL,
    category TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS links (
    id     INTEGER PRIMARY KEY AUTOINCREMENT,
    job_id TEXT NOT NULL REFERENCES jobs(id),
    url    TEXT NOT NULL,
    type   TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS dns_records (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    job_id      TEXT NOT NULL REFERENCES jobs(id),
    record_type TEXT NOT NULL,
    value       TEXT NOT NULL,
    ttl         INTEGER NOT NULL
);
"""


def get_connection(db_path: Path) -> sqlite3.Connection:
    db_path.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(str(db_path))
    conn.row_factory = sqlite3.Row
    conn.executescript(_SCHEMA)
    for migration in _MIGRATIONS:
        try:
            conn.execute(migration)
            conn.commit()
        except sqlite3.OperationalError:
            # Column already exists -- safe to ignore.
            pass
    return conn


# ---------------------------------------------------------------------------
# Write helpers
# ---------------------------------------------------------------------------


def insert_job(conn: sqlite3.Connection, job: Job) -> None:
    conn.execute(
        "INSERT INTO jobs (id, url, status, created_at, completed_at) "
        "VALUES (?, ?, ?, ?, ?)",
        (job.id, job.url, job.status, job.created_at, job.completed_at),
    )
    conn.commit()


def update_job_status(
    conn: sqlite3.Connection,
    job_id: str,
    status: str,
    completed_at: str | None = None,
) -> None:
    conn.execute(
        "UPDATE jobs SET status = ?, completed_at = ? WHERE id = ?",
        (status, completed_at, job_id),
    )
    conn.commit()


def insert_snapshot(conn: sqlite3.Connection, snapshot: Snapshot) -> None:
    conn.execute(
        "INSERT OR REPLACE INTO snapshots "
        "(job_id, html, final_url, screenshot_jpg, screenshot_gif) "
        "VALUES (?, ?, ?, ?, ?)",
        (
            snapshot.job_id,
            snapshot.html,
            snapshot.final_url,
            snapshot.screenshot_jpg,
            snapshot.screenshot_gif,
        ),
    )
    conn.commit()


def insert_network_requests(
    conn: sqlite3.Connection, requests: list[NetworkRequest]
) -> None:
    conn.executemany(
        "INSERT INTO network_requests "
        "(job_id, url, method, status_code, mime_type, size, timing_ms) "
        "VALUES (?, ?, ?, ?, ?, ?, ?)",
        [
            (r.job_id, r.url, r.method, r.status_code, r.mime_type, r.size, r.timing_ms)
            for r in requests
        ],
    )
    conn.commit()


def insert_console_logs(conn: sqlite3.Connection, logs: list[ConsoleLog]) -> None:
    conn.executemany(
        "INSERT INTO console_logs (job_id, level, text, source_url, line_no) "
        "VALUES (?, ?, ?, ?, ?)",
        [(lg.job_id, lg.level, lg.text, lg.source_url, lg.line_no) for lg in logs],
    )
    conn.commit()


def insert_cookies(conn: sqlite3.Connection, cookies: list[Cookie]) -> None:
    conn.executemany(
        "INSERT INTO cookies "
        "(job_id, name, value, domain, path, secure, http_only, same_site) "
        "VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        [
            (
                c.job_id,
                c.name,
                c.value,
                c.domain,
                c.path,
                int(c.secure),
                int(c.http_only),
                c.same_site,
            )
            for c in cookies
        ],
    )
    conn.commit()


def insert_tls_info(conn: sqlite3.Connection, tls: TlsInfo) -> None:
    conn.execute(
        "INSERT OR REPLACE INTO tls_info "
        "(job_id, issuer, subject, san, not_before, not_after, chain_json) "
        "VALUES (?, ?, ?, ?, ?, ?, ?)",
        (
            tls.job_id,
            tls.issuer,
            tls.subject,
            tls.san,
            tls.not_before,
            tls.not_after,
            tls.chain_json,
        ),
    )
    conn.commit()


def insert_redirects(conn: sqlite3.Connection, redirects: list[Redirect]) -> None:
    conn.executemany(
        "INSERT INTO redirects (job_id, step, from_url, to_url, status_code) "
        "VALUES (?, ?, ?, ?, ?)",
        [(r.job_id, r.step, r.from_url, r.to_url, r.status_code) for r in redirects],
    )
    conn.commit()


def insert_technologies(
    conn: sqlite3.Connection, technologies: list[Technology]
) -> None:
    conn.executemany(
        "INSERT INTO technologies (job_id, name, version, category) "
        "VALUES (?, ?, ?, ?)",
        [(t.job_id, t.name, t.version, t.category) for t in technologies],
    )
    conn.commit()


def insert_links(conn: sqlite3.Connection, links: list[Link]) -> None:
    conn.executemany(
        "INSERT INTO links (job_id, url, type) VALUES (?, ?, ?)",
        [(lk.job_id, lk.url, lk.type) for lk in links],
    )
    conn.commit()


def insert_dns_records(conn: sqlite3.Connection, records: list[DnsRecord]) -> None:
    conn.executemany(
        "INSERT INTO dns_records (job_id, record_type, value, ttl) VALUES (?, ?, ?, ?)",
        [(r.job_id, r.record_type, r.value, r.ttl) for r in records],
    )
    conn.commit()


# ---------------------------------------------------------------------------
# Read helpers
# ---------------------------------------------------------------------------


def get_job(conn: sqlite3.Connection, job_id: str) -> Job | None:
    row = conn.execute("SELECT * FROM jobs WHERE id = ?", (job_id,)).fetchone()
    if row is None:
        return None
    return Job(
        id=row["id"],
        url=row["url"],
        status=row["status"],
        created_at=row["created_at"],
        completed_at=row["completed_at"],
    )


def get_snapshot(conn: sqlite3.Connection, job_id: str) -> Snapshot | None:
    row = conn.execute("SELECT * FROM snapshots WHERE job_id = ?", (job_id,)).fetchone()
    if row is None:
        return None
    return Snapshot(
        job_id=row["job_id"],
        html=row["html"],
        final_url=row["final_url"],
        screenshot_jpg=bytes(row["screenshot_jpg"]) if row["screenshot_jpg"] else None,
        screenshot_gif=bytes(row["screenshot_gif"]) if row["screenshot_gif"] else None,
    )


def get_network_requests(conn: sqlite3.Connection, job_id: str) -> list[NetworkRequest]:
    rows = conn.execute(
        "SELECT * FROM network_requests WHERE job_id = ? ORDER BY id", (job_id,)
    ).fetchall()
    return [
        NetworkRequest(
            job_id=r["job_id"],
            url=r["url"],
            method=r["method"],
            status_code=r["status_code"],
            mime_type=r["mime_type"],
            size=r["size"],
            timing_ms=r["timing_ms"],
        )
        for r in rows
    ]


def get_console_logs(conn: sqlite3.Connection, job_id: str) -> list[ConsoleLog]:
    rows = conn.execute(
        "SELECT * FROM console_logs WHERE job_id = ? ORDER BY id", (job_id,)
    ).fetchall()
    return [
        ConsoleLog(
            job_id=r["job_id"],
            level=r["level"],
            text=r["text"],
            source_url=r["source_url"],
            line_no=r["line_no"],
        )
        for r in rows
    ]


def get_cookies(conn: sqlite3.Connection, job_id: str) -> list[Cookie]:
    rows = conn.execute(
        "SELECT * FROM cookies WHERE job_id = ? ORDER BY id", (job_id,)
    ).fetchall()
    return [
        Cookie(
            job_id=r["job_id"],
            name=r["name"],
            value=r["value"],
            domain=r["domain"],
            path=r["path"],
            secure=bool(r["secure"]),
            http_only=bool(r["http_only"]),
            same_site=r["same_site"],
        )
        for r in rows
    ]


def get_tls_info(conn: sqlite3.Connection, job_id: str) -> TlsInfo | None:
    row = conn.execute("SELECT * FROM tls_info WHERE job_id = ?", (job_id,)).fetchone()
    if row is None:
        return None
    return TlsInfo(
        job_id=row["job_id"],
        issuer=row["issuer"],
        subject=row["subject"],
        san=row["san"],
        not_before=row["not_before"],
        not_after=row["not_after"],
        chain_json=row["chain_json"],
    )


def get_redirects(conn: sqlite3.Connection, job_id: str) -> list[Redirect]:
    rows = conn.execute(
        "SELECT * FROM redirects WHERE job_id = ? ORDER BY step", (job_id,)
    ).fetchall()
    return [
        Redirect(
            job_id=r["job_id"],
            step=r["step"],
            from_url=r["from_url"],
            to_url=r["to_url"],
            status_code=r["status_code"],
        )
        for r in rows
    ]


def get_technologies(conn: sqlite3.Connection, job_id: str) -> list[Technology]:
    rows = conn.execute(
        "SELECT * FROM technologies WHERE job_id = ? ORDER BY name", (job_id,)
    ).fetchall()
    return [
        Technology(
            job_id=r["job_id"],
            name=r["name"],
            version=r["version"],
            category=r["category"],
        )
        for r in rows
    ]


def get_links(conn: sqlite3.Connection, job_id: str) -> list[Link]:
    rows = conn.execute(
        "SELECT * FROM links WHERE job_id = ? ORDER BY type, url", (job_id,)
    ).fetchall()
    return [Link(job_id=r["job_id"], url=r["url"], type=r["type"]) for r in rows]


def get_dns_records(conn: sqlite3.Connection, job_id: str) -> list[DnsRecord]:
    rows = conn.execute(
        "SELECT * FROM dns_records WHERE job_id = ? ORDER BY record_type, value",
        (job_id,),
    ).fetchall()
    return [
        DnsRecord(
            job_id=r["job_id"],
            record_type=r["record_type"],
            value=r["value"],
            ttl=r["ttl"],
        )
        for r in rows
    ]


def get_scan_result(conn: sqlite3.Connection, job_id: str) -> ScanResult | None:
    """Return a fully-populated ScanResult for *job_id*, or None if not found."""
    job = get_job(conn, job_id)
    if job is None:
        return None
    return ScanResult(
        job=job,
        snapshot=get_snapshot(conn, job_id),
        network_requests=get_network_requests(conn, job_id),
        console_logs=get_console_logs(conn, job_id),
        cookies=get_cookies(conn, job_id),
        tls_info=get_tls_info(conn, job_id),
        redirects=get_redirects(conn, job_id),
        technologies=get_technologies(conn, job_id),
        links=get_links(conn, job_id),
        dns_records=get_dns_records(conn, job_id),
    )


def get_all_jobs(conn: sqlite3.Connection) -> list[Job]:
    """Return all jobs ordered by created_at descending."""
    rows = conn.execute("SELECT * FROM jobs ORDER BY created_at DESC").fetchall()
    return [
        Job(
            id=r["id"],
            url=r["url"],
            status=r["status"],
            created_at=r["created_at"],
            completed_at=r["completed_at"],
        )
        for r in rows
    ]
