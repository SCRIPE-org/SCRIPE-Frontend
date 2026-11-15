"use client";

import React, { memo } from "react";
import { Card } from "@core/ui/card";
import { Skeleton } from "@core/ui/skeleton";
import { EmptyState } from "@core/ui/empty-state";
import { cn } from "@core/common/utils";
import { Inbox } from "lucide-react";
import type { CrudColumn } from "../components/generic-crud-view";

/**
 * Props for the CrudCardGridSection component.
 * @template TItem The entity type rendered in the card grid.
 */
export interface CrudCardGridSectionProps<TItem = any> {
  /** Array of entity records to render in the responsive card grid. */
  items: TItem[];
  /** Column metadata from the active CrudConfig used for field labels and fallback rendering. */
  columns: CrudColumn<TItem>[];
  /** Whether the parent query is loading data, displaying skeleton card slabs. */
  loading?: boolean;
  /** Optional custom card renderer callback providing full control over card layout and actions slot. */
  renderCardGridItem?: (item: TItem, actions: React.ReactNode, index: number) => React.ReactNode;
  /** Optional renderer for row action buttons passed into custom card renderers. */
  renderRowActionButtons?: (item: TItem) => React.ReactNode;
  /** Optional CSS class name override for the outer CSS grid container. */
  cardGridClassName?: string;
  /** Optional class name generator applied to individual card containers in default fallback mode. */
  getCardClassName?: (item: TItem) => string;
  /** Optional rich empty state element matching GenericTable / TanStackCrudTable behavior. */
  emptyState?: React.ReactNode;
  /** Localized empty state title displayed when items array is empty. */
  emptyLabel?: string;
}

/**
 * Enterprise CardGrid view mode section for GenericCrudView.
 * Renders data as flat matte Nexus card slabs with hairline borders,
 * responsive multi-column layouts, and graceful fallback card anatomy.
 *
 * @template TItem The entity record type.
 */
export const CrudCardGridSection = memo(function CrudCardGridSection<TItem = any>({
  items = [],
  columns = [],
  loading = false,
  renderCardGridItem,
  renderRowActionButtons,
  cardGridClassName,
  getCardClassName,
  emptyState,
  emptyLabel = "No items",
}: CrudCardGridSectionProps<TItem>) {
  // Separate header column and data columns for default fallback
  const nonActionColumns = columns.filter((col) => col.key !== "actions");
  const headerColumn = nonActionColumns[0];
  const bodyColumns = nonActionColumns.slice(1);

  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3",
        cardGridClassName
      )}
    >
      {loading ? (
        Array.from({ length: 6 }).map((_, idx) => (
          <Card
            key={`card-skeleton-${idx}`}
            className="p-5 space-y-3 rounded-nx-lg border border-nx-line bg-nx-surface"
          >
            <Skeleton className="h-5 w-3/4 rounded-nx-sm" />
            <Skeleton className="h-4 w-1/2 rounded-nx-sm" />
            <Skeleton className="h-4 w-2/3 rounded-nx-sm" />
            <div className="flex justify-end gap-2 border-t border-nx-line pt-3">
              <Skeleton className="h-7 w-16 rounded-nx-md" />
            </div>
          </Card>
        ))
      ) : items.length === 0 ? (
        <div className="col-span-full rounded-nx-lg border border-nx-line bg-nx-surface p-8">
          {emptyState || <EmptyState bare icon={Inbox} title={emptyLabel} />}
        </div>
      ) : (
        items.map((row: any, idx: number) => {
          const rowKey = String(row?.id ?? idx);
          const actionButtons = renderRowActionButtons ? renderRowActionButtons(row) : null;
          if (renderCardGridItem) {
            return (
              <div key={rowKey}>
                {renderCardGridItem(row, actionButtons, idx)}
              </div>
            );
          }

          // Crisp executive fallback card with header and hairline grid
          const headerValue = headerColumn
            ? headerColumn.render
              ? headerColumn.render(row[headerColumn.key], row, idx)
              : String(row[headerColumn.key] ?? "—")
            : `Item ${idx + 1}`;

          return (
            <Card
              key={rowKey}
              className={cn(
                "flex flex-col justify-between gap-3.5 rounded-nx-lg border border-nx-line bg-nx-surface p-5 hover:border-nx-line-hi transition-colors",
                getCardClassName?.(row)
              )}
            >
              <div className="flex items-start justify-between gap-3 pb-3 border-b border-nx-line">
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-nx-ink text-sm sm:text-base truncate">
                    {headerValue}
                  </div>
                  {headerColumn && (
                    <span className="text-[11px] font-medium text-nx-ink-3">
                      {headerColumn.label}
                    </span>
                  )}
                </div>
                {actionButtons && <div className="shrink-0">{actionButtons}</div>}
              </div>

              {bodyColumns.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {bodyColumns.map((col) => {
                    const rawVal = row[col.key];
                    return (
                      <div
                        key={col.key}
                        className="flex flex-col gap-0.5 rounded-nx-control bg-nx-raised/40 p-2.5 border border-nx-line/60"
                      >
                        <span className="text-[11px] font-medium text-nx-ink-3 truncate">
                          {col.label}
                        </span>
                        <div
                          className={cn(
                            "text-nx-ink font-medium text-xs break-words",
                            typeof rawVal === "number" && "tabular-nums"
                          )}
                        >
                          {col.render
                            ? col.render(rawVal, row, idx)
                            : String(rawVal ?? "—")}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          );
        })
      )}
    </div>
  );
});
