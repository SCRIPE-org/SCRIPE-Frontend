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
 * Wave K, two real defects closed:
 *  • the loaded branch wrapped its children in `aria-live="polite"`, so every
 *    keystroke inside a live chart, table or form nested in a section was
 *    re-announced to screen readers. A live region belongs on the transient
 *    status, not on the content;
 *  • the placeholders pulsed. A placeholder is the ABSENCE of data, and absence
 *    does not breathe — they are static fill steps now, and they carry the
 *    hairline structure of the thing they stand in for so the layout does not
 *    jump when the data lands.
 *
 * @example
 * <SectionState isLoading={isLoading} error={error} onRetry={refetch} isEmpty={data.length === 0}>
 *   <MyChart data={data} />
 * </SectionState>
 */
import { memo, type ReactNode } from "react";
import { useI18n } from "@core/providers/i18n-provider";
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

// The one placeholder material: a raised fill step, no motion.
const BLOCK = "rounded-nx-md bg-nx-raised-2";

// Fixed, deliberately uneven column heights — a placeholder that reads as data
// rather than as a bar chart of the number 100. Fixed, not random, so the
// placeholder does not reshuffle on every re-render.
const CHART_BARS = ["45%", "72%", "58%", "88%", "40%", "66%", "80%"] as const;

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
        <div className="space-y-2" role="status" aria-busy="true" aria-label={t("common.loading")}>
          {Array.from({ length: skeletonRows }).map((_, i) => (
            <div key={i} aria-hidden="true" className={`h-12 w-full ${BLOCK}`} />
          ))}
        </div>
      );
    }

    if (skeletonType === "cards") {
      return (
        <div
          className="grid grid-cols-2 gap-4 md:grid-cols-4"
          role="status"
          aria-busy="true"
          aria-label={t("common.loading")}
        >
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              aria-hidden="true"
              className="rounded-nx-lg border border-nx-line bg-nx-surface p-4"
            >
              {/* Mirrors StatCard's anatomy — 12px label, 28px figure — so the
                  grid does not resettle when the real figures arrive. */}
              <div className={`h-3 w-20 ${BLOCK}`} />
              <div className={`mt-3 h-7 w-16 ${BLOCK}`} />
            </div>
          ))}
        </div>
      );
    }

    // 'chart' used to be one grey slab the size of the panel. A framed plot
    // with a ruled baseline and a few static columns says "a chart is
    // arriving"; a slab says nothing and lands with a jolt.
    return (
      <div
        role="status"
        aria-busy="true"
        aria-label={t("common.loading")}
        className="flex w-full flex-col justify-end rounded-nx-lg border border-nx-line bg-nx-surface p-4"
        style={{ height }}
      >
        <div aria-hidden="true" className="flex flex-1 items-end gap-2 border-b border-nx-line pb-0">
          {CHART_BARS.map((h, i) => (
            <div key={i} className={`w-full rounded-t-nx-sm bg-nx-raised-2`} style={{ height: h }} />
          ))}
        </div>
      </div>
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
  return <div>{children}</div>;
});
