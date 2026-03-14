import { existsSync } from "fs";
import path from "path";
import { spawn, execSync } from "child_process";

import { NextResponse } from "next/server";

const REPO_ROOT = process.env["RECONSCAN_ROOT"] ?? path.join(process.cwd(), "..");
const DATA_DIR = path.join(REPO_ROOT, "data");

function resolveBinary(): string | null {
  // 1. Try global install
  try {
    const which = execSync("which reconscan", { encoding: "utf8" }).trim();
    if (which) return which;
  } catch {
    // not on PATH
  }

  // 2. Fall back to .venv
  const venvBin = path.join(REPO_ROOT, ".venv", "bin", "reconscan");
  if (existsSync(venvBin)) {
    console.log(
      `[reconscan] Cannot find global binary for reconscan, but .venv found -- falling back to ${venvBin}`
    );
    return venvBin;
  }

  return null;
}

export async function POST(request: Request) {
  let body: { url?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const url = (body.url ?? "").trim();
  if (!url) {
    return NextResponse.json({ error: "url is required" }, { status: 422 });
  }

  const bin = resolveBinary();
  if (!bin) {
    return NextResponse.json({ error: "reconscan binary not found" }, { status: 503 });
  }

  return new Promise<NextResponse>((resolve) => {
    const child = spawn(bin, ["scan", url, "--data-dir", DATA_DIR], {
      stdio: ["ignore", "pipe", "pipe"],
    });

    let firstLine = "";
    let resolved = false;

    child.stdout.on("data", (chunk: Buffer) => {
      if (resolved) return;
      firstLine += chunk.toString();
      const newline = firstLine.indexOf("\n");
      if (newline !== -1) {
        const jobId = firstLine.slice(0, newline).trim();
        resolved = true;
        resolve(NextResponse.json({ id: jobId }, { status: 202 }));
      }
    });

    child.stderr.on("data", (chunk: Buffer) => {
      console.error("[reconscan stderr]", chunk.toString());
    });

    child.on("error", (err: Error) => {
      if (!resolved) {
        resolved = true;
        resolve(NextResponse.json({ error: err.message }, { status: 500 }));
      }
    });

    child.on("close", (code: number | null) => {
      if (!resolved) {
        resolved = true;
        resolve(
          NextResponse.json(
            { error: `process exited with code ${code}` },
            { status: 500 }
          )
        );
      }
    });
  });
}
