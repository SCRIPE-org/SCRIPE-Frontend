"use client";

import React from "react";
import {
  Sparkles,
  RotateCw,
  Building2,
  SlidersHorizontal,
  Plus,
  RotateCcw,
  Check,
  X,
  Loader2,
} from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
import { Button } from "@core/ui/button";
import { Badge } from "@core/ui/badge";
import { usePresentationMode } from "../../viewmodels/usePresentationMode";

interface TenantCommandHeaderProps {
  tenantName: string;
  isImpersonating?: boolean;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  // Customization capabilities
  canCustomize?: boolean;
  isEditing?: boolean;
  hasUnsavedChanges?: boolean;
  isSaving?: boolean;
  onEnterEditMode?: () => void;
  onCancelEditMode?: () => void;
  onSaveLayout?: () => void;
  onRestoreDefault?: () => void;
  onOpenLibrary?: () => void;
}

export function TenantCommandHeader({
  tenantName,
  isImpersonating = false,
  onRefresh,
  isRefreshing = false,
  canCustomize = true,
  isEditing = false,
  hasUnsavedChanges = false,
  isSaving = false,
  onEnterEditMode,
  onCancelEditMode,
  onSaveLayout,
  onRestoreDefault,
  onOpenLibrary,
}: TenantCommandHeaderProps) {
  const { t } = useI18n();
  const { isPresentationMode, togglePresentationMode } = usePresentationMode();

  return (
    <div className="flex flex-col gap-3 border-b border-nx-line pb-3 sm:flex-row sm:items-center sm:justify-between">
      {/* Left: Breadcrumb, Tenant Badge, and Edit Mode Indicator */}
      <div className="flex flex-wrap items-center gap-2.5">
        <div className="flex items-center gap-2 text-xs text-nx-ink-3">
          <span>{t("tenantCommandCenter.administration")}</span>
          <span className="rtl:rotate-180">›</span>
          <b className="text-nx-ink">{t("tenantCommandCenter.overview")}</b>
        </div>
        <div className="hidden h-3.5 w-px bg-nx-line sm:block" />
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className="gap-1.5 border-nx-line bg-nx-raised px-2.5 py-0.5 text-xs font-semibold text-nx-ink"
          >
            <Building2 className="h-3 w-3 text-nx-accent" />
            <span>{tenantName}</span>
          </Badge>
          {isImpersonating && (
            <Badge variant="secondary" className="border-nx-line text-[10px] text-nx-ink-3">
              {t("tenantCommandCenter.platformDrillDown")}
            </Badge>
          )}
          {isEditing && (
            <Badge
              variant="outline"
              className="border-nx-accent/40 animate-pulse gap-1 bg-nx-accent-wash text-[10px] font-semibold text-nx-accent"
            >
              <span>
                {t("tenantCommandCenter.customization.editingLayout") || "Customizing Layout"}
              </span>
            </Badge>
          )}
          {isEditing && hasUnsavedChanges && (
            <Badge
              variant="outline"
              className="border-warning/40 bg-warning/10 text-[10px] font-medium text-warning"
            >
              <span>
                {t("tenantCommandCenter.customization.unsavedChanges") || "Unsaved Changes"}
              </span>
            </Badge>
          )}
        </div>
      </div>

      {/* Right: Actions Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        {isEditing ? (
          // ── Edit Mode Actions ──────────────────────────────────────────────────
          <>
            {onOpenLibrary && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onOpenLibrary}
                className="h-8 gap-1.5 border-nx-line bg-nx-surface px-2.5 text-xs font-semibold text-nx-ink hover:border-nx-line-hi hover:bg-nx-raised"
              >
                <Plus className="h-3.5 w-3.5 text-nx-accent" />
                <span>{t("tenantCommandCenter.library.addWidget") || "Add Widget"}</span>
              </Button>
            )}

            {onRestoreDefault && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onRestoreDefault}
                className="h-8 gap-1.5 px-2 text-xs text-nx-ink-3 hover:bg-nx-raised hover:text-nx-ink"
                title={
                  t("tenantCommandCenter.customization.restoreDefaultTooltip") ||
                  "Reset to system default"
                }
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">
                  {t("tenantCommandCenter.customization.restoreDefault") || "Reset"}
                </span>
              </Button>
            )}

            {onCancelEditMode && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onCancelEditMode}
                disabled={isSaving}
                className="h-8 gap-1 border-nx-line px-2.5 text-xs text-nx-ink-3 hover:bg-nx-raised hover:text-nx-ink"
              >
                <X className="h-3.5 w-3.5" />
                <span>{t("common.cancel") || "Cancel"}</span>
              </Button>
            )}

            {onSaveLayout && (
              <Button
                type="button"
                size="sm"
                onClick={onSaveLayout}
                disabled={isSaving}
                className="h-8 gap-1.5 px-3 text-xs font-semibold"
              >
                {isSaving ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Check className="h-3.5 w-3.5" />
                )}
                <span>
                  {isSaving
                    ? t("common.saving") || "Saving..."
                    : t("tenantCommandCenter.customization.saveLayout") || "Save Layout"}
                </span>
              </Button>
            )}
          </>
        ) : (
          // ── View Mode Actions ──────────────────────────────────────────────────
          <>
            {canCustomize && onEnterEditMode && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onEnterEditMode}
                className="h-8 gap-1.5 border-nx-line bg-nx-surface px-2.5 text-xs font-semibold text-nx-ink hover:border-nx-line-hi hover:bg-nx-raised"
                title={
                  t("tenantCommandCenter.customization.customizeTooltip") ||
                  "Customize overview widgets and grid"
                }
              >
                <SlidersHorizontal className="h-3.5 w-3.5 text-nx-accent" />
                <span>
                  {t("tenantCommandCenter.customization.customizeButton") || "Customize Dashboard"}
                </span>
              </Button>
            )}

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={togglePresentationMode}
              title={
                isPresentationMode
                  ? t("tenantCommandCenter.switchToLiveTooltip") ||
                    "Switch to live backend telemetry"
                  : t("tenantCommandCenter.switchToDemoTooltip") ||
                    "Switch to presentation showcase mode"
              }
              className={`h-8 cursor-pointer gap-1.5 border px-2.5 text-xs font-semibold transition-colors ${
                isPresentationMode
                  ? "border-warning/30 bg-warning/10 text-warning hover:bg-warning/20"
                  : "border-nx-line bg-nx-surface text-nx-ink-3 hover:border-nx-line-hi hover:bg-nx-raised hover:text-nx-ink"
              }`}
            >
              <Sparkles
                className={`h-3 w-3 ${isPresentationMode ? "fill-warning/30 text-warning" : "text-nx-ink-3"}`}
              />
              <span>
                {isPresentationMode
                  ? t("tenantCommandCenter.demoMode")
                  : t("tenantCommandCenter.liveData")}
              </span>
            </Button>

            {onRefresh && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onRefresh}
                title={t("tenantCommandCenter.refreshTooltip") || "Refresh organization data"}
                className="h-8 w-8 rounded-nx-md border-nx-line bg-nx-surface p-0 text-nx-ink-3 hover:border-nx-line-hi hover:bg-nx-raised hover:text-nx-ink"
              >
                <RotateCw
                  className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin text-nx-accent" : ""}`}
                />
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
