"use client";

import { useLeadsViewModel } from "../viewmodels/useLeadsViewModel";
import { LeadDetailDrawer } from "../components/LeadDetailDrawer";
import { CreateLeadDialog } from "../components/CreateLeadDialog";
import { ConvertToTenantDialog } from "../components/ConvertToTenantDialog";
import { AssignLeadDialog } from "../components/AssignLeadDialog";
import { StatPill } from "../components/StatPill";
import { BulkActionBar } from "../components/BulkActionBar";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@core/ui/select";
import { GenericTable, type Column } from "@core/crud/components/generic-table";
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
import { useI18n } from "@core/providers/i18n-provider";
import { type PlatformLeadListItem, type LeadStatus } from "../../domain/entities/PlatformLead";

// ── Constants ─────────────────────────────────────────────────────────────────

const ALL_STATUSES: LeadStatus[] = ["New", "Contacted", "Qualified", "Converted", "Closed"];

const STATUS_STYLES: Record<LeadStatus, string> = {
  New: "bg-blue-500/15 text-blue-300 border-blue-500/30",
  Contacted: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  Qualified: "bg-violet-500/15 text-violet-300 border-violet-500/30",
  Converted: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  Closed: "bg-zinc-500/15 text-zinc-400 border-zinc-500/30",
};

const STATUS_DOTS: Record<LeadStatus, string> = {
  New: "bg-blue-400",
  Contacted: "bg-amber-400",
  Qualified: "bg-violet-400",
  Converted: "bg-emerald-400",
  Closed: "bg-zinc-500",
};

// ── Main view ─────────────────────────────────────────────────────────────────

export function LeadsView() {
  const vm = useLeadsViewModel();
  const { t } = useI18n();

  const leads = vm.leads;
  const isAnyBulkPending = vm.isBulkClosing || vm.isBulkDeleting;

  const columns: Column<PlatformLeadListItem>[] = [
    {
      key: "companyName",
      label: t("leads.columns.company"),
      render: (_, lead) => (
        <div className="h-full w-full cursor-pointer" onClick={() => vm.handleOpenDrawer(lead.id)}>
          <p className="truncate font-medium text-white transition-colors group-hover:text-indigo-300">
            {lead.companyName}
          </p>
          {lead.discoveryTagKeys.length > 0 && (
            <div className="mt-1 flex flex-wrap items-center gap-1">
              {lead.discoveryTagKeys.map(({ key, raw }) => (
                <span
                  key={key}
                  className="inline-flex items-center rounded border border-violet-500/20 bg-violet-500/10 px-1.5 py-0.5 text-[10px] text-violet-400"
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
          <p className="truncate text-zinc-300">{lead.contactName}</p>
          <p className="mt-0.5 truncate text-xs text-zinc-500">{lead.email}</p>
        </div>
      ),
    },
    {
      key: "editionKey",
      label: t("leads.columns.edition"),
      render: (_, lead) => (
        <div className="h-full w-full cursor-pointer" onClick={() => vm.handleOpenDrawer(lead.id)}>
          {lead.editionKey ? (
            <span className="font-mono text-xs text-zinc-400">{lead.editionKey}</span>
          ) : (
            <span className="text-zinc-600">—</span>
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
            className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[lead.status]}`}
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
          <p className="text-xs text-zinc-500">{lead.relativeCreatedAt}</p>
          <p className="mt-0.5 text-[10px] text-zinc-600">{t(lead.sourceKey)}</p>
        </div>
      ),
    },
  ];

  const actions = [
    {
      label: t("leads.actions.assign"),
      onClick: (lead: PlatformLeadListItem) => vm.handleOpenAssignDialog(lead.id),
      show: (lead: PlatformLeadListItem) => lead.status !== "Converted" && lead.status !== "Closed",
    },
    {
      label: t("leads.actions.convert"),
      onClick: (lead: PlatformLeadListItem) => vm.handleOpenConvertDialog(lead.id),
      show: (lead: PlatformLeadListItem) => lead.status !== "Converted" && lead.status !== "Closed",
    },
    {
      label: t("leads.actions.delete"),
      onClick: (lead: PlatformLeadListItem) => vm.handleDeleteLead(lead.id),
      variant: "destructive" as const,
    },
  ];

  return (
    <div className="space-y-6">
      {/* ── Page Header ── */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-white">{t("leads.title")}</h1>
          <p className="mt-1 text-sm text-zinc-400">
            {t("leads.subtitle")} &mdash; {t("leads.totalCount", { count: String(vm.totalCount) })}
          </p>
        </div>

        {/* Stats bar + Create button */}
        <div className="flex flex-wrap items-center gap-2">
          <StatPill
            label={t("leads.statsBar.new")}
            value={vm.stats.new}
            accent="border-blue-500/30 text-blue-400"
          />
          <StatPill
            label={t("leads.statsBar.qualified")}
            value={vm.stats.qualified}
            accent="border-violet-500/30 text-violet-400"
          />
          <StatPill
            label={t("leads.statsBar.converted")}
            value={vm.stats.converted}
            accent="border-emerald-500/30 text-emerald-400"
          />
          <Button
            id="leads-create-btn"
            onClick={vm.handleOpenCreateDialog}
            size="sm"
            className="ms-2 h-8 bg-indigo-600 px-3 text-xs text-white hover:bg-indigo-500"
          >
            {t("leads.createButton")}
          </Button>
        </div>
      </div>

      {/* ── Filters ── */}
      <div className="flex flex-wrap items-center gap-3">
        <Input
          id="leads-search"
          placeholder={t("leads.searchPlaceholder")}
          value={vm.search}
          onChange={(e) => vm.handleSearchChange(e.target.value)}
          className="w-72 border-zinc-700 bg-zinc-900 text-white placeholder:text-zinc-500"
        />
        <Select
          value={vm.statusFilter ?? "all"}
          onValueChange={(v) =>
            vm.handleStatusFilterChange(v === "all" ? undefined : (v as LeadStatus))
          }
        >
          <SelectTrigger
            id="leads-status-filter"
            className="w-44 border-zinc-700 bg-zinc-900 text-white"
          >
            <SelectValue placeholder={t("leads.allStatuses")} />
          </SelectTrigger>
          <SelectContent className="border-zinc-700 bg-zinc-900">
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

      {/* ── Generic Table ── */}
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
        emptyMessage={t("leads.empty")}
      />

      {/* ── Lead Detail Drawer ── */}
      <LeadDetailDrawer
        open={vm.isDrawerOpen}
        onClose={vm.handleCloseDrawer}
        lead={vm.selectedLead}
        isLoading={vm.isLoadingDetail}
        onUpdateStatus={vm.handleUpdateStatus}
        isUpdatingStatus={vm.isUpdatingStatus}
        onConvert={vm.handleOpenConvertDialog}
        onAssign={vm.handleOpenAssignDialog}
        onDelete={vm.handleDeleteLead}
        isDeletingLead={vm.isDeletingLead}
        activity={vm.activity}
        isLoadingActivity={vm.isLoadingActivity}
      />

      {/* ── Create Lead Dialog ── */}
      <CreateLeadDialog
        open={vm.isCreateDialogOpen}
        onClose={vm.handleCloseCreateDialog}
        onSubmit={vm.handleCreateLead}
        isSubmitting={vm.isCreatingLead}
        availableEditions={[]}
      />

      {/* ── Convert to Tenant Dialog ── */}
      <ConvertToTenantDialog
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
        <AlertDialogContent className="border-zinc-800 bg-zinc-950">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">
              {vm.bulkConfirmAction === "close"
                ? t("leads.bulk.confirmCloseTitle", { count: String(vm.selectedCount) })
                : t("leads.bulk.confirmDeleteTitle", { count: String(vm.selectedCount) })}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-400">
              {vm.bulkConfirmAction === "close"
                ? t("leads.bulk.confirmCloseDesc")
                : t("leads.bulk.confirmDeleteDesc")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
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
                  ? "bg-red-600 text-white hover:bg-red-500"
                  : "bg-amber-600 text-white hover:bg-amber-500"
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
      />
    </div>
  );
}
