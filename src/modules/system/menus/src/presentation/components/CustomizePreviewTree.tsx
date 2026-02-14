/**
 * Customize Preview Tree (Effective View)
 *
 * Shows the EFFECTIVE menu tree with all overrides applied.
 * This is what the menu will actually look like.
 * Drag-and-drop to reorder/regroup as customization overrides.
 * Items with overrides show a subtle "modified" indicator.
 */
"use client";

import { useCallback, useRef } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { Badge } from "@core/ui/badge";
import type { MenuTreeNode } from "../../domain/entities/MenuItem";
import type { EffectiveTreeNode } from "../../domain/utils/computeEffectiveTree";
import { MenuOverrideScope } from "../../domain/entities/MenuItemRequests";
import type {
  CustomizeDropPosition,
  CustomizeDropTarget,
} from "../viewmodels/useMenuCustomizeViewModel";
import {
  ChevronRight,
  ChevronDown,
  FolderOpen,
  FileText,
  GripVertical,
  Sparkles,
} from "lucide-react";
import { cn } from "@core/common/utils";

/* -------------------------------------------------------------------------- */
/*  Props                                                                      */
/* -------------------------------------------------------------------------- */

interface CustomizePreviewTreeProps {
  effectiveTree: EffectiveTreeNode[];
  language: string;
  selectedItemId: string | null;
  expandedNodes: Set<string>;
  onToggleExpand: (nodeId: string) => void;
  onSelectItem: (nodeId: string) => void;

  // DnD props
  draggedNode: MenuTreeNode | null;
  dropTarget: CustomizeDropTarget | null;
  onDragStart: (node: MenuTreeNode) => void;
  onDragOver: (nodeId: string, position: CustomizeDropPosition) => void;
  onDragLeave: () => void;
  onDragEnd: () => void;
  onDrop: (targetNodeId: string, position: CustomizeDropPosition) => void;
}

/* -------------------------------------------------------------------------- */
/*  Component                                                                  */
/* -------------------------------------------------------------------------- */

export function CustomizePreviewTree({
  effectiveTree,
  language,
  selectedItemId,
  expandedNodes,
  onToggleExpand,
  onSelectItem,
  draggedNode,
  dropTarget,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDragEnd,
  onDrop,
}: CustomizePreviewTreeProps) {
  return (
    <div className="space-y-0.5">
      {effectiveTree.map((node) => (
        <PreviewTreeNode
          key={node.id}
          node={node}
          depth={0}
          language={language}
          selectedItemId={selectedItemId}
          expandedNodes={expandedNodes}
          onToggleExpand={onToggleExpand}
          onSelectItem={onSelectItem}
          draggedNode={draggedNode}
          dropTarget={dropTarget}
          onDragStart={onDragStart}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDragEnd={onDragEnd}
          onDrop={onDrop}
        />
      ))}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Tree Node (recursive) — with native HTML5 DnD on EffectiveTreeNode         */
/* -------------------------------------------------------------------------- */

interface PreviewTreeNodeProps {
  node: EffectiveTreeNode;
  depth: number;
  language: string;
  selectedItemId: string | null;
  expandedNodes: Set<string>;
  onToggleExpand: (nodeId: string) => void;
  onSelectItem: (nodeId: string) => void;
  // DnD
  draggedNode: MenuTreeNode | null;
  dropTarget: CustomizeDropTarget | null;
  onDragStart: (node: MenuTreeNode) => void;
  onDragOver: (nodeId: string, position: CustomizeDropPosition) => void;
  onDragLeave: () => void;
  onDragEnd: () => void;
  onDrop: (targetNodeId: string, position: CustomizeDropPosition) => void;
}

function PreviewTreeNode({
  node,
  depth,
  language,
  selectedItemId,
  expandedNodes,
  onToggleExpand,
  onSelectItem,
  draggedNode,
  dropTarget,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDragEnd,
  onDrop,
}: PreviewTreeNodeProps) {
  const { t } = useI18n();
  const rowRef = useRef<HTMLDivElement>(null);
  const hasChildren = node.children.length > 0;
  const isExpanded = expandedNodes.has(node.id);
  const isSelected = selectedItemId === node.id;
  const isDragging = draggedNode?.id === node.id;
  const isDropTarget = dropTarget?.nodeId === node.id;
  const dropPosition = isDropTarget ? dropTarget?.position : null;

  // Effective display name — already overridden by computeEffectiveTree
  const displayName = language === "ar" ? node.nameAr : node.nameEn;

  // Show change info if the name differs from original
  const nameChanged =
    language === "ar" ? node.nameAr !== node.originalNameAr : node.nameEn !== node.originalNameEn;
  const orderChanged = node.order !== node.originalOrder;

  /* ── DnD Handlers ────────────────────────────────────────────────── */

  const handleDragStartEvent = useCallback(
    (e: React.DragEvent) => {
      e.stopPropagation();
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", node.id);
      // We pass a "stub" MenuTreeNode with the effective data for the DnD handler
      onDragStart({
        id: node.id,
        slug: node.slug,
        nameEn: node.nameEn,
        nameAr: node.nameAr,
        order: node.order,
        isActive: node.isActive,
        children: [],
      } as MenuTreeNode);
    },
    [node, onDragStart]
  );

  const handleDragOverEvent = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!rowRef.current || isDragging) return;

      const rect = rowRef.current.getBoundingClientRect();
      const y = e.clientY - rect.top;
      const height = rect.height;

      // 3-zone detection: top 25% = before, bottom 25% = after, middle 50% = inside
      let position: CustomizeDropPosition;
      if (y < height * 0.25) {
        position = "before";
      } else if (y > height * 0.75) {
        position = "after";
      } else {
        position = "inside";
      }

      onDragOver(node.id, position);
    },
    [node.id, isDragging, onDragOver]
  );

  const handleDragLeaveEvent = useCallback(
    (e: React.DragEvent) => {
      e.stopPropagation();
      if (rowRef.current && !rowRef.current.contains(e.relatedTarget as Node)) {
        onDragLeave();
      }
    },
    [onDragLeave]
  );

  const handleDropEvent = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!dropPosition) return;
      onDrop(node.id, dropPosition);
    },
    [node.id, dropPosition, onDrop]
  );

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
      {/* Drop indicator: before */}
      {isDropTarget && dropPosition === "before" && (
        <div
          className="mx-2 h-0.5 rounded-full bg-primary transition-all"
          style={{ marginInlineStart: depth * 18 + 8 }}
        />
      )}

      {/* Node Row */}
      <div
        ref={rowRef}
        draggable
        onDragStart={handleDragStartEvent}
        onDragOver={handleDragOverEvent}
        onDragLeave={handleDragLeaveEvent}
        onDragEnd={onDragEnd}
        onDrop={handleDropEvent}
        onClick={handleClick}
        className={cn(
          "group relative flex cursor-pointer items-center gap-1.5 rounded-lg px-2 py-1.5",
          "transition-all duration-150",
          // Dragging
          isDragging && "ring-dashed opacity-40 ring-1 ring-primary/30",
          // Selected
          isSelected ? "bg-primary/10 ring-1 ring-primary/20" : "hover:bg-muted/50",
          // Drop target: "inside" — dashed ring
          isDropTarget &&
            dropPosition === "inside" &&
            "ring-dashed bg-primary/5 ring-2 ring-primary"
        )}
        style={{ marginInlineStart: depth * 18 }}
      >
        {/* Drag Handle */}
        <GripVertical className="h-3 w-3 shrink-0 cursor-grab text-muted-foreground/40 group-hover:text-muted-foreground" />

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

        {/* Name (effective — after overrides) */}
        <span className={cn("flex-1 truncate text-sm", isSelected && "font-medium")}>
          {displayName}
        </span>

        {/* Modified badge */}
        {node.hasOverride && (
          <Badge
            variant="outline"
            className="shrink-0 border-0 bg-emerald-100 px-1 py-0 text-[8px] font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
          >
            <Sparkles className="mr-0.5 h-2 w-2" />
            {nameChanged || orderChanged
              ? (t("menus.modified") ?? "Modified")
              : (t("menus.customized") ?? "Customized")}
          </Badge>
        )}
      </div>

      {/* Drop indicator: after */}
      {isDropTarget && dropPosition === "after" && (
        <div
          className="mx-2 h-0.5 rounded-full bg-primary transition-all"
          style={{ marginInlineStart: depth * 18 + 8 }}
        />
      )}

      {/* Children */}
      {isExpanded && hasChildren && (
        <div className="mt-0.5">
          {node.children.map((child) => (
            <PreviewTreeNode
              key={child.id}
              node={child}
              depth={depth + 1}
              language={language}
              selectedItemId={selectedItemId}
              expandedNodes={expandedNodes}
              onToggleExpand={onToggleExpand}
              onSelectItem={onSelectItem}
              draggedNode={draggedNode}
              dropTarget={dropTarget}
              onDragStart={onDragStart}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDragEnd={onDragEnd}
              onDrop={onDrop}
            />
          ))}
        </div>
      )}
    </div>
  );
}
