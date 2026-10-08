"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@core/ui/dialog";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { Badge } from "@core/ui/badge";
import { useI18n } from "@core/providers/i18n-provider";
import type {
  TenantOverviewWidgetItem,
  TenantWidgetColSpan,
} from "./tenantCustomizationTypes";
import {
  getWidgetDefinition,
  clampColSpan,
} from "./tenantWidgetRegistry";

interface TenantWidgetSettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  widgetItem: TenantOverviewWidgetItem | null;
  onSave: (
    widgetInstanceId: string,
    updates: {
      customTitle?: string;
      colSpan: TenantWidgetColSpan;
      settings?: Record<string, unknown>;
    }
  ) => void;
}

const AVAILABLE_SPANS: { span: TenantWidgetColSpan; label: string; fraction: string }[] = [
  { span: 3, label: "1/4 Width", fraction: "3 cols" },
  { span: 4, label: "1/3 Width", fraction: "4 cols" },
  { span: 6, label: "1/2 Width", fraction: "6 cols" },
  { span: 8, label: "2/3 Width", fraction: "8 cols" },
  { span: 12, label: "Full Width", fraction: "12 cols" },
];

export function TenantWidgetSettingsDialog({
  isOpen,
  onClose,
  widgetItem,
  onSave,
}: TenantWidgetSettingsDialogProps) {
  const { t } = useI18n();

  const [customTitle, setCustomTitle] = useState("");
  const [colSpan, setColSpan] = useState<TenantWidgetColSpan>(12);

  const definition = widgetItem ? getWidgetDefinition(widgetItem.widgetId) : undefined;

  useEffect(() => {
    if (widgetItem) {
      setCustomTitle(widgetItem.customTitle || "");
      setColSpan(widgetItem.colSpan);
    }
  }, [widgetItem]);

  if (!widgetItem || !definition) {
    return null;
  }

  const handleApply = () => {
    const finalSpan = clampColSpan(widgetItem.widgetId, colSpan);
    onSave(widgetItem.id, {
      customTitle: customTitle.trim() ? customTitle.trim() : undefined,
      colSpan: finalSpan,
    });
    onClose();
  };

  const defaultTitle = t(definition.titleKey) || definition.id;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <DialogTitle className="text-base font-bold">
              {t("tenantCommandCenter.settings.configureWidget") || "Configure Widget"}
            </DialogTitle>
            <Badge variant="outline" className="capitalize text-[10px]">
              {definition.category}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            {t(definition.descriptionKey) || "Configure presentation and grid settings for this widget."}
          </p>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Custom Display Title */}
          <div className="space-y-1.5">
            <Label htmlFor="widget-title" className="text-xs font-semibold">
              {t("tenantCommandCenter.settings.displayTitle") || "Display Title"}
            </Label>
            <div className="flex items-center gap-2">
              <Input
                id="widget-title"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                placeholder={defaultTitle}
                className="h-9 text-xs"
              />
              {customTitle && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setCustomTitle("")}
                  className="h-9 text-xs"
                >
                  {t("tenantCommandCenter.settings.resetTitle") || "Reset"}
                </Button>
              )}
            </div>
            <p className="text-[11px] text-muted-foreground">
              {t("tenantCommandCenter.settings.titleHelp") ||
                "Leave blank to use the default title."}
            </p>
          </div>

          {/* Column Span Width */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold">
              {t("tenantCommandCenter.settings.columnWidth") || "Grid Width"}
            </Label>
            <div className="grid grid-cols-5 gap-1.5">
              {AVAILABLE_SPANS.map(({ span, label, fraction }) => {
                const isAllowed =
                  span >= definition.minColSpan && span <= definition.maxColSpan;
                const isSelected = colSpan === span;

                return (
                  <button
                    key={span}
                    type="button"
                    disabled={!isAllowed}
                    onClick={() => setColSpan(span)}
                    className={`flex flex-col items-center justify-center rounded-lg border p-2 text-center transition-all ${
                      isSelected
                        ? "border-primary bg-primary/10 text-primary font-bold shadow-xs"
                        : isAllowed
                        ? "border-border bg-card text-foreground hover:bg-accent/60"
                        : "cursor-not-allowed border-border/40 bg-muted/20 text-muted-foreground/40"
                    }`}
                  >
                    <span className="text-xs">{label}</span>
                    <span className="text-[10px] text-muted-foreground">{fraction}</span>
                  </button>
                );
              })}
            </div>
            <p className="text-[11px] text-muted-foreground">
              {t("tenantCommandCenter.settings.widthHelp") ||
                "Controls how many columns this widget occupies on a 12-column desktop layout."}
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            {t("common.cancel") || "Cancel"}
          </Button>
          <Button type="button" size="sm" onClick={handleApply}>
            {t("common.save") || "Save Settings"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
