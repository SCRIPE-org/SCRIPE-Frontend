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
import type { DashboardThemeSettings } from "../../domain/entities/StudioDraft";

interface Props {
  settings: DashboardThemeSettings;
}

/** Map DashboardThemeSettings → Settings provider keys (pass all through) */
function mapToSettingsKeys(ds: DashboardThemeSettings): Record<string, unknown> {
  // Pass all settings through — SettingsProvider handles defaults for any missing keys.
  // Only override layoutTemplate to ensure a valid default.
  return {
    ...ds,
    layoutTemplate: ds.layoutTemplate || "modern",
  };
}

type DeviceSize = "desktop" | "tablet" | "mobile";
const DEVICE_DIMS: Record<DeviceSize, { w: string; label: string }> = {
  desktop: { w: "100%", label: "Desktop" },
  tablet: { w: "768px", label: "Tablet" },
  mobile: { w: "375px", label: "Mobile" },
};

/**
 * Presentation UI component rendering the dashboard layout preview.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*).
 */
export function DashboardLayoutPreview({ settings }: Props) {
  const { direction } = useI18n();
  const isRTL = direction === "rtl";
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
      <div className="flex shrink-0 items-center justify-between border-b border-border/30 bg-background/80 px-4 py-1.5 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <LayoutDashboard className="h-3.5 w-3.5 text-primary" />
          <span className="text-xs font-semibold text-foreground">
            {isRTL ? "معاينة لوحة التحكم" : "Dashboard Preview"}
          </span>
          <span className="rounded bg-primary/10 px-1.5 py-0.5 font-mono text-[10px] font-medium text-primary">
            {settings.layoutTemplate || "modern"}
          </span>
          {!isReady && <span className="animate-pulse text-[10px] text-amber-500">Loading...</span>}
        </div>

        <div className="flex items-center gap-1.5">
          {/* Device switcher */}
          {[
            { key: "desktop" as DeviceSize, icon: Monitor },
            { key: "tablet" as DeviceSize, icon: Tablet },
            { key: "mobile" as DeviceSize, icon: Smartphone },
          ].map(({ key, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setDevice(key)}
              className={cn(
                "rounded p-1 transition-colors",
                device === key
                  ? "bg-primary/15 text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
              title={DEVICE_DIMS[key].label}
            >
              <Icon className="h-3.5 w-3.5" />
            </button>
          ))}

          <div className="mx-1 h-4 w-px bg-border" />

          <button
            onClick={handleRefresh}
            className="rounded p-1 text-muted-foreground transition-colors hover:text-foreground"
            title="Refresh"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>

          <span className="ms-2 text-[10px] text-muted-foreground">
            {settings.colorTheme} • {settings.sidebarPosition || "left"} •{" "}
            {settings.cardStyle || "default"}
          </span>
        </div>
      </div>

      {/* Iframe container */}
      <div className="flex flex-1 items-start justify-center overflow-hidden bg-gradient-to-br from-muted/20 via-background to-muted/10 p-2">
        <div
          className={cn(
            "h-full overflow-hidden rounded-lg border border-border/30 bg-background shadow-2xl transition-all duration-300",
            device !== "desktop" && "mx-auto"
          )}
          style={{ width: dim.w, maxWidth: "100%" }}
        >
          <iframe
            ref={iframeRef}
            src="/dashboard-preview"
            className="h-full w-full border-none"
            title="Dashboard Layout Preview"
          />
        </div>
      </div>
    </div>
  );
}
