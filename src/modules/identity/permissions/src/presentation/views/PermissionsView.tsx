/**
 * Permissions View
 *
 * Read-only view for system permissions grouped by category.
 * SOLID: Pure UI - no useState, all state from ViewModel.
 */
"use client";

import { usePermissionsViewModel } from "../viewmodels/usePermissionsViewModel";
import { useI18n } from "@core/providers/i18n-provider";
import { Button } from "@core/ui/button";
import { Card, CardContent } from "@core/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@core/ui/tooltip";
import { Key, RefreshCw, Info } from "lucide-react";
import {
  PermissionFilterBar,
  PermissionCategoryAccordion,
  PermissionTableSkeleton,
} from "../components";
import { useModuleLocales } from "@core/hooks/use-module-locales";

export function PermissionsView() {
  useModuleLocales(() => import("../../../locales"), "permissions");

  const { t } = useI18n();
  const { groupedPermissions, categories, totalCount, isLoading, isGroupedLoading, refetch, filter } =
    usePermissionsViewModel();

  const hasFilters = !!filter.searchValue || !!filter.categoryFilter;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("permission.title")}</h1>
          <p className="text-muted-foreground">{t("permission.description")}</p>
        </div>
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="text-muted-foreground">
                  <Info className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-xs">
                <p>{t("permission.infoTooltip")}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <Button variant="outline" size="icon" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Filters - props from ViewModel */}
      <PermissionFilterBar
        searchValue={filter.searchValue}
        onSearchChange={filter.onSearchChange}
        categoryFilter={filter.categoryFilter}
        onCategoryChange={filter.onCategoryChange}
        categories={categories}
        totalCount={totalCount}
      />

      {/* Content */}
      <Card>
        <CardContent className="pt-6">
          {isLoading || isGroupedLoading ? (
            <PermissionTableSkeleton groupCount={3} rowsPerGroup={4} />
          ) : groupedPermissions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Key className="mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="mb-2 text-lg font-semibold">{t("permission.noPermissionsFound")}</h3>
              <p className="text-center text-muted-foreground">
                {hasFilters
                  ? t("permission.adjustFilters")
                  : t("permission.noPermissionsDescription")}
              </p>
            </div>
          ) : (
            <PermissionCategoryAccordion groups={groupedPermissions} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
