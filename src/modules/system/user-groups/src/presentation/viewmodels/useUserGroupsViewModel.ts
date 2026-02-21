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

export function useUserGroupsViewModel() {
      const repo = systemContainer.userGroupRepository;

      const vm = useCrudViewModel<UserGroupListItem, CreateUserGroupRequest, UpdateUserGroupRequest>(
            [...userGroupKeys.all],
            {
                  getAll: async (params) => {
                        const result = await repo.getAll({
                              page: params.page ?? 1,
                              pageSize: params.pageSize ?? 10,
                              search: params.search as string | undefined,
                        });
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

      function getConfigBase() {
            return {
                  createFields: [
                        { name: "nameEn", label: "Name (EN)", type: "text" as const, required: true },
                        { name: "nameAr", label: "Name (AR)", type: "text" as const, required: true },
                        { name: "code", label: "Code", type: "text" as const, required: true },
                        { name: "descriptionEn", label: "Description (EN)", type: "textarea" as const },
                        { name: "descriptionAr", label: "Description (AR)", type: "textarea" as const },
                  ],
                  editFields: [
                        { name: "nameEn", label: "Name (EN)", type: "text" as const, required: true },
                        { name: "nameAr", label: "Name (AR)", type: "text" as const, required: true },
                        { name: "descriptionEn", label: "Description (EN)", type: "textarea" as const },
                        { name: "descriptionAr", label: "Description (AR)", type: "textarea" as const },
                  ],
                  createInitialValues: {
                        nameEn: "",
                        nameAr: "",
                        code: "",
                        descriptionEn: "",
                        descriptionAr: "",
                  },
                  editInitialValues: (item: UserGroupListItem) => ({
                        nameEn: item.nameEn,
                        nameAr: item.nameAr,
                        descriptionEn: item.descriptionEn ?? "",
                        descriptionAr: item.descriptionAr ?? "",
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

      return { vm, getConfigBase };
}
