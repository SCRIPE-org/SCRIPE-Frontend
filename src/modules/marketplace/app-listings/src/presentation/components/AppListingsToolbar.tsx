"use client";

import { Input } from "@core/ui/input";
import { Button } from "@core/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@core/ui/select";
import { Search, Filter, SortAsc } from "lucide-react";

/** Sort options supported by the backend catalog query. */
export type SortByOption = "popular" | "rating" | "newest" | "price";

/** Pricing model filter options. */
export type PricingModelFilter = "Free" | "OneTime" | "Subscription" | undefined;

interface AppListingsToolbarProps {
  /** Current search query (controlled from viewmodel). */
  search: string;
  /** Fired when user types in the search box. */
  onSearch: (value: string) => void;
  /** Fired when user selects a category filter. */
  onCategoryFilter: (id: string | undefined) => void;
  /** Fired when user selects a publish status filter. */
  onPublishedFilter: (published: boolean | undefined) => void;
  /** Fired when user selects a sort option (Phase 5.3). */
  onSortChange: (sort: SortByOption | undefined) => void;
  /** Fired when user selects a pricing model filter (Phase 5.3). */
  onPricingFilter: (pricing: PricingModelFilter) => void;
  /** Currently active sort. */
  sortBy?: SortByOption;
  /** Currently active pricing model filter. */
  pricingModel?: PricingModelFilter;
}

/**
 * AppListingsToolbar (Phase 5.3 — extended)
 *
 * Search input and filter/sort controls for the app listings grid.
 * Extended with sort-by and pricing model selectors.
 * Pure presentational — all state changes bubble up to the ViewModel.
 */
export function AppListingsToolbar({
  search,
  onSearch,
  onCategoryFilter,
  onPublishedFilter,
  onSortChange,
  onPricingFilter,
  sortBy,
  pricingModel,
}: AppListingsToolbarProps) {
  return (
    <div className="flex flex-col gap-3">
      {/* Row 1: Search + Sort */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
          <Input
            id="listings-search"
            placeholder="Search listings..."
            defaultValue={search}
            onChange={(e) => onSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Sort by (Phase 5.3) */}
        <Select
          value={sortBy ?? "newest"}
          onValueChange={(v) => onSortChange(v === "newest" ? undefined : (v as SortByOption))}
        >
          <SelectTrigger id="listings-sort" className="w-[160px] gap-1.5">
            <SortAsc className="size-3.5 text-muted-foreground" />
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="popular">Most Popular</SelectItem>
            <SelectItem value="rating">Top Rated</SelectItem>
            <SelectItem value="price">Price</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Row 2: Filters */}
      <div className="flex flex-wrap gap-2">
        {/* Published filter */}
        <div className="flex gap-1.5">
          <Button
            id="filter-all"
            variant="outline"
            size="sm"
            onClick={() => onPublishedFilter(undefined)}
            className="gap-1.5"
          >
            <Filter className="size-3.5" /> All
          </Button>
          <Button
            id="filter-published"
            variant="outline"
            size="sm"
            onClick={() => onPublishedFilter(true)}
          >
            Published
          </Button>
          <Button
            id="filter-drafts"
            variant="outline"
            size="sm"
            onClick={() => onPublishedFilter(false)}
          >
            Drafts
          </Button>
        </div>

        {/* Pricing model filter (Phase 5.3) */}
        <Select
          value={pricingModel ?? "all"}
          onValueChange={(v) =>
            onPricingFilter(v === "all" ? undefined : (v as PricingModelFilter))
          }
        >
          <SelectTrigger id="listings-pricing-filter" className="w-[150px]">
            <SelectValue placeholder="Pricing model" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Pricing</SelectItem>
            <SelectItem value="Free">Free</SelectItem>
            <SelectItem value="OneTime">One-time</SelectItem>
            <SelectItem value="Subscription">Subscription</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
