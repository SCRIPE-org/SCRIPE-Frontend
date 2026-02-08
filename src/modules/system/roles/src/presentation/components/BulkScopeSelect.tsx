/**
 * Bulk Scope Select Component
 * 
 * Reusable component for applying scope overrides to all permissions.
 * Uses real backend DataScope values: own, own_tenant, hierarchy, all_tenants
 * 
 * @module roles/presentation/components
 */
"use client";

import { GenericSelect } from "@core/crud/components/generic-select";
import { useI18n } from "@core/providers/i18n-provider";
import { PermissionScopes } from "../../data/models/RoleModel";

interface BulkScopeSelectProps {
      value: string;
      onValueChange: (scope: string) => void;
      className?: string;
}

/**
 * Scope options matching backend DataScope constants:
 * - own: Only own records (CreatedBy == CurrentUserId)
 * - own_tenant: All records in own tenant
 * - hierarchy: All records in own tenant + child tenants
 * - all_tenants: All records in all tenants
 */
export function BulkScopeSelect({ value, onValueChange, className }: BulkScopeSelectProps) {
      const { t } = useI18n();

      const scopeOptions = [
            { value: PermissionScopes.OwnTenant, label: t("role.scopeOwnTenant") || "Own Tenant" },
            { value: PermissionScopes.Own, label: t("role.scopeOwn") || "Own Only" },
            { value: PermissionScopes.Hierarchy, label: t("role.scopeHierarchy") || "Hierarchy" },
            { value: PermissionScopes.AllTenants, label: t("role.scopeAllTenants") || "All Tenants" },
      ];

      return (
            <GenericSelect
                  options={scopeOptions}
                  value={value}
                  onValueChange={onValueChange}
                  placeholder={t("role.applyToAll") || "Apply to All..."}
                  className={className || "w-[140px] h-8 text-xs"}
            />
      );
}
