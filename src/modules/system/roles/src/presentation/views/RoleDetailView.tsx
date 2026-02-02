/**
 * Role Detail View
 *
 * Displays role details with permissions tree for assignment.
 */
"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

import { Button } from "@core/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@core/ui/card";
import { Badge } from "@core/ui/badge";
import { Checkbox } from "@core/ui/checkbox";
import { Input } from "@core/ui/input";
import { Skeleton } from "@core/ui/skeleton";
import { useEnhancedToast } from "@core/hooks/use-enhanced-toast";

import {
      ArrowLeft,
      Shield,
      Search,
      Save,
      ChevronRight,
      ChevronDown,
      Lock,
      Users,
      Settings,
      Layout,
      CheckCircle2
} from "lucide-react";

import { systemContainer } from "@modules/system/di";
import type { Permission } from "@modules/system/permissions/src/domain/entities/Permission";
import type { Role } from "../../domain/entities/Role";

interface PermissionCategory {
      category: string;
      permissions: Permission[];
      isExpanded: boolean;
}

// Category Icons
const CATEGORY_ICONS: Record<string, React.ReactNode> = {
      "Admin Management": <Users className="w-4 h-4" />,
      "Role Management": <Shield className="w-4 h-4" />,
      "Permission Management": <Lock className="w-4 h-4" />,
      "Tenant Management": <Layout className="w-4 h-4" />,
      "User Management": <Users className="w-4 h-4" />,
      "Menu Management": <Settings className="w-4 h-4" />,
};

export default function RoleDetailView() {
      const { t, i18n } = useTranslation();
      const language = i18n.language || 'en';
      const router = useRouter();
      const params = useParams();
      const roleId = params.id as string;
      const queryClient = useQueryClient();
      const { success, error: toastError } = useEnhancedToast();

      const { roleRepository, permissionRepository } = systemContainer;

      // State
      const [selectedPermissions, setSelectedPermissions] = useState<Set<string>>(new Set());
      const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
      const [searchQuery, setSearchQuery] = useState("");

      // Fetch role details
      const { data: role, isLoading: roleLoading } = useQuery<Role>({
            queryKey: ["role", roleId],
            queryFn: () => roleRepository.getById(roleId),
            enabled: !!roleId,
      });

      // Fetch role's current permissions
      const { data: rolePermissions, isLoading: rolePermissionsLoading } = useQuery<any[]>({
            queryKey: ["rolePermissions", roleId],
            queryFn: async () => {
                  const response = await fetch(`/api/Roles/${roleId}/permissions`, {
                        headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
                  });
                  if (!response.ok) throw new Error("Failed to fetch role permissions");
                  return response.json();
            },
            enabled: !!roleId,
      });

      // Fetch all permissions
      const { data: allPermissions, isLoading: permissionsLoading } = useQuery<Permission[]>({
            queryKey: ["permissions"],
            queryFn: () => permissionRepository.getAll(),
      });

      // Initialize selected permissions when data loads
      useEffect(() => {
            if (rolePermissions) {
                  const permIds = new Set(rolePermissions.map((rp: any) => rp.permissionId || rp.id));
                  setSelectedPermissions(permIds);
            }
      }, [rolePermissions]);

      // Save permissions mutation
      const saveMutation = useMutation({
            mutationFn: async (permissionIds: string[]) => {
                  await roleRepository.assignPermissions(roleId, {
                        permissions: permissionIds.map((id) => ({
                              permissionId: id,
                              scopeOverride: "own_tenant",
                        })),
                  });
            },
            onSuccess: () => {
                  queryClient.invalidateQueries({ queryKey: ["rolePermissions", roleId] });
                  success({
                        title: t("common.success"),
                        description: t("roles.permissionsUpdated"),
                  });
            },
            onError: (err: Error) => {
                  toastError({
                        title: t("common.error"),
                        description: err.message,
                  });
            },
      });

      // Group permissions by category
      const categories: PermissionCategory[] = useMemo(() => {
            if (!allPermissions) return [];

            const filtered = searchQuery
                  ? allPermissions.filter((p) => {
                        const name = p.getLocalizedName(language);
                        const code = p.code.toLowerCase();
                        const query = searchQuery.toLowerCase();
                        return name.toLowerCase().includes(query) || code.includes(query);
                  })
                  : allPermissions;

            const grouped = filtered.reduce((acc, permission) => {
                  const category = permission.category || "Other";
                  if (!acc[category]) {
                        acc[category] = [];
                  }
                  acc[category].push(permission);
                  return acc;
            }, {} as Record<string, Permission[]>);

            return Object.entries(grouped)
                  .map(([category, permissions]) => ({
                        category,
                        permissions: permissions.sort((a, b) => a.displayOrder - b.displayOrder),
                        isExpanded: expandedCategories.has(category),
                  }))
                  .sort((a, b) => a.category.localeCompare(b.category));
      }, [allPermissions, searchQuery, expandedCategories, language]);

      // Toggle category expansion
      const toggleCategory = useCallback((category: string) => {
            setExpandedCategories((prev) => {
                  const next = new Set(prev);
                  if (next.has(category)) {
                        next.delete(category);
                  } else {
                        next.add(category);
                  }
                  return next;
            });
      }, []);

      // Toggle permission selection
      const togglePermission = useCallback((permissionId: string) => {
            setSelectedPermissions((prev) => {
                  const next = new Set(prev);
                  if (next.has(permissionId)) {
                        next.delete(permissionId);
                  } else {
                        next.add(permissionId);
                  }
                  return next;
            });
      }, []);

      // Toggle all permissions in a category
      const toggleCategoryPermissions = useCallback(
            (category: PermissionCategory) => {
                  const categoryIds = category.permissions.map((p) => p.id);
                  const allSelected = categoryIds.every((id) => selectedPermissions.has(id));

                  setSelectedPermissions((prev) => {
                        const next = new Set(prev);
                        if (allSelected) {
                              categoryIds.forEach((id) => next.delete(id));
                        } else {
                              categoryIds.forEach((id) => next.add(id));
                        }
                        return next;
                  });
            },
            [selectedPermissions]
      );

      // Expand all categories
      const expandAll = useCallback(() => {
            setExpandedCategories(new Set(categories.map((c) => c.category)));
      }, [categories]);

      // Collapse all categories
      const collapseAll = useCallback(() => {
            setExpandedCategories(new Set());
      }, []);

      // Save permissions
      const handleSave = useCallback(() => {
            saveMutation.mutate(Array.from(selectedPermissions));
      }, [selectedPermissions, saveMutation]);

      // Check if category has some/all selected
      const getCategoryStatus = useCallback(
            (category: PermissionCategory) => {
                  const total = category.permissions.length;
                  const selected = category.permissions.filter((p) => selectedPermissions.has(p.id)).length;
                  if (selected === 0) return "none";
                  if (selected === total) return "all";
                  return "partial";
            },
            [selectedPermissions]
      );

      const isLoading = roleLoading || permissionsLoading || rolePermissionsLoading;

      return (
            <div className="container mx-auto py-6 space-y-6">
                  {/* Header */}
                  <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={() => router.back()}>
                              <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <div className="flex-1">
                              <h1 className="text-3xl font-bold">
                                    {roleLoading ? <Skeleton className="h-9 w-48" /> : role?.name}
                              </h1>
                              <p className="text-muted-foreground">
                                    {roleLoading ? <Skeleton className="h-5 w-32 mt-1" /> : role?.code}
                              </p>
                        </div>
                        <Button onClick={handleSave} disabled={saveMutation.isPending}>
                              <Save className="mr-2 h-4 w-4" />
                              {saveMutation.isPending ? t("common.saving") : t("common.saveChanges")}
                        </Button>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                        {/* Role Info Card */}
                        <Card>
                              <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                          <Shield className="h-5 w-5" />
                                          {t("roles.roleDetails")}
                                    </CardTitle>
                              </CardHeader>
                              <CardContent className="space-y-4">
                                    {roleLoading ? (
                                          <>
                                                <Skeleton className="h-4 w-full" />
                                                <Skeleton className="h-4 w-3/4" />
                                          </>
                                    ) : (
                                          <>
                                                <div>
                                                      <label className="text-sm text-muted-foreground">{t("roles.name")}</label>
                                                      <p className="font-medium">{role?.name}</p>
                                                </div>
                                                <div>
                                                      <label className="text-sm text-muted-foreground">{t("roles.code")}</label>
                                                      <p className="font-mono text-sm">{role?.code}</p>
                                                </div>
                                                <div>
                                                      <label className="text-sm text-muted-foreground">{t("roles.description")}</label>
                                                      <p className="text-sm">{role?.description || "-"}</p>
                                                </div>
                                                <div>
                                                      <label className="text-sm text-muted-foreground">{t("roles.priority")}</label>
                                                      <Badge variant="outline">{role?.priority}</Badge>
                                                </div>
                                                <div className="pt-2 border-t">
                                                      <p className="text-sm text-muted-foreground">
                                                            {t("roles.selectedPermissions")}
                                                      </p>
                                                      <p className="text-2xl font-bold">
                                                            {selectedPermissions.size}{" "}
                                                            <span className="text-sm text-muted-foreground font-normal">
                                                                  / {allPermissions?.length || 0}
                                                            </span>
                                                      </p>
                                                </div>
                                          </>
                                    )}
                              </CardContent>
                        </Card>

                        {/* Permissions Tree Card */}
                        <Card className="lg:col-span-3">
                              <CardHeader className="pb-3">
                                    <div className="flex items-center justify-between">
                                          <CardTitle className="flex items-center gap-2">
                                                <Lock className="h-5 w-5" />
                                                {t("roles.permissions")}
                                          </CardTitle>
                                          <div className="flex items-center gap-2">
                                                <Button variant="ghost" size="sm" onClick={expandAll}>
                                                      {t("common.expandAll")}
                                                </Button>
                                                <Button variant="ghost" size="sm" onClick={collapseAll}>
                                                      {t("common.collapseAll")}
                                                </Button>
                                          </div>
                                    </div>
                                    <div className="relative mt-3">
                                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                          <Input
                                                placeholder={t("roles.searchPermissions")}
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                className="pl-9"
                                          />
                                    </div>
                              </CardHeader>
                              <CardContent>
                                    {isLoading ? (
                                          <div className="space-y-3">
                                                {[1, 2, 3, 4].map((i) => (
                                                      <Skeleton key={i} className="h-12 w-full" />
                                                ))}
                                          </div>
                                    ) : (
                                          <div className="space-y-2">
                                                {categories.map((category) => {
                                                      const status = getCategoryStatus(category);
                                                      return (
                                                            <div
                                                                  key={category.category}
                                                                  className="border rounded-lg overflow-hidden"
                                                            >
                                                                  {/* Category Header */}
                                                                  <div
                                                                        className="flex items-center gap-3 px-4 py-3 bg-muted/50 cursor-pointer hover:bg-muted/70 transition-colors"
                                                                        onClick={() => toggleCategory(category.category)}
                                                                  >
                                                                        <Checkbox
                                                                              checked={status === "all"}
                                                                              onCheckedChange={() => toggleCategoryPermissions(category)}
                                                                              onClick={(e) => e.stopPropagation()}
                                                                              className={status === "partial" ? "data-[state=checked]:bg-primary/50" : ""}
                                                                        />
                                                                        {category.isExpanded ? (
                                                                              <ChevronDown className="h-4 w-4" />
                                                                        ) : (
                                                                              <ChevronRight className="h-4 w-4" />
                                                                        )}
                                                                        {CATEGORY_ICONS[category.category] || <Settings className="h-4 w-4" />}
                                                                        <span className="font-medium flex-1">{category.category}</span>
                                                                        <Badge variant={status === "all" ? "default" : "secondary"}>
                                                                              {category.permissions.filter((p) => selectedPermissions.has(p.id)).length}
                                                                              /{category.permissions.length}
                                                                        </Badge>
                                                                  </div>

                                                                  {/* Permissions List */}
                                                                  {category.isExpanded && (
                                                                        <div className="divide-y">
                                                                              {category.permissions.map((permission) => (
                                                                                    <label
                                                                                          key={permission.id}
                                                                                          className="flex items-center gap-3 px-4 py-2 pl-14 hover:bg-muted/30 cursor-pointer transition-colors"
                                                                                    >
                                                                                          <Checkbox
                                                                                                checked={selectedPermissions.has(permission.id)}
                                                                                                onCheckedChange={() => togglePermission(permission.id)}
                                                                                          />
                                                                                          <div className="flex-1">
                                                                                                <p className="font-medium text-sm flex items-center gap-2">
                                                                                                      {permission.getLocalizedName(language)}
                                                                                                      {selectedPermissions.has(permission.id) && (
                                                                                                            <CheckCircle2 className="h-3 w-3 text-green-500" />
                                                                                                      )}
                                                                                                </p>
                                                                                                <p className="text-xs text-muted-foreground font-mono">
                                                                                                      {permission.code}
                                                                                                </p>
                                                                                          </div>
                                                                                    </label>
                                                                              ))}
                                                                        </div>
                                                                  )}
                                                            </div>
                                                      );
                                                })}
                                          </div>
                                    )}
                              </CardContent>
                        </Card>
                  </div>
            </div>
      );
}
