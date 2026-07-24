"use client";

import { useAppListingsViewModel } from "../viewmodels/useAppListingsViewModel";
import { AppListingCard } from "../components/AppListingCard";
import { AppListingsStats } from "../components/AppListingsStats";
import { AppListingsToolbar } from "../components/AppListingsToolbar";
import { EmptyState } from "@core/ui/empty-state";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@core/ui/pagination";
import { cn } from "@core/common/utils";
import { Package } from "lucide-react";

/**
 * AppListingsView
 *
 * Orchestrates the App Listings page. This is a pure UI component — it holds
 * NO state, NO API calls, and NO business logic. All of that lives in
 * useAppListingsViewModel via the ViewModel pattern.
 *
 * Structure:
 *   AppListingsView
 *   ├─ AppListingsStats      (summary cards)
 *   ├─ AppListingsToolbar    (search + filters)
 *   ├─ AppListingCard[]      (list items)
 *   └─ Pagination            (core page controls)
 */
export function AppListingsView() {
  const vm = useAppListingsViewModel();

  const { page, totalPages, totalCount } = vm.pagination;

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Statistics strip */}
      <AppListingsStats stats={vm.stats} isLoading={vm.isLoading} />

      {/* Search / filter bar */}
      <AppListingsToolbar
        search=""
        onSearch={vm.setSearch}
        onCategoryFilter={vm.setCategoryFilter}
        onPublishedFilter={vm.setPublishedFilter}
        onSortChange={vm.setSortBy}
        onPricingFilter={vm.setPricingModel}
        sortBy={vm.sortBy}
        pricingModel={vm.pricingModel}
      />

      {/* Listings grid */}
      {vm.isLoading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-48 motion-safe:animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      ) : vm.listings.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No listings found"
          description="Try adjusting your filters"
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {vm.listings.map((listing) => (
            <AppListingCard
              key={listing.id}
              listing={listing}
              onPublish={() => vm.publish(listing.id)}
              onUnpublish={() => vm.unpublish(listing.id)}
              onToggleFeatured={() => vm.toggleFeatured(listing.id)}
              onDelete={() => vm.delete(listing.id)}
              isPublishing={vm.isPublishing}
              isDeleting={vm.isDeleting}
            />
          ))}
        </div>
      )}

      {/* Pagination — composed from the core pagination primitives */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-1">
          <p className="text-sm text-muted-foreground">
            {totalCount} listing{totalCount !== 1 ? "s" : ""} total
          </p>
          <div className="flex items-center gap-2">
            <Pagination className="mx-0 w-auto justify-end">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    aria-disabled={page <= 1 || undefined}
                    tabIndex={page <= 1 ? -1 : undefined}
                    className={cn("h-8", page <= 1 && "pointer-events-none opacity-50")}
                    onClick={(e) => {
                      e.preventDefault();
                      vm.setPage(page - 1);
                    }}
                  />
                </PaginationItem>
                <PaginationItem>
                  <span className="px-2 text-sm font-medium tabular-nums">
                    {page} / {totalPages}
                  </span>
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    aria-disabled={page >= totalPages || undefined}
                    tabIndex={page >= totalPages ? -1 : undefined}
                    className={cn("h-8", page >= totalPages && "pointer-events-none opacity-50")}
                    onClick={(e) => {
                      e.preventDefault();
                      vm.setPage(page + 1);
                    }}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </div>
      )}
    </div>
  );
}
