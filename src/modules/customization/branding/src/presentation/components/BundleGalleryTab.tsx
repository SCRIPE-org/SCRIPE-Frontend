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
import {
  Search, Loader2, ChevronLeft, ChevronRight,
  Save, Inbox,
} from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
import { BundleCard } from "./BundleCard";
import { BundleDetailModal } from "./BundleDetailModal";
import { SaveBundleDialog } from "./SaveBundleDialog";
import { useThemeBundleViewModel } from "../viewmodels/useThemeBundleViewModel";

const B = "studio.bundles";

export function BundleGalleryTab() {
  const { t } = useI18n();
  const vm = useThemeBundleViewModel();

  return (
    <div>
      {/* ── Filter Bar ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
        {/* Type filter pills */}
        <div className="flex items-center gap-1 p-1 rounded-lg bg-muted/50 border border-border/50 overflow-x-auto">
          {vm.bundleTypeOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => vm.setBundleType(opt.value)}
              className={cn(
                "px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap",
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
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-56">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder={t("common.search")}
              value={vm.filters.search}
              onChange={(e) => vm.setSearch(e.target.value)}
              className="pl-8 h-8 text-xs"
            />
          </div>

          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs gap-1.5 whitespace-nowrap"
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
          <div className="h-16 w-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-4">
            <Inbox className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-sm font-semibold text-foreground mb-1">
            {t(`${B}.empty`)}
          </h3>
          <p className="text-xs text-muted-foreground max-w-xs">
            {t(`${B}.emptyHint`)}
          </p>
        </div>
      )}

      {/* ── Bundle Grid ── */}
      {!vm.isLoading && vm.bundles.length > 0 && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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
            <div className="flex items-center justify-center gap-2 mt-8">
              <Button
                variant="outline"
                size="sm"
                disabled={!vm.pagination.hasPrev}
                onClick={() => vm.setPage(vm.pagination!.page - 1)}
                className="h-8 w-8 p-0"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <span className="text-xs text-muted-foreground px-3">
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
