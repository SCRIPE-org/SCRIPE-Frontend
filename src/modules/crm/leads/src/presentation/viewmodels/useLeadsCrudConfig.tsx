"use client";

import React, { useMemo } from "react";
import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { EmptyState } from "@core/ui/empty-state";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@core/ui/select";
import { Search, CheckCircle2, Link as LinkIcon, ArrowUpRight, XCircle } from "lucide-react";
import { cn } from "@core/common/utils";
import {
  CRM_PERMISSIONS,
  STAGE_COLOR_PALETTE,
  resolveDefaultStageColor,
  useCrmWorkflowsStore,
  type CrmWorkflowDefinition,
} from "@modules/crm";
import type { CrudConfig, CrudAction, CrudViewMode, DropEvaluationResult } from "@core/crud/components/generic-crud-view";
import { LeadsKanbanCardItem } from "../components/LeadsKanbanCardItem";
import { buildLeadsTableColumns, renderLeadsCardGridItemCard, renderLeadsSplitDetailCard } from "../components/LeadsTableColumns";
import type { CrmLead, LeadStatus } from "../../domain/entities/LeadEntity";

/** Parameters for useLeadsCrudConfig hook. */
export interface UseLeadsCrudConfigParams {
  router: AppRouterInstance;
  t: (key: string, params?: Record<string, string | number>) => string;
  language: string;
  baseCurrency: string;
  autoConvertToBase: boolean;
  convertAmount: (amount: number, from: string, to: string) => number;
  showOriginalCurrencyBadge: boolean;
  activeLeadWorkflow: CrmWorkflowDefinition;
  leadWorkflows: CrmWorkflowDefinition[];
  activeLeadWorkflowId: string;
  setActiveWorkflow: (entityType: "deal" | "lead", id: string) => void;
  defaultDealViewMode: string;
  search: string;
  handleSearchChange: (search: string) => void;
  statusFilter: LeadStatus | undefined;
  handleStatusFilterChange: (status?: LeadStatus) => void;
  statuses: { key: LeadStatus | undefined; label: string }[];
  sumLeadsInBaseCurrency: (items: CrmLead[]) => string;
  handleLeadStageTransition: (lead: CrmLead, targetStageOrStatus: string, dropEval?: DropEvaluationResult) => Promise<boolean | void>;
  handleUpdateLeadStatus: (lead: CrmLead, targetStatus: string) => Promise<boolean>;
  openQualifyDialog: (lead: CrmLead) => void;
  openLinkPartyDialog: (lead: CrmLead) => void;
  openConvertDialog: (lead: CrmLead) => void;
  setIsCreateOpen: (open: boolean) => void;
}

/** Builds the GenericCrudView configuration and table columns for CRM Leads. */
export function useLeadsCrudConfig(params: UseLeadsCrudConfigParams) {
  const {
    router, t, language, baseCurrency, autoConvertToBase, convertAmount, showOriginalCurrencyBadge,
    activeLeadWorkflow, leadWorkflows, activeLeadWorkflowId, setActiveWorkflow, defaultDealViewMode,
    search, handleSearchChange, statusFilter, handleStatusFilterChange, statuses, sumLeadsInBaseCurrency,
    handleLeadStageTransition, handleUpdateLeadStatus, openQualifyDialog, openLinkPartyDialog, openConvertDialog, setIsCreateOpen,
  } = params;

  const isRtl = language === "ar";
  const columns = useMemo(() => buildLeadsTableColumns({
    t, language, baseCurrency, autoConvertToBase, showOriginalCurrencyBadge, convertAmount,
    onNavigateLead: (id) => router.push(`/crm/leads/${id}`),
  }), [t, language, baseCurrency, autoConvertToBase, showOriginalCurrencyBadge, convertAmount, router]);

  const getStageDisplayLabel = (stg: { stageKey: string; labelEn: string; labelAr?: string | null }) => {
    if (stg.stageKey === "lead.new") return t("crmLeads.status.new");
    if (stg.stageKey === "lead.working") return t("crmLeads.status.working");
    if (stg.stageKey === "lead.qualified") return t("crmLeads.status.qualified");
    if (stg.stageKey === "lead.converted") return t("crmLeads.status.converted");
    if (stg.stageKey === "lead.disqualified") return t("crmLeads.status.disqualified");
    return isRtl && stg.labelAr ? stg.labelAr : stg.labelEn;
  };

  const crudConfig = useMemo<CrudConfig<CrmLead>>(() => ({
    titleKey: "crmLeads.title",
    subtitleKey: "crmLeads.subtitle",
    resource: "crm.leads",
    entityTypeKey: "crm.lead",
    dataExchange: {
      entityKey: "crm.lead",
      enableMultiSheetMigration: true,
      multiSheetEntityKeys: [
        "crm.account",
        "crm.contact",
        "crm.lead",
        "crm.opportunity",
        "crm.activity",
      ],
      hideToolbarActions: true,
    },
    hidePageHeader: true,
    hideActionButtons: true,
    stickyActions: true,
    searchConfig: { enabled: false },
    viewSwitchPosition: "toolbar",
    toolbarContent: (
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1" dir={isRtl ? "rtl" : "ltr"}>
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute start-3 top-2.5 size-3.5 text-nx-ink-3 pointer-events-none" />
          <Input value={search} onChange={(e) => handleSearchChange(e.target.value)} placeholder={t("crmLeads.actions.searchPlaceholder")} className="h-8 ps-8 pe-3 text-xs border-nx-line bg-nx-surface text-nx-ink" />
        </div>
        <div className="w-48">
          <Select value={activeLeadWorkflowId} onValueChange={(id) => setActiveWorkflow("lead", id)}>
            <SelectTrigger className="h-8 text-xs" data-testid="lead-pipeline-selector"><SelectValue /></SelectTrigger>
            <SelectContent>
              {leadWorkflows.map((wf) => (
                <SelectItem key={wf.id} value={wf.id} className="text-xs">{isRtl ? wf.nameAr : wf.nameEn}</SelectItem>
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
                onClick={() => handleStatusFilterChange(item.key)}
                className={cn(
                  "h-7 px-2.5 text-xs font-medium rounded-nx-md transition-all select-none whitespace-nowrap",
                  isSelected
                    ? "border-nx-accent/40 bg-nx-accent-wash text-nx-accent font-semibold"
                    : "border-nx-line bg-nx-surface text-nx-ink-2 hover:bg-nx-raised hover:text-nx-ink",
                )}
              >
                {item.label}
              </Button>
            );
          })}
        </div>
      </div>
    ),
    permissions: {
      canView: CRM_PERMISSIONS.LEADS_READ,
      canCreate: CRM_PERMISSIONS.LEADS_CREATE,
      canUpdate: CRM_PERMISSIONS.LEADS_UPDATE,
      canDelete: false,
    },
    viewModes: ["Table", "Kanban", "CardGrid", "SplitPane"],
    defaultView: (defaultDealViewMode as CrudViewMode) || "Table",
    kanbanGroupField: "stageKey",
    kanbanColumns: [...activeLeadWorkflow.stages]
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((stg) => {
        const colorToken = resolveDefaultStageColor(stg.stageKey, stg.category, stg.sortOrder, stg.color);
        const colorMeta = STAGE_COLOR_PALETTE[colorToken];
        const customHex = stg.customColorHex || stg.properties?.customColorHex;
        return {
          value: stg.stageKey,
          label: getStageDisplayLabel(stg),
          colorClass: colorMeta.badgeClass,
          dotClass: colorMeta.swatchClass,
          summary: (items: CrmLead[]) => (
            <span className="inline-flex items-center gap-1.5 font-semibold text-nx-ink font-mono">
              {customHex && (
                <span className="inline-block w-2 h-2 rounded-full border" style={{ backgroundColor: customHex, borderColor: customHex }} data-testid={`lead-col-custom-hex-${stg.stageKey}`} />
              )}
              {sumLeadsInBaseCurrency(items)}
            </span>
          ),
        };
      }),
    workflowKanbanConfig: {
      stages: [...activeLeadWorkflow.stages]
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((stg) => {
          const colorToken = resolveDefaultStageColor(stg.stageKey, stg.category, stg.sortOrder, stg.color);
          const colorMeta = STAGE_COLOR_PALETTE[colorToken];
          const customHex = stg.customColorHex || stg.properties?.customColorHex;
          return {
            stageKey: stg.stageKey,
            label: getStageDisplayLabel(stg),
            category: stg.category,
            colorClass: colorMeta.badgeClass,
            swatchClass: colorMeta.swatchClass,
            customColorHex: customHex,
            wipLimit: stg.properties?.wipLimit ? Number(stg.properties.wipLimit) : undefined,
            headerSummary: (items: CrmLead[]) => (
              <span className="inline-flex items-center gap-1.5 font-semibold text-nx-ink font-mono text-xs">
                {customHex && (
                  <span className="inline-block w-2 h-2 rounded-full border" style={{ backgroundColor: customHex, borderColor: customHex }} />
                )}
                {sumLeadsInBaseCurrency(items)}
              </span>
            ),
          };
        }),
      stageField: "stageKey",
      evaluateDropTarget: (lead: CrmLead, targetStageKey: string) => {
        const fromKey = lead.stageKey || `lead.${lead.status.toLowerCase()}`;
        const isRtl = language === "ar";
        const evalResult = useCrmWorkflowsStore.getState().evaluateTransition("lead", fromKey, targetStageKey, {
          hasVerifiedParty: Boolean(lead.organizationPartyId || lead.personPartyId || lead.verifiedPartyId),
          partyId: lead.verifiedPartyId || lead.organizationPartyId || lead.personPartyId || null,
          estimatedAmount: lead.estimatedValue ?? null,
          estimatedValue: lead.estimatedValue ?? null,
          targetCloseDate: null,
          disqualificationReason: lead.disqualificationReason ?? null,
          qualificationNotes: (lead as unknown as { qualificationNotes?: string }).qualificationNotes ?? null,
          fields: (lead as unknown as { customFields?: Record<string, unknown> }).customFields,
          locale: isRtl ? "ar" : "en",
        });
        const parallelCount = evalResult.matchedTransitions?.length ?? 1;
        return {
          state: evalResult.status,
          actionLabel: evalResult.actionLabel || evalResult.matchedTransition?.nameEn,
          transitionId: evalResult.matchedTransition?.id,
          transitions: evalResult.matchedTransitions,
          badgeText:
            evalResult.status === "blocked"
              ? evalResult.reason || t("crmLeads.kanban.blocked", { defaultValue: "Transition Blocked" })
              : parallelCount > 1
                ? t("crmLeads.kanban.pathsAvailable", { count: parallelCount, defaultValue: `${parallelCount} Paths Available` })
                : evalResult.status === "allowed_screen_required"
                  ? t("crmLeads.kanban.opensTransitionScreen", { defaultValue: "Opens Transition Screen" })
                  : t("crmLeads.kanban.instantMove", { defaultValue: "Instant Move" }),
          reason: evalResult.reason,
        };
      },
      onMoveItem: (lead: CrmLead, targetStageKey: string, evalResult?: DropEvaluationResult) => {
        handleLeadStageTransition(lead, targetStageKey, evalResult);
      },
      renderCard: (lead: CrmLead) => (
        <LeadsKanbanCardItem
          lead={lead} activeLeadWorkflow={activeLeadWorkflow} baseCurrency={baseCurrency}
          autoConvertToBase={autoConvertToBase} showOriginalCurrencyBadge={showOriginalCurrencyBadge} convertAmount={convertAmount}
          onOpenLinkParty={openLinkPartyDialog} onOpenConvert={openConvertDialog}
          onUpdateLeadStatus={(ld, target) => { void handleLeadStageTransition(ld, target); }}
        />
      ),
    },
    onKanbanItemMove: (item: CrmLead, targetColumnValue: string) => { void handleLeadStageTransition(item, targetColumnValue); },
    renderKanbanCard: (lead: CrmLead) => (
      <LeadsKanbanCardItem
        lead={lead} activeLeadWorkflow={activeLeadWorkflow} baseCurrency={baseCurrency}
        autoConvertToBase={autoConvertToBase} showOriginalCurrencyBadge={showOriginalCurrencyBadge} convertAmount={convertAmount}
        onOpenLinkParty={openLinkPartyDialog} onOpenConvert={openConvertDialog}
        onUpdateLeadStatus={(ld, target) => { void handleLeadStageTransition(ld, target); }}
      />
    ),
    renderCardGridItem: (lead: CrmLead, actions: React.ReactNode) =>
      renderLeadsCardGridItemCard(lead, actions, baseCurrency, autoConvertToBase, showOriginalCurrencyBadge, convertAmount, (id) => router.push(`/crm/leads/${id}`), t),
    renderSplitDetail: (lead: CrmLead, actions: React.ReactNode) => renderLeadsSplitDetailCard(lead, actions, t),
    columns,
    getActions: (): CrudAction<CrmLead>[] => [
      { label: t("crmLeads.actions.viewDetails"), icon: <ArrowUpRight className="size-3.5" />, onClick: (lead: CrmLead) => router.push(`/crm/leads/${lead.id}`) },
      {
        label: t("crmLeads.actions.qualify"),
        icon: <CheckCircle2 className="size-3.5" />,
        onClick: (lead: CrmLead) => {
          openQualifyDialog(lead);
        },
        show: (lead: CrmLead) => lead.status !== "Qualified" && lead.status !== "Converted" && lead.status !== "Disqualified",
      },
      {
        label: t("crmLeads.actions.disqualify", { defaultValue: "Disqualify" }),
        icon: <XCircle className="size-3.5" />,
        onClick: (lead: CrmLead) => {
          void handleLeadStageTransition(lead, "lead.disqualified");
        },
        show: (lead: CrmLead) => lead.status !== "Converted" && lead.status !== "Disqualified",
      },
      {
        label: t("crmLeads.actions.linkParty"),
        icon: <LinkIcon className="size-3.5" />,
        onClick: (lead: CrmLead) => openLinkPartyDialog(lead),
        show: (lead: CrmLead) => lead.status !== "Converted" && lead.status !== "Disqualified",
      },
      {
        label: t("crmLeads.actions.convert"),
        icon: <ArrowUpRight className="size-3.5" />,
        onClick: (lead: CrmLead) => {
          openConvertDialog(lead);
        },
        show: (lead: CrmLead) => (lead.status === "Qualified" || lead.status === "New" || lead.status === "Working") && !lead.convertedOpportunityId,
      },
    ],
    customTableProps: {
      onSearch: undefined,
      emptyMessage: <EmptyState title={t("crmLeads.table.emptyTitle")} description={t("crmLeads.table.emptyDescription")} />,
    },
    onCreateClick: () => setIsCreateOpen(true),
  }), [
    router, t, language, baseCurrency, autoConvertToBase, convertAmount, showOriginalCurrencyBadge,
    activeLeadWorkflow, leadWorkflows, activeLeadWorkflowId, setActiveWorkflow, defaultDealViewMode,
    search, handleSearchChange, statusFilter, handleStatusFilterChange, statuses, sumLeadsInBaseCurrency,
    handleLeadStageTransition, handleUpdateLeadStatus, openQualifyDialog, openLinkPartyDialog, openConvertDialog, setIsCreateOpen,
    columns, isRtl,
  ]);

  return { crudConfig, columns };
}
