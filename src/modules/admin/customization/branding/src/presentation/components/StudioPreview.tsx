/**
 * StudioPreview — Sandboxed iframe preview with device frames
 * Uses the REAL login page with ?page= for multi-page preview
 */
"use client";

import { LoadingSpinner } from "@core/ui/loading-spinner";
import { useI18n } from "@core/providers/i18n-provider";
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

// Maps the studio's page id to the existing studio.page.* translation keys.
const PAGE_LABEL_KEYS: Record<string, string> = {
  login: "studio.page.login",
  "forgot-password": "studio.page.forgotPassword",
  "reset-password": "studio.page.resetPassword",
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
  const { t } = useI18n();
  const dimensions = DEVICE_DIMENSIONS[deviceSize];

  // NOTE: Auth page switching is handled entirely via postMessage (activeAuthPage
  // in the draft payload). We do NOT reload the iframe on tab switch — that caused
  // race conditions where the postMessage draft would arrive with stale data.
  // The initial src uses ?page=login; all subsequent page switches are via postMessage.
  const iframeSrc = `/studio-preview?page=login`;

  return (
    <div className="relative flex flex-1 items-center justify-center overflow-hidden bg-nx-ground p-6">
      {/* Loading overlay */}
      {!isPreviewReady && (
        <div className="absolute inset-0 z-overlay flex items-center justify-center bg-nx-scrim">
          <div className="flex flex-col items-center gap-2">
            <LoadingSpinner size="sm" showText={false} />
            <p className="text-xs text-nx-ink-2">{t("studio.preview.loading")}</p>
          </div>
        </div>
      )}

      {/* Device Frame */}
      <div
        className="relative overflow-hidden rounded-nx-lg border border-nx-line bg-nx-surface shadow-nx-popover transition-[width,height] duration-nx-panel ease-nx-enter motion-reduce:transition-none"
        style={{
          width: deviceSize === "desktop" ? "100%" : `${dimensions.width}px`,
          maxWidth: deviceSize === "desktop" ? "100%" : `${dimensions.width}px`,
          height: deviceSize === "desktop" ? "100%" : `${dimensions.height}px`,
          maxHeight: "100%",
        }}
      >
        {/* Browser Chrome (desktop only) */}
        {deviceSize === "desktop" && (
          <div className="flex h-8 items-center gap-1.5 border-b border-nx-line bg-nx-raised px-3">
            <div className="flex gap-1" aria-hidden="true">
              <div className="h-2.5 w-2.5 rounded-full bg-destructive/60" />
              <div className="h-2.5 w-2.5 rounded-full bg-warning/60" />
              <div className="h-2.5 w-2.5 rounded-full bg-success/60" />
            </div>
            <div className="mx-8 flex-1">
              <div className="mx-auto flex h-5 w-full max-w-sm items-center justify-center rounded-nx-control bg-nx-raised-2">
                <span className="font-mono text-[9px] text-nx-ink-3">
                  {t(PAGE_LABEL_KEYS[activeAuthPage] || PAGE_LABEL_KEYS.login)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Mobile notch (mobile only) */}
        {deviceSize === "mobile" && (
          <div className="flex h-6 items-center justify-center bg-nx-ground" aria-hidden="true">
            <div className="h-3 w-20 rounded-full bg-nx-raised" />
          </div>
        )}

        {/* iframe — loads preview page with ?page= for multi-page support */}
        <iframe
          ref={iframeRef}
          src={iframeSrc}
          className="h-full w-full border-0"
          title={t("studio.preview.iframeTitle")}
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
