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
import { PageHeader } from "@core/ui/page-header";
import { ErrorMessage } from "@core/ui/error-message";
import { EmptyState } from "@core/ui/empty-state";
import { Key, RefreshCw, Info } from "lucide-react";
import {
  PermissionFilterBar,
  PermissionCategoryAccordion,
  PermissionTableSkeleton,
} from "../components";
import { useModuleLocales } from "@core/hooks/use-module-locales";

/**
 * Presentation UI component rendering the permissions view.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*).
 */
export function PermissionsView() {
  useModuleLocales(() => import("../../../locales"), "permissions");

  const { t } = useI18n();
  const {
    groupedPermissions,
    categories,
    totalCount,
    isLoading,
    isGroupedLoading,
    isGroupedError,
    refetch,
    refetchGrouped,
    filter,
  } = usePermissionsViewModel();

  const hasFilters = !!filter.searchValue || !!filter.categoryFilter;
  const isBusy = isLoading || isGroupedLoading;

  const handleRefresh = () => {
    refetch();
    refetchGrouped();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Key}
        title={t("permission.title")}
        description={t("permission.description")}
        actions={
          <>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-nx-ink-3"
                    aria-label={t("permission.infoTooltip")}
                  >
                    <Info className="h-4 w-4" aria-hidden="true" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-xs">
                  <p>{t("permission.infoTooltip")}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <Button
              variant="outline"
              size="icon"
              onClick={handleRefresh}
              aria-label={t("common.refresh")}
            >
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
            </Button>
          </>
        }
      />

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
          {isBusy ? (
            <PermissionTableSkeleton groupCount={3} rowsPerGroup={4} />
          ) : isGroupedError ? (
            // A failed /permissions/grouped call must read as a failure, not as
            // an empty tenant — this is the one branch that used to be missing.
            <ErrorMessage message={t("common.error")} onRetry={refetchGrouped} />
          ) : groupedPermissions.length === 0 ? (
            <EmptyState
              bare
              icon={Key}
              title={t("permission.noPermissionsFound")}
              description={
                hasFilters
                  ? t("permission.adjustFilters")
                  : t("permission.noPermissionsDescription")
              }
            />
          ) : (
            <PermissionCategoryAccordion groups={groupedPermissions} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
