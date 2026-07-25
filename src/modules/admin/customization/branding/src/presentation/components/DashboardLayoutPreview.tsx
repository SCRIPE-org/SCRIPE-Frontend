// UI-EXCEPTION: compact studio layout
/**
 * DashboardLayoutPreview — Iframe-based preview using the REAL layout components.
 *
 * Embeds /dashboard-preview (DashboardPreviewShell) in an iframe.
 * That shell renders the actual ClassicLayout, ModernLayout, NavigationLayout, etc.
 * with mock dashboard content.
 *
 * Settings changes from the DashboardBuilderTab are pushed via postMessage
 * to the iframe, which writes them to localStorage → SettingsProvider re-merges
 * → DashboardLayout swaps to the new layout template in real-time.
 *
 * Pattern mirrors: StudioPreview iframe → LoginPreviewShell
 */
"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { LayoutDashboard, Monitor, Tablet, Smartphone, RefreshCw } from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
import { cn } from "@/core/common/utils";
import { LoadingSpinner } from "@core/ui/loading-spinner";
import type { DashboardThemeSettings } from "../../domain/entities/StudioDraft";
import { defaultSettings } from "@core/settings/defaults";

interface Props {
  settings: DashboardThemeSettings;
}

/** Map DashboardThemeSettings → Settings provider keys (pass all through) */
function mapToSettingsKeys(ds: DashboardThemeSettings): Record<string, unknown> {
  // Pass all settings through — SettingsProvider handles defaults for any missing keys.
  // Only override layoutTemplate to ensure a valid default — the platform
  // default, not an arbitrary one, so the preview matches reality.
  return {
    ...ds,
    layoutTemplate: ds.layoutTemplate || defaultSettings.layoutTemplate,
  };
}

type DeviceSize = "desktop" | "tablet" | "mobile";
const DEVICE_DIMS: Record<DeviceSize, { w: string; labelKey: string }> = {
  desktop: { w: "100%", labelKey: "studio.device.desktop" },
  tablet: { w: "768px", labelKey: "studio.device.tablet" },
  mobile: { w: "375px", labelKey: "studio.device.mobile" },
};

/**
 * Presentation UI component rendering the dashboard layout preview.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*).
 */
export function DashboardLayoutPreview({ settings }: Props) {
  const { t } = useI18n();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isReady, setIsReady] = useState(false);
  const [device, setDevice] = useState<DeviceSize>("desktop");
  const pendingSettings = useRef<Record<string, unknown> | null>(null);

  // ── Listen for DASHBOARD_PREVIEW_READY from iframe ──
  useEffect(() => {
    const handler = (event: MessageEvent) => {
      if (event.data?.type === "DASHBOARD_PREVIEW_READY") {
        setIsReady(true);
        // Flush any pending settings
        if (pendingSettings.current && iframeRef.current?.contentWindow) {
          iframeRef.current.contentWindow.postMessage(
            {
              type: "DASHBOARD_SETTINGS_UPDATE",
              settings: pendingSettings.current,
            },
            window.location.origin
          );
          pendingSettings.current = null;
        }
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

  // ── Push settings to iframe on every change ──
  useEffect(() => {
    const mapped = mapToSettingsKeys(settings);

    if (isReady && iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        {
          type: "DASHBOARD_SETTINGS_UPDATE",
          settings: mapped,
        },
        window.location.origin
      );
    } else {
      pendingSettings.current = mapped;
    }
  }, [settings, isReady]);

  const handleRefresh = useCallback(() => {
    setIsReady(false);
    if (iframeRef.current) {
      iframeRef.current.src = iframeRef.current.src;
    }
  }, []);

  const dim = DEVICE_DIMS[device];

  return (
    <div className="relative flex h-full min-h-0 w-full flex-col">
      {/* Chrome bar */}
      <div className="flex shrink-0 items-center justify-between border-b border-nx-line bg-nx-surface px-4 py-1.5">
        <div className="flex items-center gap-2">
          <LayoutDashboard className="h-3.5 w-3.5 text-nx-accent" aria-hidden="true" />
          <span className="text-xs font-semibold text-nx-ink">
            {t("studio.dashboard.previewTitle")}
          </span>
          <span className="rounded-nx-sm bg-nx-accent-wash px-1.5 py-0.5 font-mono text-[10px] font-medium text-nx-accent">
            {settings.layoutTemplate || "modern"}
          </span>
          {!isReady && (
            <span className="flex items-center gap-1 text-[10px] text-warning">
              <LoadingSpinner size="inline" showText={false} />
              {t("common.loading")}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {/* Device switcher */}
          {(["desktop", "tablet", "mobile"] as DeviceSize[]).map((key) => {
            const Icon = key === "desktop" ? Monitor : key === "tablet" ? Tablet : Smartphone;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setDevice(key)}
                aria-label={t(DEVICE_DIMS[key].labelKey)}
                aria-pressed={device === key}
                className={cn(
                  "rounded-nx-sm p-1 transition-colors duration-nx-micro ease-nx-enter focus-visible:shadow-nx-focus focus-visible:outline-none motion-reduce:transition-none",
                  device === key
                    ? "bg-nx-accent-wash text-nx-accent"
                    : "text-nx-ink-2 hover:text-nx-ink"
                )}
              >
                <Icon className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            );
          })}

          <div className="mx-1 h-4 w-px bg-nx-line" />

          <button
            type="button"
            onClick={handleRefresh}
            aria-label={t("common.refresh")}
            className="rounded-nx-sm p-1 text-nx-ink-2 transition-colors duration-nx-micro ease-nx-enter hover:text-nx-ink focus-visible:shadow-nx-focus focus-visible:outline-none motion-reduce:transition-none"
          >
            <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
          </button>

          <span className="ms-2 text-[10px] text-nx-ink-3">
            {settings.colorTheme} •{" "}
            {t(
              settings.sidebarPosition === "right"
                ? "studio.dashboard.sidebarPositionRight"
                : "studio.dashboard.sidebarPositionLeft"
            )}{" "}
            • {t(`studio.dashboard.card.${settings.cardStyle || "default"}`)}
          </span>
        </div>
      </div>

      {/* Iframe container */}
      <div className="flex flex-1 items-start justify-center overflow-hidden bg-nx-ground p-2">
        <div
          className={cn(
            "h-full overflow-hidden rounded-nx-lg border border-nx-line bg-nx-surface shadow-nx-popover transition-[width] duration-nx-panel ease-nx-enter motion-reduce:transition-none",
            device !== "desktop" && "mx-auto"
          )}
          style={{ width: dim.w, maxWidth: "100%" }}
        >
          <iframe
            ref={iframeRef}
            src="/dashboard-preview"
            className="h-full w-full border-none"
            title={t("studio.dashboard.previewIframeTitle")}
          />
        </div>
      </div>
    </div>
  );
}
