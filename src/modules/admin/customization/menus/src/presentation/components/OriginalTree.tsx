// UI-EXCEPTION: compact studio layout
/**
 * Original Tree (Read-Only)
 *
 * Shows the BASE menu structure with "customized" badges
 * on items that have overrides. Click to select for editing.
 * No DnD — this is the reference view.
 */
"use client";

import { useCallback } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { Badge } from "@core/ui/badge";
import type { MenuTreeNode } from "../../domain/entities/MenuItem";
import { MenuOverrideScope } from "../../domain/entities/MenuItemRequests";
import { ChevronRight, ChevronDown, FolderOpen, FileText, EyeOff, Pencil } from "lucide-react";
import { cn } from "@core/common/utils";

/* -------------------------------------------------------------------------- */
/*  Props                                                                      */
/* -------------------------------------------------------------------------- */

interface OriginalTreeProps {
  menuTree: MenuTreeNode[];
  language: string;
  scope: MenuOverrideScope;
  selectedItemId: string | null;
  expandedNodes: Set<string>;
  onToggleExpand: (nodeId: string) => void;
  onSelectItem: (nodeId: string) => void;
}

/* -------------------------------------------------------------------------- */
/*  Component                                                                  */
/* -------------------------------------------------------------------------- */

export function OriginalTree({
  menuTree,
  language,
  scope,
  selectedItemId,
  expandedNodes,
  onToggleExpand,
  onSelectItem,
}: OriginalTreeProps) {
  return (
    <div className="space-y-0.5">
      {menuTree
        .sort((a, b) => a.order - b.order)
        .map((node) => (
          <OriginalTreeNode
            key={node.id}
            node={node}
            depth={0}
            language={language}
            scope={scope}
            selectedItemId={selectedItemId}
            expandedNodes={expandedNodes}
            onToggleExpand={onToggleExpand}
            onSelectItem={onSelectItem}
          />
        ))}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Tree Node (recursive) — read-only, no DnD                                 */
/* -------------------------------------------------------------------------- */

interface OriginalTreeNodeProps {
  node: MenuTreeNode;
  depth: number;
  language: string;
  scope: MenuOverrideScope;
  selectedItemId: string | null;
  expandedNodes: Set<string>;
  onToggleExpand: (nodeId: string) => void;
  onSelectItem: (nodeId: string) => void;
}

function OriginalTreeNode({
  node,
  depth,
  language,
  scope,
  selectedItemId,
  expandedNodes,
  onToggleExpand,
  onSelectItem,
}: OriginalTreeNodeProps) {
  const { t } = useI18n();
  const hasChildren = node.children.length > 0;
  const isExpanded = expandedNodes.has(node.id);
  const isSelected = selectedItemId === node.id;

  // Get override for current scope
  const override = scope === MenuOverrideScope.User ? node.userOverride : node.tenantOverride;
  const hasOverride = !!override;
  const isHidden = override?.isHidden ?? false;

  // BASE name — always show original (not overridden)
  const displayName = language === "ar" ? node.nameAr : node.nameEn;

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onSelectItem(node.id);
    },
    [node.id, onSelectItem]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onSelectItem(node.id);
      }
    },
    [node.id, onSelectItem]
  );

  const handleExpandClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onToggleExpand(node.id);
    },
    [node.id, onToggleExpand]
  );

  return (
    <div>
      {/* Node Row */}
      <div
        role="button"
        tabIndex={0}
        aria-pressed={isSelected}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        className={cn(
          "group relative flex cursor-pointer items-center gap-2 rounded-nx-md px-2.5 py-1.5",
          "transition-[color,background-color,box-shadow] duration-nx-micro ease-nx-enter motion-reduce:transition-none",
          "focus-visible:outline-none focus-visible:shadow-nx-focus",
          "border-s-2",
          // Selected
          isSelected
            ? "border-s-nx-accent bg-nx-accent-wash ring-1 ring-[color:color-mix(in_srgb,var(--nx-accent)_20%,transparent)]"
            : "border-s-transparent hover:bg-nx-hover",
          // Override indicator (amber for modified, red for hidden)
          hasOverride && !isSelected && (isHidden ? "border-s-destructive" : "border-s-warning")
        )}
        style={{ marginInlineStart: depth * 18 }}
      >
        {/* Expand/Collapse */}
        {hasChildren ? (
          <button
            type="button"
            onClick={handleExpandClick}
            aria-label={isExpanded ? t("common.collapseAll") : t("common.expandAll")}
            className="shrink-0 rounded-nx-sm p-0.5 transition-colors duration-nx-micro ease-nx-enter motion-reduce:transition-none hover:bg-nx-hover focus-visible:outline-none focus-visible:shadow-nx-focus"
          >
            {isExpanded ? (
              <ChevronDown className="h-3 w-3 text-nx-ink-3" aria-hidden="true" />
            ) : (
              <ChevronRight className="h-3 w-3 text-nx-ink-3" aria-hidden="true" />
            )}
          </button>
        ) : (
          <div className="w-4 shrink-0" />
        )}

        {/* Icon */}
        {hasChildren ? (
          <FolderOpen className="h-3.5 w-3.5 shrink-0 text-nx-accent" aria-hidden="true" />
        ) : (
          <FileText className="h-3.5 w-3.5 shrink-0 text-nx-ink-3" aria-hidden="true" />
        )}

        {/* Name (always base) */}
        <span className={cn("flex-1 truncate text-sm text-nx-ink", isSelected && "font-medium")}>
          {displayName}
        </span>

        {/* Override badge */}
        {hasOverride && (
          <Badge
            variant="outline"
            className={cn(
              "shrink-0 border-0 px-1 py-0 text-[8px] font-medium",
              isHidden ? "bg-destructive/15 text-destructive" : "bg-warning/15 text-warning"
            )}
          >
            {isHidden ? (
              <>
                <EyeOff className="me-0.5 h-2 w-2" aria-hidden="true" /> {t("menus.badgeHidden")}
              </>
            ) : (
              <>
                <Pencil className="me-0.5 h-2 w-2" aria-hidden="true" /> {t("menus.customized")}
              </>
            )}
          </Badge>
        )}
      </div>

      {/* Children */}
      {isExpanded && hasChildren && (
        <div className="mt-0.5">
          {node.children
            .sort((a, b) => a.order - b.order)
            .map((child) => (
              <OriginalTreeNode
                key={child.id}
                node={child}
                depth={depth + 1}
                language={language}
                scope={scope}
                selectedItemId={selectedItemId}
                expandedNodes={expandedNodes}
                onToggleExpand={onToggleExpand}
                onSelectItem={onSelectItem}
              />
            ))}
        </div>
      )}
    </div>
  );
}
