"""CLI entry point for reconscan."""

from __future__ import annotations

import asyncio
import sys
import uuid
from pathlib import Path

import click

from reconscan import __version__

DEFAULT_DATA_DIR = Path("data")


@click.group()
@click.version_option(__version__)
def cli() -> None:
    """reconscan -- URL investigation tool."""


@cli.command()
@click.argument("url")
@click.option(
    "--data-dir",
    default=str(DEFAULT_DATA_DIR),
    show_default=True,
    help="Directory where the SQLite database and screenshots are stored.",
)
@click.option(
    "--headless/--no-headless",
    default=True,
    show_default=True,
    help="Run the browser in headless mode.",
)
@click.option(
    "--timeout",
    default=30,
    show_default=True,
    type=int,
    help="Page load timeout in seconds.",
)
@click.option(
    "--show",
    is_flag=True,
    default=False,
    help="Print a summary of the scan results after completion.",
)
def scan(url: str, data_dir: str, headless: bool, timeout: int, show: bool) -> None:
    """Scan URL and store all collected data.

    Prints the job ID to stdout on completion.
    """
    from reconscan.scanner import run_scan

    job_id = str(uuid.uuid4())
    data_path = Path(data_dir)

    try:
        result = asyncio.run(
            run_scan(
                job_id=job_id,
                url=url,
                data_dir=data_path,
                headless=headless,
                timeout=timeout,
            )
        )
    except Exception as exc:
        click.echo(f"error: {exc}", err=True)
        sys.exit(1)

    if show:
        from reconscan.display import DisplayOptions, render_result

        render_result(result, DisplayOptions())


@cli.command()
@click.argument("job_id")
@click.option(
    "--data-dir",
    default=str(DEFAULT_DATA_DIR),
    show_default=True,
    help="Directory where the SQLite database is stored.",
)
@click.option("--network", is_flag=True, default=False, help="Show network requests.")
@click.option(
    "--console", "console_logs", is_flag=True, default=False, help="Show console logs."
)
@click.option("--cookies", is_flag=True, default=False, help="Show cookies.")
@click.option("--tls", is_flag=True, default=False, help="Show TLS details.")
@click.option("--redirects", is_flag=True, default=False, help="Show redirect chain.")
@click.option(
    "--technologies", is_flag=True, default=False, help="Show detected technologies."
)
@click.option("--links", is_flag=True, default=False, help="Show links.")
@click.option("--dns", is_flag=True, default=False, help="Show DNS records.")
def results(
    job_id: str,
    data_dir: str,
    network: bool,
    console_logs: bool,
    cookies: bool,
    tls: bool,
    redirects: bool,
    technologies: bool,
    links: bool,
    dns: bool,
) -> None:
    """Display stored results for a scan job.

    With no flags, prints a summary. Pass section flags to show full tables.
    """
    from reconscan import db as database
    from reconscan.display import DisplayOptions, render_result

    data_path = Path(data_dir)
    db_path = data_path / "reconscan.db"

    if not db_path.exists():
        click.echo(f"error: database not found at {db_path}", err=True)
        sys.exit(1)

    conn = database.get_connection(db_path)
    result = database.get_scan_result(conn, job_id)
    conn.close()

    if result is None:
        click.echo(f"error: job {job_id!r} not found", err=True)
        sys.exit(1)

    opts = DisplayOptions(
        network=network,
        console_logs=console_logs,
        cookies=cookies,
        tls=tls,
        redirects=redirects,
        technologies=technologies,
        links=links,
        dns=dns,
    )
    render_result(result, opts)
