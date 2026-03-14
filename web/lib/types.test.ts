/**
 * Smoke tests verifying that all TypeScript types can be constructed without
 * TypeScript compilation errors. These are compile-time tests; at runtime they
 * just confirm the objects are shaped correctly.
 */

import type {
  ConsoleLog,
  Cookie,
  DnsRecord,
  Job,
  Link,
  NetworkRequest,
  Redirect,
  ScanResult,
  Snapshot,
  Technology,
  TlsInfo,
} from "./types";

describe("types shape checks", () => {
  it("Job has required fields", () => {
    const job: Job = {
      id: "abc-123",
      url: "https://example.com",
      status: "complete",
      created_at: "2024-01-01T00:00:00",
      completed_at: null,
    };
    expect(job.id).toBe("abc-123");
    expect(job.completed_at).toBeNull();
  });

  it("ScanResult defaults are correct shape", () => {
    const job: Job = {
      id: "x",
      url: "https://example.com",
      status: "complete",
      created_at: "now",
      completed_at: null,
    };
    const result: ScanResult = {
      job,
      snapshot: null,
      network_requests: [],
      console_logs: [],
      cookies: [],
      tls_info: null,
      redirects: [],
      technologies: [],
      links: [],
      dns_records: [],
      screenshot_path: null,
    };
    expect(result.network_requests).toHaveLength(0);
    expect(result.tls_info).toBeNull();
  });

  it("all types instantiate", () => {
    const snapshot: Snapshot = {
      job_id: "j",
      html: "<html>",
      final_url: "https://example.com",
    };
    const req: NetworkRequest = {
      job_id: "j",
      url: "https://x.com",
      method: "GET",
      status_code: 200,
      mime_type: "text/html",
      size: 100,
      timing_ms: 10,
    };
    const log: ConsoleLog = {
      job_id: "j",
      level: "error",
      text: "oops",
      source_url: "https://x.com",
      line_no: 1,
    };
    const cookie: Cookie = {
      job_id: "j",
      name: "sid",
      value: "abc",
      domain: "x.com",
      path: "/",
      secure: true,
      http_only: true,
      same_site: "Lax",
    };
    const tls: TlsInfo = {
      job_id: "j",
      issuer: "CA",
      subject: "example.com",
      san: "example.com",
      not_before: "2024-01-01",
      not_after: "2025-01-01",
      chain_json: "[]",
    };
    const redirect: Redirect = {
      job_id: "j",
      step: 0,
      from_url: "http://x.com",
      to_url: "https://x.com",
      status_code: 301,
    };
    const tech: Technology = {
      job_id: "j",
      name: "React",
      version: "18",
      category: "JavaScript frameworks",
    };
    const link: Link = { job_id: "j", url: "https://x.com/about", type: "internal" };
    const dns: DnsRecord = { job_id: "j", record_type: "A", value: "93.184.216.34", ttl: 3600 };

    expect(snapshot.html).toBe("<html>");
    expect(req.method).toBe("GET");
    expect(log.level).toBe("error");
    expect(cookie.secure).toBe(true);
    expect(tls.issuer).toBe("CA");
    expect(redirect.status_code).toBe(301);
    expect(tech.name).toBe("React");
    expect(link.type).toBe("internal");
    expect(dns.record_type).toBe("A");
  });
});
