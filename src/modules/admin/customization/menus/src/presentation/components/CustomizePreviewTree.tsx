// FILE-EXCEPTION: file length
// UI-EXCEPTION: compact studio layout
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
import { cn, resolveBilingualLabel } from "@core/common/utils";

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
  const displayName = resolveBilingualLabel(node.nameEn, node.nameAr, language);

  // Show change info if the name differs from original
  const nameChanged =
    resolveBilingualLabel(node.nameEn, node.nameAr, language) !==
    resolveBilingualLabel(node.originalNameEn, node.originalNameAr, language);
  const orderChanged = node.order !== node.originalOrder;
  const nodeId = node.id;

  /* ── DnD Handlers ────────────────────────────────────────────────── */

  const handleDragStartEvent = useCallback(
    (e: React.DragEvent) => {
      e.stopPropagation();
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", nodeId);
      // We pass a "stub" MenuTreeNode with the effective data for the DnD handler
      onDragStart({
        id: nodeId,
        slug: node.slug,
        nameEn: node.nameEn,
        nameAr: node.nameAr,
        order: node.order,
        isActive: node.isActive,
        children: [],
      } as MenuTreeNode);
    },
    [node, onDragStart, nodeId]
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

      onDragOver(nodeId, position);
    },
    [nodeId, isDragging, onDragOver]
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
      onDrop(nodeId, dropPosition);
    },
    [nodeId, dropPosition, onDrop]
  );

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onSelectItem(nodeId);
    },
    [nodeId, onSelectItem]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onSelectItem(nodeId);
      }
    },
    [nodeId, onSelectItem]
  );

  const handleExpandClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onToggleExpand(nodeId);
    },
    [nodeId, onToggleExpand]
  );

  return (
    <div>
      {/* Drop indicator: before */}
      {isDropTarget && dropPosition === "before" && (
        <div
          aria-hidden="true"
          className="mx-2 h-0.5 rounded-full bg-nx-accent transition-colors duration-nx-micro ease-nx-enter motion-reduce:transition-none"
          style={{ marginInlineStart: depth * 18 + 8 }}
        />
      )}

      {/* Node Row */}
      <div
        ref={rowRef}
        draggable
        role="button"
        tabIndex={0}
        aria-pressed={isSelected}
        onDragStart={handleDragStartEvent}
        onDragOver={handleDragOverEvent}
        onDragLeave={handleDragLeaveEvent}
        onDragEnd={onDragEnd}
        onDrop={handleDropEvent}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        className={cn(
          "group relative flex cursor-pointer items-center gap-1.5 rounded-nx-md px-2 py-1.5",
          "transition-[color,background-color,box-shadow] duration-nx-micro ease-nx-enter motion-reduce:transition-none",
          "focus-visible:shadow-nx-focus focus-visible:outline-none",
          // Dragging
          isDragging &&
            "ring-dashed opacity-40 ring-1 ring-[color:color-mix(in_srgb,var(--nx-accent)_30%,transparent)]",
          // Selected
          isSelected
            ? "bg-nx-accent-wash ring-1 ring-[color:color-mix(in_srgb,var(--nx-accent)_20%,transparent)]"
            : "hover:bg-nx-hover",
          // Drop target: "inside" — dashed ring
          isDropTarget &&
            dropPosition === "inside" &&
            "ring-dashed bg-nx-accent-wash ring-2 ring-nx-accent"
        )}
        style={{ marginInlineStart: depth * 18 }}
      >
        {/* Drag Handle */}
        <GripVertical
          aria-hidden="true"
          className="h-3 w-3 shrink-0 cursor-grab text-nx-ink-3 opacity-40 group-hover:opacity-100"
        />

        {/* Expand/Collapse */}
        {hasChildren ? (
          <button
            type="button"
            onClick={handleExpandClick}
            aria-label={isExpanded ? t("common.collapseAll") : t("common.expandAll")}
            className="shrink-0 rounded-nx-sm p-0.5 transition-colors duration-nx-micro ease-nx-enter hover:bg-nx-hover focus-visible:shadow-nx-focus focus-visible:outline-none motion-reduce:transition-none"
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

        {/* Name (effective — after overrides) */}
        <span className={cn("flex-1 truncate text-sm text-nx-ink", isSelected && "font-medium")}>
          {displayName}
        </span>

        {/* Modified badge */}
        {node.hasOverride && (
          <Badge
            variant="outline"
            className="shrink-0 border-0 bg-success/15 px-1 py-0 text-[8px] font-medium text-success"
          >
            <Sparkles className="me-0.5 h-2 w-2" aria-hidden="true" />
            {nameChanged || orderChanged ? t("menus.modified") : t("menus.customized")}
          </Badge>
        )}
      </div>

      {/* Drop indicator: after */}
      {isDropTarget && dropPosition === "after" && (
        <div
          aria-hidden="true"
          className="mx-2 h-0.5 rounded-full bg-nx-accent transition-colors duration-nx-micro ease-nx-enter motion-reduce:transition-none"
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
