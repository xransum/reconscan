import EmptyState from "@/components/EmptyState";
import type { Redirect } from "@/lib/types";

function codeStyle(code: number): React.CSSProperties {
  if (code < 300) return { color: "var(--green)" };
  if (code < 400) return { color: "var(--yellow)" };
  return { color: "var(--red)" };
}

export default function RedirectsTab({ redirects }: { redirects: Redirect[] }) {
  if (redirects.length === 0) {
    return <EmptyState message="No redirects recorded." />;
  }

  return (
    <ol className="space-y-2">
      {redirects.map((r, i) => (
        <li
          key={i}
          className="flex flex-wrap items-start gap-x-3 gap-y-1 rounded border px-3 py-2 font-mono text-xs"
          style={{
            borderColor: "var(--border)",
            backgroundColor: "var(--bg-raised)",
          }}
        >
          <span
            className="flex-shrink-0 rounded px-1.5 py-0.5 font-semibold tabular-nums"
            style={{
              ...codeStyle(r.status_code),
              backgroundColor: "var(--bg-subtle)",
            }}
          >
            {r.status_code}
          </span>
          <span className="break-all" style={{ color: "var(--text-secondary)" }}>
            {r.from_url}
          </span>
          <span className="flex-shrink-0" style={{ color: "var(--text-muted)" }}>
            -&gt;
          </span>
          <span className="break-all" style={{ color: "var(--text-primary)" }}>
            {r.to_url}
          </span>
        </li>
      ))}
    </ol>
  );
}
