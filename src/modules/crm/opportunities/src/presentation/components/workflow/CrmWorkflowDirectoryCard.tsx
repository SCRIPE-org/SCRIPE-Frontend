"use client";

import React from "react";
import { CheckCircle2, Copy, GitBranch, Layers, Maximize2, Trash2 } from "lucide-react";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { Card } from "@core/ui/card";
import type { CrmWorkflowDefinition, CrmWorkflowEntityType } from "@modules/crm";

export interface CrmWorkflowDirectoryCardProps {
  t: (k: string) => string;
  isAr: boolean;
  wf: CrmWorkflowDefinition;
  isActive: boolean;
  onOpenStudioForWorkflow: (workflowId: string) => void;
  onCloneWorkflow: (workflowId: string) => void;
  onActivateWorkflow: (entityType: CrmWorkflowEntityType, workflowId: string) => void;
  onDeleteWorkflow: (workflowId: string) => void;
}

/**
 * Pure declarative Workflow Directory Card component (<140 lines).
 */
export function CrmWorkflowDirectoryCard({
  t,
  isAr,
  wf,
  isActive,
  onOpenStudioForWorkflow,
  onCloneWorkflow,
  onActivateWorkflow,
  onDeleteWorkflow,
}: CrmWorkflowDirectoryCardProps) {
  const orderedStages = [...wf.stages].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <Card
      data-testid={`workflow-card-${wf.id}`}
      className="border border-nx-line bg-nx-surface hover:border-nx-line-hi transition-colors p-4 flex flex-col justify-between gap-4"
    >
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <Badge variant={wf.entityType === "deal" ? "info" : "warning"} className="text-[10px]">
                {wf.entityType === "deal"
                  ? t("crmOpportunities.pipelinesPage.entityBadgeDeal")
                  : t("crmOpportunities.pipelinesPage.entityBadgeLead")}
              </Badge>
              {isActive ? (
                <Badge variant="success" className="text-[10px]">
                  <CheckCircle2 className="w-2.5 h-2.5 me-1" />
                  {t("crmOpportunities.pipelinesPage.activeInKanbanBadge")}
                </Badge>
              ) : (
                <Badge variant="outline" className="text-[10px] text-nx-ink-2">
                  {t("crmOpportunities.pipelinesPage.templateDraftBadge")}
                </Badge>
              )}
              <span className="text-[10px] font-mono text-nx-ink-3">
                v{wf.version} · {wf.code}
              </span>
            </div>
            <h2 className="text-sm font-bold text-nx-ink">{isAr ? wf.nameAr : wf.nameEn}</h2>
            <p className="text-xs text-nx-ink-2 line-clamp-2">
              {isAr ? wf.descriptionAr : wf.descriptionEn}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          {orderedStages.map((st, idx) => (
            <span
              key={st.stageKey}
              className="inline-flex items-center gap-1 rounded border border-nx-line bg-nx-raised px-2 py-0.5 text-[11px] font-medium text-nx-ink"
            >
              <span className="font-mono text-[10px] text-nx-ink-3">{idx + 1}.</span>
              {isAr ? st.labelAr : st.labelEn}
            </span>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-nx-line">
        <div className="flex items-center gap-3 text-[11px] text-nx-ink-2 font-mono">
          <span className="inline-flex items-center gap-1">
            <Layers className="w-3 h-3 text-nx-ink-3" />
            {wf.stages.length} {t("crmOpportunities.pipelinesPage.statusesCountSuffix")}
          </span>
          <span className="inline-flex items-center gap-1">
            <GitBranch className="w-3 h-3 text-nx-ink-3" />
            {wf.transitions.length} {t("crmOpportunities.pipelinesPage.transitionsCountSuffix")}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <Button
            size="sm"
            variant="outline"
            className="h-7 px-2.5 text-xs"
            onClick={() => onOpenStudioForWorkflow(wf.id)}
            data-testid={`workflow-edit-studio-${wf.id}`}
          >
            <Maximize2 className="w-3 h-3 me-1.5" />
            {t("crmOpportunities.pipelinesPage.openFullScreenStudioBtn")}
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-7 px-2 text-xs"
            onClick={() => onCloneWorkflow(wf.id)}
            data-testid={`workflow-clone-${wf.id}`}
            title={t("crmOpportunities.pipelinesPage.cloneBtn")}
          >
            <Copy className="w-3 h-3" />
          </Button>
          {!isActive && (
            <Button
              size="sm"
              variant="outline"
              className="h-7 px-2.5 text-xs"
              onClick={() => onActivateWorkflow(wf.entityType, wf.id)}
              data-testid={`workflow-set-active-${wf.id}`}
            >
              {t("crmOpportunities.pipelinesPage.setActiveBtn")}
            </Button>
          )}
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7 text-destructive"
            disabled={isActive}
            onClick={() => onDeleteWorkflow(wf.id)}
            data-testid={`workflow-delete-${wf.id}`}
            title={
              isActive
                ? t("crmOpportunities.pipelinesPage.cannotDeleteActiveTitle")
                : t("crmOpportunities.pipelinesPage.deleteWorkflowTitle")
            }
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
