"use client";

import { Input } from "@core/ui/input";
import { Button } from "@core/ui/button";
import { Search, Filter } from "lucide-react";

interface AppListingsToolbarProps {
  search: string;
  onSearch: (value: string) => void;
  onCategoryFilter: (id: string | undefined) => void;
  onPublishedFilter: (published: boolean | undefined) => void;
}

/**
 * AppListingsToolbar
 *
 * Search input and filter controls for the listings list.
 * Pure presentational — all state changes bubble up to the ViewModel.
 */
export function AppListingsToolbar({
  search,
  onSearch,
  onCategoryFilter,
  onPublishedFilter,
}: AppListingsToolbarProps) {
  return (
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

      {/* Filter: Published state */}
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={() => onPublishedFilter(undefined)} className="gap-1.5">
          <Filter className="size-3.5" /> All
        </Button>
        <Button variant="outline" size="sm" onClick={() => onPublishedFilter(true)}>
          Published
        </Button>
        <Button variant="outline" size="sm" onClick={() => onPublishedFilter(false)}>
          Drafts
        </Button>
      </div>
    </div>
  );
}
