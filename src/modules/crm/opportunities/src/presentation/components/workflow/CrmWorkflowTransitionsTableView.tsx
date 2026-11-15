"use client";

import React from "react";
import { Plus, ShieldCheck, Zap } from "lucide-react";
import { Button } from "@core/ui/button";
import { Badge } from "@core/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@core/ui/table";
import type { CrmCustomFieldDefinition } from "@modules/crm";
import type { CrmWorkflowStageNode, CrmWorkflowTransition } from "./CrmWorkflowCanvas2D";
import { countTransitionRules, formatExitFieldLabel } from "./CrmWorkflowCanvasSubViews";

export interface CrmWorkflowTransitionsTableViewProps {
  t: (k: string) => string;
  isAr: boolean;
  stages: CrmWorkflowStageNode[];
  transitions: CrmWorkflowTransition[];
  selectedTransitionId: string | null;
  crmCustomFields: CrmCustomFieldDefinition[];
  onSelectTransition: (id: string) => void;
  onOpenAddTransition: () => void;
}

/**
 * Pure declarative Transitions Matrix Table View for Text mode in the 2D Workflow Studio (<150 lines).
 */
export function CrmWorkflowTransitionsTableView({
  t,
  isAr,
  stages,
  transitions,
  selectedTransitionId,
  crmCustomFields,
  onSelectTransition,
  onOpenAddTransition,
}: CrmWorkflowTransitionsTableViewProps) {
  const stageLabel = (key: string) => {
    if (key === "*") return t("crmOpportunities.pipelinesPage.anyStageGlobal");
    const found = stages.find((s) => s.stageKey === key);
    return found ? (isAr ? found.labelAr : found.labelEn) : key;
  };

  return (
    <div className="flex-1 overflow-auto bg-nx-ground p-6 space-y-4" data-testid="workflow-text-mode-table">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-nx-ink">
            {t("crmOpportunities.pipelinesPage.transitionsMatrixTitle")}
          </h3>
          <p className="text-xs text-nx-ink-2">
            {t("crmOpportunities.pipelinesPage.transitionsMatrixSubtitle")}
          </p>
        </div>
        <Button size="sm" onClick={onOpenAddTransition}>
          <Plus className="w-3.5 h-3.5 me-1.5" />
          {t("crmOpportunities.pipelinesPage.addTransitionBtn")}
        </Button>
      </div>

      <div className="rounded-md border border-nx-line bg-nx-surface overflow-hidden">
        <Table className="w-full text-xs">
          <TableHeader className="bg-nx-raised border-b border-nx-line text-nx-ink-2 uppercase tracking-wider text-[10px]">
            <TableRow>
              <TableHead className="text-start px-3.5 py-2.5">{t("crmOpportunities.pipelinesPage.colTransitionName")}</TableHead>
              <TableHead className="text-start px-3.5 py-2.5">{t("crmOpportunities.pipelinesPage.colFromStatus")}</TableHead>
              <TableHead className="text-start px-3.5 py-2.5">{t("crmOpportunities.pipelinesPage.colToStatus")}</TableHead>
              <TableHead className="text-start px-3.5 py-2.5">{t("crmOpportunities.pipelinesPage.colRulesValidators")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-nx-line">
            {transitions.map((tr) => {
              const isSelected = selectedTransitionId === tr.id;
              return (
                <TableRow
                  key={tr.id}
                  onClick={() => onSelectTransition(tr.id)}
                  className={`cursor-pointer transition-colors ${isSelected ? "bg-nx-raised" : "hover:bg-nx-raised/60"}`}
                >
                  <TableCell className="px-3.5 py-2.5 font-semibold text-nx-ink">
                    <span className="inline-flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-nx-warning-strong shrink-0" />
                      {isAr ? tr.nameAr : tr.nameEn}
                    </span>
                  </TableCell>
                  <TableCell className="px-3.5 py-2.5 text-nx-ink-2 font-medium">
                    {tr.fromStageKeys && tr.fromStageKeys.length > 1 ? (
                      <div className="flex flex-wrap gap-1">
                        {tr.fromStageKeys.map((fk) => (
                          <Badge key={fk} variant="outline" className="text-[10px]">
                            {stageLabel(fk)}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      stageLabel(tr.fromStageKey)
                    )}
                  </TableCell>
                  <TableCell className="px-3.5 py-2.5 text-nx-ink font-semibold">{stageLabel(tr.toStageKey)}</TableCell>
                  <TableCell className="px-3.5 py-2.5">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {tr.requireReason && (
                        <Badge variant="warning" className="text-[10px]">
                          {t("crmOpportunities.pipelinesPage.badgeModalReason")}
                        </Badge>
                      )}
                      {tr.requireNote && (
                        <Badge variant="info" className="text-[10px]">
                          {t("crmOpportunities.pipelinesPage.badgeAuditNote")}
                        </Badge>
                      )}
                      {tr.requiredFields.map((fk) => (
                        <Badge key={fk} variant="outline" className="text-[10px] text-nx-ink">
                          <ShieldCheck className="w-2.5 h-2.5 me-1 text-info" />
                          {formatExitFieldLabel(fk, t, isAr, crmCustomFields)}
                        </Badge>
                      ))}
                      {(tr.catalogRules ?? []).map((cr) => (
                        <Badge key={cr.id} variant="outline" className="text-[10px] text-nx-ink">
                          <ShieldCheck className="w-2.5 h-2.5 me-1 text-primary" />
                          {isAr ? cr.titleAr : cr.titleEn}
                        </Badge>
                      ))}
                      {countTransitionRules(tr) === 0 && (
                        <span className="text-nx-ink-3">
                          {t("crmOpportunities.pipelinesPage.badgeUnrestricted")}
                        </span>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
