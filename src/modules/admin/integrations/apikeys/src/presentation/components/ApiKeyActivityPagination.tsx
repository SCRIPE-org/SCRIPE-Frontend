/**
 * ApiKeyActivityPagination — Pagination and page jump controls for API key activity logs.
 */
"use client";

import { useState, useEffect } from "react";
import { Input } from "@core/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@core/ui/pagination";
import { ChevronsLeft, ChevronsRight } from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";

/**
 * Properties passed to the ApiKeyActivityPagination component.
 */
export interface ApiKeyActivityPaginationProps {
  /** Total count of items across all pages */
  totalCount: number;
  /** Current page number (1-indexed) */
  page: number;
  /** Number of items per page */
  pageSize: number;
  /** Whether activity data is loading */
  isLoading: boolean;
  /** Callback fired when navigating to a new page */
  onPageChange: (page: number) => void;
}

/**
 * Renders pagination controls including previous/next, first/last shortcuts, and direct page input.
 *
 * @param props Component properties.
 * @returns JSX element containing pagination controls.
 */
export function ApiKeyActivityPagination({
  totalCount,
  page,
  pageSize,
  isLoading,
  onPageChange,
}: ApiKeyActivityPaginationProps) {
  const { t, direction } = useI18n();
  const [jumpPageVal, setJumpPageVal] = useState(page.toString());

  useEffect(() => {
    setJumpPageVal(page.toString());
  }, [page]);

  const totalPages = Math.max(Math.ceil(totalCount / pageSize), 1);
  const atFirstPage = page <= 1;
  const atLastPage = page >= totalPages;

  const handleJumpPageSubmit = () => {
    const parsed = parseInt(jumpPageVal, 10);
    if (!isNaN(parsed) && parsed >= 1 && parsed <= totalPages) {
      if (parsed !== page) {
        onPageChange(parsed);
      }
    } else {
      setJumpPageVal(page.toString());
    }
  };

  return (
    <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-nx-line bg-nx-raised p-4">
      <p className="text-xs text-nx-ink-2">
        {t("apikeys.activity.showing")}:{" "}
        <span className="font-semibold text-nx-ink">{totalCount}</span>
      </p>
      <Pagination className="mx-0 w-auto justify-end">
        <PaginationContent className="gap-1.5">
          <PaginationItem>
            <PaginationLink
              href="#"
              aria-label={t("table.firstPage")}
              aria-disabled={atFirstPage || isLoading || undefined}
              tabIndex={atFirstPage ? -1 : undefined}
              className="h-8 w-8"
              onClick={(e) => {
                e.preventDefault();
                onPageChange(1);
              }}
            >
              {direction === "rtl" ? (
                <ChevronsRight className="h-4 w-4" aria-hidden="true" />
              ) : (
                <ChevronsLeft className="h-4 w-4" aria-hidden="true" />
              )}
            </PaginationLink>
          </PaginationItem>

          <PaginationItem>
            <PaginationPrevious
              href="#"
              aria-disabled={atFirstPage || isLoading || undefined}
              tabIndex={atFirstPage ? -1 : undefined}
              className="h-8"
              onClick={(e) => {
                e.preventDefault();
                onPageChange(page - 1);
              }}
            />
          </PaginationItem>

          <PaginationItem className="mx-1 flex items-center gap-1.5 border-s border-nx-line ps-3 text-xs font-medium text-nx-ink-2">
            <span className="whitespace-nowrap">{t("common.page")}</span>
            <Input
              type="number"
              min={1}
              max={totalPages}
              aria-label={t("table.goToPage")}
              className="h-8 w-12 p-1 text-center font-mono text-xs [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              value={jumpPageVal}
              onChange={(e) => setJumpPageVal(e.target.value)}
              onBlur={handleJumpPageSubmit}
              onKeyDown={(e) => e.key === "Enter" && handleJumpPageSubmit()}
              disabled={isLoading}
            />
            <span className="whitespace-nowrap">/ {totalPages}</span>
          </PaginationItem>

          <PaginationItem>
            <PaginationNext
              href="#"
              aria-disabled={atLastPage || isLoading || undefined}
              tabIndex={atLastPage ? -1 : undefined}
              className="h-8"
              onClick={(e) => {
                e.preventDefault();
                onPageChange(page + 1);
              }}
            />
          </PaginationItem>

          <PaginationItem>
            <PaginationLink
              href="#"
              aria-label={t("table.lastPage")}
              aria-disabled={atLastPage || isLoading || undefined}
              tabIndex={atLastPage ? -1 : undefined}
              className="h-8 w-8"
              onClick={(e) => {
                e.preventDefault();
                onPageChange(totalPages);
              }}
            >
              {direction === "rtl" ? (
                <ChevronsLeft className="h-4 w-4" aria-hidden="true" />
              ) : (
                <ChevronsRight className="h-4 w-4" aria-hidden="true" />
              )}
            </PaginationLink>
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
