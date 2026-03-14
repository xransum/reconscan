import type { Job } from "@/lib/types";

const STATUS_STYLES: Record<string, { bg: string; text: string; dot: string }> = {
  complete: { bg: "#052e16", text: "#4ade80", dot: "#22c55e" },
  running: { bg: "#1c1700", text: "#fbbf24", dot: "#eab308" },
  failed: { bg: "#1c0a0a", text: "#f87171", dot: "#ef4444" },
  pending: { bg: "#18181b", text: "#9494a8", dot: "#52525e" },
};

export default function JobHeader({ job }: { job: Job }) {
  const style = STATUS_STYLES[job.status] ?? STATUS_STYLES["pending"]!;

  return (
    <div
      className="mb-6 rounded-lg border p-5"
      style={{ background: "var(--bg-surface)", borderColor: "var(--border)" }}
    >
      {/* Top row: status badge + URL */}
      <div className="flex flex-wrap items-start gap-3">
        <span
          className="mt-0.5 flex shrink-0 items-center gap-1.5 rounded border px-2.5 py-1 text-xs font-semibold uppercase tracking-wider"
          style={{
            background: style.bg,
            color: style.text,
            borderColor: style.dot + "44",
          }}
        >
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{ background: style.dot }}
          />
          {job.status}
        </span>
        <h1
          className="min-w-0 flex-1 break-all font-mono text-base font-semibold leading-snug"
          style={{ color: "var(--text-primary)" }}
        >
          {job.url}
        </h1>
      </div>

      {/* Metadata row */}
      <div
        className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1 font-mono text-xs"
        style={{ color: "var(--text-muted)" }}
      >
        <span>
          <span style={{ color: "var(--text-secondary)" }}>id </span>
          {job.id}
        </span>
        <span>
          <span style={{ color: "var(--text-secondary)" }}>started </span>
          {job.created_at}
        </span>
        {job.completed_at && (
          <span>
            <span style={{ color: "var(--text-secondary)" }}>completed </span>
            {job.completed_at}
          </span>
        )}
      </div>
    </div>
  );
}
