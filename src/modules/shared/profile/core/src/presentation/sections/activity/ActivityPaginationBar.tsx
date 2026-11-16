"use client";

import { Button } from "@core/ui/button";
import type { ActivityTranslateFn } from "./ActivityFilterToolbarSection";
import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * Props for ActivityPaginationBar.
 */
export interface ActivityPaginationBarProps {
  t: ActivityTranslateFn;
  page: number;
  hasMore: boolean;
  isFetching: boolean;
  onPreviousPage: () => void;
  onNextPage: () => void;
}

/**
 * Server pagination controls for the Account Activity ledger with RTL chevron mirroring.
 */
export function ActivityPaginationBar({
  t,
  page,
  hasMore,
  isFetching,
  onPreviousPage,
  onNextPage,
}: ActivityPaginationBarProps) {
  return (
    <div className="flex items-center justify-between gap-2 pt-2 border-t border-nx-line">
      <span className="text-xs font-mono text-nx-ink-3">
        {t("profile.activity.pageIndicator", { page })}
      </span>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          data-testid="activity-prev-page-btn"
          disabled={page <= 1 || isFetching}
          onClick={onPreviousPage}
          className="h-8 text-xs gap-1 border-nx-line text-nx-ink"
        >
          <ChevronLeft className="h-3.5 w-3.5 rtl:rotate-180" aria-hidden="true" />
          <span>{t("profile.activity.prevPageBtn")}</span>
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          data-testid="activity-next-page-btn"
          disabled={!hasMore || isFetching}
          onClick={onNextPage}
          className="h-8 text-xs gap-1 border-nx-line text-nx-ink"
        >
          <span>{t("profile.activity.nextPageBtn")}</span>
          <ChevronRight className="h-3.5 w-3.5 rtl:rotate-180" aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}
