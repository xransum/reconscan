/** Redirect /jobs?id=<uuid> to /jobs/<uuid> */
import { redirect } from "next/navigation";

export default async function JobsRedirect({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const id = params["id"];
  if (typeof id === "string" && id.trim()) {
    redirect(`/jobs/${id.trim()}`);
  }
  redirect("/");
}
