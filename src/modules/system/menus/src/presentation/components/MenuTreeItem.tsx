/**
 * Menu Tree Item Component (Sortable)
 *
 * Renders a single menu node inside the tree editor.
 * Supports drag-drop reorder, expand/collapse, and per-item actions.
 */
"use client";

import { useState } from "react";
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
import {
      Plus,
      MoreHorizontal,
      Pencil,
      Trash2,
      Menu,
      ChevronRight,
      ChevronDown,
      GripVertical,
      EyeOff,
      ArrowUp,
      ArrowDown,
      Type,
} from "lucide-react";
import { cn } from "@core/common/utils";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

/* -------------------------------------------------------------------------- */
/*  Helper: Flatten tree into ordered IDs for SortableContext                  */
/* -------------------------------------------------------------------------- */

export function flattenIds(nodes: MenuTreeNode[]): string[] {
      const ids: string[] = [];
      const sorted = [...nodes].sort((a, b) => a.order - b.order);
      for (const node of sorted) {
            ids.push(node.id);
            if (node.children.length > 0) {
                  ids.push(...flattenIds(node.children));
            }
      }
      return ids;
}

/* -------------------------------------------------------------------------- */
/*  Props                                                                      */
/* -------------------------------------------------------------------------- */

export interface MenuTreeItemProps {
      node: MenuTreeNode;
      depth?: number;
      language: string;
      canReorder?: boolean;
      onEdit: (node: MenuTreeNode) => void;
      onDelete: (node: MenuTreeNode) => void;
      onAddChild: (node: MenuTreeNode) => void;
      onRename?: (node: MenuTreeNode) => void;
      onHide?: (node: MenuTreeNode) => void;
      onMoveUp?: () => void;
      onMoveDown?: () => void;
      /** Called to move a child node up within this node's children */
      onMoveUpChild?: (childId: string) => void;
      /** Called to move a child node down within this node's children */
      onMoveDownChild?: (childId: string) => void;
}

/* -------------------------------------------------------------------------- */
/*  Component                                                                  */
/* -------------------------------------------------------------------------- */

export function MenuTreeItem({
      node,
      depth = 0,
      language,
      canReorder = false,
      onEdit,
      onDelete,
      onAddChild,
      onRename,
      onHide,
      onMoveUp,
      onMoveDown,
      onMoveUpChild,
      onMoveDownChild,
}: MenuTreeItemProps) {
      const { t } = useI18n();
      const [expanded, setExpanded] = useState(true);
      const hasChildren = node.children.length > 0;
      const displayName = language === "ar" ? node.nameAr : node.nameEn;

      const {
            attributes,
            listeners,
            setNodeRef,
            transform,
            transition,
            isDragging,
      } = useSortable({ id: node.id, disabled: !canReorder });

      const style = {
            transform: CSS.Transform.toString(transform),
            transition,
            opacity: isDragging ? 0.5 : 1,
            zIndex: isDragging ? 50 : undefined,
      };

      return (
            <div ref={setNodeRef} style={style}>
                  <div
                        className={cn(
                              "flex items-center gap-2 py-2.5 px-3 rounded-lg hover:bg-muted/50 group border-l-2 transition-all duration-150",
                              node.isActive ? "border-l-primary/60" : "border-l-muted opacity-60",
                              isDragging && "shadow-lg ring-2 ring-primary/30 bg-card"
                        )}
                        style={{ marginLeft: depth * 24 }}
                  >
                        {canReorder && (
                              <GripVertical
                                    className="h-4 w-4 text-muted-foreground cursor-grab opacity-0 group-hover:opacity-100 transition-opacity"
                                    {...attributes}
                                    {...listeners}
                              />
                        )}

                        {hasChildren ? (
                              <button
                                    onClick={() => setExpanded(!expanded)}
                                    className="p-0.5 hover:bg-muted rounded-sm"
                              >
                                    {expanded ? (
                                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                    ) : (
                                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                    )}
                              </button>
                        ) : (
                              <div className="w-5" />
                        )}

                        <Menu className="h-4 w-4 text-muted-foreground shrink-0" />

                        <span className={cn("font-medium text-sm", !node.isActive && "text-muted-foreground line-through")}>
                              {displayName}
                        </span>

                        {node.icon && (
                              <code className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded font-mono">
                                    {node.icon}
                              </code>
                        )}

                        {node.href && (
                              <span className="text-xs text-muted-foreground font-mono hidden sm:inline">
                                    {node.href}
                              </span>
                        )}

                        {!node.isActive && (
                              <EyeOff className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        )}

                        {node.resource && (
                              <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                                    {node.resource}
                              </Badge>
                        )}

                        {hasChildren && (
                              <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                                    {node.children.length}
                              </Badge>
                        )}

                        <div className="ml-auto flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
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

                  {expanded && hasChildren && (
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
                                                onEdit={onEdit}
                                                onDelete={onDelete}
                                                onAddChild={onAddChild}
                                                onRename={onRename}
                                                onHide={onHide}
                                                onMoveUp={index > 0 && onMoveUpChild ? () => onMoveUpChild(child.id) : undefined}
                                                onMoveDown={index < arr.length - 1 && onMoveDownChild ? () => onMoveDownChild(child.id) : undefined}
                                                onMoveUpChild={onMoveUpChild}
                                                onMoveDownChild={onMoveDownChild}
                                          />
                                    ))}
                        </div>
                  )}
            </div>
      );
}
