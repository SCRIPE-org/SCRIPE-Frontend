/**
 * Admin Roles ViewModel
 *
 * Handles logic for Assign/View/Remove roles dialogs.
 * Separates state and data fetching from the UI components.
 */
"use client";

import { useState, useCallback, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { systemContainer } from "@modules/system/di";
import { useI18n } from "@core/providers/i18n-provider";
import { useEnhancedToast } from "@core/hooks/use-enhanced-toast";
import type { Admin, AdminRoleData } from "../../domain/entities/Admin";
import type { AssignRoleRequest } from "../../domain/entities/AdminRequests";
import type { GenericSelectOption } from "@core/crud/components/generic-select";

export function useAdminRolesViewModel(
      admin: Admin | null,
      onAssignRole: (request: AssignRoleRequest) => Promise<void>,
      onRemoveRole: (roleId: string, tenantId?: string) => Promise<void>,
      forcedTenantId?: string
) {
      const { t, language } = useI18n();
      const { roleRepository, tenantRepository, adminRepository } = systemContainer;

      // Effective tenant context: explicit force > admin's own tenant
      const effectiveTenantId = forcedTenantId || admin?.tenantId;

      // ============ Assign Role Logic ============
      const [assignRoleId, setAssignRoleId] = useState<string>("");
      const [assignTenantId, setAssignTenantId] = useState<string>("");
      const [inheritToChildren, setInheritToChildren] = useState(false);

      // Fetch roles for dropdown
      const { data: rolesData, isLoading: isLoadingRoles } = useQuery({
            queryKey: ["roles-for-select", effectiveTenantId],
            queryFn: () => roleRepository.getAll({
                  page: 1,
                  pageSize: 100,
                  tenantId: effectiveTenantId || undefined
            }),
            enabled: !!admin, // Only fetch when admin is selected (dialog open)
      });

      // Fetch tenants for dropdown (only if no tenant context determined)
      const { data: tenantsTree, isLoading: isLoadingTenants } = useQuery({
            queryKey: ["tenants-tree-for-select"],
            queryFn: () => tenantRepository.getTree(),
            enabled: !!admin && !effectiveTenantId,
      });

      // Transform roles options
      const roleOptions: GenericSelectOption[] = useMemo(() => (rolesData?.items ?? []).map((role) => ({
            value: role.id,
            label: language === 'ar' ? role.nameAr : role.nameEn,
            description: language === 'ar' ? role.descriptionAr : role.descriptionEn,
      })), [rolesData, language]);

      // Transform tenants tree
      const flattenTenants = useCallback((nodes: any[], level = 0): GenericSelectOption[] => {
            return nodes.flatMap((node) => [
                  {
                        value: node.id,
                        label: node.name,
                        level,
                        children: node.children?.length > 0
                              ? flattenTenants(node.children, level + 1)
                              : undefined,
                  },
                  ...(node.children ? flattenTenants(node.children, level + 1) : []),
            ]);
      }, []);

      const tenantOptions: GenericSelectOption[] = useMemo(() => [
            { value: "", label: t("admin.role.globalScope") || "Global (All Tenants)" },
            ...(Array.isArray(tenantsTree) ? flattenTenants(tenantsTree) : []),
      ], [tenantsTree, flattenTenants, t]);

      const resetAssignForm = useCallback(() => {
            setAssignRoleId("");
            setAssignTenantId(effectiveTenantId || "");
            setInheritToChildren(false);
      }, [effectiveTenantId]);

      const handleAssignSubmit = async () => {
            if (!assignRoleId) return;
            await onAssignRole({
                  roleId: assignRoleId,
                  tenantId: assignTenantId || undefined,
                  inheritToChildren: assignTenantId ? inheritToChildren : undefined
            });
            resetAssignForm();
      };

      // ============ View Roles Logic ============
      const { data: currentRoles = [], isLoading: isLoadingCurrentRoles, refetch: refetchRoles } = useQuery({
            queryKey: ["admin-roles", admin?.id],
            queryFn: async (): Promise<AdminRoleData[]> => {
                  if (!admin?.id) return [];
                  return adminRepository.getRoles(admin.id);
            },
            enabled: !!admin?.id,
      });

      // ============ Exports ============
      return {
            // Data
            roleOptions,
            tenantOptions,
            currentRoles,

            // Loading States
            isLoadingRoles,
            isLoadingTenants,
            isLoadingCurrentRoles,

            // Form State
            assignRoleId,
            setAssignRoleId,
            assignTenantId,
            setAssignTenantId,
            inheritToChildren,
            setInheritToChildren,
            effectiveTenantId,

            // Actions
            resetAssignForm,
            handleAssignSubmit,
            refetchRoles,

            t, // Pass t for UI
      };
}
