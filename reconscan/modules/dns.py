"""Perform DNS lookups for the target domain."""

from __future__ import annotations

from urllib.parse import urlparse

import dns.exception
import dns.resolver

from reconscan.models import DnsRecord

_RECORD_TYPES = ("A", "AAAA", "MX", "NS", "CNAME", "TXT")


async def capture_dns(job_id: str, url: str) -> list[DnsRecord]:
    """Query common DNS record types for the host in *url*."""
    host = urlparse(url).hostname or ""
    if not host:
        return []

    records: list[DnsRecord] = []
    resolver = dns.resolver.Resolver()

    for rtype in _RECORD_TYPES:
        try:
            answers = resolver.resolve(host, rtype, lifetime=5)
            for rdata in answers:
                records.append(
                    DnsRecord(
                        job_id=job_id,
                        record_type=rtype,
                        value=rdata.to_text(),
                        ttl=int(answers.rrset.ttl),  # type: ignore[union-attr]
                    )
                )
        except (dns.exception.DNSException, Exception):
            continue

    return records
