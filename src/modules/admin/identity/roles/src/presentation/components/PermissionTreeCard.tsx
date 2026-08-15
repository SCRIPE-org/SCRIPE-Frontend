/**
 * Permission Tree Card Component
 *
 * The permission-management surface for a role: a header that states WHERE you
 * are and HOW MUCH is on (title · counter · meter), a single toolbar row that
 * states what you can DO (search · bulk scope · expand), and then the scannable
 * per-module capability matrix.
 *
 * The toolbar used to hold two bordered comboboxes — the search field and a
 * bare "scope" select — stacked on top of each other with no labels, so the
 * scope control read as a duplicate field and nobody could tell whether it
 * described the row they were looking at or the whole role. The scope BULK
 * action now wears a labelled menu button (BulkScopeMenu); the only scope
 * *field* left in the surface is the per-permission one inside
 * PermissionConfigDialog.
 *
 * The backend-driven Module → Category → Permission hierarchy is rendered as
 * delivered — ZERO client-side grouping — the matrix layout is the only thing
 * derived here (see PermissionModuleMatrix).
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
import { Search, Lock, KeyRound, SearchX } from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
import { BulkScopeMenu } from "./BulkScopeMenu";
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
  const hasSearch = searchQuery.trim().length > 0;
  // Nothing to expand and nothing to scope while the surface is empty or in flight.
  const controlsDisabled = isLoading || moduleGroups.length === 0;

  return (
    <Card className="lg:col-span-3">
      {/* space-y-0 hands the rhythm to gap — CardHeader's own space-y would
          otherwise stack on top of it and the three bands would drift apart. */}
      <CardHeader className="gap-4 space-y-0 pb-4">
        {/* ── Row 1: where you are + how much is on ── */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Lock className="h-4 w-4 text-nx-ink-3" aria-hidden="true" />
            {t("roleDetail.permissions")}
          </CardTitle>

          <span className="ms-auto shrink-0 text-xs tabular-nums text-nx-ink-2">
            <span className="font-medium text-nx-ink">{selected}</span>
            <span className="text-nx-ink-3"> / {total} </span>
            {t("roles.permissions")}
          </span>

          <div className="flex shrink-0 items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={onExpandAll}
              disabled={controlsDisabled}
              className="h-7 px-2 text-xs text-nx-ink-2"
            >
              {t("common.expandAll")}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onCollapseAll}
              disabled={controlsDisabled}
              className="h-7 px-2 text-xs text-nx-ink-2"
            >
              {t("common.collapseAll")}
            </Button>
          </div>
        </div>

        {/* ── Row 2: the hairline meter — the only place the accent fills ── */}
        <Progress
          value={pct}
          className="h-1"
          aria-label={t("roles.selectedPermissions")}
          getValueLabel={() => `${selected} / ${total}`}
        />

        {/* ── Row 3: what you can do. One field (search) + one action (bulk scope). ── */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative min-w-0 flex-1">
            <Search
              className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-nx-ink-3"
              aria-hidden="true"
            />
            {/* Deliberately NOT type="search": webkit paints its own clear glyph
                inside the field, which is one more unexplained control in a
                toolbar this defect was about de-cluttering. */}
            <Input
              placeholder={t("roleDetail.searchPlaceholder")}
              aria-label={t("roleDetail.searchPlaceholder")}
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="h-9 ps-9"
            />
          </div>

          <BulkScopeMenu
            value={bulkScopeValue}
            // Same write path as before: remember the picked scope, then push it
            // through the role's bulk handler.
            onValueChange={(val) => {
              setBulkScopeValue(val);
              if (val) onBulkScopeUpdate(val);
            }}
            // Bulk scope only rewrites permissions that are already assigned, so
            // offering it with an empty selection would be a silent no-op.
            disabled={controlsDisabled || selected === 0}
          />
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {isLoading ? (
          <PermissionTreeSkeleton />
        ) : isEmpty ? (
          <div className="p-4">
            {/* Two different nothings: a filter that matched nothing is
                recoverable, a tenant with no permissions is not. */}
            {hasSearch ? (
              <EmptyState
                icon={SearchX}
                title={t("common.noResults")}
                description={t("roles.adjustSearch")}
                action={
                  <Button variant="outline" size="sm" onClick={() => onSearchChange("")}>
                    {t("common.clear")}
                  </Button>
                }
              />
            ) : (
              <EmptyState
                icon={KeyRound}
                title={t("permission.noPermissionsFound")}
                description={t("permission.noPermissionsDescription")}
              />
            )}
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
