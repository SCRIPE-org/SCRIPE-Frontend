// FILE-EXCEPTION: file length
/**
 * PublishBar — Top bar with back button, draft status, device toggle,
 * reset dropdown, publish/discard actions.
 * All labels localized via t()
 */
"use client";
// UI-EXCEPTION: compact studio layout — native <button> used for pixel-precise
// compact controls (the device toggle) where @core/ui/button's padding/sizing
// would break the layout. Command actions (save/discard/publish/reset/refresh)
// compose the real Button + DropdownMenu primitives.

import Link from "next/link";
import {
  ArrowLeft,
  Monitor,
  Tablet,
  Smartphone,
  Upload,
  RotateCcw,
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
import { Button } from "@core/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@core/ui/dropdown-menu";

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

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="flex h-12 items-center justify-between border-b border-nx-line bg-nx-surface px-4">
      {/* Left: Back + Title */}
      <div className="flex items-center gap-3">
        <Link
          href="/"
          aria-label={t("studio.backToApp")}
          className="flex h-8 w-8 items-center justify-center rounded-nx-control text-nx-ink-2 transition-colors duration-nx-micro ease-nx-enter hover:bg-nx-hover hover:text-nx-ink motion-reduce:transition-none focus-visible:outline-none focus-visible:shadow-nx-focus"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        </Link>
        <div className="h-5 w-px bg-nx-line" />
        <h1 className="text-sm font-semibold text-nx-ink">{t("studio.title")}</h1>

        {/* Theme Preview Banner */}
        {isPreviewingTheme && (
          <div className="flex items-center gap-1.5 rounded-full bg-nx-accent-wash px-2.5 py-0.5">
            <Eye className="h-2.5 w-2.5 text-nx-accent" aria-hidden="true" />
            <span className="text-[10px] font-medium text-nx-accent">
              {t("studio.previewMode")}
            </span>
            <button
              type="button"
              onClick={onExitPreview}
              className="ms-1 rounded-nx-sm text-[10px] text-nx-accent underline transition-colors duration-nx-micro ease-nx-enter motion-reduce:transition-none focus-visible:outline-none focus-visible:shadow-nx-focus"
            >
              {t("studio.exitPreview")}
            </button>
          </div>
        )}

        {/* Draft status indicator */}
        {!isPreviewingTheme && isDirty ? (
          <div className="flex items-center gap-1.5 rounded-full bg-warning/10 px-2.5 py-0.5">
            <Circle className="h-1.5 w-1.5 fill-warning text-warning" aria-hidden="true" />
            <span className="text-[10px] font-medium text-warning">
              {t("studio.unsavedChanges")}
            </span>
          </div>
        ) : !isPreviewingTheme && lastSavedAt ? (
          <div className="flex items-center gap-1.5 rounded-full bg-success/10 px-2.5 py-0.5">
            <Check className="h-2.5 w-2.5 text-success" aria-hidden="true" />
            <span className="text-[10px] font-medium text-success">
              {t("studio.saved")} {formatTime(lastSavedAt)}
            </span>
          </div>
        ) : null}
      </div>

      {/* Center: Device Toggle */}
      <div className="flex items-center gap-0.5 rounded-nx-control border border-nx-line bg-nx-raised p-0.5">
        {DEVICES.map((device) => {
          const Icon = device.icon;
          const isActive = deviceSize === device.id;
          return (
            <button
              key={device.id}
              type="button"
              onClick={() => setDeviceSize(device.id)}
              aria-label={t(device.labelKey)}
              aria-pressed={isActive}
              className={cn(
                "flex h-7 items-center gap-1.5 rounded-nx-sm px-2.5 text-xs font-medium transition-colors duration-nx-micro ease-nx-enter motion-reduce:transition-none focus-visible:outline-none focus-visible:shadow-nx-focus",
                isActive
                  ? "bg-nx-surface text-nx-ink shadow-[inset_0_0_0_1px_var(--nx-line-hi)]"
                  : "text-nx-ink-2 hover:text-nx-ink"
              )}
            >
              <Icon className="h-3.5 w-3.5" aria-hidden="true" />
              <span className="hidden sm:inline">{t(device.labelKey)}</span>
            </button>
          );
        })}
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {/* Refresh button */}
        {onRefresh && (
          <Button
            variant="outline"
            size="icon"
            onClick={onRefresh}
            aria-label={t("studio.refresh")}
            className="h-8 w-8"
          >
            <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
          </Button>
        )}

        {/* Save as Theme */}
        {onSaveAsTheme && (
          <Button
            variant="outline"
            size="sm"
            onClick={onSaveAsTheme}
            aria-label={t("studio.saveTheme.title")}
            className="h-8 gap-1.5 px-2.5 text-xs"
          >
            <Palette className="h-3.5 w-3.5" aria-hidden="true" />
            <span className="hidden sm:inline">{t("studio.saveTheme.title")}</span>
          </Button>
        )}

        {/* Reset dropdown */}
        {onReset && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                loading={isResetting}
                aria-label={t("studio.reset.title")}
                className="h-8 gap-1 px-2.5 text-xs"
              >
                {!isResetting && <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />}
                <ChevronDown className="h-3 w-3" aria-hidden="true" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem
                onSelect={() => onReset("Published")}
                className="items-start gap-2.5 py-2"
              >
                <RotateCcw className="mt-0.5 h-3.5 w-3.5 text-nx-ink-3" aria-hidden="true" />
                <div className="flex flex-col items-start">
                  <span className="font-medium">{t("studio.reset.published")}</span>
                  <span className="text-[10px] text-nx-ink-3">
                    {t("studio.reset.publishedDesc")}
                  </span>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => onReset("GlobalDefault")}
                className="items-start gap-2.5 py-2"
              >
                <Globe className="mt-0.5 h-3.5 w-3.5 text-nx-ink-3" aria-hidden="true" />
                <div className="flex flex-col items-start">
                  <span className="font-medium">{t("studio.reset.globalDefault")}</span>
                  <span className="text-[10px] text-nx-ink-3">
                    {t("studio.reset.globalDefaultDesc")}
                  </span>
                </div>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onSelect={() => onReset("FactoryDefault")}
                className="items-start gap-2.5 py-2"
              >
                <Factory className="mt-0.5 h-3.5 w-3.5" aria-hidden="true" />
                <div className="flex flex-col items-start">
                  <span className="font-medium">{t("studio.reset.factoryDefault")}</span>
                  <span className="text-[10px] text-nx-ink-3">
                    {t("studio.reset.factoryDefaultDesc")}
                  </span>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {isDirty && (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={onSaveDraft}
              loading={isSavingDraft}
              className="h-8 gap-1.5 border-[color:color-mix(in_srgb,var(--nx-accent)_30%,transparent)] bg-nx-accent-wash px-3 text-xs text-nx-accent hover:border-nx-accent hover:bg-nx-accent-wash"
            >
              {!isSavingDraft && <Save className="h-3.5 w-3.5" aria-hidden="true" />}
              {t("studio.saveDraft")}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onDiscard}
              loading={isDiscarding}
              className="h-8 gap-1.5 px-3 text-xs"
            >
              {!isDiscarding && <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />}
              {t("studio.discard")}
            </Button>
          </>
        )}
        <Button
          variant="default"
          size="sm"
          onClick={onPublish}
          disabled={!isDirty}
          loading={isPublishing}
          className="h-8 gap-1.5 px-4 text-xs font-semibold"
        >
          {!isPublishing && <Upload className="h-3.5 w-3.5" aria-hidden="true" />}
          {t("studio.publish")}
        </Button>
      </div>
    </div>
  );
}
