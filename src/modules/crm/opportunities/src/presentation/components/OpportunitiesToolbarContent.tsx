"use client";

import { Input } from "@core/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@core/ui/select";
import { Search } from "lucide-react";
import { PipelineSelector, type CrmWorkflowDefinition } from "@modules/crm";
import type { OpportunityStatus } from "../../domain/entities/OpportunityEntity";

/** Props for `OpportunitiesToolbarContent`. */
export interface OpportunitiesToolbarContentProps {
  t: (key: string) => string;
  isRtl: boolean;
  search: string;
  onSearchChange: (search: string) => void;
  activeDealWorkflowId: string;
  onSelectWorkflow: (id: string) => void;
  dealWorkflows: CrmWorkflowDefinition[];
  stageFilter: string | undefined;
  onStageFilterChange: (stage?: string) => void;
  stages: { key: string | undefined; label: string }[];
  statusFilter: OpportunityStatus | undefined;
  onStatusFilterChange: (status?: OpportunityStatus) => void;
  statuses: { key: OpportunityStatus | undefined; label: string }[];
}

/** Search input and pipeline/stage/status filter bar for Opportunities CRUD toolbar. */
export function OpportunitiesToolbarContent({
  t,
  isRtl,
  search,
  onSearchChange,
  activeDealWorkflowId,
  onSelectWorkflow,
  dealWorkflows,
  stageFilter,
  onStageFilterChange,
  stages,
  statusFilter,
  onStatusFilterChange,
  statuses,
}: OpportunitiesToolbarContentProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 flex-1" dir={isRtl ? "rtl" : "ltr"}>
      <div className="relative flex-1 min-w-[220px] max-w-md">
        <Search className="absolute start-3 top-1/2 -translate-y-1/2 size-3.5 text-nx-ink-3 pointer-events-none" />
        <Input
          placeholder={t("crmOpportunities.actions.searchPlaceholder")}
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="ps-8 h-8 text-xs border-nx-line bg-nx-surface text-nx-ink"
        />
      </div>
      <div className="w-56">
        <PipelineSelector
          pipelines={dealWorkflows}
          value={activeDealWorkflowId}
          onChange={onSelectWorkflow}
          entityType="deal"
          triggerClassName="h-8 text-xs"
          data-testid="deal-pipeline-selector"
        />
      </div>
      <div className="w-36">
        <Select
          value={stageFilter || "all"}
          onValueChange={(val) => onStageFilterChange(val === "all" ? undefined : val)}
        >
          <SelectTrigger className="h-8 text-xs">
            <SelectValue placeholder={t("crmOpportunities.actions.filterByStage")} />
          </SelectTrigger>
          <SelectContent>
            {stages.map((stg) => (
              <SelectItem key={stg.key || "all"} value={stg.key || "all"}>
                {stg.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="w-32">
        <Select
          value={statusFilter || "all"}
          onValueChange={(val) =>
            onStatusFilterChange(val === "all" ? undefined : (val as OpportunityStatus))
          }
        >
          <SelectTrigger className="h-8 text-xs">
            <SelectValue placeholder={t("crmOpportunities.actions.filterByStatus")} />
          </SelectTrigger>
          <SelectContent>
            {statuses.map((st) => (
              <SelectItem key={st.key || "all"} value={st.key || "all"}>
                {st.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
