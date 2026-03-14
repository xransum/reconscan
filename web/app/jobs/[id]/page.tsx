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
import type { Job, Redirect, Technology, TlsInfo } from "@/lib/types";

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

// Tabs that carry a count badge and which data array to size
const BADGE_TABS: Partial<Record<Tab, string>> = {
  Network: "network",
  Console: "console",
  Cookies: "cookies",
  Redirects: "redirects",
  Links: "links",
  DNS: "dns",
};

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

  const counts: Record<string, number> = {
    network: network_requests.length,
    console: console_logs.length,
    cookies: cookies.length,
    redirects: redirects.length,
    links: links.length,
    dns: dns_records.length,
  };

  const isLive = job.status === "running" || job.status === "pending";

  return (
    <div>
      {isLive && (
        <>
          {/* Auto-reload every 3 seconds while scan is in progress */}
          <script
            dangerouslySetInnerHTML={{
              __html: "setTimeout(function(){location.reload();},3000);",
            }}
          />
          {/* Scanning banner */}
          <div
            className="mb-4 rounded border px-4 py-2.5 font-mono text-xs font-semibold"
            style={{
              background: "rgba(234,179,8,0.08)",
              borderColor: "rgba(234,179,8,0.35)",
              color: "var(--yellow)",
            }}
          >
            scanning... page will refresh automatically
          </div>
        </>
      )}

      <JobHeader job={job} />

      {/* Tab bar */}
      <nav
        className="mb-0 flex flex-wrap border-b"
        style={{ borderColor: "var(--border)" }}
      >
        {TABS.map((tab) => {
          const badgeKey = BADGE_TABS[tab];
          const count = badgeKey ? counts[badgeKey] : 0;
          const isActive = activeTab === tab;
          return (
            <a
              key={tab}
              href={`/jobs/${id}?tab=${tab}`}
              data-text={tab}
              className={`tab-btn${isActive ? "tab-btn-active" : ""}`}
            >
              {tab}
              {count != null && count > 0 && (
                <span
                  className="tab-badge"
                  style={
                    isActive
                      ? {
                          background: "var(--accent-dim)",
                          color: "#93c5fd",
                        }
                      : {
                          background: "var(--bg-subtle)",
                          color: "var(--text-muted)",
                        }
                  }
                >
                  {count}
                </span>
              )}
            </a>
          );
        })}
      </nav>

      {/* Tab content panel */}
      <div
        className="rounded-b-lg rounded-tr-lg border border-t-0 p-5"
        style={{
          background: "var(--bg-surface)",
          borderColor: "var(--border)",
        }}
      >
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

// ---------------------------------------------------------------------------
// SummaryTab
// ---------------------------------------------------------------------------

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
    <div className="space-y-6">
      {/* Scan details */}
      <section>
        <h2 className="panel-section-heading">Scan details</h2>
        <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="URL" value={job.url} mono wide />
          <Field label="Status" value={job.status} />
          <Field label="Job ID" value={job.id} mono />
          <Field label="Started" value={job.created_at} />
          {job.completed_at && <Field label="Completed" value={job.completed_at} />}
          <Field label="Redirects" value={String(redirects.length)} />
        </dl>
      </section>

      {/* TLS */}
      {tls && (
        <section>
          <h2 className="panel-section-heading">TLS</h2>
          <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="Issuer" value={tls.issuer} mono />
            <Field label="Subject" value={tls.subject} mono />
            <Field label="Expires" value={tls.not_after} />
          </dl>
        </section>
      )}

      {/* Technologies */}
      <section>
        <h2 className="panel-section-heading">Technologies ({technologies.length})</h2>
        {technologies.length === 0 ? (
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            None detected.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {technologies.map((t, i) => (
              <span
                key={i}
                className="rounded border px-2.5 py-1 text-xs"
                style={{
                  borderColor: "var(--border-bright)",
                  color: "var(--text-secondary)",
                  background: "var(--bg-raised)",
                }}
              >
                {t.name}
                {t.version && (
                  <span className="ml-1" style={{ color: "var(--text-muted)" }}>
                    {t.version}
                  </span>
                )}
              </span>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function Field({
  label,
  value,
  mono = false,
  wide = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
  wide?: boolean;
}) {
  return (
    <div className={wide ? "sm:col-span-2 lg:col-span-3" : ""}>
      <dt
        className="mb-0.5 text-[10px] font-semibold uppercase tracking-widest"
        style={{ color: "var(--text-muted)" }}
      >
        {label}
      </dt>
      <dd
        className={`break-all text-sm ${mono ? "font-mono" : ""}`}
        style={{ color: mono ? "var(--text-secondary)" : "var(--text-primary)" }}
      >
        {value}
      </dd>
    </div>
  );
}
