import { notFound } from "next/navigation";

import ConsoleTab from "@/components/ConsoleTab";
import CookiesTab from "@/components/CookiesTab";
import DnsTab from "@/components/DnsTab";
import DomTab from "@/components/DomTab";
import JobHeader from "@/components/JobHeader";
import LinksTab from "@/components/LinksTab";
import NetworkTab from "@/components/NetworkTab";
import RedirectsTab from "@/components/RedirectsTab";
import TechnologiesTab from "@/components/TechnologiesTab";
import TlsTab from "@/components/TlsTab";
import { getScanResult } from "@/lib/db";

export const dynamic = "force-dynamic";

const TABS = [
  "Summary",
  "Network",
  "Console",
  "Cookies",
  "TLS",
  "Redirects",
  "Technologies",
  "Links",
  "DNS",
  "DOM",
] as const;

type Tab = (typeof TABS)[number];

export default async function JobPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const rawTab = sp["tab"];
  const activeTab: Tab =
    typeof rawTab === "string" && TABS.includes(rawTab as Tab)
      ? (rawTab as Tab)
      : "Summary";

  const result = getScanResult(id);
  if (!result) notFound();

  const {
    job,
    snapshot,
    network_requests,
    console_logs,
    cookies,
    tls_info,
    redirects,
    technologies,
    links,
    dns_records,
  } = result;

  return (
    <div>
      <JobHeader job={job} />

      {/* Screenshot */}
      <nav className="mb-6 flex flex-wrap gap-1 border-b border-gray-800 pb-0">
        {TABS.map((tab) => (
          <a
            key={tab}
            href={`/jobs/${id}?tab=${tab}`}
            className={`rounded-t px-3 py-1.5 text-sm transition-colors ${
              activeTab === tab
                ? "border-b-2 border-blue-500 text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            {tab}
            {tab === "Network" && network_requests.length > 0 && (
              <span className="ml-1.5 rounded-full bg-gray-700 px-1.5 py-0.5 text-xs">
                {network_requests.length}
              </span>
            )}
            {tab === "Console" && console_logs.length > 0 && (
              <span className="ml-1.5 rounded-full bg-gray-700 px-1.5 py-0.5 text-xs">
                {console_logs.length}
              </span>
            )}
            {tab === "Cookies" && cookies.length > 0 && (
              <span className="ml-1.5 rounded-full bg-gray-700 px-1.5 py-0.5 text-xs">
                {cookies.length}
              </span>
            )}
            {tab === "Redirects" && redirects.length > 0 && (
              <span className="ml-1.5 rounded-full bg-gray-700 px-1.5 py-0.5 text-xs">
                {redirects.length}
              </span>
            )}
          </a>
        ))}
      </nav>

      <div className="rounded-lg border border-gray-800 bg-gray-900 p-4">
        {activeTab === "Summary" && (
          <SummaryTab
            job={job}
            technologies={technologies}
            tls={tls_info}
            redirects={redirects}
          />
        )}
        {activeTab === "Network" && <NetworkTab requests={network_requests} />}
        {activeTab === "Console" && <ConsoleTab logs={console_logs} />}
        {activeTab === "Cookies" && <CookiesTab cookies={cookies} />}
        {activeTab === "TLS" && <TlsTab tls={tls_info} />}
        {activeTab === "Redirects" && <RedirectsTab redirects={redirects} />}
        {activeTab === "Technologies" && (
          <TechnologiesTab technologies={technologies} />
        )}
        {activeTab === "Links" && <LinksTab links={links} />}
        {activeTab === "DNS" && <DnsTab records={dns_records} />}
        {activeTab === "DOM" && <DomTab snapshot={snapshot} />}
      </div>
    </div>
  );
}

import type { Job, TlsInfo, Technology, Redirect } from "@/lib/types";

function SummaryTab({
  job,
  technologies,
  tls,
  redirects,
}: {
  job: Job;
  technologies: Technology[];
  tls: TlsInfo | null;
  redirects: Redirect[];
}) {
  return (
    <dl className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
      <Field label="URL" value={job.url} mono />
      <Field label="Status" value={job.status} />
      <Field label="Job ID" value={job.id} mono />
      <Field label="Started" value={job.created_at} />
      {job.completed_at && <Field label="Completed" value={job.completed_at} />}
      <Field label="Redirects" value={String(redirects.length)} />
      {tls && <Field label="TLS Issuer" value={tls.issuer} mono />}
      {tls && <Field label="TLS Expires" value={tls.not_after} />}
      <Field label="Technologies detected" value={String(technologies.length)} />
    </dl>
  );
}

function Field({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase text-gray-500">{label}</dt>
      <dd
        className={`mt-0.5 break-all text-xs ${
          mono ? "font-mono text-gray-300" : "text-gray-200"
        }`}
      >
        {value}
      </dd>
    </div>
  );
}
