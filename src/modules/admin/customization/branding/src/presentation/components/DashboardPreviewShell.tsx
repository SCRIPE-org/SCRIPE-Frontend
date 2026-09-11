// UI-EXCEPTION: compact studio layout
/**
 * DashboardPreviewShell — Isolated dashboard shell preview for Customizer Studio.
 *
 * KEY ARCHITECTURE: Mirrors LoginPreviewShell pattern exactly.
 * - Has ZERO auth logic (no tokens, no API calls)
 * - Previews the single nexus shell chrome (the product's one shell)
 * - Wrapped in its own SettingsProvider so settings changes apply instantly
 * - Design settings are injected via postMessage from the studio iframe parent
 * - Shows mock dashboard content (stat cards, charts, tables)
 *
 * Security:
 * - Cannot access any data (no repositories, no API calls)
 * - postMessage is origin-validated (same-origin)
 * - No access to auth tokens
 */
"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import {
  SettingsContext,
  defaultSettings,
  createCompatSetters,
  type Settings,
  type SettingsContextType,
} from "@core/providers/settings-provider";
import { applySettingsToDOM } from "@core/settings/dom-applicator";
import { MockDashboardContent } from "./MockDashboardContent";

/** Valid settings keys whitelist (security hardening against injected attributes). */
const VALID_SETTINGS_KEYS = new Set([
  "layoutTemplate",
  "colorTheme",
  "colorThemeCustomized",
  "secondaryColorTheme",
  "lightBackgroundTheme",
  "darkBackgroundTheme",
  "shadowIntensity",
  "backgroundMode",
  "gradientDirection",
  "lightGradientTheme",
  "darkGradientTheme",
  "customPrimaryColor",
  "customSecondaryColor",
  "customLightBgColor",
  "customDarkBgColor",
  "gradientStartColor",
  "gradientEndColor",
  "activePalette",
  "cardStyle",
  "animationLevel",
  "fontSize",
  "borderRadius",
  "sidebarPosition",
  "headerStyle",
  "sidebarStyle",
  "buttonStyle",
  "navigationStyle",
  "spacingSize",
  "iconStyle",
  "inputStyle",
  "tableStyle",
  "badgeStyle",
  "avatarStyle",
  "formStyle",
  "loadingStyle",
  "tooltipStyle",
  "modalStyle",
  "treeStyle",
  "datePickerStyle",
  "calendarStyle",
  "selectStyle",
  "switchStyle",
  "checkboxStyle",
  "radioStyle",
  "toastStyle",
  "hoverEffectType",
  "hoverEffectIntensity",
  "logoType",
  "logoAnimation",
  "logoSize",
  "logoText",
  "showBreadcrumbs",
  "showUserAvatar",
  "showNotifications",
  "compactMode",
  "highContrast",
  "reducedMotion",
  "stickyHeader",
  "collapsibleSidebar",
  "showFooter",
  "autoSave",
  "showLogo",
  "showDetailPanel",
  "showToastIcons",
  "toastDuration",
]);

/**
 * Presentation UI component rendering the dashboard preview shell.
 * Arranges layout boundaries and accessibility targets using the core design library (@core/ui/*).
 *
 * @returns Isolated settings provider hosting the nexus shell chrome and mock content.
 */
export function DashboardPreviewShell() {
  // Preview settings are maintained ENTIRELY in-memory.
  // No localStorage writes, no events, no auto-save triggers.
  // The parent window's SettingsProvider is completely unaffected.
  const [previewOverrides, setPreviewOverrides] = useState<Partial<Settings>>({});

  // Merge defaults with whatever the studio has sent via postMessage
  const mergedSettings = useMemo<Settings>(
    () => ({ ...defaultSettings, ...previewOverrides }),
    [previewOverrides]
  );

  // Build a context value with no-op setters (preview is read-only from layout's perspective)
  const noopUpdate = useCallback(
    <K extends keyof Settings>(_key: K, _value: Settings[K]) => {},
    []
  );
  const compatSetters = useMemo(() => createCompatSetters(noopUpdate), [noopUpdate]);
  const previewContextValue = useMemo<SettingsContextType>(
    () => ({
      ...mergedSettings,
      updateSetting: noopUpdate,
      ...compatSetters,
      resetSettings: () => {},
      exportSettings: () => "{}",
      importSettings: () => false,
      overrideControl: {
        allowAdminOverride: true,
        allowedPaths: null,
        isSettingLocked: () => false,
      },
    }),
    [mergedSettings, noopUpdate, compatSetters]
  );

  // Apply data-attributes and CSS vars to iframe document root
  useEffect(() => {
    applySettingsToDOM(mergedSettings);
  }, [mergedSettings]);

  // Listen for postMessage from studio parent — update in-memory state only
  useEffect(() => {
    // Signal to studio that preview is ready
    window.parent?.postMessage({ type: "DASHBOARD_PREVIEW_READY" }, window.location.origin);

    const handler = (e: MessageEvent) => {
      if (e.origin !== window.location.origin) return;

      if (e.data?.type === "DASHBOARD_SETTINGS_UPDATE") {
        const rawSettings = e.data.settings;
        if (!rawSettings || typeof rawSettings !== "object") return;

        // Filter to valid keys only (reject unknown/injected keys)
        const newSettings = Object.fromEntries(
          Object.entries(rawSettings).filter(([k]) => VALID_SETTINGS_KEYS.has(k))
        );
        if (Object.keys(newSettings).length === 0) return;

        // Update in-memory state only — NO localStorage, NO events
        setPreviewOverrides((prev) => ({ ...prev, ...newSettings }));
      }
    };

    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

  /**
   * Static preview of the single nexus shell chrome.
   * Real geometry (64px rail, 240px panel, 56px topbar) and real semantic tokens.
   */
  const surface = "var(--nx-surface)";
  const edge = "var(--nx-line)";
  const accent = "var(--nx-accent)";

  const nexusShellPreview = (
    <div className="flex h-full w-full overflow-hidden">
      {/* Rail */}
      <div
        className="flex shrink-0 flex-col items-center gap-2 py-3"
        style={{ width: 64, background: surface, borderInlineEnd: `1px solid ${edge}` }}
      >
        <div className="h-7 w-7 rounded-md" style={{ background: accent, opacity: 0.9 }} />
        <div className="my-1 h-px w-6" style={{ background: edge }} />
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-9 w-9 rounded-nx-md"
            style={{
              background:
                i === 0 ? `color-mix(in oklch, ${accent} 16%, transparent)` : "transparent",
              border: `1px solid ${i === 0 ? accent : "transparent"}`,
            }}
          />
        ))}
        <div className="mt-auto h-8 w-8 rounded-full" style={{ background: edge }} />
      </div>

      {/* Panel */}
      <div
        className="flex shrink-0 flex-col gap-1.5 p-3"
        style={{ width: 240, background: surface, borderInlineEnd: `1px solid ${edge}` }}
      >
        <div
          className="mb-2 flex items-center gap-2 pb-3"
          style={{ borderBlockEnd: `1px solid ${edge}` }}
        >
          <div className="h-6 w-6 rounded-nx-sm" style={{ border: `1px solid ${accent}` }} />
          <div className="h-2.5 w-24 rounded" style={{ background: edge }} />
        </div>
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-7 rounded-md"
            style={{
              background:
                i === 1 ? `color-mix(in oklch, ${accent} 12%, transparent)` : "transparent",
            }}
          />
        ))}
      </div>

      {/* Topbar + Content */}
      <div className="flex min-w-0 flex-1 flex-col">
        <div
          className="flex shrink-0 items-center gap-2 px-4"
          style={{ height: 56, borderBlockEnd: `1px solid ${edge}` }}
        >
          <div className="h-2.5 w-32 rounded" style={{ background: edge }} />
        </div>
        <div className="flex-1 overflow-auto p-6">
          <MockDashboardContent />
        </div>
      </div>
    </div>
  );

  return (
    <SettingsContext.Provider value={previewContextValue}>
      {nexusShellPreview}
    </SettingsContext.Provider>
  );
}
