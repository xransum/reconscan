import type { Job } from "@/lib/types";

const STATUS_COLORS: Record<string, string> = {
  complete: "bg-green-900 text-green-300",
  running: "bg-yellow-900 text-yellow-300",
  failed: "bg-red-900 text-red-300",
  pending: "bg-gray-800 text-gray-400",
};

export default function JobHeader({ job }: { job: Job }) {
  const color = STATUS_COLORS[job.status] ?? STATUS_COLORS["pending"];
  return (
    <div className="mb-6">
      <div className="flex items-center gap-3">
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide ${color}`}
        >
          {job.status}
        </span>
        <h1 className="truncate text-xl font-semibold text-white">{job.url}</h1>
      </div>
      <p className="mt-1 text-xs text-gray-500">
        Job ID: <span className="font-mono text-gray-400">{job.id}</span>
        {" -- "}
        Started: {job.created_at}
        {job.completed_at ? ` -- Completed: ${job.completed_at}` : ""}
      </p>
    </div>
  );
}
