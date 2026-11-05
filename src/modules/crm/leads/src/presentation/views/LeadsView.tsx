"use client";

import { useRouter } from "next/navigation";
import { useI18n } from "@core/providers/i18n-provider";
import { usePermission } from "@core/hooks/use-permission";
import { Alert, AlertTitle, AlertDescription } from "@core/ui/alert";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { EmptyState } from "@core/ui/empty-state";
import {
  AlertCircle,
  RefreshCw,
  Plus,
  Search,
  CheckCircle2,
  Link as LinkIcon,
  ArrowUpRight,
} from "lucide-react";
import { cn } from "@core/common/utils";
import { CRM_PERMISSIONS, CrmShell, CrmSectionHeader, useCrmCurrency, useCrmWorkflowsStore, useCrmSettingsStore } from "@modules/crm";
import { GenericCrudView } from "@core/crud/components/generic-crud-view";
import type { CrudConfig, CrudAction, CrudViewMode } from "@core/crud/components/generic-crud-view";
import { CreateLeadDialog } from "../components/CreateLeadDialog";
import { QualifyLeadDialog } from "../components/QualifyLeadDialog";
import { LinkPartyDialog } from "../components/LinkPartyDialog";
import { ConvertLeadDialog } from "../components/ConvertLeadDialog";
import { LeadsKanbanCardItem, stageToLeadStatusValue } from "../components/LeadsKanbanCardItem";
import {
  buildLeadsTableColumns,
  renderLeadsCardGridItemCard,
  renderLeadsSplitDetailCard,
} from "../components/LeadsTableColumns";
import { useLeadsViewModel } from "../viewmodels/useLeadsViewModel";
import type { CrmLead, LeadStatus } from "../../domain/entities/LeadEntity";

export function LeadsView() {
  const router = useRouter();
  const { t, language } = useI18n();
  const isRtl = language === "ar";
  const canCreateLead = usePermission(CRM_PERMISSIONS.LEADS_CREATE);
  const { baseCurrency, autoConvertToBase, convertAmount, showOriginalCurrencyBadge } = useCrmCurrency();
  const activeLeadWorkflow = useCrmWorkflowsStore((s) => s.getActiveWorkflow("lead"));
  const defaultDealViewMode = useCrmSettingsStore((s) => s.defaultDealViewMode);
  const viewModel = useLeadsViewModel();
  const {
    state,
    search,
    statusFilter,
    isCreateOpen,
    isQualifyOpen,
    isLinkPartyOpen,
    isConvertOpen,
    activeLead,
    isSubmitting,
    submitError,
    setIsCreateOpen,
    setIsQualifyOpen,
    setIsLinkPartyOpen,
    setIsConvertOpen,
    handleSearchChange,
    handleStatusFilterChange,
    handleCreateLead,
    handleQualifyLead,
    handleLinkParty,
    handleConvertLead,
    openQualifyDialog,
    openLinkPartyDialog,
    openConvertDialog,
    handleUpdateLeadStatus,
    refresh,
  } = viewModel;

  const sumLeadsInBaseCurrency = (items: CrmLead[]) => {
    const sum = items.reduce((acc, curr) => {
      if (!curr.estimatedValue) return acc;
      const fromCurr = (curr.currency || "SAR").toUpperCase();
      return acc + (autoConvertToBase ? convertAmount(curr.estimatedValue, fromCurr, baseCurrency) : curr.estimatedValue);
    }, 0);
    return sum > 0 ? `${baseCurrency} ${Math.round(sum).toLocaleString()}` : `${baseCurrency} 0`;
  };

  const statuses: { key: LeadStatus | undefined; label: string }[] =
    activeLeadWorkflow.id === "wf-lead-default"
      ? [
          { key: undefined, label: t("crmLeads.actions.allStatuses") },
          { key: "New", label: t("crmLeads.status.new") },
          { key: "Working", label: t("crmLeads.status.working") },
          { key: "Qualified", label: t("crmLeads.status.qualified") },
          { key: "Converted", label: t("crmLeads.status.converted") },
          { key: "Disqualified", label: t("crmLeads.status.disqualified") },
        ]
      : [
          { key: undefined, label: t("crmLeads.actions.allStatuses") },
          ...[...activeLeadWorkflow.stages]
              .sort((a, b) => a.sortOrder - b.sortOrder)
              .map((stg) => ({
                key: stageToLeadStatusValue(stg.stageKey, stg.labelEn),
                label: isRtl && stg.labelAr ? stg.labelAr : stg.labelEn,
              })),
        ];

  const columns = buildLeadsTableColumns({
    t,
    language,
    baseCurrency,
    autoConvertToBase,
    showOriginalCurrencyBadge,
    convertAmount,
    onNavigateLead: (id) => router.push(`/crm/leads/${id}`),
  });

  const crudConfig: CrudConfig<CrmLead> = {
    titleKey: "crmLeads.title",
    subtitleKey: "crmLeads.subtitle",
    resource: "crm.leads",
    entityTypeKey: "crm.lead",
    hidePageHeader: true,
    hideActionButtons: true,
    stickyActions: true,
    searchConfig: { enabled: false },
    viewSwitchPosition: "toolbar",
    toolbarContent: (
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1" dir={isRtl ? "rtl" : "ltr"}>
        <div className="relative flex-1 max-w-md">
          <Search className="absolute start-3 top-2.5 size-3.5 text-nx-ink-3 pointer-events-none" />
          <Input
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder={t("crmLeads.actions.searchPlaceholder")}
            className="h-8 ps-8 pe-3 text-xs border-nx-line bg-nx-surface text-nx-ink"
          />
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
    kanbanGroupField: "status",
    kanbanColumns:
      activeLeadWorkflow.id === "wf-lead-default"
        ? [
            { value: "New", label: t("crmLeads.status.new"), colorClass: "border-nx-line bg-nx-surface text-nx-ink", dotClass: "bg-nx-ink-3", summary: (items: CrmLead[]) => <span className="font-semibold text-nx-ink-2 font-mono">{sumLeadsInBaseCurrency(items)}</span> },
            { value: "Working", label: t("crmLeads.status.working"), colorClass: "border-info/30 bg-info/10 text-info", dotClass: "bg-info", summary: (items: CrmLead[]) => <span className="font-semibold text-info font-mono">{sumLeadsInBaseCurrency(items)}</span> },
            { value: "Qualified", label: t("crmLeads.status.qualified"), colorClass: "border-nx-accent/30 bg-nx-accent-wash text-nx-accent font-semibold", dotClass: "bg-nx-accent", summary: (items: CrmLead[]) => <span className="font-bold text-nx-accent font-mono">{sumLeadsInBaseCurrency(items)}</span> },
            { value: "Converted", label: t("crmLeads.status.converted"), colorClass: "border-success/30 bg-success/10 text-success", dotClass: "bg-success", summary: (items: CrmLead[]) => <span className="font-semibold text-success font-mono">{sumLeadsInBaseCurrency(items)}</span> },
            { value: "Disqualified", label: t("crmLeads.status.disqualified"), colorClass: "border-destructive/30 bg-destructive/10 text-destructive", dotClass: "bg-destructive", summary: (items: CrmLead[]) => <span className="font-semibold text-destructive font-mono">{sumLeadsInBaseCurrency(items)}</span> },
          ]
        : [...activeLeadWorkflow.stages]
            .sort((a, b) => a.sortOrder - b.sortOrder)
            .map((stg) => {
              const colValue = stageToLeadStatusValue(stg.stageKey, stg.labelEn);
              const isDone = stg.category === "done";
              return {
                value: colValue,
                label: isRtl && stg.labelAr ? stg.labelAr : stg.labelEn,
                colorClass: isDone ? "border-success/30 bg-success/10 text-success" : stg.category === "todo" ? "border-nx-line bg-nx-surface text-nx-ink" : "border-info/30 bg-info/10 text-info",
                dotClass: isDone ? "bg-success" : stg.category === "todo" ? "bg-nx-ink-3" : "bg-info",
                summary: (items: CrmLead[]) => <span className="font-semibold text-nx-ink font-mono">{sumLeadsInBaseCurrency(items)}</span>,
              };
            }),
    onKanbanItemMove: (item: CrmLead, targetColumnValue: string) => {
      handleUpdateLeadStatus(item, targetColumnValue);
    },
    renderKanbanCard: (lead: CrmLead) => (
      <LeadsKanbanCardItem
        lead={lead}
        activeLeadWorkflow={activeLeadWorkflow}
        baseCurrency={baseCurrency}
        autoConvertToBase={autoConvertToBase}
        showOriginalCurrencyBadge={showOriginalCurrencyBadge}
        convertAmount={convertAmount}
        onOpenLinkParty={openLinkPartyDialog}
        onOpenConvert={openConvertDialog}
        onUpdateLeadStatus={handleUpdateLeadStatus}
      />
    ),
    renderCardGridItem: (lead: CrmLead, actions: React.ReactNode) =>
      renderLeadsCardGridItemCard(
        lead,
        actions,
        baseCurrency,
        autoConvertToBase,
        showOriginalCurrencyBadge,
        convertAmount,
        (id) => router.push(`/crm/leads/${id}`),
      ),
    renderSplitDetail: (lead: CrmLead, actions: React.ReactNode) => renderLeadsSplitDetailCard(lead, actions, t),
    columns,
    getActions: (): CrudAction<CrmLead>[] => [
      { label: t("crmLeads.actions.viewDetails") || "Lead 360", icon: <ArrowUpRight className="size-3.5" />, onClick: (lead: CrmLead) => router.push(`/crm/leads/${lead.id}`) },
      { label: t("crmLeads.actions.qualify"), icon: <CheckCircle2 className="size-3.5" />, onClick: (lead: CrmLead) => openQualifyDialog(lead), show: (lead: CrmLead) => lead.status !== "Qualified" && lead.status !== "Converted" && lead.status !== "Disqualified" },
      { label: t("crmLeads.actions.linkParty"), icon: <LinkIcon className="size-3.5" />, onClick: (lead: CrmLead) => openLinkPartyDialog(lead), show: (lead: CrmLead) => lead.status !== "Converted" && lead.status !== "Disqualified" },
      { label: t("crmLeads.actions.convert"), icon: <ArrowUpRight className="size-3.5" />, onClick: (lead: CrmLead) => openConvertDialog(lead), show: (lead: CrmLead) => (lead.status === "Qualified" || lead.status === "New" || lead.status === "Working") && !lead.convertedOpportunityId },
    ],
    customTableProps: {
      onSearch: undefined,
      emptyMessage: <EmptyState title={t("crmLeads.table.emptyTitle")} description={t("crmLeads.table.emptyDescription")} />,
    },
    onCreateClick: () => setIsCreateOpen(true),
  };

  return (
    <CrmShell activeTab="leads" onTabChange={() => {}}>
      <CrmSectionHeader
        title={t("crmLeads.title")}
        subtitle={t("crmLeads.subtitle")}
        badge={`${state.totalCount} ${t("crm.tabs.leads")}`}
        actions={
          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" size="sm" onClick={refresh} className="h-8 gap-1.5 border-nx-line bg-nx-surface text-xs text-nx-ink hover:bg-nx-raised">
              <RefreshCw className="size-3.5 text-nx-ink-2" />
              <span>{t("crmLeads.actions.refresh")}</span>
            </Button>
            {canCreateLead && (
              <Button type="button" size="sm" onClick={() => setIsCreateOpen(true)} className="h-8 gap-1.5 text-xs font-bold">
                <Plus className="size-3.5" />
                <span>{t("crmLeads.actions.newLead")}</span>
              </Button>
            )}
          </div>
        }
      />
      {state.stage === "failed" ? (
        <Alert variant="destructive" className="max-w-xl mx-auto my-6" dir={isRtl ? "rtl" : "ltr"}>
          <AlertCircle className="size-4" />
          <AlertTitle>{t("crmLeads.messages.loadFailed")}</AlertTitle>
          <AlertDescription className="mt-2 flex items-center justify-between">
            <span className="text-xs">{state.error}</span>
            <Button size="sm" variant="outline" onClick={refresh} className="text-xs h-7">{t("crm.errors.retry")}</Button>
          </AlertDescription>
        </Alert>
      ) : (
        <>
          {(state.error || submitError) && !isCreateOpen && !isQualifyOpen && !isLinkPartyOpen && !isConvertOpen && (
            <Alert variant="destructive" data-testid="leads-transition-error-banner" className="mb-4" dir={isRtl ? "rtl" : "ltr"}>
              <AlertCircle className="size-4" />
              <AlertTitle>{t("crmLeads.detail.transitionBlockedTitle", { defaultValue: "Status Transition Blocked" })}</AlertTitle>
              <AlertDescription className="mt-1 flex items-center justify-between gap-3">
                <span className="text-xs">{state.error || submitError}</span>
                <Button type="button" size="sm" variant="outline" onClick={() => viewModel.clearError?.()} className="text-xs h-7 shrink-0">{t("crmLeads.detail.dismissBtn", { defaultValue: "Dismiss" })}</Button>
              </AlertDescription>
            </Alert>
          )}
          <GenericCrudView<CrmLead> config={crudConfig} columns={columns} viewModel={viewModel} pagination={viewModel.pagination} />
        </>
      )}
      <CreateLeadDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} onSubmit={handleCreateLead} isSubmitting={isSubmitting} submitError={submitError} />
      <QualifyLeadDialog open={isQualifyOpen} onOpenChange={setIsQualifyOpen} lead={activeLead} initialDecision={viewModel.qualifyDefaultDecision} onSubmit={handleQualifyLead} isSubmitting={isSubmitting} submitError={submitError} />
      <LinkPartyDialog open={isLinkPartyOpen} onOpenChange={setIsLinkPartyOpen} lead={activeLead} onSubmit={handleLinkParty} onLookupParties={viewModel.lookupCandidateParties} isSubmitting={isSubmitting} submitError={submitError} />
      <ConvertLeadDialog open={isConvertOpen} onOpenChange={setIsConvertOpen} lead={activeLead} onSubmit={handleConvertLead} isSubmitting={isSubmitting} submitError={submitError} />
    </CrmShell>
  );
}
