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
import { Search, Loader2, ChevronLeft, ChevronRight, Save, Inbox } from "lucide-react";
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
        <div className="flex items-center gap-1 overflow-x-auto rounded-lg border border-border/50 bg-muted/50 p-1">
          {vm.bundleTypeOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => vm.setBundleType(opt.value)}
              className={cn(
                "whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-medium transition-all",
                vm.filters.bundleType === opt.value
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Search + Save Current */}
        <div className="flex w-full items-center gap-2 sm:w-auto">
          <div className="relative flex-1 sm:w-56">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={t("common.search")}
              value={vm.filters.search}
              onChange={(e) => vm.setSearch(e.target.value)}
              className="h-8 pl-8 text-xs"
            />
          </div>

          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 whitespace-nowrap text-xs"
            onClick={vm.openSaveDialog}
          >
            <Save className="h-3.5 w-3.5" />
            {t(`${B}.saveCurrent`)}
          </Button>
        </div>
      </div>

      {/* ── Loading State ── */}
      {vm.isLoading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {/* ── Empty State ── */}
      {!vm.isLoading && vm.bundles.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/50">
            <Inbox className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="mb-1 text-sm font-semibold text-foreground">{t(`${B}.empty`)}</h3>
          <p className="max-w-xs text-xs text-muted-foreground">{t(`${B}.emptyHint`)}</p>
        </div>
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
                className="h-8 w-8 p-0"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <span className="px-3 text-xs text-muted-foreground">
                {vm.pagination.page} / {vm.pagination.totalPages}
              </span>

              <Button
                variant="outline"
                size="sm"
                disabled={!vm.pagination.hasNext}
                onClick={() => vm.setPage(vm.pagination!.page + 1)}
                className="h-8 w-8 p-0"
              >
                <ChevronRight className="h-4 w-4" />
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
