/* eslint-disable @typescript-eslint/no-explicit-any */
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
import { ChevronRight, ChevronDown, Folder, FolderOpen, MoreHorizontal, Check, Minus } from "lucide-react";
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
  actionsLabel,
}: {
  node: T;
  actions: (node: T) => TreeAction[];
  direction: string;
  actionsLabel: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        {/* 32px minimum: the trigger was 28px, below the hit-target floor. */}
        <Button
          variant="ghost"
          size="icon"
          aria-label={actionsLabel}
          onClick={(e) => e.stopPropagation()}
          className="h-8 w-8 shrink-0 text-nx-ink-3 hover:text-nx-ink"
        >
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
  const tr = (key: string, defaultValue: string) => {
    const resolved = t(key, { defaultValue });
    return resolved === key ? defaultValue : resolved;
  };

  const computedVariant: TreeVariant = resolveTreeVariant(variant ?? settings.treeStyle);

  const [expandedOverrides, setExpandedOverrides] = useState<Record<string, boolean>>({});

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
  const isAllExpanded =
    allIds.length > 0 &&
    allIds.every((id) => (id in expandedOverrides ? expandedOverrides[id] : defaultExpanded));

  const handleToggleNode = (id: string) => {
    const current = id in expandedOverrides ? expandedOverrides[id] : defaultExpanded;
    const next = { ...expandedOverrides, [id]: !current };
    setExpandedOverrides(next);
    onExpandChange?.(allIds.filter((k) => (k in next ? next[k] : defaultExpanded)));
  };

  const expandAll = () => {
    const all: Record<string, boolean> = {};
    allIds.forEach((id) => {
      all[id] = true;
    });
    setExpandedOverrides(all);
    onExpandChange?.(allIds);
  };

  const collapseAll = () => {
    const all: Record<string, boolean> = {};
    allIds.forEach((id) => {
      all[id] = false;
    });
    setExpandedOverrides(all);
    onExpandChange?.([]);
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
            placeholder={searchPlaceholder ?? tr("common.search", "Search...")}
            aria-label={searchPlaceholder ?? tr("common.search", "Search...")}
            className="w-full"
            autoComplete="off"
          />
        )}
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={isAllExpanded ? collapseAll : expandAll}>
          {isAllExpanded
            ? tr("common.collapseAll", "Collapse All")
            : tr("common.expandAll", "Expand All")}
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
        <div
          className="space-y-2"
          role="status"
          aria-busy="true"
          aria-label={tr("common.loading", "Loading...")}
        >
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
        <EmptyState icon={FolderOpen} title={emptyMessage ?? tr("common.noData", "No data available")} />
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
          expandedOverrides={expandedOverrides}
          defaultExpanded={defaultExpanded}
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
          labels={{
            actions: tr("common.actions", "Actions"),
          }}
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
  expandedOverrides,
  defaultExpanded,
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
  expandOnCardClick = false, // Default to false for backward compatibility
  labels,
}: {
  nodes: T[];
  variant: TreeVariant;
  getId: (node: T) => string;
  getLabel: (node: T) => React.ReactNode;
  getChildren: (node: T) => T[] | undefined;
  expandedOverrides: Record<string, boolean>;
  defaultExpanded: boolean;
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
  labels: { actions: string };
}) {
  // Cheap ARIA-tree keyboard support: Up/Down move between the visible rows
  // (collapsed children are unmounted, so the DOM order IS the visible order),
  // the inline-end arrow expands, the inline-start arrow collapses (or moves
  // focus back to its parent treeitem), and Enter/Space toggles selection or expansion.
  const handleRowKeyDown = (
    e: React.KeyboardEvent<HTMLDivElement>,
    node: T,
    id: string,
    hasChildren: boolean,
    isOpen: boolean
  ) => {
    if (disabled || e.target !== e.currentTarget) return;
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
      if (hasChildren && isOpen) {
        onToggle(id);
      } else {
        const parentGroup = row.closest('[role="group"]');
        const parentItem = parentGroup
          ?.closest("li")
          ?.querySelector(':scope > [data-tree-row-wrapper] > [role="treeitem"]') as HTMLElement | null;
        parentItem?.focus();
      }
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
        const isOpen = id in expandedOverrides ? expandedOverrides[id] : defaultExpanded;
        const selected = selectable && getValueToSend ? selectedValues.includes(nodeValue) : false;
        const indeterminate =
          selectable && getValueToSend ? (isNodeIndeterminate?.(node) ?? false) : false;

        const nodeBase = getNodeStyling(variant, level, density, radius, selected);

        return (
          <li key={id} role="none" className={cn("group relative", variant === "cards" && "mb-2")}>
            {/* Visual row wrapper separating the interactive treeitem from sibling row actions */}
            <div
              data-tree-row-wrapper=""
              className={cn("flex items-center gap-2", nodeBase, disabled && "cursor-not-allowed")}
            >
              {/* Node row — single focusable treeitem with zero nested interactive controls */}
              <div
                role="treeitem"
                aria-level={level + 1}
                aria-expanded={hasChildren ? isOpen : undefined}
                aria-selected={selectable ? selected : undefined}
                aria-disabled={disabled || undefined}
                // Static roving tabindex: Tab lands on the first root row; the
                // arrow keys move focus from there.
                tabIndex={level === 0 && index === 0 ? 0 : -1}
                onKeyDown={(e) => handleRowKeyDown(e, node, id, hasChildren, isOpen)}
                onClick={(e) => {
                  if (disabled) return;
                  const target = e.target as HTMLElement | null;
                  if (target?.closest("[data-tree-toggle]") && hasChildren) {
                    onToggle(id);
                    return;
                  }
                  if (selectable && getValueToSend) {
                    onSelect?.(nodeValue, !selected);
                    return;
                  }
                  if (expandOnCardClick && hasChildren) {
                    onToggle(id);
                  }
                }}
                className={cn(
                  "flex min-w-0 flex-1 items-center gap-2 rounded-nx-sm focus-visible:shadow-nx-focus focus-visible:outline-none",
                  (selectable || (expandOnCardClick && hasChildren)) && !disabled && "cursor-pointer"
                )}
              >
                {/* Visual toggle column — 32px whether or not the node has children.
                    Presentational inside role="treeitem" (aria-expanded + arrows drive state). */}
                {hasChildren ? (
                  <span
                    data-tree-toggle=""
                    aria-hidden="true"
                    className={cn(
                      "grid h-8 w-8 shrink-0 place-items-center rounded-nx-sm text-nx-ink-2",
                      NODE_MOTION,
                      disabled
                        ? "cursor-not-allowed text-nx-ink-3"
                        : "cursor-pointer hover:bg-nx-hover hover:text-nx-ink"
                    )}
                  >
                    {isOpen ? (
                      <ChevronDown aria-hidden="true" className="h-4 w-4" />
                    ) : (
                      <ChevronRight aria-hidden="true" className="h-4 w-4 rtl:rotate-180" />
                    )}
                  </span>
                ) : (
                  <span aria-hidden="true" className="grid h-8 w-8 shrink-0 place-items-center">
                    <span className="h-1 w-1 rounded-full bg-nx-ink-3" />
                  </span>
                )}

                {/* Visual selection indicator — treeitem owns aria-selected & keyboard toggle */}
                {selectable && getValueToSend && (
                  <span
                    aria-hidden="true"
                    className={cn(
                      "grid h-8 w-8 shrink-0 place-items-center rounded-nx-sm",
                      NODE_MOTION,
                      disabled ? "cursor-not-allowed" : "cursor-pointer hover:bg-nx-hover"
                    )}
                  >
                    <span
                      className={cn(
                        "inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-nx-sm border transition-[border-color,background-color] duration-nx-micro ease-nx-enter motion-reduce:transition-none",
                        disabled
                          ? "border-nx-line bg-nx-raised text-nx-ink-3"
                          : selected || indeterminate
                            ? "border-nx-accent bg-nx-accent-fill text-nx-on-fill"
                            : "border-nx-line-hi bg-nx-ground"
                      )}
                    >
                      {indeterminate ? (
                        <Minus className="h-3 w-3" strokeWidth={3} aria-hidden="true" />
                      ) : selected ? (
                        <Check className="h-3 w-3" strokeWidth={3} aria-hidden="true" />
                      ) : null}
                    </span>
                  </span>
                )}

                {/* Icon + Label */}
                <div className="flex min-w-0 flex-1 items-center gap-2">
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
              </div>

              {/* Actions — sibling control outside role="treeitem" */}
              {actions && (
                <NodeActions
                  node={node}
                  actions={actions}
                  direction={direction}
                  actionsLabel={labels.actions}
                />
              )}
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
                    expandedOverrides={expandedOverrides}
                    defaultExpanded={defaultExpanded}
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
                    labels={labels}
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
