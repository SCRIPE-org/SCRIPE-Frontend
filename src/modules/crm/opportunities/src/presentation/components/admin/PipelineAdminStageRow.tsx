"use client";

import React from "react";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { Badge } from "@core/ui/badge";
import { Checkbox } from "@core/ui/checkbox";
import { ArrowDown, ArrowUp, ShieldCheck } from "lucide-react";

export const PERMITTED_EXIT_FIELDS = [
  "estimatedAmount",
  "targetCloseDate",
  "partyId",
  "primaryContactRole",
  "solutionFitConfirmed",
] as const;

export const EXIT_FIELD_LABELS: Record<string, { en: string; ar: string }> = {
  estimatedAmount: { en: "Estimated Deal Value", ar: "القيمة التقديرية للصفقة" },
  targetCloseDate: { en: "Target Close Date", ar: "تاريخ الإغلاق المستهدف" },
  partyId: { en: "Linked Account / Contact", ar: "ربط الحساب أو جهة الاتصال" },
  primaryContactRole: { en: "Primary Contact Role", ar: "دور جهة الاتصال الرئيسية" },
  solutionFitConfirmed: { en: "Solution Fit Confirmed", ar: "تأكيد ملاءمة الحل" },
};

export interface StageDraftState {
  stageKey: string;
  labelEn: string;
  labelAr: string;
  sortOrder: number;
  winProbabilityPercent: string;
  requiredExitFields: string[];
  expectedRowVersion?: string | null;
}

export interface PipelineAdminStageRowProps {
  t: (key: string, params?: Record<string, any>) => string;
  isRtl: boolean;
  stage: StageDraftState;
  idx: number;
  totalCount: number;
  isProposalOrLater: boolean;
  onFieldChange: (index: number, field: keyof StageDraftState, value: any) => void;
  onSwapStageOrder: (index: number, direction: "up" | "down") => void;
  onToggleExitField: (index: number, fieldKey: string) => void;
}

export function PipelineAdminStageRow({
  t,
  isRtl,
  stage,
  idx,
  totalCount,
  isProposalOrLater,
  onFieldChange,
  onSwapStageOrder,
  onToggleExitField,
}: PipelineAdminStageRowProps) {
  return (
    <div
      data-testid={`stage-config-row-${stage.stageKey}`}
      className="rounded-nx-lg border border-nx-line bg-nx-ground p-3.5 space-y-3"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-nx-line pb-2">
        <div className="flex items-center gap-2">
          <span className="flex size-6 items-center justify-center rounded-full bg-nx-raised text-xs font-mono font-bold text-nx-ink border border-nx-line">
            {stage.sortOrder}
          </span>
          <span className="text-xs font-bold text-nx-ink">
            {isRtl && stage.labelAr ? stage.labelAr : stage.labelEn}
          </span>
          {isProposalOrLater && (
            <Badge variant="outline" className="text-[10px] gap-1 text-nx-accent border-nx-accent/30">
              <ShieldCheck className="size-3" />
              {t("crmOpportunities.kanban.proposalGateBadge", { defaultValue: "Account / Contact Required" })}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="outline"
            size="icon"
            disabled={idx === 0}
            onClick={() => onSwapStageOrder(idx, "up")}
            className="size-6 p-0"
            title={t("crmOpportunities.pipelineAdmin.moveUp")}
          >
            <ArrowUp className="size-3" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            disabled={idx === totalCount - 1}
            onClick={() => onSwapStageOrder(idx, "down")}
            className="size-6 p-0"
            title={t("crmOpportunities.pipelineAdmin.moveDown")}
          >
            <ArrowDown className="size-3" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
        <div className="space-y-1 sm:col-span-2">
          <Label className="text-[11px] font-medium text-nx-ink-2">
            {t("crmOpportunities.dialogs.pipelineAdmin.labelEn", { defaultValue: "Stage Name (English)" })}
          </Label>
          <Input
            type="text"
            value={stage.labelEn}
            onChange={(e) => onFieldChange(idx, "labelEn", e.target.value)}
            placeholder="Stage label (EN)"
            className="h-8 text-xs"
            required
          />
        </div>

        <div className="space-y-1 sm:col-span-2">
          <Label className="text-[11px] font-medium text-nx-ink-2">
            {t("crmOpportunities.dialogs.pipelineAdmin.labelAr", { defaultValue: "Stage Name (Arabic)" })}
          </Label>
          <Input
            type="text"
            value={stage.labelAr}
            onChange={(e) => onFieldChange(idx, "labelAr", e.target.value)}
            placeholder="مسمى المرحلة (عربي)"
            dir="rtl"
            className="h-8 text-xs"
          />
        </div>

        <div className="space-y-1">
          <Label className="text-[11px] font-medium text-nx-ink-2">
            {t("crmOpportunities.dialogs.pipelineAdmin.sortOrder", { defaultValue: "Stage Position (1..5)" })}
          </Label>
          <Input
            type="number"
            min={1}
            max={5}
            value={stage.sortOrder}
            onChange={(e) => onFieldChange(idx, "sortOrder", parseInt(e.target.value, 10) || 1)}
            className="h-8 text-xs font-mono"
            required
          />
        </div>

        <div className="space-y-1">
          <Label className="text-[11px] font-medium text-nx-ink-2">
            {t("crmOpportunities.dialogs.pipelineAdmin.winProbability", { defaultValue: "Win Probability (%)" })}
          </Label>
          <Input
            type="number"
            min={0}
            max={100}
            value={stage.winProbabilityPercent}
            onChange={(e) => onFieldChange(idx, "winProbabilityPercent", e.target.value)}
            placeholder={t("crmOpportunities.pipelineAdmin.optionalPlaceholder")}
            className="h-8 text-xs font-mono"
          />
        </div>

        <div className="space-y-1 sm:col-span-2">
          <Label className="text-[11px] font-medium text-nx-ink-2">
            {t("crmOpportunities.dialogs.pipelineAdmin.requiredExitFields", { defaultValue: "Required Stage Gate Fields" })}
          </Label>
          <div className="flex flex-wrap gap-2.5 pt-1">
            {PERMITTED_EXIT_FIELDS.map((fieldKey) => {
              const isChecked = stage.requiredExitFields.includes(fieldKey);
              const friendlyLabel = EXIT_FIELD_LABELS[fieldKey]?.[isRtl ? "ar" : "en"] || fieldKey;
              return (
                <Label key={fieldKey} className="flex items-center gap-1.5 text-[11px] cursor-pointer select-none">
                  <Checkbox checked={isChecked} onCheckedChange={() => onToggleExitField(idx, fieldKey)} />
                  <span className="text-nx-ink-2">{friendlyLabel}</span>
                </Label>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
