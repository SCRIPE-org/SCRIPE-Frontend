/**
 * Assign to Group Dialog
 *
 * Reusable dialog for assigning an admin or role to one or more user groups.
 * Used cross-module from Admins and Roles pages.
 *
 * Features:
 * - Multi-group selection (assign to multiple groups at once)
 * - Smart tenant endpoint selection (Super Admin vs Tenant Admin)
 * - Server-side search with debounce
 * - Progress feedback for multi-group assignment
 */
"use client";

import { useState, useEffect } from "react";
import { Button } from "@core/ui/button";
import { Label } from "@core/ui/label";
import { GenericModal } from "@core/crud/components/generic-modal";
import { GenericSelect, type GenericSelectOption } from "@core/crud/components/generic-select";
import { Users } from "lucide-react";
import { useCurrentTenantId } from "@core/providers/tenant-context-provider";
import { useAssignToGroupViewModel } from "../viewmodels/useAssignToGroupViewModel";

interface AssignToGroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** The admin to add to groups */
  adminId?: string;
  adminIds?: string[];
  adminName?: string;
  /** The role to add to groups */
  roleId?: string;
  roleIds?: string[];
  roleName?: string;
  /** Which mode */
  mode: "admin" | "role";
  /** For scoping groups to a specific tenant (e.g., from Tenant Detail) */
  tenantId?: string;
  /** If true, attempt to scope strictly to logged-in user's tenant (falls back to getAll for super admins) */
  useMyTenant?: boolean;
}

/**
 * Presentation UI component rendering the assign to group dialog.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*).
 */
export function AssignToGroupDialog({
  open,
  onOpenChange,
  adminId,
  adminIds,
  adminName,
  roleId,
  roleIds,
  roleName,
  mode,
  tenantId,
  useMyTenant,
}: AssignToGroupDialogProps) {
  const vm = useAssignToGroupViewModel({ tenantId, useMyTenant, onOpenChange });
  const { t, language, fetchGroups, isPending } = vm;

  // Multi-select state
  const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>([]);
  const [searchOptions, setSearchOptions] = useState<GenericSelectOption[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Tenant context
  const currentUserTenantId = useCurrentTenantId();

  const handleSearchGroups = async (term: string) => {
    setIsSearching(true);
    try {
      const options = await fetchGroups(term);
      setSearchOptions(options);
      return options;
    } finally {
      setIsSearching(false);
    }
  };

  // Initial load when dialog opens + reset on close
  useEffect(() => {
    if (open) {
      handleSearchGroups("");
    } else {
      setSearchOptions([]);
      setSelectedGroupIds([]);
    }
  }, [open, tenantId, useMyTenant, currentUserTenantId]);

  const handleSave = () => {
    if (mode === "admin") {
      const targetAdminIds = adminIds ?? (adminId ? [adminId] : []);
      vm.addMembers(targetAdminIds, selectedGroupIds);
    } else {
      const targetRoleIds = roleIds ?? (roleId ? [roleId] : []);
      vm.addRoles(targetRoleIds, selectedGroupIds);
    }
  };

  const handleClose = (v: boolean) => {
    if (!v) setSelectedGroupIds([]);
    onOpenChange(v);
  };

  const entityName = mode === "admin" ? adminName || "" : roleName || "";
  const isBulk = (mode === "admin" ? (adminIds?.length ?? 0) : (roleIds?.length ?? 0)) > 0;
  const bulkCount = mode === "admin" ? (adminIds?.length ?? 0) : (roleIds?.length ?? 0);

  return (
    <GenericModal
      open={open}
      onOpenChange={handleClose}
      title={t("userGroups.assignToGroups") || "Assign to Groups"}
      description={
        isBulk
          ? `${t("userGroups.assignBulkDesc") || "Select user groups for"} ${bulkCount} ${mode === "admin" ? t("admin.admins") || "admin(s)" : t("roles.roles") || "role(s)"}`
          : `${t("userGroups.assignToGroupDesc") || "Select user groups for"} ${entityName}`
      }
      size="md"
    >
      <div className="space-y-4 py-2">
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            {t("userGroups.selectGroups") || "Select Groups"} *
          </Label>
          <GenericSelect
            options={searchOptions}
            value={selectedGroupIds}
            onValueChange={(val: string | string[]) =>
              setSelectedGroupIds(Array.isArray(val) ? val : [val])
            }
            placeholder={t("userGroups.selectGroupsPlaceholder") || "Choose user groups..."}
            type="multi"
            searchType="server"
            onServerSearch={handleSearchGroups}
            loading={isSearching}
          />
          {selectedGroupIds.length > 0 && (
            <p className="text-xs text-muted-foreground">
              {t("userGroups.selectedCount")?.replace("{count}", String(selectedGroupIds.length)) ||
                `${selectedGroupIds.length} group(s) selected`}
            </p>
          )}
        </div>

        <div className="mt-4 flex justify-end gap-2 border-t pt-4">
          <Button variant="outline" onClick={() => handleClose(false)} disabled={isPending}>
            {t("common.cancel") || "Cancel"}
          </Button>
          <Button
            onClick={handleSave}
            loading={isPending}
            disabled={isSearching || selectedGroupIds.length === 0}
          >
            {t("userGroups.assignAction") || "Assign"}
            {selectedGroupIds.length > 0 && ` (${selectedGroupIds.length})`}
          </Button>
        </div>
      </div>
    </GenericModal>
  );
}
