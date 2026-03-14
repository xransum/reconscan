import type { Snapshot } from "@/lib/types";

export default function DomTab({ snapshot }: { snapshot: Snapshot | null }) {
  if (!snapshot) {
    return <p className="text-sm text-gray-500">No DOM snapshot available.</p>;
  }
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm text-gray-400">
        <span className="font-medium text-gray-300">Final URL:</span>
        <span className="break-all font-mono text-xs">{snapshot.final_url}</span>
      </div>
      <pre className="max-h-[480px] overflow-auto whitespace-pre-wrap break-all rounded border border-gray-800 bg-gray-900 p-4 font-mono text-xs text-gray-300">
        {snapshot.html}
      </pre>
    </div>
  );
}
