import EmptyState from "@/components/EmptyState";
import type { ConsoleLog } from "@/lib/types";

const LEVEL_STYLE: Record<string, { border: string; label: string; bg: string }> = {
  error: { bg: "#1c0a0a", border: "#7f1d1d", label: "#f87171" },
  warning: { bg: "#1c1700", border: "#713f12", label: "#fbbf24" },
  info: { bg: "#0a1628", border: "#1e3a5f", label: "#60a5fa" },
  log: { bg: "var(--bg-raised)", border: "var(--border)", label: "#9494a8" },
};

export default function ConsoleTab({ logs }: { logs: ConsoleLog[] }) {
  if (logs.length === 0) {
    return <EmptyState message="No console output recorded." />;
  }

  return (
    <div className="space-y-1 font-mono text-xs">
      {logs.map((log, i) => {
        const s = LEVEL_STYLE[log.level] ?? LEVEL_STYLE["log"]!;
        return (
          <div
            key={i}
            className="flex gap-3 rounded border px-3 py-2"
            style={{ background: s.bg, borderColor: s.border }}
          >
            <span className="shrink-0 font-bold uppercase" style={{ color: s.label }}>
              {log.level}
            </span>
            <span className="flex-1 break-all" style={{ color: "var(--text-primary)" }}>
              {log.text}
            </span>
            {log.source_url && (
              <span
                className="shrink-0 break-all text-right"
                style={{ color: "var(--text-muted)" }}
              >
                {log.source_url}
                {log.line_no != null ? `:${log.line_no}` : ""}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
