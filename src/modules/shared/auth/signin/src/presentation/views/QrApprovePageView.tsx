"use client";

import { Suspense } from "react";
import { QrApprovePageContent } from "../components/QrApprovePageContent";

/**
 * QrApprovePageView — Top-level wrapper for the QR approval page.
 *
 * This page is loaded on mobile when the user scans a QR code.
 * The URL contains ?session=<sessionId> which is extracted by QrApprovePageContent.
 *
 * Layout: Centered card on dark Vault background — auth aesthetic.
 * No authentication required (the page is public — session ID IS the authentication credential).
 */
export function QrApprovePageView() {
  return (
    <main className="flex min-h-[100dvh] items-center justify-center bg-nx-ground p-4 text-nx-ink">
      <div
        className="w-full max-w-sm overflow-hidden rounded-2xl border"
        style={{
          background: "var(--sx-card-bg, var(--nx-surface))",
          borderColor: "var(--sx-card-border, var(--nx-line))",
        }}
      >
        {/* Brand header */}
        <div
          className="border-b px-6 py-4 text-center"
          style={{ borderColor: "var(--sx-card-border, var(--nx-line))" }}
        >
          <p
            className="text-xs font-medium uppercase tracking-widest"
            style={{ color: "var(--sx-text-faint, var(--nx-ink-3))" }}
          >
            SCRIPE
          </p>
        </div>

        {/* Main content */}
        <div className="p-6">
          <Suspense fallback={<QrApproveLoadingState />}>
            <QrApprovePageContent />
          </Suspense>
        </div>
      </div>
    </main>
  );
}

// ─── Loading skeleton ──────────────────────────────────────────────────────────

function QrApproveLoadingState() {
  return (
    <div className="space-y-4 text-center">
      <div className="mx-auto h-14 w-14 animate-pulse rounded-2xl bg-nx-raised motion-reduce:animate-none" />
      <div className="mx-auto h-5 w-2/3 animate-pulse rounded bg-nx-raised motion-reduce:animate-none" />
      <div className="mx-auto h-4 w-1/2 animate-pulse rounded bg-nx-raised motion-reduce:animate-none" />
      <div className="mx-auto h-24 animate-pulse rounded-lg bg-nx-raised motion-reduce:animate-none" />
      <div className="flex gap-3">
        <div className="h-12 flex-1 animate-pulse rounded-xl bg-destructive/10 motion-reduce:animate-none" />
        <div className="h-12 flex-1 animate-pulse rounded-xl bg-nx-accent-wash motion-reduce:animate-none" />
      </div>
    </div>
  );
}
