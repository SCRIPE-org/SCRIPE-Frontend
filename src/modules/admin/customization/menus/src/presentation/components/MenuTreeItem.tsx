// FILE-EXCEPTION: file length
// UI-EXCEPTION: compact studio layout
/**
 * Menu Tree Item Component (Native HTML5 DnD) — Admin Only
 *
 * Renders a single menu node inside the tree editor.
 * Supports native drag-and-drop with 3-zone detection
 * (before / inside / after), expand/collapse, and admin CRUD actions.
 *
 * Override customization is handled on a separate page.
 */
"use client";

import { useCallback, useRef } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { Button } from "@core/ui/button";
import { Badge } from "@core/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@core/ui/dropdown-menu";
import type { MenuTreeNode } from "../../domain/entities/MenuItem";

import type { DropPosition, DropTarget } from "../viewmodels/useMenusViewModel";
import {
  Plus,
  MoreHorizontal,
  Pencil,
  Trash2,
  ChevronRight,
  ChevronDown,
  GripVertical,
  EyeOff,
  ArrowUp,
  ArrowDown,
  FolderOpen,
  FileText,
} from "lucide-react";
import { cn } from "@core/common/utils";

/* -------------------------------------------------------------------------- */
/*  Props                                                                      */
/* -------------------------------------------------------------------------- */

export interface MenuTreeItemProps {
  node: MenuTreeNode;
  depth?: number;
  language: string;
  canReorder?: boolean;

  // Expand / Collapse
  expandedNodes: Set<string>;
  onToggleExpand: (nodeId: string) => void;

  // DnD (native)
  draggedNode: MenuTreeNode | null;
  dropTarget: DropTarget | null;
  onDragStart: (node: MenuTreeNode) => void;
  onDragOver: (nodeId: string, position: DropPosition) => void;
  onDragLeave: () => void;
  onDragEnd: () => void;
  onDrop: (targetNodeId: string, position: DropPosition) => void;

  // Admin CRUD actions
  onEdit: (node: MenuTreeNode) => void;
  onDelete: (node: MenuTreeNode) => void;
  onAddChild: (node: MenuTreeNode) => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onMoveUpChild?: (childId: string) => void;
  onMoveDownChild?: (childId: string) => void;

  // Permission flags
  canCreate?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  hasAnyAction?: boolean;
}

/* -------------------------------------------------------------------------- */
/*  Level colors for hierarchy visualization                                   */
/* -------------------------------------------------------------------------- */

const LEVEL_COLORS = [
  "border-s-[hsl(var(--chart-1))]",
  "border-s-[hsl(var(--chart-2))]",
  "border-s-[hsl(var(--chart-3))]",
  "border-s-[hsl(var(--chart-4))]",
  "border-s-[hsl(var(--chart-5))]",
];

const LEVEL_BG_COLORS = [
  "bg-[hsl(var(--chart-1)/0.05)]",
  "bg-[hsl(var(--chart-2)/0.05)]",
  "bg-[hsl(var(--chart-3)/0.05)]",
  "bg-[hsl(var(--chart-4)/0.05)]",
  "bg-[hsl(var(--chart-5)/0.05)]",
];

/* -------------------------------------------------------------------------- */
/*  Component                                                                  */
/* -------------------------------------------------------------------------- */

export function MenuTreeItem({
  node,
  depth = 0,
  language,
  canReorder = false,
  expandedNodes,
  onToggleExpand,
  draggedNode,
  dropTarget,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDragEnd,
  onDrop,
  onEdit,
  onDelete,
  onAddChild,
  onMoveUp,
  onMoveDown,
  onMoveUpChild,
  onMoveDownChild,
  canCreate: canCreateProp = false,
  canEdit: canEditProp = false,
  canDelete: canDeleteProp = false,
  hasAnyAction: hasAnyActionProp = false,
}: MenuTreeItemProps) {
  const { t } = useI18n();
  const rowRef = useRef<HTMLDivElement>(null);
  const dragCounterRef = useRef(0);

  const hasChildren = node.children.length > 0;
  const isExpanded = expandedNodes.has(node.id);
  const displayName = language === "ar" ? node.nameAr : node.nameEn;
  const isDragging = draggedNode?.id === node.id;
  const isDropTarget = dropTarget?.nodeId === node.id;
  const levelColor = LEVEL_COLORS[depth % LEVEL_COLORS.length];
  const levelBg = LEVEL_BG_COLORS[depth % LEVEL_BG_COLORS.length];

  // ── 3-zone position calculation ────────────────────────────────────

  const computePosition = useCallback((e: React.DragEvent): DropPosition => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const y = e.clientY - rect.top;
    const height = rect.height;

    if (y < height * 0.25) return "before";
    if (y > height * 0.75) return "after";
    return "inside";
  }, []);

  // ── Native DnD handlers ────────────────────────────────────────────

  const handleDragStart = useCallback(
    (e: React.DragEvent) => {
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", node.id);
      setTimeout(() => onDragStart(node), 0);
    },
    [node, onDragStart]
  );

  const handleDragEnd = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      dragCounterRef.current = 0;
      onDragEnd();
    },
    [onDragEnd]
  );

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current++;
  }, []);

  const handleDragLeave = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dragCounterRef.current--;
      if (dragCounterRef.current <= 0) {
        dragCounterRef.current = 0;
        onDragLeave();
      }
    },
    [onDragLeave]
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      e.dataTransfer.dropEffect = "move";
      const position = computePosition(e);
      onDragOver(node.id, position);
    },
    [node.id, computePosition, onDragOver]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dragCounterRef.current = 0;
      const position = computePosition(e);
      onDrop(node.id, position);
    },
    [node.id, computePosition, onDrop]
  );

  // ── Drop indicator styles ──────────────────────────────────────────

  const getDropIndicatorStyles = (): string => {
    if (!isDropTarget || !dropTarget || isDragging) return "";

    switch (dropTarget.position) {
      case "before":
        return "before:absolute before:top-0 before:inset-x-0 before:h-[3px] before:bg-info before:rounded-full before:z-10";
      case "after":
        return "after:absolute after:bottom-0 after:inset-x-0 after:h-[3px] after:bg-info after:rounded-full after:z-10";
      case "inside":
        return "ring-2 ring-info ring-inset bg-info/10";
      default:
        return "";
    }
  };

  return (
    <div className={cn(isDragging && "opacity-30")}>
      {/* Node Row */}
      <div
        ref={rowRef}
        draggable={canReorder}
        onDragStart={canReorder ? handleDragStart : undefined}
        onDragEnd={canReorder ? handleDragEnd : undefined}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={cn(
          "group relative flex items-center gap-2 rounded-nx-md px-3 py-2.5",
          "transition-[color,background-color,border-color] duration-nx-micro ease-nx-enter hover:bg-nx-hover motion-reduce:transition-none",
          "border-s-2",
          node.isActive ? levelColor : "border-s-nx-line",
          !node.isActive && "opacity-60",
          depth > 0 && levelBg,
          getDropIndicatorStyles()
        )}
        style={{ marginInlineStart: depth * 24 }}
      >
        {/* Drag handle */}
        {canReorder && (
          <GripVertical
            aria-hidden="true"
            className={cn(
              "h-4 w-4 cursor-grab text-nx-ink-3 active:cursor-grabbing",
              "shrink-0 opacity-0 transition-opacity duration-nx-micro ease-nx-enter group-hover:opacity-100 motion-reduce:transition-none"
            )}
          />
        )}

        {/* Expand / Collapse */}
        {hasChildren ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleExpand(node.id);
            }}
            aria-label={isExpanded ? t("common.collapseAll") : t("common.expandAll")}
            className="shrink-0 rounded-nx-sm p-0.5 transition-colors duration-nx-micro ease-nx-enter hover:bg-nx-hover focus-visible:shadow-nx-focus focus-visible:outline-none motion-reduce:transition-none"
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 text-nx-ink-3" aria-hidden="true" />
            ) : (
              <ChevronRight className="h-4 w-4 text-nx-ink-3" aria-hidden="true" />
            )}
          </button>
        ) : (
          <div className="w-5 shrink-0" />
        )}

        {/* Icon */}
        {hasChildren ? (
          <FolderOpen className="h-4 w-4 shrink-0 text-nx-accent" aria-hidden="true" />
        ) : (
          <FileText className="h-4 w-4 shrink-0 text-nx-ink-3" aria-hidden="true" />
        )}

        {/* Name */}
        <span
          className={cn(
            "truncate text-sm font-medium text-nx-ink",
            !node.isActive && "text-nx-ink-3 line-through"
          )}
        >
          {displayName}
        </span>

        {/* Icon code badge */}
        {node.icon && (
          <code className="hidden rounded-nx-sm bg-nx-raised px-1.5 py-0.5 font-mono text-[10px] text-nx-ink-3 sm:inline">
            {node.icon}
          </code>
        )}

        {/* URL */}
        {node.href && (
          <span className="hidden max-w-[120px] truncate font-mono text-[10px] text-nx-ink-3 md:inline">
            {node.href}
          </span>
        )}

        {/* Hidden indicator */}
        {!node.isActive && (
          <EyeOff className="h-3.5 w-3.5 shrink-0 text-nx-ink-3" aria-hidden="true" />
        )}

        {/* Resource badge */}
        {node.resource && (
          <Badge variant="outline" className="hidden px-1.5 py-0 text-[10px] sm:inline-flex">
            {node.resource}
          </Badge>
        )}

        {/* Children count */}
        {hasChildren && (
          <Badge variant="secondary" className="px-1.5 py-0 text-[10px]">
            {node.children.length}
          </Badge>
        )}

        {/* Admin actions — only show if user has ANY action permission */}
        {hasAnyActionProp && (
          <div className="ms-auto flex items-center gap-0.5 opacity-0 transition-opacity duration-nx-micro ease-nx-enter group-focus-within:opacity-100 group-hover:opacity-100 motion-reduce:transition-none">
            {canReorder && onMoveUp && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={onMoveUp}
                aria-label={t("menus.moveUp")}
              >
                <ArrowUp className="h-3.5 w-3.5" aria-hidden="true" />
              </Button>
            )}
            {canReorder && onMoveDown && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={onMoveDown}
                aria-label={t("menus.moveDown")}
              >
                <ArrowDown className="h-3.5 w-3.5" aria-hidden="true" />
              </Button>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  aria-label={t("common.actions")}
                >
                  <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {canCreateProp && (
                  <DropdownMenuItem onClick={() => onAddChild(node)}>
                    <Plus className="me-2 h-4 w-4" aria-hidden="true" />
                    {t("menus.addChild")}
                  </DropdownMenuItem>
                )}
                {canEditProp && (
                  <DropdownMenuItem onClick={() => onEdit(node)}>
                    <Pencil className="me-2 h-4 w-4" aria-hidden="true" />
                    {t("common.edit")}
                  </DropdownMenuItem>
                )}
                {canDeleteProp && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive" onClick={() => onDelete(node)}>
                      <Trash2 className="me-2 h-4 w-4" aria-hidden="true" />
                      {t("common.delete")}
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>

      {/* Children */}
      {isExpanded && hasChildren && (
        <div className="mt-0.5">
          {node.children
            .sort((a, b) => a.order - b.order)
            .map((child, index, arr) => (
              <MenuTreeItem
                key={child.id}
                node={child}
                depth={depth + 1}
                language={language}
                canReorder={canReorder}
                expandedNodes={expandedNodes}
                onToggleExpand={onToggleExpand}
                draggedNode={draggedNode}
                dropTarget={dropTarget}
                onDragStart={onDragStart}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDragEnd={onDragEnd}
                onDrop={onDrop}
                onEdit={onEdit}
                onDelete={onDelete}
                onAddChild={onAddChild}
                onMoveUp={index > 0 && onMoveUpChild ? () => onMoveUpChild(child.id) : undefined}
                onMoveDown={
                  index < arr.length - 1 && onMoveDownChild
                    ? () => onMoveDownChild(child.id)
                    : undefined
                }
                onMoveUpChild={onMoveUpChild}
                onMoveDownChild={onMoveDownChild}
                canCreate={canCreateProp}
                canEdit={canEditProp}
                canDelete={canDeleteProp}
                hasAnyAction={hasAnyActionProp}
              />
            ))}
        </div>
      )}
    </div>
  );
}
