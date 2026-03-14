"""Collect TLS certificate information for the target host."""

from __future__ import annotations

import json
import socket
import ssl
from typing import Any
from urllib.parse import urlparse

from cryptography import x509
from cryptography.hazmat.backends import default_backend
from cryptography.x509.oid import ExtensionOID

from reconscan.models import TlsInfo


def _format_name(name: x509.Name) -> str:
    parts = []
    for attr in name:
        parts.append(f"{attr.oid.dotted_string}={attr.value}")
    return ", ".join(parts)


def _get_san(cert: x509.Certificate) -> str:
    try:
        ext = cert.extensions.get_extension_for_oid(
            ExtensionOID.SUBJECT_ALTERNATIVE_NAME
        )
        san_ext: x509.SubjectAlternativeName = ext.value  # type: ignore[assignment]
        return ", ".join(san_ext.get_values_for_type(x509.DNSName))
    except x509.ExtensionNotFound:
        return ""


def _cert_to_dict(cert: x509.Certificate) -> dict[str, Any]:
    return {
        "subject": _format_name(cert.subject),
        "issuer": _format_name(cert.issuer),
        "not_before": cert.not_valid_before_utc.isoformat(),
        "not_after": cert.not_valid_after_utc.isoformat(),
        "serial": str(cert.serial_number),
    }


async def capture_tls(job_id: str, url: str) -> TlsInfo | None:
    """Fetch TLS certificate info for the host in *url*.

    Returns None for non-HTTPS URLs or if the connection fails.
    """
    parsed = urlparse(url)
    if parsed.scheme != "https":
        return None

    host = parsed.hostname or ""
    port = parsed.port or 443

    try:
        ctx = ssl.create_default_context()
        with (
            socket.create_connection((host, port), timeout=10) as sock,
            ctx.wrap_socket(sock, server_hostname=host) as ssock,
        ):
            der_cert = ssock.getpeercert(binary_form=True)
    except Exception:
        return None

    if der_cert is None:
        return None

    cert = x509.load_der_x509_certificate(der_cert, default_backend())

    return TlsInfo(
        job_id=job_id,
        issuer=_format_name(cert.issuer),
        subject=_format_name(cert.subject),
        san=_get_san(cert),
        not_before=cert.not_valid_before_utc.isoformat(),
        not_after=cert.not_valid_after_utc.isoformat(),
        chain_json=json.dumps([_cert_to_dict(cert)]),
    )
