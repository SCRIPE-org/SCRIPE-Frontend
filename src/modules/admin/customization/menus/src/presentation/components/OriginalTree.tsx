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
        onClick={handleClick}
        className={cn(
          "group relative flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-1.5",
          "transition-all duration-150",
          "border-l-2",
          // Selected
          isSelected
            ? "border-l-primary bg-primary/10 ring-1 ring-primary/20"
            : "border-l-transparent hover:bg-muted/50",
          // Override indicator (amber for modified, red for hidden)
          hasOverride && !isSelected && (isHidden ? "border-l-destructive" : "border-l-warning")
        )}
        style={{ marginInlineStart: depth * 18 }}
      >
        {/* Expand/Collapse */}
        {hasChildren ? (
          <button onClick={handleExpandClick} className="shrink-0 rounded-sm p-0.5 hover:bg-muted">
            {isExpanded ? (
              <ChevronDown className="h-3 w-3 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-3 w-3 text-muted-foreground" />
            )}
          </button>
        ) : (
          <div className="w-4 shrink-0" />
        )}

        {/* Icon */}
        {hasChildren ? (
          <FolderOpen className="h-3.5 w-3.5 shrink-0 text-primary/70" />
        ) : (
          <FileText className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        )}

        {/* Name (always base) */}
        <span className={cn("flex-1 truncate text-sm", isSelected && "font-medium")}>
          {displayName}
        </span>

        {/* Override badge */}
        {hasOverride && (
          <Badge
            variant="outline"
            className={cn(
              "shrink-0 border-0 px-1 py-0 text-[8px] font-medium",
              isHidden
                ? "bg-destructive/15 text-destructive"
                : "bg-warning/15 text-warning"
            )}
          >
            {isHidden ? (
              <>
                <EyeOff className="mr-0.5 h-2 w-2" /> {t("menus.badgeHidden") ?? "Hidden"}
              </>
            ) : (
              <>
                <Pencil className="mr-0.5 h-2 w-2" /> {t("menus.customized") ?? "Customized"}
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
