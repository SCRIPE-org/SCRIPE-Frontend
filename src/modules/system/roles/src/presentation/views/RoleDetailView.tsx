/**
 * Role Detail View
 *
 * Displays role details with permissions tree for assignment.
 * Refactored to use extracted components and localization.
 */
"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useI18n } from "@core/providers/i18n-provider";

import { Card, CardContent, CardHeader, CardTitle } from "@core/ui/card";
import { Input } from "@core/ui/input";
import { Button } from "@core/ui/button";
import { useEnhancedToast } from "@core/hooks/use-enhanced-toast";

import { Search, Lock, Shield, Users, Settings, Layout } from "lucide-react";

import { systemContainer } from "@modules/system/di";
import type { Permission } from "@modules/system/permissions/src/domain/entities/Permission";
import type { Role } from "../../domain/entities/Role";

import {
      RoleInfoCard,
      RoleDetailHeader,
      PermissionCategoryRow,
      PermissionTreeSkeleton,
} from "../components";

// Category Icons mapping
const CATEGORY_ICONS: Record<string, React.ReactNode> = {
      "Admin Management": <Users className="w-4 h-4" />,
      "Role Management": <Shield className="w-4 h-4" />,
      "Permission Management": <Lock className="w-4 h-4" />,
      "Tenant Management": <Layout className="w-4 h-4" />,
      "User Management": <Users className="w-4 h-4" />,
      "Menu Management": <Settings className="w-4 h-4" />,
};

export default function RoleDetailView() {
      const { t, language } = useI18n();
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

      // Fetch role's current permissions using repository
      const { data: rolePermissions, isLoading: rolePermissionsLoading } = useQuery<any[]>({
            queryKey: ["rolePermissions", roleId],
            queryFn: () => roleRepository.getRolePermissions(roleId),
            enabled: !!roleId,
      });

      // Fetch available permissions (filtered to user's permissions only)
      const { data: allPermissions, isLoading: permissionsLoading } = useQuery<Permission[]>({
            queryKey: ["myPermissions"],
            queryFn: () => permissionRepository.getMyPermissions(),
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
                        description: t("roleDetail.permissionsSaved"),
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
      const categories = useMemo(() => {
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
                  const category = permission.category || t("roleDetail.otherCategory");
                  if (!acc[category]) acc[category] = [];
                  acc[category].push(permission);
                  return acc;
            }, {} as Record<string, Permission[]>);

            return Object.entries(grouped)
                  .map(([category, permissions]) => ({
                        category,
                        permissions: permissions.sort((a, b) => a.displayOrder - b.displayOrder),
                  }))
                  .sort((a, b) => a.category.localeCompare(b.category));
      }, [allPermissions, searchQuery, language, t]);

      // Toggle category expansion
      const toggleCategory = useCallback((category: string) => {
            setExpandedCategories((prev) => {
                  const next = new Set(prev);
                  next.has(category) ? next.delete(category) : next.add(category);
                  return next;
            });
      }, []);

      // Toggle permission selection
      const togglePermission = useCallback((permissionId: string) => {
            setSelectedPermissions((prev) => {
                  const next = new Set(prev);
                  next.has(permissionId) ? next.delete(permissionId) : next.add(permissionId);
                  return next;
            });
      }, []);

      // Toggle all permissions in a category
      const toggleCategoryPermissions = useCallback(
            (permissions: Permission[]) => {
                  const categoryIds = permissions.map((p) => p.id);
                  const allSelected = categoryIds.every((id) => selectedPermissions.has(id));

                  setSelectedPermissions((prev) => {
                        const next = new Set(prev);
                        categoryIds.forEach((id) => (allSelected ? next.delete(id) : next.add(id)));
                        return next;
                  });
            },
            [selectedPermissions]
      );

      // Expand/collapse all
      const expandAll = useCallback(() => {
            setExpandedCategories(new Set(categories.map((c) => c.category)));
      }, [categories]);

      const collapseAll = useCallback(() => {
            setExpandedCategories(new Set());
      }, []);

      // Save handler
      const handleSave = useCallback(() => {
            saveMutation.mutate(Array.from(selectedPermissions));
      }, [selectedPermissions, saveMutation]);

      const isLoading = roleLoading || permissionsLoading || rolePermissionsLoading;

      return (
            <div className="container mx-auto py-6 space-y-6">
                  {/* Header */}
                  <RoleDetailHeader
                        role={role}
                        isLoading={roleLoading}
                        isSaving={saveMutation.isPending}
                        onBack={() => router.back()}
                        onSave={handleSave}
                        t={t}
                  />

                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                        {/* Role Info Sidebar */}
                        <RoleInfoCard
                              role={role}
                              isLoading={roleLoading}
                              selectedCount={selectedPermissions.size}
                              totalCount={allPermissions?.length || 0}
                              t={t}
                        />

                        {/* Permissions Tree */}
                        <Card className="lg:col-span-3">
                              <CardHeader className="pb-3">
                                    <div className="flex items-center justify-between">
                                          <CardTitle className="flex items-center gap-2">
                                                <Lock className="h-5 w-5" />
                                                {t("roleDetail.permissions")}
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
                                                placeholder={t("roleDetail.searchPlaceholder")}
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                className="pl-9"
                                          />
                                    </div>
                              </CardHeader>
                              <CardContent>
                                    {isLoading ? (
                                          <PermissionTreeSkeleton />
                                    ) : (
                                          <div className="space-y-2">
                                                {categories.map((cat) => (
                                                      <PermissionCategoryRow
                                                            key={cat.category}
                                                            category={cat.category}
                                                            permissions={cat.permissions}
                                                            isExpanded={expandedCategories.has(cat.category)}
                                                            selectedPermissions={selectedPermissions}
                                                            categoryIcon={CATEGORY_ICONS[cat.category]}
                                                            language={language}
                                                            onToggleCategory={() => toggleCategory(cat.category)}
                                                            onToggleAllInCategory={() => toggleCategoryPermissions(cat.permissions)}
                                                            onTogglePermission={togglePermission}
                                                      />
                                                ))}
                                          </div>
                                    )}
                              </CardContent>
                        </Card>
                  </div>
            </div>
      );
}
