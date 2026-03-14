import type { DnsRecord } from "@/lib/types";

export default function DnsTab({ records }: { records: DnsRecord[] }) {
  if (records.length === 0) {
    return <p className="text-sm text-gray-500">No DNS records found.</p>;
  }

  const byType = records.reduce<Record<string, DnsRecord[]>>((acc, r) => {
    if (!acc[r.record_type]) acc[r.record_type] = [];
    acc[r.record_type]!.push(r);
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      {Object.entries(byType).map(([type, recs]) => (
        <div key={type}>
          <h3 className="mb-1.5 text-xs font-semibold uppercase text-gray-500">{type}</h3>
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-800 text-xs text-gray-600">
                <th className="py-1.5 pr-6">Value</th>
                <th className="py-1.5">TTL</th>
              </tr>
            </thead>
            <tbody>
              {recs.map((r, i) => (
                <tr key={i} className="border-b border-gray-800/50">
                  <td className="py-1.5 pr-6 font-mono text-xs text-gray-300">{r.value}</td>
                  <td className="py-1.5 font-mono text-xs text-gray-500">{r.ttl}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}
