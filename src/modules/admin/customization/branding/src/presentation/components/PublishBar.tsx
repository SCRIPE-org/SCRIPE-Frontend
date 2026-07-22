// FILE-EXCEPTION: file length
/**
 * PublishBar — Top bar with back button, draft status, device toggle,
 * reset dropdown, publish/discard actions.
 * All labels localized via t()
 */
"use client";
// UI-EXCEPTION: compact studio layout — native <button> used for pixel-precise
// compact controls (toggle switches, gradient pickers, layout thumbnails, etc.)
// where @core/ui/button's padding/sizing would break the layout.

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Monitor,
  Tablet,
  Smartphone,
  Upload,
  RotateCcw,
  Loader2,
  Circle,
  Save,
  Check,
  ChevronDown,
  RefreshCw,
  Globe,
  Factory,
  Eye,
  Palette,
} from "lucide-react";
import { cn } from "@/core/common/utils";
import type { DeviceSize } from "../../domain/entities/StudioDraft";
import { useI18n } from "@core/providers/i18n-provider";

interface PublishBarProps {
  isDirty: boolean;
  isPublishing: boolean;
  isDiscarding: boolean;
  isSavingDraft: boolean;
  isResetting?: boolean;
  isPreviewingTheme?: boolean;
  lastSavedAt: Date | null;
  deviceSize: DeviceSize;
  setDeviceSize: (size: DeviceSize) => void;
  onPublish: () => void;
  onDiscard: () => void;
  onSaveDraft: () => void;
  onReset?: (type: "Published" | "GlobalDefault" | "FactoryDefault") => void;
  onExitPreview?: () => void;
  onRefresh?: () => void;
  onSaveAsTheme?: () => void;
}

const DEVICES: { id: DeviceSize; icon: typeof Monitor; labelKey: string }[] = [
  { id: "desktop", icon: Monitor, labelKey: "studio.device.desktop" },
  { id: "tablet", icon: Tablet, labelKey: "studio.device.tablet" },
  { id: "mobile", icon: Smartphone, labelKey: "studio.device.mobile" },
];

/**
 * Presentation UI component rendering the publish bar.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function PublishBar({
  isDirty,
  isPublishing,
  isDiscarding,
  isSavingDraft,
  isResetting,
  isPreviewingTheme,
  lastSavedAt,
  deviceSize,
  setDeviceSize,
  onPublish,
  onDiscard,
  onSaveDraft,
  onReset,
  onExitPreview,
  onRefresh,
  onSaveAsTheme,
}: PublishBarProps) {
  const { t } = useI18n();
  const [showResetMenu, setShowResetMenu] = useState(false);
  const resetMenuRef = useRef<HTMLDivElement>(null);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // Close reset menu on click outside
  useEffect(() => {
    if (!showResetMenu) return;
    const handler = (e: MouseEvent) => {
      if (resetMenuRef.current && !resetMenuRef.current.contains(e.target as Node)) {
        setShowResetMenu(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showResetMenu]);

  return (
    <div className="flex h-12 items-center justify-between border-b border-border bg-background px-4">
      {/* Left: Back + Title */}
      <div className="flex items-center gap-3">
        <Link
          href="/"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          title={t("studio.backToApp")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="h-5 w-px bg-border" />
        <h1 className="text-sm font-semibold text-foreground">{t("studio.title")}</h1>

        {/* Theme Preview Banner */}
        {isPreviewingTheme && (
          <div className="flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-0.5">
            <Eye className="h-2.5 w-2.5 text-primary" />
            <span className="text-[10px] font-medium text-primary">
              {t("studio.previewMode") || "Theme Preview"}
            </span>
            <button
              onClick={onExitPreview}
              className="ml-1 text-[10px] text-primary underline hover:text-primary/80"
            >
              {t("studio.exitPreview") || "Exit"}
            </button>
          </div>
        )}

        {/* Draft status indicator */}
        {!isPreviewingTheme && isDirty ? (
          <div className="flex items-center gap-1.5 rounded-full bg-warning/10 px-2.5 py-0.5">
            <Circle className="h-1.5 w-1.5 fill-warning text-warning" />
            <span className="text-[10px] font-medium text-warning">
              {t("studio.unsavedChanges")}
            </span>
          </div>
        ) : !isPreviewingTheme && lastSavedAt ? (
          <div className="flex items-center gap-1.5 rounded-full bg-success/10 px-2.5 py-0.5">
            <Check className="h-2.5 w-2.5 text-success" />
            <span className="text-[10px] font-medium text-success">
              {t("studio.saved") || "Saved"} {formatTime(lastSavedAt)}
            </span>
          </div>
        ) : null}
      </div>

      {/* Center: Device Toggle */}
      <div className="flex items-center gap-0.5 rounded-lg border border-border bg-muted/30 p-0.5">
        {DEVICES.map((device) => {
          const Icon = device.icon;
          const isActive = deviceSize === device.id;
          return (
            <button
              key={device.id}
              onClick={() => setDeviceSize(device.id)}
              className={cn(
                "flex h-7 items-center gap-1.5 rounded-md px-2.5 text-xs font-medium transition-all",
                isActive
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
              title={t(device.labelKey)}
            >
              <Icon className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{t(device.labelKey)}</span>
            </button>
          );
        })}
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {/* Refresh button */}
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            title={t("studio.refresh") || "Refresh from server"}
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
        )}

        {/* Save as Theme */}
        {onSaveAsTheme && (
          <button
            onClick={onSaveAsTheme}
            className="flex h-8 items-center gap-1.5 rounded-lg border border-border px-2.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            title={t("studio.saveTheme.title") || "Save as Theme"}
          >
            <Palette className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">
              {t("studio.saveTheme.title") || "Save as Theme"}
            </span>
          </button>
        )}

        {/* Reset dropdown */}
        {onReset && (
          <div className="relative" ref={resetMenuRef}>
            <button
              onClick={() => setShowResetMenu(!showResetMenu)}
              disabled={isResetting}
              className="flex h-8 items-center gap-1 rounded-lg border border-border px-2.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
              title={t("studio.reset.title") || "Reset"}
            >
              {isResetting ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <RotateCcw className="h-3.5 w-3.5" />
              )}
              <ChevronDown className="h-3 w-3" />
            </button>

            {showResetMenu && (
              <div className="absolute right-0 top-full z-50 mt-1 w-56 rounded-lg border border-border bg-background py-1 shadow-lg">
                <button
                  onClick={() => {
                    onReset("Published");
                    setShowResetMenu(false);
                  }}
                  className="flex w-full items-center gap-2.5 px-3 py-2 text-xs text-foreground transition-colors hover:bg-muted"
                >
                  <RotateCcw className="h-3.5 w-3.5 text-muted-foreground" />
                  <div className="flex flex-col items-start">
                    <span className="font-medium">
                      {t("studio.reset.published") || "Revert to Published"}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {t("studio.reset.publishedDesc") || "Reset draft to current live design"}
                    </span>
                  </div>
                </button>
                <button
                  onClick={() => {
                    onReset("GlobalDefault");
                    setShowResetMenu(false);
                  }}
                  className="flex w-full items-center gap-2.5 px-3 py-2 text-xs text-foreground transition-colors hover:bg-muted"
                >
                  <Globe className="h-3.5 w-3.5 text-muted-foreground" />
                  <div className="flex flex-col items-start">
                    <span className="font-medium">
                      {t("studio.reset.globalDefault") || "System Defaults"}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {t("studio.reset.globalDefaultDesc") || "Use platform-wide default branding"}
                    </span>
                  </div>
                </button>
                <div className="my-1 border-t border-border" />
                <button
                  onClick={() => {
                    onReset("FactoryDefault");
                    setShowResetMenu(false);
                  }}
                  className="flex w-full items-center gap-2.5 px-3 py-2 text-xs text-destructive transition-colors hover:bg-destructive/5"
                >
                  <Factory className="h-3.5 w-3.5" />
                  <div className="flex flex-col items-start">
                    <span className="font-medium">
                      {t("studio.reset.factoryDefault") || "Factory Reset"}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {t("studio.reset.factoryDefaultDesc") || "Reset to SCRIPE default theme"}
                    </span>
                  </div>
                </button>
              </div>
            )}
          </div>
        )}

        {isDirty && (
          <>
            <button
              onClick={onSaveDraft}
              disabled={isSavingDraft}
              className="flex h-8 items-center gap-1.5 rounded-lg border border-primary/30 bg-primary/5 px-3 text-xs font-medium text-primary transition-colors hover:bg-primary/10 disabled:opacity-50"
            >
              {isSavingDraft ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Save className="h-3.5 w-3.5" />
              )}
              {t("studio.saveDraft") || "Save Draft"}
            </button>
            <button
              onClick={onDiscard}
              disabled={isDiscarding}
              className="flex h-8 items-center gap-1.5 rounded-lg border border-border px-3 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
            >
              {isDiscarding ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <RotateCcw className="h-3.5 w-3.5" />
              )}
              {t("studio.discard")}
            </button>
          </>
        )}
        <button
          onClick={onPublish}
          disabled={!isDirty || isPublishing}
          className="flex h-8 items-center gap-1.5 rounded-lg bg-primary px-4 text-xs font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPublishing ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Upload className="h-3.5 w-3.5" />
          )}
          {t("studio.publish")}
        </button>
      </div>
    </div>
  );
}
