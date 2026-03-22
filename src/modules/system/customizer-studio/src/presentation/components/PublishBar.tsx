/**
 * PublishBar — Top bar with back button, draft status, device toggle, publish/discard
 * All labels localized via t()
 */
"use client";

import Link from "next/link";
import { ArrowLeft, Monitor, Tablet, Smartphone, Upload, RotateCcw, Loader2, Circle, Save, Check } from "lucide-react";
import { cn } from "@/core/common/utils";
import type { DeviceSize } from "../viewmodels/useStudioViewModel";

interface PublishBarProps {
  t: (key: string) => string;
  isDirty: boolean;
  isPublishing: boolean;
  isDiscarding: boolean;
  isSavingDraft: boolean;
  lastSavedAt: Date | null;
  deviceSize: DeviceSize;
  setDeviceSize: (size: DeviceSize) => void;
  onPublish: () => void;
  onDiscard: () => void;
  onSaveDraft: () => void;
}

const DEVICES: { id: DeviceSize; icon: typeof Monitor; labelKey: string }[] = [
  { id: "desktop", icon: Monitor, labelKey: "studio.device.desktop" },
  { id: "tablet", icon: Tablet, labelKey: "studio.device.tablet" },
  { id: "mobile", icon: Smartphone, labelKey: "studio.device.mobile" },
];

export function PublishBar({ t, isDirty, isPublishing, isDiscarding, isSavingDraft, lastSavedAt, deviceSize, setDeviceSize, onPublish, onDiscard, onSaveDraft }: PublishBarProps) {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="flex h-12 items-center justify-between border-b border-border bg-background px-4">
      {/* Left: Back + Title */}
      <div className="flex items-center gap-3">
        <Link
          href="/settings"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          title={t("studio.backToSettings")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="h-5 w-px bg-border" />
        <h1 className="text-sm font-semibold text-foreground">{t("studio.title")}</h1>

        {/* Draft status indicator */}
        {isDirty ? (
          <div className="flex items-center gap-1.5 rounded-full bg-amber-500/10 px-2.5 py-0.5">
            <Circle className="h-1.5 w-1.5 fill-amber-500 text-amber-500" />
            <span className="text-[10px] font-medium text-amber-600 dark:text-amber-400">
              {t("studio.unsavedChanges")}
            </span>
          </div>
        ) : lastSavedAt ? (
          <div className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5">
            <Check className="h-2.5 w-2.5 text-emerald-500" />
            <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
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

      {/* Right: Publish/Discard */}
      <div className="flex items-center gap-2">
        {isDirty && (
          <>
            <button
              onClick={onSaveDraft}
              disabled={isSavingDraft}
              className="flex h-8 items-center gap-1.5 rounded-lg border border-primary/30 bg-primary/5 px-3 text-xs font-medium text-primary hover:bg-primary/10 transition-colors disabled:opacity-50"
            >
              {isSavingDraft ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
              {t("studio.saveDraft") || "Save Draft"}
            </button>
            <button
              onClick={onDiscard}
              disabled={isDiscarding}
              className="flex h-8 items-center gap-1.5 rounded-lg border border-border px-3 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors disabled:opacity-50"
            >
              {isDiscarding ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RotateCcw className="h-3.5 w-3.5" />}
              {t("studio.discard")}
            </button>
          </>
        )}
        <button
          onClick={onPublish}
          disabled={!isDirty || isPublishing}
          className="flex h-8 items-center gap-1.5 rounded-lg bg-primary px-4 text-xs font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPublishing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
          {t("studio.publish")}
        </button>
      </div>
    </div>
  );
}
