import EmptyState from "@/components/EmptyState";
import type { Snapshot } from "@/lib/types";

export default function DomTab({ snapshot }: { snapshot: Snapshot | null }) {
  if (!snapshot) {
    return <EmptyState message="No DOM snapshot available." />;
  }

  return (
    <div className="space-y-3">
      <div
        className="flex items-center gap-3 rounded border px-3 py-2 font-mono text-xs"
        style={{
          borderColor: "var(--border)",
          backgroundColor: "var(--bg-raised)",
        }}
      >
        <span
          className="flex-shrink-0 text-[10px] font-semibold uppercase tracking-wider"
          style={{ color: "var(--text-muted)" }}
        >
          final url
        </span>
        <span className="break-all" style={{ color: "var(--text-primary)" }}>
          {snapshot.final_url}
        </span>
      </div>
      <pre
        className="scrollbar-thin max-h-[520px] overflow-auto whitespace-pre-wrap break-all rounded border p-4 font-mono text-xs"
        style={{
          borderColor: "var(--border)",
          backgroundColor: "var(--bg-raised)",
          color: "var(--text-secondary)",
        }}
      >
        {snapshot.html}
      </pre>
    </div>
  );
}
