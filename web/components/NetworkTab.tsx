import type { NetworkRequest } from "@/lib/types";

function statusClass(code: number): string {
  if (code < 300) return "text-green-400";
  if (code < 400) return "text-yellow-400";
  return "text-red-400";
}

export default function NetworkTab({
  requests,
}: {
  requests: NetworkRequest[];
}) {
  if (requests.length === 0) {
    return <p className="text-sm text-gray-500">No network requests recorded.</p>;
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-gray-800 text-xs uppercase text-gray-500">
            <th className="py-2 pr-4">Method</th>
            <th className="py-2 pr-4">Status</th>
            <th className="py-2 pr-4">MIME</th>
            <th className="py-2 pr-4">Size</th>
            <th className="py-2 pr-4">Time (ms)</th>
            <th className="py-2">URL</th>
          </tr>
        </thead>
        <tbody>
          {requests.map((r, i) => (
            <tr key={i} className="border-b border-gray-800/50 hover:bg-gray-800/30">
              <td className="py-1.5 pr-4 font-mono text-gray-300">{r.method}</td>
              <td className={`py-1.5 pr-4 font-mono ${statusClass(r.status_code)}`}>
                {r.status_code}
              </td>
              <td className="py-1.5 pr-4 text-gray-400">{r.mime_type}</td>
              <td className="py-1.5 pr-4 text-gray-400">{r.size.toLocaleString()}</td>
              <td className="py-1.5 pr-4 text-gray-400">{r.timing_ms.toFixed(1)}</td>
              <td className="max-w-md truncate py-1.5 font-mono text-xs text-gray-300">
                {r.url}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
