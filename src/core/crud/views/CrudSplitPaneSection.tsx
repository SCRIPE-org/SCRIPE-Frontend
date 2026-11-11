"use client";

import React, { memo } from "react";
import { Button } from "@core/ui/button";
import { Skeleton } from "@core/ui/skeleton";
import { EmptyState } from "@core/ui/empty-state";
import { cn } from "@core/common/utils";
import { Inbox } from "lucide-react";
import type { CrudColumn } from "../components/generic-crud-view";

export interface CrudSplitPaneSectionProps<TItem = any> {
  items: TItem[];
  columns: CrudColumn<TItem>[];
  selectedId: string | null;
  onSelectId: (id: string) => void;
  loading?: boolean;
  renderSplitListItem?: (item: TItem, isSelected: boolean, index: number) => React.ReactNode;
  renderSplitDetail?: (item: TItem, actions: React.ReactNode) => React.ReactNode;
  renderRowActionButtons?: (item: TItem) => React.ReactNode;
  getItemDisplayName?: (item: TItem) => string;
  defaultTitle?: string;
  emptyLabel?: string;
}

export const CrudSplitPaneSection = memo(function CrudSplitPaneSection<TItem = any>({
  items = [],
  columns = [],
  selectedId,
  onSelectId,
  loading = false,
  renderSplitListItem,
  renderSplitDetail,
  renderRowActionButtons,
  getItemDisplayName,
  defaultTitle = "Item Details",
  emptyLabel = "No items",
}: CrudSplitPaneSectionProps<TItem>) {
  const selectedRow: any =
    items.find((r: any) => String(r?.id) === String(selectedId)) || items[0] || null;

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
      {/* Left List Pane */}
      <div className="space-y-2 rounded-nx-lg border border-nx-line bg-nx-surface p-3 lg:col-span-5 max-h-[calc(100vh-260px)] overflow-y-auto">
        {loading ? (
          [0, 1, 2, 3, 4].map((i) => (
            <div
              key={`split-skeleton-${i}`}
              className="rounded-nx-md border border-nx-line bg-nx-raised p-3 space-y-1.5"
            >
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-24" />
            </div>
          ))
        ) : items.length === 0 ? (
          <EmptyState bare icon={Inbox} title={emptyLabel} />
        ) : (
          items.map((row: any, idx) => {
            const isCurrent = Boolean(selectedRow && String(row?.id) === String(selectedRow?.id));
            if (renderSplitListItem) {
              return (
                <div
                  key={row?.id || idx}
                  onClick={() => onSelectId(String(row?.id))}
                  className="cursor-pointer"
                >
                  {renderSplitListItem(row, isCurrent, idx)}
                </div>
              );
            }
            const primaryCol = columns[0];
            const secondaryCol = columns[1];
            return (
              <Button
                key={row?.id || idx}
                type="button"
                variant="ghost"
                onClick={() => onSelectId(String(row?.id))}
                className={cn(
                  "w-full h-auto rounded-nx-md border p-3 text-start justify-start flex flex-col items-start transition-colors",
                  isCurrent
                    ? "border-nx-accent bg-nx-accent-wash"
                    : "border-nx-line hover:border-nx-line-hi hover:bg-nx-raised"
                )}
              >
                <div className="text-sm font-medium text-nx-ink">
                  {primaryCol?.render
                    ? primaryCol.render(row[primaryCol.key], row, idx)
                    : primaryCol
                      ? String(row[primaryCol.key] ?? row?.id ?? `#${idx + 1}`)
                      : String(row?.id ?? `#${idx + 1}`)}
                </div>
                {secondaryCol && (
                  <div className="mt-0.5 text-xs text-nx-ink-3">
                    {secondaryCol.render
                      ? secondaryCol.render(row[secondaryCol.key], row, idx)
                      : String(row[secondaryCol.key] ?? "")}
                  </div>
                )}
              </Button>
            );
          })
        )}
      </div>

      {/* Right Detail Pane */}
      <div className="rounded-nx-lg border border-nx-line bg-nx-surface p-4 lg:col-span-7">
        {loading ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-nx-line pb-3">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-8 w-24 rounded-nx-md" />
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {columns.slice(0, 6).map((col) => (
                <div
                  key={col.key}
                  className="rounded-nx-md border border-nx-line bg-nx-raised p-2.5 space-y-1.5"
                >
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-4 w-32" />
                </div>
              ))}
            </div>
          </div>
        ) : selectedRow ? (
          renderSplitDetail ? (
            renderSplitDetail(
              selectedRow,
              renderRowActionButtons ? renderRowActionButtons(selectedRow) : null
            )
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-nx-line pb-3">
                <h3 className="text-base font-semibold text-nx-ink">
                  {getItemDisplayName
                    ? getItemDisplayName(selectedRow)
                    : String(selectedRow?.name || selectedRow?.id || defaultTitle)}
                </h3>
                {renderRowActionButtons?.(selectedRow)}
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {columns.map((col, idx) => (
                  <div
                    key={col.key}
                    className="rounded-nx-md border border-nx-line bg-nx-raised p-2.5 text-sm"
                  >
                    <div className="text-xs text-nx-ink-3">{col.label}</div>
                    <div className="mt-1 font-medium text-nx-ink">
                      {col.render
                        ? col.render(selectedRow[col.key], selectedRow, idx)
                        : String(selectedRow[col.key] ?? "—")}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        ) : (
          <EmptyState bare icon={Inbox} title={emptyLabel} />
        )}
      </div>
    </div>
  );
});
