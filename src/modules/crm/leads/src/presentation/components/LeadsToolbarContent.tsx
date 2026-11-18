"use client";

import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@core/ui/select";
import { cn } from "@core/common/utils";
import { Search } from "lucide-react";
import type { CrmWorkflowDefinition } from "@modules/crm";
import type { LeadStatus } from "../../domain/entities/LeadEntity";

interface LeadsToolbarContentProps {
  t: (key: string, params?: Record<string, string | number>) => string;
  isRtl: boolean;
  search: string;
  onSearchChange: (search: string) => void;
  matchedLeadWorkflow?: CrmWorkflowDefinition;
  selectedLeadPipelineLabel: string;
  leadWorkflows: CrmWorkflowDefinition[];
  onSelectPipeline: (id: string) => void;
  statuses: { key: LeadStatus | undefined; label: string }[];
  statusFilter: LeadStatus | undefined;
  onStatusFilterChange: (status?: LeadStatus) => void;
}

/** Search input, workflow selector, and status filter strip rendered inside Leads GenericCrudView toolbar. */
export function LeadsToolbarContent({
  t,
  isRtl,
  search,
  onSearchChange,
  matchedLeadWorkflow,
  selectedLeadPipelineLabel,
  leadWorkflows,
  onSelectPipeline,
  statuses,
  statusFilter,
  onStatusFilterChange,
}: LeadsToolbarContentProps) {
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1" dir={isRtl ? "rtl" : "ltr"}>
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute start-3 top-2.5 size-3.5 text-nx-ink-3 pointer-events-none" />
        <Input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={t("crmLeads.actions.searchPlaceholder")}
          className="h-8 ps-8 pe-3 text-xs border-nx-line bg-nx-surface text-nx-ink"
        />
      </div>
      <div className="w-auto min-w-[12.5rem] max-w-[17rem] shrink-0">
        <Select
          value={matchedLeadWorkflow?.id ?? ""}
          onValueChange={(id) => { if (id) onSelectPipeline(id); }}
        >
          <SelectTrigger
            className="h-8 w-full min-w-[12.5rem] gap-2 border-nx-line bg-nx-surface text-xs text-nx-ink"
            data-testid="lead-pipeline-selector"
            aria-label={t("crmLeads.actions.filterPipelineLabel")}
          >
            <SelectValue placeholder={t("crmLeads.actions.allPipelines")}>
              {selectedLeadPipelineLabel || undefined}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {leadWorkflows.map((wf) => (
              <SelectItem key={wf.id} value={wf.id} className="text-xs">
                {isRtl ? wf.nameAr || wf.nameEn : wf.nameEn || wf.nameAr}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        {statuses.map((item) => {
          const isSelected = statusFilter === item.key;
          return (
            <Button
              key={item.label}
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onStatusFilterChange(item.key)}
              className={cn(
                "h-7 px-2.5 text-xs font-medium rounded-nx-md transition-all select-none whitespace-nowrap",
                isSelected
                  ? "border-nx-accent/40 bg-nx-accent-wash text-nx-accent font-semibold"
                  : "border-nx-line bg-nx-surface text-nx-ink-2 hover:bg-nx-raised hover:text-nx-ink"
              )}
            >
              {item.label}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
