import Link from "next/link";
import { redirect } from "next/navigation";

import { getJobs } from "@/lib/db";
import type { Job } from "@/lib/types";

export const dynamic = "force-dynamic";

// Handle legacy ?id= redirect
async function maybeRedirect(
  searchParams: Promise<Record<string, string | string[] | undefined>>
) {
  const params = await searchParams;
  const id = params["id"];
  if (typeof id === "string" && id.trim()) {
    redirect(`/jobs/${id.trim()}`);
  }
}

const STATUS_STYLES: Record<string, { label: string; color: string; bg: string }> = {
  complete: { label: "complete", color: "var(--green)", bg: "rgba(34,197,94,0.10)" },
  running: { label: "running", color: "var(--yellow)", bg: "rgba(234,179,8,0.10)" },
  pending: { label: "pending", color: "var(--yellow)", bg: "rgba(234,179,8,0.10)" },
  failed: { label: "failed", color: "var(--red)", bg: "rgba(239,68,68,0.10)" },
};

function StatusBadge({ status }: { status: string }) {
  const style = STATUS_STYLES[status] ?? {
    label: status,
    color: "var(--text-muted)",
    bg: "var(--bg-subtle)",
  };
  return (
    <span
      className="rounded px-2 py-0.5 font-mono text-xs font-semibold"
      style={{ color: style.color, background: style.bg }}
    >
      {style.label}
    </span>
  );
}

function JobsTable({ jobs }: { jobs: Job[] }) {
  if (jobs.length === 0) {
    return (
      <div
        className="rounded-lg border px-6 py-16 text-center"
        style={{ borderColor: "var(--border)", background: "var(--bg-surface)" }}
      >
        <p
          className="mb-1 font-mono text-sm font-semibold"
          style={{ color: "var(--text-secondary)" }}
        >
          No scans yet
        </p>
        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
          Submit a URL above or run{" "}
          <code
            className="rounded px-1 py-0.5 font-mono"
            style={{ background: "var(--bg-raised)", color: "var(--accent)" }}
          >
            reconscan scan &lt;url&gt;
          </code>{" "}
          in your terminal.
        </p>
      </div>
    );
  }

  return (
    <div
      className="overflow-hidden rounded-lg border"
      style={{ borderColor: "var(--border)", background: "var(--bg-surface)" }}
    >
      <table className="data-table w-full">
        <thead>
          <tr>
            <th>URL</th>
            <th>Status</th>
            <th>Started</th>
            <th>Completed</th>
            <th>Job ID</th>
          </tr>
        </thead>
        <tbody>
          {jobs.map((job) => (
            <tr
              key={job.id}
              className="cursor-pointer transition-colors hover:bg-[var(--bg-raised)]"
            >
              <td className="max-w-xs truncate">
                <Link
                  href={`/jobs/${job.id}`}
                  className="block w-full font-mono text-xs"
                  style={{ color: "var(--accent)" }}
                >
                  {job.url}
                </Link>
              </td>
              <td>
                <StatusBadge status={job.status} />
              </td>
              <td className="font-mono text-xs" style={{ color: "var(--text-muted)" }}>
                {job.created_at.slice(0, 19).replace("T", " ")}
              </td>
              <td className="font-mono text-xs" style={{ color: "var(--text-muted)" }}>
                {job.completed_at
                  ? job.completed_at.slice(0, 19).replace("T", " ")
                  : "--"}
              </td>
              <td>
                <Link
                  href={`/jobs/${job.id}`}
                  className="font-mono text-xs"
                  style={{ color: "var(--text-muted)" }}
                >
                  {job.id}
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await maybeRedirect(searchParams);

  const jobs = getJobs();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1
            className="text-lg font-semibold"
            style={{ color: "var(--text-primary)" }}
          >
            Scans
          </h1>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            {jobs.length} job{jobs.length !== 1 ? "s" : ""} total
          </p>
        </div>
        <Link
          href="/"
          className="rounded border px-3 py-1.5 text-xs font-semibold transition-colors"
          style={{
            borderColor: "var(--border-bright)",
            color: "var(--text-secondary)",
            background: "var(--bg-raised)",
          }}
        >
          + New scan
        </Link>
      </div>

      <JobsTable jobs={jobs} />
    </div>
  );
}
