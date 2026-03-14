export default async function JobPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <div className="py-12 text-center text-gray-400">
      <p className="text-sm">Loading job {id}...</p>
    </div>
  );
}
