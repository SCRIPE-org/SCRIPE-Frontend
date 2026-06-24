// UI-EXCEPTION: compact studio layout
/**
 * Permission Tree Card Component
 *
 * Displays the backend-driven Module → Category → Permission hierarchy.
 * ZERO client-side grouping — the tree comes from the backend.
 *
 * Consumed in: RoleDetailView (Permissions Tab)
 * Data source: GET /roles/myTenant/available-permissions/grouped
 */
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@core/ui/card";
import { Input } from "@core/ui/input";
import { Button } from "@core/ui/button";
import { Badge } from "@core/ui/badge";
import { Search, Lock, Layers, Key, ChevronDown, ChevronRight } from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
import { BulkScopeSelect } from "./BulkScopeSelect";
import { PermissionCategoryRow, PermissionTreeSkeleton } from "./index";
import type { PermissionTreeProps } from "../viewmodels/useRoleDetailViewModel";

/**
 * React presentation component representing the permission tree card UI element.
 */
export function PermissionTreeCard({
  moduleGroups,
  isLoading,
  expandedKeys,
  selectedPermissionCodes,
  searchQuery,
  onSearchChange,
  onToggleExpand,
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
          <div className="space-y-3">
            {moduleGroups.map((moduleGroup) => {
              const moduleKey = `module:${moduleGroup.module}`;
              // Module is expanded if its key is in expandedKeys.
              // All modules are auto-expanded on first data load (see useRoleDetailViewModel).
              const isModuleExpanded = expandedKeys.has(moduleKey);
              const totalInModule = moduleGroup.categories.reduce(
                (sum, cat) => sum + cat.permissions.length,
                0
              );
              const selectedInModule = moduleGroup.categories.reduce(
                (sum, cat) =>
                  sum + cat.permissions.filter((p) => selectedPermissionCodes.has(p.code)).length,
                0
              );

              return (
                <div key={moduleGroup.module} className="overflow-hidden rounded-lg border bg-card">
                  {/* ── Module Header ── */}
                  <button
                    type="button"
                    className="flex w-full items-center gap-2.5 border-b bg-muted/30 px-4 py-2.5 text-left transition-colors hover:bg-muted/50"
                    onClick={() => onToggleExpand(moduleKey)}
                  >
                    {isModuleExpanded ? (
                      <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground rtl:rotate-180" />
                    )}
                    <Layers className="h-4 w-4 shrink-0 text-primary" />
                    <span className="text-sm font-semibold tracking-wide">
                      {moduleGroup.module}
                    </span>
                    <div className="ms-auto flex items-center gap-2">
                      {selectedInModule > 0 && (
                        <Badge className="text-xs">{selectedInModule} selected</Badge>
                      )}
                      <Badge variant="secondary" className="text-xs">
                        {totalInModule}
                      </Badge>
                    </div>
                  </button>

                  {/* ── Category rows within the module ── */}
                  {isModuleExpanded && (
                    <div className="divide-y">
                      {moduleGroup.categories.map((cat) => {
                        const catKey = `cat:${moduleGroup.module}:${cat.category}`;
                        return (
                          <PermissionCategoryRow
                            key={catKey}
                            category={cat.category}
                            permissions={cat.permissions}
                            isExpanded={expandedKeys.has(catKey)}
                            selectedPermissionCodes={selectedPermissionCodes}
                            assignments={assignments}
                            categoryIcon={<Key className="h-3.5 w-3.5" />}
                            onToggleCategory={() => onToggleExpand(catKey)}
                            onToggleAllInCategory={() => onToggleAllInCategory(cat.permissions)}
                            onTogglePermission={onTogglePermission}
                            onUpdateConfig={onUpdateConfig}
                          />
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
