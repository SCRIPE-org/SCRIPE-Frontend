"use client";

/**
 * SectionState
 *
 * Shared component for consistent loading, error, and empty states across all
 * dashboard sections. Eliminates boilerplate in every section component.
 *
 * @example
 * <SectionState isLoading={isLoading} error={error} onRetry={refetch} isEmpty={data.length === 0}>
 *   <MyChart data={data} />
 * </SectionState>
 */
import { memo, type ReactNode } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { Skeleton } from "@core/ui/skeleton";
import { Button } from "@core/ui/button";
import { AlertCircle, InboxIcon } from "lucide-react";

interface SectionStateProps {
  /** Content to render when loaded and not empty */
  children: ReactNode;
  /** Whether data is currently loading */
  isLoading: boolean;
  /** Error object if the query failed */
  error?: Error | null;
  /** Callback to retry the failed query */
  onRetry?: () => void;
  /** Whether the data set is empty (after loading) */
  isEmpty?: boolean;
  /** Override the default empty state message */
  emptyMessage?: string;
  /** Override the default empty state icon */
  emptyIcon?: ReactNode;
  /** Height of the loading skeleton/placeholder (default: 280px) */
  height?: number;
  /** Type of loading skeleton: 'chart' renders a single block, 'rows' renders multiple rows, 'cards' renders a compact grid */
  skeletonType?: "chart" | "rows" | "cards";
  /** Number of skeleton rows (only for 'rows' type, default: 5) */
  skeletonRows?: number;
}

export const SectionState = memo(function SectionState({
  children,
  isLoading,
  error,
  onRetry,
  isEmpty = false,
  emptyMessage,
  emptyIcon,
  height = 280,
  skeletonType = "chart",
  skeletonRows = 5,
}: SectionStateProps) {
  const { t } = useI18n();

  // ── Loading ─────────────────────────────────────────────────────
  if (isLoading) {
    if (skeletonType === "rows") {
      return (
        <div className="space-y-3" role="status" aria-label={t("common.loading")}>
          {Array.from({ length: skeletonRows }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded-md" />
          ))}
        </div>
      );
    }

    if (skeletonType === "cards") {
      return (
        <div
          className="grid grid-cols-2 gap-4 md:grid-cols-4"
          role="status"
          aria-label={t("common.loading")}
        >
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-2 rounded-lg border p-4">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-8 w-16" />
            </div>
          ))}
        </div>
      );
    }

    return (
      <Skeleton className="w-full rounded-md" style={{ height }} aria-label={t("common.loading")} />
    );
  }

  // ── Error ───────────────────────────────────────────────────────
  if (error) {
    return (
      <div
        className="flex flex-col items-center justify-center gap-3 text-muted-foreground"
        style={{ height }}
        role="alert"
      >
        <AlertCircle className="h-8 w-8 opacity-40" aria-hidden="true" />
        <p className="text-sm">{t("common.error")}</p>
        {onRetry && (
          <Button variant="outline" size="sm" onClick={onRetry}>
            {t("common.retry")}
          </Button>
        )}
      </div>
    );
  }

  // ── Empty ───────────────────────────────────────────────────────
  if (isEmpty) {
    return (
      <div
        className="flex flex-col items-center justify-center gap-2 text-muted-foreground"
        style={{ height }}
      >
        {emptyIcon ?? <InboxIcon className="h-10 w-10 opacity-30" aria-hidden="true" />}
        <p className="text-sm font-medium">{emptyMessage ?? t("common.noData")}</p>
      </div>
    );
  }

  // ── Content ─────────────────────────────────────────────────────
  return <div aria-live="polite">{children}</div>;
});
