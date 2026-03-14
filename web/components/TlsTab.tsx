import EmptyState from "@/components/EmptyState";
import type { TlsInfo } from "@/lib/types";

interface ChainEntry {
  subject?: string;
  issuer?: string;
  not_before?: string;
  not_after?: string;
  serial?: string;
}

export default function TlsTab({ tls }: { tls: TlsInfo | null }) {
  if (!tls) {
    return (
      <EmptyState message="No TLS information available (non-HTTPS or connection failed)." />
    );
  }

  let chain: ChainEntry[] = [];
  try {
    chain = JSON.parse(tls.chain_json) as ChainEntry[];
  } catch {
    // ignore parse errors
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="panel-section-heading">Certificate</h3>
        <dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Subject" value={tls.subject} />
          <Field label="Issuer" value={tls.issuer} />
          <Field label="SAN" value={tls.san} />
          <Field label="Not Before" value={tls.not_before} />
          <Field label="Not After" value={tls.not_after} />
        </dl>
      </div>

      {chain.length > 1 && (
        <div>
          <h3 className="panel-section-heading">Chain ({chain.length} certificates)</h3>
          <ol className="space-y-2">
            {chain.map((cert, i) => (
              <li
                key={i}
                className="rounded border px-3 py-2 font-mono text-xs"
                style={{
                  borderColor: "var(--border)",
                  backgroundColor: "var(--bg-raised)",
                  color: "var(--text-secondary)",
                }}
              >
                <span style={{ color: "var(--text-muted)" }} className="mr-2">
                  [{i}]
                </span>
                <span style={{ color: "var(--text-primary)" }}>
                  {cert.subject ?? "?"}
                </span>
                <span style={{ color: "var(--text-muted)" }} className="ml-2">
                  via {cert.issuer ?? "?"}
                </span>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt
        className="text-[10px] font-semibold uppercase tracking-wider"
        style={{ color: "var(--text-muted)" }}
      >
        {label}
      </dt>
      <dd
        className="mt-0.5 break-all font-mono text-xs"
        style={{ color: "var(--text-primary)" }}
      >
        {value}
      </dd>
    </div>
  );
}
