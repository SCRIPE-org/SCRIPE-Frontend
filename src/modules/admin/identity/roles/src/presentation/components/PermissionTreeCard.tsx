/**
 * Permission Tree Card Component
 *
 * The permission-management surface for a role: a slim, sticky toolbar (search,
 * bulk scope, live summary meter, expand/collapse) over a scannable per-module
 * capability matrix. The backend-driven Module → Category → Permission hierarchy
 * is rendered as delivered — ZERO client-side grouping — the matrix layout is the
 * only thing derived here (see PermissionModuleMatrix).
 *
 * Consumed in: RoleDetailView
 * Data source: GET /roles/myTenant/available-permissions/grouped
 */
"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@core/ui/card";
import { Input } from "@core/ui/input";
import { Button } from "@core/ui/button";
import { Progress } from "@core/ui/progress";
import { EmptyState } from "@core/ui/empty-state";
import { Search, Lock, KeyRound } from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
import { BulkScopeSelect } from "./BulkScopeSelect";
import { PermissionModuleMatrix } from "./PermissionModuleMatrix";
import { PermissionTreeSkeleton } from "./PermissionTreeSkeleton";
import type { PermissionTreeProps } from "../viewmodels/useRoleDetailViewModel";

/**
 * Presentation UI component rendering the permission tree card.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
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

  // Live summary — selected vs. total across what is currently loaded (so it
  // reflects the visible set while a search filter is active).
  const { total, selected } = useMemo(() => {
    let tot = 0;
    let sel = 0;
    for (const mg of moduleGroups) {
      for (const cat of mg.categories) {
        for (const p of cat.permissions) {
          tot += 1;
          if (selectedPermissionCodes.has(p.code)) sel += 1;
        }
      }
    }
    return { total: tot, selected: sel };
  }, [moduleGroups, selectedPermissionCodes]);

  const pct = total > 0 ? (selected / total) * 100 : 0;
  const isEmpty = !isLoading && moduleGroups.length === 0;

  return (
    <Card className="lg:col-span-3">
      <CardHeader className="gap-3 pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Lock className="h-4 w-4 text-nx-ink-2" />
          {t("roleDetail.permissions")}
        </CardTitle>

        {/* ── Sticky sub-toolbar — its own row, bulk scope pulled out of the title ── */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-nx-ink-3" />
            <Input
              placeholder={t("roleDetail.searchPlaceholder")}
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="ps-9"
            />
          </div>

          <BulkScopeSelect
            value={bulkScopeValue}
            onValueChange={(val) => {
              setBulkScopeValue(val);
              if (val) onBulkScopeUpdate(val);
            }}
          />
        </div>

        {/* ── Live progress meter + expand controls ── */}
        <div className="flex items-center gap-3">
          <span className="shrink-0 text-xs tabular-nums text-nx-ink-2">
            <span className="font-medium text-nx-ink">{selected}</span> / {total}{" "}
            {t("roles.permissions")}
          </span>
          <Progress value={pct} className="h-1 flex-1" aria-label={t("roleDetail.permissions")} />
          <div className="flex shrink-0 items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={onExpandAll}
              className="h-7 px-2 text-xs text-nx-ink-2"
            >
              {t("common.expandAll")}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onCollapseAll}
              className="h-7 px-2 text-xs text-nx-ink-2"
            >
              {t("common.collapseAll")}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {isLoading ? (
          <PermissionTreeSkeleton />
        ) : isEmpty ? (
          <div className="p-4">
            <EmptyState
              icon={KeyRound}
              title={t("common.noResults")}
              description={t("roles.adjustSearch")}
            />
          </div>
        ) : (
          // No overflow-hidden here: it would trap the sticky module headers.
          <div className="border-t border-nx-line">
            {moduleGroups.map((mg) => (
              <PermissionModuleMatrix
                key={mg.module}
                module={mg.module}
                categories={mg.categories}
                isExpanded={expandedKeys.has(`module:${mg.module}`)}
                selectedPermissionCodes={selectedPermissionCodes}
                assignments={assignments}
                onToggleModule={() => onToggleExpand(`module:${mg.module}`)}
                onTogglePermission={onTogglePermission}
                onToggleGroup={onToggleAllInCategory}
                onUpdateConfig={onUpdateConfig}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
