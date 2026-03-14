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
      <p className="text-sm text-gray-500">
        No TLS information available (non-HTTPS or connection failed).
      </p>
    );
  }

  let chain: ChainEntry[] = [];
  try {
    chain = JSON.parse(tls.chain_json) as ChainEntry[];
  } catch {
    // ignore parse errors
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
        <Field label="Subject" value={tls.subject} />
        <Field label="Issuer" value={tls.issuer} />
        <Field label="SAN" value={tls.san} />
        <Field label="Not Before" value={tls.not_before} />
        <Field label="Not After" value={tls.not_after} />
      </div>

      {chain.length > 1 && (
        <div>
          <h3 className="mb-2 text-xs font-semibold uppercase text-gray-500">
            Certificate Chain
          </h3>
          <ol className="space-y-2">
            {chain.map((cert, i) => (
              <li
                key={i}
                className="rounded border border-gray-800 px-3 py-2 font-mono text-xs text-gray-400"
              >
                <span className="mr-2 text-gray-600">[{i}]</span>
                {cert.subject ?? "?"}
                <span className="ml-2 text-gray-600">issued by {cert.issuer ?? "?"}</span>
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
      <dt className="text-xs font-medium uppercase text-gray-500">{label}</dt>
      <dd className="mt-0.5 break-all font-mono text-xs text-gray-300">{value}</dd>
    </div>
  );
}
