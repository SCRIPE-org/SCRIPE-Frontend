"use client";

import React, { useMemo, useState } from "react";
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

// Wave C collapse: 12 tree skins reduce to the two honest structures — "lines"
// (connector hierarchy) and "cards" (stacked panels). The retired skins were
// card panels with different wallpaper, so they all read nearest to "cards";
// "minimal" was pixel-identical to "lines" bar a dashed connector.
export type TreeVariant = "lines" | "cards";

const LEGACY_TREE_VARIANT: Partial<Record<string, TreeVariant>> = {
  minimal: "lines",
  bubble: "cards",
  modern: "cards",
  glass: "cards",
  elegant: "cards",
  professional: "cards",
  gradient: "cards",
  neon: "cards",
  organic: "cards",
  corporate: "cards",
};

// Stored settings can hold values the map no longer knows; unknowns fall back
// to "lines" so first paint is always a styled tree.
export const resolveTreeVariant = (value: string | null | undefined): TreeVariant => {
  if (value === "lines" || value === "cards") return value;
  return (value && LEGACY_TREE_VARIANT[value]) || "lines";
};

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

// Helper component to defer evaluating actions(node)
function NodeActions<T>({
  node,
  actions,
  direction,
}: {
  node: T;
  actions: (node: T) => TreeAction[];
  direction: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-7 w-7">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      {open && (
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
              {a.icon && <span className="me-2 shrink-0">{a.icon}</span>}
              {a.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      )}
    </DropdownMenu>
  );
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
  defaultExpanded = false,
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
  const { direction, t } = useI18n();
  const settings = useSettings();

  const computedVariant: TreeVariant = useMemo(
    () => resolveTreeVariant(variant ?? settings.treeStyle),
    [variant, settings.treeStyle]
  );

  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [isAllExpanded, setIsAllExpanded] = useState<boolean>(defaultExpanded);

  // Initialize expand state whenever data changes
  const [prevData, setPrevData] = useState(data);
  const [prevDefaultExpanded, setPrevDefaultExpanded] = useState(defaultExpanded);

  if (data !== prevData || defaultExpanded !== prevDefaultExpanded) {
    setPrevData(data);
    setPrevDefaultExpanded(defaultExpanded);
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
  }

  const handleToggleNode = (id: string) => {
    setExpanded((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      onExpandChange?.(Object.keys(next).filter((k) => next[k]));
      return next;
    });
  };

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

  const expandAll = () => {
    const all: Record<string, boolean> = {};
    const allIds = getAllIds(data);
    allIds.forEach((id) => (all[id] = true));
    onExpandChange?.(allIds);
    setExpanded(all);
    setIsAllExpanded(true);
  };

  const collapseAll = () => {
    const all: Record<string, boolean> = {};
    getAllIds(data).forEach((id) => (all[id] = false));
    onExpandChange?.([]);
    setExpanded(all);
    setIsAllExpanded(false);
  };

  // ── Selection logic ─────────────────────────────────────
  // Lives at the TreeView level so every walk starts from the ROOT data.
  // The old per-level copy searched only the current subtree, so selecting a
  // node deeper than level 1 never found (or auto-selected) its ancestors.

  const findNodeByValue = (nodes: T[], targetValue: string): T | null => {
    if (!getValueToSend) return null;
    for (const node of nodes) {
      if (getValueToSend(node) === targetValue) return node;
      const found = findNodeByValue(getChildren(node) ?? [], targetValue);
      if (found) return found;
    }
    return null;
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

  const getAllParentValues = (targetValue: string): string[] => {
    const parents: string[] = [];

    const findParents = (nodes: T[], currentParents: string[]): boolean => {
      for (const node of nodes) {
        if (!getValueToSend) return false;
        const nodeVal = getValueToSend(node);
        const children = getChildren(node) ?? [];

        if (children.some((child) => getValueToSend(child) === targetValue)) {
          parents.push(...currentParents, nodeVal);
          return true;
        }

        if (findParents(children, [...currentParents, nodeVal])) {
          return true;
        }
      }
      return false;
    };

    findParents(data, []);
    return parents;
  };

  const isNodeIndeterminate = (node: T): boolean => {
    const children = getChildren(node) ?? [];
    if (children.length === 0 || !getValueToSend) return false;

    const nodeValue = getValueToSend(node);
    if (selectedValues.includes(nodeValue)) return false;

    const childrenValues = getAllChildrenValues(node);
    return childrenValues.some((childValue) => selectedValues.includes(childValue));
  };

  const handleSelectionChange = (nodeValue: string, checked: boolean) => {
    if (!onSelectionChange || !getValueToSend) return;

    const node = findNodeByValue(data, nodeValue);
    if (!node) return;

    let newSelection = [...selectedValues];

    if (checked) {
      // Add the node
      if (!newSelection.includes(nodeValue)) {
        newSelection.push(nodeValue);
      }

      // Auto-select all parents (walked from the root, so any depth works)
      getAllParentValues(nodeValue).forEach((parentValue) => {
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

  const density = useMemo(() => {
    switch (settings.spacingSize) {
      case "compact":
        return { pad: "p-2", childPad: "ps-4" };
      case "spacious":
        return { pad: "p-4", childPad: "ps-8" };
      case "comfortable":
        return { pad: "p-3", childPad: "ps-6" };
      default:
        return { pad: "p-3", childPad: "ps-6" };
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

  const searchInputRef = search?.inputRef;
  const searchValue = search?.value;
  const searchOnChange = search?.onChange;
  const searchPlaceholder = search?.placeholder;

  const Toolbar = (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="relative w-full sm:max-w-sm">
        {search && searchOnChange && (
          <Input
            ref={searchInputRef as any}
            value={searchValue}
            onChange={(e) => searchOnChange(e.target.value)}
            placeholder={searchPlaceholder ?? "Search"}
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
          <div className="h-9 w-56 animate-pulse rounded-md bg-muted/50 motion-reduce:animate-none" />
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-10 animate-pulse rounded-md bg-muted/30 motion-reduce:animate-none"
            />
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
          onSelect={handleSelectionChange}
          isNodeIndeterminate={isNodeIndeterminate}
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

// Node styling for the two surviving tree structures
function getNodeStyling(
  variant: TreeVariant,
  level: number,
  density: { pad: string; childPad: string },
  radius: string,
  shadow: string,
  cardStyle: string
) {
  if (variant === "cards") {
    return cn(
      "bg-card border transition-colors hover:bg-muted/50",
      density.pad,
      radius,
      shadow,
      cardStyle === "glass" ? "bg-card/60 backdrop-blur" : "",
      cardStyle === "bordered" ? "border-2" : "",
      cardStyle === "elevated" ? "shadow-xl" : ""
    );
  }

  // lines
  return cn(
    "bg-card border transition-colors hover:bg-muted/40",
    density.pad,
    radius,
    level === 0 ? "font-semibold" : "font-normal"
  );
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
  onSelect,
  isNodeIndeterminate,
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
  onSelect?: (nodeValue: string, checked: boolean) => void;
  isNodeIndeterminate?: (node: T) => boolean;
  getValueToSend?: (node: T) => string;
  disabled?: boolean;
  expandOnCardClick?: boolean;
}) {
  // Cheap ARIA-tree keyboard support: Up/Down move between the visible rows
  // (collapsed children are unmounted, so the DOM order IS the visible order),
  // the inline-end arrow expands, the inline-start arrow collapses, and
  // Enter/Space toggles selection (or expansion when not selectable).
  const handleRowKeyDown = (
    e: React.KeyboardEvent<HTMLDivElement>,
    node: T,
    id: string,
    hasChildren: boolean,
    isOpen: boolean
  ) => {
    if (disabled) return;
    const expandKey = direction === "rtl" ? "ArrowLeft" : "ArrowRight";
    const collapseKey = direction === "rtl" ? "ArrowRight" : "ArrowLeft";
    const row = e.currentTarget;

    const moveFocus = (offset: number) => {
      const tree = row.closest('[role="tree"]');
      if (!tree) return;
      const rows = Array.from(tree.querySelectorAll<HTMLElement>('[role="treeitem"]'));
      rows[rows.indexOf(row) + offset]?.focus();
    };

    if (e.key === "ArrowDown") {
      e.preventDefault();
      moveFocus(1);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      moveFocus(-1);
    } else if (e.key === expandKey) {
      e.preventDefault();
      if (hasChildren && !isOpen) onToggle(id);
      else if (hasChildren && isOpen) moveFocus(1);
    } else if (e.key === collapseKey) {
      e.preventDefault();
      if (hasChildren && isOpen) onToggle(id);
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (selectable && getValueToSend && onSelect) {
        const nodeValue = getValueToSend(node);
        onSelect(nodeValue, !selectedValues.includes(nodeValue));
      } else if (hasChildren) {
        onToggle(id);
      }
    }
  };

  return (
    <ul
      role={level === 0 ? "tree" : "group"}
      className={cn("m-0 list-none p-0", variant === "lines" && level > 0 ? "relative" : "")}
    >
      {nodes.map((node, index) => {
        const id = getId(node);
        const label = getLabel(node);
        const nodeValue = getValueToSend ? getValueToSend(node) : "";
        const children = getChildren(node) ?? [];
        const hasChildren = children.length > 0;
        const isOpen = expanded[id];
        const selected =
          selectable && getValueToSend ? selectedValues.includes(nodeValue) : false;
        const indeterminate =
          selectable && getValueToSend ? (isNodeIndeterminate?.(node) ?? false) : false;

        const nodeBase = getNodeStyling(variant, level, density, radius, shadow, cardStyle);

        return (
          <li key={id} role="none" className={cn("group relative", variant === "cards" && "mb-2")}>
            {/* Node row — the focusable treeitem */}
            <div
              role="treeitem"
              aria-level={level + 1}
              aria-expanded={hasChildren ? isOpen : undefined}
              aria-selected={selectable ? selected : undefined}
              // Static roving tabindex: Tab lands on the first root row; the
              // arrow keys move focus from there.
              tabIndex={level === 0 && index === 0 ? 0 : -1}
              onKeyDown={(e) => handleRowKeyDown(e, node, id, hasChildren, isOpen)}
              className={cn(
                "flex items-center gap-2",
                "rounded-md",
                nodeBase,
                "focus-visible:outline-none focus-visible:shadow-nx-focus",
                expandOnCardClick && hasChildren && !disabled ? "cursor-pointer" : ""
              )}
              onClick={() => {
                // Handle card click expansion if enabled and node has children
                if (expandOnCardClick && hasChildren && !disabled) {
                  onToggle(id);
                }
              }}
            >
              {/* Toggle — out of the tab order; the treeitem row carries the
                  keyboard interaction and the aria-expanded state */}
              <button
                type="button"
                tabIndex={-1}
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
                    <ChevronRight className="h-4 w-4 text-muted-foreground rtl:rotate-180" />
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
                      ? "cursor-not-allowed opacity-60"
                      : "cursor-pointer transition-colors hover:bg-muted/50"
                  )}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!disabled) {
                      onSelect?.(nodeValue, !selected);
                    }
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
                      !disabled && onSelect?.(nodeValue, checked === true)
                    }
                    className={cn(
                      "data-[state=checked]:border-primary data-[state=checked]:bg-primary",
                      "pointer-events-none"
                    )}
                    tabIndex={-1}
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
                    onSelect?.(nodeValue, !selected);
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
                  <span className="ms-2 inline-flex items-center text-xs text-muted-foreground">
                    <GitBranch className="me-1 h-3 w-3" />
                    {children.length}
                  </span>
                )}
              </div>

              {/* Actions */}
              {actions && <NodeActions node={node} actions={actions} direction={direction} />}
            </div>

            {/* Children — ONE recursive call site for both variants. The old
                per-variant copies drifted (the gradient copy dropped the
                disabled/expandOnCardClick props); a single call site cannot. */}
            {hasChildren && isOpen && (
              <div
                className={
                  variant === "lines"
                    ? "ms-6 mt-1 border-s border-solid border-muted-foreground/20"
                    : "mt-2 space-y-2 ps-8"
                }
              >
                <div className={variant === "lines" ? density.childPad : undefined}>
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
                    onSelect={onSelect}
                    isNodeIndeterminate={isNodeIndeterminate}
                    getValueToSend={getValueToSend}
                    disabled={disabled}
                    expandOnCardClick={expandOnCardClick}
                  />
                </div>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
