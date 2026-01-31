/**
 * Tenants View
 *
 * Main view component for tenant management with tree hierarchy.
 */
"use client";

import { useState, useCallback } from "react";
import { useTenantsViewModel } from "../viewmodels/useTenantsViewModel";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
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
import type { TenantTreeNode } from "../../domain/entities/Tenant";
import {
      Plus,
      MoreHorizontal,
      Pencil,
      Trash2,
      Building2,
      Search,
      RefreshCw,
      ChevronRight,
      ChevronDown,
      List,
      Network,
} from "lucide-react";
import { cn } from "@core/common/utils";

interface TenantTreeItemProps {
      node: TenantTreeNode;
      depth?: number;
      onEdit: (node: TenantTreeNode) => void;
      onDelete: (node: TenantTreeNode) => void;
      onAddChild: (node: TenantTreeNode) => void;
}

function TenantTreeItem({
      node,
      depth = 0,
      onEdit,
      onDelete,
      onAddChild,
}: TenantTreeItemProps) {
      const [expanded, setExpanded] = useState(true);
      const hasChildren = node.children.length > 0;

      return (
            <div>
                  <div
                        className={cn(
                              "flex items-center gap-2 py-2 px-3 rounded-md hover:bg-muted/50 group",
                              depth > 0 && "ml-6"
                        )}
                        style={{ marginLeft: depth * 24 }}
                  >
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
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{node.name}</span>
                        <code className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                              {node.code}
                        </code>
                        <Badge
                              variant={node.isActive ? "default" : "secondary"}
                              className="text-xs"
                        >
                              {node.isActive ? "Active" : "Inactive"}
                        </Badge>

                        <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                              <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                          <Button variant="ghost" className="h-8 w-8 p-0">
                                                <MoreHorizontal className="h-4 w-4" />
                                          </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                          <PermissionGate permission={SYSTEM_PERMISSIONS.TENANTS_CREATE}>
                                                <DropdownMenuItem onClick={() => onAddChild(node)}>
                                                      <Plus className="mr-2 h-4 w-4" />
                                                      Add Child
                                                </DropdownMenuItem>
                                          </PermissionGate>
                                          <PermissionGate permission={SYSTEM_PERMISSIONS.TENANTS_UPDATE}>
                                                <DropdownMenuItem onClick={() => onEdit(node)}>
                                                      <Pencil className="mr-2 h-4 w-4" />
                                                      Edit
                                                </DropdownMenuItem>
                                          </PermissionGate>
                                          <DropdownMenuSeparator />
                                          <PermissionGate permission={SYSTEM_PERMISSIONS.TENANTS_DELETE}>
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
                              {node.children.map((child) => (
                                    <TenantTreeItem
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

export function TenantsView() {
      // State
      const [viewMode, setViewMode] = useState<"tree" | "list">("tree");
      const [searchInput, setSearchInput] = useState("");

      // Dialogs
      const [createDialogOpen, setCreateDialogOpen] = useState(false);
      const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
      const [selectedNode, setSelectedNode] = useState<TenantTreeNode | null>(null);
      const [parentForNew, setParentForNew] = useState<TenantTreeNode | null>(null);

      // ViewModel
      const {
            tree,
            isLoading,
            handleDelete,
            refetch,
            isDeleting,
      } = useTenantsViewModel({
            viewMode,
            search: searchInput || undefined,
      });

      // Handlers
      const handleOpenCreate = useCallback((parent?: TenantTreeNode) => {
            setParentForNew(parent || null);
            setCreateDialogOpen(true);
      }, []);

      const handleOpenEdit = useCallback((node: TenantTreeNode) => {
            setSelectedNode(node);
            // Open edit dialog
      }, []);

      const handleOpenDelete = useCallback((node: TenantTreeNode) => {
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
                              <h1 className="text-3xl font-bold tracking-tight">Tenants</h1>
                              <p className="text-muted-foreground">
                                    Manage tenant hierarchy and organizations.
                              </p>
                        </div>
                        <div className="flex items-center gap-2">
                              <div className="flex items-center border rounded-lg p-0.5">
                                    <Button
                                          variant={viewMode === "tree" ? "secondary" : "ghost"}
                                          size="sm"
                                          onClick={() => setViewMode("tree")}
                                    >
                                          <Network className="h-4 w-4" />
                                    </Button>
                                    <Button
                                          variant={viewMode === "list" ? "secondary" : "ghost"}
                                          size="sm"
                                          onClick={() => setViewMode("list")}
                                    >
                                          <List className="h-4 w-4" />
                                    </Button>
                              </div>
                              <Button variant="outline" size="icon" onClick={refetch}>
                                    <RefreshCw className="h-4 w-4" />
                              </Button>
                              <PermissionGate permission={SYSTEM_PERMISSIONS.TENANTS_CREATE}>
                                    <Button onClick={() => handleOpenCreate()}>
                                          <Plus className="mr-2 h-4 w-4" />
                                          Create Tenant
                                    </Button>
                              </PermissionGate>
                        </div>
                  </div>

                  {/* Search */}
                  <div className="flex items-center gap-4">
                        <div className="relative flex-1 max-w-sm">
                              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input
                                    placeholder="Search tenants..."
                                    value={searchInput}
                                    onChange={(e) => setSearchInput(e.target.value)}
                                    className="pl-9"
                              />
                        </div>
                  </div>

                  {/* Tenant Tree/List */}
                  {isLoading ? (
                        <Card>
                              <CardContent className="py-8">
                                    <div className="flex items-center justify-center">
                                          <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                                    </div>
                              </CardContent>
                        </Card>
                  ) : tree.length === 0 ? (
                        <Card>
                              <CardContent className="flex flex-col items-center justify-center py-12">
                                    <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
                                    <h3 className="text-lg font-semibold mb-2">No tenants found</h3>
                                    <p className="text-muted-foreground text-center mb-4">
                                          Create your first tenant to get started with multi-tenancy.
                                    </p>
                                    <PermissionGate permission={SYSTEM_PERMISSIONS.TENANTS_CREATE}>
                                          <Button onClick={() => handleOpenCreate()}>
                                                <Plus className="mr-2 h-4 w-4" />
                                                Create Tenant
                                          </Button>
                                    </PermissionGate>
                              </CardContent>
                        </Card>
                  ) : viewMode === "tree" ? (
                        <Card>
                              <CardContent className="pt-6">
                                    {tree.map((node) => (
                                          <TenantTreeItem
                                                key={node.id}
                                                node={node}
                                                onEdit={handleOpenEdit}
                                                onDelete={handleOpenDelete}
                                                onAddChild={handleOpenCreate}
                                          />
                                    ))}
                              </CardContent>
                        </Card>
                  ) : (
                        <Card>
                              <CardContent className="pt-6">
                                    <p className="text-muted-foreground">
                                          List view coming soon...
                                    </p>
                              </CardContent>
                        </Card>
                  )}

                  {/* Create Tenant Dialog */}
                  <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                        <DialogContent className="max-w-md">
                              <DialogHeader>
                                    <DialogTitle>
                                          {parentForNew ? `Create Child Tenant` : "Create Tenant"}
                                    </DialogTitle>
                                    <DialogDescription>
                                          {parentForNew
                                                ? `Add a new child tenant under ${parentForNew.name}.`
                                                : "Add a new root tenant to the system."}
                                    </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4 py-4">
                                    <p className="text-sm text-muted-foreground">
                                          Tenant creation form coming soon...
                                    </p>
                              </div>
                        </DialogContent>
                  </Dialog>

                  {/* Delete Confirmation Dialog */}
                  <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                        <DialogContent className="max-w-sm">
                              <DialogHeader>
                                    <DialogTitle>Delete Tenant</DialogTitle>
                                    <DialogDescription>
                                          Are you sure you want to delete {selectedNode?.name}? This will
                                          also delete all child tenants. This action cannot be undone.
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
