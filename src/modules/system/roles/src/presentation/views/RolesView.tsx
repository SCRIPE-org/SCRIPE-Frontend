/**
 * Roles View
 *
 * Main view component for role management.
 * Refactored with extracted components and full localization via useI18n.
 */
"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@core/providers/i18n-provider";
import { useRolesViewModel } from "../viewmodels/useRolesViewModel";
import { Input } from "@core/ui/input";
import { Badge } from "@core/ui/badge";
import { Search } from "lucide-react";
import { useDebounce } from "@core/hooks/use-validation";
import type { Role } from "../../domain/entities/Role";
import type { CreateRoleRequest, UpdateRoleRequest } from "../../domain/entities/RoleRequests";
import {
      RolesHeader,
      RoleCard,
      RoleCardSkeletonGrid,
      RolesEmptyState,
      CreateRoleDialog,
      EditRoleDialog,
      DeleteRoleDialog,
      type CreateRoleFormState,
      type EditRoleFormState,
} from "../components";

const initialCreateForm: CreateRoleFormState = {
      name: "",
      code: "",
      description: "",
      priority: 100,
};

const initialEditForm: EditRoleFormState = {
      name: "",
      description: "",
      priority: 100,
};

export function RolesView() {
      const { t } = useI18n();
      const router = useRouter();

      // State
      const [page, setPage] = useState(1);
      const [pageSize, setPageSize] = useState(20);
      const [searchInput, setSearchInput] = useState("");

      // Dialogs
      const [createDialogOpen, setCreateDialogOpen] = useState(false);
      const [editDialogOpen, setEditDialogOpen] = useState(false);
      const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
      const [selectedRole, setSelectedRole] = useState<Role | null>(null);

      // Form states
      const [createForm, setCreateForm] = useState<CreateRoleFormState>(initialCreateForm);
      const [editForm, setEditForm] = useState<EditRoleFormState>(initialEditForm);

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

      const handleOpenPermissions = useCallback(
            (role: Role) => {
                  router.push(`/roles/${role.id}`);
            },
            [router]
      );

      const handleOpenDelete = useCallback((role: Role) => {
            setSelectedRole(role);
            setDeleteDialogOpen(true);
      }, []);

      const handleCloneRole = useCallback(
            async (role: Role) => {
                  const cloneRequest: CreateRoleRequest = {
                        name: `${role.name} (Copy)`,
                        code: `${role.code}_COPY`,
                        description: role.description || undefined,
                        priority: role.priority,
                  };
                  await createItem(cloneRequest);
            },
            [createItem]
      );

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
                  <RolesHeader
                        title={t("roles.title")}
                        description={t("roles.description")}
                        createLabel={t("roles.createRole")}
                        onRefresh={refetch}
                        onCreate={handleOpenCreate}
                  />

                  {/* Search & Filters */}
                  <div className="flex items-center gap-4">
                        <div className="relative flex-1 max-w-sm">
                              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input
                                    placeholder={t("roles.searchRoles")}
                                    value={searchInput}
                                    onChange={(e) => setSearchInput(e.target.value)}
                                    className="pl-9"
                              />
                        </div>
                        <Badge variant="secondary">
                              {t("roles.totalRoles", { count: pagination.itemsCount })}
                        </Badge>
                  </div>

                  {/* Roles Grid */}
                  {isLoading ? (
                        <RoleCardSkeletonGrid count={6} />
                  ) : roles.length === 0 ? (
                        <RolesEmptyState hasSearch={!!searchInput} onCreate={handleOpenCreate} />
                  ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              {roles.map((role) => (
                                    <RoleCard
                                          key={role.id}
                                          role={role}
                                          onEdit={() => handleOpenEdit(role)}
                                          onManagePermissions={() => handleOpenPermissions(role)}
                                          onClone={() => handleCloneRole(role)}
                                          onDelete={() => handleOpenDelete(role)}
                                          isCloning={isCreating}
                                    />
                              ))}
                        </div>
                  )}

                  {/* Create Role Dialog */}
                  <CreateRoleDialog
                        open={createDialogOpen}
                        onOpenChange={setCreateDialogOpen}
                        form={createForm}
                        onFormChange={setCreateForm}
                        onSubmit={onCreateSubmit}
                        isSubmitting={isCreating}
                  />

                  {/* Edit Role Dialog */}
                  <EditRoleDialog
                        open={editDialogOpen}
                        onOpenChange={setEditDialogOpen}
                        role={selectedRole}
                        form={editForm}
                        onFormChange={setEditForm}
                        onSubmit={onEditSubmit}
                        isSubmitting={isUpdating}
                  />

                  {/* Delete Role Dialog */}
                  <DeleteRoleDialog
                        open={deleteDialogOpen}
                        onOpenChange={setDeleteDialogOpen}
                        role={selectedRole}
                        onConfirm={onDeleteConfirm}
                        isDeleting={isDeleting}
                  />
            </div>
      );
}
