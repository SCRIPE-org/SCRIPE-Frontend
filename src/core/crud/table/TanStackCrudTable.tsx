"use client";

import React, { useState, useMemo, useCallback, useEffect } from "react";
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
  emptyLabel = "No records found",
}: TanStackCrudTableProps<TItem>) {
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
    state: {
      sorting,
      columnVisibility,
    },
    onSortingChange: handleSortingChange,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

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
                className="h-8 gap-1.5 text-xs border-nx-line text-nx-ink hover:bg-nx-raised"
              >
                <Columns3 className="size-3.5 text-nx-ink-3" />
                <span>Columns</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-nx-surface border-nx-line">
              <DropdownMenuLabel className="text-xs font-semibold text-nx-ink-2">
                Toggle Columns
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
      <div className="rounded-nx-lg border border-nx-line bg-nx-surface overflow-hidden">
        <Table className="relative">
          <TableHeader sticky className="bg-nx-surface border-b border-nx-line">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="border-b border-nx-line hover:bg-transparent">
                {/* Checkbox Column */}
                {hasSelection && (
                  <TableHead className="w-10 px-3 text-center">
                    <Checkbox
                      checked={allSelected ? true : isIndeterminate ? "indeterminate" : false}
                      onCheckedChange={(checked) => {
                        onSelectAll?.(Boolean(checked));
                      }}
                      aria-label="Select all rows"
                    />
                  </TableHead>
                )}

                {/* Data Columns */}
                {headerGroup.headers.map((header) => {
                  const canSort = header.column.getCanSort();
                  const isSorted = header.column.getIsSorted();
                  const metaClass = (header.column.columnDef.meta as any)?.className;

                  return (
                    <TableHead
                      key={header.id}
                      className={cn(
                        "text-xs font-semibold text-nx-ink select-none",
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
                          className="-ms-2 h-7 gap-1 px-2 text-xs font-semibold text-nx-ink hover:text-nx-ink hover:bg-nx-raised/60"
                        >
                          <span>
                            {flexRender(header.column.columnDef.header, header.getContext())}
                          </span>
                          {isSorted ? (
                            isSorted === "asc" ? (
                              <ArrowUp className="size-3 text-nx-accent" />
                            ) : (
                              <ArrowDown className="size-3 text-nx-accent" />
                            )
                          ) : (
                            <ArrowUpDown className="size-3 text-nx-ink-3 opacity-60" />
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
                      "text-end text-xs font-semibold text-nx-ink w-32 px-4",
                      stickyActions &&
                        "sticky end-0 bg-nx-surface z-10 border-s border-nx-line"
                    )}
                  >
                    Actions
                  </TableHead>
                )}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, rIdx) => (
                <TableRow key={rIdx} className="border-b border-nx-line/60">
                  {hasSelection && (
                    <TableCell className="px-3 text-center">
                      <Skeleton className="size-4 rounded-nx-xs mx-auto" />
                    </TableCell>
                  )}
                  {table.getVisibleLeafColumns().map((col) => (
                    <TableCell key={col.id} className="py-3 px-4">
                      <Skeleton className="h-4 w-24 rounded-nx-xs" />
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
                      title={emptyLabel}
                      description="No records to display at this time."
                    />
                  )}
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => {
                const rowItem = row.original;
                const rowId = String(rowItem.id || row.id);
                const isSelected = selectedIds.includes(rowId);
                const actionButtons = renderRowActionButtons ? renderRowActionButtons(rowItem) : null;

                return (
                  <TableRow
                    key={row.id}
                    className={cn(
                      "border-b border-nx-line/60 transition-colors hover:bg-nx-raised/40",
                      isSelected && "bg-nx-accent-wash/20"
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
                          aria-label={`Select row ${rowId}`}
                        />
                      </TableCell>
                    )}

                    {/* Data Cells via TanStack flexRender */}
                    {row.getVisibleCells().map((cell) => {
                      const metaClass = (cell.column.columnDef.meta as any)?.className;
                      return (
                        <TableCell
                          key={cell.id}
                          className={cn("py-3 px-4 text-sm text-nx-ink", metaClass)}
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
