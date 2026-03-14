export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center py-24">
      <h1 className="mb-2 text-3xl font-bold tracking-tight text-white">reconscan</h1>
      <p className="mb-10 text-gray-400">
        URL investigation tool. Run a scan with the CLI and view results here.
      </p>

      <form
        action="/jobs"
        method="get"
        className="flex w-full max-w-lg flex-col gap-3 sm:flex-row"
      >
        <input
          type="text"
          name="id"
          placeholder="Enter a job UUID..."
          required
          pattern="[0-9a-fA-F\-]{36}"
          title="Must be a 36-character UUID"
          autoComplete="off"
          className="flex-1 rounded-md border border-gray-700 bg-gray-900 px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="rounded-md bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          View Results
        </button>
      </form>

      <p className="mt-8 text-xs text-gray-600">
        Run a scan:{" "}
        <code className="rounded bg-gray-800 px-1.5 py-0.5 text-gray-400">
          reconscan scan https://example.com
        </code>
      </p>
    </div>
  );
}
