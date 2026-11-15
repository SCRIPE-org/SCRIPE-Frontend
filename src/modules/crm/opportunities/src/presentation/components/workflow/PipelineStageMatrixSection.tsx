"use client";

import React from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { Card } from "@core/ui/card";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { Badge } from "@core/ui/badge";
import { Checkbox } from "@core/ui/checkbox";
import { ArrowDown, ArrowUp, Layers, Save, ShieldCheck } from "lucide-react";
import { decodeCustomFieldName } from "@core/crud/customFieldsExtension";
import {
  PERMITTED_EXIT_FIELDS,
  type StageDraftState,
} from "../admin/PipelineAdminStageRow";
import type { CrmCustomFieldDefinition } from "@modules/crm";

export const CRM_PERMITTED_EXIT_FIELD_KEYS = PERMITTED_EXIT_FIELDS;

/** Props for PipelineStageMatrixSection. */
export interface PipelineStageMatrixSectionProps {
  pipelineNameEn: string; onPipelineNameEnChange: (val: string) => void;
  pipelineNameAr: string; onPipelineNameArChange: (val: string) => void;
  draftStages: StageDraftState[]; proposalSortOrder: number;
  canManagePipeline: boolean; isSubmitting: boolean; isRtl: boolean;
  opportunityCustomFields: Array<{ name: string; label?: string }>;
  crmCustomFields: CrmCustomFieldDefinition[];
  onSwapStageOrder: (index: number, direction: "up" | "down") => void;
  onFieldChange: (index: number, field: keyof StageDraftState, value: any) => void;
  onToggleExitField: (index: number, fieldKey: string) => void;
  onReset: () => void; onSubmit: (e: React.FormEvent) => void;
}

/**
 * Dynamic Stage & Exit Gate Matrix Form rendered in Classic Flow view inside SCRIPE Workflow Studio (<175 lines).
 */
export function PipelineStageMatrixSection({
  pipelineNameEn, onPipelineNameEnChange, pipelineNameAr, onPipelineNameArChange,
  draftStages, proposalSortOrder, canManagePipeline, isSubmitting, isRtl,
  opportunityCustomFields, crmCustomFields, onSwapStageOrder, onFieldChange,
  onToggleExitField, onReset, onSubmit,
}: PipelineStageMatrixSectionProps) {
  const { t } = useI18n();
  const customFieldMap = new Map<string, { key: string; label: string }>();
  for (const fc of opportunityCustomFields) {
    const rawKey = decodeCustomFieldName(fc.name) ?? fc.name;
    customFieldMap.set(rawKey, { key: rawKey, label: fc.label || rawKey });
  }
  for (const cf of crmCustomFields.filter((f) => f.entityTypeKey === "crm.opportunity")) {
    customFieldMap.set(cf.key, { key: cf.key, label: isRtl && cf.labelAr ? cf.labelAr : cf.labelEn });
  }
  const mergedCustomFields = Array.from(customFieldMap.values());

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Card className="p-4 bg-nx-surface border border-nx-line rounded-nx-lg grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-nx-ink">{t("crmOpportunities.pipelinesPage.pipelineNameEn")}</Label>
          <Input value={pipelineNameEn} onChange={(e) => onPipelineNameEnChange(e.target.value)} disabled={!canManagePipeline} className="h-9 text-xs" required />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-nx-ink">{t("crmOpportunities.pipelinesPage.pipelineNameAr")}</Label>
          <Input value={pipelineNameAr} onChange={(e) => onPipelineNameArChange(e.target.value)} disabled={!canManagePipeline} dir="rtl" className="h-9 text-xs" />
        </div>
      </Card>

      <div className="space-y-3">
        {draftStages.map((stage, idx) => {
          const isProposalOrLater = Number(stage.sortOrder) >= proposalSortOrder;
          return (
            <Card key={stage.stageKey} data-testid={`pipeline-page-stage-${stage.stageKey}`} className="rounded-nx-lg border border-nx-line bg-nx-surface p-4 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-nx-line pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="flex size-7 items-center justify-center rounded-full bg-nx-raised text-xs font-mono font-bold text-nx-ink border border-nx-line">
                    {stage.sortOrder}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-nx-ink">{isRtl && stage.labelAr ? stage.labelAr : stage.labelEn}</span>
                      {isProposalOrLater && (
                        <Badge variant="outline" className="text-[10px] gap-1 text-nx-accent border-nx-accent/30 bg-nx-accent-wash">
                          <ShieldCheck className="size-3" />{t("crmOpportunities.kanban.proposalGateBadge")}
                        </Badge>
                      )}
                    </div>
                    <span className="text-[11px] text-nx-ink-3 flex items-center gap-1">
                      <Layers className="size-3" /> #{stage.sortOrder} / {draftStages.length}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <Button type="button" variant="outline" size="sm" disabled={idx === 0 || !canManagePipeline} onClick={() => onSwapStageOrder(idx, "up")} className="h-7 px-2 text-xs gap-1">
                    <ArrowUp className="size-3.5" /><span>{t("crmOpportunities.pipelinesPage.moveUp")}</span>
                  </Button>
                  <Button type="button" variant="outline" size="sm" disabled={idx === draftStages.length - 1 || !canManagePipeline} onClick={() => onSwapStageOrder(idx, "down")} className="h-7 px-2 text-xs gap-1">
                    <ArrowDown className="size-3.5" /><span>{t("crmOpportunities.pipelinesPage.moveDown")}</span>
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="space-y-1.5 sm:col-span-2">
                  <Label className="text-xs font-medium text-nx-ink-2">{t("crmOpportunities.dialogs.pipelineAdmin.labelEn")}</Label>
                  <Input value={stage.labelEn} onChange={(e) => onFieldChange(idx, "labelEn", e.target.value)} disabled={!canManagePipeline} className="h-9 text-xs" required />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label className="text-xs font-medium text-nx-ink-2">{t("crmOpportunities.dialogs.pipelineAdmin.labelAr")}</Label>
                  <Input value={stage.labelAr} onChange={(e) => onFieldChange(idx, "labelAr", e.target.value)} disabled={!canManagePipeline} dir="rtl" className="h-9 text-xs" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-nx-ink-2">{t("crmOpportunities.dialogs.pipelineAdmin.sortOrder")}</Label>
                  <Input type="number" min={1} max={Math.max(20, draftStages.length)} value={stage.sortOrder} onChange={(e) => onFieldChange(idx, "sortOrder", parseInt(e.target.value, 10) || 1)} disabled={!canManagePipeline} className="h-9 text-xs font-mono" required />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-nx-ink-2">{t("crmOpportunities.dialogs.pipelineAdmin.winProbability")}</Label>
                  <Input type="number" min={0} max={100} value={stage.winProbabilityPercent} onChange={(e) => onFieldChange(idx, "winProbabilityPercent", e.target.value)} disabled={!canManagePipeline} className="h-9 text-xs font-mono" />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <Label className="text-xs font-medium text-nx-ink-2">{t("crmOpportunities.dialogs.pipelineAdmin.requiredExitFields")}</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    {PERMITTED_EXIT_FIELDS.map((fieldKey) => {
                      const isChecked = stage.requiredExitFields.includes(fieldKey);
                      const friendlyLabel = t(`crmOpportunities.dialogs.pipelineAdmin.exitFields.${fieldKey}`);
                      return (
                        <Label key={fieldKey} className="flex items-center gap-2 text-xs cursor-pointer select-none rounded-nx-sm border border-nx-line bg-nx-ground px-2.5 py-1.5 hover:border-nx-line-hi">
                          <Checkbox data-testid={`stage-${stage.stageKey}-exit-field-${fieldKey}`} checked={isChecked} disabled={!canManagePipeline} onCheckedChange={() => onToggleExitField(idx, fieldKey)} />
                          <span className="text-nx-ink">{friendlyLabel}</span>
                        </Label>
                      );
                    })}
                    {mergedCustomFields.map((cf) => {
                      const gateKey = `custom:${cf.key}`;
                      const isChecked = stage.requiredExitFields.includes(gateKey);
                      return (
                        <Label key={gateKey} className="flex items-center gap-2 text-xs cursor-pointer select-none rounded-nx-sm border border-nx-line bg-nx-ground px-2.5 py-1.5 hover:border-nx-line-hi">
                          <Checkbox data-testid={`stage-${stage.stageKey}-exit-field-${gateKey}`} checked={isChecked} disabled={!canManagePipeline} onCheckedChange={() => onToggleExitField(idx, gateKey)} />
                          <span className="text-nx-ink">{cf.label} <span className="text-[10px] text-nx-ink-3">{t("crmOpportunities.pipelinesPage.customFieldTag")}</span></span>
                        </Label>
                      );
                    })}
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {canManagePipeline && (
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onReset} disabled={isSubmitting}>{t("crmOpportunities.pipelinesPage.resetChanges")}</Button>
          <Button type="submit" disabled={isSubmitting} className="gap-2 font-bold">
            <Save className="size-4" />{isSubmitting ? t("crmOpportunities.dialogs.pipelineAdmin.saving") : t("crmOpportunities.pipelinesPage.savePipelineConfig")}
          </Button>
        </div>
      )}
    </form>
  );
}
