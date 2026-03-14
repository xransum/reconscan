import EmptyState from "@/components/EmptyState";
import type { NetworkRequest } from "@/lib/types";

function statusStyle(code: number): { color: string } {
  if (code < 300) return { color: "var(--green)" };
  if (code < 400) return { color: "var(--yellow)" };
  return { color: "var(--red)" };
}

export default function NetworkTab({ requests }: { requests: NetworkRequest[] }) {
  if (requests.length === 0) {
    return <EmptyState message="No network requests recorded." />;
  }

  return (
    <div className="overflow-x-auto">
      <table className="data-table">
        <thead>
          <tr>
            <th>Method</th>
            <th>Status</th>
            <th>MIME</th>
            <th className="text-right">Size</th>
            <th className="text-right">ms</th>
            <th>URL</th>
          </tr>
        </thead>
        <tbody>
          {requests.map((r, i) => (
            <tr key={i}>
              <td
                className="font-mono text-xs font-semibold"
                style={{ color: "var(--cyan)" }}
              >
                {r.method}
              </td>
              <td
                className="font-mono text-xs font-semibold"
                style={statusStyle(r.status_code)}
              >
                {r.status_code}
              </td>
              <td className="text-xs" style={{ color: "var(--text-secondary)" }}>
                {r.mime_type}
              </td>
              <td
                className="text-right font-mono text-xs tabular-nums"
                style={{ color: "var(--text-secondary)" }}
              >
                {r.size.toLocaleString()}
              </td>
              <td
                className="text-right font-mono text-xs tabular-nums"
                style={{ color: "var(--text-secondary)" }}
              >
                {r.timing_ms.toFixed(0)}
              </td>
              <td
                className="max-w-sm truncate font-mono text-xs"
                style={{ color: "var(--text-primary)" }}
                title={r.url}
              >
                {r.url}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
