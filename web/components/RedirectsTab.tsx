import type { Redirect } from "@/lib/types";

export default function RedirectsTab({ redirects }: { redirects: Redirect[] }) {
  if (redirects.length === 0) {
    return <p className="text-sm text-gray-500">No redirects recorded.</p>;
  }
  return (
    <ol className="space-y-2">
      {redirects.map((r, i) => (
        <li key={i} className="flex items-start gap-3 text-sm">
          <span className="mt-0.5 flex-shrink-0 rounded bg-gray-800 px-2 py-0.5 font-mono text-xs text-gray-400">
            {r.status_code}
          </span>
          <span className="break-all font-mono text-xs text-gray-300">
            {r.from_url}
          </span>
          <span className="flex-shrink-0 text-gray-600">-&gt;</span>
          <span className="break-all font-mono text-xs text-gray-300">{r.to_url}</span>
        </li>
      ))}
    </ol>
  );
}
