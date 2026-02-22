/**
 * User Groups List ViewModel
 *
 * Orchestrates the user groups list page.
 * Uses useCrudViewModel for standard CRUD operations.
 */
"use client";

import { useCrudViewModel } from "@core/crud/hooks/useCrudViewModel";
import { systemContainer } from "@modules/system/di";
import type { UserGroupProps } from "../../domain/entities/UserGroup";
import type { CreateUserGroupRequest, UpdateUserGroupRequest } from "../../domain/entities/UserGroupRequests";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEnhancedToast } from "@core/hooks/use-enhanced-toast";
import { useCallback } from "react";

export const userGroupKeys = {
      all: ["user-groups"] as const,
      list: (filters: Record<string, unknown>) => [...userGroupKeys.all, "list", filters] as const,
      detail: (id: string) => [...userGroupKeys.all, "detail", id] as const,
};

// Flat list-item shape expected by GenericCrudView (must have { id: string })
export interface UserGroupListItem {
      id: string;
      nameEn: string;
      nameAr: string;
      code: string;
      descriptionEn?: string;
      descriptionAr?: string;
      tenantId: string;
      tenantName?: string;
      isActive: boolean;
      memberCount: number;
      roleCount: number;
      createdAt: string;
}

export function useUserGroupsViewModel(options?: { useMyTenant?: boolean; tenantId?: string }) {
      const repo = systemContainer.userGroupRepository;
      const { useMyTenant, tenantId } = options || {};
      const queryClient = useQueryClient();
      const { success, error: toastError } = useEnhancedToast();

      const vm = useCrudViewModel<UserGroupListItem, CreateUserGroupRequest, UpdateUserGroupRequest>(
            [...userGroupKeys.all, useMyTenant ? "my-tenant" : tenantId || "all"],
            {
                  getAll: async (params) => {
                        const payload = {
                              page: params.page ?? 1,
                              pageSize: params.pageSize ?? 10,
                              search: params.search as string | undefined,
                              tenantId,
                        };
                        const result = useMyTenant ? await repo.getMyTenantGroups(payload) : await repo.getAll(payload);
                        return {
                              items: result.items.map((g) => ({
                                    id: g.id,
                                    nameEn: g.nameEn,
                                    nameAr: g.nameAr,
                                    code: g.code,
                                    descriptionEn: g.descriptionEn,
                                    descriptionAr: g.descriptionAr,
                                    tenantId: g.tenantId,
                                    tenantName: g.tenantName,
                                    isActive: g.isActive,
                                    memberCount: g.memberCount,
                                    roleCount: g.roleCount,
                                    createdAt: g.createdAt,
                              })),
                              pagination: {
                                    itemsCount: result.totalCount,
                                    page: result.page,
                                    pageSize: result.pageSize,
                                    pagesCount: result.totalPages,
                              },
                        };
                  },
                  create: async (data: CreateUserGroupRequest) => {
                        const id = await repo.create(data);
                        // Return a placeholder item — list will be refreshed
                        return { id } as any;
                  },
                  update: async (id: string, data: UpdateUserGroupRequest) => {
                        await repo.update(id, data);
                        return { id } as any;
                  },
                  delete: async (id: string) => {
                        await repo.delete(id);
                  },
            }
      );

      const handleRoleSearch = async (query: string) => {
            try {
                  const result = useMyTenant
                        ? await systemContainer.roleRepository.getMyTenantRoles({ search: query, page: 1, pageSize: 20 })
                        : await systemContainer.roleRepository.getAll({ search: query, page: 1, pageSize: 20, tenantId });
                  return (result.items || []).map((r) => ({
                        value: r.id,
                        label: r.nameEn || r.code,
                  }));
            } catch {
                  return [];
            }
      };

      function getConfigBase(t: any) {
            return {
                  createFields: [
                        { name: "roleIds", label: t("userGroups.roles") || "Roles", type: "multi-select" as const, placeholder: t("roles.selectPlaceholder") || "Select roles...", searchPlaceholder: t("roles.search") || "Search roles...", required: true, onServerSearch: handleRoleSearch, searchType: "server" as const, noResultsText: t("roles.noResults") || "No roles found" },
                        { name: "nameEn", label: t("userGroups.nameEn") || "Name (EN)", placeholder: t("userGroups.nameEnPlaceholder"), type: "text" as const, required: true },
                        { name: "nameAr", label: t("userGroups.nameAr") || "Name (AR)", placeholder: t("userGroups.nameArPlaceholder"), type: "text" as const, required: true },
                        { name: "code", label: t("userGroups.code") || "Code", placeholder: t("userGroups.codePlaceholder"), description: t("userGroups.codeHint"), type: "text" as const, required: true },
                        { name: "descriptionEn", label: t("userGroups.descriptionEn") || "Description (EN)", placeholder: t("userGroups.descEnPlaceholder"), type: "textarea" as const },
                        { name: "descriptionAr", label: t("userGroups.descriptionAr") || "Description (AR)", placeholder: t("userGroups.descArPlaceholder"), type: "textarea" as const },
                  ],
                  editFields: [
                        { name: "roleIds", label: t("userGroups.roles") || "Roles", type: "multi-select" as const, placeholder: t("roles.selectPlaceholder") || "Select roles...", searchPlaceholder: t("roles.search") || "Search roles...", required: true, onServerSearch: handleRoleSearch, searchType: "server" as const, noResultsText: t("roles.noResults") || "No roles found" },
                        { name: "nameEn", label: t("userGroups.nameEn") || "Name (EN)", placeholder: t("userGroups.nameEnPlaceholder"), type: "text" as const, required: true },
                        { name: "nameAr", label: t("userGroups.nameAr") || "Name (AR)", placeholder: t("userGroups.nameArPlaceholder"), type: "text" as const, required: true },
                        { name: "descriptionEn", label: t("userGroups.descriptionEn") || "Description (EN)", placeholder: t("userGroups.descEnPlaceholder"), type: "textarea" as const },
                        { name: "descriptionAr", label: t("userGroups.descriptionAr") || "Description (AR)", placeholder: t("userGroups.descArPlaceholder"), type: "textarea" as const },
                        { name: "isActive", label: t("common.status") || "Active", type: "switch" as const },
                  ],
                  createInitialValues: {
                        nameEn: "",
                        nameAr: "",
                        code: "",
                        descriptionEn: "",
                        descriptionAr: "",
                        roleIds: [] as string[],
                  },
                  editInitialValues: (item: any) => ({
                        id: item.id,
                        nameEn: item.nameEn,
                        nameAr: item.nameAr,
                        descriptionEn: item.descriptionEn ?? "",
                        descriptionAr: item.descriptionAr ?? "",
                        roleIds: item.roles?.map((r: any) => r.roleId) || [], // Assuming it will be mapped correctly if we fetch details
                        isActive: item.isActive,
                  }),
                  getItemDisplayName: (item: UserGroupListItem) => item.nameEn || item.code,
                  deleteService: async (id: string) => {
                        await repo.delete(id);
                  },
                  permissions: {
                        view: "user_groups.view",
                        create: "user_groups.create",
                        update: "user_groups.update",
                        delete: "user_groups.delete",
                  },
            };
      }

      const handleToggleActive = useCallback(
            async (id: string, isActive: boolean) => {
                  try {
                        if (isActive) {
                              await repo.bulkActivate([id]);
                        } else {
                              await repo.bulkDeactivate([id]);
                        }
                        queryClient.invalidateQueries({ queryKey: userGroupKeys.all });
                        success({
                              title: isActive ? "Group Activated" : "Group Deactivated",
                              description: `User group has been ${isActive ? "activated" : "deactivated"}.`,
                        });
                  } catch (err: any) {
                        toastError({ title: "Error", description: err.message });
                  }
            },
            [repo, queryClient, success, toastError]
      );

      const bulkActivateMutation = useMutation({
            mutationFn: (ids: string[]) => repo.bulkActivate(ids),
            onSuccess: (count) => {
                  queryClient.invalidateQueries({ queryKey: userGroupKeys.all });
                  success({ title: "Bulk Activated", description: `${count} groups activated.` });
            },
      });

      const bulkDeactivateMutation = useMutation({
            mutationFn: (ids: string[]) => repo.bulkDeactivate(ids),
            onSuccess: (count) => {
                  queryClient.invalidateQueries({ queryKey: userGroupKeys.all });
                  success({ title: "Bulk Deactivated", description: `${count} groups deactivated.` });
            },
      });

      const bulkDeleteMutation = useMutation({
            mutationFn: (ids: string[]) => repo.bulkDelete(ids),
            onSuccess: (count) => {
                  queryClient.invalidateQueries({ queryKey: userGroupKeys.all });
                  success({ title: "Bulk Deleted", description: `${count} groups deleted.` });
            },
      });

      return {
            vm,
            getConfigBase,
            handleToggleActive,
            handleBulkActivate: (ids: string[]) => bulkActivateMutation.mutateAsync(ids),
            handleBulkDeactivate: (ids: string[]) => bulkDeactivateMutation.mutateAsync(ids),
            handleBulkDelete: (ids: string[]) => bulkDeleteMutation.mutateAsync(ids),
      };
}
