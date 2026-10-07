"use client";

import React, { useState } from "react";
import { cn } from "@core/common/utils";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { EmptyState } from "@core/ui/empty-state";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@core/ui/dropdown-menu";
import { ChevronRight, ChevronDown, Folder, FolderOpen, MoreHorizontal } from "lucide-react";
import { Checkbox } from "@core/ui/checkbox";
import { useI18n } from "@core/providers/i18n-provider";
import { useSettings } from "@core/providers/settings-provider";

/**
 * TreeView — hierarchy, two ways.
 *
 * Wave C collapsed 12 skins to two honest structures. Wave K makes them
 * actually different from each other and honest about depth:
 *
 *  • "lines" was drawing a bordered CARD for every row AND a connector rail
 *    beside it, so the hierarchy was stated twice and neither statement was
 *    legible. A lines row is now a flat, borderless target — the rail alone
 *    carries the structure, which is the entire point of the variant.
 *  • both variants inherited `shadowIntensity`, so at "strong" every node in a
 *    600-row tree wore `shadow-2xl`. Nothing in a tree floats; the shadow is
 *    gone from the node styling and the setting keeps applying everywhere it
 *    describes something that does.
 *  • the leaf glyph was a Folder — a folder that contains nothing — sitting
 *    beside a `Circle` in the toggle column, so a leaf carried two icons and
 *    neither meant anything. Branches keep the folder; leaves get the toggle
 *    column's rail dot and nothing else.
 *  • the child count wore a `GitBranch` icon. This is a taxonomy tree, not a
 *    repository; it is a tabular-nums count chip now.
 *  • the loading state pulsed. Static fill steps instead.
 *  • surfaces/ink/hairlines moved off the pre-nexus muted/card/primary tokens
 *    and off `bg-card/60 backdrop-blur` (an unrequested glass surface leaking
 *    in from the cardStyle setting).
 */
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
        {/* 32px minimum: the trigger was 28px, below the hit-target floor. */}
        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 text-nx-ink-3">
          <MoreHorizontal aria-hidden="true" className="h-4 w-4" />
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

  const computedVariant: TreeVariant = resolveTreeVariant(variant ?? settings.treeStyle);

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

  const spacingSize = settings.spacingSize;
  const density =
    spacingSize === "compact"
      ? { pad: "px-2 py-1.5", childPad: "ps-4" }
      : spacingSize === "spacious"
        ? { pad: "px-4 py-3", childPad: "ps-8" }
        : spacingSize === "comfortable"
          ? { pad: "px-3 py-2.5", childPad: "ps-6" }
          : { pad: "px-3 py-2", childPad: "ps-6" };

  // The borderRadius setting, mapped onto the nx ladder — the same mapping
  // Button uses, so a tree row and a button never disagree about a corner.
  const borderRadiusSetting = settings.borderRadius;
  const radius =
    borderRadiusSetting === "none"
      ? "rounded-none"
      : borderRadiusSetting === "small"
        ? "rounded-nx-sm"
        : borderRadiusSetting === "large"
          ? "rounded-nx-lg"
          : borderRadiusSetting === "full"
            ? "rounded-full"
            : "rounded-nx-control";

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
            placeholder={searchPlaceholder ?? t("common.search")}
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
        {/* Static fill steps in the shape of the toolbar and six rows — a
            placeholder is the absence of a tree, and absence does not pulse. */}
        <div className="space-y-2" role="status" aria-busy="true" aria-label={t("common.loading")}>
          <div aria-hidden="true" className="h-9 w-56 rounded-nx-control bg-nx-raised-2" />
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              aria-hidden="true"
              // Each step indents a little further than the last, so the
              // placeholder reads as a hierarchy rather than a stack of bars.
              className="h-10 rounded-nx-control bg-nx-raised-2"
              style={{ marginInlineStart: `${(i % 3) * 16}px` }}
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
        {/* The shared empty anatomy, so an empty tree reads exactly like an
            empty table or an empty section — not like a stray grey sentence. */}
        <EmptyState icon={FolderOpen} title={emptyMessage ?? t("common.noData")} />
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

// Node styling for the two surviving tree structures.
const NODE_MOTION =
  "transition-[background-color,border-color] duration-nx-micro ease-nx-enter motion-reduce:transition-none";

function getNodeStyling(
  variant: TreeVariant,
  level: number,
  density: { pad: string; childPad: string },
  radius: string,
  selected: boolean
) {
  if (variant === "cards") {
    // Stacked panels: a hairline slab per node, brightening on hover. No
    // shadow — a node is anchored in its parent, it does not float above it.
    return cn(
      "border bg-nx-surface",
      NODE_MOTION,
      density.pad,
      radius,
      selected
        ? "border-nx-accent bg-nx-accent-wash"
        : "border-nx-line hover:border-nx-line-hi hover:bg-nx-hover"
    );
  }

  // lines — the connector rail states the hierarchy, so the row states nothing:
  // no border, no surface of its own, just a hover target.
  return cn(
    "border border-transparent bg-transparent",
    NODE_MOTION,
    density.pad,
    radius,
    level === 0 ? "font-semibold" : "font-normal",
    selected ? "border-nx-accent bg-nx-accent-wash" : "hover:bg-nx-hover"
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
        const selected = selectable && getValueToSend ? selectedValues.includes(nodeValue) : false;
        const indeterminate =
          selectable && getValueToSend ? (isNodeIndeterminate?.(node) ?? false) : false;

        const nodeBase = getNodeStyling(variant, level, density, radius, selected);

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
                nodeBase,
                "focus-visible:shadow-nx-focus focus-visible:outline-none",
                disabled && "cursor-not-allowed",
                expandOnCardClick && hasChildren && !disabled ? "cursor-pointer" : ""
              )}
              onClick={() => {
                // Handle card click expansion if enabled and node has children
                if (expandOnCardClick && hasChildren && !disabled) {
                  onToggle(id);
                }
              }}
            >
              {/* Toggle column — 32px whether or not the node has children, so
                  every label on a level shares one optical column. A leaf gets
                  the rail dot in place of the chevron; it used to get a
                  disabled BUTTON, which is a control that promises nothing. */}
              {hasChildren ? (
                <button
                  type="button"
                  // Out of the tab order: the treeitem row carries the keyboard
                  // interaction and the aria-expanded state.
                  tabIndex={-1}
                  className={cn(
                    "grid h-8 w-8 shrink-0 place-items-center rounded-nx-sm text-nx-ink-2",
                    NODE_MOTION,
                    disabled
                      ? "cursor-not-allowed text-nx-ink-3"
                      : "hover:bg-nx-hover hover:text-nx-ink"
                  )}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!disabled) {
                      onToggle(id);
                    }
                  }}
                  disabled={disabled}
                  aria-label={isOpen ? "Collapse" : "Expand"}
                >
                  {isOpen ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4 rtl:rotate-180" />
                  )}
                </button>
              ) : (
                <span aria-hidden="true" className="grid h-8 w-8 shrink-0 place-items-center">
                  <span className="h-1 w-1 rounded-full bg-nx-ink-3" />
                </span>
              )}

              {/* Checkbox for selectable mode */}
              {selectable && getValueToSend && (
                <div
                  className={cn(
                    "grid h-8 w-8 shrink-0 place-items-center rounded-nx-sm",
                    NODE_MOTION,
                    disabled ? "cursor-not-allowed" : "cursor-pointer hover:bg-nx-hover"
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
                    className="pointer-events-none"
                    tabIndex={-1}
                  />
                </div>
              )}

              {/* Icon + Label */}
              <div
                className={cn(
                  "flex min-w-0 flex-1 items-center gap-2",
                  selectable && !disabled ? "cursor-pointer" : ""
                )}
                onClick={(e) => {
                  if (selectable && getValueToSend && !disabled) {
                    e.stopPropagation();
                    onSelect?.(nodeValue, !selected);
                  }
                }}
              >
                {/* Only branches carry a folder. A leaf is not an empty
                    container, so it does not get drawn as one. */}
                {hasChildren &&
                  (isOpen ? (
                    <FolderOpen
                      aria-hidden="true"
                      className={cn(
                        "h-4 w-4 shrink-0",
                        selected ? "text-nx-accent" : "text-nx-ink-2"
                      )}
                    />
                  ) : (
                    <Folder
                      aria-hidden="true"
                      className={cn(
                        "h-4 w-4 shrink-0",
                        selected ? "text-nx-accent" : "text-nx-ink-2"
                      )}
                    />
                  ))}
                {/* One type size across levels: depth is stated by the rail and
                    the indent, weight by getNodeStyling. A per-level font size
                    made a deep tree shrink into illegibility. */}
                <span
                  className={cn(
                    "truncate text-sm",
                    selected ? "font-medium text-nx-accent" : "text-nx-ink",
                    disabled && "text-nx-ink-3"
                  )}
                >
                  {label}
                </span>
                {level === 0 && hasChildren && (
                  <span className="ms-1 shrink-0 rounded-nx-sm border border-nx-line px-1.5 py-0.5 text-[11px] font-medium tabular-nums leading-none text-nx-ink-3">
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
                    ? "ms-4 mt-0.5 border-s border-nx-line"
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
