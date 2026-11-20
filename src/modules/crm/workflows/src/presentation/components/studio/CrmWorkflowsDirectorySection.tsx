"use client";

import React from "react";
import { Plus, Search } from "lucide-react";
import { GenericCrudView, type CrudColumn, type CrudConfig } from "@core/crud/components/generic-crud-view";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { Card } from "@core/ui/card";
import { Input } from "@core/ui/input";
import type { CrmWorkflowDefinition, CrmWorkflowEntityType } from "@modules/crm";
import { CrmWorkflowDirectoryCard } from "./CrmWorkflowDirectoryCard";

/** Props for `CrmWorkflowsDirectorySection`. */
export interface CrmWorkflowsDirectorySectionProps {
  t: (k: string) => string;
  isAr: boolean;
  canManagePipelines?: boolean;
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
 * Pure declarative Workflows Directory Section powered by `GenericCrudView` and Nexus `<Card>` (<180 lines).
 */
export function CrmWorkflowsDirectorySection({
  t, isAr, canManagePipelines = true, workflows, activeDealWorkflowId, activeLeadWorkflowId,
  directoryFilter, setDirectoryFilter, directorySearch, setDirectorySearch,
  filteredDirectoryWorkflows, onOpenCreateWorkflow, onOpenStudioForWorkflow,
  onCloneWorkflow, onActivateWorkflow, onDeleteWorkflow,
}: CrmWorkflowsDirectorySectionProps) {
  const dealCount = workflows.filter((w) => w.entityType === "deal").length;
  const leadCount = workflows.filter((w) => w.entityType === "lead").length;

  const columns: CrudColumn<CrmWorkflowDefinition>[] = [
    { key: "nameEn", label: t("crmWorkflows.pipelinesPage.colTransitionName"), render: (_, wf) => <span className="font-semibold text-nx-ink">{isAr ? wf.nameAr : wf.nameEn}</span> },
    { key: "entityType", label: t("crmWorkflows.pipelinesPage.entityTypeLabel"), render: (_, wf) => <Badge variant={wf.entityType === "deal" ? "info" : "warning"}>{wf.entityType}</Badge> },
    { key: "stages", label: t("crmWorkflows.pipelinesPage.statStatusesLabel"), render: (_, wf) => <span className="font-mono text-xs">{wf.stages.length}</span> },
    { key: "transitions", label: t("crmWorkflows.pipelinesPage.transitionsCountSuffix"), render: (_, wf) => <span className="font-mono text-xs">{wf.transitions.length}</span> },
  ];

  const crudConfig: CrudConfig<CrmWorkflowDefinition> = {
    titleKey: "crmWorkflows.pipelinesPage.directoryTitle",
    subtitleKey: "crmWorkflows.pipelinesPage.directorySubtitle",
    columns,
    hidePageHeader: true,
    hideActionButtons: true,
    hideActionsColumn: true,
    viewModes: ["CardGrid", "Table"],
    defaultView: "CardGrid",
    searchConfig: { enabled: false },
    permissions: { canView: true, canCreate: false, canUpdate: false, canDelete: false },
    cardGridClassName: "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4",
    renderCardGridItem: (wf) => (
      <CrmWorkflowDirectoryCard
        key={wf.id}
        wf={wf}
        t={t}
        isAr={isAr}
        isActive={wf.entityType === "deal" ? wf.id === activeDealWorkflowId : wf.id === activeLeadWorkflowId}
        canManagePipelines={canManagePipelines}
        onOpenStudioForWorkflow={onOpenStudioForWorkflow}
        onCloneWorkflow={onCloneWorkflow}
        onActivateWorkflow={onActivateWorkflow}
        onDeleteWorkflow={onDeleteWorkflow}
      />
    ),
  };

  const crudViewModel = {
    items: filteredDirectoryWorkflows,
    isLoading: false,
    error: null,
    searchTerm: directorySearch,
    setSearchTerm: setDirectorySearch,
    totalItems: filteredDirectoryWorkflows.length,
    pagination: { page: 1, pageSize: 50, itemsCount: filteredDirectoryWorkflows.length, pagesCount: 1 },
    refreshItems: async () => undefined,
  };

  return (
    <div className="space-y-6" data-testid="crm-pipelines-list-page">
      <Card className="flex flex-col md:flex-row md:items-center justify-between gap-4 border border-nx-line bg-nx-surface p-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[10px] font-mono uppercase">{t("crmWorkflows.pipelinesPage.directoryEyebrow")}</Badge>
            <Badge variant="secondary" className="text-[10px] font-mono">{dealCount} {t("crmWorkflows.pipelinesPage.dealPipelinesCountSuffix")} · {leadCount} {t("crmWorkflows.pipelinesPage.leadWorkflowsCountSuffix")}</Badge>
          </div>
          <h1 className="text-xl font-bold text-nx-ink">{t("crmWorkflows.pipelinesPage.directoryTitle")}</h1>
          <p className="text-xs text-nx-ink-2 max-w-2xl">{t("crmWorkflows.pipelinesPage.directorySubtitle")}</p>
        </div>

        {canManagePipelines && (
          <div className="flex flex-wrap items-center gap-2">
            <Button size="sm" variant="outline" onClick={() => onOpenCreateWorkflow("lead")} data-testid="create-lead-workflow-btn">
              <Plus className="w-3.5 h-3.5 me-1.5" />{t("crmWorkflows.pipelinesPage.newLeadWorkflowBtn")}
            </Button>
            <Button size="sm" onClick={() => onOpenCreateWorkflow("deal")} data-testid="create-workflow-btn">
              <Plus className="w-3.5 h-3.5 me-1.5" />{t("crmWorkflows.pipelinesPage.newDealPipelineBtn")}
            </Button>
          </div>
        )}
      </Card>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="inline-flex items-center rounded-md border border-nx-line bg-nx-raised p-1 gap-1">
          {(["all", "deal", "lead"] as const).map((tab) => {
            const label = tab === "all" ? `${t("crmWorkflows.pipelinesPage.filterAll")} (${workflows.length})` : tab === "deal" ? `${t("crmWorkflows.pipelinesPage.filterDeals")} (${dealCount})` : `${t("crmWorkflows.pipelinesPage.filterLeads")} (${leadCount})`;
            return (
              <Button key={tab} size="sm" variant="ghost" onClick={() => setDirectoryFilter(tab)} data-testid={`directory-filter-${tab}`} className={`h-7 px-2.5 text-xs ${directoryFilter === tab ? "bg-nx-surface text-nx-ink border border-nx-line-hi font-semibold" : "text-nx-ink-2"}`}>{label}</Button>
            );
          })}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 absolute start-2.5 top-1/2 -translate-y-1/2 text-nx-ink-3 pointer-events-none" />
          <Input value={directorySearch} onChange={(e) => setDirectorySearch(e.target.value)} placeholder={t("crmWorkflows.pipelinesPage.searchPlaceholder")} className="ps-8 h-8 text-xs bg-nx-surface border-nx-line" data-testid="workflows-directory-search-input" />
        </div>
      </div>

      <div data-testid="workflows-directory-grid">
        <GenericCrudView<CrmWorkflowDefinition>
          config={crudConfig}
          columns={columns}
          viewModel={crudViewModel}
          pagination={{ page: 1, pageSize: 50, itemsCount: filteredDirectoryWorkflows.length, pagesCount: 1, onPageChange: () => undefined }}
        />
      </div>
    </div>
  );
}
