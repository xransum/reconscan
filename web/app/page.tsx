export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <h1 className="mb-4 text-3xl font-bold">reconscan</h1>
      <p className="mb-8 text-gray-400">Enter a job ID to view scan results.</p>
      <form action="/jobs" method="get" className="flex gap-2">
        <input
          type="text"
          name="id"
          placeholder="Job UUID"
          required
          className="w-80 rounded-md border border-gray-700 bg-gray-900 px-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500"
        >
          View
        </button>
      </form>
    </div>
  );
}
