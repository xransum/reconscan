"use client";

import { useEffect, useState } from "react";

export default function ScreenshotPreview({
  gifSrc,
  jpgHref,
}: {
  gifSrc: string;
  jpgHref: string;
}) {
  const [open, setOpen] = useState(false);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      {/* Thumbnail */}
      <button
        onClick={() => setOpen(true)}
        className="group relative block overflow-hidden rounded border transition-opacity hover:opacity-90 focus:outline-none focus:ring-2"
        style={{
          borderColor: "var(--border)",
          maxWidth: "480px",
          ["--tw-ring-color" as string]: "var(--accent)",
        }}
        title="Click to expand"
        aria-label="Expand page load preview"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={gifSrc}
          alt="Page load preview"
          className="block w-full"
          style={{ display: "block" }}
        />
        {/* Hover overlay */}
        <span
          className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100"
          style={{ background: "rgba(0,0,0,0.45)" }}
        >
          <span
            className="rounded border px-3 py-1.5 font-mono text-xs font-semibold"
            style={{
              borderColor: "var(--accent)",
              color: "var(--accent)",
              background: "rgba(0,0,0,0.7)",
            }}
          >
            expand
          </span>
        </span>
      </button>

      <p className="mt-1.5 text-xs" style={{ color: "var(--text-muted)" }}>
        Animated capture of the page rendering sequence.{" "}
        <a
          href={jpgHref}
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:opacity-80"
          style={{ color: "var(--accent)" }}
        >
          View full-page JPEG
        </a>
      </p>

      {/* Lightbox */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.85)" }}
          onClick={() => setOpen(false)}
        >
          <div
            className="relative max-h-full max-w-5xl overflow-auto rounded border"
            style={{ borderColor: "var(--border-bright)" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={gifSrc}
              alt="Page load preview (full size)"
              style={{ display: "block", maxWidth: "100%" }}
            />
            <button
              onClick={() => setOpen(false)}
              className="absolute right-2 top-2 rounded border px-2 py-0.5 font-mono text-xs transition-opacity hover:opacity-80"
              style={{
                background: "rgba(0,0,0,0.75)",
                borderColor: "var(--border-bright)",
                color: "var(--text-secondary)",
              }}
            >
              close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
