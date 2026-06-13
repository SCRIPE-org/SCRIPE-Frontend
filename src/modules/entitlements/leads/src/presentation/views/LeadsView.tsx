"use client";

import { useLeadsViewModel } from "../viewmodels/useLeadsViewModel";
import { LeadDetailDrawer } from "../components/LeadDetailDrawer";
import { CreateLeadDialog } from "../components/CreateLeadDialog";
import { ConvertToTenantDialog } from "../components/ConvertToTenantDialog";
import { AssignLeadDialog } from "../components/AssignLeadDialog";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { Checkbox } from "@core/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@core/ui/select";
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
import type { LeadStatus } from "../../domain/entities/PlatformLead";

// ── Constants ─────────────────────────────────────────────────────────────────

const ALL_STATUSES: LeadStatus[] = ["New", "Contacted", "Qualified", "Converted", "Closed"];

const STATUS_STYLES: Record<LeadStatus, string> = {
  New:       "bg-blue-500/15 text-blue-300 border-blue-500/30",
  Contacted: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  Qualified: "bg-violet-500/15 text-violet-300 border-violet-500/30",
  Converted: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  Closed:    "bg-zinc-500/15 text-zinc-400 border-zinc-500/30",
};

const STATUS_DOTS: Record<LeadStatus, string> = {
  New:       "bg-blue-400",
  Contacted: "bg-amber-400",
  Qualified: "bg-violet-400",
  Converted: "bg-emerald-400",
  Closed:    "bg-zinc-500",
};

// ── Stats pill ────────────────────────────────────────────────────────────────

function StatPill({ label, value, accent }: { label: string; value: number; accent: string }) {
  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${accent} bg-current/5`}>
      <span className="text-lg font-bold tabular-nums">{value}</span>
      <span className="text-xs text-zinc-400 whitespace-nowrap">{label}</span>
    </div>
  );
}

// ── Floating Bulk Action Bar ──────────────────────────────────────────────────

function BulkActionBar({
  count,
  onClose,
  onDelete,
  onClear,
  isLoading,
}: {
  count: number;
  onClose: () => void;
  onDelete: () => void;
  onClear: () => void;
  isLoading: boolean;
}) {
  const { t } = useI18n();
  return (
    <div
      className={`
        fixed bottom-6 left-1/2 -translate-x-1/2 z-50
        flex items-center gap-3 px-5 py-3 rounded-2xl
        bg-zinc-900 border border-zinc-700 shadow-2xl shadow-black/60
        backdrop-blur-sm
        transition-all duration-300
        ${count > 0 ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-4 pointer-events-none"}
      `}
      aria-live="polite"
    >
      {/* Selection count */}
      <span className="text-sm font-medium text-white tabular-nums">
        {t("leads.bulk.selectedCount", { count: String(count) })}
      </span>

      <div className="h-4 w-px bg-zinc-700" />

      {/* Close selected */}
      <Button
        id="leads-bulk-close-btn"
        size="sm"
        disabled={isLoading}
        onClick={onClose}
        className="h-8 px-3 bg-amber-600 hover:bg-amber-500 text-white text-xs font-medium"
      >
        {isLoading
          ? t("leads.bulk.closing")
          : t("leads.bulk.closeSelected", { count: String(count) })}
      </Button>

      {/* Delete selected */}
      <Button
        id="leads-bulk-delete-btn"
        size="sm"
        variant="destructive"
        disabled={isLoading}
        onClick={onDelete}
        className="h-8 px-3 text-xs font-medium"
      >
        {t("leads.bulk.deleteSelected", { count: String(count) })}
      </Button>

      <div className="h-4 w-px bg-zinc-700" />

      {/* Clear */}
      <button
        id="leads-bulk-clear-btn"
        onClick={onClear}
        className="text-xs text-zinc-400 hover:text-white transition-colors"
        aria-label={t("leads.bulk.clearSelection")}
      >
        ✕
      </button>
    </div>
  );
}

// ── Main view ─────────────────────────────────────────────────────────────────

export function LeadsView() {
  const vm = useLeadsViewModel();
  const { t } = useI18n();

  const leads = vm.leads;
  const allPageSelected = leads.length > 0 && leads.every((l) => vm.selectedIds.has(l.id));
  const someSelected     = leads.some((l) => vm.selectedIds.has(l.id));

  const isAnyBulkPending = vm.isBulkClosing || vm.isBulkDeleting;

  return (
    <div className="space-y-6">

      {/* ── Page Header ── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold text-white">{t("leads.title")}</h1>
          <p className="text-sm text-zinc-400 mt-1">
            {t("leads.subtitle")} &mdash;{" "}
            {t("leads.totalCount", { count: String(vm.totalCount) })}
          </p>
        </div>

        {/* Stats bar + Create button */}
        <div className="flex items-center gap-2 flex-wrap">
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
            className="ms-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs h-8 px-3"
          >
            {t("leads.createButton")}
          </Button>
        </div>
      </div>

      {/* ── Filters ── */}
      <div className="flex items-center gap-3 flex-wrap">
        <Input
          id="leads-search"
          placeholder={t("leads.searchPlaceholder")}
          value={vm.search}
          onChange={(e) => vm.handleSearchChange(e.target.value)}
          className="w-72 bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500"
        />
        <Select
          value={vm.statusFilter ?? "all"}
          onValueChange={(v) =>
            vm.handleStatusFilterChange(v === "all" ? undefined : (v as LeadStatus))
          }
        >
          <SelectTrigger
            id="leads-status-filter"
            className="w-44 bg-zinc-900 border-zinc-700 text-white"
          >
            <SelectValue placeholder={t("leads.allStatuses")} />
          </SelectTrigger>
          <SelectContent className="bg-zinc-900 border-zinc-700">
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

      {/* ── Table ── */}
      <div className="rounded-xl border border-zinc-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-zinc-900 border-b border-zinc-800">
            <tr>
              {/* Select-all checkbox */}
              <th className="px-4 py-3 w-10">
                <Checkbox
                  id="leads-select-all"
                  checked={allPageSelected}
                  data-state={someSelected && !allPageSelected ? "indeterminate" : undefined}
                  onCheckedChange={() => vm.handleSelectAll(leads)}
                  aria-label={t("leads.bulk.selectAll")}
                  className="border-zinc-600 data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600"
                />
              </th>
              <th className="text-start px-4 py-3 text-zinc-400 font-medium w-[28%]">
                {t("leads.columns.company")}
              </th>
              <th className="text-start px-4 py-3 text-zinc-400 font-medium">
                {t("leads.columns.contact")}
              </th>
              <th className="text-start px-4 py-3 text-zinc-400 font-medium hidden lg:table-cell">
                {t("leads.columns.edition")}
              </th>
              <th className="text-start px-4 py-3 text-zinc-400 font-medium">
                {t("leads.columns.status")}
              </th>
              <th className="text-start px-4 py-3 text-zinc-400 font-medium hidden md:table-cell">
                {t("leads.columns.created")}
              </th>
            </tr>
          </thead>
          <tbody>
            {vm.isLoading ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-zinc-500">
                  {t("leads.loading")}
                </td>
              </tr>
            ) : leads.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-zinc-500">
                  {t("leads.empty")}
                </td>
              </tr>
            ) : (
              leads.map((lead) => {
                const isSelected = vm.selectedIds.has(lead.id);
                return (
                  <tr
                    key={lead.id}
                    id={`lead-row-${lead.id}`}
                    className={`border-t border-zinc-800/50 transition-colors group
                      ${isSelected ? "bg-indigo-950/30" : "hover:bg-zinc-800/40"}
                    `}
                  >
                    {/* Row checkbox — stops row click propagation */}
                    <td
                      className="px-4 py-3 w-10"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Checkbox
                        id={`lead-check-${lead.id}`}
                        checked={isSelected}
                        onCheckedChange={() => vm.handleToggleSelect(lead.id)}
                        aria-label={t("leads.bulk.selectRow", { company: lead.companyName })}
                        className="border-zinc-600 data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600"
                      />
                    </td>

                    {/* Company + discovery tags — click opens drawer */}
                    <td
                      className="px-4 py-3 cursor-pointer"
                      onClick={() => vm.handleOpenDrawer(lead.id)}
                    >
                      <p className="text-white font-medium group-hover:text-indigo-300 transition-colors truncate">
                        {lead.companyName}
                      </p>
                      {lead.discoveryTagKeys.length > 0 && (
                        <div className="flex items-center gap-1 mt-1 flex-wrap">
                          {lead.discoveryTagKeys.map(({ key, raw }) => (
                            <span
                              key={key}
                              className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px]
                                bg-violet-500/10 text-violet-400 border border-violet-500/20"
                            >
                              {raw ? key : t(key)}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>

                    {/* Contact + email */}
                    <td
                      className="px-4 py-3 cursor-pointer"
                      onClick={() => vm.handleOpenDrawer(lead.id)}
                    >
                      <p className="text-zinc-300 truncate">{lead.contactName}</p>
                      <p className="text-zinc-500 text-xs truncate mt-0.5">{lead.email}</p>
                    </td>

                    {/* Edition */}
                    <td
                      className="px-4 py-3 hidden lg:table-cell cursor-pointer"
                      onClick={() => vm.handleOpenDrawer(lead.id)}
                    >
                      {lead.editionKey ? (
                        <span className="text-zinc-400 text-xs font-mono">
                          {lead.editionKey}
                        </span>
                      ) : (
                        <span className="text-zinc-600">—</span>
                      )}
                    </td>

                    {/* Status badge */}
                    <td
                      className="px-4 py-3 cursor-pointer"
                      onClick={() => vm.handleOpenDrawer(lead.id)}
                    >
                      <span
                        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md
                          text-xs font-medium border ${STATUS_STYLES[lead.status]}`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOTS[lead.status]}`} />
                        {t(`leads.status.${lead.status}`)}
                      </span>
                    </td>

                    {/* Relative time + source */}
                    <td
                      className="px-4 py-3 hidden md:table-cell cursor-pointer"
                      onClick={() => vm.handleOpenDrawer(lead.id)}
                    >
                      <p className="text-zinc-500 text-xs">{lead.relativeCreatedAt}</p>
                      <p className="text-zinc-600 text-[10px] mt-0.5">
                        {t(lead.sourceKey)}
                      </p>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ── Pagination ── */}
      {vm.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-zinc-400">
          <span>
            {t("leads.pagination.page", {
              page: String(vm.page),
              total: String(vm.totalPages),
            })}
          </span>
          <div className="flex gap-2">
            <Button
              id="leads-prev-page"
              variant="outline"
              size="sm"
              disabled={vm.page <= 1}
              onClick={() => vm.handlePageChange(vm.page - 1)}
              className="border-zinc-700 text-zinc-400 hover:text-white"
            >
              {t("leads.pagination.previous")}
            </Button>
            <Button
              id="leads-next-page"
              variant="outline"
              size="sm"
              disabled={vm.page >= vm.totalPages}
              onClick={() => vm.handlePageChange(vm.page + 1)}
              className="border-zinc-700 text-zinc-400 hover:text-white"
            >
              {t("leads.pagination.next")}
            </Button>
          </div>
        </div>
      )}

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
        lead={vm.selectedLead}
        isConverting={vm.isConvertingLead}
        onClose={vm.handleCloseConvertDialog}
        onConvert={vm.handleConvertToTenant}
      />

      {/* ── Assign Lead Dialog ── */}
      <AssignLeadDialog
        open={vm.isAssignDialogOpen}
        lead={vm.selectedLead}
        isAssigning={vm.isAssigningLead}
        onClose={vm.handleCloseAssignDialog}
        onAssign={vm.handleAssignLead}
      />

      {/* ── Bulk Confirm Dialog ── */}
      <AlertDialog open={vm.isBulkConfirmOpen} onOpenChange={(o) => !o && vm.handleCancelBulkConfirm()}>
        <AlertDialogContent className="bg-zinc-950 border-zinc-800">
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
                  ? "bg-red-600 hover:bg-red-500 text-white"
                  : "bg-amber-600 hover:bg-amber-500 text-white"
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
