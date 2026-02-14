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
import { BulkScopeSelect } from "./BulkScopeSelect";
import { PermissionCategoryRow, PermissionTreeSkeleton } from "./index";
import type { PermissionTreeProps } from "../viewmodels/useRoleDetailViewModel";
import type { PermissionAssignmentJson } from "../../data/models/RoleModel";

// Category Icons mapping
const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  "Admin Management": <Users className="h-4 w-4" />,
  "Role Management": <Shield className="h-4 w-4" />,
  "Permission Management": <Lock className="h-4 w-4" />,
  "Tenant Management": <Layout className="h-4 w-4" />,
  "User Management": <Users className="h-4 w-4" />,
  "Menu Management": <Settings className="h-4 w-4" />,
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
  assignments,
  onUpdateConfig,
  onBulkScopeUpdate,
  bulkScopeValue,
  setBulkScopeValue,
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
            {/* Bulk Scope Override */}
            <div className="mr-1 flex items-center gap-2 border-r pr-3">
              <span className="whitespace-nowrap text-xs text-muted-foreground">
                {t("role.bulkScope") || "Bulk Scope"}:
              </span>
              <BulkScopeSelect
                value={bulkScopeValue}
                onValueChange={(val) => {
                  setBulkScopeValue(val);
                  if (val) onBulkScopeUpdate(val);
                }}
              />
            </div>
            <Button variant="ghost" size="sm" onClick={onExpandAll}>
              {t("common.expandAll")}
            </Button>
            <Button variant="ghost" size="sm" onClick={onCollapseAll}>
              {t("common.collapseAll")}
            </Button>
          </div>
        </div>
        <div className="relative mt-3">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
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
                assignments={assignments}
                categoryIcon={CATEGORY_ICONS[cat.category]}
                onToggleCategory={() => onToggleCategory(cat.category)}
                onToggleAllInCategory={() => onToggleAllInCategory(cat.permissions)}
                onTogglePermission={onTogglePermission}
                onUpdateConfig={onUpdateConfig}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
