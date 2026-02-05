/**
 * Role Permissions Dialog
 * 
 * Professional dialog for managing permissions assigned to a role.
 * Features collapsible resource groups with smooth animations.
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
import {
      Accordion,
      AccordionContent,
      AccordionItem,
      AccordionTrigger,
} from "@core/ui/accordion";
import { Button } from "@core/ui/button";
import { Checkbox } from "@core/ui/checkbox";
import { Input } from "@core/ui/input";
import { ScrollArea } from "@core/ui/scroll-area";
import { Badge } from "@core/ui/badge";
import { Separator } from "@core/ui/separator";
import { useI18n } from "@core/providers/i18n-provider";
import { useToast } from "@core/hooks/use-toast";
import {
      Loader2,
      Search,
      Shield,
      ShieldCheck,
      Check,
      Layers,
      FolderOpen,
} from "lucide-react";
import { systemContainer } from "@modules/system/di";
import { getCoreContainer } from "@core/di";
import type { Role } from "../../domain/entities/Role";
import { cn } from "@core/common/utils";

// Type matching actual API response from /Tenants/{id}/permissions
interface TenantPermission {
      id: string;
      resource: string;
      action: string;
      code: string;
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
      const [expandedGroups, setExpandedGroups] = useState<string[]>([]);

      // Reset when dialog opens
      useEffect(() => {
            if (open) setSearch("");
      }, [open]);

      // Fetch tenant's available permissions
      const { data: tenantPermissions = [], isLoading: loadingTenant } = useQuery({
            queryKey: ["tenant-permissions-raw", tenantId],
            queryFn: async () => {
                  return getCoreContainer().apiService.get<TenantPermission[]>(
                        `/Tenants/${tenantId}/permissions`
                  );
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
                  const validCodes = new Set(tenantPermissions.map(p => p.code));
                  const roleCodes = rolePermissions.map(p => p.permissionCode);
                  const selectedFromRole = roleCodes.filter(code => validCodes.has(code));

                  setSelectedCodes(new Set(selectedFromRole));

                  // Auto-expand groups with selected permissions
                  const groupsWithSelection = new Set<string>();
                  tenantPermissions.forEach(p => {
                        if (selectedFromRole.includes(p.code)) {
                              groupsWithSelection.add(p.resource);
                        }
                  });
                  setExpandedGroups(Array.from(groupsWithSelection));
            }
      }, [rolePermissions, tenantPermissions]);

      // Save mutation
      const saveMutation = useMutation({
            mutationFn: async () => {
                  if (!role) throw new Error("No role selected");

                  const selectedIds = tenantPermissions
                        .filter(p => selectedCodes.has(p.code))
                        .map(p => p.id);

                  await systemContainer.roleRepository.assignPermissions(role.id, {
                        permissions: selectedIds.map(id => ({ permissionId: id })),
                  });
            },
            onSuccess: () => {
                  toast({ title: t("role.permissionsSaved") || "Permissions saved successfully" });
                  queryClient.invalidateQueries({ queryKey: ["role-permissions", role?.id] });
                  queryClient.invalidateQueries({ queryKey: ["roles"] });
                  onOpenChange(false);
            },
            onError: (error: Error) => {
                  toast({
                        title: t("role.permissionsSaveError") || "Failed to save",
                        description: error.message,
                        variant: "destructive"
                  });
            },
      });

      // Toggle handlers
      const toggle = (code: string) => {
            setSelectedCodes(prev => {
                  const next = new Set(prev);
                  next.has(code) ? next.delete(code) : next.add(code);
                  return next;
            });
      };

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
      const groupCount = Object.keys(grouped).length;

      return (
            <Dialog open={open} onOpenChange={onOpenChange}>
                  <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-0 gap-0 overflow-hidden">
                        {/* Header */}
                        <DialogHeader className="px-6 py-4 bg-gradient-to-r from-primary/5 to-transparent border-b">
                              <div className="flex items-center gap-3">
                                    <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 text-primary">
                                          <Shield className="h-5 w-5" />
                                    </div>
                                    <div className="flex-1">
                                          <DialogTitle className="text-lg font-semibold">
                                                {t("role.managePermissions") || "Manage Permissions"}
                                          </DialogTitle>
                                          <DialogDescription className="flex items-center gap-2 mt-0.5">
                                                <Badge variant="secondary" className="font-mono text-xs">
                                                      {role?.code}
                                                </Badge>
                                                <span className="text-muted-foreground">•</span>
                                                <span>{role?.name}</span>
                                          </DialogDescription>
                                    </div>
                              </div>
                        </DialogHeader>

                        {/* Search & Stats Bar */}
                        <div className="px-6 py-3 border-b bg-muted/30">
                              <div className="flex items-center gap-3">
                                    <div className="relative flex-1">
                                          <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                          <Input
                                                placeholder={t("common.search") || "Search permissions..."}
                                                value={search}
                                                onChange={(e) => setSearch(e.target.value)}
                                                className="ps-9 bg-background"
                                          />
                                    </div>
                                    <div className="flex items-center gap-4 text-sm">
                                          <div className="flex items-center gap-1.5 text-muted-foreground">
                                                <Layers className="h-4 w-4" />
                                                <span>{groupCount} {t("common.groups") || "groups"}</span>
                                          </div>
                                          <Separator orientation="vertical" className="h-4" />
                                          <div className="flex items-center gap-1.5">
                                                <ShieldCheck className="h-4 w-4 text-primary" />
                                                <span className="font-medium text-primary">
                                                      {selectedCodes.size}
                                                </span>
                                                <span className="text-muted-foreground">
                                                      / {tenantPermissions.length}
                                                </span>
                                          </div>
                                    </div>
                              </div>
                        </div>

                        {/* Content */}
                        <ScrollArea className="flex-1 px-6">
                              <div className="py-4">
                                    {isLoading ? (
                                          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                                                <Loader2 className="h-8 w-8 animate-spin mb-3" />
                                                <p>{t("common.loading") || "Loading permissions..."}</p>
                                          </div>
                                    ) : groupCount === 0 ? (
                                          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                                                <FolderOpen className="h-12 w-12 mb-3 opacity-50" />
                                                <p className="font-medium">{t("permission.noPermissionsFound") || "No permissions found"}</p>
                                                <p className="text-sm">{t("common.tryDifferentSearch") || "Try a different search term"}</p>
                                          </div>
                                    ) : (
                                          <Accordion
                                                type="multiple"
                                                value={expandedGroups}
                                                onValueChange={setExpandedGroups}
                                                className="space-y-3"
                                          >
                                                {Object.entries(grouped).map(([resource, perms]) => {
                                                      const codes = perms.map(p => p.code);
                                                      const selectedCount = codes.filter(c => selectedCodes.has(c)).length;
                                                      const allChecked = selectedCount === perms.length;
                                                      const someChecked = selectedCount > 0 && !allChecked;

                                                      return (
                                                            <AccordionItem
                                                                  key={resource}
                                                                  value={resource}
                                                                  className="border rounded-xl overflow-hidden bg-card shadow-sm"
                                                            >
                                                                  <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-muted/50 transition-colors [&>svg]:text-muted-foreground">
                                                                        <div className="flex items-center gap-3 flex-1">
                                                                              <Checkbox
                                                                                    checked={allChecked}
                                                                                    className={cn(
                                                                                          "data-[state=checked]:bg-primary",
                                                                                          someChecked && "bg-primary/50 border-primary"
                                                                                    )}
                                                                                    onCheckedChange={() => toggleGroup(codes)}
                                                                                    onClick={(e) => e.stopPropagation()}
                                                                              />
                                                                              <div className="flex items-center gap-2">
                                                                                    <Badge
                                                                                          variant={selectedCount > 0 ? "default" : "secondary"}
                                                                                          className="capitalize font-medium"
                                                                                    >
                                                                                          {resource}
                                                                                    </Badge>
                                                                              </div>
                                                                              <div className="ms-auto me-2 flex items-center gap-1">
                                                                                    <span className={cn(
                                                                                          "text-sm font-medium",
                                                                                          selectedCount > 0 ? "text-primary" : "text-muted-foreground"
                                                                                    )}>
                                                                                          {selectedCount}
                                                                                    </span>
                                                                                    <span className="text-sm text-muted-foreground">
                                                                                          / {perms.length}
                                                                                    </span>
                                                                              </div>
                                                                        </div>
                                                                  </AccordionTrigger>
                                                                  <AccordionContent className="px-4 pb-3">
                                                                        <div className="grid gap-1.5 pt-1">
                                                                              {perms.map(permission => {
                                                                                    const isChecked = selectedCodes.has(permission.code);
                                                                                    return (
                                                                                          <label
                                                                                                key={permission.id}
                                                                                                className={cn(
                                                                                                      "flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all duration-200",
                                                                                                      "border",
                                                                                                      isChecked
                                                                                                            ? "bg-primary/5 border-primary/30 shadow-sm"
                                                                                                            : "bg-background border-transparent hover:bg-muted/50 hover:border-muted"
                                                                                                )}
                                                                                          >
                                                                                                <Checkbox
                                                                                                      checked={isChecked}
                                                                                                      onCheckedChange={() => toggle(permission.code)}
                                                                                                      className="data-[state=checked]:bg-primary"
                                                                                                />
                                                                                                <div className="flex-1 min-w-0">
                                                                                                      <div className={cn(
                                                                                                            "font-medium text-sm",
                                                                                                            isChecked && "text-primary"
                                                                                                      )}>
                                                                                                            {getName(permission)}
                                                                                                      </div>
                                                                                                      <div className="text-xs text-muted-foreground font-mono mt-0.5">
                                                                                                            {permission.code}
                                                                                                      </div>
                                                                                                </div>
                                                                                                {isChecked && (
                                                                                                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground">
                                                                                                            <Check className="h-3.5 w-3.5" />
                                                                                                      </div>
                                                                                                )}
                                                                                          </label>
                                                                                    );
                                                                              })}
                                                                        </div>
                                                                  </AccordionContent>
                                                            </AccordionItem>
                                                      );
                                                })}
                                          </Accordion>
                                    )}
                              </div>
                        </ScrollArea>

                        {/* Footer */}
                        <DialogFooter className="px-6 py-4 border-t bg-muted/30">
                              <div className="flex items-center justify-between w-full">
                                    <p className="text-sm text-muted-foreground">
                                          {selectedCodes.size} {t("common.selected") || "selected"}
                                    </p>
                                    <div className="flex items-center gap-2">
                                          <Button
                                                variant="outline"
                                                onClick={() => onOpenChange(false)}
                                          >
                                                {t("common.cancel") || "Cancel"}
                                          </Button>
                                          <Button
                                                onClick={() => saveMutation.mutate()}
                                                disabled={saveMutation.isPending}
                                                className="min-w-[100px]"
                                          >
                                                {saveMutation.isPending ? (
                                                      <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                      <>
                                                            <ShieldCheck className="h-4 w-4 me-2" />
                                                            {t("common.save") || "Save"}
                                                      </>
                                                )}
                                          </Button>
                                    </div>
                              </div>
                        </DialogFooter>
                  </DialogContent>
            </Dialog>
      );
}
