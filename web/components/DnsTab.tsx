import EmptyState from "@/components/EmptyState";
import type { DnsRecord } from "@/lib/types";

export default function DnsTab({ records }: { records: DnsRecord[] }) {
  if (records.length === 0) {
    return <EmptyState message="No DNS records found." />;
  }

  const byType = records.reduce<Record<string, DnsRecord[]>>((acc, r) => {
    if (!acc[r.record_type]) acc[r.record_type] = [];
    acc[r.record_type]!.push(r);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {Object.entries(byType).map(([type, recs]) => (
        <div key={type}>
          <h3 className="panel-section-heading">{type}</h3>
          <table className="data-table">
            <thead>
              <tr>
                <th>Value</th>
                <th className="text-right">TTL</th>
              </tr>
            </thead>
            <tbody>
              {recs.map((r, i) => (
                <tr key={i}>
                  <td className="font-mono text-xs" style={{ color: "var(--cyan)" }}>
                    {r.value}
                  </td>
                  <td
                    className="text-right font-mono text-xs tabular-nums"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {r.ttl}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}
