import EmptyState from "@/components/EmptyState";
import type { Technology } from "@/lib/types";

export default function TechnologiesTab({
  technologies,
}: {
  technologies: Technology[];
}) {
  if (technologies.length === 0) {
    return <EmptyState message="No technologies detected." />;
  }

  const byCategory = technologies.reduce<Record<string, Technology[]>>((acc, t) => {
    const cat = t.category || "Unknown";
    if (!acc[cat]) acc[cat] = [];
    acc[cat]!.push(t);
    return acc;
  }, {});

  return (
    <div className="space-y-5">
      {Object.entries(byCategory).map(([category, techs]) => (
        <section key={category}>
          <h2 className="panel-section-heading">{category}</h2>
          <div className="flex flex-wrap gap-2">
            {techs.map((t, i) => (
              <span
                key={i}
                className="flex items-center gap-1.5 rounded border px-2.5 py-1.5 text-xs"
                style={{
                  borderColor: "var(--border-bright)",
                  background: "var(--bg-raised)",
                  color: "var(--text-primary)",
                }}
              >
                {t.name}
                {t.version && (
                  <span className="font-mono" style={{ color: "var(--text-muted)" }}>
                    {t.version}
                  </span>
                )}
              </span>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
