"use client";

import React from "react";
import {
  CheckCircle2,
  Copy,
  GitBranch,
  Layers,
  Maximize2,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { Card } from "@core/ui/card";
import { Input } from "@core/ui/input";
import type { CrmWorkflowDefinition, CrmWorkflowEntityType } from "@modules/crm";

export interface CrmWorkflowsDirectorySectionProps {
  t: (k: string) => string;
  isAr: boolean;
  workflows: CrmWorkflowDefinition[];
  activeDealWorkflowId: string;
  activeLeadWorkflowId: string;
  directoryFilter: "all" | CrmWorkflowEntityType;
  setDirectoryFilter: (filter: "all" | CrmWorkflowEntityType) => void;
  directorySearch: string;
  setDirectorySearch: (search: string) => void;
  filteredDirectoryWorkflows: CrmWorkflowDefinition[];
  onOpenCreateWorkflow: (entityType: CrmWorkflowEntityType) => void;
  onOpenStudioForWorkflow: (workflowId: string) => void;
  onCloneWorkflow: (workflowId: string) => void;
  onActivateWorkflow: (entityType: CrmWorkflowEntityType, workflowId: string) => void;
  onDeleteWorkflow: (workflowId: string) => void;
}

export function CrmWorkflowsDirectorySection({
  t,
  isAr,
  workflows,
  activeDealWorkflowId,
  activeLeadWorkflowId,
  directoryFilter,
  setDirectoryFilter,
  directorySearch,
  setDirectorySearch,
  filteredDirectoryWorkflows,
  onOpenCreateWorkflow,
  onOpenStudioForWorkflow,
  onCloneWorkflow,
  onActivateWorkflow,
  onDeleteWorkflow,
}: CrmWorkflowsDirectorySectionProps) {
  const dealCount = workflows.filter((w) => w.entityType === "deal").length;
  const leadCount = workflows.filter((w) => w.entityType === "lead").length;

  return (
    <div className="space-y-6" data-testid="crm-pipelines-list-page">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-lg border border-nx-line bg-nx-surface p-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[10px] font-mono uppercase">
              {t("crmOpportunities.pipelinesPage.directoryEyebrow")}
            </Badge>
            <Badge variant="secondary" className="text-[10px] font-mono">
              {dealCount} {t("crmOpportunities.pipelinesPage.dealPipelinesCountSuffix")} · {leadCount}{" "}
              {t("crmOpportunities.pipelinesPage.leadWorkflowsCountSuffix")}
            </Badge>
          </div>
          <h1 className="text-xl font-bold text-nx-ink">
            {t("crmOpportunities.pipelinesPage.directoryTitle")}
          </h1>
          <p className="text-xs text-nx-ink-2 max-w-2xl">
            {t("crmOpportunities.pipelinesPage.directorySubtitle")}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onOpenCreateWorkflow("lead")}
            data-testid="create-lead-workflow-btn"
          >
            <Plus className="w-3.5 h-3.5 me-1.5" />
            {t("crmOpportunities.pipelinesPage.newLeadWorkflowBtn")}
          </Button>
          <Button
            size="sm"
            onClick={() => onOpenCreateWorkflow("deal")}
            data-testid="create-workflow-btn"
          >
            <Plus className="w-3.5 h-3.5 me-1.5" />
            {t("crmOpportunities.pipelinesPage.newDealPipelineBtn")}
          </Button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="inline-flex items-center rounded-md border border-nx-line bg-nx-raised p-1 gap-1">
          {(["all", "deal", "lead"] as const).map((tab) => {
            const isActive = directoryFilter === tab;
            const label =
              tab === "all"
                ? `${t("crmOpportunities.pipelinesPage.filterAll")} (${workflows.length})`
                : tab === "deal"
                  ? `${t("crmOpportunities.pipelinesPage.filterDeals")} (${dealCount})`
                  : `${t("crmOpportunities.pipelinesPage.filterLeads")} (${leadCount})`;
            return (
              <Button
                key={tab}
                size="sm"
                variant="ghost"
                onClick={() => setDirectoryFilter(tab)}
                data-testid={`directory-filter-${tab}`}
                className={`h-7 px-3 text-xs ${
                  isActive
                    ? "bg-nx-surface text-foreground border border-nx-line-hi font-semibold"
                    : "text-nx-ink-2 hover:text-nx-ink"
                }`}
              >
                {label}
              </Button>
            );
          })}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-nx-ink-3 absolute start-3 top-1/2 -translate-y-1/2" />
          <Input
            value={directorySearch}
            onChange={(e) => setDirectorySearch(e.target.value)}
            placeholder={t("crmOpportunities.pipelinesPage.searchPlaceholder")}
            className="h-8 ps-8 text-xs"
            data-testid="directory-search-input"
          />
        </div>
      </div>

      {/* Workflows Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredDirectoryWorkflows.map((wf) => {
          const isActive =
            wf.entityType === "deal"
              ? wf.id === activeDealWorkflowId
              : wf.id === activeLeadWorkflowId;
          const orderedStages = [...wf.stages].sort((a, b) => a.sortOrder - b.sortOrder);

          return (
            <Card
              key={wf.id}
              data-testid={`workflow-card-${wf.id}`}
              className="border border-nx-line bg-nx-surface hover:border-nx-line-hi transition-colors p-4 flex flex-col justify-between gap-4"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <Badge
                        variant={wf.entityType === "deal" ? "info" : "warning"}
                        className="text-[10px]"
                      >
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
                    <h2 className="text-sm font-bold text-nx-ink">
                      {isAr ? wf.nameAr : wf.nameEn}
                    </h2>
                    <p className="text-xs text-nx-ink-2 line-clamp-2">
                      {isAr ? wf.descriptionAr : wf.descriptionEn}
                    </p>
                  </div>
                </div>

                {/* Stage Pill Chain Preview */}
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
                    {wf.transitions.length}{" "}
                    {t("crmOpportunities.pipelinesPage.transitionsCountSuffix")}
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
        })}
      </div>
    </div>
  );
}
