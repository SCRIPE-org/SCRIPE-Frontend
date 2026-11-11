"use client";

import React, { memo } from "react";
import { Card } from "@core/ui/card";
import { Badge } from "@core/ui/badge";
import { EmptyState } from "@core/ui/empty-state";
import { Inbox } from "lucide-react";
import type { CrudColumn } from "../components/generic-crud-view";

export interface CrudCalendarSectionProps<TItem = any> {
  items: TItem[];
  columns: CrudColumn<TItem>[];
  calendarDateField?: string;
  calendarGroupFormatter?: (rawValue: any, item: TItem) => string;
  renderCalendarItem?: (item: TItem, actions: React.ReactNode, index: number) => React.ReactNode;
  renderRowActionButtons?: (item: TItem) => React.ReactNode;
  emptyLabel?: string;
}

export const CrudCalendarSection = memo(function CrudCalendarSection<TItem = any>({
  items = [],
  columns = [],
  calendarDateField,
  calendarGroupFormatter,
  renderCalendarItem,
  renderRowActionButtons,
  emptyLabel = "No items",
}: CrudCalendarSectionProps<TItem>) {
  const dateKey =
    calendarDateField ||
    columns.find((c) => /date|time|at|day|due|start/i.test(c.key))?.key ||
    "createdAt";

  const groups = React.useMemo(() => {
    const map = new Map<string, TItem[]>();
    for (const item of items) {
      const rawVal = (item as any)?.[dateKey];
      const dateLabel = calendarGroupFormatter
        ? calendarGroupFormatter(rawVal, item)
        : rawVal
        ? String(rawVal).slice(0, 10)
        : "Unscheduled";
      const list = map.get(dateLabel) ?? [];
      list.push(item);
      map.set(dateLabel, list);
    }
    return map;
  }, [items, dateKey, calendarGroupFormatter]);

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {groups.size === 0 ? (
        <div className="col-span-full rounded-nx-lg border border-nx-line bg-nx-surface p-8">
          <EmptyState bare icon={Inbox} title={emptyLabel} />
        </div>
      ) : (
        Array.from(groups.entries()).map(([dateLabel, dateItems]) => (
          <Card
            key={dateLabel}
            className="space-y-3 rounded-nx-lg border border-nx-line bg-nx-surface p-4"
          >
            <div className="flex items-center justify-between border-b border-nx-line pb-2">
              <span className="text-sm font-semibold text-nx-ink">{dateLabel}</span>
              <Badge variant="outline" className="text-xs text-nx-ink-3 font-normal">
                {dateItems.length} items
              </Badge>
            </div>
            <div className="space-y-2">
              {dateItems.map((row: any, idx) => {
                const actionButtons = renderRowActionButtons ? renderRowActionButtons(row) : null;
                if (renderCalendarItem) {
                  return (
                    <div key={row?.id || idx}>
                      {renderCalendarItem(row, actionButtons, idx)}
                    </div>
                  );
                }
                return (
                  <div
                    key={row?.id || idx}
                    className="space-y-1.5 rounded-nx-md border border-nx-line p-2.5 text-xs bg-nx-raised"
                  >
                    {columns.slice(0, 3).map((col) => (
                      <div key={col.key} className="flex items-center justify-between gap-2">
                        <span className="text-nx-ink-3">{col.label}</span>
                        <span className="font-medium text-nx-ink">
                          {col.render
                            ? col.render(row[col.key], row, idx)
                            : String(row[col.key] ?? "—")}
                        </span>
                      </div>
                    ))}
                    {actionButtons && <div className="pt-1">{actionButtons}</div>}
                  </div>
                );
              })}
            </div>
          </Card>
        ))
      )}
    </div>
  );
});
