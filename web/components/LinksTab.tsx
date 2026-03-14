import EmptyState from "@/components/EmptyState";
import type { Link } from "@/lib/types";

export default function LinksTab({ links }: { links: Link[] }) {
  if (links.length === 0) {
    return <EmptyState message="No links found." />;
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
      <h3 className="panel-section-heading">{title}</h3>
      <ul className="space-y-1">
        {links.map((l, i) => (
          <li
            key={i}
            className="break-all font-mono text-xs"
            style={{ color: "var(--text-secondary)" }}
          >
            {l.url}
          </li>
        ))}
      </ul>
    </div>
  );
}
