"use client";

import React, { useEffect, useMemo, useState } from "react";
import { cn } from "@core/common/utils";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@core/ui/dropdown-menu";
import {
  ChevronRight,
  ChevronDown,
  Folder,
  FolderOpen,
  MoreHorizontal,
  Circle,
  GitBranch,
} from "lucide-react";
import { Checkbox } from "@core/ui/checkbox";
import { useI18n } from "@core/providers/i18n-provider";
import { useSettings } from "@core/providers/settings-provider";

export type TreeVariant =
  | "lines"
  | "cards"
  | "minimal"
  | "bubble"
  | "modern"
  | "glass"
  | "elegant"
  | "professional"
  | "gradient"
  | "neon"
  | "organic"
  | "corporate";

export interface TreeAction {
  label: string;
  onClick: () => void;
  variant?: "default" | "destructive" | "ghost";
  icon?: React.ReactNode;
  disabled?: boolean;
}

export interface TreeViewProps<T> {
  data: T[];
  getId: (node: T) => string;
  getLabel: (node: T) => React.ReactNode;
  getChildren: (node: T) => T[] | undefined;
  search?: {
    value: string;
    onChange: (v: string) => void;
    placeholder?: string;
    inputRef?: React.RefObject<HTMLInputElement | null>;
  };
  actions?: (node: T) => TreeAction[];
  loading?: boolean;
  toolbar?: React.ReactNode;
  emptyMessage?: string;
  defaultExpanded?: boolean;
  onExpandChange?: (expandedIds: string[]) => void;
  className?: string;
  variant?: TreeVariant; // override; otherwise uses settings.treeStyle
  headerComponent?: React.ReactNode;
  footerComponent?: React.ReactNode;
  aboveTreeComponent?: React.ReactNode;
  belowTreeComponent?: React.ReactNode;
  // Selectable functionality
  selectable?: boolean;
  selectedValues?: string[];
  onSelectionChange?: (selectedValues: string[]) => void;
  getValueToSend?: (node: T) => string;
  disabled?: boolean;
  // Card click expansion
  expandOnCardClick?: boolean; // New prop to enable/disable card click expansion
}

export function TreeView<T>({
  data,
  getId,
  getLabel,
  getChildren,
  search,
  actions,
  loading,
  toolbar,
  emptyMessage,
  defaultExpanded = true,
  onExpandChange,
  className,
  variant,
  headerComponent,
  footerComponent,
  aboveTreeComponent,
  belowTreeComponent,
  selectable = false,
  selectedValues = [],
  onSelectionChange,
  getValueToSend,
  disabled = false,
  expandOnCardClick = false, // Default to false for backward compatibility
}: TreeViewProps<T>) {
  const { direction, language, t } = useI18n();
  const settings = useSettings();

  const computedVariant: TreeVariant = useMemo(() => {
    if (variant) return variant;
    return settings.treeStyle;
  }, [variant, settings.treeStyle]);

  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [isAllExpanded, setIsAllExpanded] = useState<boolean>(defaultExpanded);

  // Initialize expand state whenever data changes
  useEffect(() => {
    const next: Record<string, boolean> = {};
    const walk = (nodes: T[]) => {
      nodes.forEach((n) => {
        const id = getId(n);
        const children = getChildren(n) ?? [];

        // Only set defaultExpanded if the node hasn't been manually toggled before
        if (!(id in expanded)) {
          next[id] = defaultExpanded;
        } else {
          next[id] = expanded[id];
        }

        if (children.length > 0) walk(children);
      });
    };
    walk(data);
    setExpanded(next);

    // Update isAllExpanded based on current state
    const allExpanded = Object.values(next).every(Boolean);
    setIsAllExpanded(allExpanded);
  }, [data, defaultExpanded, getChildren, getId]);

  const handleToggleNode = (id: string) => {
    setExpanded((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      onExpandChange?.(Object.keys(next).filter((k) => next[k]));
      return next;
    });
  };

  const expandAll = () => {
    setExpanded((prev) => {
      const all: Record<string, boolean> = {};
      // Get all node IDs from the current data
      const getAllIds = (nodes: T[]): string[] => {
        const ids: string[] = [];
        nodes.forEach((node) => {
          ids.push(getId(node));
          const children = getChildren(node) ?? [];
          if (children.length > 0) {
            ids.push(...getAllIds(children));
          }
        });
        return ids;
      };

      const allIds = getAllIds(data);
      allIds.forEach((id) => (all[id] = true));
      onExpandChange?.(allIds);
      return all;
    });
    setIsAllExpanded(true);
  };

  const collapseAll = () => {
    setExpanded((prev) => {
      const all: Record<string, boolean> = {};
      // Get all node IDs from the current data
      const getAllIds = (nodes: T[]): string[] => {
        const ids: string[] = [];
        nodes.forEach((node) => {
          ids.push(getId(node));
          const children = getChildren(node) ?? [];
          if (children.length > 0) {
            ids.push(...getAllIds(children));
          }
        });
        return ids;
      };

      const allIds = getAllIds(data);
      allIds.forEach((id) => (all[id] = false));
      onExpandChange?.([]);
      return all;
    });
    setIsAllExpanded(false);
  };

  const density = useMemo(() => {
    switch (settings.spacingSize) {
      case "compact":
        return { pad: "p-2", childPad: "pl-4 rtl:pl-0 rtl:pr-4" };
      case "spacious":
        return { pad: "p-4", childPad: "pl-8 rtl:pl-0 rtl:pr-8" };
      case "comfortable":
        return { pad: "p-3", childPad: "pl-6 rtl:pl-0 rtl:pr-6" };
      default:
        return { pad: "p-3", childPad: "pl-6 rtl:pl-0 rtl:pr-6" };
    }
  }, [settings.spacingSize]);

  const radius = useMemo(() => {
    switch (settings.borderRadius) {
      case "none":
        return "rounded-none";
      case "small":
        return "rounded-sm";
      case "large":
        return "rounded-lg";
      case "full":
        return "rounded-full";
      default:
        return "rounded-md";
    }
  }, [settings.borderRadius]);

  const shadow = useMemo(() => {
    switch (settings.shadowIntensity) {
      case "none":
        return "";
      case "subtle":
        return "shadow-sm";
      case "strong":
        return "shadow-2xl";
      default:
        return "shadow-lg";
    }
  }, [settings.shadowIntensity]);

  const Toolbar = (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="relative w-full sm:max-w-sm">
        {search && (
          <Input
            ref={search.inputRef}
            value={search.value}
            onChange={(e) => search.onChange(e.target.value)}
            placeholder={search.placeholder ?? "Search"}
            className="w-full"
            autoComplete="off"
          />
        )}
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={isAllExpanded ? collapseAll : expandAll}>
          {isAllExpanded ? t("common.collapseAll") : t("common.expandAll")}
        </Button>
        {toolbar}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className={cn("space-y-4", className)}>
        {headerComponent}
        <div className="space-y-3">
          <div className="h-9 w-56 animate-pulse rounded-md bg-muted/50" />
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-10 animate-pulse rounded-md bg-muted/30" />
          ))}
        </div>
        {footerComponent}
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className={cn("space-y-4", className)}>
        {headerComponent}
        {Toolbar}
        {aboveTreeComponent}
        <div className="py-12 text-center text-muted-foreground">{emptyMessage ?? "No data"}</div>
        {belowTreeComponent}
        {footerComponent}
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {headerComponent}
      {Toolbar}
      {aboveTreeComponent}
      <div className={cn("relative", computedVariant === "cards" ? "space-y-2" : "")}>
        <TreeList<T>
          nodes={data}
          variant={computedVariant}
          getId={getId}
          getLabel={getLabel}
          getChildren={getChildren}
          expanded={expanded}
          onToggle={handleToggleNode}
          direction={direction}
          actions={actions}
          density={density}
          radius={radius}
          shadow={shadow}
          cardStyle={settings.cardStyle}
          selectable={selectable}
          selectedValues={selectedValues}
          onSelectionChange={onSelectionChange}
          getValueToSend={getValueToSend}
          disabled={disabled}
          expandOnCardClick={expandOnCardClick}
        />
      </div>
      {belowTreeComponent}
      {footerComponent}
    </div>
  );
}

// Professional node styling function for all tree variants
function getNodeStyling(
  variant: TreeVariant,
  level: number,
  density: { pad: string; childPad: string },
  radius: string,
  shadow: string,
  cardStyle: string,
  hasChildren: boolean,
  isOpen: boolean
) {
  const baseTransition = "transition-all duration-300 ease-in-out";
  const hoverScale = "hover:scale-[1.02] active:scale-[0.98]";

  switch (variant) {
    case "modern":
      return cn(
        "bg-gradient-to-r from-background via-background/95 to-background/90",
        "border border-border/50 hover:border-primary/30",
        "backdrop-blur-sm",
        density.pad,
        radius,
        shadow,
        baseTransition,
        hoverScale,
        "hover:shadow-lg hover:shadow-primary/10",
        level === 0 ? "font-semibold text-foreground" : "font-medium text-muted-foreground",
        hasChildren && isOpen ? "bg-primary/5 border-primary/20" : ""
      );

    case "glass":
      return cn(
        "bg-white/10 dark:bg-white/5 backdrop-blur-md",
        "border border-white/20 dark:border-white/10",
        "hover:bg-white/20 dark:hover:bg-white/10",
        "hover:border-white/30 dark:hover:border-white/20",
        density.pad,
        "rounded-xl",
        "shadow-lg shadow-black/5 dark:shadow-black/20",
        baseTransition,
        hoverScale,
        level === 0 ? "font-semibold" : "font-medium",
        hasChildren && isOpen ? "bg-primary/10 border-primary/30" : ""
      );

    case "elegant":
      return cn(
        "bg-gradient-to-br from-background via-background/98 to-muted/30",
        "border-l-4 border-l-primary/60 border-y border-r border-border/30",
        "hover:border-l-primary hover:border-y-primary/20 hover:border-r-primary/20",
        "hover:bg-gradient-to-br hover:from-primary/5 hover:via-background/95 hover:to-primary/10",
        density.pad,
        "rounded-r-lg",
        "shadow-sm hover:shadow-md",
        baseTransition,
        level === 0 ? "font-bold text-foreground" : "font-medium text-muted-foreground",
        hasChildren && isOpen
          ? "bg-gradient-to-br from-primary/10 via-background/90 to-primary/20"
          : ""
      );

    case "professional":
      return cn(
        "bg-card border border-border",
        "hover:bg-muted/50 hover:border-primary/40",
        "hover:shadow-sm",
        density.pad,
        "rounded-md",
        baseTransition,
        "relative overflow-hidden",
        "before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-primary/5 before:to-transparent",
        "before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-700",
        level === 0 ? "font-semibold border-l-4 border-l-primary/60" : "font-medium",
        hasChildren && isOpen ? "bg-primary/5 border-primary/30" : ""
      );

    case "gradient":
      return cn(
        "bg-gradient-to-r from-primary/10 via-background to-secondary/10",
        "hover:from-primary/20 hover:via-background/95 hover:to-secondary/20",
        "border border-transparent hover:border-primary/20",
        "backdrop-blur-sm",
        density.pad,
        radius,
        "shadow-md hover:shadow-lg",
        baseTransition,
        hoverScale,
        level === 0
          ? "font-bold bg-gradient-to-r from-primary/20 via-background to-secondary/20"
          : "font-medium",
        hasChildren && isOpen ? "from-primary/30 via-background/90 to-secondary/30" : ""
      );

    case "neon":
      return cn(
        "bg-background/90 backdrop-blur-sm",
        "border border-primary/30 hover:border-primary/60",
        "hover:bg-primary/5",
        "hover:shadow-lg hover:shadow-primary/20",
        "hover:glow-primary",
        density.pad,
        "rounded-lg",
        baseTransition,
        hoverScale,
        level === 0 ? "font-bold text-primary shadow-sm shadow-primary/10" : "font-medium",
        hasChildren && isOpen ? "bg-primary/10 border-primary/50 shadow-md shadow-primary/20" : "",
        "relative before:absolute before:inset-0 before:rounded-lg before:bg-gradient-to-r before:from-transparent before:via-primary/10 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity before:pointer-events-none"
      );

    case "organic":
      return cn(
        "bg-gradient-to-br from-green-50/50 via-background to-blue-50/50",
        "dark:from-green-950/20 dark:via-background dark:to-blue-950/20",
        "border border-green-200/30 dark:border-green-800/30",
        "hover:border-green-300/50 dark:hover:border-green-700/50",
        "hover:from-green-100/60 hover:via-background/95 hover:to-blue-100/60",
        "dark:hover:from-green-900/30 dark:hover:via-background/95 dark:hover:to-blue-900/30",
        density.pad,
        "rounded-2xl",
        "shadow-sm hover:shadow-md",
        baseTransition,
        "transform hover:rotate-1 hover:scale-[1.01]",
        level === 0 ? "font-semibold" : "font-medium",
        hasChildren && isOpen
          ? "from-green-100/80 via-background/90 to-blue-100/80 dark:from-green-900/40 dark:via-background/90 dark:to-blue-900/40"
          : ""
      );

    case "corporate":
      return cn(
        "bg-slate-50/50 dark:bg-slate-900/50",
        "border-l-4 border-l-blue-600 border-y border-r border-slate-200 dark:border-slate-700",
        "hover:bg-slate-100/60 dark:hover:bg-slate-800/60",
        "hover:border-l-blue-500 hover:border-y-blue-200 hover:border-r-blue-200",
        "dark:hover:border-y-blue-800 dark:hover:border-r-blue-800",
        density.pad,
        "rounded-r-md",
        baseTransition,
        level === 0
          ? "font-bold text-slate-900 dark:text-slate-100 border-l-8"
          : "font-medium text-slate-700 dark:text-slate-300",
        hasChildren && isOpen ? "bg-blue-50/60 dark:bg-blue-950/30 border-l-blue-500" : ""
      );

    case "cards":
      return cn(
        "bg-card border",
        density.pad,
        radius,
        shadow,
        "hover:bg-muted/50 transition-colors",
        cardStyle === "glass" ? "bg-white/10 backdrop-blur border-white/20" : "",
        cardStyle === "bordered" ? "border-2" : "",
        cardStyle === "elevated" ? "shadow-xl" : ""
      );

    case "bubble":
      return cn(
        "inline-flex items-center gap-2",
        "bg-gradient-to-r from-primary/10 via-primary/5 to-transparent",
        "text-primary border border-primary/20",
        "px-3 py-2",
        "rounded-full",
        "hover:from-primary/15 hover:via-primary/10",
        "transition-colors"
      );

    case "minimal":
      return cn(
        "bg-card border hover:bg-muted/40 transition-colors",
        density.pad,
        radius,
        level === 0 ? "font-semibold" : "font-normal"
      );

    case "lines":
    default:
      return cn(
        "bg-card border hover:bg-muted/40 transition-colors",
        density.pad,
        radius,
        level === 0 ? "font-semibold" : "font-normal"
      );
  }
}

function TreeList<T>({
  nodes,
  variant,
  getId,
  getLabel,
  getChildren,
  expanded,
  onToggle,
  direction,
  actions,
  level = 0,
  density,
  radius,
  shadow,
  cardStyle,
  selectable = false,
  selectedValues = [],
  onSelectionChange,
  getValueToSend,
  disabled = false,
  expandOnCardClick = false,
}: {
  nodes: T[];
  variant: TreeVariant;
  getId: (node: T) => string;
  getLabel: (node: T) => React.ReactNode;
  getChildren: (node: T) => T[] | undefined;
  expanded: Record<string, boolean>;
  onToggle: (id: string) => void;
  direction: "ltr" | "rtl";
  actions?: (node: T) => TreeAction[];
  level?: number;
  density: { pad: string; childPad: string };
  radius: string;
  shadow: string;
  cardStyle: string;
  selectable?: boolean;
  selectedValues?: string[];
  onSelectionChange?: (selectedValues: string[]) => void;
  getValueToSend?: (node: T) => string;
  disabled?: boolean;
  expandOnCardClick?: boolean;
}) {
  const connectorLine =
    "border-muted-foreground/20 " +
    (variant === "lines"
      ? "border-solid"
      : variant === "minimal"
        ? "border-dashed"
        : "border-solid");

  // Selection logic helpers
  const isNodeSelected = (nodeValue: string) => {
    return selectedValues.includes(nodeValue);
  };

  const getAllChildrenValues = (node: T): string[] => {
    const children = getChildren(node) ?? [];
    const values: string[] = [];

    children.forEach((child) => {
      if (getValueToSend) {
        values.push(getValueToSend(child));
        values.push(...getAllChildrenValues(child));
      }
    });

    return values;
  };

  const getAllParentValues = (nodeValue: string, allNodes: T[]): string[] => {
    const parents: string[] = [];

    const findParents = (
      nodes: T[],
      targetValue: string,
      currentParents: string[] = []
    ): boolean => {
      for (const node of nodes) {
        if (!getValueToSend) return false;
        const nodeVal = getValueToSend(node);
        const children = getChildren(node) ?? [];

        if (children.some((child) => getValueToSend(child) === targetValue)) {
          parents.push(...currentParents, nodeVal);
          return true;
        }

        if (findParents(children, targetValue, [...currentParents, nodeVal])) {
          return true;
        }
      }
      return false;
    };

    findParents(allNodes, nodeValue);
    return parents;
  };

  const isNodeIndeterminate = (node: T) => {
    const children = getChildren(node) ?? [];
    if (children.length === 0 || !getValueToSend) return false;

    const nodeValue = getValueToSend(node);
    if (selectedValues.includes(nodeValue)) return false;

    const childrenValues = getAllChildrenValues(node);
    return childrenValues.some((childValue) => selectedValues.includes(childValue));
  };

  const handleSelectionChange = (nodeValue: string, checked: boolean) => {
    if (!onSelectionChange || !getValueToSend) return;

    const node = nodes.find((n) => getValueToSend(n) === nodeValue);
    if (!node) return;

    let newSelection = [...selectedValues];

    if (checked) {
      // Add the node
      if (!newSelection.includes(nodeValue)) {
        newSelection.push(nodeValue);
      }

      // Auto-select all parents
      const parentValues = getAllParentValues(nodeValue, nodes);
      parentValues.forEach((parentValue) => {
        if (!newSelection.includes(parentValue)) {
          newSelection.push(parentValue);
        }
      });
    } else {
      // Remove the node
      newSelection = newSelection.filter((val) => val !== nodeValue);

      // Remove all children
      const childrenValues = getAllChildrenValues(node);
      newSelection = newSelection.filter((val) => !childrenValues.includes(val));
    }

    onSelectionChange(newSelection);
  };

  return (
    <ul className={cn("m-0 list-none p-0", variant === "lines" && level > 0 ? "relative" : "")}>
      {nodes.map((node) => {
        const id = getId(node);
        const label = getLabel(node);
        const nodeValue = getValueToSend ? getValueToSend(node) : "";
        const children = getChildren(node) ?? [];
        const hasChildren = children.length > 0;
        const isOpen = expanded[id];
        const selected = selectable && getValueToSend ? isNodeSelected(nodeValue) : false;
        const indeterminate = selectable && getValueToSend ? isNodeIndeterminate(node) : false;

        const nodeBase = getNodeStyling(
          variant,
          level,
          density,
          radius,
          shadow,
          cardStyle,
          hasChildren,
          isOpen
        );

        return (
          <li key={id} className={cn("group relative", variant === "cards" && "mb-2")}>
            {/* Node row */}
            <div
              className={cn(
                "flex items-center gap-2",
                variant === "bubble" ? "" : "rounded-md",
                nodeBase,
                expandOnCardClick && hasChildren && !disabled ? "cursor-pointer" : ""
              )}
              onClick={(e) => {
                // Handle card click expansion if enabled and node has children
                if (expandOnCardClick && hasChildren && !disabled) {
                  onToggle(id);
                }
              }}
            >
              {/* Toggle */}
              <button
                type="button"
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded transition-colors hover:bg-muted",
                  !hasChildren && "cursor-default opacity-60",
                  disabled && "cursor-not-allowed opacity-50"
                )}
                onClick={(e) => {
                  e.stopPropagation();
                  if (hasChildren && !disabled) {
                    onToggle(id);
                  }
                }}
                disabled={disabled || !hasChildren}
                aria-label={isOpen ? "Collapse" : "Expand"}
              >
                {hasChildren ? (
                  isOpen ? (
                    <ChevronDown className="h-4 w-4 text-primary" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  )
                ) : (
                  <Circle className="h-3 w-3 opacity-40" />
                )}
              </button>

              {/* Checkbox for selectable mode */}
              {selectable && getValueToSend && (
                <div
                  className={cn(
                    "flex min-h-[32px] min-w-[32px] items-center justify-center rounded-md p-2",
                    disabled
                      ? "!cursor-not-allowed !opacity-60"
                      : "cursor-pointer transition-colors hover:bg-muted/50"
                  )}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!disabled) {
                      handleSelectionChange(nodeValue, !selected);
                    }
                  }}
                  style={{
                    cursor: disabled ? "not-allowed !important" : "pointer",
                    opacity: disabled ? "0.6 !important" : "1",
                  }}
                >
                  <Checkbox
                    checked={selected}
                    disabled={disabled}
                    ref={(ref) => {
                      if (ref && indeterminate) {
                        (ref as any).indeterminate = true;
                      }
                    }}
                    onCheckedChange={(checked) =>
                      !disabled && handleSelectionChange(nodeValue, checked === true)
                    }
                    className={cn(
                      "data-[state=checked]:border-primary data-[state=checked]:bg-primary",
                      disabled ? "!cursor-not-allowed !opacity-50" : "",
                      "pointer-events-none"
                    )}
                    style={{
                      cursor: disabled ? "not-allowed !important" : "default",
                      opacity: disabled ? "0.5 !important" : "1",
                      pointerEvents: "none",
                    }}
                  />
                </div>
              )}

              {/* Icon + Label */}
              <div
                className={cn(
                  "flex min-w-0 flex-1 items-center gap-2",
                  selectable && !disabled
                    ? "cursor-pointer rounded-md p-1 transition-colors hover:bg-muted/30"
                    : ""
                )}
                onClick={(e) => {
                  if (selectable && getValueToSend && !disabled) {
                    e.stopPropagation();
                    handleSelectionChange(nodeValue, !selected);
                  }
                }}
              >
                {hasChildren ? (
                  isOpen ? (
                    <FolderOpen className="h-4 w-4 text-primary" />
                  ) : (
                    <Folder className="h-4 w-4 text-primary" />
                  )
                ) : (
                  <Folder className="h-4 w-4 text-muted-foreground" />
                )}
                <span
                  className={cn(
                    "truncate",
                    level === 0 ? "text-base" : "text-sm",
                    selectable && selected ? "font-medium text-primary" : ""
                  )}
                >
                  {label}
                </span>
                {level === 0 && hasChildren && (
                  <span className="ml-2 inline-flex items-center text-xs text-muted-foreground rtl:ml-0 rtl:mr-2">
                    <GitBranch className="mr-1 h-3 w-3 rtl:ml-1 rtl:mr-0" />
                    {children.length}
                  </span>
                )}
              </div>

              {/* Actions */}
              {actions && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-7 w-7">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align={direction === "rtl" ? "start" : "end"}>
                    {actions(node).map((a, idx) => (
                      <DropdownMenuItem
                        key={idx}
                        onClick={a.onClick}
                        disabled={a.disabled}
                        className={cn(
                          a.variant === "destructive" && "text-destructive focus:text-destructive"
                        )}
                      >
                        {a.icon && (
                          <span className="mr-2 shrink-0 rtl:ml-2 rtl:mr-0">{a.icon}</span>
                        )}
                        {a.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>

            {/* Children */}
            {/* Lines variant with connectors */}
            {variant === "lines" && hasChildren && isOpen && (
              <div className={cn("relative", "mt-1")}>
                <div
                  className={cn(
                    "ml-6 rtl:ml-0 rtl:mr-6",
                    "border-l rtl:border-l-0 rtl:border-r",
                    connectorLine
                  )}
                >
                  <div className={cn("pl-4 rtl:pl-0 rtl:pr-4", density.childPad)}>
                    <TreeList<T>
                      nodes={children}
                      variant={variant}
                      getId={getId}
                      getLabel={getLabel}
                      getChildren={getChildren}
                      expanded={expanded}
                      onToggle={onToggle}
                      direction={direction}
                      actions={actions}
                      level={level + 1}
                      density={density}
                      radius={radius}
                      shadow={shadow}
                      cardStyle={cardStyle}
                      selectable={selectable}
                      selectedValues={selectedValues}
                      onSelectionChange={onSelectionChange}
                      getValueToSend={getValueToSend}
                      disabled={disabled}
                      expandOnCardClick={expandOnCardClick}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Cards variant: indented, stacked */}
            {variant === "cards" && hasChildren && isOpen && (
              <div className={cn("mt-2 space-y-2", "pl-8 rtl:pl-0 rtl:pr-8")}>
                <TreeList<T>
                  nodes={children}
                  variant={variant}
                  getId={getId}
                  getLabel={getLabel}
                  getChildren={getChildren}
                  expanded={expanded}
                  onToggle={onToggle}
                  direction={direction}
                  actions={actions}
                  level={level + 1}
                  density={density}
                  radius={radius}
                  shadow={shadow}
                  cardStyle={cardStyle}
                  selectable={selectable}
                  selectedValues={selectedValues}
                  onSelectionChange={onSelectionChange}
                  getValueToSend={getValueToSend}
                  disabled={disabled}
                  expandOnCardClick={expandOnCardClick}
                />
              </div>
            )}

            {/* Minimal: light indent, dashed connectors */}
            {variant === "minimal" && hasChildren && isOpen && (
              <div className={cn("mt-1", "pl-6 rtl:pl-0 rtl:pr-6")}>
                <TreeList<T>
                  nodes={children}
                  variant={variant}
                  getId={getId}
                  getLabel={getLabel}
                  getChildren={getChildren}
                  expanded={expanded}
                  onToggle={onToggle}
                  direction={direction}
                  actions={actions}
                  level={level + 1}
                  density={density}
                  radius={radius}
                  shadow={shadow}
                  cardStyle={cardStyle}
                  selectable={selectable}
                  selectedValues={selectedValues}
                  onSelectionChange={onSelectionChange}
                  getValueToSend={getValueToSend}
                  disabled={disabled}
                  expandOnCardClick={expandOnCardClick}
                />
              </div>
            )}

            {/* Bubble: inline chip-like children wrapping */}
            {variant === "bubble" && hasChildren && isOpen && (
              <div className={cn("mt-2 flex flex-wrap gap-2", "pl-8 rtl:pl-0 rtl:pr-8")}>
                <TreeList<T>
                  nodes={children}
                  variant={variant}
                  getId={getId}
                  getLabel={getLabel}
                  getChildren={getChildren}
                  expanded={expanded}
                  onToggle={onToggle}
                  direction={direction}
                  actions={actions}
                  level={level + 1}
                  density={density}
                  radius={radius}
                  shadow={shadow}
                  cardStyle={cardStyle}
                  selectable={selectable}
                  selectedValues={selectedValues}
                  onSelectionChange={onSelectionChange}
                  getValueToSend={getValueToSend}
                  disabled={disabled}
                  expandOnCardClick={expandOnCardClick}
                />
              </div>
            )}

            {/* Modern: smooth indented with subtle connectors */}
            {variant === "modern" && hasChildren && isOpen && (
              <div className={cn("mt-3 space-y-1", "pl-8 rtl:pl-0 rtl:pr-8")}>
                <TreeList<T>
                  nodes={children}
                  variant={variant}
                  getId={getId}
                  getLabel={getLabel}
                  getChildren={getChildren}
                  expanded={expanded}
                  onToggle={onToggle}
                  direction={direction}
                  actions={actions}
                  level={level + 1}
                  density={density}
                  radius={radius}
                  shadow={shadow}
                  cardStyle={cardStyle}
                  selectable={selectable}
                  selectedValues={selectedValues}
                  onSelectionChange={onSelectionChange}
                  getValueToSend={getValueToSend}
                  disabled={disabled}
                  expandOnCardClick={expandOnCardClick}
                />
              </div>
            )}

            {/* Glass: floating glass panels */}
            {variant === "glass" && hasChildren && isOpen && (
              <div className={cn("mt-4 space-y-3", "pl-6 rtl:pl-0 rtl:pr-6")}>
                <TreeList<T>
                  nodes={children}
                  variant={variant}
                  getId={getId}
                  getLabel={getLabel}
                  getChildren={getChildren}
                  expanded={expanded}
                  onToggle={onToggle}
                  direction={direction}
                  actions={actions}
                  level={level + 1}
                  density={density}
                  radius={radius}
                  shadow={shadow}
                  cardStyle={cardStyle}
                  selectable={selectable}
                  selectedValues={selectedValues}
                  onSelectionChange={onSelectionChange}
                  getValueToSend={getValueToSend}
                  disabled={disabled}
                  expandOnCardClick={expandOnCardClick}
                />
              </div>
            )}

            {/* Elegant: sophisticated left-border hierarchy */}
            {variant === "elegant" && hasChildren && isOpen && (
              <div className={cn("mt-2 space-y-1", "pl-6 rtl:pl-0 rtl:pr-6")}>
                <TreeList<T>
                  nodes={children}
                  variant={variant}
                  getId={getId}
                  getLabel={getLabel}
                  getChildren={getChildren}
                  expanded={expanded}
                  onToggle={onToggle}
                  direction={direction}
                  actions={actions}
                  level={level + 1}
                  density={density}
                  radius={radius}
                  shadow={shadow}
                  cardStyle={cardStyle}
                  selectable={selectable}
                  selectedValues={selectedValues}
                  onSelectionChange={onSelectionChange}
                  getValueToSend={getValueToSend}
                  disabled={disabled}
                  expandOnCardClick={expandOnCardClick}
                />
              </div>
            )}

            {/* Professional: clean business hierarchy */}
            {variant === "professional" && hasChildren && isOpen && (
              <div className={cn("mt-2 space-y-1", "pl-8 rtl:pl-0 rtl:pr-8")}>
                <TreeList<T>
                  nodes={children}
                  variant={variant}
                  getId={getId}
                  getLabel={getLabel}
                  getChildren={getChildren}
                  expanded={expanded}
                  onToggle={onToggle}
                  direction={direction}
                  actions={actions}
                  level={level + 1}
                  density={density}
                  radius={radius}
                  shadow={shadow}
                  cardStyle={cardStyle}
                  selectable={selectable}
                  selectedValues={selectedValues}
                  onSelectionChange={onSelectionChange}
                  getValueToSend={getValueToSend}
                  disabled={disabled}
                  expandOnCardClick={expandOnCardClick}
                />
              </div>
            )}

            {/* Gradient: colorful flowing hierarchy */}
            {variant === "gradient" && hasChildren && isOpen && (
              <div className={cn("mt-3 space-y-2", "pl-8 rtl:pl-0 rtl:pr-8")}>
                <TreeList<T>
                  nodes={children}
                  variant={variant}
                  getId={getId}
                  getLabel={getLabel}
                  getChildren={getChildren}
                  expanded={expanded}
                  onToggle={onToggle}
                  direction={direction}
                  actions={actions}
                  level={level + 1}
                  density={density}
                  radius={radius}
                  shadow={shadow}
                  cardStyle={cardStyle}
                  selectable={selectable}
                  selectedValues={selectedValues}
                  onSelectionChange={onSelectionChange}
                  getValueToSend={getValueToSend}
                />
              </div>
            )}

            {/* Neon: glowing cyber hierarchy */}
            {variant === "neon" && hasChildren && isOpen && (
              <div className={cn("mt-3 space-y-2", "pl-8 rtl:pl-0 rtl:pr-8")}>
                <TreeList<T>
                  nodes={children}
                  variant={variant}
                  getId={getId}
                  getLabel={getLabel}
                  getChildren={getChildren}
                  expanded={expanded}
                  onToggle={onToggle}
                  direction={direction}
                  actions={actions}
                  level={level + 1}
                  density={density}
                  radius={radius}
                  shadow={shadow}
                  cardStyle={cardStyle}
                  selectable={selectable}
                  selectedValues={selectedValues}
                  onSelectionChange={onSelectionChange}
                  getValueToSend={getValueToSend}
                  disabled={disabled}
                  expandOnCardClick={expandOnCardClick}
                />
              </div>
            )}

            {/* Organic: natural flowing hierarchy */}
            {variant === "organic" && hasChildren && isOpen && (
              <div className={cn("mt-4 space-y-3", "pl-10 rtl:pl-0 rtl:pr-10")}>
                <TreeList<T>
                  nodes={children}
                  variant={variant}
                  getId={getId}
                  getLabel={getLabel}
                  getChildren={getChildren}
                  expanded={expanded}
                  onToggle={onToggle}
                  direction={direction}
                  actions={actions}
                  level={level + 1}
                  density={density}
                  radius={radius}
                  shadow={shadow}
                  cardStyle={cardStyle}
                  selectable={selectable}
                  selectedValues={selectedValues}
                  onSelectionChange={onSelectionChange}
                  getValueToSend={getValueToSend}
                  disabled={disabled}
                  expandOnCardClick={expandOnCardClick}
                />
              </div>
            )}

            {/* Corporate: formal business hierarchy */}
            {variant === "corporate" && hasChildren && isOpen && (
              <div className={cn("mt-2 space-y-1", "pl-6 rtl:pl-0 rtl:pr-6")}>
                <TreeList<T>
                  nodes={children}
                  variant={variant}
                  getId={getId}
                  getLabel={getLabel}
                  getChildren={getChildren}
                  expanded={expanded}
                  onToggle={onToggle}
                  direction={direction}
                  actions={actions}
                  level={level + 1}
                  density={density}
                  radius={radius}
                  shadow={shadow}
                  cardStyle={cardStyle}
                  selectable={selectable}
                  selectedValues={selectedValues}
                  onSelectionChange={onSelectionChange}
                  getValueToSend={getValueToSend}
                  disabled={disabled}
                  expandOnCardClick={expandOnCardClick}
                />
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
