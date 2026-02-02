/**
 * Roles View
 *
 * Main view component for role management.
 */
"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useRolesViewModel } from "../viewmodels/useRolesViewModel";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { Textarea } from "@core/ui/textarea";
import { Badge } from "@core/ui/badge";
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@core/ui/card";
import { PermissionGate } from "@core/providers/permission-provider";
import { SYSTEM_PERMISSIONS } from "@core/common/types/permissions";
import type { Role } from "../../domain/entities/Role";
import type { CreateRoleRequest, UpdateRoleRequest } from "../../domain/entities/RoleRequests";
import {
      Plus,
      MoreHorizontal,
      Pencil,
      Trash2,
      Shield,
      Search,
      RefreshCw,
      Loader2,
} from "lucide-react";
import { useDebounce } from "@core/hooks/use-validation";
import { format } from "date-fns";

// Form state interfaces
interface CreateFormState {
      name: string;
      code: string;
      description: string;
      priority: number;
}

interface EditFormState {
      name: string;
      description: string;
      priority: number;
}

const initialCreateForm: CreateFormState = {
      name: "",
      code: "",
      description: "",
      priority: 100,
};

const initialEditForm: EditFormState = {
      name: "",
      description: "",
      priority: 100,
};

export function RolesView() {
      // Navigation
      const router = useRouter();

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

      // Form states
      const [createForm, setCreateForm] = useState<CreateFormState>(initialCreateForm);
      const [editForm, setEditForm] = useState<EditFormState>(initialEditForm);

      // Debounced search
      const debouncedSearch = useDebounce(searchInput, 300);

      // ViewModel
      const {
            items: roles,
            pagination,
            loading: isLoading,
            createItem,
            updateItem,
            deleteItem,
            refreshItems: refetch,
            isCreating,
            isUpdating,
            isDeleting,
      } = useRolesViewModel({
            page,
            pageSize,
            search: debouncedSearch || undefined,
      });

      // Handlers
      const handleOpenCreate = useCallback(() => {
            setCreateForm(initialCreateForm);
            setCreateDialogOpen(true);
      }, []);

      const handleOpenEdit = useCallback((role: Role) => {
            setSelectedRole(role);
            setEditForm({
                  name: role.name,
                  description: role.description || "",
                  priority: role.priority,
            });
            setEditDialogOpen(true);
      }, []);

      const handleOpenPermissions = useCallback((role: Role) => {
            // Navigate to role detail page for permission management
            router.push(`/roles/${role.id}`);
      }, [router]);

      const handleOpenDelete = useCallback((role: Role) => {
            setSelectedRole(role);
            setDeleteDialogOpen(true);
      }, []);

      const onCreateSubmit = useCallback(async () => {
            if (!createForm.name || !createForm.code) return;

            const request: CreateRoleRequest = {
                  name: createForm.name,
                  code: createForm.code,
                  description: createForm.description || undefined,
                  priority: createForm.priority,
            };

            await createItem(request);
            setCreateDialogOpen(false);
            setCreateForm(initialCreateForm);
      }, [createForm, createItem]);

      const onEditSubmit = useCallback(async () => {
            if (!selectedRole || !editForm.name) return;

            const request: UpdateRoleRequest = {
                  name: editForm.name,
                  description: editForm.description || undefined,
                  priority: editForm.priority,
            };

            await updateItem(selectedRole.id, request);
            setEditDialogOpen(false);
            setSelectedRole(null);
      }, [selectedRole, editForm, updateItem]);

      const onDeleteConfirm = useCallback(async () => {
            if (!selectedRole) return;
            await deleteItem(selectedRole.id);
            setDeleteDialogOpen(false);
            setSelectedRole(null);
      }, [deleteItem, selectedRole]);

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
                                    <Button onClick={handleOpenCreate}>
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
                        <Badge variant="secondary">{pagination.itemsCount} roles</Badge>
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
                                          <Button onClick={handleOpenCreate}>
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
                                          Add a new role to the system. You can assign permissions after creating.
                                    </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                          <Label htmlFor="create-name">Name *</Label>
                                          <Input
                                                id="create-name"
                                                placeholder="e.g., Content Manager"
                                                value={createForm.name}
                                                onChange={(e) =>
                                                      setCreateForm((prev) => ({ ...prev, name: e.target.value }))
                                                }
                                          />
                                    </div>
                                    <div className="space-y-2">
                                          <Label htmlFor="create-code">Code *</Label>
                                          <Input
                                                id="create-code"
                                                placeholder="e.g., content-manager"
                                                value={createForm.code}
                                                onChange={(e) =>
                                                      setCreateForm((prev) => ({
                                                            ...prev,
                                                            code: e.target.value.toLowerCase().replace(/\s+/g, "-"),
                                                      }))
                                                }
                                          />
                                          <p className="text-xs text-muted-foreground">
                                                Unique identifier for this role. Cannot be changed later.
                                          </p>
                                    </div>
                                    <div className="space-y-2">
                                          <Label htmlFor="create-description">Description</Label>
                                          <Textarea
                                                id="create-description"
                                                placeholder="Optional description of this role..."
                                                value={createForm.description}
                                                onChange={(e) =>
                                                      setCreateForm((prev) => ({
                                                            ...prev,
                                                            description: e.target.value,
                                                      }))
                                                }
                                                rows={3}
                                          />
                                    </div>
                                    <div className="space-y-2">
                                          <Label htmlFor="create-priority">Priority</Label>
                                          <Input
                                                id="create-priority"
                                                type="number"
                                                min={1}
                                                max={1000}
                                                placeholder="100"
                                                value={createForm.priority}
                                                onChange={(e) =>
                                                      setCreateForm((prev) => ({
                                                            ...prev,
                                                            priority: parseInt(e.target.value) || 100,
                                                      }))
                                                }
                                          />
                                          <p className="text-xs text-muted-foreground">
                                                Higher priority roles take precedence in permission conflicts.
                                          </p>
                                    </div>
                              </div>
                              <DialogFooter>
                                    <Button
                                          variant="outline"
                                          onClick={() => setCreateDialogOpen(false)}
                                          disabled={isCreating}
                                    >
                                          Cancel
                                    </Button>
                                    <Button
                                          onClick={onCreateSubmit}
                                          disabled={!createForm.name || !createForm.code || isCreating}
                                    >
                                          {isCreating ? (
                                                <>
                                                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                      Creating...
                                                </>
                                          ) : (
                                                "Create Role"
                                          )}
                                    </Button>
                              </DialogFooter>
                        </DialogContent>
                  </Dialog>

                  {/* Edit Role Dialog */}
                  <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                        <DialogContent className="max-w-md">
                              <DialogHeader>
                                    <DialogTitle>Edit Role</DialogTitle>
                                    <DialogDescription>
                                          Update role details for &quot;{selectedRole?.name}&quot;.
                                    </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                          <Label htmlFor="edit-name">Name *</Label>
                                          <Input
                                                id="edit-name"
                                                placeholder="Role name"
                                                value={editForm.name}
                                                onChange={(e) =>
                                                      setEditForm((prev) => ({ ...prev, name: e.target.value }))
                                                }
                                          />
                                    </div>
                                    <div className="space-y-2">
                                          <Label htmlFor="edit-description">Description</Label>
                                          <Textarea
                                                id="edit-description"
                                                placeholder="Optional description..."
                                                value={editForm.description}
                                                onChange={(e) =>
                                                      setEditForm((prev) => ({
                                                            ...prev,
                                                            description: e.target.value,
                                                      }))
                                                }
                                                rows={3}
                                          />
                                    </div>
                                    <div className="space-y-2">
                                          <Label htmlFor="edit-priority">Priority</Label>
                                          <Input
                                                id="edit-priority"
                                                type="number"
                                                min={1}
                                                max={1000}
                                                value={editForm.priority}
                                                onChange={(e) =>
                                                      setEditForm((prev) => ({
                                                            ...prev,
                                                            priority: parseInt(e.target.value) || 100,
                                                      }))
                                                }
                                          />
                                    </div>
                              </div>
                              <DialogFooter>
                                    <Button
                                          variant="outline"
                                          onClick={() => setEditDialogOpen(false)}
                                          disabled={isUpdating}
                                    >
                                          Cancel
                                    </Button>
                                    <Button
                                          onClick={onEditSubmit}
                                          disabled={!editForm.name || isUpdating}
                                    >
                                          {isUpdating ? (
                                                <>
                                                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                      Saving...
                                                </>
                                          ) : (
                                                "Save Changes"
                                          )}
                                    </Button>
                              </DialogFooter>
                        </DialogContent>
                  </Dialog>

                  {/* Permissions Dialog */}
                  <Dialog open={permissionsDialogOpen} onOpenChange={setPermissionsDialogOpen}>
                        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                              <DialogHeader>
                                    <DialogTitle>Manage Permissions</DialogTitle>
                                    <DialogDescription>
                                          Configure permissions for &quot;{selectedRole?.name}&quot;.
                                    </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4 py-4">
                                    <p className="text-sm text-muted-foreground">
                                          Current permissions assigned to this role:
                                    </p>
                                    {selectedRole?.permissions && selectedRole.permissions.length > 0 ? (
                                          <div className="flex flex-wrap gap-2">
                                                {selectedRole.permissions.map((p) => (
                                                      <Badge key={p.permissionId} variant="outline">
                                                            {p.permissionCode}
                                                      </Badge>
                                                ))}
                                          </div>
                                    ) : (
                                          <p className="text-sm text-muted-foreground italic">
                                                No permissions assigned yet.
                                          </p>
                                    )}
                                    <div className="pt-4 border-t">
                                          <p className="text-sm text-muted-foreground">
                                                Full permission management UI will be available in Phase B.
                                          </p>
                                    </div>
                              </div>
                              <DialogFooter>
                                    <Button variant="outline" onClick={() => setPermissionsDialogOpen(false)}>
                                          Close
                                    </Button>
                              </DialogFooter>
                        </DialogContent>
                  </Dialog>

                  {/* Delete Confirmation Dialog */}
                  <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                        <DialogContent className="max-w-sm">
                              <DialogHeader>
                                    <DialogTitle>Delete Role</DialogTitle>
                                    <DialogDescription>
                                          Are you sure you want to delete &quot;{selectedRole?.name}&quot;? This will
                                          remove this role from all admins who have it. This action cannot be undone.
                                    </DialogDescription>
                              </DialogHeader>
                              <DialogFooter>
                                    <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                                          Cancel
                                    </Button>
                                    <Button
                                          variant="destructive"
                                          onClick={onDeleteConfirm}
                                          disabled={isDeleting}
                                    >
                                          {isDeleting ? (
                                                <>
                                                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                      Deleting...
                                                </>
                                          ) : (
                                                "Delete"
                                          )}
                                    </Button>
                              </DialogFooter>
                        </DialogContent>
                  </Dialog>
            </div>
      );
}
