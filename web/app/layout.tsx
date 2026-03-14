import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "reconscan",
  description: "URL investigation tool",
  icons: {
    icon: "/favicon.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body
        className="min-h-screen antialiased"
        style={{ background: "var(--bg-base)", color: "var(--text-primary)" }}
      >
        <header
          className="sticky top-0 z-50 border-b"
          style={{
            background: "var(--bg-surface)",
            borderColor: "var(--border)",
          }}
        >
          <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3">
            {/* Logo mark */}
            <Link href="/" className="group flex items-center gap-2.5">
              <span
                className="flex h-7 w-7 items-center justify-center rounded text-xs font-bold tracking-tight transition-colors"
                style={{
                  background: "var(--accent)",
                  color: "#fff",
                }}
              >
                RS
              </span>
              <span
                className="text-sm font-semibold tracking-tight transition-colors group-hover:text-white"
                style={{ color: "var(--text-primary)" }}
              >
                reconscan
              </span>
            </Link>

            {/* Right side */}
            <div className="ml-auto flex items-center gap-3">
              <span
                className="rounded border px-2 py-0.5 font-mono text-[10px] font-medium uppercase tracking-widest"
                style={{
                  borderColor: "var(--border-bright)",
                  color: "var(--text-muted)",
                  background: "var(--bg-raised)",
                }}
              >
                v0.1
              </span>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
