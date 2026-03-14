"""Dataclasses representing every result type reconscan collects."""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Optional


@dataclass
class Job:
    id: str
    url: str
    status: str  # pending | running | complete | failed
    created_at: str
    completed_at: Optional[str] = None


@dataclass
class Snapshot:
    job_id: str
    html: str
    final_url: str


@dataclass
class NetworkRequest:
    job_id: str
    url: str
    method: str
    status_code: int
    mime_type: str
    size: int
    timing_ms: float


@dataclass
class ConsoleLog:
    job_id: str
    level: str  # log | info | warning | error | debug
    text: str
    source_url: str
    line_no: int


@dataclass
class Cookie:
    job_id: str
    name: str
    value: str
    domain: str
    path: str
    secure: bool
    http_only: bool
    same_site: str


@dataclass
class TlsInfo:
    job_id: str
    issuer: str
    subject: str
    san: str  # comma-separated subject alt names
    not_before: str
    not_after: str
    chain_json: str  # full chain serialised as JSON string


@dataclass
class Redirect:
    job_id: str
    step: int
    from_url: str
    to_url: str
    status_code: int


@dataclass
class Technology:
    job_id: str
    name: str
    version: str
    category: str


@dataclass
class Link:
    job_id: str
    url: str
    type: str  # internal | external


@dataclass
class DnsRecord:
    job_id: str
    record_type: str  # A | AAAA | MX | NS | CNAME | TXT
    value: str
    ttl: int


@dataclass
class ScanResult:
    """Aggregates all collected data for a single scan job."""

    job: Job
    snapshot: Optional[Snapshot] = None
    network_requests: list[NetworkRequest] = field(default_factory=list)
    console_logs: list[ConsoleLog] = field(default_factory=list)
    cookies: list[Cookie] = field(default_factory=list)
    tls_info: Optional[TlsInfo] = None
    redirects: list[Redirect] = field(default_factory=list)
    technologies: list[Technology] = field(default_factory=list)
    links: list[Link] = field(default_factory=list)
    dns_records: list[DnsRecord] = field(default_factory=list)
    screenshot_path: Optional[str] = None
