"""Terminal rendering helpers using rich."""

from __future__ import annotations

import json
from dataclasses import dataclass

from rich.console import Console
from rich.panel import Panel
from rich.table import Table
from rich.text import Text

from reconscan.models import ScanResult

_console = Console()


@dataclass
class DisplayOptions:
    network: bool = False
    console_logs: bool = False
    cookies: bool = False
    tls: bool = False
    redirects: bool = False
    technologies: bool = False
    links: bool = False
    dns: bool = False

    def any_section(self) -> bool:
        return any(
            [
                self.network,
                self.console_logs,
                self.cookies,
                self.tls,
                self.redirects,
                self.technologies,
                self.links,
                self.dns,
            ]
        )


# ---------------------------------------------------------------------------
# Public entry point
# ---------------------------------------------------------------------------


def render_result(result: ScanResult, opts: DisplayOptions) -> None:
    """Render *result* to the terminal according to *opts*.

    With no flags set, prints a summary view (job info + counts + highlights).
    With flags set, prints only the requested full-table sections.
    """
    if opts.any_section():
        _render_sections(result, opts)
    else:
        _render_summary(result)


# ---------------------------------------------------------------------------
# Summary view
# ---------------------------------------------------------------------------


def _render_summary(result: ScanResult) -> None:
    job = result.job

    # Job info panel
    status_color = {
        "complete": "green",
        "running": "yellow",
        "pending": "yellow",
        "failed": "red",
    }.get(job.status, "white")

    info_lines = [
        f"[dim]Job ID  :[/dim]  [cyan]{job.id}[/cyan]",
        f"[dim]URL     :[/dim]  {job.url}",
        f"[dim]Status  :[/dim]  [{status_color}]{job.status}[/{status_color}]",
        f"[dim]Started :[/dim]  {job.created_at}",
    ]
    if job.completed_at:
        info_lines.append(f"[dim]Finished:[/dim]  {job.completed_at}")

    _console.print(
        Panel("\n".join(info_lines), title="[bold]Scan job[/bold]", expand=False)
    )

    # Counts table
    counts_table = Table(
        show_header=True, header_style="bold dim", box=None, padding=(0, 2)
    )
    counts_table.add_column("Section", style="dim")
    counts_table.add_column("Count", justify="right")
    counts_table.add_row("Network requests", str(len(result.network_requests)))
    counts_table.add_row("Console logs", str(len(result.console_logs)))
    counts_table.add_row("Cookies", str(len(result.cookies)))
    counts_table.add_row("Redirects", str(len(result.redirects)))
    counts_table.add_row("Links", str(len(result.links)))
    counts_table.add_row("DNS records", str(len(result.dns_records)))
    counts_table.add_row("Technologies", str(len(result.technologies)))
    _console.print(Panel(counts_table, title="[bold]Counts[/bold]", expand=False))

    # TLS highlight
    if result.tls_info:
        tls = result.tls_info
        tls_lines = [
            f"[dim]Issuer :[/dim]  {tls.issuer}",
            f"[dim]Subject:[/dim]  {tls.subject}",
            f"[dim]Expires:[/dim]  {tls.not_after}",
        ]
        sans = [s.strip() for s in tls.san.split(",") if s.strip()]
        if sans:
            tls_lines.append(
                f"[dim]SANs   :[/dim]  {', '.join(sans[:5])}"
                + (" ..." if len(sans) > 5 else "")
            )
        _console.print(
            Panel("\n".join(tls_lines), title="[bold]TLS[/bold]", expand=False)
        )

    # Redirect chain
    if result.redirects:
        redir_table = Table(
            show_header=True, header_style="bold dim", box=None, padding=(0, 2)
        )
        redir_table.add_column("#", style="dim", justify="right")
        redir_table.add_column("Code", justify="center")
        redir_table.add_column("From")
        redir_table.add_column("To")
        for r in result.redirects:
            code_color = "green" if r.status_code < 400 else "red"
            redir_table.add_row(
                str(r.step),
                f"[{code_color}]{r.status_code}[/{code_color}]",
                r.from_url,
                r.to_url,
            )
        _console.print(Panel(redir_table, title="[bold]Redirects[/bold]", expand=False))

    # Technologies highlight
    if result.technologies:
        tech_names = [
            f"{t.name} {t.version}".strip() if t.version else t.name
            for t in result.technologies
        ]
        _console.print(
            Panel(
                Text(", ".join(tech_names), style="cyan"),
                title="[bold]Technologies[/bold]",
                expand=False,
            )
        )


# ---------------------------------------------------------------------------
# Section views
# ---------------------------------------------------------------------------


def _render_sections(result: ScanResult, opts: DisplayOptions) -> None:
    if opts.network:
        _render_network(result)
    if opts.console_logs:
        _render_console(result)
    if opts.cookies:
        _render_cookies(result)
    if opts.tls:
        _render_tls(result)
    if opts.redirects:
        _render_redirects(result)
    if opts.technologies:
        _render_technologies(result)
    if opts.links:
        _render_links(result)
    if opts.dns:
        _render_dns(result)


def _render_network(result: ScanResult) -> None:
    t = Table(show_header=True, header_style="bold dim", box=None, padding=(0, 2))
    t.add_column("Method", style="cyan", no_wrap=True)
    t.add_column("Status", justify="center")
    t.add_column("Mime type")
    t.add_column("Size", justify="right")
    t.add_column("Time (ms)", justify="right")
    t.add_column("URL")
    for r in result.network_requests:
        code_color = "green" if r.status_code < 400 else "red"
        t.add_row(
            r.method,
            f"[{code_color}]{r.status_code}[/{code_color}]",
            r.mime_type,
            str(r.size),
            f"{r.timing_ms:.1f}",
            r.url,
        )
    _console.print(
        Panel(
            t, title=f"[bold]Network requests ({len(result.network_requests)})[/bold]"
        )
    )


def _render_console(result: ScanResult) -> None:
    t = Table(show_header=True, header_style="bold dim", box=None, padding=(0, 2))
    t.add_column("Level", no_wrap=True)
    t.add_column("Message")
    t.add_column("Source")
    t.add_column("Line", justify="right")
    level_colors = {
        "error": "red",
        "warning": "yellow",
        "info": "cyan",
        "log": "white",
        "debug": "dim",
    }
    for lg in result.console_logs:
        color = level_colors.get(lg.level, "white")
        t.add_row(
            f"[{color}]{lg.level}[/{color}]",
            lg.text,
            lg.source_url,
            str(lg.line_no),
        )
    _console.print(
        Panel(t, title=f"[bold]Console logs ({len(result.console_logs)})[/bold]")
    )


def _render_cookies(result: ScanResult) -> None:
    t = Table(show_header=True, header_style="bold dim", box=None, padding=(0, 2))
    t.add_column("Name")
    t.add_column("Domain")
    t.add_column("Secure", justify="center")
    t.add_column("HttpOnly", justify="center")
    t.add_column("SameSite")
    t.add_column("Value")
    for c in result.cookies:
        t.add_row(
            c.name,
            c.domain,
            "[green]Y[/green]" if c.secure else "[dim]N[/dim]",
            "[green]Y[/green]" if c.http_only else "[dim]N[/dim]",
            c.same_site,
            c.value[:60] + ("..." if len(c.value) > 60 else ""),
        )
    _console.print(Panel(t, title=f"[bold]Cookies ({len(result.cookies)})[/bold]"))


def _render_tls(result: ScanResult) -> None:
    if result.tls_info is None:
        _console.print(
            Panel("[dim]No TLS data.[/dim]", title="[bold]TLS[/bold]", expand=False)
        )
        return
    tls = result.tls_info
    lines = [
        f"[dim]Issuer    :[/dim]  {tls.issuer}",
        f"[dim]Subject   :[/dim]  {tls.subject}",
        f"[dim]Not before:[/dim]  {tls.not_before}",
        f"[dim]Not after :[/dim]  {tls.not_after}",
        f"[dim]SANs      :[/dim]  {tls.san}",
    ]
    try:
        chain = json.loads(tls.chain_json)
        lines.append(f"[dim]Chain len :[/dim]  {len(chain)}")
    except Exception:
        pass
    _console.print(Panel("\n".join(lines), title="[bold]TLS[/bold]", expand=False))


def _render_redirects(result: ScanResult) -> None:
    t = Table(show_header=True, header_style="bold dim", box=None, padding=(0, 2))
    t.add_column("#", style="dim", justify="right")
    t.add_column("Code", justify="center")
    t.add_column("From")
    t.add_column("To")
    for r in result.redirects:
        code_color = "green" if r.status_code < 400 else "red"
        t.add_row(
            str(r.step),
            f"[{code_color}]{r.status_code}[/{code_color}]",
            r.from_url,
            r.to_url,
        )
    _console.print(Panel(t, title=f"[bold]Redirects ({len(result.redirects)})[/bold]"))


def _render_technologies(result: ScanResult) -> None:
    t = Table(show_header=True, header_style="bold dim", box=None, padding=(0, 2))
    t.add_column("Name")
    t.add_column("Version")
    t.add_column("Category")
    for tech in result.technologies:
        t.add_row(tech.name, tech.version or "-", tech.category)
    _console.print(
        Panel(t, title=f"[bold]Technologies ({len(result.technologies)})[/bold]")
    )


def _render_links(result: ScanResult) -> None:
    t = Table(show_header=True, header_style="bold dim", box=None, padding=(0, 2))
    t.add_column("Type", no_wrap=True)
    t.add_column("URL")
    type_colors = {"internal": "green", "external": "cyan"}
    for lk in result.links:
        color = type_colors.get(lk.type, "white")
        t.add_row(f"[{color}]{lk.type}[/{color}]", lk.url)
    _console.print(Panel(t, title=f"[bold]Links ({len(result.links)})[/bold]"))


def _render_dns(result: ScanResult) -> None:
    t = Table(show_header=True, header_style="bold dim", box=None, padding=(0, 2))
    t.add_column("Type", no_wrap=True, style="cyan")
    t.add_column("Value")
    t.add_column("TTL", justify="right")
    for r in result.dns_records:
        t.add_row(r.record_type, r.value, str(r.ttl))
    _console.print(
        Panel(t, title=f"[bold]DNS records ({len(result.dns_records)})[/bold]")
    )
