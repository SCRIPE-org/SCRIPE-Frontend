/**
 * Generic Table Component
 *
 * A highly customizable and responsive data table with support for:
 * - Sorting by columns
 * - Pagination
 * - Row selection
 * - Search functionality
 * - Custom actions
 * - Multiple styling themes
 * - Mobile-responsive card view
 * - Internationalization
 *
 * @example
 * ```tsx
 * const columns: Column<User>[] = [
 *   { key: "name", label: "Name", sortable: true },
 *   { key: "email", label: "Email", sortable: true },
 *   { key: "role", label: "Role" }
 * ];
 *
 * const actions: Action<User>[] = [
 *   { label: "Edit", onClick: (user) => editUser(user) },
 *   { label: "Delete", onClick: (user) => deleteUser(user), variant: "destructive" }
 * ];
 *
 * <GenericTable
 *   data={users}
 *   columns={columns}
 *   actions={actions}
 *   pagination={paginationInfo}
 *   onSearch={handleSearch}
 * />
 * ```
 *
 * @author Seif
 * @version 2.0.0
 * @since 1.0.0
 */
"use client";

import type React from "react";
import { useState, useEffect, useRef, memo } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@core/ui/table";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { Checkbox } from "@core/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@core/ui/dropdown-menu";
import {
  // The file exports its own `Pagination` config interface, so the nav
  // primitive comes in under an alias.
  Pagination as PaginationNav,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@core/ui/pagination";
import { MoreHorizontal, ChevronsLeft, ChevronsRight, Search } from "lucide-react";
import { LoadingSpinner } from "@core/ui/loading-spinner";
import { Skeleton } from "@core/ui/skeleton";
import GenericSelect from "./generic-select";
import { useI18n } from "@core/providers/i18n-provider";
import { useSettings } from "@core/providers/settings-provider";
import { cn, getHoverEffectClasses, getTableHoverEffectClasses } from "@core/common/utils";
import { appLogger } from "@/core/common/logger";

/**
 * Column configuration for the table
 */
export interface Column<T> {
  /** The key of the data property to display */
  key: keyof T;
  /** The display label for the column */
  label: string;
  /** Whether the column is sortable */
  sortable?: boolean;
  /** Custom width for the column */
  width?: string;
  /** Custom render function for the column content */

  render?: (value: any, row: T) => React.ReactNode;
}

/**
 * Action configuration for table rows
 */
export interface Action<T> {
  /** The label for the action */
  label: string;
  /** Optional icon for the action */
  icon?: React.ReactNode;
  /** Callback when the action is clicked */
  onClick: (row: T) => void;
  /** Visual variant of the action */
  variant?: "default" | "destructive" | "ghost";
  /** Additional CSS classes */
  className?: string;
  /** Function to determine if the action should be shown */
  show?: (row: T) => boolean;
  /** Function to determine if the action should be disabled (greyed out, non-clickable) */
  disabled?: (row: T) => boolean;
  /** Tooltip text for the action (shown on hover via title attribute) */
  tooltip?: string;
  /** Loading state for async actions - shows spinner and disables the action */
  loading?: boolean;
}

/**
 * Pagination configuration
 */
export interface Pagination {
  /** Total number of items */
  itemsCount: number;
  /** Number of items per page */
  pageSize: number;
  /** Current page number */
  currentPage: number;
  /** Total number of pages */
  pagesCount: number;
  /** Callback when page changes */
  onPageChange: (page: number) => void;
  /** Optional callback when page size changes */
  onPageSizeChange?: (size: number) => void;
}

/**
 * Props for the GenericTable component
 */
interface GenericTableProps<T> {
  data: T[];
  columns: Column<T>[];
  actions?: Action<T>[];
  loading?: boolean;
  pagination?: Pagination;
  selectable?: boolean;
  selectedItems?: string[];
  onSelectionChange?: (selected: string[]) => void;
  searchPlaceholder?: string;
  /** Empty content — a plain string or a full node (e.g. an EmptyState). */
  emptyMessage?: React.ReactNode;
  onSearch?: (term: string) => void;
  searchValue?: string;
  searchInputRef?: React.RefObject<HTMLInputElement | null>;
  overrideTableStyle?: string;
  /** Enable sticky actions column (default: true) */
  stickyActions?: boolean;
  /** Custom render function for actions column - completely overrides default actions */
  renderActions?: (row: T) => React.ReactNode;
}

/**
 * Generic Table Component
 *
 * Renders a responsive data table with sorting, pagination, search, and actions.
 * Automatically switches to card view on mobile devices.
 *
 * @param props - The component props
 * @param props.data - Array of data items to display
 * @param props.columns - Column configuration
 * @param props.actions - Optional row actions
 * @param props.loading - Whether the table is in loading state
 * @param props.pagination - Pagination configuration
 * @param props.selectable - Whether rows can be selected
 * @param props.selectedItems - Array of selected item IDs
 * @param props.onSelectionChange - Callback when selection changes
 * @param props.searchPlaceholder - Placeholder text for search input
 * @param props.emptyMessage - Content to show when no data
 * @param props.onSearch - Callback for search functionality
 * @param props.searchValue - Current search value
 * @param props.searchInputRef - Ref for the search input
 * @param props.overrideTableStyle - Override the settings-driven table style
 * @param props.stickyActions - Enable sticky actions column (default: true)
 * @returns JSX element representing the table
 */

function GenericTableInner<T extends Record<string, any>>({
  data,
  columns,
  actions,
  loading,
  pagination,
  selectable = false,
  selectedItems = [],
  onSelectionChange,
  searchPlaceholder,
  emptyMessage,
  onSearch,
  searchValue,
  searchInputRef,
  overrideTableStyle,
  stickyActions = true,
  renderActions,
}: GenericTableProps<T>) {
  const { t, direction } = useI18n();
  const settings = useSettings();
  const [sortColumn, setSortColumn] = useState<keyof T | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [searchTerm, setSearchTerm] = useState(searchValue ?? "");

  // Sticky actions state
  const tableRef = useRef<HTMLDivElement>(null);
  const actionsColumnRef = useRef<HTMLTableCellElement>(null);
  const [showLeftShadow, setShowLeftShadow] = useState(false);
  const [showRightShadow, setShowRightShadow] = useState(false);

  // The ONE tableStyle read. The twelve variants no longer fan out into class
  // math here — the style rides a single [data-table-style] attribute on the
  // root, and the Wave-C-consolidated CSS keys the variant looks off it.
  const tableStyle = overrideTableStyle || settings.tableStyle;

  // Sync from parent only when the parent's value changes to something
  // different from what we last emitted (i.e. an external/programmatic reset).
  // Render-time detection — no setState in effect.
  const [prevSearchValue, setPrevSearchValue] = useState(searchValue);
  if (searchValue !== undefined && searchValue !== prevSearchValue) {
    setPrevSearchValue(searchValue);
    setSearchTerm(searchValue);
  }

  // Debounce: notify parent after user stops typing for 500ms
  useEffect(() => {
    if (!onSearch) return;
    const handler = setTimeout(() => {
      onSearch(searchTerm);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm, onSearch]);

  const placeholder = searchPlaceholder ?? t("common.search");
  const empty = emptyMessage ?? t("common.noData");

  // Debug sticky actions and handle scroll shadows
  useEffect(() => {
    if (stickyActions && actions && actions.length > 0) {
      appLogger.debug("Sticky Actions Debug:", {
        stickyActions,
        actionsCount: actions.length,
        direction,
        hasActionsColumn: !!actionsColumnRef.current,
      });
    }

    // Handle scroll shadows
    const handleScrollShadows = () => {
      const tableContainer = tableRef.current;
      if (!tableContainer) return;

      const scrollableElement = tableContainer.querySelector(".overflow-x-auto") as HTMLElement;
      if (!scrollableElement) return;

      const { scrollLeft, scrollWidth, clientWidth } = scrollableElement;

      // Check if we can scroll left (show left shadow)
      setShowLeftShadow(scrollLeft > 0);

      // Check if we can scroll right (show right shadow)
      setShowRightShadow(scrollLeft < scrollWidth - clientWidth);
    };

    const tableContainer = tableRef.current;
    if (!tableContainer) return;

    const scrollableElement = tableContainer.querySelector(".overflow-x-auto") as HTMLElement;
    if (!scrollableElement) return;

    // Initial check
    handleScrollShadows();

    // Add scroll listener
    scrollableElement.addEventListener("scroll", handleScrollShadows);
    window.addEventListener("resize", handleScrollShadows);

    return () => {
      scrollableElement.removeEventListener("scroll", handleScrollShadows);
      window.removeEventListener("resize", handleScrollShadows);
    };
  }, [stickyActions, actions, direction]);

  const handleSort = (column: keyof T) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const filteredData = onSearch
    ? data || []
    : (data || []).filter((item) =>
        Object.values(item).some((value) =>
          String(value).toLowerCase().includes(searchTerm.toLowerCase())
        )
      );

  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortColumn) return 0;

    const aValue = a[sortColumn];
    const bValue = b[sortColumn];

    if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
    if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  // Rows deliberately pass a className so TableRow's preserved
  // className-override contract hands hover control back to this component —
  // the settings-driven treatment below stays the single source of truth for
  // row hover, exactly as before. Variant looks (striped zebra, glass wash…)
  // come from the root [data-table-style] attribute via CSS, not from here.
  const getRowClasses = () => {
    // ALWAYS apply hover effects to table rows, regardless of global settings
    const effectType = settings.hoverEffectType === "none" ? "elevate" : settings.hoverEffectType;
    const intensity =
      settings.hoverEffectIntensity === "none" ? "medium" : settings.hoverEffectIntensity;
    return cn(
      "relative border-b border-nx-line transition-colors duration-nx-micro ease-nx-enter hover:bg-nx-hover motion-reduce:transition-none",
      "data-[state=selected]:bg-nx-accent-wash",
      // Shadows only, no transforms — collapsed table rows can't float.
      getTableHoverEffectClasses(effectType, intensity)
    );
  };

  // Mobile card — one quiet nx surface; the variant skin rides the root
  // [data-table-style] attribute, the hover treatment rides the settings.
  const getCardClasses = () =>
    cn(
      "space-y-3 rounded-nx-lg border border-nx-line bg-nx-surface p-4",
      getHoverEffectClasses(settings.hoverEffectType, settings.hoverEffectIntensity)
    );

  // Sticky actions column — opaque surface so scrolling columns vanish under
  // it, a hairline start edge instead of the old painted rails.
  const stickyActionsClasses = "sticky end-0 z-raised border-s border-nx-line-hi bg-nx-surface";

  if (loading) {
    // The shared placeholder primitive, in the row silhouette — the region
    // announces the load, so the blocks themselves stay decorative.
    return (
      <div className="space-y-3" role="status" aria-busy="true" aria-label={t("common.loading")}>
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-16" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4" data-table-style={tableStyle}>
      {/* Search Bar - Only show if search functionality is enabled */}
      {onSearch !== undefined && (
        <div className="relative">
          <Search
            className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-nx-ink-3"
            aria-hidden="true"
          />
          <Input
            ref={searchInputRef}
            placeholder={placeholder}
            aria-label={placeholder}
            className="ps-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      )}

      {/* Mobile Cards View */}
      <div className="block space-y-4 md:hidden">
        {sortedData.length === 0 ? (
          <div className="py-12 text-center text-nx-ink-3">{empty}</div>
        ) : (
          sortedData.map((row, index) => {
            const isSelected = selectable && selectedItems.includes(row.id);
            return (
              <div
                key={index}
                // Selection speaks the same language as a selected table row:
                // the accent wash behind an accent hairline, no second ring.
                className={cn(getCardClasses(), isSelected && "border-nx-accent bg-nx-accent-wash")}
              >
                {selectable && (
                  <div className="flex items-center gap-2 border-b border-nx-line pb-2">
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={(checked) => {
                        if (onSelectionChange) {
                          const newSelected = checked
                            ? [...selectedItems, row.id]
                            : selectedItems.filter((id) => id !== row.id);
                          onSelectionChange(newSelected);
                        }
                      }}
                    />
                    <span className="text-sm text-nx-ink-3">{t("table.select")}</span>
                  </div>
                )}
                {columns.map((column) => (
                  <div key={String(column.key)} className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium text-nx-ink-2">{column.label}:</span>
                    <span className="text-sm text-nx-ink">
                      {column.render
                        ? column.render(row[column.key], row)
                        : String(row[column.key])}
                    </span>
                  </div>
                ))}
                {((actions && actions.length > 0) || renderActions) && (
                  <div className="flex justify-end border-t border-nx-line pt-2">
                    {renderActions ? (
                      renderActions(row)
                    ) : (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" aria-label={t("table.actions")}>
                            <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="min-w-[160px]"
                          // Same focus-restore guard as the desktop row menu below.
                          onCloseAutoFocus={(e) => e.preventDefault()}
                        >
                          {actions &&
                            actions
                              .filter((action) => !action.show || action.show(row))
                              .map((action, actionIndex) => (
                                <DropdownMenuItem
                                  key={actionIndex}
                                  onClick={() => {
                                    if (action.loading || action.disabled?.(row)) return;
                                    action.onClick(row);
                                  }}
                                  disabled={action.loading || action.disabled?.(row)}
                                  title={action.tooltip}
                                  className={cn(
                                    action.variant === "destructive" &&
                                      "text-nx-danger focus:text-nx-danger",
                                    action.className
                                  )}
                                >
                                  {action.loading ? (
                                    <LoadingSpinner size="inline" className="me-2" />
                                  ) : (
                                    action.icon && (
                                      <span className="me-2" aria-hidden="true">
                                        {action.icon}
                                      </span>
                                    )
                                  )}
                                  <span className="font-medium">{action.label}</span>
                                </DropdownMenuItem>
                              ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Desktop Table View */}
      <div
        className="hidden overflow-visible rounded-nx-lg border border-nx-line bg-nx-surface md:block"
        ref={tableRef}
      >
        <div
          className="relative"
          style={{
            paddingBlock: "calc(var(--spacing-unit) * 0.75)",
            paddingInline: "calc(var(--spacing-unit) * 0.5)",
          }}
        >
          <div className="overflow-x-auto">
            {/* Scroll shadows. The edges are logical; only the gradient
                direction stays physical, because Tailwind has no logical
                gradient axis — so it resolves against the live direction. */}
            {showLeftShadow && (
              <div
                aria-hidden="true"
                className={cn(
                  "pointer-events-none absolute inset-y-0 start-0 z-raised w-4 from-nx-surface to-transparent",
                  direction === "rtl" ? "bg-gradient-to-l" : "bg-gradient-to-r"
                )}
              />
            )}
            {showRightShadow && (
              <div
                aria-hidden="true"
                className={cn(
                  "pointer-events-none absolute inset-y-0 end-0 z-raised w-4 from-nx-surface to-transparent",
                  direction === "rtl" ? "bg-gradient-to-r" : "bg-gradient-to-l"
                )}
              />
            )}
            <Table>
              <TableHeader>
                {/* Header row passes a className, so TableRow's minimal base
                    applies — no hover wash on the header band. */}
                <TableRow className="border-b border-nx-line-hi bg-nx-hover">
                  {selectable && (
                    <TableHead className="w-12">
                      <Checkbox
                        checked={
                          selectedItems.length === sortedData.length && sortedData.length > 0
                        }
                        onCheckedChange={(checked) => {
                          if (onSelectionChange) {
                            const newSelected = checked ? sortedData.map((row) => row.id) : [];
                            onSelectionChange(newSelected);
                          }
                        }}
                      />
                    </TableHead>
                  )}
                  {columns.map((column) => (
                    <TableHead
                      key={String(column.key)}
                      sortable={column.sortable}
                      sortDirection={
                        column.sortable && sortColumn === column.key ? sortDirection : null
                      }
                      onClick={column.sortable ? () => handleSort(column.key) : undefined}
                      onKeyDown={
                        column.sortable
                          ? (e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                handleSort(column.key);
                              }
                            }
                          : undefined
                      }
                      tabIndex={column.sortable ? 0 : undefined}
                      className={cn(
                        "whitespace-nowrap",
                        column.width && `w-${column.width}`,
                        // Same lit-edge focus treatment TableRow uses — the th
                        // itself is the sort control, so it must take focus.
                        column.sortable &&
                          "focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-nx-accent"
                      )}
                    >
                      {column.label}
                    </TableHead>
                  ))}
                  {((actions && actions.length > 0) || renderActions) && (
                    <TableHead
                      ref={actionsColumnRef}
                      className={cn("w-16", stickyActions && stickyActionsClasses)}
                    >
                      {t("table.actions")}
                    </TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedData.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={
                        columns.length +
                        ((actions && actions.length > 0) || renderActions ? 1 : 0) +
                        (selectable ? 1 : 0)
                      }
                      className="h-32 text-center text-nx-ink-3"
                    >
                      {empty}
                    </TableCell>
                  </TableRow>
                ) : (
                  sortedData.map((row, index) => {
                    const isSelected = selectable && selectedItems.includes(row.id);
                    return (
                      <TableRow key={index} selected={isSelected} className={getRowClasses()}>
                        {selectable && (
                          <TableCell className="w-12">
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={(checked) => {
                                if (onSelectionChange) {
                                  const newSelected = checked
                                    ? [...selectedItems, row.id]
                                    : selectedItems.filter((id) => id !== row.id);
                                  onSelectionChange(newSelected);
                                }
                              }}
                            />
                          </TableCell>
                        )}
                        {columns.map((column) => (
                          <TableCell key={String(column.key)}>
                            {column.render
                              ? column.render(row[column.key], row)
                              : String(row[column.key])}
                          </TableCell>
                        ))}
                        {((actions && actions.length > 0) || renderActions) && (
                          <TableCell
                            className={cn(stickyActions && stickyActionsClasses)}
                            ref={index === 0 ? actionsColumnRef : undefined}
                          >
                            {renderActions ? (
                              renderActions(row)
                            ) : (
                              <div className="flex items-center justify-center">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      className="h-8 w-8 p-0"
                                      aria-label={t("table.actions")}
                                    >
                                      <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent
                                    align={direction === "rtl" ? "start" : "end"}
                                    className="min-w-[160px]"
                                    // Radix restores focus to this menu's trigger when it
                                    // closes — and because the menu keeps an exit animation,
                                    // that restore lands ~140ms AFTER a chosen action has
                                    // already opened a dialog. The focus then sits outside
                                    // the new panel, which is the emitter behind rows whose
                                    // Edit / Assign form closed the instant it appeared.
                                    // dialog.tsx now refuses to dismiss on focus movement;
                                    // this stops the stray focus jump at the source so the
                                    // caret stays where the dialog wants it.
                                    onCloseAutoFocus={(e) => e.preventDefault()}
                                  >
                                    {actions &&
                                      actions
                                        .filter((action) => !action.show || action.show(row))
                                        .map((action, actionIndex) => (
                                          <DropdownMenuItem
                                            key={actionIndex}
                                            onClick={() => {
                                              if (action.loading || action.disabled?.(row)) return;
                                              action.onClick(row);
                                            }}
                                            disabled={action.loading || action.disabled?.(row)}
                                            title={action.tooltip}
                                            className={cn(
                                              action.variant === "destructive" &&
                                                "text-nx-danger focus:text-nx-danger",
                                              action.className
                                            )}
                                          >
                                            {action.loading ? (
                                              <LoadingSpinner size="inline" className="me-2" />
                                            ) : (
                                              action.icon && (
                                                <span className="me-2" aria-hidden="true">
                                                  {action.icon}
                                                </span>
                                              )
                                            )}
                                            <span className="font-medium">{action.label}</span>
                                          </DropdownMenuItem>
                                        ))}
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            )}
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
      </div>

      {/* Pagination — composed from the core pagination primitives */}
      {pagination && (
        <div className="rounded-nx-lg border border-nx-line bg-nx-surface">
          <div className="flex flex-col gap-4 p-4 lg:flex-row lg:items-center lg:justify-between">
            {/* Results Info */}
            <div className="flex flex-wrap items-center gap-4">
              <p className="text-sm font-medium text-nx-ink-2">
                {(() => {
                  const start = (pagination.currentPage - 1) * pagination.pageSize + 1;
                  const end = Math.min(
                    pagination.currentPage * pagination.pageSize,
                    pagination.itemsCount
                  );
                  return `${t("table.showing")} ${start}-${end} ${t(
                    "table.of"
                  )} ${pagination.itemsCount} ${t("table.results")}`;
                })()}
              </p>

              {/* Page Size Selector */}
              {pagination.onPageSizeChange && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-nx-ink-3">{t("table.show")}:</span>
                  <GenericSelect
                    type="single"
                    options={[10, 25, 50, 100].map((size) => ({
                      value: String(size),
                      label: String(size),
                    }))}
                    value={String(pagination.pageSize)}
                    onValueChange={(v: string | string[]) =>
                      pagination.onPageSizeChange?.(Number(typeof v === "string" ? v : v[0]))
                    }
                    className="h-8 w-auto min-w-[100px] max-w-[120px] text-center font-medium"
                    allowClear={false}
                  />
                  <span className="text-sm text-nx-ink-3">{t("table.perPage")}</span>
                </div>
              )}
            </div>

            {/* Page navigation */}
            {pagination.pagesCount > 1 && (
              <PaginationNav className="mx-0 w-auto justify-end">
                <PaginationContent className="flex-wrap">
                  {/* First Page */}
                  <PaginationItem>
                    <PaginationLink
                      href="#"
                      aria-label={t("table.firstPage")}
                      aria-disabled={pagination.currentPage === 1 || undefined}
                      tabIndex={pagination.currentPage === 1 ? -1 : undefined}
                      // Bounds states are the primitive's aria-disabled skin —
                      // dedicated ink, not an opacity veil.
                      className="h-8 w-8"
                      onClick={(e) => {
                        e.preventDefault();
                        pagination.onPageChange(1);
                      }}
                    >
                      {direction === "rtl" ? (
                        <ChevronsRight className="h-4 w-4" aria-hidden="true" />
                      ) : (
                        <ChevronsLeft className="h-4 w-4" aria-hidden="true" />
                      )}
                    </PaginationLink>
                  </PaginationItem>

                  {/* Previous Page */}
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      aria-disabled={pagination.currentPage === 1 || undefined}
                      tabIndex={pagination.currentPage === 1 ? -1 : undefined}
                      className="h-8"
                      onClick={(e) => {
                        e.preventDefault();
                        pagination.onPageChange(pagination.currentPage - 1);
                      }}
                    />
                  </PaginationItem>

                  {/* Page Numbers with Smart Truncation */}
                  {(() => {
                    const current = pagination.currentPage;
                    const total = pagination.pagesCount;
                    const pages: (number | string)[] = [];

                    if (total <= 7) {
                      // Show all pages if 7 or fewer
                      for (let i = 1; i <= total; i++) {
                        pages.push(i);
                      }
                    } else {
                      // Smart truncation for many pages
                      if (current <= 4) {
                        // Near beginning: 1 2 3 4 5 ... 10
                        for (let i = 1; i <= 5; i++) pages.push(i);
                        pages.push("...");
                        pages.push(total);
                      } else if (current >= total - 3) {
                        // Near end: 1 ... 6 7 8 9 10
                        pages.push(1);
                        pages.push("...");
                        for (let i = total - 4; i <= total; i++) pages.push(i);
                      } else {
                        // Middle: 1 ... 4 5 6 ... 10
                        pages.push(1);
                        pages.push("...");
                        for (let i = current - 1; i <= current + 1; i++) pages.push(i);
                        pages.push("...");
                        pages.push(total);
                      }
                    }

                    return pages.map((page, index) => {
                      if (page === "...") {
                        return (
                          <PaginationItem key={`ellipsis-${index}`}>
                            <PaginationEllipsis className="h-8 w-8" />
                          </PaginationItem>
                        );
                      }

                      const pageNum = page as number;

                      return (
                        <PaginationItem key={pageNum}>
                          <PaginationLink
                            href="#"
                            isActive={pageNum === current}
                            className="h-8 w-8"
                            onClick={(e) => {
                              e.preventDefault();
                              pagination.onPageChange(pageNum);
                            }}
                          >
                            {pageNum}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    });
                  })()}

                  {/* Next Page */}
                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      aria-disabled={pagination.currentPage === pagination.pagesCount || undefined}
                      tabIndex={pagination.currentPage === pagination.pagesCount ? -1 : undefined}
                      className="h-8"
                      onClick={(e) => {
                        e.preventDefault();
                        pagination.onPageChange(pagination.currentPage + 1);
                      }}
                    />
                  </PaginationItem>

                  {/* Last Page */}
                  <PaginationItem>
                    <PaginationLink
                      href="#"
                      aria-label={t("table.lastPage")}
                      aria-disabled={pagination.currentPage === pagination.pagesCount || undefined}
                      tabIndex={pagination.currentPage === pagination.pagesCount ? -1 : undefined}
                      className="h-8 w-8"
                      onClick={(e) => {
                        e.preventDefault();
                        pagination.onPageChange(pagination.pagesCount);
                      }}
                    >
                      {direction === "rtl" ? (
                        <ChevronsLeft className="h-4 w-4" aria-hidden="true" />
                      ) : (
                        <ChevronsRight className="h-4 w-4" aria-hidden="true" />
                      )}
                    </PaginationLink>
                  </PaginationItem>

                  {/* Page Jump Input */}
                  <PaginationItem className="ms-2 flex items-center gap-2 border-s border-nx-line ps-3">
                    <span className="whitespace-nowrap text-sm text-nx-ink-3">
                      {t("table.goToPage")}:
                    </span>
                    <Input
                      type="number"
                      min={1}
                      max={pagination.pagesCount}
                      aria-label={t("table.goToPage")}
                      className="h-8 w-16 text-center"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          const value = parseInt((e.target as HTMLInputElement).value);
                          if (value >= 1 && value <= pagination.pagesCount) {
                            pagination.onPageChange(value);
                            (e.target as HTMLInputElement).value = "";
                          }
                        }
                      }}
                      placeholder={String(pagination.currentPage)}
                    />
                  </PaginationItem>
                </PaginationContent>
              </PaginationNav>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// P1.4: Memoize to prevent re-renders when parent state changes

export const GenericTable = memo(GenericTableInner) as typeof GenericTableInner;
