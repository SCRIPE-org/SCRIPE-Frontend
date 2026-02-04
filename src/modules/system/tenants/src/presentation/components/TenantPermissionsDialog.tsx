/**
 * Tenant Permissions Dialog
 *
 * Dialog for managing which permissions are available to a tenant.
 * System admins can assign any permission; tenant admins can only assign permissions they have.
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
import { Loader2, Search, Shield, ShieldCheck, Building2 } from "lucide-react";
import { systemContainer } from "@modules/system/di";
import type { Permission } from "@modules/system/permissions/src/domain/entities/Permission";

interface TenantPermissionsDialogProps {
      open: boolean;
      onOpenChange: (open: boolean) => void;
      tenantId: string;
      tenantName: string;
}

export function TenantPermissionsDialog({
      open,
      onOpenChange,
      tenantId,
      tenantName,
}: TenantPermissionsDialogProps) {
      const { t, language } = useI18n();
      const { toast } = useToast();
      const queryClient = useQueryClient();

      const [search, setSearch] = useState("");
      const [selectedPermissionIds, setSelectedPermissionIds] = useState<string[]>([]);

      // Fetch all available permissions (what the current user can assign)
      const { data: availablePermissions, isLoading: loadingAvailable } = useQuery({
            queryKey: ["my-permissions"],
            queryFn: async () => {
                  return systemContainer.permissionRepository.getMyPermissions({});
            },
            enabled: open,
      });

      // Fetch tenant's current permissions
      // TODO: Add proper backend endpoint GET /api/tenants/{id}/permissions to fetch tenant's assigned permissions
      const { data: tenantPermissions, isLoading: loadingTenant } = useQuery({
            queryKey: ["tenant-permissions", tenantId],
            queryFn: async () => {
                  // Placeholder: In a full implementation, call an API to get tenant's permissions
                  // For now, return empty array - user will need to save permissions first
                  // The backend endpoint UpdateTenantPermissions is ready
                  console.log(`Fetching permissions for tenant: ${tenantId}`);
                  return [] as any[];
            },
            enabled: open && !!tenantId,
      });

      // Initialize selected permissions when tenant permissions load
      useEffect(() => {
            if (tenantPermissions && Array.isArray(tenantPermissions)) {
                  const ids = tenantPermissions.map((p: any) => p.id || p.permissionId);
                  setSelectedPermissionIds(ids);
            }
      }, [tenantPermissions]);

      // Save mutation - calls PUT /api/tenants/{id}/permissions
      const saveMutation = useMutation({
            mutationFn: async () => {
                  const response = await fetch(
                        `${process.env.NEXT_PUBLIC_API_URL}/api/tenants/${tenantId}/permissions`,
                        {
                              method: "PUT",
                              headers: {
                                    "Content-Type": "application/json",
                                    // Auth headers are added by interceptor
                              },
                              body: JSON.stringify({
                                    permissionIds: selectedPermissionIds,
                              }),
                        }
                  );

                  if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.error || "Failed to update permissions");
                  }
            },
            onSuccess: () => {
                  toast({
                        title: t("tenant.permissionsSaved") || "Permissions saved successfully",
                        variant: "default",
                  });
                  queryClient.invalidateQueries({ queryKey: ["tenant-permissions", tenantId] });
                  onOpenChange(false);
            },
            onError: (error: Error) => {
                  toast({
                        title: t("tenant.permissionsSaveError") || "Failed to save permissions",
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

      // Select all in a resource group
      const selectAllInGroup = (perms: Permission[]) => {
            const ids = perms.map((p) => p.id);
            setSelectedPermissionIds((prev) => {
                  const newSet = new Set([...prev, ...ids]);
                  return Array.from(newSet);
            });
      };

      // Deselect all in a resource group
      const deselectAllInGroup = (perms: Permission[]) => {
            const ids = new Set(perms.map((p) => p.id));
            setSelectedPermissionIds((prev) => prev.filter((id) => !ids.has(id)));
      };

      // Filter permissions by search
      const filteredPermissions =
            availablePermissions?.filter((p: Permission) => {
                  const searchLower = search.toLowerCase();
                  const name = p.getLocalizedName(language).toLowerCase();
                  const code = p.code?.toLowerCase() || "";
                  return name.includes(searchLower) || code.includes(searchLower);
            }) ?? [];

      // Group permissions by resource
      const groupedPermissions = filteredPermissions.reduce(
            (acc: Record<string, Permission[]>, p: Permission) => {
                  const resource = p.resource || "other";
                  if (!acc[resource]) acc[resource] = [];
                  acc[resource].push(p);
                  return acc;
            },
            {}
      );

      const isLoading = loadingAvailable || loadingTenant;

      // Check if all in a group are selected
      const isGroupSelected = (perms: Permission[]) =>
            perms.every((p) => selectedPermissionIds.includes(p.id));

      return (
            <Dialog open={open} onOpenChange={onOpenChange}>
                  <DialogContent className="max-w-3xl max-h-[85vh]">
                        <DialogHeader>
                              <DialogTitle className="flex items-center gap-2">
                                    <Building2 className="h-5 w-5" />
                                    {t("tenant.managePermissions") || "Manage Tenant Permissions"}
                              </DialogTitle>
                              <DialogDescription>
                                    {t("tenant.managePermissionsFor")?.replace("{tenant}", tenantName) ||
                                          `Manage available permissions for: ${tenantName}`}
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
                              <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                          <ShieldCheck className="h-4 w-4" />
                                          <span>
                                                {selectedPermissionIds.length} / {availablePermissions?.length || 0}{" "}
                                                {t("common.selected") || "selected"}
                                          </span>
                                    </div>
                                    <div className="flex gap-2">
                                          <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() =>
                                                      setSelectedPermissionIds(
                                                            availablePermissions?.map((p: Permission) => p.id) || []
                                                      )
                                                }
                                          >
                                                {t("common.selectAll") || "Select All"}
                                          </Button>
                                          <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setSelectedPermissionIds([])}
                                          >
                                                {t("common.clearAll") || "Clear All"}
                                          </Button>
                                    </div>
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
                                                      <div key={resource} className="border rounded-lg p-4">
                                                            <div className="flex items-center justify-between mb-3">
                                                                  <h4 className="font-medium text-sm capitalize flex items-center gap-2">
                                                                        <Badge variant="secondary">{resource}</Badge>
                                                                        <span className="text-muted-foreground text-xs">
                                                                              ({(perms as Permission[]).length})
                                                                        </span>
                                                                  </h4>
                                                                  <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        onClick={() =>
                                                                              isGroupSelected(perms as Permission[])
                                                                                    ? deselectAllInGroup(perms as Permission[])
                                                                                    : selectAllInGroup(perms as Permission[])
                                                                        }
                                                                  >
                                                                        {isGroupSelected(perms as Permission[])
                                                                              ? t("common.deselectAll") || "Deselect All"
                                                                              : t("common.selectAll") || "Select All"}
                                                                  </Button>
                                                            </div>
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                                  {(perms as Permission[]).map((permission) => (
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
                                                                                          {permission.getLocalizedName(language)}
                                                                                    </span>
                                                                                    <span className="text-muted-foreground ms-2 text-xs block">
                                                                                          {permission.code}
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
