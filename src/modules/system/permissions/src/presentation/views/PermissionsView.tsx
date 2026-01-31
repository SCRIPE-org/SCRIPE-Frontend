/**
 * Permissions View
 *
 * Main view component for permission management with category grouping.
 */
"use client";

import { useState, useCallback } from "react";
import { usePermissionsViewModel } from "../viewmodels/usePermissionsViewModel";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { Badge } from "@core/ui/badge";
import {
      Accordion,
      AccordionContent,
      AccordionItem,
      AccordionTrigger,
} from "@core/ui/accordion";
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
} from "@core/ui/dropdown-menu";
import { Card, CardContent, CardHeader, CardTitle } from "@core/ui/card";
import { PermissionGate } from "@core/providers/permission-provider";
import { SYSTEM_PERMISSIONS } from "@core/common/types/permissions";
import type { Permission } from "../../domain/entities/Permission";
import {
      Plus,
      MoreHorizontal,
      Pencil,
      Trash2,
      Key,
      Search,
      RefreshCw,
      Filter,
} from "lucide-react";
import { useDebounce } from "@core/hooks/use-validation";

export function PermissionsView() {
      // State
      const [searchInput, setSearchInput] = useState("");
      const [categoryFilter, setCategoryFilter] = useState<string | undefined>(undefined);

      // Dialogs
      const [createDialogOpen, setCreateDialogOpen] = useState(false);
      const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
      const [selectedPermission, setSelectedPermission] = useState<Permission | null>(null);

      // Debounced search
      const debouncedSearch = useDebounce(searchInput, 300);

      // ViewModel
      const {
            groupedPermissions,
            categories,
            totalCount,
            isLoading,
            handleDelete,
            refetch,
            isDeleting,
      } = usePermissionsViewModel({
            search: debouncedSearch || undefined,
            category: categoryFilter,
      });

      // Handlers
      const handleOpenDelete = useCallback((permission: Permission) => {
            setSelectedPermission(permission);
            setDeleteDialogOpen(true);
      }, []);

      const onDeleteConfirm = useCallback(async () => {
            if (!selectedPermission) return;
            await handleDelete(selectedPermission.id);
            setDeleteDialogOpen(false);
            setSelectedPermission(null);
      }, [handleDelete, selectedPermission]);

      return (
            <div className="space-y-6">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                        <div>
                              <h1 className="text-3xl font-bold tracking-tight">Permissions</h1>
                              <p className="text-muted-foreground">
                                    View and manage system permissions.
                              </p>
                        </div>
                        <div className="flex items-center gap-2">
                              <Button variant="outline" size="icon" onClick={() => refetch()}>
                                    <RefreshCw className="h-4 w-4" />
                              </Button>
                              <PermissionGate permission={SYSTEM_PERMISSIONS.PERMISSIONS_CREATE}>
                                    <Button onClick={() => setCreateDialogOpen(true)}>
                                          <Plus className="mr-2 h-4 w-4" />
                                          Create Permission
                                    </Button>
                              </PermissionGate>
                        </div>
                  </div>

                  {/* Search & Filters */}
                  <div className="flex items-center gap-4">
                        <div className="relative flex-1 max-w-sm">
                              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input
                                    placeholder="Search permissions..."
                                    value={searchInput}
                                    onChange={(e) => setSearchInput(e.target.value)}
                                    className="pl-9"
                              />
                        </div>
                        <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                    <Button variant="outline">
                                          <Filter className="mr-2 h-4 w-4" />
                                          {categoryFilter || "All Categories"}
                                    </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent>
                                    <DropdownMenuItem onClick={() => setCategoryFilter(undefined)}>
                                          All Categories
                                    </DropdownMenuItem>
                                    {categories.map((cat) => (
                                          <DropdownMenuItem key={cat} onClick={() => setCategoryFilter(cat)}>
                                                {cat}
                                          </DropdownMenuItem>
                                    ))}
                              </DropdownMenuContent>
                        </DropdownMenu>
                        <Badge variant="secondary">{totalCount} permissions</Badge>
                  </div>

                  {/* Permissions Accordion */}
                  {isLoading ? (
                        <Card>
                              <CardContent className="py-8">
                                    <div className="flex items-center justify-center">
                                          <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                                    </div>
                              </CardContent>
                        </Card>
                  ) : groupedPermissions.length === 0 ? (
                        <Card>
                              <CardContent className="flex flex-col items-center justify-center py-12">
                                    <Key className="h-12 w-12 text-muted-foreground mb-4" />
                                    <h3 className="text-lg font-semibold mb-2">No permissions found</h3>
                                    <p className="text-muted-foreground text-center mb-4">
                                          {searchInput || categoryFilter
                                                ? "Try adjusting your filters."
                                                : "Create your first permission to get started."}
                                    </p>
                              </CardContent>
                        </Card>
                  ) : (
                        <Card>
                              <CardContent className="pt-6">
                                    <Accordion type="multiple" className="w-full" defaultValue={groupedPermissions.map(g => g.category)}>
                                          {groupedPermissions.map((group) => (
                                                <AccordionItem key={group.category} value={group.category}>
                                                      <AccordionTrigger className="hover:no-underline">
                                                            <div className="flex items-center gap-3">
                                                                  <Key className="h-4 w-4 text-muted-foreground" />
                                                                  <span className="font-semibold">{group.category}</span>
                                                                  <Badge variant="secondary" className="ml-2">
                                                                        {group.permissions.length}
                                                                  </Badge>
                                                            </div>
                                                      </AccordionTrigger>
                                                      <AccordionContent>
                                                            <div className="rounded-md border">
                                                                  <table className="w-full">
                                                                        <thead>
                                                                              <tr className="border-b bg-muted/50">
                                                                                    <th className="px-4 py-2 text-left text-sm font-medium">
                                                                                          Code
                                                                                    </th>
                                                                                    <th className="px-4 py-2 text-left text-sm font-medium">
                                                                                          Resource
                                                                                    </th>
                                                                                    <th className="px-4 py-2 text-left text-sm font-medium">
                                                                                          Action
                                                                                    </th>
                                                                                    <th className="px-4 py-2 text-left text-sm font-medium">
                                                                                          Description
                                                                                    </th>
                                                                                    <th className="px-4 py-2 text-left text-sm font-medium">
                                                                                          Scope
                                                                                    </th>
                                                                                    <th className="px-4 py-2 text-right text-sm font-medium">
                                                                                          Actions
                                                                                    </th>
                                                                              </tr>
                                                                        </thead>
                                                                        <tbody>
                                                                              {group.permissions.map((permission) => (
                                                                                    <tr
                                                                                          key={permission.id}
                                                                                          className="border-b last:border-0 hover:bg-muted/25"
                                                                                    >
                                                                                          <td className="px-4 py-3">
                                                                                                <code className="text-sm bg-muted px-2 py-1 rounded">
                                                                                                      {permission.code}
                                                                                                </code>
                                                                                          </td>
                                                                                          <td className="px-4 py-3 text-sm">
                                                                                                {permission.resource}
                                                                                          </td>
                                                                                          <td className="px-4 py-3 text-sm">
                                                                                                {permission.action}
                                                                                          </td>
                                                                                          <td className="px-4 py-3 text-sm text-muted-foreground max-w-xs truncate">
                                                                                                {permission.description || "-"}
                                                                                          </td>
                                                                                          <td className="px-4 py-3">
                                                                                                <Badge variant="outline" className="text-xs">
                                                                                                      {permission.defaultScope}
                                                                                                </Badge>
                                                                                          </td>
                                                                                          <td className="px-4 py-3 text-right">
                                                                                                <DropdownMenu>
                                                                                                      <DropdownMenuTrigger asChild>
                                                                                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                                                                                  <MoreHorizontal className="h-4 w-4" />
                                                                                                            </Button>
                                                                                                      </DropdownMenuTrigger>
                                                                                                      <DropdownMenuContent align="end">
                                                                                                            <PermissionGate
                                                                                                                  permission={SYSTEM_PERMISSIONS.PERMISSIONS_UPDATE}
                                                                                                            >
                                                                                                                  <DropdownMenuItem>
                                                                                                                        <Pencil className="mr-2 h-4 w-4" />
                                                                                                                        Edit
                                                                                                                  </DropdownMenuItem>
                                                                                                            </PermissionGate>
                                                                                                            <PermissionGate
                                                                                                                  permission={SYSTEM_PERMISSIONS.PERMISSIONS_DELETE}
                                                                                                            >
                                                                                                                  <DropdownMenuItem
                                                                                                                        className="text-destructive"
                                                                                                                        onClick={() => handleOpenDelete(permission)}
                                                                                                                  >
                                                                                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                                                                                        Delete
                                                                                                                  </DropdownMenuItem>
                                                                                                            </PermissionGate>
                                                                                                      </DropdownMenuContent>
                                                                                                </DropdownMenu>
                                                                                          </td>
                                                                                    </tr>
                                                                              ))}
                                                                        </tbody>
                                                                  </table>
                                                            </div>
                                                      </AccordionContent>
                                                </AccordionItem>
                                          ))}
                                    </Accordion>
                              </CardContent>
                        </Card>
                  )}

                  {/* Create Permission Dialog */}
                  <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                        <DialogContent className="max-w-md">
                              <DialogHeader>
                                    <DialogTitle>Create Permission</DialogTitle>
                                    <DialogDescription>
                                          Add a new permission to the system.
                                    </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4 py-4">
                                    <p className="text-sm text-muted-foreground">
                                          Permission creation form coming soon...
                                    </p>
                              </div>
                        </DialogContent>
                  </Dialog>

                  {/* Delete Confirmation Dialog */}
                  <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                        <DialogContent className="max-w-sm">
                              <DialogHeader>
                                    <DialogTitle>Delete Permission</DialogTitle>
                                    <DialogDescription>
                                          Are you sure you want to delete {selectedPermission?.code}? This
                                          action cannot be undone.
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
