"use client";

import React, { useState, useMemo, useCallback, useEffect, useRef } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
  type VisibilityState,
} from "@tanstack/react-table";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@core/ui/table";
import { Checkbox } from "@core/ui/checkbox";
import { Button } from "@core/ui/button";
import { Skeleton } from "@core/ui/skeleton";
import { EmptyState } from "@core/ui/empty-state";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@core/ui/dropdown-menu";
import { useCrudI18n } from "../hooks/useCrudI18n";
import { cn } from "@core/common/utils";
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Columns3,
  Inbox,
} from "lucide-react";
import type { CrudColumn, CrudAction } from "../components/generic-crud-view";

export interface TanStackCrudTableProps<TItem = any> {
  data: TItem[];
  columns: CrudColumn<TItem>[];
  actions?: CrudAction<TItem>[];
  renderRowActionButtons?: (item: TItem) => React.ReactNode;
  stickyActions?: boolean;
  selectedIds?: string[];
  onSelectAll?: (selected: boolean) => void;
  onSelectItem?: (id: string, selected: boolean) => void;
  sortColumn?: string;
  sortDirection?: "asc" | "desc";
  onSort?: (columnKey: string) => void;
  loading?: boolean;
  emptyState?: React.ReactNode;
  className?: string;
  enableColumnVisibility?: boolean;
  emptyLabel?: string;
}

export function TanStackCrudTable<TItem extends Record<string, any>>({
  data = [],
  columns = [],
  actions,
  renderRowActionButtons,
  stickyActions = false,
  selectedIds = [],
  onSelectAll,
  onSelectItem,
  sortColumn,
  sortDirection,
  onSort,
  loading = false,
  emptyState,
  className,
  enableColumnVisibility = true,
  emptyLabel,
}: TanStackCrudTableProps<TItem>) {
  const { t, direction } = useCrudI18n();
  const resolvedEmptyLabel = emptyLabel || t("common.noRecords", { defaultValue: "No records found" });
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const [showStartShadow, setShowStartShadow] = useState(false);
  const [showEndShadow, setShowEndShadow] = useState(false);
  // Convert CrudColumn<TItem>[] to TanStack ColumnDef<TItem>[]
  const tableColumns = useMemo<ColumnDef<TItem>[]>(() => {
    return columns.map((col) => ({
      id: col.key,
      accessorKey: col.key,
      header: () => col.label,
      enableSorting: col.sortable !== false,
      meta: {
        className: col.className,
      },
      cell: ({ row }) => {
        const item = row.original;
        return col.render
          ? col.render(item[col.key], item, row.index)
          : String(item[col.key] ?? "—");
      },
    }));
  }, [columns]);

  // Column visibility state (VisibilityState: record of column ID -> boolean)
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(() => {
    const init: VisibilityState = {};
    for (const col of columns) {
      init[col.key] = true;
    }
    return init;
  });

  // Sorting state (SortingState: ColumnSort[])
  const [sorting, setSorting] = useState<SortingState>(() => {
    if (sortColumn) {
      return [{ id: sortColumn, desc: sortDirection === "desc" }];
    }
    return [];
  });

  // Sync sorting state when controlled sortColumn/sortDirection props update
  useEffect(() => {
    if (sortColumn !== undefined) {
      setSorting(sortColumn ? [{ id: sortColumn, desc: sortDirection === "desc" }] : []);
    }
  }, [sortColumn, sortDirection]);

  const handleSortingChange = useCallback((updaterOrValue: any) => {
    setSorting((prev) => {
      return typeof updaterOrValue === "function" ? updaterOrValue(prev) : updaterOrValue;
    });
  }, []);

  // TanStack Table Instance
  const table = useReactTable({
    data,
    columns: tableColumns,
    getRowId: (row, index) => String(row.id ?? index),
    state: {
      sorting,
      columnVisibility,
    },
    onSortingChange: handleSortingChange,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  // Track horizontal scroll overflow across LTR and RTL scrollLeft models
  useEffect(() => {
    const container = tableContainerRef.current;
    if (!container) return;

    const scrollable = container.querySelector(".overflow-auto") as HTMLElement | null;
    if (!scrollable) return;

    const updateShadows = () => {
      const { scrollLeft, scrollWidth, clientWidth } = scrollable;
      const maxScroll = Math.max(0, scrollWidth - clientWidth);
      if (maxScroll <= 1) {
        setShowStartShadow(false);
        setShowEndShadow(false);
        return;
      }
      const scrolledFromStart =
        direction === "rtl"
          ? scrollLeft <= 0
            ? Math.abs(scrollLeft)
            : maxScroll - scrollLeft
          : scrollLeft;
      setShowStartShadow(scrolledFromStart > 1);
      setShowEndShadow(scrolledFromStart < maxScroll - 1);
    };

    updateShadows();
    scrollable.addEventListener("scroll", updateShadows);
    window.addEventListener("resize", updateShadows);

    let resizeObserver: ResizeObserver | undefined;
    if (typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(updateShadows);
      resizeObserver.observe(scrollable);
      if (scrollable.firstElementChild) {
        resizeObserver.observe(scrollable.firstElementChild);
      }
    }

    return () => {
      scrollable.removeEventListener("scroll", updateShadows);
      window.removeEventListener("resize", updateShadows);
      resizeObserver?.disconnect();
    };
  }, [direction, data, columns, stickyActions]);

  // Selection calculations
  const allSelected =
    data.length > 0 &&
    selectedIds.length >= data.length &&
    data.every((d) => selectedIds.includes(String(d.id)));
  const isIndeterminate =
    selectedIds.length > 0 && !allSelected && data.some((d) => selectedIds.includes(String(d.id)));

  const hasSelection = !!onSelectItem || !!onSelectAll;
  const hasActions = !!renderRowActionButtons || (actions && actions.length > 0);

  return (
    <div className={cn("flex flex-col gap-2.5 w-full", className)}>
      {/* Column Visibility Toolbar */}
      {enableColumnVisibility && table.getAllLeafColumns().length > 1 && (
        <div className="flex items-center justify-end px-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-9 gap-1.5 text-xs border-nx-line text-nx-ink hover:bg-nx-raised"
              >
                <Columns3 className="size-3.5 text-nx-ink-3" aria-hidden="true" />
                <span>{t("common.columns", { defaultValue: "Columns" })}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align={direction === "rtl" ? "start" : "end"}
              className="w-48 bg-nx-popover border-nx-line"
            >
              <DropdownMenuLabel className="text-xs font-semibold text-nx-ink-2">
                {t("crud.toggleColumns", { defaultValue: "Toggle Columns" })}
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-nx-line" />
              {table.getAllLeafColumns().map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) => column.toggleVisibility(Boolean(value))}
                    className="text-xs capitalize"
                  >
                    {typeof column.columnDef.header === "function"
                      ? (column.columnDef.header as any)()
                      : (column.columnDef.header as any) ?? column.id}
                  </DropdownMenuCheckboxItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      {/* TanStack Table Container */}
      <div
        ref={tableContainerRef}
        className="relative rounded-nx-lg border border-nx-line bg-nx-surface overflow-clip [&>div]:max-h-[70dvh]"
      >
        {showStartShadow && (
          <div
            aria-hidden="true"
            className={cn(
              "pointer-events-none absolute inset-y-0 start-0 z-20 w-4 from-nx-surface to-transparent",
              direction === "rtl" ? "bg-gradient-to-l" : "bg-gradient-to-r"
            )}
          />
        )}
        {showEndShadow && (
          <div
            aria-hidden="true"
            className={cn(
              "pointer-events-none absolute inset-y-0 end-0 z-20 w-4 from-nx-surface to-transparent",
              direction === "rtl" ? "bg-gradient-to-r" : "bg-gradient-to-l"
            )}
          />
        )}
        <Table dir={direction} className="relative">
          <TableHeader
            sticky
            className="sticky top-0 z-10 bg-nx-raised border-b border-nx-line-hi [&_th]:bg-nx-raised"
          >
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="border-b border-nx-line-hi bg-nx-raised hover:bg-nx-raised">
                {/* Checkbox Column */}
                {hasSelection && (
                  <TableHead className="w-10 px-3 text-center text-xs font-semibold text-nx-ink-2">
                    <Checkbox
                      checked={allSelected ? true : isIndeterminate ? "indeterminate" : false}
                      onCheckedChange={(checked) => {
                        onSelectAll?.(Boolean(checked));
                      }}
                      aria-label={t("table.selectAll", { defaultValue: "Select all rows" })}
                    />
                  </TableHead>
                )}

                {/* Data Columns */}
                {headerGroup.headers.map((header) => {
                  const canSort = header.column.getCanSort();
                  const isSorted =
                    sortColumn !== undefined
                      ? sortColumn === header.column.id
                        ? (sortDirection ?? "asc")
                        : false
                      : header.column.getIsSorted();
                  const metaClass = (header.column.columnDef.meta as any)?.className;
                  const ariaSortValue = canSort
                    ? isSorted === "asc"
                      ? "ascending"
                      : isSorted === "desc"
                        ? "descending"
                        : "none"
                    : undefined;

                  return (
                    <TableHead
                      key={header.id}
                      aria-sort={ariaSortValue}
                      className={cn(
                        "text-xs font-semibold text-nx-ink-2 select-none",
                        metaClass
                      )}
                    >
                      {canSort ? (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            if (onSort) {
                              onSort(header.column.id);
                            }
                            header.column.getToggleSortingHandler()?.(e);
                          }}
                          className="-ms-2 h-9 gap-1 px-2 text-xs font-semibold text-nx-ink-2 hover:text-nx-ink hover:bg-nx-hover"
                        >
                          <span>
                            {flexRender(header.column.columnDef.header, header.getContext())}
                          </span>
                          {isSorted ? (
                            isSorted === "asc" ? (
                              <ArrowUp className="size-3 text-nx-accent" aria-hidden="true" />
                            ) : (
                              <ArrowDown className="size-3 text-nx-accent" aria-hidden="true" />
                            )
                          ) : (
                            <ArrowUpDown className="size-3 text-nx-ink-3 opacity-60" aria-hidden="true" />
                          )}
                        </Button>
                      ) : (
                        <span>
                          {flexRender(header.column.columnDef.header, header.getContext())}
                        </span>
                      )}
                    </TableHead>
                  );
                })}

                {/* Actions Column (RTL-safe sticky end-0 border-s) */}
                {hasActions && (
                  <TableHead
                    className={cn(
                      "text-end text-xs font-semibold text-nx-ink-2 w-32 px-4",
                      stickyActions &&
                        "sticky end-0 bg-nx-raised z-20 border-s border-nx-line-hi"
                    )}
                  >
                    {t("common.actions", { defaultValue: "Actions" })}
                  </TableHead>
                )}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, rIdx) => (
                <TableRow key={`skeleton-${rIdx}`} className="border-b border-nx-line/60">
                  {hasSelection && (
                    <TableCell className="px-3 text-center">
                      <Skeleton className="size-4 rounded-nx-sm mx-auto" />
                    </TableCell>
                  )}
                  {table.getVisibleLeafColumns().map((col) => (
                    <TableCell key={col.id} className="py-3 px-4">
                      <Skeleton className="h-4 w-24 rounded-nx-sm" />
                    </TableCell>
                  ))}
                  {hasActions && (
                    <TableCell
                      className={cn(
                        "py-3 px-4 text-end",
                        stickyActions && "sticky end-0 bg-nx-surface z-10 border-s border-nx-line"
                      )}
                    >
                      <Skeleton className="h-7 w-16 ms-auto rounded-nx-md" />
                    </TableCell>
                  )}
                </TableRow>
              ))
            ) : table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={
                    table.getVisibleLeafColumns().length +
                    (hasSelection ? 1 : 0) +
                    (hasActions ? 1 : 0)
                  }
                  className="py-12 text-center"
                >
                  {emptyState || (
                    <EmptyState
                      bare
                      icon={Inbox}
                      title={resolvedEmptyLabel}
                      description={t("common.noRecordsDescription", {
                        defaultValue: "No records to display at this time.",
                      })}
                    />
                  )}
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => {
                const rowItem = row.original;
                const rowId = String(rowItem.id ?? row.id);
                const isSelected = selectedIds.includes(rowId);
                const actionButtons = renderRowActionButtons ? renderRowActionButtons(rowItem) : null;

                return (
                  <TableRow
                    key={row.id}
                    className={cn(
                      "border-b border-nx-line/60 transition-colors hover:bg-nx-hover",
                      isSelected && "bg-nx-accent-wash"
                    )}
                  >
                    {/* Checkbox */}
                    {hasSelection && (
                      <TableCell className="px-3 text-center">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={(checked) => {
                            onSelectItem?.(rowId, Boolean(checked));
                          }}
                          aria-label={t("table.selectRow", {
                            id: rowId,
                            defaultValue: `Select row ${rowId}`,
                          })}
                        />
                      </TableCell>
                    )}

                    {/* Data Cells via TanStack flexRender */}
                    {row.getVisibleCells().map((cell) => {
                      const metaClass = (cell.column.columnDef.meta as any)?.className;
                      const rawValue = cell.getValue();
                      return (
                        <TableCell
                          key={cell.id}
                          className={cn(
                            "py-3 px-4 text-sm text-nx-ink",
                            typeof rawValue === "number" && "tabular-nums",
                            metaClass
                          )}
                        >
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      );
                    })}

                    {/* Actions (RTL-safe sticky end-0 border-s) */}
                    {hasActions && (
                      <TableCell
                        className={cn(
                          "py-2.5 px-4 text-end",
                          stickyActions &&
                            "sticky end-0 bg-nx-surface z-10 border-s border-nx-line"
                        )}
                      >
                        {actionButtons}
                      </TableCell>
                    )}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
