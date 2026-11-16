"use client";

import { useI18n } from "@core/providers/i18n-provider";
import { GenericCrudView } from "@core/crud/components/generic-crud-view";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import type { SovereignAuditEntry } from "../../domain/entities/SovereignAccountEntities";
import { useAccountActivityConsoleViewModel } from "../viewmodels/useAccountActivityConsoleViewModel";
import { ForensicPayloadDrawer } from "../components/ForensicPayloadDrawer";
import { ActivityPageSkeleton } from "../components/AccountSkeletons";
import { AccountSliceErrorState } from "../components/AccountSliceErrorState";
import { ActivityFilterToolbarSection } from "../sections/activity/ActivityFilterToolbarSection";
import {
  ActivityEmptyState,
  ActivityEntryCard,
  createActivityLedgerColumns,
} from "../sections/activity/ActivityLedgerColumns";
import { ActivityPaginationBar } from "../sections/activity/ActivityPaginationBar";
import { ChevronRight, Code, Download, RefreshCw } from "lucide-react";

const noop = () => {};

/**
 * SOC2 compliance audit ledger view (/account/activity) backed by server-paginated queries,
 * backend category/outcome filtering, UTC window presets, and forensic payload inspection.
 */
export function AccountActivityView() {
  const { t } = useI18n();
  const vm = useAccountActivityConsoleViewModel({ initialPageSize: 20 });

  if (vm.isLoadingActivity && !vm.activity && !vm.isActivityError) {
    return <ActivityPageSkeleton />;
  }

  if (vm.isActivityError && !vm.activity) {
    return (
      <AccountSliceErrorState
        title={t("profile.activity.title")}
        description={t("profile.activity.description")}
        message={vm.activityError}
        onRetry={() => void vm.refreshActivity()}
      />
    );
  }

  const crudViewModel = {
    items: vm.entries,
    loading: vm.isLoadingActivity,
    error: vm.activityError ?? null,
    selectedItems: [] as string[],
    setSelectedItems: noop,
    isCreateModalOpen: false,
    setIsCreateModalOpen: noop,
    isEditModalOpen: false,
    closeEditModal: noop,
    viewModalOpen: false,
    closeViewModal: noop,
    editingItem: null,
    viewItem: null,
    refresh: () => void vm.refreshActivity(),
    refreshItems: async () => {
      await vm.refreshActivity();
    },
    searchValue: vm.searchInput,
    handleSearchChange: vm.setSearchInput,
    changePage: vm.setPage,
  };

  return (
    <div className="space-y-6 min-w-0">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-nx-ink">
            {t("profile.activity.title")}
          </h1>
          <p className="text-xs text-nx-ink-3 mt-1">{t("profile.activity.description")}</p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className="text-xs font-mono border-nx-line text-nx-ink-2">
            {t("profile.activity.totalEntriesBadge", { count: vm.totalEntries })}
          </Badge>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => void vm.refreshActivity()}
            disabled={vm.isFetchingActivity}
            className="text-xs h-8 gap-1.5 border-nx-line text-nx-ink"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${vm.isFetchingActivity ? "animate-spin" : ""}`}
              aria-hidden="true"
            />
            <span>{t("profile.common.refresh")}</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={vm.exportCsv}
            disabled={vm.entries.length === 0}
            className="text-xs h-8 gap-1.5 font-semibold border-nx-line text-nx-ink"
          >
            <Download className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{t("profile.audit.exportCsvBtn")}</span>
          </Button>
        </div>
      </div>

      <GenericCrudView<SovereignAuditEntry>
        viewModel={crudViewModel}
        emptyState={<ActivityEmptyState t={t} />}
        config={{
          titleKey: "profile.activity.title",
          subtitleKey: "profile.activity.description",
          hidePageHeader: true,
          hideAddButton: true,
          hideActionButtons: true,
          stickyActions: true,
          viewModes: ["Table", "CardGrid"],
          defaultView: "CardGrid",
          searchConfig: { enabled: false },
          cardGridClassName: "grid-cols-1 md:grid-cols-1 xl:grid-cols-1 gap-2.5",
          permissions: { canCreate: false, canUpdate: false, canDelete: false },
          toolbarContent: (
            <Badge variant="outline" className="text-xs font-mono border-nx-line text-nx-ink-2">
              {t("profile.activity.sectionTitle")}
            </Badge>
          ),
          customHeaderContent: (
            <ActivityFilterToolbarSection
              t={t}
              searchInput={vm.searchInput}
              onSearchChange={vm.setSearchInput}
              categoryFilter={vm.categoryFilter}
              onCategoryChange={vm.setCategoryFilter}
              knownCategories={vm.knownCategories}
              outcomeFilter={vm.outcomeFilter}
              onOutcomeChange={vm.setOutcomeFilter}
              datePreset={vm.datePreset}
              onDatePresetChange={vm.setDatePreset}
              customFromLocal={vm.customFromLocal}
              onCustomFromChange={vm.setCustomFromLocal}
              customToLocal={vm.customToLocal}
              onCustomToChange={vm.setCustomToLocal}
            />
          ),
          columns: createActivityLedgerColumns(t),
          renderActions: (entry) => (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => vm.inspectEntry(entry)}
              className="h-8 px-2 text-xs text-nx-ink-2 hover:text-nx-accent gap-1"
            >
              <Code className="h-3.5 w-3.5" aria-hidden="true" />
              <span className="hidden sm:inline">{t("profile.audit.inspectJsonBtn")}</span>
              <ChevronRight className="h-3.5 w-3.5 ms-0.5 rtl:rotate-180" aria-hidden="true" />
            </Button>
          ),
          renderCardGridItem: (entry) => (
            <ActivityEntryCard entry={entry} t={t} onInspect={vm.inspectEntry} />
          ),
          customFooterContent: (
            <ActivityPaginationBar
              t={t}
              page={vm.page}
              hasMore={vm.hasMore}
              isFetching={vm.isFetchingActivity}
              onPreviousPage={vm.goToPreviousPage}
              onNextPage={vm.goToNextPage}
            />
          ),
        }}
      />

      <ForensicPayloadDrawer
        isOpen={vm.isDrawerOpen}
        onClose={vm.closeDrawer}
        entry={vm.selectedEntry}
      />
    </div>
  );
}
