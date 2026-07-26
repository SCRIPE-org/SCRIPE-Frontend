// FILE-EXCEPTION: file length
"use client";

import { useState } from "react";
import { useLeadsViewModel } from "../viewmodels/useLeadsViewModel";
import { LeadDetailDrawer } from "../components/LeadDetailDrawer";
import { CreateLeadDialog } from "../components/CreateLeadDialog";
import { ConvertToTenantWizard } from "../components/ConvertToTenantDialog";
import { AssignLeadDialog } from "../components/AssignLeadDialog";
import { BulkActionBar } from "../components/BulkActionBar";
import { LeadsKanbanView } from "../components/LeadsKanbanView";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@core/ui/select";
import { GenericTable, type Column } from "@core/crud/components/generic-table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@core/ui/pagination";
import { EmptyState } from "@core/ui/empty-state";
import { cn } from "@core/common/utils";
import { Inbox, LayoutGrid, Table2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@core/ui/alert-dialog";
import { usePermissions } from "@core/hooks/use-permission";
import { useI18n } from "@core/providers/i18n-provider";
import { type PlatformLeadListItem, type LeadStatus } from "../../domain/entities/PlatformLead";

// ── Constants ─────────────────────────────────────────────────────────────────

const ALL_STATUSES: LeadStatus[] = ["New", "Contacted", "Qualified", "Converted", "Closed"];

const STATUS_STYLES: Record<LeadStatus, string> = {
  New: "bg-info/15 text-info border-info/30",
  Contacted: "bg-warning/15 text-warning border-warning/30",
  Qualified:
    "border-[color:color-mix(in_srgb,var(--nx-accent)_30%,transparent)] bg-nx-accent-wash text-nx-accent",
  Converted: "bg-success/15 text-success border-success/30",
  Closed: "bg-nx-raised text-nx-ink-3 border-nx-line",
};

const STATUS_DOTS: Record<LeadStatus, string> = {
  New: "bg-info",
  Contacted: "bg-warning",
  Qualified: "bg-nx-accent",
  Converted: "bg-success",
  Closed: "bg-nx-ink-3",
};

/** Converts 'enterprise-pro' → 'Enterprise Pro' */
function humanizeEditionKey(key: string): string {
  return key.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

// ── Main view ─────────────────────────────────────────────────────────────────

type ViewMode = "table" | "kanban";
const VIEW_MODE_STORAGE_KEY = "scripe.leads.viewMode";

/**
 * Presentation UI component rendering the leads view.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function LeadsView() {
  const vm = useLeadsViewModel();
  const { t } = useI18n();
  const { has } = usePermissions();
  const [viewMode, setViewModeState] = useState<ViewMode>(() => {
    if (typeof window === "undefined") return "table";
    const stored = window.localStorage.getItem(VIEW_MODE_STORAGE_KEY);
    return stored === "kanban" || stored === "table" ? stored : "table";
  });

  const setViewMode = (mode: ViewMode) => {
    setViewModeState(mode);
    window.localStorage.setItem(VIEW_MODE_STORAGE_KEY, mode);
  };

  const leads = vm.leads;
  const isAnyBulkPending = vm.isBulkClosing || vm.isBulkDeleting;
  const canCreateLead = has("leads.create");
  const canUpdateLead = has("leads.update");
  const canAssignLead = has("leads.assign");
  const canConvertLead = has("leads.convert");
  const canDeleteLead = has("leads.delete");
  const canSendEmail = has("leads.send_email");

  const columns: Column<PlatformLeadListItem>[] = [
    {
      key: "companyName",
      label: t("leads.columns.company"),
      render: (_, lead) => (
        <div className="h-full w-full cursor-pointer" onClick={() => vm.handleOpenDrawer(lead.id)}>
          <p className="truncate font-medium text-nx-ink transition-colors duration-nx-micro ease-nx-enter group-hover:text-info motion-reduce:transition-none">
            {lead.companyName}
          </p>
          {lead.discoveryTagKeys.length > 0 && (
            <div className="mt-1 flex flex-wrap items-center gap-1">
              {lead.discoveryTagKeys.map(({ key, raw }) => (
                <span
                  key={key}
                  className="inline-flex items-center rounded border border-[color:color-mix(in_srgb,var(--nx-accent)_20%,transparent)] bg-nx-accent-wash px-1.5 py-0.5 text-[10px] text-nx-accent"
                >
                  {raw ? key : t(key)}
                </span>
              ))}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "contactName",
      label: t("leads.columns.contact"),
      render: (_, lead) => (
        <div className="h-full w-full cursor-pointer" onClick={() => vm.handleOpenDrawer(lead.id)}>
          <p className="truncate text-nx-ink">{lead.contactName}</p>
          <p className="mt-0.5 truncate text-xs text-nx-ink-3">{lead.email}</p>
        </div>
      ),
    },
    {
      key: "editionKey",
      label: t("leads.columns.edition"),
      render: (_, lead) => (
        <div className="h-full w-full cursor-pointer" onClick={() => vm.handleOpenDrawer(lead.id)}>
          {lead.editionKey ? (
            <span className="rounded-nx-sm bg-[color:color-mix(in_srgb,var(--nx-raised)_60%,transparent)] px-1.5 py-0.5 text-xs font-medium text-nx-ink">
              {humanizeEditionKey(lead.editionKey)}
            </span>
          ) : (
            <span className="text-nx-ink-3">—</span>
          )}
        </div>
      ),
    },
    {
      key: "status",
      label: t("leads.columns.status"),
      render: (_, lead) => (
        <div className="h-full w-full cursor-pointer" onClick={() => vm.handleOpenDrawer(lead.id)}>
          <span
            className={`inline-flex items-center gap-1.5 rounded-nx-sm border px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[lead.status]}`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOTS[lead.status]}`} />
            {t(`leads.status.${lead.status}`)}
          </span>
        </div>
      ),
    },
    {
      key: "requestedAt",
      label: t("leads.columns.created"),
      render: (_, lead) => (
        <div className="h-full w-full cursor-pointer" onClick={() => vm.handleOpenDrawer(lead.id)}>
          <p className="text-xs text-nx-ink-3">{lead.relativeCreatedAt}</p>
          <p className="mt-0.5 text-[10px] text-nx-ink-3">{t(lead.sourceKey)}</p>
        </div>
      ),
    },
  ];

  const actions = [
    {
      label: t("leads.actions.assign"),
      onClick: (lead: PlatformLeadListItem) => vm.handleOpenAssignDialog(lead.id),
      show: (lead: PlatformLeadListItem) =>
        canAssignLead && lead.status !== "Converted" && lead.status !== "Closed",
    },
    {
      label: t("leads.actions.convert"),
      onClick: (lead: PlatformLeadListItem) => vm.handleOpenConvertDialog(lead.id),
      show: (lead: PlatformLeadListItem) =>
        canConvertLead && lead.status !== "Converted" && lead.status !== "Closed",
    },
    {
      label: t("leads.actions.delete"),
      onClick: (lead: PlatformLeadListItem) => vm.handleDeleteLead(lead.id),
      variant: "destructive" as const,
      show: () => canDeleteLead,
    },
  ];

  return (
    <div className="space-y-6">
      {/* ── Page Header ── */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-nx-ink">{t("leads.title")}</h1>
          <p className="mt-1 text-sm text-nx-ink-2">
            {t("leads.subtitle")} &mdash; {t("leads.totalCount", { count: String(vm.totalCount) })}
          </p>
        </div>

        {/* Stats bar + Create button */}
        <div className="flex flex-wrap items-center gap-2">
          {/* <StatPill
            label={t("leads.statsBar.new")}
            value={vm.stats.new}
            accent="border-info/30 text-info"
          />
          <StatPill
            label={t("leads.statsBar.qualified")}
            value={vm.stats.qualified}
            accent="border-[color:color-mix(in_srgb,var(--nx-accent)_30%,transparent)] text-nx-accent"
          />
          <StatPill
            label={t("leads.statsBar.converted")}
            value={vm.stats.converted}
            accent="border-success/30 text-success"
          /> */}
          {/* View toggle */}
          <div className="flex items-center rounded-nx-sm border border-nx-line bg-nx-surface p-0.5">
            <Button
              onClick={() => setViewMode("table")}
              variant="ghost"
              size="icon"
              className={`h-7 w-8 transition-colors duration-nx-micro ease-nx-enter motion-reduce:transition-none ${viewMode === "table" ? "bg-nx-raised text-nx-ink" : "text-nx-ink-3 hover:text-nx-ink"}`}
              aria-label={t("leads.actions.tableView")}
            >
              <Table2 className="h-3.5 w-3.5" />
            </Button>
            <Button
              onClick={() => setViewMode("kanban")}
              variant="ghost"
              size="icon"
              className={`h-7 w-8 transition-colors duration-nx-micro ease-nx-enter motion-reduce:transition-none ${viewMode === "kanban" ? "bg-nx-raised text-nx-ink" : "text-nx-ink-3 hover:text-nx-ink"}`}
              aria-label={t("leads.actions.kanbanView")}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
            </Button>
          </div>

          {canCreateLead && (
            <Button
              id="leads-create-btn"
              onClick={vm.handleOpenCreateDialog}
              size="sm"
              className="ms-2 h-8 bg-info px-3 text-xs text-info-foreground hover:bg-info/90"
            >
              {t("leads.createButton")}
            </Button>
          )}
        </div>
      </div>

      {/* ── Filters ── */}
      <div className="flex flex-wrap items-center gap-3">
        <Input
          id="leads-search"
          placeholder={t("leads.searchPlaceholder")}
          value={vm.search}
          onChange={(e) => vm.handleSearchChange(e.target.value)}
          className="w-72 border-nx-line bg-nx-surface text-nx-ink placeholder:text-nx-ink-3"
        />
        <Select
          value={vm.statusFilter ?? "all"}
          onValueChange={(v) =>
            vm.handleStatusFilterChange(v === "all" ? undefined : (v as LeadStatus))
          }
        >
          <SelectTrigger
            id="leads-status-filter"
            className="w-44 border-nx-line bg-nx-surface text-nx-ink"
          >
            <SelectValue placeholder={t("leads.allStatuses")} />
          </SelectTrigger>
          <SelectContent className="border-nx-line bg-nx-surface">
            <SelectItem value="all">{t("leads.allStatuses")}</SelectItem>
            {ALL_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                <span className="flex items-center gap-2">
                  <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOTS[s]}`} />
                  {t(`leads.status.${s}`)}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* ── Table / Kanban ── */}
      {vm.isError ? (
        <div className="rounded-nx-sm border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {t("leads.loadError")}
        </div>
      ) : viewMode === "kanban" ? (
        <div className="space-y-3">
          <LeadsKanbanView
            leads={leads}
            isLoading={vm.isLoading}
            onOpenDrawer={vm.handleOpenDrawer}
            onMoveLead={vm.handleUpdateStatus}
            isMoving={vm.isUpdatingStatus || !canUpdateLead}
          />
          {vm.totalPages > 1 && (
            <div className="flex flex-wrap items-center justify-end gap-3">
              <span className="text-xs text-nx-ink-3">
                {t("leads.pagination.page", {
                  page: String(vm.page),
                  total: String(vm.totalPages),
                })}
              </span>
              <Pagination className="mx-0 w-auto justify-end">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      aria-disabled={vm.page <= 1 || vm.isLoading || undefined}
                      tabIndex={vm.page <= 1 || vm.isLoading ? -1 : undefined}
                      className={cn(
                        "h-8",
                        (vm.page <= 1 || vm.isLoading) && "pointer-events-none opacity-50"
                      )}
                      onClick={(e) => {
                        e.preventDefault();
                        vm.handlePageChange(vm.page - 1);
                      }}
                    />
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      aria-disabled={vm.page >= vm.totalPages || vm.isLoading || undefined}
                      tabIndex={vm.page >= vm.totalPages || vm.isLoading ? -1 : undefined}
                      className={cn(
                        "h-8",
                        (vm.page >= vm.totalPages || vm.isLoading) &&
                          "pointer-events-none opacity-50"
                      )}
                      onClick={(e) => {
                        e.preventDefault();
                        vm.handlePageChange(vm.page + 1);
                      }}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </div>
      ) : (
        <GenericTable
          data={leads}
          columns={columns}
          actions={actions}
          loading={vm.isLoading}
          selectable={true}
          selectedItems={Array.from(vm.selectedIds)}
          onSelectionChange={vm.handleSelectionChange}
          pagination={{
            itemsCount: vm.totalCount,
            pageSize: vm.pageSize,
            currentPage: vm.page,
            pagesCount: vm.totalPages,
            onPageChange: vm.handlePageChange,
          }}
          emptyMessage={<EmptyState bare icon={Inbox} title={t("leads.empty")} />}
        />
      )}

      {/* ── Lead Detail Drawer ── */}
      <LeadDetailDrawer
        open={vm.isDrawerOpen}
        onClose={vm.handleCloseDrawer}
        lead={vm.selectedLead}
        isLoading={vm.isLoadingDetail}
        onUpdateStatus={vm.handleUpdateStatus}
        isUpdatingStatus={vm.isUpdatingStatus}
        onGetEmailPreview={vm.handleGetEmailPreview}
        onConvert={canConvertLead ? vm.handleOpenConvertDialog : undefined}
        onAssign={canAssignLead ? vm.handleOpenAssignDialog : undefined}
        onDelete={canDeleteLead ? vm.handleCloseLead : undefined}
        isDeletingLead={vm.isDeletingLead}
        activity={vm.activity}
        isLoadingActivity={vm.isLoadingActivity}
        onAddNote={vm.handleAddNote}
        isAddingNote={vm.isAddingNote}
        onSendEmail={
          canSendEmail
            ? async (params) => {
                await vm.sendLeadEmail(params);
              }
            : undefined
        }
        isSendingEmail={vm.isSendingEmail}
        communicationLogs={vm.communicationLogs}
        isLoadingComms={vm.isLoadingComms}
      />

      {/* ── Create Lead Dialog ── */}
      <CreateLeadDialog
        open={vm.isCreateDialogOpen}
        onClose={vm.handleCloseCreateDialog}
        onSubmit={vm.handleCreateLead}
        isSubmitting={vm.isCreatingLead}
        availableEditions={vm.availableEditions}
      />

      {/* ── Convert to Tenant Wizard ── */}
      <ConvertToTenantWizard
        open={vm.isConvertDialogOpen}
        lead={vm.convertLead}
        isConverting={vm.isConvertingLead}
        onClose={vm.handleCloseConvertDialog}
        onConvert={vm.handleConvertToTenant}
      />

      {/* ── Assign Lead Dialog ── */}
      <AssignLeadDialog
        open={vm.isAssignDialogOpen}
        lead={vm.assignLead}
        isAssigning={vm.isAssigningLead}
        onClose={vm.handleCloseAssignDialog}
        onAssign={vm.handleAssignLead}
        onSearchAdmins={vm.searchAssignableAdmins}
      />

      {/* ── Bulk Confirm Dialog ── */}
      <AlertDialog
        open={vm.isBulkConfirmOpen}
        onOpenChange={(o) => !o && vm.handleCancelBulkConfirm()}
      >
        <AlertDialogContent className="border-nx-line bg-nx-ground">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-nx-ink">
              {vm.bulkConfirmAction === "close"
                ? t("leads.bulk.confirmCloseTitle", { count: String(vm.selectedCount) })
                : t("leads.bulk.confirmDeleteTitle", { count: String(vm.selectedCount) })}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-nx-ink-2">
              {vm.bulkConfirmAction === "close"
                ? t("leads.bulk.confirmCloseDesc")
                : t("leads.bulk.confirmDeleteDesc")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              className="border-nx-line text-nx-ink hover:bg-nx-hover"
              disabled={isAnyBulkPending}
            >
              {t("leads.bulk.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              id="leads-bulk-confirm-btn"
              onClick={vm.handleConfirmBulkAction}
              disabled={isAnyBulkPending}
              className={
                vm.bulkConfirmAction === "delete"
                  ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  : "bg-warning text-warning-foreground hover:bg-warning/90"
              }
            >
              {isAnyBulkPending
                ? t("leads.bulk.processing")
                : vm.bulkConfirmAction === "close"
                  ? t("leads.bulk.confirmClose")
                  : t("leads.bulk.confirmDelete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ── Floating Bulk Action Bar ── */}
      <BulkActionBar
        count={vm.selectedCount}
        onClose={vm.handleOpenBulkClose}
        onDelete={vm.handleOpenBulkDelete}
        onClear={vm.handleClearSelection}
        isLoading={isAnyBulkPending}
        canClose={canUpdateLead}
        canDelete={canDeleteLead}
      />
    </div>
  );
}
