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
    <div className="flex flex-col gap-3 border-b border-border/60 pb-2 sm:flex-row sm:items-center sm:justify-between">
      {/* Left: Breadcrumb, Tenant Badge, and Edit Mode Indicator */}
      <div className="flex flex-wrap items-center gap-2.5">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{t("tenantCommandCenter.administration")}</span>
          <span className="rtl:rotate-180">›</span>
          <b className="text-foreground">{t("tenantCommandCenter.overview")}</b>
        </div>
        <div className="hidden h-3.5 w-px bg-border sm:block" />
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className="gap-1.5 bg-muted/40 px-2 py-0.5 text-xs font-semibold"
          >
            <Building2 className="h-3 w-3 text-primary" />
            <span>{tenantName}</span>
          </Badge>
          {isImpersonating && (
            <Badge variant="secondary" className="text-[10px]">
              {t("tenantCommandCenter.platformDrillDown")}
            </Badge>
          )}
          {isEditing && (
            <Badge
              variant="outline"
              className="gap-1 border-primary/40 bg-primary/10 text-primary text-[10px] font-semibold animate-pulse"
            >
              <span>{t("tenantCommandCenter.customization.editingLayout") || "Customizing Layout"}</span>
            </Badge>
          )}
          {isEditing && hasUnsavedChanges && (
            <Badge
              variant="outline"
              className="border-amber-500/40 bg-amber-500/10 text-amber-500 text-[10px] font-medium"
            >
              <span>{t("tenantCommandCenter.customization.unsavedChanges") || "Unsaved Changes"}</span>
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
                className="h-8 gap-1.5 border-border bg-card px-2.5 text-xs font-semibold shadow-xs hover:bg-accent"
              >
                <Plus className="h-3.5 w-3.5 text-primary" />
                <span>{t("tenantCommandCenter.library.addWidget") || "Add Widget"}</span>
              </Button>
            )}

            {onRestoreDefault && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onRestoreDefault}
                className="h-8 gap-1.5 px-2 text-xs text-muted-foreground hover:text-foreground"
                title={t("tenantCommandCenter.customization.restoreDefaultTooltip") || "Reset to system default"}
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
                className="h-8 gap-1 px-2.5 text-xs text-muted-foreground hover:text-foreground"
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
                className="h-8 gap-1.5 px-3 text-xs font-semibold shadow-xs"
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
                className="h-8 gap-1.5 border-border bg-card px-2.5 text-xs font-semibold shadow-xs text-muted-foreground hover:text-foreground hover:bg-accent"
                title={t("tenantCommandCenter.customization.customizeTooltip") || "Customize overview widgets and grid"}
              >
                <SlidersHorizontal className="h-3.5 w-3.5 text-primary" />
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
                  ? t("tenantCommandCenter.switchToLiveTooltip") || "Switch to live backend telemetry"
                  : t("tenantCommandCenter.switchToDemoTooltip") ||
                    "Switch to presentation showcase mode"
              }
              className={`shadow-xs h-8 cursor-pointer gap-1.5 border px-2.5 text-xs font-semibold transition-colors ${
                isPresentationMode
                  ? "border-amber-500/30 bg-amber-500/10 text-amber-500 hover:bg-amber-500/20"
                  : "border-border bg-card text-muted-foreground hover:text-foreground"
              }`}
            >
              <Sparkles
                className={`h-3 w-3 ${isPresentationMode ? "fill-amber-500/30 text-amber-500" : "text-muted-foreground"}`}
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
                className="h-8 w-8 rounded-lg border-border bg-card p-0 text-muted-foreground hover:bg-accent hover:text-foreground"
              >
                <RotateCw
                  className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin text-primary" : ""}`}
                />
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
