"use client";

import React from "react";
import { SlidersHorizontal } from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
import { Button } from "@core/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@core/ui/dialog";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@core/ui/select";

export type KanbanSwimlaneMode = "none" | "assignee" | "account" | "dealType";

export interface StageWipLimit {
  min?: number;
  max?: number;
}

export interface BoardSettingsConfig {
  swimlaneMode: KanbanSwimlaneMode;
  wipLimits: Record<string, StageWipLimit>;
}

export interface BoardSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stages: Array<{ stageKey: string; labelEn: string; labelAr?: string | null }>;
  config: BoardSettingsConfig;
  onConfigChange: (updated: BoardSettingsConfig) => void;
}

/**
 * Jira-Grade Board Settings v2 Dialog (SCRIPE-756):
 * Configures Swimlanes (None, By Assignee, By Account, By Deal Type) and per-column Min/Max WIP Limits.
 */
export function BoardSettingsDialog({
  open,
  onOpenChange,
  stages,
  config,
  onConfigChange,
}: BoardSettingsDialogProps) {
  const { language } = useI18n();
  const isAr = language === "ar";

  const handleSwimlaneChange = (mode: KanbanSwimlaneMode) => {
    onConfigChange({
      ...config,
      swimlaneMode: mode,
    });
  };

  const handleWipLimitChange = (stageKey: string, bound: "min" | "max", rawValue: string) => {
    const parsed = rawValue.trim() === "" ? undefined : Math.max(0, Number(rawValue) || 0);
    const current = config.wipLimits[stageKey] ?? {};
    onConfigChange({
      ...config,
      wipLimits: {
        ...config.wipLimits,
        [stageKey]: {
          ...current,
          [bound]: parsed,
        },
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg border-nx-line bg-nx-surface text-nx-ink" data-testid="board-settings-dialog">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-sm font-bold text-nx-ink">
            <SlidersHorizontal className="w-4 h-4 text-nx-accent" />
            {isAr ? "إعدادات لوحة كانبان (WIP وخطوط التقسيم)" : "Board Settings — Columns, WIP Limits & Swimlanes"}
          </DialogTitle>
          <DialogDescription className="text-xs text-nx-ink-3">
            {isAr
              ? "حدد حدود العمل الجاري (Min / Max) لكل عمود، واختر طريقة تجميع الصفقات في خطوط تقسيم أفقية."
              : "Configure per-column Work-In-Progress (Min / Max) thresholds and horizontal swimlane grouping."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-nx-ink">
              {isAr ? "تجميع خطوط التقسيم (Swimlanes)" : "Swimlanes Grouping"}
            </Label>
            <Select value={config.swimlaneMode} onValueChange={(v) => handleSwimlaneChange(v as KanbanSwimlaneMode)}>
              <SelectTrigger className="h-8 text-xs" data-testid="board-swimlane-select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="z-[10002]">
                <SelectItem value="none" className="text-xs">{isAr ? "بدون تقسيم" : "None (Standard Columns)"}</SelectItem>
                <SelectItem value="assignee" className="text-xs">{isAr ? "حسب المسؤول" : "By Assignee"}</SelectItem>
                <SelectItem value="account" className="text-xs">{isAr ? "حسب الحساب / الشريك" : "By Account"}</SelectItem>
                <SelectItem value="dealType" className="text-xs">{isAr ? "حسب نوع الصفقة" : "By Deal Type / Currency"}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-semibold text-nx-ink block">
              {isAr ? "تعيين الحالات للأعمدة وحدود العمل الجاري (WIP Limits)" : "Status-to-Column Mapping & WIP Limits (Min / Max)"}
            </Label>
            <div className="space-y-1.5 max-h-[360px] overflow-y-auto pr-1">
              {[
                ...stages,
                ...(stages.some((s) => s.stageKey === "terminal-won" || s.stageKey.includes("won"))
                  ? []
                  : [{ stageKey: "terminal-won", labelEn: "Closed Won", labelAr: "مغلق ناجح" }]),
                ...(stages.some((s) => s.stageKey === "terminal-lost" || s.stageKey.includes("lost"))
                  ? []
                  : [{ stageKey: "terminal-lost", labelEn: "Closed Lost", labelAr: "مغلق خاسر" }]),
              ].map((st, idx) => {
                const limit = config.wipLimits[st.stageKey] ?? {};
                return (
                  <div
                    key={st.stageKey}
                    className="rounded-md border border-nx-line bg-nx-raised/40 px-3 py-1.5 flex items-center justify-between gap-3"
                    data-testid={`board-wip-row-${st.stageKey}`}
                  >
                    <div className="min-w-0 flex items-center gap-2">
                      <span className="inline-flex h-5 w-5 items-center justify-center rounded bg-nx-surface border border-nx-line text-[10px] font-mono text-nx-ink-2 shrink-0">
                        {idx + 1}
                      </span>
                      <div className="min-w-0">
                        <span className="text-xs font-semibold text-nx-ink block truncate">
                          {isAr && st.labelAr ? st.labelAr : st.labelEn}
                        </span>
                        <span className="text-[10px] font-mono text-nx-ink-3 block truncate">
                          Status: {st.stageKey} → Column #{idx + 1}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] font-mono text-nx-ink-3">Min</span>
                        <Input
                          type="number"
                          min={0}
                          value={limit.min ?? ""}
                          onChange={(e) => handleWipLimitChange(st.stageKey, "min", e.target.value)}
                          placeholder="0"
                          className="h-7 w-14 text-xs font-mono"
                          data-testid={`board-wip-min-${st.stageKey}`}
                        />
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] font-mono text-nx-ink-3">Max</span>
                        <Input
                          type="number"
                          min={0}
                          value={limit.max ?? ""}
                          onChange={(e) => handleWipLimitChange(st.stageKey, "max", e.target.value)}
                          placeholder="—"
                          className="h-7 w-14 text-xs font-mono"
                          data-testid={`board-wip-max-${st.stageKey}`}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button size="sm" onClick={() => onOpenChange(false)} data-testid="board-settings-done-btn">
            {isAr ? "تم" : "Done"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
