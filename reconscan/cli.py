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
def scan(url: str, data_dir: str, headless: bool, timeout: int) -> None:
    """Scan URL and store all collected data.

    Prints the job ID to stdout on completion.
    """
    from reconscan.scanner import run_scan

    job_id = str(uuid.uuid4())
    data_path = Path(data_dir)

    try:
        asyncio.run(
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

    click.echo(job_id)
