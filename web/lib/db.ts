/**
 * SQLite read helpers for the web UI.
 *
 * Uses sql.js (SQLite compiled to WASM) so there are no native build
 * requirements. The database file is read from the filesystem in
 * Route Handlers (server-side only -- never called from the browser).
 */

import type { ScanResult } from "./types";

// Placeholder -- implemented in the next commit.
export async function getScanResult(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  jobId: string,
): Promise<ScanResult | null> {
  throw new Error("db.ts: getScanResult not yet implemented");
}
