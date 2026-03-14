/**
 * SQLite read helpers for the web UI.
 *
 * Uses better-sqlite3 (native synchronous bindings).
 * Must only be called server-side (Route Handlers, Server Components, etc.)
 * -- never imported by client code.
 */

import path from "path";

import Database from "better-sqlite3";

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

const DB_PATH =
  process.env["RECONSCAN_DB_PATH"] ??
  path.join(process.cwd(), "..", "data", "reconscan.db");

function openDb(): Database.Database {
  return new Database(DB_PATH, { readonly: true, fileMustExist: true });
}

function mapJob(r: Record<string, unknown>): Job {
  return {
    id: r["id"] as string,
    url: r["url"] as string,
    status: r["status"] as Job["status"],
    created_at: r["created_at"] as string,
    completed_at: (r["completed_at"] as string | null) ?? null,
  };
}

function mapSnapshot(r: Record<string, unknown>): Snapshot {
  const toBase64 = (v: unknown): string | null => {
    if (v == null) return null;
    if (Buffer.isBuffer(v)) return v.toString("base64");
    if (v instanceof Uint8Array) return Buffer.from(v).toString("base64");
    return null;
  };
  return {
    job_id: r["job_id"] as string,
    html: r["html"] as string,
    final_url: r["final_url"] as string,
    screenshot_jpg: toBase64(r["screenshot_jpg"]),
    screenshot_gif: toBase64(r["screenshot_gif"]),
  };
}

function mapNetworkRequest(r: Record<string, unknown>): NetworkRequest {
  return {
    job_id: r["job_id"] as string,
    url: r["url"] as string,
    method: r["method"] as string,
    status_code: r["status_code"] as number,
    mime_type: r["mime_type"] as string,
    size: r["size"] as number,
    timing_ms: r["timing_ms"] as number,
  };
}

function mapConsoleLog(r: Record<string, unknown>): ConsoleLog {
  return {
    job_id: r["job_id"] as string,
    level: r["level"] as string,
    text: r["text"] as string,
    source_url: r["source_url"] as string,
    line_no: r["line_no"] as number,
  };
}

function mapCookie(r: Record<string, unknown>): Cookie {
  return {
    job_id: r["job_id"] as string,
    name: r["name"] as string,
    value: r["value"] as string,
    domain: r["domain"] as string,
    path: r["path"] as string,
    secure: Boolean(r["secure"]),
    http_only: Boolean(r["http_only"]),
    same_site: r["same_site"] as string,
  };
}

function mapTlsInfo(r: Record<string, unknown>): TlsInfo {
  return {
    job_id: r["job_id"] as string,
    issuer: r["issuer"] as string,
    subject: r["subject"] as string,
    san: r["san"] as string,
    not_before: r["not_before"] as string,
    not_after: r["not_after"] as string,
    chain_json: r["chain_json"] as string,
  };
}

function mapRedirect(r: Record<string, unknown>): Redirect {
  return {
    job_id: r["job_id"] as string,
    step: r["step"] as number,
    from_url: r["from_url"] as string,
    to_url: r["to_url"] as string,
    status_code: r["status_code"] as number,
  };
}

function mapTechnology(r: Record<string, unknown>): Technology {
  return {
    job_id: r["job_id"] as string,
    name: r["name"] as string,
    version: r["version"] as string,
    category: r["category"] as string,
  };
}

function mapLink(r: Record<string, unknown>): Link {
  return {
    job_id: r["job_id"] as string,
    url: r["url"] as string,
    type: r["type"] as Link["type"],
  };
}

function mapDnsRecord(r: Record<string, unknown>): DnsRecord {
  return {
    job_id: r["job_id"] as string,
    record_type: r["record_type"] as string,
    value: r["value"] as string,
    ttl: r["ttl"] as number,
  };
}

export function getSnapshot(jobId: string): Snapshot | null {
  let db: Database.Database;
  try {
    db = openDb();
  } catch {
    return null;
  }
  try {
    const row = db.prepare("SELECT * FROM snapshots WHERE job_id = ?").get(jobId) as
      | Record<string, unknown>
      | undefined;
    return row ? mapSnapshot(row) : null;
  } finally {
    db.close();
  }
}

export function getJobs(): Job[] {
  let db: Database.Database;
  try {
    db = openDb();
  } catch {
    return [];
  }

  try {
    const rows = db
      .prepare("SELECT * FROM jobs ORDER BY created_at DESC")
      .all() as Record<string, unknown>[];
    return rows.map(mapJob);
  } finally {
    db.close();
  }
}

export function getScanResult(jobId: string): ScanResult | null {
  let db: Database.Database;
  try {
    db = openDb();
  } catch {
    return null;
  }

  try {
    const job = db.prepare("SELECT * FROM jobs WHERE id = ?").get(jobId) as
      | Record<string, unknown>
      | undefined;
    if (!job) return null;

    const snapshotRow = db
      .prepare("SELECT * FROM snapshots WHERE job_id = ?")
      .get(jobId) as Record<string, unknown> | undefined;

    const network_requests = (
      db
        .prepare("SELECT * FROM network_requests WHERE job_id = ? ORDER BY id")
        .all(jobId) as Record<string, unknown>[]
    ).map(mapNetworkRequest);

    const console_logs = (
      db
        .prepare("SELECT * FROM console_logs WHERE job_id = ? ORDER BY id")
        .all(jobId) as Record<string, unknown>[]
    ).map(mapConsoleLog);

    const cookies = (
      db
        .prepare("SELECT * FROM cookies WHERE job_id = ? ORDER BY id")
        .all(jobId) as Record<string, unknown>[]
    ).map(mapCookie);

    const tlsRow = db.prepare("SELECT * FROM tls_info WHERE job_id = ?").get(jobId) as
      | Record<string, unknown>
      | undefined;

    const redirects = (
      db
        .prepare("SELECT * FROM redirects WHERE job_id = ? ORDER BY step")
        .all(jobId) as Record<string, unknown>[]
    ).map(mapRedirect);

    const technologies = (
      db
        .prepare("SELECT * FROM technologies WHERE job_id = ? ORDER BY name")
        .all(jobId) as Record<string, unknown>[]
    ).map(mapTechnology);

    const links = (
      db
        .prepare("SELECT * FROM links WHERE job_id = ? ORDER BY type, url")
        .all(jobId) as Record<string, unknown>[]
    ).map(mapLink);

    const dns_records = (
      db
        .prepare(
          "SELECT * FROM dns_records WHERE job_id = ? ORDER BY record_type, value"
        )
        .all(jobId) as Record<string, unknown>[]
    ).map(mapDnsRecord);

    return {
      job: mapJob(job),
      snapshot: snapshotRow ? mapSnapshot(snapshotRow) : null,
      network_requests,
      console_logs,
      cookies,
      tls_info: tlsRow ? mapTlsInfo(tlsRow) : null,
      redirects,
      technologies,
      links,
      dns_records,
    };
  } finally {
    db.close();
  }
}
