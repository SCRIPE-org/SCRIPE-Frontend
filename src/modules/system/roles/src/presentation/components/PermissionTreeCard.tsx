/**
 * Permission Tree Card Component
 *
 * Displays the permissions tree with search, expand/collapse controls.
 * SOLID: Pure UI - receives all props from ViewModel.
 */
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@core/ui/card";
import { Input } from "@core/ui/input";
import { Button } from "@core/ui/button";
import { Search, Lock, Shield, Users, Settings, Layout } from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
import { PermissionCategoryRow, PermissionTreeSkeleton } from "./index";
import type { PermissionTreeProps } from "../viewmodels/useRoleDetailViewModel";

// Category Icons mapping
const CATEGORY_ICONS: Record<string, React.ReactNode> = {
      "Admin Management": <Users className="w-4 h-4" />,
      "Role Management": <Shield className="w-4 h-4" />,
      "Permission Management": <Lock className="w-4 h-4" />,
      "Tenant Management": <Layout className="w-4 h-4" />,
      "User Management": <Users className="w-4 h-4" />,
      "Menu Management": <Settings className="w-4 h-4" />,
};

export function PermissionTreeCard({
      categories,
      isLoading,
      expandedCategories,
      selectedPermissionCodes,
      searchQuery,
      onSearchChange,
      onToggleCategory,
      onToggleAllInCategory,
      onTogglePermission,
      onExpandAll,
      onCollapseAll,
}: PermissionTreeProps) {
      const { t } = useI18n();

      return (
            <Card className="lg:col-span-3">
                  <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                              <CardTitle className="flex items-center gap-2">
                                    <Lock className="h-5 w-5" />
                                    {t("roleDetail.permissions")}
                              </CardTitle>
                              <div className="flex items-center gap-2">
                                    <Button variant="ghost" size="sm" onClick={onExpandAll}>
                                          {t("common.expandAll")}
                                    </Button>
                                    <Button variant="ghost" size="sm" onClick={onCollapseAll}>
                                          {t("common.collapseAll")}
                                    </Button>
                              </div>
                        </div>
                        <div className="relative mt-3">
                              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input
                                    placeholder={t("roleDetail.searchPlaceholder")}
                                    value={searchQuery}
                                    onChange={(e) => onSearchChange(e.target.value)}
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
                                                selectedPermissionCodes={selectedPermissionCodes}
                                                categoryIcon={CATEGORY_ICONS[cat.category]}
                                                onToggleCategory={() => onToggleCategory(cat.category)}
                                                onToggleAllInCategory={() => onToggleAllInCategory(cat.permissions)}
                                                onTogglePermission={onTogglePermission}
                                          />
                                    ))}
                              </div>
                        )}
                  </CardContent>
            </Card>
      );
}
