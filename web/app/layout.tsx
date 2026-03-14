import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "ReconScan",
    template: "%s | ReconScan",
  },
  description:
    "ReconScan is a headless-browser URL investigation tool. Inspect network requests, cookies, redirects, TLS certificates, DNS records, and detected technologies for any URL.",
  keywords: [
    "url scanner",
    "url investigation",
    "security scanner",
    "network inspection",
    "tls certificate checker",
    "dns lookup",
    "redirect chain",
    "har capture",
    "technology detection",
    "reconscan",
  ],
  authors: [{ name: "ReconScan" }],
  creator: "ReconScan",
  metadataBase: new URL("http://localhost:3000"),
  openGraph: {
    type: "website",
    title: "ReconScan",
    description:
      "Headless-browser URL investigation tool. Inspect requests, cookies, redirects, TLS, DNS, and technologies for any URL.",
    siteName: "ReconScan",
  },
  twitter: {
    card: "summary",
    title: "ReconScan",
    description:
      "Headless-browser URL investigation tool. Inspect requests, cookies, redirects, TLS, DNS, and technologies for any URL.",
  },
  robots: {
    index: false,
    follow: false,
  },
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
              <Image
                src="/favicon.png"
                alt="ReconScan"
                width={28}
                height={28}
                className="rounded"
              />
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
