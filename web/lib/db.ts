/**
 * SQLite read helpers for the web UI.
 *
 * Uses sql.js (SQLite compiled to WASM) so there are no native build
 * requirements. Must only be called server-side (Route Handlers, Server
 * Components, generateStaticParams, etc.) -- never imported by client code.
 */

import fs from "fs";
import path from "path";

import initSqlJs, { type Database } from "sql.js";

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

async function openDb(): Promise<Database> {
  const SQL = await initSqlJs();
  const buf = fs.readFileSync(DB_PATH);
  return new SQL.Database(buf);
}

function queryAll<T>(
  db: Database,
  sql: string,
  params: (string | number | null)[],
  mapRow: (row: Record<string, unknown>) => T
): T[] {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const results: T[] = [];
  while (stmt.step()) {
    results.push(mapRow(stmt.getAsObject({})));
  }
  stmt.free();
  return results;
}

function queryOne<T>(
  db: Database,
  sql: string,
  params: (string | number | null)[],
  mapRow: (row: Record<string, unknown>) => T
): T | null {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  let result: T | null = null;
  if (stmt.step()) {
    result = mapRow(stmt.getAsObject({}));
  }
  stmt.free();
  return result;
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
  return {
    job_id: r["job_id"] as string,
    html: r["html"] as string,
    final_url: r["final_url"] as string,
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

export async function getScanResult(jobId: string): Promise<ScanResult | null> {
  let db: Database;
  try {
    db = await openDb();
  } catch {
    return null;
  }

  try {
    const job = queryOne(db, "SELECT * FROM jobs WHERE id = ?", [jobId], mapJob);
    if (job === null) return null;

    const snapshot = queryOne(
      db,
      "SELECT * FROM snapshots WHERE job_id = ?",
      [jobId],
      mapSnapshot
    );

    const network_requests = queryAll(
      db,
      "SELECT * FROM network_requests WHERE job_id = ? ORDER BY id",
      [jobId],
      mapNetworkRequest
    );

    const console_logs = queryAll(
      db,
      "SELECT * FROM console_logs WHERE job_id = ? ORDER BY id",
      [jobId],
      mapConsoleLog
    );

    const cookies = queryAll(
      db,
      "SELECT * FROM cookies WHERE job_id = ? ORDER BY id",
      [jobId],
      mapCookie
    );

    const tls_info = queryOne(
      db,
      "SELECT * FROM tls_info WHERE job_id = ?",
      [jobId],
      mapTlsInfo
    );

    const redirects = queryAll(
      db,
      "SELECT * FROM redirects WHERE job_id = ? ORDER BY step",
      [jobId],
      mapRedirect
    );

    const technologies = queryAll(
      db,
      "SELECT * FROM technologies WHERE job_id = ? ORDER BY name",
      [jobId],
      mapTechnology
    );

    const links = queryAll(
      db,
      "SELECT * FROM links WHERE job_id = ? ORDER BY type, url",
      [jobId],
      mapLink
    );

    const dns_records = queryAll(
      db,
      "SELECT * FROM dns_records WHERE job_id = ? ORDER BY record_type, value",
      [jobId],
      mapDnsRecord
    );

    return {
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
      screenshot_path: null,
    };
  } finally {
    db.close();
  }
}
