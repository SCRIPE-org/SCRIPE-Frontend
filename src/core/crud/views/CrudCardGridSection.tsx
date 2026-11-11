"use client";

import React, { memo } from "react";
import { Card } from "@core/ui/card";
import { Skeleton } from "@core/ui/skeleton";
import { EmptyState } from "@core/ui/empty-state";
import { cn } from "@core/common/utils";
import { Inbox } from "lucide-react";
import type { CrudColumn } from "../components/generic-crud-view";

export interface CrudCardGridSectionProps<TItem = any> {
  items: TItem[];
  columns: CrudColumn<TItem>[];
  loading?: boolean;
  renderCardGridItem?: (item: TItem, actions: React.ReactNode, index: number) => React.ReactNode;
  renderRowActionButtons?: (item: TItem) => React.ReactNode;
  cardGridClassName?: string;
  getCardClassName?: (item: TItem) => string;
  emptyLabel?: string;
}

export const CrudCardGridSection = memo(function CrudCardGridSection<TItem = any>({
  items = [],
  columns = [],
  loading = false,
  renderCardGridItem,
  renderRowActionButtons,
  cardGridClassName,
  getCardClassName,
  emptyLabel = "No items",
}: CrudCardGridSectionProps<TItem>) {
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
            key={idx}
            className="p-4 space-y-3 rounded-nx-lg border border-nx-line bg-nx-surface"
          >
            <Skeleton className="h-5 w-3/4 rounded-nx-xs" />
            <Skeleton className="h-4 w-1/2 rounded-nx-xs" />
            <Skeleton className="h-4 w-2/3 rounded-nx-xs" />
            <div className="flex justify-end gap-2 border-t border-nx-line pt-3">
              <Skeleton className="h-7 w-16 rounded-nx-md" />
            </div>
          </Card>
        ))
      ) : items.length === 0 ? (
        <div className="col-span-full rounded-nx-lg border border-nx-line bg-nx-surface p-8">
          <EmptyState bare icon={Inbox} title={emptyLabel} />
        </div>
      ) : (
        items.map((row: any, idx: number) => {
          const actionButtons = renderRowActionButtons ? renderRowActionButtons(row) : null;
          if (renderCardGridItem) {
            return (
              <div key={row?.id || idx}>
                {renderCardGridItem(row, actionButtons, idx)}
              </div>
            );
          }
          return (
            <Card
              key={row?.id || idx}
              className={cn(
                "flex flex-col justify-between gap-3 rounded-nx-lg border border-nx-line bg-nx-surface p-4 hover:border-nx-line-hi transition-colors",
                getCardClassName?.(row)
              )}
            >
              <div className="space-y-2">
                {columns.map((col) => (
                  <div key={col.key} className="flex items-center justify-between gap-2 text-sm">
                    <span className="font-medium text-nx-ink-2">{col.label}</span>
                    <span className="text-nx-ink">
                      {col.render
                        ? col.render(row[col.key], row, idx)
                        : String(row[col.key] ?? "—")}
                    </span>
                  </div>
                ))}
              </div>
              {actionButtons && <div className="border-t border-nx-line pt-3">{actionButtons}</div>}
            </Card>
          );
        })
      )}
    </div>
  );
});
