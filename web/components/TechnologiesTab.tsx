import type { Technology } from "@/lib/types";

export default function TechnologiesTab({
  technologies,
}: {
  technologies: Technology[];
}) {
  if (technologies.length === 0) {
    return <p className="text-sm text-gray-500">No technologies detected.</p>;
  }

  const byCategory = technologies.reduce<Record<string, Technology[]>>((acc, t) => {
    const cat = t.category || "Unknown";
    if (!acc[cat]) acc[cat] = [];
    acc[cat]!.push(t);
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      {Object.entries(byCategory).map(([category, techs]) => (
        <div key={category}>
          <h3 className="mb-1.5 text-xs font-semibold uppercase text-gray-500">
            {category}
          </h3>
          <div className="flex flex-wrap gap-2">
            {techs.map((t, i) => (
              <span
                key={i}
                className="rounded border border-gray-700 px-2.5 py-1 text-sm text-gray-200"
              >
                {t.name}
                {t.version && (
                  <span className="ml-1 text-xs text-gray-500">{t.version}</span>
                )}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
