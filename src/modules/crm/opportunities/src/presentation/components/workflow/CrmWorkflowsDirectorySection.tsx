"use client";

import React from "react";
import { Plus, Search } from "lucide-react";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import type { CrmWorkflowDefinition, CrmWorkflowEntityType } from "@modules/crm";
import { CrmWorkflowDirectoryCard } from "./CrmWorkflowDirectoryCard";

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

/**
 * Pure declarative Workflows Directory Section (<160 lines).
 */
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
                    ? "bg-nx-surface text-nx-ink border border-nx-line-hi font-semibold"
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredDirectoryWorkflows.map((wf) => (
          <CrmWorkflowDirectoryCard
            key={wf.id}
            t={t}
            isAr={isAr}
            wf={wf}
            isActive={
              wf.entityType === "deal"
                ? wf.id === activeDealWorkflowId
                : wf.id === activeLeadWorkflowId
            }
            onOpenStudioForWorkflow={onOpenStudioForWorkflow}
            onCloneWorkflow={onCloneWorkflow}
            onActivateWorkflow={onActivateWorkflow}
            onDeleteWorkflow={onDeleteWorkflow}
          />
        ))}
      </div>
    </div>
  );
}
