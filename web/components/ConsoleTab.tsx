import type { ConsoleLog } from "@/lib/types";

const LEVEL_COLORS: Record<string, string> = {
  error: "text-red-400 bg-red-950",
  warning: "text-yellow-400 bg-yellow-950",
  info: "text-blue-400 bg-blue-950",
  log: "text-gray-300 bg-gray-800",
};

export default function ConsoleTab({ logs }: { logs: ConsoleLog[] }) {
  if (logs.length === 0) {
    return <p className="text-sm text-gray-500">No console output recorded.</p>;
  }
  return (
    <div className="space-y-1">
      {logs.map((log, i) => {
        const cls = LEVEL_COLORS[log.level] ?? LEVEL_COLORS["log"];
        return (
          <div key={i} className={`rounded px-3 py-2 font-mono text-xs ${cls}`}>
            <span className="mr-2 font-semibold uppercase">[{log.level}]</span>
            <span className="break-all">{log.text}</span>
            {log.source_url && (
              <span className="ml-2 text-gray-500">
                {log.source_url}:{log.line_no}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
