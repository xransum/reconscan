"""Detect technologies used by the page via python-Wappalyzer."""

from __future__ import annotations

import importlib.util
import pathlib
import sys
import types

from playwright.async_api import Page

from reconscan.models import Technology


def _ensure_pkg_resources_shim() -> None:
    """Inject a minimal pkg_resources shim if the real one is missing.

    python-Wappalyzer 0.3.1 imports pkg_resources only to call
    resource_string() for loading its bundled technologies.json.  On
    Python 3.12 with modern setuptools that module no longer exists.
    This shim satisfies the single call site without requiring a
    setuptools install or a Python downgrade.
    """
    if "pkg_resources" in sys.modules:
        return

    class _Shim(types.ModuleType):
        def resource_string(  # type: ignore[override]
            self,
            package_or_requirement: str,
            resource_name: str,
        ) -> bytes:
            spec = importlib.util.find_spec(package_or_requirement)
            if spec is None or spec.origin is None:
                raise FileNotFoundError(
                    f"Cannot locate package {package_or_requirement!r}"
                )
            pkg_dir = pathlib.Path(spec.origin).parent
            return (pkg_dir / resource_name).read_bytes()

    sys.modules["pkg_resources"] = _Shim("pkg_resources")


async def capture_technologies(page: Page, job_id: str) -> list[Technology]:
    """Detect technologies present on the loaded page."""
    _ensure_pkg_resources_shim()
    try:
        from Wappalyzer import Wappalyzer, WebPage
    except ImportError:
        return []

    try:
        import warnings

        html = await page.content()
        url = page.url
        headers: dict[str, str] = {}

        with warnings.catch_warnings():
            warnings.filterwarnings("ignore", category=UserWarning, module="Wappalyzer")
            wappalyzer = Wappalyzer.latest()

        webpage = WebPage(url, html, headers)
        detected = wappalyzer.analyze_with_categories(webpage)
    except Exception:
        return []

    results: list[Technology] = []
    for name, meta in detected.items():
        categories = meta.get("categories", [])
        category = ", ".join(categories) if categories else "Unknown"
        results.append(
            Technology(
                job_id=job_id,
                name=name,
                version=meta.get("version", "") or "",
                category=category,
            )
        )
    return results
