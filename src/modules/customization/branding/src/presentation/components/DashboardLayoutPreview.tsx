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
          iframeRef.current.contentWindow.postMessage({
            type: "DASHBOARD_SETTINGS_UPDATE",
            settings: pendingSettings.current,
          }, window.location.origin);
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
      iframeRef.current.contentWindow.postMessage({
        type: "DASHBOARD_SETTINGS_UPDATE",
        settings: mapped,
      }, window.location.origin);
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
    <div className="relative w-full h-full min-h-0 flex flex-col">
      {/* Chrome bar */}
      <div className="shrink-0 flex items-center justify-between px-4 py-1.5 bg-background/80 border-b border-border/30 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <LayoutDashboard className="h-3.5 w-3.5 text-primary" />
          <span className="text-xs font-semibold text-foreground">
            {isRTL ? "معاينة لوحة التحكم" : "Dashboard Preview"}
          </span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-mono font-medium">
            {settings.layoutTemplate || "modern"}
          </span>
          {!isReady && (
            <span className="text-[10px] text-amber-500 animate-pulse">Loading...</span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {/* Device switcher */}
          {([
            { key: "desktop" as DeviceSize, icon: Monitor },
            { key: "tablet" as DeviceSize, icon: Tablet },
            { key: "mobile" as DeviceSize, icon: Smartphone },
          ]).map(({ key, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setDevice(key)}
              className={cn(
                "p-1 rounded transition-colors",
                device === key ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground"
              )}
              title={DEVICE_DIMS[key].label}
            >
              <Icon className="h-3.5 w-3.5" />
            </button>
          ))}

          <div className="w-px h-4 bg-border mx-1" />

          <button onClick={handleRefresh} className="p-1 rounded text-muted-foreground hover:text-foreground transition-colors" title="Refresh">
            <RefreshCw className="h-3.5 w-3.5" />
          </button>

          <span className="text-[10px] text-muted-foreground ms-2">
            {settings.colorTheme} • {settings.sidebarPosition || "left"} • {settings.cardStyle || "default"}
          </span>
        </div>
      </div>

      {/* Iframe container */}
      <div className="flex-1 overflow-hidden flex items-start justify-center bg-gradient-to-br from-muted/20 via-background to-muted/10 p-2">
        <div
          className={cn(
            "h-full bg-background rounded-lg overflow-hidden shadow-2xl border border-border/30 transition-all duration-300",
            device !== "desktop" && "mx-auto"
          )}
          style={{ width: dim.w, maxWidth: "100%" }}
        >
          <iframe
            ref={iframeRef}
            src="/dashboard-preview"
            className="w-full h-full border-none"
            title="Dashboard Layout Preview"
          />
        </div>
      </div>
    </div>
  );
}
