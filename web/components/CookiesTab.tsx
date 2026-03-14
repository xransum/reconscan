import type { Cookie } from "@/lib/types";

export default function CookiesTab({ cookies }: { cookies: Cookie[] }) {
  if (cookies.length === 0) {
    return <p className="text-sm text-gray-500">No cookies recorded.</p>;
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-gray-800 text-xs uppercase text-gray-500">
            <th className="py-2 pr-4">Name</th>
            <th className="py-2 pr-4">Domain</th>
            <th className="py-2 pr-4">Path</th>
            <th className="py-2 pr-4">SameSite</th>
            <th className="py-2 pr-4">Secure</th>
            <th className="py-2 pr-4">HttpOnly</th>
            <th className="py-2">Value</th>
          </tr>
        </thead>
        <tbody>
          {cookies.map((c, i) => (
            <tr key={i} className="border-b border-gray-800/50 hover:bg-gray-800/30">
              <td className="py-1.5 pr-4 font-mono text-gray-200">{c.name}</td>
              <td className="py-1.5 pr-4 text-gray-400">{c.domain}</td>
              <td className="py-1.5 pr-4 text-gray-400">{c.path}</td>
              <td className="py-1.5 pr-4 text-gray-400">{c.same_site}</td>
              <td className="py-1.5 pr-4">
                {c.secure ? (
                  <span className="text-green-400">yes</span>
                ) : (
                  <span className="text-gray-600">no</span>
                )}
              </td>
              <td className="py-1.5 pr-4">
                {c.http_only ? (
                  <span className="text-green-400">yes</span>
                ) : (
                  <span className="text-gray-600">no</span>
                )}
              </td>
              <td className="max-w-xs truncate py-1.5 font-mono text-xs text-gray-500">
                {c.value}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
