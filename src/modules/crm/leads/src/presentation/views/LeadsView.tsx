"use client";
import { useI18n } from "@core/providers/i18n-provider";
import { usePermission } from "@core/hooks/use-permission";
import { Alert, AlertTitle, AlertDescription } from "@core/ui/alert";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { EmptyState } from "@core/ui/empty-state";
import { Card } from "@core/ui/card";
import { AlertCircle, RefreshCw, Plus, Search, User, Mail, Phone, Calendar, CheckCircle2, Link as LinkIcon, Sparkles, Building2, } from "lucide-react";
import { cn } from "@core/common/utils";
import { CRM_PERMISSIONS, CrmShell, CrmSectionHeader } from "@modules/crm";
import { GenericCrudView } from "@core/crud/components/generic-crud-view";
import type { CrudConfig, CrudColumn, CrudAction } from "@core/crud/components/generic-crud-view";
import { LeadStatusBadge } from "../components/LeadStatusBadge";
import { CreateLeadDialog } from "../components/CreateLeadDialog";
import { QualifyLeadDialog } from "../components/QualifyLeadDialog";
import { LinkPartyDialog } from "../components/LinkPartyDialog";
import { ConvertLeadDialog } from "../components/ConvertLeadDialog";
import { useLeadsViewModel } from "../viewmodels/useLeadsViewModel";
import type { CrmLead, LeadStatus } from "../../domain/entities/LeadEntity";
export function LeadsView() { const { t, language } = useI18n();
  const isRtl = language === "ar";
  const canCreateLead = usePermission(CRM_PERMISSIONS.LEADS_CREATE);
  const viewModel = useLeadsViewModel();
  const { state, search, statusFilter, isCreateOpen, isQualifyOpen, isLinkPartyOpen, isConvertOpen,
    activeLead, isSubmitting, submitError, setIsCreateOpen,
    setIsQualifyOpen, setIsLinkPartyOpen, setIsConvertOpen, handleSearchChange,
    handleStatusFilterChange, handleCreateLead, handleQualifyLead, handleLinkParty,
    handleConvertLead, openQualifyDialog, openLinkPartyDialog, openConvertDialog, handleUpdateLeadStatus, refresh, } = viewModel;
  const statuses: { key: LeadStatus | undefined; label: string }[] = [
      { key: undefined, label: t("crmLeads.actions.allStatuses") }, { key: "New", label: t("crmLeads.status.new") },
      { key: "Working", label: t("crmLeads.status.working") }, { key: "Qualified", label: t("crmLeads.status.qualified") },
      { key: "Converted", label: t("crmLeads.status.converted") },
      { key: "Disqualified", label: t("crmLeads.status.disqualified") }, ];
  const columns: CrudColumn<CrmLead>[] = [
      { key: "title", label: t("crmLeads.table.title"), sortable: true,
        render: (_val, lead: CrmLead) => ( <div className="max-w-xs">
            <span className="font-semibold text-nx-ink line-clamp-1 block">{lead.title}</span>
            {lead.notes && ( <span className="text-[11px] text-nx-ink-3 line-clamp-1 mt-0.5">{lead.notes}</span> )}
          </div> ), }, { key: "fullName", label: t("crmLeads.table.contact"), sortable: true, render: (_val, lead: CrmLead) => (
          <div className="flex items-center gap-1.5">
            <div className="size-5 rounded-full bg-nx-raised border border-nx-line flex items-center justify-center shrink-0">
              <User className="size-3 text-nx-ink-3" />
            </div>
            <div>
              <div className="flex items-center gap-1">
                <span className="font-medium text-nx-ink block">
                  {lead.fullName || `${lead.firstName || ""} ${lead.lastName || ""}`.trim() || "—"}
                </span>
                {lead.personPartyId && ( <span
                    title={t("crmLeads.partyLink.partyLinked")}
                    className="inline-flex items-center size-3.5 rounded-full bg-nx-accent-wash text-nx-accent"
                  >
                    <LinkIcon className="size-2 mx-auto" />
                  </span> )}
              </div>
              {lead.email && ( <span className="text-[11px] text-nx-ink-3 flex items-center gap-1">
                  <Mail className="size-2.5" />
                  {lead.email}
                </span> )}
            </div>
          </div> ), }, {
        key: "companyName", label: t("crmLeads.table.company"), sortable: true, render: (_val, lead: CrmLead) => ( <div>
            <div className="flex items-center gap-1">
              <span className="font-medium text-nx-ink-2 truncate max-w-[160px] block">
                {lead.companyName || "—"}
              </span>
              {lead.organizationPartyId && ( <span
                  title={t("crmLeads.partyLink.partyLinked")}
                  className="inline-flex items-center size-3.5 rounded-full bg-nx-accent-wash text-nx-accent"
                >
                  <Building2 className="size-2.5 mx-auto" />
                </span> )}
            </div>
            {lead.phone && ( <span className="text-[11px] text-nx-ink-3 flex items-center gap-1 mt-0.5">
                <Phone className="size-2.5" />
                {lead.phone}
              </span> )}
          </div> ), }, { key: "status", label: t("crmLeads.table.status"),
        sortable: true, render: (_val, lead: CrmLead) => <LeadStatusBadge status={lead.status} />, }, {
        key: "estimatedValue", label: t("crmLeads.table.estimatedValue"), sortable: true, render: (_val, lead: CrmLead) => (
          <span className="font-bold text-nx-ink">
            {lead.estimatedValue !== undefined && lead.estimatedValue !== null
              ? `${lead.currency || "SAR"} ${lead.estimatedValue.toLocaleString()}`
              : "—"}
          </span> ), }, { key: "source", label: t("crmLeads.table.source"), render: (_val, lead: CrmLead) => (
          <span className="inline-flex items-center px-2 py-0.5 rounded-nx-xs bg-nx-raised border border-nx-line text-[11px] text-nx-ink-2">
            {lead.source || "Direct"}
          </span> ), }, { key: "createdAt", label: t("crmLeads.table.date"), sortable: true, render: (_val, lead: CrmLead) => {
          const formattedDate = lead.createdAt
            ? new Date(lead.createdAt).toLocaleDateString(language === "ar" ? "ar-SA" : "en-US", { month: "short",
                day: "numeric", year: "numeric", })
            : "—";
          return ( <span className="inline-flex items-center gap-1 text-nx-ink-3">
              <Calendar className="size-2.5" />
              {formattedDate}
            </span> ); }, }, ];
  const crudConfig: CrudConfig<CrmLead> = ({ titleKey: "crmLeads.title", subtitleKey: "crmLeads.subtitle", resource: "crm.leads",
      hidePageHeader: true, hideActionButtons: true, stickyActions: true, searchConfig: { enabled: false },
      viewSwitchPosition: "toolbar", toolbarContent: (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1" dir={isRtl ? "rtl" : "ltr"} >
          <div className="relative flex-1 max-w-md">
            <Search className="absolute start-3 top-2.5 size-3.5 text-nx-ink-3 pointer-events-none" />
            <Input value={search} onChange={(e) => handleSearchChange(e.target.value)}
              placeholder={t("crmLeads.actions.searchPlaceholder")}
              className="h-8 ps-8 pe-3 text-xs border-nx-line bg-nx-surface text-nx-ink" />
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {statuses.map((item) => { const isSelected = statusFilter === item.key;
              return ( <Button
                  key={item.label}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleStatusFilterChange(item.key)}
                  className={cn( "h-7 px-2.5 text-xs font-medium rounded-nx-md transition-all select-none whitespace-nowrap",
                    isSelected
                      ? "border-nx-accent/40 bg-nx-accent-wash text-nx-accent font-semibold"
                      : "border-nx-line bg-nx-surface text-nx-ink-2 hover:bg-nx-raised hover:text-nx-ink" )}
                >
                  {item.label}
                </Button> ); })}
          </div>
        </div> ), permissions: { canView: CRM_PERMISSIONS.LEADS_READ,
        canCreate: CRM_PERMISSIONS.LEADS_CREATE, canUpdate: CRM_PERMISSIONS.LEADS_UPDATE, canDelete: false, },
      viewModes: ["Table", "Kanban", "CardGrid", "SplitPane"], defaultView: "Table", kanbanGroupField: "status", kanbanColumns: [
        { value: "New", label: t("crmLeads.status.new"), colorClass: "border-nx-line bg-nx-surface text-nx-ink",
          dotClass: "bg-nx-ink-3", summary: (items: CrmLead[]) => {
            const sum = items.reduce((acc, curr) => acc + (curr.estimatedValue || 0), 0);
            return <span className="font-semibold">{sum > 0 ? `SAR ${sum.toLocaleString()}` : "SAR 0"}</span>; }, }, {
          value: "Working", label: t("crmLeads.status.working"),
          colorClass: "border-info/30 bg-info/10 text-info", dotClass: "bg-info",
          summary: (items: CrmLead[]) => { const sum = items.reduce((acc, curr) => acc + (curr.estimatedValue || 0), 0);
            return <span className="font-semibold text-info">{sum > 0 ? `SAR ${sum.toLocaleString()}` : "SAR 0"}</span>; }, }, {
          value: "Qualified", label: t("crmLeads.status.qualified"),
          colorClass: "border-nx-accent/30 bg-nx-accent-wash text-nx-accent font-semibold", dotClass: "bg-nx-accent",
          summary: (items: CrmLead[]) => { const sum = items.reduce((acc, curr) => acc + (curr.estimatedValue || 0), 0);
            return <span className="font-bold text-nx-accent">{sum > 0 ? `SAR ${sum.toLocaleString()}` : "SAR 0"}</span>; }, }, {
          value: "Converted", label: t("crmLeads.status.converted"),
          colorClass: "border-success/30 bg-success/10 text-success", dotClass: "bg-success",
          summary: (items: CrmLead[]) => { const sum = items.reduce((acc, curr) => acc + (curr.estimatedValue || 0), 0);
            return <span className="font-semibold text-success">{sum > 0 ? `SAR ${sum.toLocaleString()}` : "SAR 0"}</span>; },
        }, { value: "Disqualified", label: t("crmLeads.status.disqualified"),
          colorClass: "border-destructive/30 bg-destructive/10 text-destructive", dotClass: "bg-destructive",
          summary: (items: CrmLead[]) => { const sum = items.reduce((acc, curr) => acc + (curr.estimatedValue || 0), 0);
            return <span className="font-semibold text-destructive">{sum > 0 ? `SAR ${sum.toLocaleString()}` : "SAR 0"}</span>; },
        }, ], onKanbanItemMove: (item: CrmLead, targetColumnValue: string) => { handleUpdateLeadStatus(item, targetColumnValue);
      }, renderKanbanCard: (lead: CrmLead, actions: React.ReactNode) => (
        <Card className="space-y-2.5 rounded-nx-md border border-nx-line bg-nx-raised p-3 hover:border-nx-line-hi transition-all">
          <div className="flex items-start justify-between gap-2">
            <span className="font-semibold text-xs text-nx-ink line-clamp-1">{lead.title}</span>
            <LeadStatusBadge status={lead.status} />
          </div>
          <div className="text-xs text-nx-ink-2">
            <span className="font-medium">{lead.companyName || lead.fullName || "—"}</span>
          </div>
          {lead.estimatedValue !== undefined && lead.estimatedValue !== null && (
            <div className="text-xs font-bold text-nx-accent">
              {lead.currency || "SAR"} {lead.estimatedValue.toLocaleString()}
            </div> )}
          {lead.email && ( <div className="text-[11px] text-nx-ink-3 truncate flex items-center gap-1">
              <Mail className="size-2.5" />
              {lead.email}
            </div> )}
          {actions && <div className="pt-2 border-t border-nx-line/50">{actions}</div>}
        </Card> ), renderCardGridItem: (lead: CrmLead, actions: React.ReactNode) => (
        <Card className="flex flex-col justify-between gap-3 rounded-nx-lg border border-nx-line bg-nx-surface p-4 hover:border-nx-line-hi transition-all">
          <div className="space-y-2">
            <div className="flex items-start justify-between gap-2">
              <h4 className="font-bold text-sm text-nx-ink line-clamp-1">{lead.title}</h4>
              <LeadStatusBadge status={lead.status} />
            </div>
            <div className="text-xs text-nx-ink-2 space-y-1">
              <div className="font-medium">{lead.companyName || lead.fullName || "—"}</div>
              {lead.email && ( <div className="text-nx-ink-3 flex items-center gap-1.5">
                  <Mail className="size-3" />
                  {lead.email}
                </div> )}
            </div>
            {lead.estimatedValue !== undefined && lead.estimatedValue !== null && (
              <div className="text-sm font-bold text-nx-accent">
                {lead.currency || "SAR"} {lead.estimatedValue.toLocaleString()}
              </div> )}
          </div>
          <div className="border-t border-nx-line pt-3 flex items-center justify-between">
            <span className="text-[11px] text-nx-ink-3">{lead.source || "Direct"}</span>
            {actions}
          </div>
        </Card> ), renderSplitDetail: (lead: CrmLead, actions: React.ReactNode) => (
        <Card className="rounded-nx-lg border border-nx-line bg-nx-surface p-5 space-y-5">
          <div className="flex items-start justify-between border-b border-nx-line pb-4">
            <div>
              <h3 className="text-lg font-bold text-nx-ink">{lead.title}</h3>
              <p className="text-xs text-nx-ink-3 mt-1">{lead.companyName || lead.fullName || "—"}</p>
            </div>
            <div className="flex items-center gap-2">
              <LeadStatusBadge status={lead.status} />
              {actions}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <span className="text-nx-ink-3">Estimated Commercial Value</span>
              <div className="font-bold text-nx-accent text-sm">
                {lead.estimatedValue !== undefined && lead.estimatedValue !== null
                  ? `${lead.currency || "SAR"} ${lead.estimatedValue.toLocaleString()}`
                  : "—"}
              </div>
            </div>
            <div className="space-y-1">
              <span className="text-nx-ink-3">Source</span>
              <div className="font-medium text-nx-ink">{lead.source || "Direct"}</div>
            </div>
            <div className="space-y-1">
              <span className="text-nx-ink-3">Contact Email</span>
              <div className="font-medium text-nx-ink truncate">{lead.email || "—"}</div>
            </div>
            <div className="space-y-1">
              <span className="text-nx-ink-3">Contact Phone</span>
              <div className="font-medium text-nx-ink">{lead.phone || "—"}</div>
            </div>
          </div>
          {lead.notes && ( <div className="rounded-nx-md bg-nx-raised border border-nx-line p-3 text-xs">
              <span className="font-semibold text-nx-ink block mb-1">Notes & Context</span>
              <p className="text-nx-ink-2 whitespace-pre-wrap">{lead.notes}</p>
            </div> )}
        </Card> ), columns, getActions: (_vm: any, _t: any): CrudAction<CrmLead>[] => [
        { label: t("crmLeads.actions.qualify"),
          icon: <CheckCircle2 className="size-3.5" />, onClick: (lead: CrmLead) => openQualifyDialog(lead),
          show: (lead: CrmLead) =>
            lead.status !== "Qualified" &&
            lead.status !== "Converted" &&
            lead.status !== "Disqualified", }, { label: t("crmLeads.actions.linkParty"),
          icon: <LinkIcon className="size-3.5" />, onClick: (lead: CrmLead) => openLinkPartyDialog(lead), show: (lead: CrmLead) =>
            lead.status !== "Converted" &&
            lead.status !== "Disqualified", }, { label: t("crmLeads.actions.convert"),
          icon: <Sparkles className="size-3.5" />, onClick: (lead: CrmLead) => openConvertDialog(lead),
          show: (lead: CrmLead) => lead.status === "Qualified" && !lead.convertedOpportunityId, }, ], customTableProps: {
        onSearch: undefined, emptyMessage: ( <EmptyState title={t("crmLeads.table.emptyTitle")}
            description={t("crmLeads.table.emptyDescription")} /> ), }, onCreateClick: () => setIsCreateOpen(true), });
  return ( <CrmShell activeTab="leads" onTabChange={() => {}}>
      <CrmSectionHeader title={t("crmLeads.title")} subtitle={t("crmLeads.subtitle")} badge="D4/B Governed"
        actions={ <div className="flex items-center gap-2">
            <Button type="button" variant="outline" size="sm" onClick={refresh}
              className="h-8 gap-1.5 border-nx-line bg-nx-surface text-xs text-nx-ink hover:bg-nx-raised"
            >
              <RefreshCw className="size-3.5 text-nx-ink-2" />
              <span>{t("crmLeads.actions.refresh")}</span>
            </Button>
            {canCreateLead && ( <Button
                type="button"
                size="sm"
                onClick={() => setIsCreateOpen(true)}
                className="h-8 gap-1.5 text-xs font-bold"
              >
                <Plus className="size-3.5" />
                <span>{t("crmLeads.actions.newLead")}</span>
              </Button> )}
          </div> } />
      {state.stage === "failed" ? ( <Alert variant="destructive" className="max-w-xl mx-auto my-6" dir={isRtl ? "rtl" : "ltr"}>
          <AlertCircle className="size-4" />
          <AlertTitle>{t("crmLeads.messages.loadFailed")}</AlertTitle>
          <AlertDescription className="mt-2 flex items-center justify-between">
            <span className="text-xs">{state.error}</span>
            <Button size="sm" variant="outline" onClick={refresh} className="text-xs h-7">
              {t("crm.errors.retry")}
            </Button>
          </AlertDescription>
        </Alert> ) : ( <GenericCrudView<CrmLead>
          config={crudConfig}
          columns={columns}
          viewModel={viewModel}
          pagination={viewModel.pagination} /> )}
      {/* Create Lead Modal */}
      <CreateLeadDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} onSubmit={handleCreateLead} isSubmitting={isSubmitting}
        submitError={submitError} />
      {/* Qualify Lead Modal */}
      <QualifyLeadDialog open={isQualifyOpen} onOpenChange={setIsQualifyOpen} lead={activeLead} onSubmit={handleQualifyLead}
        isSubmitting={isSubmitting}
        submitError={submitError} />
      {/* Link Party Modal */}
      <LinkPartyDialog open={isLinkPartyOpen} onOpenChange={setIsLinkPartyOpen} lead={activeLead} onSubmit={handleLinkParty}
        isSubmitting={isSubmitting}
        submitError={submitError} />
      {/* Convert Lead to Opportunity Modal */}
      <ConvertLeadDialog open={isConvertOpen} onOpenChange={setIsConvertOpen} lead={activeLead} onSubmit={handleConvertLead}
        isSubmitting={isSubmitting}
        submitError={submitError} />
    </CrmShell> ); }
