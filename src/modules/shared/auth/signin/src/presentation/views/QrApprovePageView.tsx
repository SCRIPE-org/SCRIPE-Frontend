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
    <div
      className="flex min-h-screen items-center justify-center p-4"
      style={{
        background:
          "radial-gradient(ellipse at 50% 0%, rgba(124,58,237,0.12) 0%, transparent 60%), hsl(var(--background))",
      }}
    >
      <div
        className="w-full max-w-sm overflow-hidden rounded-2xl"
        style={{
          background: "var(--sx-card-bg, hsl(var(--card)))",
          border: "1px solid var(--sx-card-border, hsl(var(--border)))",
          boxShadow: "0 0 0 1px rgba(255,255,255,0.03), 0 32px 64px rgba(0,0,0,0.4)",
        }}
      >
        {/* Brand header */}
        <div
          className="border-b px-6 py-4 text-center"
          style={{ borderColor: "var(--sx-card-border, hsl(var(--border)))" }}
        >
          <p
            className="text-xs font-medium uppercase tracking-widest"
            style={{ color: "var(--sx-text-faint, hsl(var(--muted-foreground)/0.5))" }}
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
    </div>
  );
}

// ─── Loading skeleton ──────────────────────────────────────────────────────────

function QrApproveLoadingState() {
  return (
    <div className="space-y-4 text-center">
      <div
        className="mx-auto h-14 w-14 animate-pulse rounded-2xl"
        style={{ background: "rgba(255,255,255,0.06)" }}
      />
      <div
        className="mx-auto h-5 w-2/3 animate-pulse rounded"
        style={{ background: "rgba(255,255,255,0.06)" }}
      />
      <div
        className="mx-auto h-4 w-1/2 animate-pulse rounded"
        style={{ background: "rgba(255,255,255,0.04)" }}
      />
      <div
        className="mx-auto h-24 animate-pulse rounded-lg"
        style={{ background: "rgba(255,255,255,0.04)" }}
      />
      <div className="flex gap-3">
        <div
          className="h-12 flex-1 animate-pulse rounded-xl"
          style={{ background: "hsl(var(--destructive) / 0.1)" }}
        />
        <div
          className="h-12 flex-1 animate-pulse rounded-xl"
          style={{ background: "rgba(124,58,237,0.15)" }}
        />
      </div>
    </div>
  );
}
