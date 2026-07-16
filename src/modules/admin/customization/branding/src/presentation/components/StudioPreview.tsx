/**
 * StudioPreview — Sandboxed iframe preview with device frames
 * Uses the REAL login page with ?page= for multi-page preview
 */
"use client";

import { Loader2 } from "lucide-react";
import type { DeviceSize, AuthPageId } from "../../domain/entities/StudioDraft";
import { DEVICE_DIMENSIONS } from "../../domain/entities/StudioDraft";

interface StudioPreviewProps {
  iframeRef: React.RefObject<HTMLIFrameElement | null>;
  isPreviewReady: boolean;
  deviceSize: DeviceSize;
  setDeviceSize: (size: DeviceSize) => void;
  onIframeLoad?: () => void;
  /** Current auth page tab — drives which form variant is shown */
  activeAuthPage?: AuthPageId;
}

const PAGE_LABELS: Record<string, string> = {
  login: "login",
  "forgot-password": "forgot password",
  "reset-password": "reset password",
};

/**
 * Presentation UI component rendering the studio preview.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function StudioPreview({
  iframeRef,
  isPreviewReady,
  deviceSize,
  onIframeLoad,
  activeAuthPage = "login",
}: StudioPreviewProps) {
  const dimensions = DEVICE_DIMENSIONS[deviceSize];

  // NOTE: Auth page switching is handled entirely via postMessage (activeAuthPage
  // in the draft payload). We do NOT reload the iframe on tab switch — that caused
  // race conditions where the postMessage draft would arrive with stale data.
  // The initial src uses ?page=login; all subsequent page switches are via postMessage.
  const iframeSrc = `/studio-preview?page=login`;

  return (
    <div className="relative flex flex-1 items-center justify-center overflow-hidden bg-muted/20 p-6">
      {/* Loading overlay */}
      {!isPreviewReady && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <p className="text-xs text-muted-foreground">Loading preview...</p>
          </div>
        </div>
      )}

      {/* Device Frame */}
      <div
        className="relative overflow-hidden rounded-xl border border-border bg-background shadow-2xl transition-all duration-300"
        style={{
          width: deviceSize === "desktop" ? "100%" : `${dimensions.width}px`,
          maxWidth: deviceSize === "desktop" ? "100%" : `${dimensions.width}px`,
          height: deviceSize === "desktop" ? "100%" : `${dimensions.height}px`,
          maxHeight: "100%",
        }}
      >
        {/* Browser Chrome (desktop only) */}
        {deviceSize === "desktop" && (
          <div className="flex h-8 items-center gap-1.5 border-b border-border bg-muted/40 px-3">
            <div className="flex gap-1">
              <div className="h-2.5 w-2.5 rounded-full bg-red-400/60" />
              <div className="h-2.5 w-2.5 rounded-full bg-amber-400/60" />
              <div className="h-2.5 w-2.5 rounded-full bg-green-400/60" />
            </div>
            <div className="mx-8 flex-1">
              <div className="mx-auto flex h-5 w-full max-w-sm items-center justify-center rounded-md bg-muted/60">
                <span className="font-mono text-[9px] text-muted-foreground/60">
                  {PAGE_LABELS[activeAuthPage] || "login"} preview
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Mobile notch (mobile only) */}
        {deviceSize === "mobile" && (
          <div className="flex h-6 items-center justify-center bg-black">
            <div className="h-3 w-20 rounded-full bg-muted/30" />
          </div>
        )}

        {/* iframe — loads preview page with ?page= for multi-page support */}
        <iframe
          ref={iframeRef}
          src={iframeSrc}
          className="h-full w-full border-0"
          title="Login Page Preview"
          onLoad={onIframeLoad}
          style={{
            height:
              deviceSize === "desktop"
                ? "calc(100% - 32px)"
                : deviceSize === "mobile"
                  ? "calc(100% - 24px)"
                  : "100%",
          }}
        />
      </div>
    </div>
  );
}
