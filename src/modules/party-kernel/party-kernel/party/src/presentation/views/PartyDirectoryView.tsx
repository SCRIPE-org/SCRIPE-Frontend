"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  usePartyDirectoryViewModel,
  type PartyDirectorySort,
} from "../viewmodels/usePartyDirectoryViewModel";
import { useModuleLocales } from "@core/hooks/use-module-locales";
import { useI18n } from "@core/providers/i18n-provider";
import { resolveIntlLocale } from "@core/common/utils";

import { useBreadcrumbOverride } from "@core/hooks/use-breadcrumb-override";

// Design System Primitives (@core/ui/*)
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { Badge } from "@core/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@core/ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@core/ui/table";
import { Skeleton } from "@core/ui/skeleton";
import { EmptyState } from "@core/ui/empty-state";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@core/ui/dropdown-menu";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@core/ui/select";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@core/ui/dialog";

// Dialogs & Sheets
import { CreatePersonDialog } from "../components/dialogs/CreatePersonDialog";
import { CreateOrganizationDialog } from "../components/dialogs/CreateOrganizationDialog";
import { EditPartyDialog } from "../components/dialogs/EditPartyDialog";
import { DeletePartyDialog } from "../components/dialogs/DeletePartyDialog";
import { PartyQuickPreviewSheet } from "../components/PartyQuickPreviewSheet";
import { PartyPicker, type PartySelectionResult } from "../components/PartyPicker";

// Icons
import {
  Search,
  UserPlus,
  Building2,
  Users,
  LayoutGrid,
  List,
  MoreVertical,
  ExternalLink,
  Edit3,
  Trash2,
  Calendar,
  Building,
  User,
  ArrowRight,
  RefreshCw,
  Eye,
} from "lucide-react";

/**
 * Enterprise party directory view supporting table/grid slicing, search, filtering, and create dialogs.
 */
export const PartyDirectoryView = React.memo(function PartyDirectoryView() {
  useModuleLocales(() => import("../../../locales"), "party-kernel.party");
  const router = useRouter();
  const { t, language } = useI18n();
  const intlLocale = resolveIntlLocale(language);

  const vm = usePartyDirectoryViewModel();
  const [isPickerDemoOpen, setIsPickerDemoOpen] = React.useState(false);
  const [pickerSelection, setPickerSelection] = React.useState<PartySelectionResult | null>(null);

  // Customer-facing naming strictly unified to Contacts / جهات الاتصال
  useBreadcrumbOverride(t("party.directory.breadcrumb") || t("party.directory.title") || "Contacts");

  const handleNavigateToProfile = (partyId: string) => {
    router.push(`/party-kernel/parties/${partyId}`);
  };

  const formatDate = (isoString?: string) => {
    if (!isoString) return "—";
    try {
      return new Intl.DateTimeFormat(intlLocale, {
        year: "numeric",
        month: "short",
        day: "numeric",
      }).format(new Date(isoString));
    } catch {
      return isoString;
    }
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      {/* ── Top Header & Actions ───────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-nx-ink sm:text-3xl">
            {t("party.directory.title")}
          </h1>
          <p className="mt-1 text-sm text-nx-ink-2">
            {t("party.directory.description")}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsPickerDemoOpen(true)}
            className="gap-1.5"
            data-testid="open-party-picker-btn"
          >
            <Search className="h-4 w-4 text-nx-accent" />
            <span>{t("party.picker.findExisting") || "Quick Lookup"}</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => vm.refetch()}
            disabled={vm.isFetching}
            className="gap-1.5"
          >
            <RefreshCw
              className={`h-4 w-4 ${vm.isFetching ? "animate-spin" : ""}`}
            />
            <span className="sr-only sm:not-sr-only">
              {t("party.directory.refresh") || "Refresh"}
            </span>
          </Button>

          {vm.permissions.canCreatePerson && (
            <Button
              onClick={() => vm.setIsCreatePersonOpen(true)}
              className="gap-2"
            >
              <UserPlus className="h-4 w-4" />
              <span>{t("party.directory.newPerson")}</span>
            </Button>
          )}

          {vm.permissions.canCreateOrg && (
            <Button
              variant="secondary"
              onClick={() => vm.setIsCreateOrgOpen(true)}
              className="gap-2"
            >
              <Building2 className="h-4 w-4" />
              <span>{t("party.directory.newOrganization")}</span>
            </Button>
          )}
        </div>
      </div>

      {/* ── Metric / Stats Filter Chips ────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Total Parties */}
        <Card
          role="button"
          tabIndex={0}
          onClick={() => vm.setSelectedType("all")}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              vm.setSelectedType("all");
            }
          }}
          className={`flex items-center justify-between rounded-xl p-4 text-start transition-all cursor-pointer border ${
            vm.selectedType === "all"
              ? "bg-nx-accent/5 border-nx-accent shadow-sm"
              : "bg-nx-surface border-nx-border hover:bg-nx-surface-2"
          }`}
        >
          <div className="space-y-1">
            <span className="text-xs font-medium text-nx-ink-2">
              {t("party.directory.totalParties")}
            </span>
            <div className="text-2xl font-bold text-nx-ink">
              {vm.stats.total}
            </div>
          </div>
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-lg ${
              vm.selectedType === "all"
                ? "bg-nx-accent-fill text-nx-on-fill"
                : "bg-nx-surface-2 text-nx-ink-2"
            }`}
          >
            <Users className="h-5 w-5" />
          </div>
        </Card>

        {/* People */}
        <Card
          role="button"
          tabIndex={0}
          onClick={() => vm.setSelectedType("Person")}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              vm.setSelectedType("Person");
            }
          }}
          className={`flex items-center justify-between rounded-xl p-4 text-start transition-all cursor-pointer border ${
            vm.selectedType === "Person"
              ? "bg-blue-500/5 border-blue-500 shadow-sm"
              : "bg-nx-surface border-nx-border hover:bg-nx-surface-2"
          }`}
        >
          <div className="space-y-1">
            <span className="text-xs font-medium text-nx-ink-2">
              {t("party.directory.totalPeople")}
            </span>
            <div className="text-2xl font-bold text-nx-ink">
              {vm.stats.people}
            </div>
          </div>
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-lg ${
              vm.selectedType === "Person"
                ? "bg-blue-600 text-white"
                : "bg-nx-surface-2 text-nx-ink-2"
            }`}
          >
            <User className="h-5 w-5" />
          </div>
        </Card>

        {/* Organizations */}
        <Card
          role="button"
          tabIndex={0}
          onClick={() => vm.setSelectedType("Organization")}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              vm.setSelectedType("Organization");
            }
          }}
          className={`flex items-center justify-between rounded-xl p-4 text-start transition-all cursor-pointer border ${
            vm.selectedType === "Organization"
              ? "bg-emerald-500/5 border-emerald-500 shadow-sm"
              : "bg-nx-surface border-nx-border hover:bg-nx-surface-2"
          }`}
        >
          <div className="space-y-1">
            <span className="text-xs font-medium text-nx-ink-2">
              {t("party.directory.totalOrganizations")}
            </span>
            <div className="text-2xl font-bold text-nx-ink">
              {vm.stats.organizations}
            </div>
          </div>
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-lg ${
              vm.selectedType === "Organization"
                ? "bg-emerald-600 text-white"
                : "bg-nx-surface-2 text-nx-ink-2"
            }`}
          >
            <Building className="h-5 w-5" />
          </div>
        </Card>
      </div>

      {/* ── Search, Sort, View Controls ────────────────────────────── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-nx-surface rounded-xl p-3 border border-nx-border">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 rtl:left-auto rtl:right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-nx-ink-3 pointer-events-none" />
          <Input
            value={vm.searchTerm}
            onChange={(e) => vm.setSearchTerm(e.target.value)}
            placeholder={t("party.directory.searchPlaceholder")}
            className="pl-9 rtl:pl-3 rtl:pr-9 bg-nx-surface-2 border-nx-border"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Sort Dropdown */}
          <Select
            value={vm.sortBy}
            onValueChange={(val) => vm.setSortBy(val as PartyDirectorySort)}
          >
            <SelectTrigger className="w-[160px] bg-nx-surface-2 border-nx-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name_asc">
                {t("party.directory.sortNameAsc")}
              </SelectItem>
              <SelectItem value="name_desc">
                {t("party.directory.sortNameDesc")}
              </SelectItem>
              <SelectItem value="newest">
                {t("party.directory.sortNewest")}
              </SelectItem>
            </SelectContent>
          </Select>

          {/* View Mode Toggle */}
          <div className="flex items-center rounded-lg bg-nx-surface-2 p-1 border border-nx-border">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => vm.setViewMode("table")}
              className={`h-7 w-7 rounded-md p-1.5 transition-colors ${
                vm.viewMode === "table"
                  ? "bg-nx-surface text-nx-ink shadow-xs"
                  : "text-nx-ink-3 hover:text-nx-ink"
              }`}
              title={t("party.directory.viewTable")}
              aria-label={t("party.directory.viewTable")}
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => vm.setViewMode("grid")}
              className={`h-7 w-7 rounded-md p-1.5 transition-colors ${
                vm.viewMode === "grid"
                  ? "bg-nx-surface text-nx-ink shadow-xs"
                  : "text-nx-ink-3 hover:text-nx-ink"
              }`}
              title={t("party.directory.viewGrid")}
              aria-label={t("party.directory.viewGrid")}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* ── Content View ───────────────────────────────────────────── */}
      {vm.isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      ) : vm.parties.length === 0 ? (
        <EmptyState
          icon={Users}
          title={t("party.directory.emptyTitle")}
          description={t("party.directory.emptyDesc")}
          action={
            vm.searchTerm || vm.selectedType !== "all" ? (
              <Button
                variant="outline"
                onClick={() => {
                  vm.setSearchTerm("");
                  vm.setSelectedType("all");
                }}
              >
                {t("party.directory.emptyAction")}
              </Button>
            ) : undefined
          }
        />
      ) : vm.viewMode === "table" ? (
        /* Table View */
        <div className="rounded-xl border border-nx-border bg-nx-surface overflow-hidden shadow-xs">
          <Table>
            <TableHeader className="bg-nx-surface-2">
              <TableRow>
                <TableHead className="w-[45%]">
                  {t("party.columns.displayName")}
                </TableHead>
                <TableHead className="w-[20%]">
                  {t("party.columns.type")}
                </TableHead>
                <TableHead className="w-[20%]">
                  {t("party.columns.createdAt")}
                </TableHead>
                <TableHead className="w-[15%] text-end">
                  {t("party.columns.actions")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vm.parties.map((party) => (
                <TableRow
                  key={party.id}
                  className="hover:bg-nx-surface-2/60 transition-colors cursor-pointer group"
                  onClick={() => handleNavigateToProfile(party.id)}
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-nx-accent/10 text-xs font-semibold text-nx-accent">
                        {party.initials}
                      </div>
                      <div className="min-w-0">
                        <div className="font-medium text-nx-ink group-hover:text-nx-accent transition-colors truncate">
                          {party.displayName}
                        </div>
                        <div className="text-xs text-nx-ink-3 truncate max-w-[220px]">
                          {party.isPerson
                            ? t("party.types.Person")
                            : t("party.types.Organization")}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={party.isPerson ? "info" : "success"}>
                      {party.isPerson
                        ? t("party.types.Person")
                        : t("party.types.Organization")}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-nx-ink-2">
                    {formatDate(party.createdAt)}
                  </TableCell>
                  <TableCell className="text-end" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => vm.setPreviewParty(party)}
                        className="h-8 gap-1 text-xs text-nx-ink-2 hover:text-nx-accent"
                        title={t("party.directory.quickPreview")}
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span className="hidden md:inline">
                          {t("party.directory.quickPreview")}
                        </span>
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleNavigateToProfile(party.id)}
                        className="h-8 gap-1 text-xs text-nx-ink-2 hover:text-nx-accent"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">
                          {t("party.directory.viewProfile")}
                        </span>
                      </Button>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => vm.setPreviewParty(party)}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            {t("party.directory.quickPreview")}
                          </DropdownMenuItem>

                          <DropdownMenuItem
                            onClick={() => handleNavigateToProfile(party.id)}
                          >
                            <ExternalLink className="mr-2 h-4 w-4" />
                            {t("party.directory.viewProfile")}
                          </DropdownMenuItem>

                          {vm.permissions.canEdit && (
                            <DropdownMenuItem
                              onClick={() => vm.setEditingParty(party)}
                            >
                              <Edit3 className="mr-2 h-4 w-4" />
                              {t("party.editTitle")}
                            </DropdownMenuItem>
                          )}

                          {vm.permissions.canDelete && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => vm.setDeletingParty(party)}
                                className="text-destructive focus:text-destructive"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                {t("party.deleteTitle")}
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        /* Card Grid View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {vm.parties.map((party) => (
            <Card
              key={party.id}
              className="hover:border-nx-accent/40 transition-all hover:shadow-sm cursor-pointer flex flex-col justify-between"
              onClick={() => handleNavigateToProfile(party.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-nx-accent/10 text-sm font-semibold text-nx-accent">
                      {party.initials}
                    </div>
                    <div className="min-w-0">
                      <CardTitle className="text-base truncate">
                        {party.displayName}
                      </CardTitle>
                      <div className="text-xs text-nx-ink-3 truncate max-w-[180px]">
                        {party.isPerson
                          ? t("party.types.Person")
                          : t("party.types.Organization")}
                      </div>
                    </div>
                  </div>
                  <Badge variant={party.isPerson ? "info" : "success"}>
                    {party.isPerson
                      ? t("party.types.Person")
                      : t("party.types.Organization")}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="pt-0 pb-3 text-xs text-nx-ink-2 space-y-2">
                <div className="flex items-center gap-1.5 text-nx-ink-3">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>
                    {t("party.columns.createdAt")}: {formatDate(party.createdAt)}
                  </span>
                </div>
              </CardContent>

              <div
                className="px-6 py-3 border-t border-nx-border bg-nx-surface-2/40 flex items-center justify-between"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => vm.setPreviewParty(party)}
                    className="gap-1 text-xs text-nx-ink-2 hover:text-nx-accent"
                    title={t("party.directory.quickPreview")}
                  >
                    <Eye className="h-3.5 w-3.5" />
                    <span>{t("party.directory.quickPreview")}</span>
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleNavigateToProfile(party.id)}
                    className="gap-1 text-xs text-nx-accent hover:text-nx-accent"
                  >
                    <span>{t("party.directory.viewProfile")}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </div>

                <div className="flex items-center gap-1">
                  {vm.permissions.canEdit && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-nx-ink-3 hover:text-nx-ink"
                      onClick={() => vm.setEditingParty(party)}
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                  {vm.permissions.canDelete && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-nx-ink-3 hover:text-destructive"
                      onClick={() => vm.setDeletingParty(party)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* ── Pagination ─────────────────────────────────────────────── */}
      {vm.totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-nx-border">
          <div className="text-xs text-nx-ink-2">
            {t("party.directory.paginationInfo", {
              page: vm.page,
              totalPages: vm.totalPages,
              total: vm.totalCount,
            }) || `Page ${vm.page} of ${vm.totalPages} (${vm.totalCount} items)`}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => vm.setPage(Math.max(1, vm.page - 1))}
              disabled={vm.page <= 1}
            >
              {t("common.previous") || "Previous"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => vm.setPage(Math.min(vm.totalPages, vm.page + 1))}
              disabled={vm.page >= vm.totalPages}
            >
              {t("common.next") || "Next"}
            </Button>
          </div>
        </div>
      )}

      {/* ── Dialogs & Sheets ───────────────────────────────────────── */}
      <CreatePersonDialog
        open={vm.isCreatePersonOpen}
        onOpenChange={vm.setIsCreatePersonOpen}
        onSubmit={vm.handleCreatePerson}
        onSuccessNavigate={handleNavigateToProfile}
        existingPartyNames={vm.parties.map((p) => p.displayName)}
      />

      <CreateOrganizationDialog
        open={vm.isCreateOrgOpen}
        onOpenChange={vm.setIsCreateOrgOpen}
        onSubmit={vm.handleCreateOrganization}
        onSuccessNavigate={handleNavigateToProfile}
      />

      <EditPartyDialog
        party={vm.editingParty}
        open={!!vm.editingParty}
        onOpenChange={(open) => !open && vm.setEditingParty(null)}
        onSubmit={vm.handleUpdateName}
      />

      <DeletePartyDialog
        party={vm.deletingParty}
        open={!!vm.deletingParty}
        onOpenChange={(open) => !open && vm.setDeletingParty(null)}
        onConfirm={vm.handleDelete}
      />

      <PartyQuickPreviewSheet
        party={vm.previewParty}
        open={!!vm.previewParty}
        onOpenChange={(open) => !open && vm.setPreviewParty(null)}
        onNavigateToProfile={handleNavigateToProfile}
        onEditParty={(party) => {
          vm.setPreviewParty(null);
          vm.setEditingParty(party);
        }}
      />

      {/* ── PartyPicker Modal ────────────────────────────── */}
      <Dialog open={isPickerDemoOpen} onOpenChange={setIsPickerDemoOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>{t("party.picker.title") || "Select Contact"}</DialogTitle>
            <DialogDescription>
              {t("party.picker.searchPlaceholder") || "Search contacts by name..."}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <PartyPicker
              value={pickerSelection}
              onSelect={setPickerSelection}
              label={t("party.picker.selectedContact") || "Contact Lookup"}
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsPickerDemoOpen(false)}
            >
              {t("party.dialog.cancel") || "Close"}
            </Button>
            {pickerSelection && (
              <Button
                type="button"
                onClick={() => {
                  setIsPickerDemoOpen(false);
                  handleNavigateToProfile(pickerSelection.id);
                }}
              >
                {t("party.directory.viewProfile") || "View Profile"}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
});
