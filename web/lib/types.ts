/** TypeScript types mirroring the Python reconscan dataclasses. */

export interface Job {
  id: string;
  url: string;
  status: "pending" | "running" | "complete" | "failed";
  created_at: string;
  completed_at: string | null;
}

export interface Snapshot {
  job_id: string;
  html: string;
  final_url: string;
}

export interface NetworkRequest {
  job_id: string;
  url: string;
  method: string;
  status_code: number;
  mime_type: string;
  size: number;
  timing_ms: number;
}

export interface ConsoleLog {
  job_id: string;
  level: string;
  text: string;
  source_url: string;
  line_no: number;
}

export interface Cookie {
  job_id: string;
  name: string;
  value: string;
  domain: string;
  path: string;
  secure: boolean;
  http_only: boolean;
  same_site: string;
}

export interface TlsInfo {
  job_id: string;
  issuer: string;
  subject: string;
  san: string;
  not_before: string;
  not_after: string;
  chain_json: string;
}

export interface Redirect {
  job_id: string;
  step: number;
  from_url: string;
  to_url: string;
  status_code: number;
}

export interface Technology {
  job_id: string;
  name: string;
  version: string;
  category: string;
}

export interface Link {
  job_id: string;
  url: string;
  type: "internal" | "external";
}

export interface DnsRecord {
  job_id: string;
  record_type: string;
  value: string;
  ttl: number;
}

export interface ScanResult {
  job: Job;
  snapshot: Snapshot | null;
  network_requests: NetworkRequest[];
  console_logs: ConsoleLog[];
  cookies: Cookie[];
  tls_info: TlsInfo | null;
  redirects: Redirect[];
  technologies: Technology[];
  links: Link[];
  dns_records: DnsRecord[];
  screenshot_path: string | null;
}
