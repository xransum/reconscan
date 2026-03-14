# reconscan

A URL investigation tool that scans a target URL using a headless browser and
presents the collected data through a local web interface. Inspired by URLscan.io.

## What it collects

For every scanned URL, reconscan captures:

- Full-page screenshot (JPEG)
- Final rendered DOM / HTML snapshot
- Network requests (HAR)
- Browser console logs
- Cookies
- TLS / certificate info
- Redirect chain
- Technologies detected (Wappalyzer-style)
- Extracted links (internal and external)
- DNS records (A, AAAA, MX, NS)

All results are stored in a local SQLite database and viewable through a Next.js
web UI.

## Requirements

- Python 3.12+
- Node.js 18+
- [uv](https://github.com/astral-sh/uv)

## Bootstrap

```bash
# Python dependencies
uv sync
uv run playwright install chromium

# Node dependencies
npm install
```

## Usage

### Run a scan

```bash
uv run reconscan scan https://example.com
```

Prints a job ID on completion:

```
3f2a1b9c-e4d5-6789-abcd-ef0123456789
```

### View results

```bash
npm run dev
```

Open `http://localhost:3000/jobs/<job-id>` in your browser.

## Development

```bash
# Python linting
uv run ruff check reconscan

# Python formatting
uv run ruff format reconscan

# Python type checking
uv run mypy reconscan

# Python tests
uv run pytest tests/

# Node linting
npm run lint

# Node formatting
npm run format

# Node tests
npm run test
```

## Project structure

```
reconscan/
  pyproject.toml        # uv workspace root + dev deps + tool config
  uv.lock
  .python-version
  package.json          # npm workspace root
  reconscan/            # Python package
    cli.py              # Click entry point
    scanner.py          # Scan orchestrator
    db.py               # SQLite schema and helpers
    models.py           # Dataclasses for all result types
    modules/            # One module per data collection type
  tests/                # Python tests
  web/                  # Next.js web UI
    app/                # App Router pages and API routes
    lib/                # SQLite read layer and TypeScript types
    components/         # Result viewer components
  data/                 # Runtime data (gitignored)
    reconscan.db
    screenshots/
```

## License

MIT
