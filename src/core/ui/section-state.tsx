"use client";

/**
 * SectionState
 *
 * Shared component for consistent loading, error, and empty states across all
 * dashboard sections. Eliminates boilerplate in every section component.
 *
 * The error branch renders ErrorMessage and the empty branch renders
 * EmptyState, both at their compact size — a failed or empty section shows
 * the exact same anatomy as a failed or empty page, just smaller.
 *
 * @example
 * <SectionState isLoading={isLoading} error={error} onRetry={refetch} isEmpty={data.length === 0}>
 *   <MyChart data={data} />
 * </SectionState>
 */
import { memo, type ReactNode } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { Skeleton } from "@core/ui/skeleton";
import { ErrorMessage } from "@core/ui/error-message";
import { EmptyState } from "@core/ui/empty-state";
import { InboxIcon, type LucideIcon } from "lucide-react";

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
            <div key={i} className="space-y-2 rounded-nx-md border border-nx-line p-4">
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

  // ── Error — the shared error anatomy, compact ───────────────────
  if (error) {
    return (
      <div className="flex flex-col justify-center" style={{ minHeight: height }}>
        <ErrorMessage size="sm" message={t("common.error")} onRetry={onRetry} />
      </div>
    );
  }

  // ── Empty — the shared empty anatomy, compact ───────────────────
  if (isEmpty) {
    // emptyIcon predates EmptyState and arrives as a ReactNode; EmptyState
    // wants a component. The adapter renders the caller's node verbatim
    // (its own classes included) so the legacy prop keeps working.
    const Icon = emptyIcon ? ((() => <>{emptyIcon}</>) as unknown as LucideIcon) : InboxIcon;
    return (
      <div className="flex flex-col justify-center" style={{ minHeight: height }}>
        <EmptyState size="sm" bare icon={Icon} title={emptyMessage ?? t("common.noData")} />
      </div>
    );
  }

  // ── Content ─────────────────────────────────────────────────────
  return <div aria-live="polite">{children}</div>;
});
