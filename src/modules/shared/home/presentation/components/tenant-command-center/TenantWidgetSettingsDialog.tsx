"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@core/ui/dialog";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { Badge } from "@core/ui/badge";
import { useI18n } from "@core/providers/i18n-provider";
import type {
  TenantOverviewWidgetItem,
  TenantWidgetColSpan,
  TenantWidgetDefinition,
} from "./tenantCustomizationTypes";
import { getWidgetDefinition, clampColSpan } from "./tenantWidgetRegistry";

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

function WidgetSettingsForm({
  widgetItem,
  definition,
  onSave,
  onClose,
}: {
  widgetItem: TenantOverviewWidgetItem;
  definition: TenantWidgetDefinition;
  onSave: TenantWidgetSettingsDialogProps["onSave"];
  onClose: () => void;
}) {
  const { t } = useI18n();
  const [customTitle, setCustomTitle] = useState(widgetItem.customTitle || "");
  const [colSpan, setColSpan] = useState<TenantWidgetColSpan>(widgetItem.colSpan);

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
    <>
      <DialogHeader>
        <div className="flex items-center gap-2">
          <DialogTitle className="text-base font-bold text-nx-ink">
            {t("tenantCommandCenter.settings.configureWidget") || "Configure Widget"}
          </DialogTitle>
          <Badge variant="outline" className="border-nx-line text-[10px] capitalize text-nx-ink-3">
            {definition.category}
          </Badge>
        </div>
        <p className="text-xs text-nx-ink-3">
          {t(definition.descriptionKey) ||
            "Configure presentation and grid settings for this widget."}
        </p>
      </DialogHeader>

      <div className="space-y-4 py-2">
        {/* Custom Display Title */}
        <div className="space-y-1.5">
          <Label htmlFor="widget-title" className="text-xs font-semibold text-nx-ink">
            {t("tenantCommandCenter.settings.displayTitle") || "Display Title"}
          </Label>
          <div className="flex items-center gap-2">
            <Input
              id="widget-title"
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              placeholder={defaultTitle}
              className="h-9 border-nx-line bg-nx-surface text-xs text-nx-ink"
            />
            {customTitle && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setCustomTitle("")}
                className="h-9 text-xs text-nx-ink-3 hover:text-nx-ink"
              >
                {t("tenantCommandCenter.settings.resetTitle") || "Reset"}
              </Button>
            )}
          </div>
          <p className="text-[11px] text-nx-ink-3">
            {t("tenantCommandCenter.settings.titleHelp") || "Leave blank to use the default title."}
          </p>
        </div>

        {/* Column Span Width */}
        <div className="space-y-2">
          <Label className="text-xs font-semibold text-nx-ink">
            {t("tenantCommandCenter.settings.columnWidth") || "Grid Width"}
          </Label>
          <div className="grid grid-cols-5 gap-1.5">
            {AVAILABLE_SPANS.map(({ span, label, fraction }) => {
              const isAllowed = span >= definition.minColSpan && span <= definition.maxColSpan;
              const isSelected = colSpan === span;

              return (
                <button
                  key={span}
                  type="button"
                  disabled={!isAllowed}
                  onClick={() => setColSpan(span)}
                  className={`flex flex-col items-center justify-center rounded-nx-md border p-2 text-center transition-all ${
                    isSelected
                      ? "border-nx-accent bg-nx-accent-wash font-semibold text-nx-accent"
                      : isAllowed
                        ? "border-nx-line bg-nx-surface text-nx-ink hover:border-nx-line-hi hover:bg-nx-raised"
                        : "border-nx-line/40 bg-nx-raised/20 text-nx-ink-3/40 cursor-not-allowed"
                  }`}
                >
                  <span className="text-xs">{label}</span>
                  <span className="text-[10px] text-nx-ink-3">{fraction}</span>
                </button>
              );
            })}
          </div>
          <p className="text-[11px] text-nx-ink-3">
            {t("tenantCommandCenter.settings.widthHelp") ||
              "Controls how many columns this widget occupies on a 12-column desktop layout."}
          </p>
        </div>
      </div>

      <DialogFooter className="gap-2 sm:gap-0">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onClose}
          className="border-nx-line"
        >
          {t("common.cancel") || "Cancel"}
        </Button>
        <Button type="button" size="sm" onClick={handleApply}>
          {t("common.save") || "Save Settings"}
        </Button>
      </DialogFooter>
    </>
  );
}

export function TenantWidgetSettingsDialog({
  isOpen,
  onClose,
  widgetItem,
  onSave,
}: TenantWidgetSettingsDialogProps) {
  const definition = widgetItem ? getWidgetDefinition(widgetItem.widgetId) : undefined;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md border-nx-line bg-nx-surface text-nx-ink sm:max-w-lg">
        {widgetItem && definition ? (
          <WidgetSettingsForm
            key={widgetItem.id}
            widgetItem={widgetItem}
            definition={definition}
            onSave={onSave}
            onClose={onClose}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
