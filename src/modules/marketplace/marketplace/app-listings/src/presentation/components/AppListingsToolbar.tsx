"use client";

import { Input } from "@core/ui/input";
import { Button } from "@core/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@core/ui/select";
import { useI18n } from "@core/providers/i18n-provider";
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
  const { t } = useI18n();

  return (
    <div className="flex flex-col gap-3">
      {/* Row 1: Search + Sort */}
      <div className="flex flex-col gap-3 sm:flex-row">
        {/* Search */}
        <div className="relative flex-1">
          <Search
            className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-nx-ink-3"
            aria-hidden="true"
          />
          <Input
            id="listings-search"
            placeholder={t("marketplace.searchPlaceholder")}
            aria-label={t("marketplace.searchPlaceholder")}
            defaultValue={search}
            onChange={(e) => onSearch(e.target.value)}
            className="ps-9"
          />
        </div>

        {/* Sort by (Phase 5.3) */}
        <Select
          value={sortBy ?? "newest"}
          onValueChange={(v) => onSortChange(v === "newest" ? undefined : (v as SortByOption))}
        >
          <SelectTrigger id="listings-sort" className="w-[160px] gap-1.5">
            <SortAsc className="size-3.5 text-nx-ink-3" aria-hidden="true" />
            <SelectValue placeholder={t("marketplace.toolbarSortByPlaceholder")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">{t("marketplace.toolbarSortNewest")}</SelectItem>
            <SelectItem value="popular">{t("marketplace.toolbarSortPopular")}</SelectItem>
            <SelectItem value="rating">{t("marketplace.toolbarSortRating")}</SelectItem>
            <SelectItem value="price">{t("marketplace.toolbarSortPrice")}</SelectItem>
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
            <Filter className="size-3.5" aria-hidden="true" /> {t("common.all")}
          </Button>
          <Button
            id="filter-published"
            variant="outline"
            size="sm"
            onClick={() => onPublishedFilter(true)}
          >
            {t("marketplace.statsPublished")}
          </Button>
          <Button
            id="filter-drafts"
            variant="outline"
            size="sm"
            onClick={() => onPublishedFilter(false)}
          >
            {t("marketplace.statsDrafts")}
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
            <SelectValue placeholder={t("marketplace.toolbarPricingPlaceholder")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("marketplace.toolbarPricingAll")}</SelectItem>
            <SelectItem value="Free">{t("common.free")}</SelectItem>
            <SelectItem value="OneTime">{t("marketplace.toolbarPricingOneTime")}</SelectItem>
            <SelectItem value="Subscription">
              {t("marketplace.toolbarPricingSubscription")}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
