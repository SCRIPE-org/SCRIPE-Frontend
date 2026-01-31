/**
 * Menus View
 *
 * Main view component for menu management with tree editor.
 */
"use client";

import { useState, useCallback } from "react";
import { useMenusViewModel } from "../viewmodels/useMenusViewModel";
import { Button } from "@core/ui/button";
import { Badge } from "@core/ui/badge";
import {
      Dialog,
      DialogContent,
      DialogHeader,
      DialogTitle,
      DialogDescription,
} from "@core/ui/dialog";
import {
      DropdownMenu,
      DropdownMenuContent,
      DropdownMenuItem,
      DropdownMenuTrigger,
      DropdownMenuSeparator,
} from "@core/ui/dropdown-menu";
import { Card, CardContent, CardHeader, CardTitle } from "@core/ui/card";
import { PermissionGate } from "@core/providers/permission-provider";
import { SYSTEM_PERMISSIONS } from "@core/common/types/permissions";
import type { MenuTreeNode } from "../../domain/entities/MenuItem";
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
      // Eye,
      EyeOff,
      ExternalLink,
} from "lucide-react";
import { cn } from "@core/common/utils";

interface MenuTreeItemProps {
      node: MenuTreeNode;
      depth?: number;
      onEdit: (node: MenuTreeNode) => void;
      onDelete: (node: MenuTreeNode) => void;
      onAddChild: (node: MenuTreeNode) => void;
}

function MenuTreeItem({
      node,
      depth = 0,
      onEdit,
      onDelete,
      onAddChild,
}: MenuTreeItemProps) {
      const [expanded, setExpanded] = useState(true);
      const hasChildren = node.children.length > 0;

      return (
            <div>
                  <div
                        className={cn(
                              "flex items-center gap-2 py-2 px-3 rounded-md hover:bg-muted/50 group border-l-2",
                              node.isVisible ? "border-l-primary/50" : "border-l-muted"
                        )}
                        style={{ marginLeft: depth * 24 }}
                  >
                        <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab opacity-0 group-hover:opacity-100" />

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

                        <Menu className="h-4 w-4 text-muted-foreground" />

                        <span className={cn("font-medium", !node.isVisible && "text-muted-foreground")}>
                              {node.title}
                        </span>

                        {node.icon && (
                              <code className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                                    {node.icon}
                              </code>
                        )}

                        {node.path && (
                              <span className="text-xs text-muted-foreground">
                                    {node.path}
                              </span>
                        )}

                        {node.isExternal && (
                              <ExternalLink className="h-3 w-3 text-muted-foreground" />
                        )}

                        {!node.isVisible && (
                              <EyeOff className="h-3 w-3 text-muted-foreground" />
                        )}

                        {node.requiredPermission && (
                              <Badge variant="outline" className="text-xs">
                                    {node.requiredPermission}
                              </Badge>
                        )}

                        <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                              <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                          <Button variant="ghost" className="h-8 w-8 p-0">
                                                <MoreHorizontal className="h-4 w-4" />
                                          </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                          <PermissionGate permission={SYSTEM_PERMISSIONS.MENUS_CREATE}>
                                                <DropdownMenuItem onClick={() => onAddChild(node)}>
                                                      <Plus className="mr-2 h-4 w-4" />
                                                      Add Child
                                                </DropdownMenuItem>
                                          </PermissionGate>
                                          <PermissionGate permission={SYSTEM_PERMISSIONS.MENUS_UPDATE}>
                                                <DropdownMenuItem onClick={() => onEdit(node)}>
                                                      <Pencil className="mr-2 h-4 w-4" />
                                                      Edit
                                                </DropdownMenuItem>
                                          </PermissionGate>
                                          <DropdownMenuSeparator />
                                          <PermissionGate permission={SYSTEM_PERMISSIONS.MENUS_DELETE}>
                                                <DropdownMenuItem
                                                      className="text-destructive"
                                                      onClick={() => onDelete(node)}
                                                >
                                                      <Trash2 className="mr-2 h-4 w-4" />
                                                      Delete
                                                </DropdownMenuItem>
                                          </PermissionGate>
                                    </DropdownMenuContent>
                              </DropdownMenu>
                        </div>
                  </div>

                  {expanded && hasChildren && (
                        <div>
                              {node.children
                                    .sort((a, b) => a.order - b.order)
                                    .map((child) => (
                                          <MenuTreeItem
                                                key={child.id}
                                                node={child}
                                                depth={depth + 1}
                                                onEdit={onEdit}
                                                onDelete={onDelete}
                                                onAddChild={onAddChild}
                                          />
                                    ))}
                        </div>
                  )}
            </div>
      );
}

export function MenusView() {
      // State
      const [createDialogOpen, setCreateDialogOpen] = useState(false);
      const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
      const [selectedNode, setSelectedNode] = useState<MenuTreeNode | null>(null);
      const [parentForNew, setParentForNew] = useState<MenuTreeNode | null>(null);

      // ViewModel
      const {
            menuTree,
            totalItems,
            isLoading,
            handleDelete,
            refetch,
            isDeleting,
      } = useMenusViewModel();

      // Handlers
      const handleOpenCreate = useCallback((parent?: MenuTreeNode) => {
            setParentForNew(parent || null);
            setCreateDialogOpen(true);
      }, []);

      const handleOpenEdit = useCallback((node: MenuTreeNode) => {
            setSelectedNode(node);
            // Open edit dialog
      }, []);

      const handleOpenDelete = useCallback((node: MenuTreeNode) => {
            setSelectedNode(node);
            setDeleteDialogOpen(true);
      }, []);

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
                              <h1 className="text-3xl font-bold tracking-tight">Menus</h1>
                              <p className="text-muted-foreground">
                                    Configure navigation menu items.
                              </p>
                        </div>
                        <div className="flex items-center gap-2">
                              <Badge variant="secondary">{totalItems} items</Badge>
                              <Button variant="outline" size="icon" onClick={refetch} disabled={isLoading}>
                                    <RefreshCw className="h-4 w-4" />
                              </Button>
                              <PermissionGate permission={SYSTEM_PERMISSIONS.MENUS_CREATE}>
                                    <Button onClick={() => handleOpenCreate()}>
                                          <Plus className="mr-2 h-4 w-4" />
                                          Create Menu Item
                                    </Button>
                              </PermissionGate>
                        </div>
                  </div>

                  {/* Menu Tree */}
                  {isLoading ? (
                        <Card>
                              <CardContent className="py-8">
                                    <div className="flex items-center justify-center">
                                          <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                                    </div>
                              </CardContent>
                        </Card>
                  ) : menuTree.length === 0 ? (
                        <Card>
                              <CardContent className="flex flex-col items-center justify-center py-12">
                                    <Menu className="h-12 w-12 text-muted-foreground mb-4" />
                                    <h3 className="text-lg font-semibold mb-2">No menu items found</h3>
                                    <p className="text-muted-foreground text-center mb-4">
                                          Create your first menu item to start building navigation.
                                    </p>
                                    <PermissionGate permission={SYSTEM_PERMISSIONS.MENUS_CREATE}>
                                          <Button onClick={() => handleOpenCreate()}>
                                                <Plus className="mr-2 h-4 w-4" />
                                                Create Menu Item
                                          </Button>
                                    </PermissionGate>
                              </CardContent>
                        </Card>
                  ) : (
                        <Card>
                              <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">
                                          Menu Structure
                                    </CardTitle>
                              </CardHeader>
                              <CardContent>
                                    <div className="space-y-1">
                                          {Array.isArray(menuTree) && menuTree
                                                .sort((a, b) => a.order - b.order)
                                                .map((node) => (
                                                      <MenuTreeItem
                                                            key={node.id}
                                                            node={node}
                                                            onEdit={handleOpenEdit}
                                                            onDelete={handleOpenDelete}
                                                            onAddChild={handleOpenCreate}
                                                      />
                                                ))}
                                    </div>
                              </CardContent>
                        </Card>
                  )}

                  {/* Create Menu Item Dialog */}
                  <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                        <DialogContent className="max-w-md">
                              <DialogHeader>
                                    <DialogTitle>
                                          {parentForNew ? `Add Sub-Menu Item` : "Create Menu Item"}
                                    </DialogTitle>
                                    <DialogDescription>
                                          {parentForNew
                                                ? `Add a new menu item under "${parentForNew.title}".`
                                                : "Add a new root menu item."}
                                    </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4 py-4">
                                    <p className="text-sm text-muted-foreground">
                                          Menu item creation form coming soon...
                                    </p>
                              </div>
                        </DialogContent>
                  </Dialog>

                  {/* Delete Confirmation Dialog */}
                  <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                        <DialogContent className="max-w-sm">
                              <DialogHeader>
                                    <DialogTitle>Delete Menu Item</DialogTitle>
                                    <DialogDescription>
                                          Are you sure you want to delete &quot;{selectedNode?.title}&quot;? This will
                                          also delete all child menu items. This action cannot be undone.
                                    </DialogDescription>
                              </DialogHeader>
                              <div className="flex justify-end gap-2 pt-4">
                                    <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                                          Cancel
                                    </Button>
                                    <Button
                                          variant="destructive"
                                          onClick={onDeleteConfirm}
                                          disabled={isDeleting}
                                    >
                                          {isDeleting ? "Deleting..." : "Delete"}
                                    </Button>
                              </div>
                        </DialogContent>
                  </Dialog>
            </div>
      );
}
