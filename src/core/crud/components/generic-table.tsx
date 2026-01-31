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
import { useState, useEffect, useRef } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@core/ui/table";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { Checkbox } from "@core/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@core/ui/dropdown-menu";
import { MoreHorizontal, ArrowUpDown, Search } from "lucide-react";
import GenericSelect from "./generic-select";
import { useI18n } from "@core/providers/i18n-provider";
import { useSettings } from "@core/providers/settings-provider";
import { cn, getHoverEffectClasses, getTableHoverEffectClasses } from "@core/common/utils";

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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  render?: (value: any, row: T) => React.ReactNode;
}

/**
 * Action configuration for table rows
 */
export interface Action<T> {
  /** The label for the action */
  label: string;
  /** Optional icon for the action */
  icon?: React.ComponentType<{ className?: string }>;
  /** Callback when the action is clicked */
  onClick: (row: T) => void;
  /** Visual variant of the action */
  variant?: "default" | "destructive" | "ghost";
  /** Additional CSS classes */
  className?: string;
  /** Function to determine if the action should be shown */
  show?: (row: T) => boolean;
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
  emptyMessage?: string;
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
 * @param props.emptyMessage - Message to show when no data
 * @param props.onSearch - Callback for search functionality
 * @param props.searchValue - Current search value
 * @param props.searchInputRef - Ref for the search input
 * @param props.overrideTableStyle - Override the default table style
 * @param props.stickyActions - Enable sticky actions column (default: true)
 * @returns JSX element representing the table
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function GenericTable<T extends Record<string, any>>({
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

  // Sync searchValue prop with local state (derived state pattern)
  if (searchValue !== undefined && searchValue !== searchTerm) {
    setSearchTerm(searchValue);
  }

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
      console.log("Sticky Actions Debug:", {
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

      const scrollableElement = tableContainer.querySelector(
        ".overflow-x-auto"
      ) as HTMLElement;
      if (!scrollableElement) return;

      const { scrollLeft, scrollWidth, clientWidth } = scrollableElement;

      // Check if we can scroll left (show left shadow)
      setShowLeftShadow(scrollLeft > 0);

      // Check if we can scroll right (show right shadow)
      setShowRightShadow(scrollLeft < scrollWidth - clientWidth);
    };

    const tableContainer = tableRef.current;
    if (!tableContainer) return;

    const scrollableElement = tableContainer.querySelector(
      ".overflow-x-auto"
    ) as HTMLElement;
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
    ? data
    : data.filter((item) =>
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

  // Get sticky actions classes based on current table style
  const getStickyActionsClasses = () => {
    const currentStyle = overrideTableStyle || settings.tableStyle;

    switch (currentStyle) {
      case "glass":
        return cn(
          "bg-white/20 backdrop-blur-xl border-white/20",
          "dark:bg-black/30 dark:border-white/10",
          "shadow-2xl shadow-black/10"
        );
      case "neon":
        return cn(
          "bg-background/95 backdrop-blur-sm border-primary/30",
          "shadow-[0_0_20px_rgba(var(--primary),0.3)]",
          "before:absolute before:inset-0 before:bg-gradient-to-br before:from-primary/10 before:to-transparent before:pointer-events-none"
        );
      case "gradient":
        return cn(
          "bg-gradient-to-br from-primary/20 via-background/95 to-primary/10",
          "backdrop-blur-sm shadow-2xl",
          "before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/10 before:to-transparent before:pointer-events-none"
        );
      case "neumorphism":
        return cn(
          "bg-background shadow-[20px_20px_40px_rgba(0,0,0,0.1),-20px_-20px_40px_rgba(255,255,255,0.1)]",
          "dark:shadow-[20px_20px_40px_rgba(0,0,0,0.3),-20px_-20px_40px_rgba(255,255,255,0.05)]",
          "before:absolute before:inset-[2px] before:bg-gradient-to-br before:from-white/20 before:to-transparent before:pointer-events-none"
        );
      case "cyberpunk":
        return cn(
          "bg-background/95 border-primary shadow-[0_0_30px_rgba(var(--primary),0.4)]",
          "before:absolute before:top-0 before:left-0 before:h-0.5 before:w-full before:bg-gradient-to-r before:from-transparent before:via-primary before:to-transparent before:pointer-events-none"
        );
      case "luxury":
        return cn(
          "bg-gradient-to-br from-amber-50/80 to-amber-100/60 border-amber-200/40",
          "dark:from-amber-900/30 dark:to-amber-800/20 dark:border-amber-400/30",
          "shadow-2xl shadow-amber-500/20"
        );
      case "matrix":
        return cn(
          "bg-background/95 border-primary/30 shadow-[0_0_20px_hsl(var(--primary)/0.4)]",
          "backdrop-blur-sm",
          "before:absolute before:inset-0 before:bg-[linear-gradient(90deg,transparent_0%,hsl(var(--primary)/0.1)_50%,transparent_100%)] before:pointer-events-none"
        );
      case "diamond":
        return cn(
          "bg-gradient-to-br from-primary/15 via-primary/10 to-primary/20 border-primary/40",
          "shadow-[0_0_30px_hsl(var(--primary)/0.3)] backdrop-blur-xl",
          "before:absolute before:inset-0 before:bg-[conic-gradient(from_0deg,transparent_0%,hsl(var(--primary)/0.1)_25%,hsl(var(--primary)/0.15)_50%,hsl(var(--primary)/0.1)_75%,transparent_100%)] before:animate-spin before:pointer-events-none"
        );
      case "minimal":
        return cn(
          "bg-background/90 backdrop-blur-sm border-border/50",
          "shadow-sm"
        );
      case "striped":
      case "bordered":
      case "default":
      default:
        return cn(
          "bg-background/95 backdrop-blur-md border-border",
          "shadow-lg shadow-black/5 dark:shadow-black/20"
        );
    }
  };

  // Get table style classes based on settings or override
  const getTableContainerClasses = () => {
    const hasHoverEffect =
      settings.hoverEffectType !== "none" &&
      settings.hoverEffectIntensity !== "none";
    const baseClasses = cn(
      "overflow-visible",
      hasHoverEffect && "transition-all duration-300"
    );
    const currentStyle = overrideTableStyle || settings.tableStyle;

    switch (currentStyle) {
      case "striped":
        return cn(baseClasses, "rounded-lg border bg-card");
      case "bordered":
        return cn(baseClasses, "rounded-lg border-2 border-border bg-card");
      case "minimal":
        return cn(baseClasses, "rounded-none border-0 bg-transparent");
      case "glass":
        return cn(
          baseClasses,
          "rounded-2xl border border-white/20 bg-white/10 backdrop-blur-xl shadow-2xl",
          "dark:bg-black/20 dark:border-white/10",
          "before:absolute before:inset-0 before:rounded-2xl before:bg-gradient-to-br before:from-white/20 before:to-transparent before:pointer-events-none",
          "relative"
        );
      case "neon":
        return cn(
          baseClasses,
          "rounded-xl border-2 border-primary/30 bg-background shadow-[0_0_30px_rgba(var(--primary),0.3)]",
          "dark:bg-black/95",
          "before:absolute before:inset-0 before:rounded-xl before:bg-gradient-to-br before:from-primary/10 before:to-transparent before:pointer-events-none",
          "after:absolute after:inset-0 after:rounded-xl after:shadow-[inset_0_0_20px_rgba(var(--primary),0.1)] after:pointer-events-none",
          "relative"
        );
      case "gradient":
        return cn(
          baseClasses,
          "rounded-2xl border-0 bg-gradient-to-br from-primary/20 via-background to-primary/10 shadow-2xl",
          "before:absolute before:inset-[1px] before:rounded-2xl before:bg-gradient-to-br before:from-background/95 before:to-background/90 before:backdrop-blur-sm",
          "after:absolute after:inset-0 after:rounded-2xl after:bg-gradient-to-br after:from-white/10 after:to-transparent after:pointer-events-none",
          "relative"
        );
      case "neumorphism":
        return cn(
          baseClasses,
          "rounded-3xl border-0 bg-background",
          "shadow-[20px_20px_40px_rgba(0,0,0,0.1),-20px_-20px_40px_rgba(255,255,255,0.1)]",
          "dark:shadow-[20px_20px_40px_rgba(0,0,0,0.3),-20px_-20px_40px_rgba(255,255,255,0.05)]",
          "before:absolute before:inset-[2px] before:rounded-3xl before:bg-gradient-to-br before:from-white/20 before:to-transparent before:pointer-events-none"
        );
      case "cyberpunk":
        return cn(
          baseClasses,
          "rounded-none border-2 border-primary bg-background shadow-[0_0_50px_rgba(var(--primary),0.4)]",
          "dark:bg-black/95",
          "before:absolute before:top-0 before:left-0 before:h-0.5 before:w-full before:bg-gradient-to-r before:from-transparent before:via-primary before:to-transparent",
          "after:absolute after:bottom-0 after:right-0 after:h-full after:w-0.5 after:bg-gradient-to-t after:from-transparent after:via-primary after:to-transparent",
          "relative"
        );
      case "luxury":
        return cn(
          baseClasses,
          "rounded-2xl border border-amber-200/30 bg-gradient-to-br from-amber-50/50 to-amber-100/30 shadow-2xl",
          "dark:from-amber-900/20 dark:to-amber-800/10 dark:border-amber-400/20"
        );
      case "matrix":
        return cn(
          baseClasses,
          "rounded-none border-2 border-primary/30 bg-background shadow-[0_0_30px_hsl(var(--primary)/0.4)]",
          "dark:bg-black/95",
          "backdrop-blur-sm relative overflow-hidden",
          "before:absolute before:inset-0 before:bg-[linear-gradient(90deg,transparent_0%,hsl(var(--primary)/0.1)_50%,transparent_100%)]",
          "dark:border-primary/40"
        );
      case "diamond":
        return cn(
          baseClasses,
          "rounded-3xl border-2 border-primary/40 bg-gradient-to-br from-primary/10 via-primary/5 to-primary/15",
          "shadow-[0_0_40px_hsl(var(--primary)/0.3)] backdrop-blur-xl relative overflow-hidden",
          "before:absolute before:inset-0 before:bg-[conic-gradient(from_0deg,transparent_0%,hsl(var(--primary)/0.1)_25%,hsl(var(--primary)/0.15)_50%,hsl(var(--primary)/0.1)_75%,transparent_100%)] before:animate-spin",
          "dark:from-primary/20 dark:via-primary/10 dark:to-primary/25 dark:border-primary/30"
        );
      default:
        return cn(baseClasses, "rounded-lg border bg-card shadow-sm");
    }
  };

  const getRowClasses = (index: number, isSelected: boolean = false) => {
    // ALWAYS apply hover effects to table rows, regardless of global settings
    // Table rows should always show shadows and hover effects
    const baseClasses = cn(
      "border-b-2 border-border/70 relative",
      "transition-all duration-300",
      "hover:bg-muted/50" // Always show background change on hover
    );
    // Get hover classes for tables - shadows only, no transforms
    // ALWAYS apply shadows based on global settings, or use default if none
    const effectType = settings.hoverEffectType === "none" ? "elevate" : settings.hoverEffectType;
    const intensity = settings.hoverEffectIntensity === "none" ? "medium" : settings.hoverEffectIntensity;
    const hoverClasses = getTableHoverEffectClasses(effectType, intensity);
    const currentStyle = overrideTableStyle || settings.tableStyle;

    let styleClasses = "";
    switch (currentStyle) {
      case "striped":
        styleClasses = index % 2 === 0 ? "bg-muted/30" : "bg-card";
        break;
      case "bordered":
        styleClasses = "border-b-2 bg-card";
        break;
      case "minimal":
        styleClasses = "border-b-2 border-border/60 bg-transparent";
        break;
      case "glass":
        styleClasses = cn(
          "border-b border-white/10 bg-white/5 backdrop-blur-sm",
          "dark:border-white/5 dark:bg-black/10",
          index % 2 === 0 && "bg-white/10 dark:bg-black/20"
        );
        break;
      case "neon":
        styleClasses = cn(
          "border-b border-primary/20 bg-background",
          "dark:bg-black/70",
          index % 2 === 0 && "bg-primary/5 dark:bg-primary/5"
        );
        break;
      case "gradient":
        styleClasses = cn(
          "border-b border-primary/10 bg-gradient-to-r from-transparent via-primary/5 to-transparent",
          index % 2 === 0 && "from-primary/5 via-primary/10 to-primary/5"
        );
        break;
      case "neumorphism":
        styleClasses = cn(
          "border-b-2 border-border/50 bg-background",
          index % 2 === 0 &&
          "shadow-[inset_2px_2px_4px_rgba(0,0,0,0.05),inset_-2px_-2px_4px_rgba(255,255,255,0.05)]"
        );
        break;
      case "cyberpunk":
        styleClasses = cn(
          "border-b border-primary/30 bg-background",
          "dark:bg-black/90",
          index % 2 === 0 && "bg-primary/5 border-primary/20"
        );
        break;
      case "luxury":
        styleClasses = cn(
          "border-b border-amber-200/20 bg-gradient-to-r from-amber-50/20 to-transparent",
          "dark:border-amber-400/20 dark:from-amber-900/10",
          index % 2 === 0 &&
          "from-amber-100/30 to-amber-50/10 dark:from-amber-900/20 dark:to-amber-800/10"
        );
        break;
      case "matrix":
        styleClasses = cn(
          "border-b border-primary/30 bg-background",
          "dark:bg-black/95",
          "text-primary font-mono text-sm",
          index % 2 === 0 && "bg-primary/5 border-primary/20"
        );
        break;
      case "diamond":
        styleClasses = cn(
          "border-b border-primary/30 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/15",
          "text-primary",
          "dark:from-primary/10 dark:via-primary/5 dark:to-primary/15 dark:text-primary dark:border-primary/20",
          index % 2 === 0 &&
          "from-primary/15 via-primary/10 to-primary/20 dark:from-primary/15 dark:via-primary/10 dark:to-primary/20"
        );
        break;
      default:
        styleClasses = "border-b-2 border-border/70 bg-card";
    }

    // ALWAYS add hover effects to table rows, regardless of global settings
    // Table row hover effects should override everything
    switch (currentStyle) {
      case "striped":
        styleClasses +=
          index % 2 === 0 ? " hover:bg-muted/50" : " hover:bg-muted/30";
        break;
      case "bordered":
        styleClasses += " hover:bg-muted/30";
        break;
      case "minimal":
        styleClasses += " hover:bg-muted/20";
        break;
      case "glass":
        styleClasses += " hover:bg-white/10 dark:hover:bg-black/20";
        break;
      case "neon":
        styleClasses +=
          " hover:bg-primary/10 hover:shadow-[0_0_20px_rgba(var(--primary),0.2)] dark:hover:bg-primary/5";
        break;
      case "gradient":
        styleClasses +=
          " hover:from-primary/10 hover:via-primary/15 hover:to-primary/10 hover:shadow-lg";
        break;
      case "neumorphism":
        styleClasses +=
          " hover:shadow-[inset_5px_5px_10px_rgba(0,0,0,0.1),inset_-5px_-5px_10px_rgba(255,255,255,0.1)] dark:hover:shadow-[inset_5px_5px_10px_rgba(0,0,0,0.2),inset_-5px_-5px_10px_rgba(255,255,255,0.05)]";
        break;
      case "cyberpunk":
        styleClasses +=
          " hover:bg-primary/10 hover:border-primary/50 hover:shadow-[0_0_15px_rgba(var(--primary),0.3)] hover:text-primary";
        break;
      case "luxury":
        styleClasses +=
          " hover:from-amber-100/30 hover:to-amber-50/20 hover:shadow-lg hover:shadow-amber-200/20 dark:hover:from-amber-800/20";
        break;
      case "matrix":
        styleClasses += " hover:bg-primary/10 hover:border-primary/50";
        break;
      case "diamond":
        styleClasses +=
          " hover:from-primary/20 hover:via-primary/15 hover:to-primary/25";
        break;
      default:
        styleClasses += " hover:bg-muted/30";
    }

    if (isSelected) {
      switch (currentStyle) {
        case "glass":
          styleClasses += " bg-primary/20 border-primary/30 backdrop-blur-md";
          break;
        case "neon":
          styleClasses +=
            " bg-primary/20 border-primary/50 shadow-[0_0_25px_rgba(var(--primary),0.4)]";
          break;
        case "gradient":
          styleClasses +=
            " from-primary/20 via-primary/30 to-primary/20 shadow-lg shadow-primary/20";
          break;
        case "neumorphism":
          styleClasses +=
            " shadow-[inset_8px_8px_16px_rgba(var(--primary),0.1),inset_-8px_-8px_16px_rgba(var(--primary),0.05)]";
          break;
        case "cyberpunk":
          styleClasses +=
            " bg-primary/20 border-primary text-primary shadow-[0_0_20px_rgba(var(--primary),0.5)]";
          break;
        case "luxury":
          styleClasses +=
            " from-amber-200/40 to-amber-100/30 border-amber-300/40 shadow-lg shadow-amber-200/30";
          break;
        case "matrix":
          styleClasses +=
            " bg-primary/20 border-primary/50 text-primary shadow-[0_0_20px_hsl(var(--primary)/0.4)]";
          break;
        case "diamond":
          styleClasses +=
            " from-primary/25 via-primary/20 to-primary/30 border-primary/40 shadow-lg shadow-primary/30";
          break;
        default:
          styleClasses += " bg-primary/10 border-primary/20";
      }
    }

    return cn(baseClasses, hoverClasses, styleClasses);
  };

  const getHeaderClasses = () => {
    const hasHoverEffect =
      settings.hoverEffectType !== "none" &&
      settings.hoverEffectIntensity !== "none";
    const baseClasses = cn(
      "font-semibold text-foreground",
      hasHoverEffect && "transition-all duration-300"
    );
    const currentStyle = overrideTableStyle || settings.tableStyle;

    let heightClass = "";
    switch (settings.spacingSize) {
      case "compact":
        heightClass = "h-10";
        break;
      case "comfortable":
        heightClass = "h-14";
        break;
      case "spacious":
        heightClass = "h-16";
        break;
      default:
        heightClass = "h-12";
    }

    switch (currentStyle) {
      case "striped":
        return cn(baseClasses, heightClass, "bg-muted/70 border-b-2");
      case "bordered":
        return cn(baseClasses, heightClass, "bg-muted/50 border-b-2");
      case "minimal":
        return cn(baseClasses, heightClass, "bg-transparent border-b");
      case "glass":
        return cn(
          baseClasses,
          heightClass,
          "bg-white/20 border-b border-white/30 backdrop-blur-md text-foreground font-bold",
          "dark:bg-black/30 dark:border-white/20",
          hasHoverEffect && "hover:bg-white/30 dark:hover:bg-black/40"
        );
      case "neon":
        return cn(
          baseClasses,
          heightClass,
          "bg-background border-b-2 border-primary/50 text-primary font-bold",
          "dark:bg-black/95",
          "shadow-[0_0_15px_rgba(var(--primary),0.3)]",
          hasHoverEffect &&
          "hover:border-primary hover:shadow-[0_0_25px_rgba(var(--primary),0.4)]"
        );
      case "gradient":
        return cn(
          baseClasses,
          heightClass,
          "bg-gradient-to-r from-primary/30 via-primary/20 to-primary/30 border-b border-primary/30",
          "text-foreground font-bold shadow-lg",
          hasHoverEffect &&
          "hover:from-primary/40 hover:via-primary/30 hover:to-primary/40"
        );
      case "neumorphism":
        return cn(
          baseClasses,
          heightClass,
          "bg-background border-b-0 font-bold",
          "shadow-[8px_8px_16px_rgba(0,0,0,0.1),-8px_-8px_16px_rgba(255,255,255,0.1)]",
          "dark:shadow-[8px_8px_16px_rgba(0,0,0,0.2),-8px_-8px_16px_rgba(255,255,255,0.05)]",
          hasHoverEffect &&
          "hover:shadow-[12px_12px_24px_rgba(0,0,0,0.15),-12px_-12px_24px_rgba(255,255,255,0.15)]"
        );
      case "cyberpunk":
        return cn(
          baseClasses,
          heightClass,
          "bg-background border-b-2 border-primary/60 text-primary font-bold",
          "dark:bg-black/95",
          "shadow-[0_0_20px_rgba(var(--primary),0.4)]",
          hasHoverEffect &&
          "hover:border-primary hover:shadow-[0_0_30px_rgba(var(--primary),0.5)]"
        );
      case "luxury":
        return cn(
          baseClasses,
          heightClass,
          "bg-gradient-to-r from-amber-100/50 via-amber-50/30 to-amber-100/50 border-b border-amber-300/40",
          "dark:from-amber-900/30 dark:via-amber-800/20 dark:to-amber-900/30 dark:border-amber-400/30",
          "text-amber-900 dark:text-amber-100 font-bold shadow-lg shadow-amber-200/20",
          hasHoverEffect &&
          "hover:from-amber-200/60 hover:via-amber-100/40 hover:to-amber-200/60",
          hasHoverEffect &&
          "dark:hover:from-amber-800/40 dark:hover:via-amber-700/30 dark:hover:to-amber-800/40"
        );
      case "matrix":
        return cn(
          baseClasses,
          heightClass,
          "bg-background border-b-2 border-primary/60 text-primary font-bold uppercase tracking-widest",
          "dark:bg-black/98",
          "shadow-[0_0_15px_hsl(var(--primary)/0.4)] font-mono text-sm",
          "dark:border-primary/70 dark:text-primary"
        );
      case "diamond":
        return cn(
          baseClasses,
          heightClass,
          "bg-gradient-to-r from-primary/20 via-primary/10 to-primary/25 border-b-2 border-primary/50",
          "text-primary font-bold shadow-lg shadow-primary/30",
          "dark:from-primary/25 dark:via-primary/15 dark:to-primary/30 dark:border-primary/40"
        );
      default:
        return cn(baseClasses, heightClass, "bg-muted/50 border-b");
    }
  };

  const getCellPadding = () => {
    switch (settings.spacingSize) {
      case "compact":
        return "px-3 py-2";
      case "comfortable":
        return "px-6 py-4";
      case "spacious":
        return "px-8 py-6";
      default:
        return "px-4 py-3";
    }
  };

  const getCardClasses = () => {
    const hasHoverEffect =
      settings.hoverEffectType !== "none" &&
      settings.hoverEffectIntensity !== "none";
    const baseClasses = cn(
      "border rounded-lg p-4 space-y-3",
      hasHoverEffect && "transition-all duration-300"
    );
    const hoverClasses = getHoverEffectClasses(
      settings.hoverEffectType,
      settings.hoverEffectIntensity
    );
    const currentStyle = overrideTableStyle || settings.tableStyle;

    switch (currentStyle) {
      case "glass":
        return cn(
          baseClasses,
          hoverClasses,
          "bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl",
          "dark:bg-black/20 dark:border-white/10",
          settings.hoverEffectType !== "none" &&
          settings.hoverEffectIntensity !== "none" &&
          "hover:bg-white/15 dark:hover:bg-black/30 hover:shadow-3xl"
        );
      case "neon":
        return cn(
          baseClasses,
          hoverClasses,
          "bg-background border-2 border-primary/30 shadow-[0_0_20px_rgba(var(--primary),0.3)] rounded-xl",
          "dark:bg-black/95",
          settings.hoverEffectType !== "none" &&
          settings.hoverEffectIntensity !== "none" &&
          "hover:border-primary/50 hover:shadow-[0_0_30px_rgba(var(--primary),0.5)] hover:bg-primary/5"
        );
      case "gradient":
        return cn(
          baseClasses,
          hoverClasses,
          "bg-gradient-to-br from-primary/20 via-background to-primary/10 border-0 shadow-2xl rounded-2xl",
          settings.hoverEffectType !== "none" &&
          settings.hoverEffectIntensity !== "none" &&
          "hover:from-primary/30 hover:via-background hover:to-primary/20 hover:shadow-3xl"
        );
      case "neumorphism":
        return cn(
          baseClasses,
          hoverClasses,
          "bg-background border-0 rounded-3xl",
          "shadow-[15px_15px_30px_rgba(0,0,0,0.1),-15px_-15px_30px_rgba(255,255,255,0.1)]",
          "dark:shadow-[15px_15px_30px_rgba(0,0,0,0.3),-15px_-15px_30px_rgba(255,255,255,0.05)]",
          settings.hoverEffectType !== "none" &&
          settings.hoverEffectIntensity !== "none" &&
          "hover:shadow-[20px_20px_40px_rgba(0,0,0,0.15),-20px_-20px_40px_rgba(255,255,255,0.15)]"
        );
      case "cyberpunk":
        return cn(
          baseClasses,
          hoverClasses,
          "bg-background border-2 border-primary rounded-none shadow-[0_0_25px_rgba(var(--primary),0.4)]",
          "dark:bg-black/95",
          "before:absolute before:top-0 before:left-0 before:h-0.5 before:w-full before:bg-gradient-to-r before:from-transparent before:via-primary before:to-transparent",
          "relative",
          settings.hoverEffectType !== "none" &&
          settings.hoverEffectIntensity !== "none" &&
          "hover:bg-primary/10 hover:shadow-[0_0_40px_rgba(var(--primary),0.6)]"
        );
      case "luxury":
        return cn(
          baseClasses,
          hoverClasses,
          "bg-gradient-to-br from-amber-50/50 to-amber-100/30 border border-amber-200/30 shadow-2xl rounded-2xl",
          "dark:from-amber-900/20 dark:to-amber-800/10 dark:border-amber-400/20",
          settings.hoverEffectType !== "none" &&
          settings.hoverEffectIntensity !== "none" &&
          "hover:from-amber-100/60 hover:to-amber-50/40 hover:shadow-3xl hover:shadow-amber-200/30",
          "dark:hover:from-amber-800/30 dark:hover:to-amber-700/20"
        );
      case "matrix":
        return cn(
          baseClasses,
          hoverClasses,
          "bg-background border-2 border-green-400/40 shadow-[0_0_20px_rgba(34,197,94,0.4)] rounded-lg",
          "dark:bg-black/98 dark:border-green-400/50",
          settings.hoverEffectType !== "none" &&
          settings.hoverEffectIntensity !== "none" &&
          "hover:border-green-400/60 hover:shadow-[0_0_30px_rgba(34,197,94,0.6)] hover:bg-green-400/5"
        );
      case "diamond":
        return cn(
          baseClasses,
          hoverClasses,
          "bg-gradient-to-br from-violet-50/40 via-pink-50/30 to-blue-50/40 border-2 border-violet-300/50 shadow-[0_0_25px_rgba(139,92,246,0.4)] rounded-2xl",
          "dark:from-violet-900/30 dark:via-pink-900/20 dark:to-blue-900/30 dark:border-violet-400/40",
          settings.hoverEffectType !== "none" &&
          settings.hoverEffectIntensity !== "none" &&
          "hover:from-violet-100/50 hover:via-pink-100/40 hover:to-blue-100/50 hover:shadow-[0_0_35px_rgba(139,92,246,0.6)]"
        );
      case "striped":
        return cn(
          baseClasses,
          hoverClasses,
          "bg-card border",
          settings.hoverEffectType !== "none" &&
          settings.hoverEffectIntensity !== "none" &&
          "hover:shadow-lg"
        );
      case "bordered":
        return cn(
          baseClasses,
          hoverClasses,
          "bg-card border-2",
          settings.hoverEffectType !== "none" &&
          settings.hoverEffectIntensity !== "none" &&
          "hover:shadow-lg"
        );
      case "minimal":
        return cn(
          baseClasses,
          hoverClasses,
          "bg-transparent border-0",
          settings.hoverEffectType !== "none" &&
          settings.hoverEffectIntensity !== "none" &&
          "hover:bg-muted/20"
        );
      default:
        return cn(
          baseClasses,
          hoverClasses,
          "bg-card",
          settings.hoverEffectType !== "none" &&
          settings.hoverEffectIntensity !== "none" &&
          "hover:shadow-lg"
        );
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 bg-muted/50 animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search Bar - Only show if search functionality is enabled */}
      {onSearch !== undefined && (
        <div className="relative">
          <Search className="absolute left-3 rtl:left-auto rtl:right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            ref={searchInputRef}
            placeholder={placeholder}
            className="pl-10 rtl:pl-4 rtl:pr-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      )}

      {/* Mobile Cards View */}
      <div className="block md:hidden space-y-4">
        {sortedData.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">{empty}</div>
        ) : (
          sortedData.map((row, index) => {
            const isSelected = selectable && selectedItems.includes(row.id);
            return (
              <div
                key={index}
                className={cn(
                  getCardClasses(),
                  isSelected && "ring-2 ring-primary"
                )}
              >
                {selectable && (
                  <div className="flex items-center space-x-2 rtl:space-x-reverse pb-2 border-b">
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
                    <span className="text-sm text-muted-foreground">
                      {t("table.select")}
                    </span>
                  </div>
                )}
                {columns.map((column) => (
                  <div
                    key={String(column.key)}
                    className="flex justify-between items-center"
                  >
                    <span
                      className={cn(
                        "font-medium text-muted-foreground",
                        settings.fontSize === "small"
                          ? "text-xs"
                          : settings.fontSize === "large"
                            ? "text-base"
                            : "text-sm"
                      )}
                    >
                      {column.label}:
                    </span>
                    <span
                      className={cn(
                        settings.fontSize === "small"
                          ? "text-xs"
                          : settings.fontSize === "large"
                            ? "text-base"
                            : "text-sm"
                      )}
                    >
                      {column.render
                        ? column.render(row[column.key], row)
                        : String(row[column.key])}
                    </span>
                  </div>
                ))}
                {((actions && actions.length > 0) || renderActions) && (
                  <div className="flex justify-end pt-2 border-t border-border/50">
                    {renderActions ? (
                      renderActions(row)
                    ) : (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className={cn(
                              "transition-all duration-200",
                              "hover:bg-primary/10 hover:shadow-md hover:scale-105",
                              "active:scale-95 focus:ring-2 focus:ring-primary/20"
                            )}
                          >
                            <MoreHorizontal className="h-4 w-4 transition-colors duration-200" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className={cn(
                            "min-w-[160px] shadow-xl border-border/50",
                            "bg-background/95 backdrop-blur-md",
                            "animate-in slide-in-from-top-2 duration-200"
                          )}
                        >
                          {actions &&
                            actions
                              .filter(
                                (action) => !action.show || action.show(row)
                              )
                              .map((action, actionIndex) => (
                                <DropdownMenuItem
                                  key={actionIndex}
                                  onClick={() => action.onClick(row)}
                                  className={cn(
                                    "transition-all duration-200 cursor-pointer",
                                    "hover:bg-primary/10 hover:shadow-sm",
                                    action.variant === "destructive"
                                      ? "text-destructive focus:text-destructive hover:bg-destructive/10"
                                      : "hover:text-primary",
                                    action.className
                                  )}
                                >
                                  {action.icon && (
                                    <action.icon className="w-4 h-4 mr-2 rtl:mr-0 rtl:ml-2 transition-transform duration-200 group-hover:scale-110" />
                                  )}
                                  <span className="font-medium">
                                    {action.label}
                                  </span>
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
        className={cn("hidden md:block", getTableContainerClasses())}
        ref={tableRef}
      >
        <div className="relative" style={{ paddingTop: '12px', paddingBottom: '12px', paddingLeft: '8px', paddingRight: '8px' }}>
          <div className="overflow-x-auto">
            {/* Scroll Shadow Overlays */}
            {showLeftShadow && (
              <div
                className={cn(
                  "absolute top-0 bottom-0 w-4 z-10 pointer-events-none",
                  direction === "rtl"
                    ? "right-0 bg-gradient-to-l from-background/80 to-transparent"
                    : "left-0 bg-gradient-to-r from-background/80 to-transparent"
                )}
              />
            )}
            {showRightShadow && (
              <div
                className={cn(
                  "absolute top-0 bottom-0 w-4 z-10 pointer-events-none",
                  direction === "rtl"
                    ? "left-0 bg-gradient-to-r from-background/80 to-transparent"
                    : "right-0 bg-gradient-to-l from-background/80 to-transparent"
                )}
              />
            )}
            <Table>
              <TableHeader>
                <TableRow className={getHeaderClasses()}>
                  {selectable && (
                    <TableHead
                      className={cn("w-12", getCellPadding(), "relative")}
                    >
                      <div
                        className={cn(
                          "absolute inset-0 flex items-center",
                          direction === "rtl" ? "right-4" : "left-4"
                        )}
                      >
                        <Checkbox
                          checked={
                            selectedItems.length === sortedData.length &&
                            sortedData.length > 0
                          }
                          onCheckedChange={(checked) => {
                            if (onSelectionChange) {
                              const newSelected = checked
                                ? sortedData.map((row) => row.id)
                                : [];
                              onSelectionChange(newSelected);
                            }
                          }}
                        />
                      </div>
                    </TableHead>
                  )}
                  {columns.map((column, columnIndex) => (
                    <TableHead
                      key={String(column.key)}
                      className={cn(
                        "font-semibold text-foreground",
                        getCellPadding(),
                        direction === "rtl" ? "text-right" : "text-left",
                        column.width && `w-${column.width}`,
                        settings.fontSize === "small"
                          ? "text-xs"
                          : settings.fontSize === "large"
                            ? "text-base"
                            : "text-sm",
                        // Add borders to all columns - every column gets a border on the right side
                        cn(
                          direction === "rtl" &&
                          cn(
                            columnIndex === 0 &&
                            "border-l-2 border-l-border/60",
                            columnIndex > 0 && "border-l-2 border-l-border/60"
                          ),
                          direction !== "rtl" &&
                          cn(
                            columnIndex === 0 &&
                            "border-r-2 border-r-border/60",
                            columnIndex > 0 && "border-r-2 border-r-border/60"
                          )
                        ),
                        // Add border to the last column before actions when sticky actions are enabled
                        stickyActions &&
                        actions &&
                        actions.length > 0 &&
                        columnIndex === columns.length - 1 &&
                        cn(
                          direction === "rtl" &&
                          "border-l-4 border-l-primary/50",
                          direction !== "rtl" &&
                          "border-r-4 border-r-primary/50"
                        )
                      )}
                    >
                      {column.sortable ? (
                        <Button
                          variant="ghost"
                          onClick={() => handleSort(column.key)}
                          className={cn(
                            "h-auto p-0 font-semibold hover:bg-transparent",
                            direction === "rtl" ? "justify-end" : "justify-start"
                          )}
                        >
                          {column.label}
                          <ArrowUpDown
                            className={cn(
                              "h-4 w-4",
                              direction === "rtl" ? "mr-2" : "ml-2"
                            )}
                          />
                        </Button>
                      ) : (
                        column.label
                      )}
                    </TableHead>
                  ))}
                  {((actions && actions.length > 0) || renderActions) && (
                    <TableHead
                      ref={actionsColumnRef}
                      className={cn(
                        "w-16 transition-all duration-300 ease-in-out",
                        getCellPadding(),
                        direction === "rtl" ? "text-right" : "text-left",
                        stickyActions &&
                        cn(
                          getStickyActionsClasses(),
                          "z-20 relative overflow-hidden",
                          "hover:shadow-xl hover:shadow-black/10 dark:hover:shadow-black/30",
                          "before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-primary/5 before:to-transparent",
                          "before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-700",
                          "border-b-4 border-b-primary/70"
                        ),
                        direction === "rtl" &&
                        stickyActions &&
                        "border-r-4 border-r-primary/60 shadow-[-6px_0_12px_rgba(0,0,0,0.2)]",
                        direction !== "rtl" &&
                        stickyActions &&
                        "border-l-4 border-l-primary/60 shadow-[6px_0_12px_rgba(0,0,0,0.2)]"
                      )}
                      style={
                        stickyActions
                          ? {
                            position: "sticky",
                            [direction === "rtl" ? "left" : "right"]: "0px",
                          }
                          : undefined
                      }
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-foreground">
                          {t("table.actions")}
                        </span>
                      </div>
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
                        ((actions && actions.length > 0) || renderActions
                          ? 1
                          : 0) +
                        (selectable ? 1 : 0)
                      }
                      className="h-32 text-center text-muted-foreground"
                    >
                      {empty}
                    </TableCell>
                  </TableRow>
                ) : (
                  sortedData.map((row, index) => {
                    const isSelected =
                      selectable && selectedItems.includes(row.id);
                    return (
                      <TableRow
                        key={index}
                        className={getRowClasses(index, isSelected)}
                      >
                        {selectable && (
                          <TableCell className={cn(getCellPadding(), "relative")}>
                            <div
                              className={cn(
                                "absolute inset-0 flex items-center",
                                direction === "rtl" ? "right-4" : "left-4"
                              )}
                            >
                              <Checkbox
                                checked={isSelected}
                                onCheckedChange={(checked) => {
                                  if (onSelectionChange) {
                                    const newSelected = checked
                                      ? [...selectedItems, row.id]
                                      : selectedItems.filter(
                                        (id) => id !== row.id
                                      );
                                    onSelectionChange(newSelected);
                                  }
                                }}
                              />
                            </div>
                          </TableCell>
                        )}
                        {columns.map((column, columnIndex) => (
                          <TableCell
                            key={String(column.key)}
                            className={cn(
                              "align-middle",
                              getCellPadding(),
                              direction === "rtl" ? "text-right" : "text-left",
                              settings.fontSize === "small"
                                ? "text-xs"
                                : settings.fontSize === "large"
                                  ? "text-base"
                                  : "text-sm",
                              // Add borders to all columns - every column gets a border on the right side
                              cn(
                                direction === "rtl" &&
                                cn(
                                  columnIndex === 0 &&
                                  "border-l-2 border-l-border/60",
                                  columnIndex > 0 &&
                                  "border-l-2 border-l-border/60"
                                ),
                                direction !== "rtl" &&
                                cn(
                                  columnIndex === 0 &&
                                  "border-r-2 border-r-border/60",
                                  columnIndex > 0 &&
                                  "border-r-2 border-r-border/60"
                                )
                              ),
                              // Add border to the last column before actions when sticky actions are enabled
                              stickyActions &&
                              actions &&
                              actions.length > 0 &&
                              columnIndex === columns.length - 1 &&
                              cn(
                                direction === "rtl" &&
                                "border-l-4 border-l-primary/50",
                                direction !== "rtl" &&
                                "border-r-4 border-r-primary/50"
                              )
                            )}
                          >
                            {column.render
                              ? column.render(row[column.key], row)
                              : String(row[column.key])}
                          </TableCell>
                        ))}
                        {((actions && actions.length > 0) || renderActions) && (
                          <TableCell
                            className={cn(
                              getCellPadding(),
                              "transition-all duration-300 ease-in-out",
                              stickyActions &&
                              cn(
                                getStickyActionsClasses(),
                                "z-20 relative overflow-hidden",
                                "hover:shadow-xl hover:shadow-black/10 dark:hover:shadow-black/30",
                                "before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-primary/5 before:to-transparent",
                                "before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-700",
                                "border-b-4 border-b-primary/60",
                                index === 0 && "border-t-4 border-t-primary/70"
                              ),
                              direction === "rtl" &&
                              stickyActions &&
                              "border-r-4 border-r-primary/60 shadow-[-6px_0_12px_rgba(0,0,0,0.2)]",
                              direction !== "rtl" &&
                              stickyActions &&
                              "border-l-4 border-l-primary/60 shadow-[6px_0_12px_rgba(0,0,0,0.2)]"
                            )}
                            style={
                              stickyActions
                                ? {
                                  position: "sticky",
                                  [direction === "rtl" ? "left" : "right"]:
                                    "0px",
                                }
                                : undefined
                            }
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
                                      className={cn(
                                        "h-8 w-8 p-0 transition-all duration-200",
                                        "hover:bg-primary/10 hover:shadow-md hover:scale-105",
                                        "active:scale-95 focus:ring-2 focus:ring-primary/20",
                                        stickyActions &&
                                        "hover:bg-primary/15 hover:shadow-lg"
                                      )}
                                    >
                                      <MoreHorizontal className="h-4 w-4 transition-colors duration-200" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent
                                    align={direction === "rtl" ? "start" : "end"}
                                    className={cn(
                                      "min-w-[160px] shadow-xl border-border/50",
                                      "bg-background/95 backdrop-blur-md",
                                      "animate-in slide-in-from-top-2 duration-200"
                                    )}
                                  >
                                    {actions &&
                                      actions
                                        .filter(
                                          (action) =>
                                            !action.show || action.show(row)
                                        )
                                        .map((action, actionIndex) => (
                                          <DropdownMenuItem
                                            key={actionIndex}
                                            onClick={() => action.onClick(row)}
                                            className={cn(
                                              "transition-all duration-200 cursor-pointer",
                                              "hover:bg-primary/10 hover:shadow-sm",
                                              action.variant === "destructive"
                                                ? "text-destructive focus:text-destructive hover:bg-destructive/10"
                                                : "hover:text-primary",
                                              action.className
                                            )}
                                          >
                                            {action.icon && (
                                              <action.icon className="w-4 h-4 mr-2 rtl:mr-0 rtl:ml-2 transition-transform duration-200 group-hover:scale-110" />
                                            )}
                                            <span className="font-medium">
                                              {action.label}
                                            </span>
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

      {/* Professional Pagination */}
      {pagination && (
        <div className="border-t bg-background/50 backdrop-blur-sm">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between p-4 gap-4">
            {/* Results Info */}
            <div className="flex items-center gap-4">
              <p
                className={cn(
                  "text-muted-foreground font-medium",
                  settings.fontSize === "small"
                    ? "text-xs"
                    : settings.fontSize === "large"
                      ? "text-base"
                      : "text-sm"
                )}
              >
                {(() => {
                  const start =
                    (pagination.currentPage - 1) * pagination.pageSize + 1;
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
                  <span className="text-sm text-muted-foreground">
                    {t("table.show")}:
                  </span>
                  <GenericSelect
                    type="single"
                    options={[10, 25, 50, 100].map((size) => ({
                      value: String(size),
                      label: String(size),
                    }))}
                    value={String(pagination.pageSize)}
                    onValueChange={(v: string | string[]) =>
                      pagination.onPageSizeChange?.(
                        Number(typeof v === "string" ? v : v[0])
                      )
                    }
                    className="min-w-[100px] w-auto max-w-[120px] h-8 text-center font-medium"
                    allowClear={false}
                  />
                  <span className="text-sm text-muted-foreground">
                    {t("table.perPage")}
                  </span>
                </div>
              )}
            </div>

            {/* Advanced Pagination Controls */}
            {pagination.pagesCount > 1 && (
              <div className="flex items-center gap-2">
                {/* First Page */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => pagination.onPageChange(1)}
                  disabled={pagination.currentPage === 1}
                  className={cn(
                    "h-8 w-8 p-0",
                    direction === "rtl" && "rotate-180"
                  )}
                  title={t("table.firstPage")}
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
                    />
                  </svg>
                </Button>

                {/* Previous Page */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    pagination.onPageChange(pagination.currentPage - 1)
                  }
                  disabled={pagination.currentPage === 1}
                  className={cn(
                    "h-8 w-8 p-0",
                    direction === "rtl" && "rotate-180"
                  )}
                  title={t("table.previousPage")}
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </Button>

                {/* Page Numbers with Smart Truncation */}
                <div className="flex items-center gap-1">
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
                        for (let i = current - 1; i <= current + 1; i++)
                          pages.push(i);
                        pages.push("...");
                        pages.push(total);
                      }
                    }

                    return pages.map((page, index) => {
                      if (page === "...") {
                        return (
                          <span
                            key={`ellipsis-${index}`}
                            className="px-2 py-1 text-muted-foreground"
                          >
                            ...
                          </span>
                        );
                      }

                      const pageNum = page as number;
                      const isActive = pageNum === current;

                      return (
                        <Button
                          key={pageNum}
                          variant={isActive ? "default" : "outline"}
                          size="sm"
                          onClick={() => pagination.onPageChange(pageNum)}
                          className={cn(
                            "h-8 w-8 p-0",
                            isActive &&
                            "bg-primary text-primary-foreground shadow-sm"
                          )}
                        >
                          {pageNum}
                        </Button>
                      );
                    });
                  })()}
                </div>

                {/* Next Page */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    pagination.onPageChange(pagination.currentPage + 1)
                  }
                  disabled={pagination.currentPage === pagination.pagesCount}
                  className={cn(
                    "h-8 w-8 p-0",
                    direction === "rtl" && "rotate-180"
                  )}
                  title={t("table.nextPage")}
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </Button>

                {/* Last Page */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => pagination.onPageChange(pagination.pagesCount)}
                  disabled={pagination.currentPage === pagination.pagesCount}
                  className={cn(
                    "h-8 w-8 p-0",
                    direction === "rtl" && "rotate-180"
                  )}
                  title={t("table.lastPage")}
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 5l7 7-7 7M5 5l7 7-7 7"
                    />
                  </svg>
                </Button>

                {/* Page Jump Input */}
                <div className="flex items-center gap-2 ml-4 pl-4 border-l">
                  <span className="text-sm text-muted-foreground whitespace-nowrap">
                    {t("table.goToPage")}:
                  </span>
                  <Input
                    type="number"
                    min={1}
                    max={pagination.pagesCount}
                    className="w-16 h-8 text-center"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        const value = parseInt(
                          (e.target as HTMLInputElement).value
                        );
                        if (value >= 1 && value <= pagination.pagesCount) {
                          pagination.onPageChange(value);
                          (e.target as HTMLInputElement).value = "";
                        }
                      }
                    }}
                    placeholder={String(pagination.currentPage)}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
