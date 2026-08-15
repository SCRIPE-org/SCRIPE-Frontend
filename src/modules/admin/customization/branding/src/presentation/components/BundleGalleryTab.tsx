// UI-EXCEPTION: compact studio layout
"use client";

/**
 * BundleGalleryTab — Content for the "Bundles" tab in ThemeGalleryView
 *
 * Shows type filter pills, search, sort, grid of BundleCards,
 * pagination, and "Save Current" button.
 *
 * @module customization/presentation
 */
import { cn } from "@/core/common/utils";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { LoadingSpinner } from "@core/ui/loading-spinner";
import { EmptyState } from "@core/ui/empty-state";
import { Search, ChevronLeft, ChevronRight, Save, Inbox } from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
import { BundleCard } from "./BundleCard";
import { BundleDetailModal } from "./BundleDetailModal";
import { SaveBundleDialog } from "./SaveBundleDialog";
import { useThemeBundleViewModel } from "../viewmodels/useThemeBundleViewModel";

const B = "studio.bundles";

/**
 * Presentation UI component rendering the bundle gallery tab.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function BundleGalleryTab() {
  const { t } = useI18n();
  const vm = useThemeBundleViewModel();

  return (
    <div>
      {/* ── Filter Bar ── */}
      <div className="mb-6 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        {/* Type filter pills */}
        <div className="flex items-center gap-1 overflow-x-auto rounded-nx-md border border-nx-line bg-nx-raised p-1">
          {vm.bundleTypeOptions.map((opt) => (
            <button
              type="button"
              key={opt.value}
              onClick={() => vm.setBundleType(opt.value)}
              aria-pressed={vm.filters.bundleType === opt.value}
              className={cn(
                "whitespace-nowrap rounded-nx-control px-3 py-1.5 text-xs font-medium transition-colors duration-nx-micro motion-reduce:transition-none",
                "focus-visible:shadow-nx-focus focus-visible:outline-none",
                vm.filters.bundleType === opt.value
                  ? "bg-nx-surface text-nx-ink shadow-nx-sm"
                  : "text-nx-ink-2 hover:text-nx-ink"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Search + Save Current */}
        <div className="flex w-full items-center gap-2 sm:w-auto">
          <div className="relative flex-1 sm:w-56">
            <Search
              className="absolute start-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-nx-ink-3"
              aria-hidden="true"
            />
            <Input
              placeholder={t("common.search")}
              value={vm.filters.search}
              onChange={(e) => vm.setSearch(e.target.value)}
              className="h-8 ps-8 text-xs"
            />
          </div>

          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 whitespace-nowrap text-xs"
            onClick={vm.openSaveDialog}
          >
            <Save className="h-3.5 w-3.5" aria-hidden="true" />
            {t(`${B}.saveCurrent`)}
          </Button>
        </div>
      </div>

      {/* ── Loading State ── */}
      {vm.isLoading && <LoadingSpinner size="lg" showText={false} />}

      {/* ── Empty State ── */}
      {!vm.isLoading && vm.bundles.length === 0 && (
        <EmptyState
          icon={Inbox}
          title={t(`${B}.empty`)}
          description={t(`${B}.emptyHint`)}
          size="lg"
        />
      )}

      {/* ── Bundle Grid ── */}
      {!vm.isLoading && vm.bundles.length > 0 && (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {vm.bundles.map((bundle) => (
              <BundleCard
                key={bundle.slug}
                bundle={bundle}
                onOpenDetail={vm.openDetail}
                onToggleFavorite={vm.toggleFavorite}
                onApply={vm.applyBundle}
                isApplying={vm.isApplying}
              />
            ))}
          </div>

          {/* ── Pagination ── */}
          {vm.pagination && vm.pagination.totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={!vm.pagination.hasPrev}
                onClick={() => vm.setPage(vm.pagination!.page - 1)}
                aria-label={t("table.previousPage")}
                className="h-8 w-8 p-0"
              >
                <ChevronLeft className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
              </Button>

              <span className="px-3 text-xs text-nx-ink-2">
                {vm.pagination.page} / {vm.pagination.totalPages}
              </span>

              <Button
                variant="outline"
                size="sm"
                disabled={!vm.pagination.hasNext}
                onClick={() => vm.setPage(vm.pagination!.page + 1)}
                aria-label={t("table.nextPage")}
                className="h-8 w-8 p-0"
              >
                <ChevronRight className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
              </Button>
            </div>
          )}
        </>
      )}

      {/* ── Detail Modal ── */}
      <BundleDetailModal
        bundle={vm.selectedBundle}
        isOpen={vm.isDetailOpen}
        onClose={vm.closeDetail}
        onApply={vm.applyBundle}
        onToggleFavorite={vm.toggleFavorite}
        isApplying={vm.isApplying}
      />

      {/* ── Save Dialog ── */}
      <SaveBundleDialog
        isOpen={vm.isSaveDialogOpen}
        onClose={vm.closeSaveDialog}
        onSave={vm.saveCurrentAsBundle}
        isSaving={vm.isSaving}
      />
    </div>
  );
}
