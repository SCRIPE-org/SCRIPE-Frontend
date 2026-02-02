/**
 * Permissions View
 *
 * Read-only view for system permissions grouped by category.
 * Permissions are seeded and cannot be created, edited, or deleted.
 */
"use client";

import { useState } from "react";
import { usePermissionsViewModel } from "../viewmodels/usePermissionsViewModel";
import { useI18n } from "@core/providers/i18n-provider";
import { useDebounce } from "@core/hooks/use-validation";
import { Button } from "@core/ui/button";
import { Card, CardContent } from "@core/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@core/ui/tooltip";
import { Key, RefreshCw, Info } from "lucide-react";
import { PermissionFilterBar, PermissionCategoryAccordion, PermissionTableSkeleton } from "../components";

export function PermissionsView() {
      const { t } = useI18n();
      const [searchInput, setSearchInput] = useState("");
      const [categoryFilter, setCategoryFilter] = useState<string | undefined>();
      const debouncedSearch = useDebounce(searchInput, 300);

      const { groupedPermissions, categories, totalCount, isLoading, refetch } =
            usePermissionsViewModel({ search: debouncedSearch, category: categoryFilter });

      const hasFilters = !!searchInput || !!categoryFilter;

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

                  {/* Filters */}
                  <PermissionFilterBar
                        searchValue={searchInput}
                        onSearchChange={setSearchInput}
                        categoryFilter={categoryFilter}
                        onCategoryChange={setCategoryFilter}
                        categories={categories}
                        totalCount={totalCount}
                  />

                  {/* Content */}
                  <Card>
                        <CardContent className="pt-6">
                              {isLoading ? (
                                    <PermissionTableSkeleton groupCount={3} rowsPerGroup={4} />
                              ) : groupedPermissions.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-12">
                                          <Key className="h-12 w-12 text-muted-foreground mb-4" />
                                          <h3 className="text-lg font-semibold mb-2">{t("permission.noPermissionsFound")}</h3>
                                          <p className="text-muted-foreground text-center">
                                                {hasFilters ? t("permission.adjustFilters") : t("permission.noPermissionsDescription")}
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
