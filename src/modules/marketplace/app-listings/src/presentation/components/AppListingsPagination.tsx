"use client";

import { Button } from "@core/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface AppListingsPaginationProps {
  page: number;
  totalPages: number;
  totalCount: number;
  onPageChange: (page: number) => void;
}

/**
 * AppListingsPagination
 *
 * Pagination row for the listings list.
 * Pure presentational component.
 */
export function AppListingsPagination({
  page,
  totalPages,
  totalCount,
  onPageChange,
}: AppListingsPaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between px-1">
      <p className="text-sm text-muted-foreground">
        {totalCount} listing{totalCount !== 1 ? "s" : ""} total
      </p>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
        >
          <ChevronLeft className="size-4" />
        </Button>
        <span className="text-sm font-medium tabular-nums">
          {page} / {totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}
