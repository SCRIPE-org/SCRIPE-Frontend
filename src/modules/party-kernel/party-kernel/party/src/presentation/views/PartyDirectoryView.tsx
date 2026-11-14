"use client";

import React, { memo, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { usePartyDirectoryViewModel } from "../viewmodels/usePartyDirectoryViewModel";
import { useModuleLocales } from "@core/hooks/use-module-locales";
import { useI18n } from "@core/providers/i18n-provider";
import { resolveIntlLocale } from "@core/common/utils";
import { useBreadcrumbOverride } from "@core/hooks/use-breadcrumb-override";
import { Button } from "@core/ui/button";
import { Skeleton } from "@core/ui/skeleton";
import { EmptyState } from "@core/ui/empty-state";
import { DataExchangeToolbarActions } from "@core/data-exchange";
import { PartyStatsCards } from "../components/PartyStatsCards";
import { PartyToolbar } from "../components/PartyToolbar";
import { PartyTableSection } from "../components/PartyTableSection";
import { PartyGridSection } from "../components/PartyGridSection";
import { PartyDirectoryDialogs } from "../components/PartyDirectoryDialogs";
import { Search, UserPlus, Building2, Users, RefreshCw } from "lucide-react";

/**
 * Enterprise party directory view supporting table/grid slicing, search, filtering, and create dialogs.
 * Strict FE-V001 compliance (<= 280 lines) with modularized presentation sub-components.
 */
export const PartyDirectoryView = memo(function PartyDirectoryView() {
  useModuleLocales(() => import("../../../locales"), "party-kernel.party");
  const router = useRouter();
  const { t, language } = useI18n();
  const intlLocale = resolveIntlLocale(language);

  const vm = usePartyDirectoryViewModel();
  const [isQuickLookupOpen, setIsQuickLookupOpen] = useState(false);

  useBreadcrumbOverride(
    t("party.directory.breadcrumb") || t("party.directory.title") || "Contacts"
  );

  const handleNavigateToProfile = useCallback(
    (partyId: string) => {
      router.push(`/party-kernel/parties/${partyId}`);
    },
    [router]
  );

  const formatDate = useCallback(
    (isoString?: string) => {
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
    },
    [intlLocale]
  );

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Top Header & Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-nx-ink sm:text-3xl">
            {t("party.directory.title")}
          </h1>
          <p className="mt-1 text-sm text-nx-ink-2">{t("party.directory.description")}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsQuickLookupOpen(true)}
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
            <RefreshCw className={`h-4 w-4 ${vm.isFetching ? "animate-spin" : ""}`} />
            <span className="sr-only sm:not-sr-only">
              {t("party.directory.refresh") || "Refresh"}
            </span>
          </Button>

          <DataExchangeToolbarActions
            entityKey="party.person"
            enableMultiSheetMigration
            multiSheetEntityKeys={["party.organization", "party.person", "party.contact-point"]}
            onImportComplete={() => vm.refetch()}
          />

          {vm.permissions.canCreatePerson && (
            <Button onClick={() => vm.setIsCreatePersonOpen(true)} className="gap-2">
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

      {/* Metric / Stats Filter Chips */}
      <PartyStatsCards
        stats={vm.stats}
        selectedType={vm.selectedType}
        onSelectType={vm.setSelectedType}
      />

      {/* Search, Sort, View Controls */}
      <PartyToolbar
        searchTerm={vm.searchTerm}
        onSearchChange={vm.setSearchTerm}
        sortBy={vm.sortBy}
        onSortChange={vm.setSortBy}
        viewMode={vm.viewMode}
        onViewModeChange={vm.setViewMode}
      />

      {/* Content View */}
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
        <PartyTableSection
          parties={vm.parties}
          formatDate={formatDate}
          onNavigateToProfile={handleNavigateToProfile}
          onPreviewParty={vm.setPreviewParty}
          onEditParty={vm.setEditingParty}
          onDeleteParty={vm.setDeletingParty}
          canEdit={vm.permissions.canEdit}
          canDelete={vm.permissions.canDelete}
        />
      ) : (
        <PartyGridSection
          parties={vm.parties}
          formatDate={formatDate}
          onNavigateToProfile={handleNavigateToProfile}
          onPreviewParty={vm.setPreviewParty}
          onEditParty={vm.setEditingParty}
          onDeleteParty={vm.setDeletingParty}
          canEdit={vm.permissions.canEdit}
          canDelete={vm.permissions.canDelete}
        />
      )}

      {/* Pagination */}
      {vm.totalPages > 1 && (
        <div className="border-nx-line flex items-center justify-between border-t pt-4">
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

      {/* Dialogs & Sheets */}
      <PartyDirectoryDialogs
        vm={vm}
        isQuickLookupOpen={isQuickLookupOpen}
        onQuickLookupOpenChange={setIsQuickLookupOpen}
        onNavigateToProfile={handleNavigateToProfile}
      />
    </div>
  );
});
