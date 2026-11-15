"use client";

import React, { memo } from "react";
import { Skeleton } from "@core/ui/skeleton";
import { EmptyState } from "@core/ui/empty-state";
import { useCrudI18n } from "../hooks/useCrudI18n";
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
  emptyState?: React.ReactNode;
  emptyLabel?: string;
}

function CrudSplitPaneSectionInner<TItem = any>({
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
  emptyState,
  emptyLabel = "No items",
}: CrudSplitPaneSectionProps<TItem>) {
  const { direction } = useCrudI18n();
  const selectedRow: any =
    items.find((r: any) => String(r?.id) === String(selectedId)) || items[0] || null;

  return (
    <div dir={direction} className="grid grid-cols-1 gap-4 lg:grid-cols-12">
      {/* Left List Pane */}
      <div className="space-y-2 rounded-nx-lg border border-nx-line bg-nx-surface p-3 lg:col-span-5 max-h-[calc(100dvh-260px)] overflow-y-auto">
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
          emptyState || <EmptyState bare icon={Inbox} title={emptyLabel} />
        ) : (
          items.map((row: any, idx) => {
            const rowKey = String(row?.id ?? idx);
            const isCurrent = Boolean(selectedRow && String(row?.id) === String(selectedRow?.id));
            const primaryCol = columns[0];
            const secondaryCol = columns[1];
            const itemLabel = getItemDisplayName
              ? getItemDisplayName(row)
              : String(
                  (primaryCol ? row?.[primaryCol.key] : undefined) ??
                    row?.name ??
                    row?.title ??
                    row?.id ??
                    `${defaultTitle} ${idx + 1}`
                );

            if (renderSplitListItem) {
              return (
                <div key={rowKey} className="relative rounded-nx-md">
                  <button
                    type="button"
                    aria-pressed={isCurrent}
                    aria-label={itemLabel}
                    onClick={() => onSelectId(String(row?.id))}
                    className="absolute inset-0 z-0 rounded-nx-md text-start focus-visible:outline-none focus-visible:shadow-nx-focus"
                  />
                  <div className="relative z-10 pointer-events-none [&_a]:pointer-events-auto [&_button]:pointer-events-auto [&_input]:pointer-events-auto [&_select]:pointer-events-auto">
                    {renderSplitListItem(row, isCurrent, idx)}
                  </div>
                </div>
              );
            }

            const primaryRaw = primaryCol ? row[primaryCol.key] : row?.id;
            const secondaryRaw = secondaryCol ? row[secondaryCol.key] : undefined;

            return (
              <div
                key={rowKey}
                className={cn(
                  "relative w-full rounded-nx-md border p-3 text-start transition-colors",
                  isCurrent
                    ? "border-nx-accent bg-nx-accent-wash"
                    : "border-nx-line bg-nx-surface hover:border-nx-line-hi hover:bg-nx-raised"
                )}
              >
                <button
                  type="button"
                  aria-pressed={isCurrent}
                  aria-label={itemLabel}
                  onClick={() => onSelectId(String(row?.id))}
                  className="absolute inset-0 z-0 rounded-nx-md text-start focus-visible:outline-none focus-visible:shadow-nx-focus"
                />
                <div className="relative z-10 pointer-events-none flex flex-col items-start [&_a]:pointer-events-auto [&_button]:pointer-events-auto">
                  <div
                    className={cn(
                      "text-sm font-medium text-nx-ink",
                      typeof primaryRaw === "number" && "tabular-nums"
                    )}
                  >
                    {primaryCol?.render
                      ? primaryCol.render(primaryRaw, row, idx)
                      : primaryCol
                        ? String(primaryRaw ?? row?.id ?? `#${idx + 1}`)
                        : String(row?.id ?? `#${idx + 1}`)}
                  </div>
                  {secondaryCol && (
                    <div
                      className={cn(
                        "mt-0.5 text-xs text-nx-ink-3",
                        typeof secondaryRaw === "number" && "tabular-nums"
                      )}
                    >
                      {secondaryCol.render
                        ? secondaryCol.render(secondaryRaw, row, idx)
                        : String(secondaryRaw ?? "")}
                    </div>
                  )}
                </div>
              </div>
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
                {columns.map((col, idx) => {
                  const detailRaw = selectedRow[col.key];
                  return (
                    <div
                      key={col.key}
                      className="rounded-nx-md border border-nx-line bg-nx-raised p-2.5 text-sm"
                    >
                      <div className="text-xs text-nx-ink-3">{col.label}</div>
                      <div
                        className={cn(
                          "mt-1 font-medium text-nx-ink",
                          typeof detailRaw === "number" && "tabular-nums"
                        )}
                      >
                        {col.render
                          ? col.render(detailRaw, selectedRow, idx)
                          : String(detailRaw ?? "—")}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )
        ) : (
          emptyState || <EmptyState bare icon={Inbox} title={emptyLabel} />
        )}
      </div>
    </div>
  );
}

export const CrudSplitPaneSection = memo(
  CrudSplitPaneSectionInner
) as typeof CrudSplitPaneSectionInner;
