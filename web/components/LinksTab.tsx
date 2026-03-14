import type { Link } from "@/lib/types";

export default function LinksTab({ links }: { links: Link[] }) {
  if (links.length === 0) {
    return <p className="text-sm text-gray-500">No links found.</p>;
  }

  const internal = links.filter((l) => l.type === "internal");
  const external = links.filter((l) => l.type === "external");

  return (
    <div className="space-y-6">
      <Section title={`Internal (${internal.length})`} links={internal} />
      <Section title={`External (${external.length})`} links={external} />
    </div>
  );
}

function Section({ title, links }: { title: string; links: Link[] }) {
  if (links.length === 0) return null;
  return (
    <div>
      <h3 className="mb-2 text-xs font-semibold uppercase text-gray-500">{title}</h3>
      <ul className="space-y-1">
        {links.map((l, i) => (
          <li key={i} className="break-all font-mono text-xs text-gray-300">
            {l.url}
          </li>
        ))}
      </ul>
    </div>
  );
}
