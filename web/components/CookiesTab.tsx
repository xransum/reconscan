import EmptyState from "@/components/EmptyState";
import type { Cookie } from "@/lib/types";

function BoolBadge({ value }: { value: boolean }) {
  return value ? (
    <span
      className="rounded px-1.5 py-0.5 text-[10px] font-semibold"
      style={{ background: "#052e16", color: "#4ade80" }}
    >
      yes
    </span>
  ) : (
    <span
      className="rounded px-1.5 py-0.5 text-[10px] font-semibold"
      style={{ background: "var(--bg-raised)", color: "var(--text-muted)" }}
    >
      no
    </span>
  );
}

export default function CookiesTab({ cookies }: { cookies: Cookie[] }) {
  if (cookies.length === 0) {
    return <EmptyState message="No cookies recorded." />;
  }

  return (
    <div className="overflow-x-auto">
      <table className="data-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Domain</th>
            <th>Path</th>
            <th>SameSite</th>
            <th>Secure</th>
            <th>HttpOnly</th>
            <th>Value</th>
          </tr>
        </thead>
        <tbody>
          {cookies.map((c, i) => (
            <tr key={i}>
              <td
                className="font-mono text-xs font-medium"
                style={{ color: "var(--text-primary)" }}
              >
                {c.name}
              </td>
              <td className="text-xs" style={{ color: "var(--text-secondary)" }}>
                {c.domain}
              </td>
              <td
                className="font-mono text-xs"
                style={{ color: "var(--text-secondary)" }}
              >
                {c.path}
              </td>
              <td className="text-xs" style={{ color: "var(--text-secondary)" }}>
                {c.same_site}
              </td>
              <td>
                <BoolBadge value={c.secure} />
              </td>
              <td>
                <BoolBadge value={c.http_only} />
              </td>
              <td
                className="max-w-xs truncate font-mono text-xs"
                style={{ color: "var(--text-muted)" }}
                title={c.value}
              >
                {c.value}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
