"use client";

import { useAppListingsViewModel } from "../viewmodels/useAppListingsViewModel";
import { AppListingCard } from "../components/AppListingCard";
import { AppListingsStats } from "../components/AppListingsStats";
import { AppListingsToolbar } from "../components/AppListingsToolbar";
import { AppListingsPagination } from "../components/AppListingsPagination";

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
 *   └─ AppListingsPagination (page controls)
 */
export function AppListingsView() {
  const vm = useAppListingsViewModel();

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
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-48 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : vm.listings.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
          <p className="text-lg font-medium">No listings found</p>
          <p className="text-sm">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
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

      {/* Pagination */}
      <AppListingsPagination
        page={vm.pagination.page}
        totalPages={vm.pagination.totalPages}
        totalCount={vm.pagination.totalCount}
        onPageChange={vm.setPage}
      />
    </div>
  );
}
