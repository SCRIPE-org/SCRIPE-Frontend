/**
 * Roles View
 *
 * Main view component for role management.
 */
"use client";

import { useState, useCallback } from "react";
import { useRolesViewModel } from "../viewmodels/useRolesViewModel";
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@core/ui/card";
import { PermissionGate } from "@core/providers/permission-provider";
import { SYSTEM_PERMISSIONS } from "@core/common/types/permissions";
import type { Role } from "../../domain/entities/Role";
import {
      Plus,
      MoreHorizontal,
      Pencil,
      Trash2,
      Shield,
      Search,
      RefreshCw,
      Users,
} from "lucide-react";
import { useDebounce } from "@core/hooks/use-validation";
import { format } from "date-fns";

export function RolesView() {
      // State
      const [page, setPage] = useState(1);
      const [pageSize, setPageSize] = useState(20);
      const [searchInput, setSearchInput] = useState("");

      // Dialogs
      const [createDialogOpen, setCreateDialogOpen] = useState(false);
      const [editDialogOpen, setEditDialogOpen] = useState(false);
      const [permissionsDialogOpen, setPermissionsDialogOpen] = useState(false);
      const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
      const [selectedRole, setSelectedRole] = useState<Role | null>(null);

      // Debounced search
      const debouncedSearch = useDebounce(searchInput, 300);

      // ViewModel
      const {
            roles,
            totalCount,
            isLoading,
            handleCreate,
            handleUpdate,
            handleDelete,
            refetch,
            isCreating,
            isUpdating,
            isDeleting,
      } = useRolesViewModel({
            page,
            pageSize,
            search: debouncedSearch || undefined,
      });

      // Handlers
      const handleOpenEdit = useCallback((role: Role) => {
            setSelectedRole(role);
            setEditDialogOpen(true);
      }, []);

      const handleOpenPermissions = useCallback((role: Role) => {
            setSelectedRole(role);
            setPermissionsDialogOpen(true);
      }, []);

      const handleOpenDelete = useCallback((role: Role) => {
            setSelectedRole(role);
            setDeleteDialogOpen(true);
      }, []);

      const onDeleteConfirm = useCallback(async () => {
            if (!selectedRole) return;
            await handleDelete(selectedRole.id);
            setDeleteDialogOpen(false);
            setSelectedRole(null);
      }, [handleDelete, selectedRole]);

      return (
            <div className="space-y-6">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                        <div>
                              <h1 className="text-3xl font-bold tracking-tight">Roles</h1>
                              <p className="text-muted-foreground">
                                    Manage roles and their permissions.
                              </p>
                        </div>
                        <div className="flex items-center gap-2">
                              <Button variant="outline" size="icon" onClick={() => refetch()}>
                                    <RefreshCw className="h-4 w-4" />
                              </Button>
                              <PermissionGate permission={SYSTEM_PERMISSIONS.ROLES_CREATE}>
                                    <Button onClick={() => setCreateDialogOpen(true)}>
                                          <Plus className="mr-2 h-4 w-4" />
                                          Create Role
                                    </Button>
                              </PermissionGate>
                        </div>
                  </div>

                  {/* Search & Filters */}
                  <div className="flex items-center gap-4">
                        <div className="relative flex-1 max-w-sm">
                              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input
                                    placeholder="Search roles..."
                                    value={searchInput}
                                    onChange={(e) => setSearchInput(e.target.value)}
                                    className="pl-9"
                              />
                        </div>
                        <Badge variant="secondary">{totalCount} roles</Badge>
                  </div>

                  {/* Roles Grid */}
                  {isLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              {[1, 2, 3, 4, 5, 6].map((i) => (
                                    <Card key={i} className="animate-pulse">
                                          <CardHeader className="pb-2">
                                                <div className="h-6 bg-muted rounded w-1/2" />
                                                <div className="h-4 bg-muted rounded w-1/3" />
                                          </CardHeader>
                                          <CardContent>
                                                <div className="h-4 bg-muted rounded w-full mb-2" />
                                                <div className="h-4 bg-muted rounded w-2/3" />
                                          </CardContent>
                                    </Card>
                              ))}
                        </div>
                  ) : roles.length === 0 ? (
                        <Card>
                              <CardContent className="flex flex-col items-center justify-center py-12">
                                    <Shield className="h-12 w-12 text-muted-foreground mb-4" />
                                    <h3 className="text-lg font-semibold mb-2">No roles found</h3>
                                    <p className="text-muted-foreground text-center mb-4">
                                          {searchInput
                                                ? "Try adjusting your search terms."
                                                : "Create your first role to get started."}
                                    </p>
                                    <PermissionGate permission={SYSTEM_PERMISSIONS.ROLES_CREATE}>
                                          <Button onClick={() => setCreateDialogOpen(true)}>
                                                <Plus className="mr-2 h-4 w-4" />
                                                Create Role
                                          </Button>
                                    </PermissionGate>
                              </CardContent>
                        </Card>
                  ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              {roles.map((role) => (
                                    <Card key={role.id} className="group relative">
                                          <CardHeader className="pb-2">
                                                <div className="flex items-start justify-between">
                                                      <div>
                                                            <CardTitle className="flex items-center gap-2">
                                                                  {role.name}
                                                                  {role.isSystem && (
                                                                        <Badge variant="outline" className="text-xs">
                                                                              System
                                                                        </Badge>
                                                                  )}
                                                            </CardTitle>
                                                            <CardDescription className="font-mono text-xs">
                                                                  {role.code}
                                                            </CardDescription>
                                                      </div>
                                                      <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                  <Button
                                                                        variant="ghost"
                                                                        className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                                                  >
                                                                        <MoreHorizontal className="h-4 w-4" />
                                                                  </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                  <PermissionGate permission={SYSTEM_PERMISSIONS.ROLES_UPDATE}>
                                                                        <DropdownMenuItem
                                                                              onClick={() => handleOpenEdit(role)}
                                                                              disabled={role.isSystem}
                                                                        >
                                                                              <Pencil className="mr-2 h-4 w-4" />
                                                                              Edit
                                                                        </DropdownMenuItem>
                                                                  </PermissionGate>
                                                                  <PermissionGate permission={SYSTEM_PERMISSIONS.ROLES_MANAGE_PERMISSIONS}>
                                                                        <DropdownMenuItem onClick={() => handleOpenPermissions(role)}>
                                                                              <Shield className="mr-2 h-4 w-4" />
                                                                              Manage Permissions
                                                                        </DropdownMenuItem>
                                                                  </PermissionGate>
                                                                  <DropdownMenuSeparator />
                                                                  <PermissionGate permission={SYSTEM_PERMISSIONS.ROLES_DELETE}>
                                                                        <DropdownMenuItem
                                                                              className="text-destructive"
                                                                              onClick={() => handleOpenDelete(role)}
                                                                              disabled={role.isSystem}
                                                                        >
                                                                              <Trash2 className="mr-2 h-4 w-4" />
                                                                              Delete
                                                                        </DropdownMenuItem>
                                                                  </PermissionGate>
                                                            </DropdownMenuContent>
                                                      </DropdownMenu>
                                                </div>
                                          </CardHeader>
                                          <CardContent>
                                                {role.description && (
                                                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                                                            {role.description}
                                                      </p>
                                                )}
                                                <div className="flex items-center justify-between text-sm">
                                                      <div className="flex items-center gap-1 text-muted-foreground">
                                                            <Shield className="h-4 w-4" />
                                                            <span>{role.permissionCount} permissions</span>
                                                      </div>
                                                      {role.tenantName && (
                                                            <Badge variant="secondary" className="text-xs">
                                                                  {role.tenantName}
                                                            </Badge>
                                                      )}
                                                </div>
                                                <div className="mt-2 text-xs text-muted-foreground">
                                                      Created {format(new Date(role.createdAt), "MMM dd, yyyy")}
                                                </div>
                                          </CardContent>
                                    </Card>
                              ))}
                        </div>
                  )}

                  {/* Create Role Dialog */}
                  <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                        <DialogContent className="max-w-md">
                              <DialogHeader>
                                    <DialogTitle>Create Role</DialogTitle>
                                    <DialogDescription>
                                          Add a new role to the system.
                                    </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4 py-4">
                                    <p className="text-sm text-muted-foreground">
                                          Role creation form coming soon...
                                    </p>
                              </div>
                        </DialogContent>
                  </Dialog>

                  {/* Permissions Dialog */}
                  <Dialog open={permissionsDialogOpen} onOpenChange={setPermissionsDialogOpen}>
                        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                              <DialogHeader>
                                    <DialogTitle>Manage Permissions</DialogTitle>
                                    <DialogDescription>
                                          Configure permissions for {selectedRole?.name}.
                                    </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4 py-4">
                                    <p className="text-sm text-muted-foreground">
                                          Permission assignment UI coming soon...
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                          {selectedRole?.permissions.map((p) => (
                                                <Badge key={p.permissionId} variant="outline">
                                                      {p.permissionCode}
                                                </Badge>
                                          ))}
                                    </div>
                              </div>
                        </DialogContent>
                  </Dialog>

                  {/* Delete Confirmation Dialog */}
                  <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                        <DialogContent className="max-w-sm">
                              <DialogHeader>
                                    <DialogTitle>Delete Role</DialogTitle>
                                    <DialogDescription>
                                          Are you sure you want to delete {selectedRole?.name}? This action
                                          cannot be undone.
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
