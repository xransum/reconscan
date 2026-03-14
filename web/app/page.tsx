"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Home() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleScan(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        setError(body.error ?? `Request failed with status ${res.status}`);
        return;
      }
      const data = (await res.json()) as { id: string };
      router.push(`/jobs/${data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-center py-20">
      {/* Hero */}
      <div className="mb-10 text-center">
        <div
          className="mb-4 inline-flex items-center gap-2 rounded border px-3 py-1 font-mono text-xs"
          style={{
            borderColor: "var(--border-bright)",
            color: "var(--text-muted)",
            background: "var(--bg-raised)",
          }}
        >
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{ background: "var(--green)" }}
          />
          URL investigation tool
        </div>
        <h1
          className="mb-3 text-4xl font-bold tracking-tight"
          style={{ color: "var(--text-primary)" }}
        >
          reconscan
        </h1>
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          Run a headless browser scan and inspect every request, cookie, redirect,
          certificate, and technology detected.
        </p>
      </div>

      {/* New scan card */}
      <div
        className="w-full max-w-xl rounded-lg border p-6"
        style={{
          background: "var(--bg-surface)",
          borderColor: "var(--border)",
        }}
      >
        <p
          className="mb-4 text-xs font-semibold uppercase tracking-widest"
          style={{ color: "var(--text-muted)" }}
        >
          New scan
        </p>
        <form onSubmit={handleScan} className="flex gap-2">
          <div className="relative flex-1">
            <span
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 font-mono text-xs"
              style={{ color: "var(--text-muted)" }}
            >
              $
            </span>
            <input
              type="url"
              name="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              required
              autoComplete="off"
              spellCheck={false}
              className="w-full rounded border py-2.5 pl-7 pr-3 font-mono text-sm outline-none transition-colors focus:ring-1"
              style={
                {
                  background: "var(--bg-raised)",
                  borderColor: "var(--border-bright)",
                  color: "var(--text-primary)",
                  "--tw-ring-color": "var(--accent)",
                } as React.CSSProperties
              }
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="rounded px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 disabled:opacity-50"
            style={{
              background: "var(--accent)",
              ["--tw-ring-color" as string]: "var(--accent)",
            }}
          >
            {loading ? "Scanning..." : "Scan"}
          </button>
        </form>
        {error && (
          <p className="mt-3 text-xs" style={{ color: "var(--red)" }}>
            {error}
          </p>
        )}
      </div>

      {/* Load existing results card */}
      <div
        className="mt-4 w-full max-w-xl rounded-lg border p-6"
        style={{
          background: "var(--bg-surface)",
          borderColor: "var(--border)",
        }}
      >
        <p
          className="mb-4 text-xs font-semibold uppercase tracking-widest"
          style={{ color: "var(--text-muted)" }}
        >
          Load scan results
        </p>
        <form action="/jobs" method="get" className="flex gap-2">
          <div className="relative flex-1">
            <span
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 font-mono text-xs"
              style={{ color: "var(--text-muted)" }}
            >
              $
            </span>
            <input
              type="text"
              name="id"
              placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
              required
              pattern="[0-9a-fA-F\-]{36}"
              title="Must be a 36-character UUID"
              autoComplete="off"
              spellCheck={false}
              className="w-full rounded border py-2.5 pl-7 pr-3 font-mono text-sm outline-none transition-colors focus:ring-1"
              style={
                {
                  background: "var(--bg-raised)",
                  borderColor: "var(--border-bright)",
                  color: "var(--text-primary)",
                  "--tw-ring-color": "var(--accent)",
                } as React.CSSProperties
              }
            />
          </div>
          <button
            type="submit"
            className="rounded px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 focus:outline-none focus:ring-2"
            style={{
              background: "var(--accent)",
              ["--tw-ring-color" as string]: "var(--accent)",
            }}
          >
            View
          </button>
        </form>
      </div>

      {/* View all jobs link */}
      <div className="mt-6 text-center">
        <Link
          href="/jobs"
          className="text-xs transition-colors hover:underline"
          style={{ color: "var(--accent)" }}
        >
          View all scans
        </Link>
      </div>
    </div>
  );
}
