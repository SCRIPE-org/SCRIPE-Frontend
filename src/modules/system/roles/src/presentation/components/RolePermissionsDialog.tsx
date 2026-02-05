/**
 * Role Permissions Dialog
 * 
 * Simplified dialog for managing permissions assigned to a role.
 * Uses the generic multi-select pattern with proper permission matching.
 *
 * @module roles/presentation/components
 */
"use client";

import { useState, useEffect, useMemo } from "react";
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
import { Loader2, Search, Shield, ShieldCheck, CheckCircle2 } from "lucide-react";
import { systemContainer } from "@modules/system/di";
import { getCoreContainer } from "@core/di";
import type { Role } from "../../domain/entities/Role";
import { cn } from "@core/common/utils";

// Type matching actual API response from /Tenants/{id}/permissions
interface TenantPermission {
      id: string;
      resource: string;
      action: string;
      code: string;  // This is the actual field name from API!
      defaultScope: string;
      description?: string;
      nameEn?: string;
      nameAr?: string;
}

// Type for role permissions from /Roles/{id}/permissions
interface RolePermission {
      permissionId: string;
      permissionCode: string;
      description?: string;
      scope?: string;
}

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
      const [selectedCodes, setSelectedCodes] = useState<Set<string>>(new Set());

      // Reset search when dialog opens
      useEffect(() => {
            if (open) setSearch("");
      }, [open]);

      // Fetch tenant's available permissions
      const { data: tenantPermissions = [], isLoading: loadingTenant } = useQuery({
            queryKey: ["tenant-permissions-raw", tenantId],
            queryFn: async () => {
                  const response = await getCoreContainer().apiService.get<TenantPermission[]>(
                        `/Tenants/${tenantId}/permissions`
                  );
                  return response;
            },
            enabled: open && !!tenantId,
      });

      // Fetch role's current permissions
      const { data: rolePermissions = [], isLoading: loadingRole } = useQuery({
            queryKey: ["role-permissions", role?.id],
            queryFn: async (): Promise<RolePermission[]> => {
                  if (!role) return [];
                  return systemContainer.roleRepository.getRolePermissions(role.id);
            },
            enabled: open && !!role?.id,
      });

      // Initialize selection when data loads
      useEffect(() => {
            if (rolePermissions.length > 0 && tenantPermissions.length > 0) {
                  // Get valid codes from tenant permissions
                  const validCodes = new Set(tenantPermissions.map(p => p.code));

                  // Get role's permission codes and intersect with valid codes
                  const roleCodes = rolePermissions.map(p => p.permissionCode);
                  const selectedFromRole = roleCodes.filter(code => validCodes.has(code));

                  setSelectedCodes(new Set(selectedFromRole));
            }
      }, [rolePermissions, tenantPermissions]);

      // Save mutation
      const saveMutation = useMutation({
            mutationFn: async () => {
                  if (!role) throw new Error("No role selected");

                  // Convert codes to permission IDs
                  const selectedIds = tenantPermissions
                        .filter(p => selectedCodes.has(p.code))
                        .map(p => p.id);

                  await systemContainer.roleRepository.assignPermissions(role.id, {
                        permissions: selectedIds.map(id => ({ permissionId: id })),
                  });
            },
            onSuccess: () => {
                  toast({ title: t("role.permissionsSaved") || "Permissions saved" });
                  queryClient.invalidateQueries({ queryKey: ["role-permissions", role?.id] });
                  queryClient.invalidateQueries({ queryKey: ["roles"] });
                  onOpenChange(false);
            },
            onError: (error: Error) => {
                  toast({ title: t("role.permissionsSaveError") || "Save failed", description: error.message, variant: "destructive" });
            },
      });

      // Toggle single permission
      const toggle = (code: string) => {
            setSelectedCodes(prev => {
                  const next = new Set(prev);
                  next.has(code) ? next.delete(code) : next.add(code);
                  return next;
            });
      };

      // Toggle all in group
      const toggleGroup = (codes: string[]) => {
            const allSelected = codes.every(c => selectedCodes.has(c));
            setSelectedCodes(prev => {
                  const next = new Set(prev);
                  codes.forEach(c => allSelected ? next.delete(c) : next.add(c));
                  return next;
            });
      };

      // Filter and group permissions
      const grouped = useMemo(() => {
            const searchLower = search.toLowerCase();
            const filtered = tenantPermissions.filter(p => {
                  if (!search) return true;
                  const name = (language === "ar" ? p.nameAr : p.nameEn) || p.description || p.code;
                  return name.toLowerCase().includes(searchLower) || p.code.toLowerCase().includes(searchLower);
            });

            return filtered.reduce((acc, p) => {
                  const key = p.resource || "other";
                  (acc[key] = acc[key] || []).push(p);
                  return acc;
            }, {} as Record<string, TenantPermission[]>);
      }, [tenantPermissions, search, language]);

      const isLoading = loadingTenant || loadingRole;
      const getName = (p: TenantPermission) => (language === "ar" ? p.nameAr : p.nameEn) || p.description || p.code;

      return (
            <Dialog open={open} onOpenChange={onOpenChange}>
                  <DialogContent className="max-w-xl max-h-[80vh] flex flex-col">
                        <DialogHeader className="pb-3 border-b">
                              <DialogTitle className="flex items-center gap-2">
                                    <Shield className="h-5 w-5 text-primary" />
                                    {t("role.managePermissions") || "Manage Permissions"}
                              </DialogTitle>
                              <DialogDescription>
                                    <Badge variant="outline" className="font-mono">{role?.code}</Badge>
                                    <span className="ms-2">{role?.name}</span>
                              </DialogDescription>
                        </DialogHeader>

                        <div className="flex items-center gap-2 py-3">
                              <div className="relative flex-1">
                                    <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                          placeholder={t("common.search") || "Search..."}
                                          value={search}
                                          onChange={(e) => setSearch(e.target.value)}
                                          className="ps-9"
                                    />
                              </div>
                              <Badge variant="secondary">
                                    <ShieldCheck className="h-3 w-3 me-1" />
                                    {selectedCodes.size}/{tenantPermissions.length}
                              </Badge>
                        </div>

                        <ScrollArea className="flex-1 -mx-6 px-6">
                              {isLoading ? (
                                    <div className="flex justify-center py-8">
                                          <Loader2 className="h-6 w-6 animate-spin" />
                                    </div>
                              ) : Object.keys(grouped).length === 0 ? (
                                    <div className="text-center text-muted-foreground py-8">
                                          {t("permission.noPermissionsFound") || "No permissions found"}
                                    </div>
                              ) : (
                                    <div className="space-y-4">
                                          {Object.entries(grouped).map(([resource, perms]) => {
                                                const codes = perms.map(p => p.code);
                                                const count = codes.filter(c => selectedCodes.has(c)).length;
                                                const allChecked = count === perms.length;

                                                return (
                                                      <div key={resource} className="border rounded-lg p-3">
                                                            {/* Group Header */}
                                                            <label className="flex items-center gap-2 cursor-pointer mb-2 pb-2 border-b">
                                                                  <Checkbox
                                                                        checked={allChecked}
                                                                        onCheckedChange={() => toggleGroup(codes)}
                                                                  />
                                                                  <Badge variant="secondary" className="capitalize">{resource}</Badge>
                                                                  <span className="text-xs text-muted-foreground ms-auto">{count}/{perms.length}</span>
                                                            </label>

                                                            {/* Permissions */}
                                                            <div className="space-y-1">
                                                                  {perms.map(p => {
                                                                        const checked = selectedCodes.has(p.code);
                                                                        return (
                                                                              <label
                                                                                    key={p.id}
                                                                                    className={cn(
                                                                                          "flex items-center gap-2 p-2 rounded cursor-pointer transition-colors",
                                                                                          checked ? "bg-primary/5" : "hover:bg-muted/50"
                                                                                    )}
                                                                              >
                                                                                    <Checkbox checked={checked} onCheckedChange={() => toggle(p.code)} />
                                                                                    <div className="flex-1 min-w-0">
                                                                                          <div className="text-sm">{getName(p)}</div>
                                                                                          <div className="text-xs text-muted-foreground font-mono">{p.code}</div>
                                                                                    </div>
                                                                                    {checked && <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />}
                                                                              </label>
                                                                        );
                                                                  })}
                                                            </div>
                                                      </div>
                                                );
                                          })}
                                    </div>
                              )}
                        </ScrollArea>

                        <DialogFooter className="border-t pt-3">
                              <Button variant="outline" onClick={() => onOpenChange(false)}>
                                    {t("common.cancel") || "Cancel"}
                              </Button>
                              <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
                                    {saveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : t("common.save") || "Save"}
                              </Button>
                        </DialogFooter>
                  </DialogContent>
            </Dialog>
      );
}
