/**
 * Menus View
 *
 * Main view component for menu management with tree editor,
 * drag-drop reorder, and bilingual create/edit forms.
 */
"use client";

import { useState, useCallback, useMemo } from "react";
import { useMenusViewModel } from "../viewmodels/useMenusViewModel";
import { useI18n } from "@core/providers/i18n-provider";
import { Button } from "@core/ui/button";
import { Badge } from "@core/ui/badge";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import {
      Dialog,
      DialogContent,
      DialogHeader,
      DialogTitle,
      DialogDescription,
      DialogFooter,
} from "@core/ui/dialog";
import {
      DropdownMenu,
      DropdownMenuContent,
      DropdownMenuItem,
      DropdownMenuTrigger,
      DropdownMenuSeparator,
} from "@core/ui/dropdown-menu";
import { Card, CardContent, CardHeader, CardTitle } from "@core/ui/card";
import { PermissionGate, usePermissions } from "@core/providers/permission-provider";
import { SYSTEM_PERMISSIONS } from "@core/common/types/permissions";
import type { MenuTreeNode } from "../../domain/entities/MenuItem";
import type { CreateMenuItemRequest, UpdateMenuItemRequest } from "../../domain/entities/MenuItemRequests";
import {
      Plus,
      MoreHorizontal,
      Pencil,
      Trash2,
      Menu,
      RefreshCw,
      ChevronRight,
      ChevronDown,
      GripVertical,
      EyeOff,
      Eye,
      ArrowUp,
      ArrowDown,
} from "lucide-react";
import { cn } from "@core/common/utils";
import {
      DndContext,
      closestCenter,
      KeyboardSensor,
      PointerSensor,
      useSensor,
      useSensors,
      type DragEndEvent,
} from "@dnd-kit/core";
import {
      SortableContext,
      useSortable,
      verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

/* -------------------------------------------------------------------------- */
/*  Helper: Flatten tree into ordered IDs for SortableContext                    */
/* -------------------------------------------------------------------------- */

function flattenIds(nodes: MenuTreeNode[]): string[] {
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
/*  Menu Tree Item Component (Sortable)                                         */
/* -------------------------------------------------------------------------- */

interface MenuTreeItemProps {
      node: MenuTreeNode;
      depth?: number;
      language: string;
      onEdit: (node: MenuTreeNode) => void;
      onDelete: (node: MenuTreeNode) => void;
      onAddChild: (node: MenuTreeNode) => void;
      onMoveUp?: () => void;
      onMoveDown?: () => void;
      canReorder?: boolean;
}

function MenuTreeItem({
      node,
      depth = 0,
      language,
      onEdit,
      onDelete,
      onAddChild,
      onMoveUp,
      onMoveDown,
      canReorder = false,
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
                                                onEdit={onEdit}
                                                onDelete={onDelete}
                                                onAddChild={onAddChild}
                                                canReorder={canReorder}
                                                onMoveUp={index > 0 ? () => onEdit(child) : undefined}
                                                onMoveDown={index < arr.length - 1 ? () => onEdit(child) : undefined}
                                          />
                                    ))}
                        </div>
                  )}
            </div>
      );
}

/* -------------------------------------------------------------------------- */
/*  Menu Form Dialog Component                                                 */
/* -------------------------------------------------------------------------- */

interface MenuFormDialogProps {
      open: boolean;
      onOpenChange: (open: boolean) => void;
      mode: "create" | "edit";
      parentNode?: MenuTreeNode | null;
      editNode?: MenuTreeNode | null;
      onSubmit: (data: CreateMenuItemRequest | { id: string; request: UpdateMenuItemRequest }) => Promise<void>;
      isPending: boolean;
}

function MenuFormDialog({
      open,
      onOpenChange,
      mode,
      parentNode,
      editNode,
      onSubmit,
      isPending,
}: MenuFormDialogProps) {
      const { t } = useI18n();

      const [slug, setSlug] = useState(editNode?.slug ?? "");
      const [nameEn, setNameEn] = useState(editNode?.nameEn ?? "");
      const [nameAr, setNameAr] = useState(editNode?.nameAr ?? "");
      const [href, setHref] = useState(editNode?.href ?? "");
      const [icon, setIcon] = useState(editNode?.icon ?? "");
      const [resource, setResource] = useState(editNode?.resource ?? "");

      // Reset form when dialog opens with new data
      const resetForm = useCallback(() => {
            setSlug(editNode?.slug ?? "");
            setNameEn(editNode?.nameEn ?? "");
            setNameAr(editNode?.nameAr ?? "");
            setHref(editNode?.href ?? "");
            setIcon(editNode?.icon ?? "");
            setResource(editNode?.resource ?? "");
      }, [editNode]);

      // Auto-reset when dialog opens
      const handleOpenChange = (isOpen: boolean) => {
            if (isOpen) resetForm();
            onOpenChange(isOpen);
      };

      const handleSubmit = async (e: React.FormEvent) => {
            e.preventDefault();
            if (!nameEn.trim() || !slug.trim()) return;

            if (mode === "create") {
                  await onSubmit({
                        slug: slug.trim(),
                        nameEn: nameEn.trim(),
                        nameAr: nameAr.trim() || nameEn.trim(),
                        href: href.trim() || undefined,
                        icon: icon.trim() || undefined,
                        parentMenuItemId: parentNode?.id,
                        resource: resource.trim() || undefined,
                  } as CreateMenuItemRequest);
            } else if (editNode) {
                  await onSubmit({
                        id: editNode.id,
                        request: {
                              slug: slug.trim(),
                              nameEn: nameEn.trim(),
                              nameAr: nameAr.trim() || nameEn.trim(),
                              href: href.trim() || undefined,
                              icon: icon.trim() || undefined,
                              resource: resource.trim() || undefined,
                        },
                  });
            }
            onOpenChange(false);
      };

      return (
            <Dialog open={open} onOpenChange={handleOpenChange}>
                  <DialogContent className="max-w-lg">
                        <DialogHeader>
                              <DialogTitle>
                                    {mode === "create"
                                          ? parentNode
                                                ? t("menus.addChildTitle")
                                                : t("menus.createTitle")
                                          : t("menus.editTitle")}
                              </DialogTitle>
                              <DialogDescription>
                                    {mode === "create" && parentNode
                                          ? `${t("menus.addChildDesc")} "${parentNode.nameEn}"`
                                          : mode === "create"
                                                ? t("menus.createDesc")
                                                : t("menus.editDesc")}
                              </DialogDescription>
                        </DialogHeader>

                        <form onSubmit={handleSubmit} className="space-y-4 py-2">
                              {/* Slug */}
                              <div className="space-y-2">
                                    <Label htmlFor="slug">{t("menus.slug")}</Label>
                                    <Input
                                          id="slug"
                                          value={slug}
                                          onChange={(e) => setSlug(e.target.value)}
                                          placeholder="dashboard"
                                          required
                                          className="font-mono text-sm"
                                    />
                              </div>

                              {/* Bilingual Names */}
                              <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                          <Label htmlFor="nameEn">{t("menus.nameEn")}</Label>
                                          <Input
                                                id="nameEn"
                                                value={nameEn}
                                                onChange={(e) => setNameEn(e.target.value)}
                                                placeholder="Dashboard"
                                                required
                                          />
                                    </div>
                                    <div className="space-y-2">
                                          <Label htmlFor="nameAr">{t("menus.nameAr")}</Label>
                                          <Input
                                                id="nameAr"
                                                value={nameAr}
                                                onChange={(e) => setNameAr(e.target.value)}
                                                placeholder="لوحة التحكم"
                                                dir="rtl"
                                          />
                                    </div>
                              </div>

                              {/* Href & Icon */}
                              <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                          <Label htmlFor="href">{t("menus.href")}</Label>
                                          <Input
                                                id="href"
                                                value={href}
                                                onChange={(e) => setHref(e.target.value)}
                                                placeholder="/dashboard"
                                                className="font-mono text-sm"
                                          />
                                    </div>
                                    <div className="space-y-2">
                                          <Label htmlFor="icon">{t("menus.icon")}</Label>
                                          <Input
                                                id="icon"
                                                value={icon}
                                                onChange={(e) => setIcon(e.target.value)}
                                                placeholder="LayoutDashboard"
                                                className="font-mono text-sm"
                                          />
                                    </div>
                              </div>

                              {/* Resource (Permission) */}
                              <div className="space-y-2">
                                    <Label htmlFor="resource">{t("menus.resource")}</Label>
                                    <Input
                                          id="resource"
                                          value={resource}
                                          onChange={(e) => setResource(e.target.value)}
                                          placeholder="users"
                                          className="font-mono text-sm"
                                    />
                                    <p className="text-xs text-muted-foreground">
                                          {t("menus.resourceHint")}
                                    </p>
                              </div>

                              <DialogFooter>
                                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                                          {t("common.cancel")}
                                    </Button>
                                    <Button type="submit" disabled={isPending || !nameEn.trim() || !slug.trim()}>
                                          {isPending ? t("common.saving") : mode === "create" ? t("common.create") : t("common.save")}
                                    </Button>
                              </DialogFooter>
                        </form>
                  </DialogContent>
            </Dialog>
      );
}

/* -------------------------------------------------------------------------- */
/*  Main Menus View                                                            */
/* -------------------------------------------------------------------------- */

export function MenusView() {
      const { t } = useI18n();
      const { hasPermission } = usePermissions();
      const canReorder = hasPermission(SYSTEM_PERMISSIONS.MENUS_UPDATE);

      // Dialog state
      const [createDialogOpen, setCreateDialogOpen] = useState(false);
      const [editDialogOpen, setEditDialogOpen] = useState(false);
      const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
      const [selectedNode, setSelectedNode] = useState<MenuTreeNode | null>(null);
      const [parentForNew, setParentForNew] = useState<MenuTreeNode | null>(null);

      // ViewModel
      const {
            menuTree,
            totalItems,
            isLoading,
            language,
            handleCreate,
            handleUpdate,
            handleDelete,
            handleReorder,
            refetch,
            isCreating,
            isUpdating,
            isDeleting,
            isReordering,
      } = useMenusViewModel();

      // DnD sensors
      const sensors = useSensors(
            useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
            useSensor(KeyboardSensor)
      );

      // Flatten tree IDs for SortableContext
      const sortableIds = useMemo(
            () => (Array.isArray(menuTree) ? flattenIds(menuTree) : []),
            [menuTree]
      );

      // ── Move helpers ──────────────────────────────────────────────────
      const buildReorderPayload = useCallback(
            (siblings: MenuTreeNode[], parentId?: string) => ({
                  items: siblings.map((s, i) => ({
                        id: s.id,
                        order: i + 1,
                        parentMenuItemId: parentId,
                  })),
            }),
            []
      );

      const findSiblingsAndParent = useCallback(
            (nodeId: string, nodes: MenuTreeNode[], parentId?: string): { siblings: MenuTreeNode[]; parentId?: string } | null => {
                  const idx = nodes.findIndex((n) => n.id === nodeId);
                  if (idx >= 0) return { siblings: nodes, parentId };
                  for (const node of nodes) {
                        if (node.children.length > 0) {
                              const result = findSiblingsAndParent(nodeId, node.children, node.id);
                              if (result) return result;
                        }
                  }
                  return null;
            },
            []
      );

      const handleMoveUp = useCallback(
            (nodeId: string) => {
                  const result = findSiblingsAndParent(nodeId, menuTree);
                  if (!result) return;
                  const { siblings, parentId } = result;
                  const sorted = [...siblings].sort((a, b) => a.order - b.order);
                  const idx = sorted.findIndex((n) => n.id === nodeId);
                  if (idx <= 0) return;
                  // Swap with previous sibling
                  [sorted[idx], sorted[idx - 1]] = [sorted[idx - 1], sorted[idx]];
                  handleReorder(buildReorderPayload(sorted, parentId));
            },
            [menuTree, findSiblingsAndParent, handleReorder, buildReorderPayload]
      );

      const handleMoveDown = useCallback(
            (nodeId: string) => {
                  const result = findSiblingsAndParent(nodeId, menuTree);
                  if (!result) return;
                  const { siblings, parentId } = result;
                  const sorted = [...siblings].sort((a, b) => a.order - b.order);
                  const idx = sorted.findIndex((n) => n.id === nodeId);
                  if (idx < 0 || idx >= sorted.length - 1) return;
                  // Swap with next sibling
                  [sorted[idx], sorted[idx + 1]] = [sorted[idx + 1], sorted[idx]];
                  handleReorder(buildReorderPayload(sorted, parentId));
            },
            [menuTree, findSiblingsAndParent, handleReorder, buildReorderPayload]
      );

      // ── Drag end handler ──────────────────────────────────────────────
      const handleDragEnd = useCallback(
            (event: DragEndEvent) => {
                  const { active, over } = event;
                  if (!over || active.id === over.id) return;

                  const activeId = String(active.id);
                  const overId = String(over.id);

                  // Find active item's siblings
                  const activeResult = findSiblingsAndParent(activeId, menuTree);
                  const overResult = findSiblingsAndParent(overId, menuTree);

                  if (!activeResult || !overResult) return;

                  // Only reorder within the same parent level
                  if (activeResult.parentId !== overResult.parentId) return;

                  const sorted = [...activeResult.siblings].sort((a, b) => a.order - b.order);
                  const activeIdx = sorted.findIndex((n) => n.id === activeId);
                  const overIdx = sorted.findIndex((n) => n.id === overId);

                  if (activeIdx < 0 || overIdx < 0) return;

                  // Move the item
                  const [moved] = sorted.splice(activeIdx, 1);
                  sorted.splice(overIdx, 0, moved);

                  handleReorder(buildReorderPayload(sorted, activeResult.parentId));
            },
            [menuTree, findSiblingsAndParent, handleReorder, buildReorderPayload]
      );

      // Handlers
      const handleOpenCreate = useCallback((parent?: MenuTreeNode) => {
            setParentForNew(parent || null);
            setCreateDialogOpen(true);
      }, []);

      const handleOpenEdit = useCallback((node: MenuTreeNode) => {
            setSelectedNode(node);
            setEditDialogOpen(true);
      }, []);

      const handleOpenDelete = useCallback((node: MenuTreeNode) => {
            setSelectedNode(node);
            setDeleteDialogOpen(true);
      }, []);

      const onCreateSubmit = useCallback(async (data: CreateMenuItemRequest | { id: string; request: UpdateMenuItemRequest }) => {
            await handleCreate(data as CreateMenuItemRequest);
      }, [handleCreate]);

      const onEditSubmit = useCallback(async (data: CreateMenuItemRequest | { id: string; request: UpdateMenuItemRequest }) => {
            const editData = data as { id: string; request: UpdateMenuItemRequest };
            await handleUpdate(editData.id, editData.request);
      }, [handleUpdate]);

      const onDeleteConfirm = useCallback(async () => {
            if (!selectedNode) return;
            await handleDelete(selectedNode.id);
            setDeleteDialogOpen(false);
            setSelectedNode(null);
      }, [handleDelete, selectedNode]);

      return (
            <div className="space-y-6">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                        <div>
                              <h1 className="text-3xl font-bold tracking-tight">{t("menus.title")}</h1>
                              <p className="text-muted-foreground">
                                    {t("menus.description")}
                              </p>
                        </div>
                        <div className="flex items-center gap-2">
                              <Badge variant="secondary">{totalItems} {t("menus.items")}</Badge>
                              {isReordering && (
                                    <Badge variant="outline" className="text-primary animate-pulse">
                                          {t("menus.saving") ?? "Saving..."}
                                    </Badge>
                              )}
                              <Button variant="outline" size="icon" onClick={refetch} disabled={isLoading}>
                                    <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
                              </Button>
                              <PermissionGate permission={SYSTEM_PERMISSIONS.MENUS_CREATE}>
                                    <Button onClick={() => handleOpenCreate()}>
                                          <Plus className="mr-2 h-4 w-4" />
                                          {t("menus.createMenuItem")}
                                    </Button>
                              </PermissionGate>
                        </div>
                  </div>

                  {/* Menu Tree */}
                  {isLoading ? (
                        <Card>
                              <CardContent className="py-12">
                                    <div className="flex flex-col items-center justify-center gap-3">
                                          <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                                          <p className="text-sm text-muted-foreground">{t("common.loading")}</p>
                                    </div>
                              </CardContent>
                        </Card>
                  ) : menuTree.length === 0 ? (
                        <Card>
                              <CardContent className="flex flex-col items-center justify-center py-16">
                                    <div className="rounded-full bg-muted p-4 mb-4">
                                          <Menu className="h-8 w-8 text-muted-foreground" />
                                    </div>
                                    <h3 className="text-lg font-semibold mb-2">{t("menus.emptyTitle")}</h3>
                                    <p className="text-muted-foreground text-center mb-6 max-w-sm">
                                          {t("menus.emptyDesc")}
                                    </p>
                                    <PermissionGate permission={SYSTEM_PERMISSIONS.MENUS_CREATE}>
                                          <Button onClick={() => handleOpenCreate()}>
                                                <Plus className="mr-2 h-4 w-4" />
                                                {t("menus.createMenuItem")}
                                          </Button>
                                    </PermissionGate>
                              </CardContent>
                        </Card>
                  ) : (
                        <Card>
                              <CardHeader className="pb-3">
                                    <div className="flex items-center justify-between">
                                          <CardTitle className="text-sm font-medium text-muted-foreground">
                                                {t("menus.structure")}
                                          </CardTitle>
                                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                <Eye className="h-3.5 w-3.5" />
                                                <span>{t("menus.activeItems")}</span>
                                                <span className="mx-1">·</span>
                                                <EyeOff className="h-3.5 w-3.5" />
                                                <span>{t("menus.inactiveItems")}</span>
                                          </div>
                                    </div>
                              </CardHeader>
                              <CardContent>
                                    <DndContext
                                          sensors={sensors}
                                          collisionDetection={closestCenter}
                                          onDragEnd={canReorder ? handleDragEnd : undefined}
                                    >
                                          <SortableContext
                                                items={sortableIds}
                                                strategy={verticalListSortingStrategy}
                                          >
                                                <div className="space-y-0.5">
                                                      {Array.isArray(menuTree) && menuTree
                                                            .sort((a, b) => a.order - b.order)
                                                            .map((node, index, arr) => (
                                                                  <MenuTreeItem
                                                                        key={node.id}
                                                                        node={node}
                                                                        language={language}
                                                                        onEdit={handleOpenEdit}
                                                                        onDelete={handleOpenDelete}
                                                                        onAddChild={handleOpenCreate}
                                                                        canReorder={canReorder}
                                                                        onMoveUp={index > 0 ? () => handleMoveUp(node.id) : undefined}
                                                                        onMoveDown={index < arr.length - 1 ? () => handleMoveDown(node.id) : undefined}
                                                                  />
                                                            ))}
                                                </div>
                                          </SortableContext>
                                    </DndContext>
                              </CardContent>
                        </Card>
                  )}

                  {/* Create Dialog */}
                  <MenuFormDialog
                        open={createDialogOpen}
                        onOpenChange={setCreateDialogOpen}
                        mode="create"
                        parentNode={parentForNew}
                        onSubmit={onCreateSubmit}
                        isPending={isCreating}
                  />

                  {/* Edit Dialog */}
                  <MenuFormDialog
                        open={editDialogOpen}
                        onOpenChange={setEditDialogOpen}
                        mode="edit"
                        editNode={selectedNode}
                        onSubmit={onEditSubmit}
                        isPending={isUpdating}
                  />

                  {/* Delete Confirmation Dialog */}
                  <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                        <DialogContent className="max-w-sm">
                              <DialogHeader>
                                    <DialogTitle>{t("menus.deleteTitle")}</DialogTitle>
                                    <DialogDescription>
                                          {t("menus.deleteDesc", {
                                                name: selectedNode
                                                      ? language === "ar" ? selectedNode.nameAr : selectedNode.nameEn
                                                      : ""
                                          })}
                                    </DialogDescription>
                              </DialogHeader>
                              <DialogFooter className="gap-2">
                                    <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                                          {t("common.cancel")}
                                    </Button>
                                    <Button
                                          variant="destructive"
                                          onClick={onDeleteConfirm}
                                          disabled={isDeleting}
                                    >
                                          {isDeleting ? t("common.deleting") : t("common.delete")}
                                    </Button>
                              </DialogFooter>
                        </DialogContent>
                  </Dialog>
            </div>
      );
}
