/**
 * Menu Tree Item Component (Native HTML5 DnD)
 *
 * Renders a single menu node inside the tree editor.
 * Supports native drag-and-drop with 3-zone detection
 * (before / inside / after), expand/collapse, and per-item actions.
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
import { PermissionGate } from "@core/providers/permission-provider";
import { SYSTEM_PERMISSIONS } from "@core/common/types/permissions";
import type { MenuTreeNode } from "../../domain/entities/MenuItem";
import type { MenuOverrideDto } from "../../domain/entities/MenuItemRequests";
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
      Type,
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

      // Actions
      onEdit: (node: MenuTreeNode) => void;
      onDelete: (node: MenuTreeNode) => void;
      onAddChild: (node: MenuTreeNode) => void;
      onRename?: (node: MenuTreeNode) => void;
      onHide?: (node: MenuTreeNode) => void;
      onMoveUp?: () => void;
      onMoveDown?: () => void;
      onMoveUpChild?: (childId: string) => void;
      onMoveDownChild?: (childId: string) => void;

      // Override indicators
      overrideMap?: Map<string, MenuOverrideDto>;
}

/* -------------------------------------------------------------------------- */
/*  Level colors for hierarchy visualization                                   */
/* -------------------------------------------------------------------------- */

const LEVEL_COLORS = [
      "border-l-blue-500",
      "border-l-emerald-500",
      "border-l-amber-500",
      "border-l-purple-500",
      "border-l-pink-500",
];

const LEVEL_BG_COLORS = [
      "bg-blue-500/5",
      "bg-emerald-500/5",
      "bg-amber-500/5",
      "bg-purple-500/5",
      "bg-pink-500/5",
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
      onRename,
      onHide,
      onMoveUp,
      onMoveDown,
      onMoveUpChild,
      onMoveDownChild,
      overrideMap,
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

      const computePosition = useCallback(
            (e: React.DragEvent): DropPosition => {
                  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                  const y = e.clientY - rect.top;
                  const height = rect.height;

                  if (y < height * 0.25) return "before";
                  if (y > height * 0.75) return "after";
                  return "inside";
            },
            []
      );

      // ── Native DnD handlers ────────────────────────────────────────────

      const handleDragStart = useCallback(
            (e: React.DragEvent) => {
                  e.dataTransfer.effectAllowed = "move";
                  e.dataTransfer.setData("text/plain", node.id);
                  // Delay to let browser render the drag ghost
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

      const handleDragEnter = useCallback(
            (e: React.DragEvent) => {
                  e.preventDefault();
                  e.stopPropagation();
                  dragCounterRef.current++;
            },
            []
      );

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
                        return "before:absolute before:top-0 before:inset-x-0 before:h-[3px] before:bg-blue-500 before:rounded-full before:z-10";
                  case "after":
                        return "after:absolute after:bottom-0 after:inset-x-0 after:h-[3px] after:bg-blue-500 after:rounded-full after:z-10";
                  case "inside":
                        return "ring-2 ring-blue-500 ring-inset bg-blue-500/10";
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
                              "group relative flex items-center gap-2 py-2.5 px-3 rounded-lg",
                              "hover:bg-muted/50 transition-all duration-150",
                              "border-l-2",
                              node.isActive ? levelColor : "border-l-muted/40",
                              !node.isActive && "opacity-60",
                              depth > 0 && levelBg,
                              getDropIndicatorStyles()
                        )}
                        style={{ marginInlineStart: depth * 24 }}
                  >
                        {/* Drag handle */}
                        {canReorder && (
                              <GripVertical
                                    className={cn(
                                          "h-4 w-4 text-muted-foreground cursor-grab active:cursor-grabbing",
                                          "opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                                    )}
                              />
                        )}

                        {/* Expand / Collapse */}
                        {hasChildren ? (
                              <button
                                    onClick={(e) => {
                                          e.stopPropagation();
                                          onToggleExpand(node.id);
                                    }}
                                    className="p-0.5 hover:bg-muted rounded-sm shrink-0"
                              >
                                    {isExpanded ? (
                                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                    ) : (
                                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                    )}
                              </button>
                        ) : (
                              <div className="w-5 shrink-0" />
                        )}

                        {/* Icon */}
                        {hasChildren ? (
                              <FolderOpen className="h-4 w-4 text-primary shrink-0" />
                        ) : (
                              <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                        )}

                        {/* Name */}
                        <span
                              className={cn(
                                    "font-medium text-sm truncate",
                                    !node.isActive && "text-muted-foreground line-through"
                              )}
                        >
                              {displayName}
                        </span>

                        {/* Icon code badge */}
                        {node.icon && (
                              <code className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded font-mono hidden sm:inline">
                                    {node.icon}
                              </code>
                        )}

                        {/* URL */}
                        {node.href && (
                              <span className="text-[10px] text-muted-foreground font-mono hidden md:inline truncate max-w-[120px]">
                                    {node.href}
                              </span>
                        )}

                        {/* Hidden indicator */}
                        {!node.isActive && (
                              <EyeOff className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        )}

                        {/* Resource badge */}
                        {node.resource && (
                              <Badge variant="outline" className="text-[10px] px-1.5 py-0 hidden sm:inline-flex">
                                    {node.resource}
                              </Badge>
                        )}

                        {/* Children count */}
                        {hasChildren && (
                              <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                                    {node.children.length}
                              </Badge>
                        )}

                        {/* Override indicator */}
                        {overrideMap?.has(node.id) && (() => {
                              const ov = overrideMap.get(node.id)!;
                              const scopeColors: Record<string, string> = {
                                    User: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
                                    Tenant: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
                                    TenantAndChildren: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
                              };
                              const label = ov.isHidden
                                    ? `⊘ ${ov.scope}`
                                    : `✎ ${ov.scope}`;
                              return (
                                    <Badge
                                          variant="outline"
                                          className={cn(
                                                'text-[9px] px-1.5 py-0 font-medium border-0',
                                                scopeColors[ov.scope] ?? 'bg-muted text-muted-foreground'
                                          )}
                                    >
                                          {label}
                                    </Badge>
                              );
                        })()}

                        {/* Actions */}
                        <div className="ms-auto flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                              {canReorder && onMoveUp && (
                                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onMoveUp}>
                                          <ArrowUp className="h-3.5 w-3.5" />
                                    </Button>
                              )}
                              {canReorder && onMoveDown && (
                                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onMoveDown}>
                                          <ArrowDown className="h-3.5 w-3.5" />
                                    </Button>
                              )}
                              <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                          <Button variant="ghost" className="h-7 w-7 p-0">
                                                <MoreHorizontal className="h-4 w-4" />
                                          </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                          <PermissionGate permission={SYSTEM_PERMISSIONS.MENUS_CREATE}>
                                                <DropdownMenuItem onClick={() => onAddChild(node)}>
                                                      <Plus className="mr-2 h-4 w-4" />
                                                      {t("menus.addChild")}
                                                </DropdownMenuItem>
                                          </PermissionGate>
                                          <PermissionGate permission={SYSTEM_PERMISSIONS.MENUS_UPDATE}>
                                                <DropdownMenuItem onClick={() => onEdit(node)}>
                                                      <Pencil className="mr-2 h-4 w-4" />
                                                      {t("common.edit")}
                                                </DropdownMenuItem>
                                          </PermissionGate>
                                          {onRename && (
                                                <PermissionGate permission={SYSTEM_PERMISSIONS.MENUS_CUSTOMIZE}>
                                                      <DropdownMenuItem onClick={() => onRename(node)}>
                                                            <Type className="mr-2 h-4 w-4" />
                                                            {t("menus.overrideRename")}
                                                      </DropdownMenuItem>
                                                </PermissionGate>
                                          )}
                                          {onHide && (
                                                <PermissionGate permission={SYSTEM_PERMISSIONS.MENUS_CUSTOMIZE}>
                                                      <DropdownMenuItem onClick={() => onHide(node)}>
                                                            <EyeOff className="mr-2 h-4 w-4" />
                                                            {t("menus.hideItem")}
                                                      </DropdownMenuItem>
                                                </PermissionGate>
                                          )}
                                          <DropdownMenuSeparator />
                                          <PermissionGate permission={SYSTEM_PERMISSIONS.MENUS_DELETE}>
                                                <DropdownMenuItem
                                                      className="text-destructive"
                                                      onClick={() => onDelete(node)}
                                                >
                                                      <Trash2 className="mr-2 h-4 w-4" />
                                                      {t("common.delete")}
                                                </DropdownMenuItem>
                                          </PermissionGate>
                                    </DropdownMenuContent>
                              </DropdownMenu>
                        </div>
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
                                                onRename={onRename}
                                                onHide={onHide}
                                                onMoveUp={index > 0 && onMoveUpChild ? () => onMoveUpChild(child.id) : undefined}
                                                onMoveDown={index < arr.length - 1 && onMoveDownChild ? () => onMoveDownChild(child.id) : undefined}
                                                onMoveUpChild={onMoveUpChild}
                                                onMoveDownChild={onMoveDownChild}
                                                overrideMap={overrideMap}
                                          />
                                    ))}
                        </div>
                  )}
            </div>
      );
}
