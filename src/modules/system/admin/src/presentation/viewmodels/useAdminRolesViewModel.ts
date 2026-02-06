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
      const [assignRoleIds, setAssignRoleIds] = useState<string[]>([]);
      const [assignTenantId, setAssignTenantId] = useState<string>("");
      const [inheritToChildren, setInheritToChildren] = useState(false);

      // Fetch roles for dropdown
      // Trigger fetch when: 
      // 1. Dialog is open (enabled: !!admin)
      // 2. effectiveTenantId changes (forced context)
      // 3. assignTenantId changes (user selected scope)
      const targetTenantId = effectiveTenantId || assignTenantId;

      const { data: rolesData, isLoading: isLoadingRoles } = useQuery({
            queryKey: ["roles-for-select", targetTenantId],
            queryFn: () => roleRepository.getAll({
                  page: 1,
                  pageSize: 100,
                  tenantId: targetTenantId || undefined
            }),
            enabled: !!admin,
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
            uniqueKey: role.code // Use code for stable selection if IDs rotate
      })), [rolesData, language]);

      // Transform tenants tree
      // Transform tenants tree
      const transformTenants = useCallback((nodes: any[]): GenericSelectOption[] => {
            return nodes.map((node) => ({
                  value: node.id,
                  label: node.name,
                  children: node.children?.length > 0
                        ? transformTenants(node.children)
                        : undefined,
            }));
      }, []);

      const tenantOptions: GenericSelectOption[] = useMemo(() => [
            { value: "", label: t("admin.role.systemScope") || "System Level (Global Access)" },
            ...(Array.isArray(tenantsTree) ? transformTenants(tenantsTree) : []),
      ], [tenantsTree, transformTenants, t]);

      const resetAssignForm = useCallback(() => {
            setAssignRoleIds([]);
            setAssignTenantId(effectiveTenantId || "");
            setInheritToChildren(false);
      }, [effectiveTenantId]);

      const handleAssignSubmit = async () => {
            if (assignRoleIds.length === 0) return;

            // AssignRoleRequest only accepts single roleId, so we must loop
            // In a real app, a bulk endpoint would be better
            const promises = assignRoleIds.map(roleId =>
                  onAssignRole({
                        roleId: roleId,
                        tenantId: assignTenantId || undefined,
                        inheritToChildren: assignTenantId ? inheritToChildren : undefined
                  })
            );

            try {
                  await Promise.all(promises);
                  resetAssignForm();
            } catch (error) {
                  // Error is handled by the mutation wrapper in the View, 
                  // but we catch here to prevent reset if partial failure? 
                  // For now let it bubble up.
                  throw error;
            }
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
            assignRoleIds,
            setAssignRoleIds,
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
