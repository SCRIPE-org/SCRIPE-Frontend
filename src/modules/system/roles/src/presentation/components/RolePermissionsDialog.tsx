/**
 * Role Permissions Dialog
 *
 * Dialog for managing permissions assigned to a role within a tenant.
 * Shows available tenant permissions and allows selecting which to assign to the role.
 */
"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
      Dialog,
      DialogContent,
      DialogDescription,
      DialogFooter,
      DialogHeader,
      DialogTitle,
} from "@core/ui/dialog";
import { Button } from "@core/ui/button";
import { Checkbox } from "@core/ui/checkbox";
import { Input } from "@core/ui/input";
import { ScrollArea } from "@core/ui/scroll-area";
import { Badge } from "@core/ui/badge";
import { useI18n } from "@core/providers/i18n-provider";
import { useToast } from "@core/hooks/use-toast";
import { Loader2, Search, Shield, ShieldCheck } from "lucide-react";
import { systemContainer } from "@modules/system/di";
import type { Role } from "../../domain/entities/Role";
import { PermissionModel } from "@modules/system/permissions/src/data/models/PermissionModel";

interface RolePermissionsDialogProps {
      open: boolean;
      onOpenChange: (open: boolean) => void;
      role: Role | null;
      tenantId: string;
}

export function RolePermissionsDialog({
      open,
      onOpenChange,
      role,
      tenantId,
}: RolePermissionsDialogProps) {
      const { t, language } = useI18n();
      const { toast } = useToast();
      const queryClient = useQueryClient();

      const [search, setSearch] = useState("");
      const [selectedPermissionIds, setSelectedPermissionIds] = useState<string[]>([]);

      // Fetch tenant's available permissions (what permissions this tenant has)
      const { data: tenantPermissions, isLoading: loadingTenantPerms } = useQuery({
            queryKey: ["tenant-permissions", tenantId],
            queryFn: async () => {
                  // Get permissions this specific tenant is allowed to use
                  return systemContainer.tenantService.getTenantPermissions(tenantId);
            },
            enabled: open && !!tenantId,
      });

      // Fetch role's current permissions
      const { data: rolePermissions, isLoading: loadingRolePerms } = useQuery({
            queryKey: ["role-permissions", role?.id],
            queryFn: async () => {
                  if (!role) return [];
                  return systemContainer.roleRepository.getRolePermissions(role.id);
            },
            enabled: open && !!role?.id,
      });

      // Initialize selected permissions when role permissions load
      useEffect(() => {
            if (rolePermissions && Array.isArray(rolePermissions)) {
                  const ids = rolePermissions.map((p: any) => p.permissionId || p.id);
                  setSelectedPermissionIds(ids);
            }
      }, [rolePermissions]);

      // Save mutation
      const saveMutation = useMutation({
            mutationFn: async () => {
                  if (!role) throw new Error("No role selected");

                  // Convert to assignment format
                  const assignments = selectedPermissionIds.map((id) => ({
                        permissionId: id,
                  }));

                  await systemContainer.roleRepository.assignPermissions(role.id, {
                        permissions: assignments,
                  });
            },
            onSuccess: () => {
                  toast({
                        title: t("role.permissionsSaved") || "Permissions saved successfully",
                        variant: "default",
                  });
                  queryClient.invalidateQueries({ queryKey: ["role-permissions", role?.id] });
                  onOpenChange(false);
            },
            onError: (error: Error) => {
                  toast({
                        title: t("role.permissionsSaveError") || "Failed to save permissions",
                        description: error.message,
                        variant: "destructive",
                  });
            },
      });

      // Toggle permission selection
      const togglePermission = (permissionId: string) => {
            setSelectedPermissionIds((prev) =>
                  prev.includes(permissionId)
                        ? prev.filter((id) => id !== permissionId)
                        : [...prev, permissionId]
            );
      };

      // Helper to get localized name
      const getLocalizedName = (p: PermissionModel) => {
            return language === "ar" ? (p.nameAr || p.nameEn || p.permissionCode) : (p.nameEn || p.permissionCode);
      };

      // Filter permissions by search
      const filteredPermissions =
            tenantPermissions?.filter((p: PermissionModel) => {
                  const searchLower = search.toLowerCase();
                  const name = getLocalizedName(p).toLowerCase();
                  const code = p.permissionCode?.toLowerCase() || "";
                  return name.includes(searchLower) || code.includes(searchLower);
            }) ?? [];

      // Group permissions by resource
      const groupedPermissions = filteredPermissions.reduce(
            (acc: Record<string, PermissionModel[]>, p: PermissionModel) => {
                  const resource = p.resource || "other";
                  if (!acc[resource]) acc[resource] = [];
                  acc[resource].push(p);
                  return acc;
            },
            {}
      );

      const isLoading = loadingTenantPerms || loadingRolePerms;

      return (
            <Dialog open={open} onOpenChange={onOpenChange}>
                  <DialogContent className="max-w-2xl max-h-[80vh]">
                        <DialogHeader>
                              <DialogTitle className="flex items-center gap-2">
                                    <Shield className="h-5 w-5" />
                                    {t("role.managePermissions") || "Manage Permissions"}
                              </DialogTitle>
                              <DialogDescription>
                                    {role?.name
                                          ? t("role.managePermissionsFor")?.replace("{role}", role.name) ||
                                          `Manage permissions for role: ${role.name}`
                                          : t("role.selectPermissions") || "Select permissions for this role"}
                              </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4">
                              {/* Search */}
                              <div className="relative">
                                    <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                          placeholder={t("permission.searchPlaceholder") || "Search permissions..."}
                                          value={search}
                                          onChange={(e) => setSearch(e.target.value)}
                                          className="ps-10"
                                    />
                              </div>

                              {/* Selection Stats */}
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <ShieldCheck className="h-4 w-4" />
                                    <span>
                                          {selectedPermissionIds.length} {t("common.selected") || "selected"}
                                    </span>
                              </div>

                              {/* Permissions List */}
                              <ScrollArea className="h-[400px] pr-4">
                                    {isLoading ? (
                                          <div className="flex items-center justify-center h-full">
                                                <Loader2 className="h-6 w-6 animate-spin" />
                                          </div>
                                    ) : Object.keys(groupedPermissions).length === 0 ? (
                                          <div className="text-center text-muted-foreground py-8">
                                                {t("permission.noPermissionsFound") || "No permissions found"}
                                          </div>
                                    ) : (
                                          <div className="space-y-6">
                                                {Object.entries(groupedPermissions).map(([resource, perms]) => (
                                                      <div key={resource}>
                                                            <h4 className="font-medium text-sm mb-2 capitalize flex items-center gap-2">
                                                                  <Badge variant="secondary">{resource}</Badge>
                                                            </h4>
                                                            <div className="space-y-2 ms-2">
                                                                  {(perms as PermissionModel[]).map((permission) => (
                                                                        <div
                                                                              key={permission.id}
                                                                              className="flex items-center space-x-3 rtl:space-x-reverse p-2 rounded-md hover:bg-muted/50"
                                                                        >
                                                                              <Checkbox
                                                                                    id={permission.id}
                                                                                    checked={selectedPermissionIds.includes(permission.id)}
                                                                                    onCheckedChange={() => togglePermission(permission.id)}
                                                                              />
                                                                              <label
                                                                                    htmlFor={permission.id}
                                                                                    className="flex-1 text-sm cursor-pointer"
                                                                              >
                                                                                    <span className="font-medium">
                                                                                          {getLocalizedName(permission)}
                                                                                    </span>
                                                                                    <span className="text-muted-foreground ms-2 text-xs">
                                                                                          ({permission.permissionCode})
                                                                                    </span>
                                                                              </label>
                                                                        </div>
                                                                  ))}
                                                            </div>
                                                      </div>
                                                ))}
                                          </div>
                                    )}
                              </ScrollArea>
                        </div>

                        <DialogFooter>
                              <Button variant="outline" onClick={() => onOpenChange(false)}>
                                    {t("common.cancel") || "Cancel"}
                              </Button>
                              <Button
                                    onClick={() => saveMutation.mutate()}
                                    disabled={saveMutation.isPending}
                              >
                                    {saveMutation.isPending && (
                                          <Loader2 className="h-4 w-4 animate-spin me-2" />
                                    )}
                                    {t("common.save") || "Save"}
                              </Button>
                        </DialogFooter>
                  </DialogContent>
            </Dialog>
      );
}
