/**
 * Role Permissions Dialog
 *
 * The "Manage permissions" surface reached from a tenant's roles tab. It edits
 * exactly what the role detail page edits, so it now RENDERS what the role
 * detail page renders: the same PermissionModuleMatrix, the same bulk-scope
 * action, the same per-permission scope dialog, the same skeleton and empty
 * state. Two different editors for one data shape was the real duplication —
 * one of them showed a scope select in its toolbar and a second scope select in
 * the per-permission popup, with nothing saying which applied to what.
 *
 * Pure UI component — all logic stays in useRolePermissionsDialog.
 * Renders backend-grouped PermissionModuleGroup[] (Module → Category → Permissions).
 * Zero client-side groupBy — hierarchy comes 100% from the backend.
 *
 * @module roles/presentation/components
 */
"use client";

import { useMemo } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@core/ui/dialog";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { Badge } from "@core/ui/badge";
import { Progress } from "@core/ui/progress";
import { ScrollArea } from "@core/ui/scroll-area";
import { EmptyState } from "@core/ui/empty-state";
import { useI18n } from "@core/providers/i18n-provider";
import { resolveBilingualLabel } from "@core/common/utils";
import { Search, SearchX, Shield, ShieldCheck, KeyRound } from "lucide-react";
import type { Role } from "../../domain/entities/Role";
import { useRolePermissionsDialog } from "../viewmodels/useRolePermissionsDialog";
import type { Permission } from "@modules/identity/permissions";
import { PermissionModuleMatrix } from "./PermissionModuleMatrix";
import { PermissionTreeSkeleton } from "./PermissionTreeSkeleton";
import { BulkScopeMenu } from "./BulkScopeMenu";

/**
 * Interface defining property specifications, keys types, and structural contract rules for role permissions dialog props.
 *
 * Exported because this dialog is the shared "manage permissions" surface: it is
 * re-exported from the identity barrel and mounted from the tenant roles tab, so
 * a consumer needs to be able to name the shape it is passing.
 */
export interface RolePermissionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role: Role | null;
  tenantId: string;
}

/**
 * Presentation UI component rendering the role permissions dialog.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function RolePermissionsDialog(props: RolePermissionsDialogProps) {
  const { open, onOpenChange, role } = props;
  const { t, language } = useI18n();
  const vm = useRolePermissionsDialog(props);

  const moduleCount = vm.groupedModules.length;
  const hasSearch = vm.search.trim().length > 0;
  const controlsDisabled = vm.isLoading || moduleCount === 0;
  const pct = vm.totalCount > 0 ? (vm.selectedCount / vm.totalCount) * 100 : 0;

  // The matrix reads a Set of codes; the ViewModel owns a Map of assignments.
  // Derive, never duplicate.
  const assignments = vm.assignments;
  const selectedCodes = useMemo(() => new Set(assignments.keys()), [assignments]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* The subject line is a row of elements, not a paragraph, so it cannot be
          a DialogDescription — point the description association at it instead. */}
      <DialogContent
        className="flex h-[85vh] max-w-3xl flex-col gap-0 p-0"
        aria-describedby="role-permissions-subject"
      >
        {/* ── Header: who this is about. The inline-end padding reserves the
             lane the DialogContent close button occupies (end-4, 16px). ── */}
        <DialogHeader className="shrink-0 gap-3 space-y-0 border-b border-nx-line py-4 pe-14 ps-6 text-start">
          <div className="flex items-center gap-3">
            <span
              className="grid h-9 w-9 shrink-0 place-items-center rounded-nx-md border border-nx-line bg-nx-raised text-nx-ink-2"
              aria-hidden="true"
            >
              <Shield className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1">
              <DialogTitle className="truncate text-base">
                {t("role.managePermissions")}
              </DialogTitle>
              {/* A div, not DialogDescription — a <p> cannot legally hold this row. */}
              <div
                id="role-permissions-subject"
                className="mt-1 flex min-w-0 items-center gap-2 text-sm text-nx-ink-2"
              >
                <span className="truncate">
                  {resolveBilingualLabel(role?.nameEn ?? "", role?.nameAr ?? "", language)}
                </span>
                <Badge variant="secondary" className="shrink-0 font-mono text-[11px]">
                  {role?.code}
                </Badge>
              </div>
            </div>
            <span className="shrink-0 text-xs tabular-nums text-nx-ink-2">
              <span className="font-medium text-nx-ink">{vm.selectedCount}</span>
              <span className="text-nx-ink-3"> / {vm.totalCount}</span>
            </span>
          </div>

          <Progress
            value={pct}
            className="h-1"
            aria-label={t("roles.selectedPermissions")}
            getValueLabel={() => `${vm.selectedCount} / ${vm.totalCount}`}
          />
        </DialogHeader>

        {/* ── Toolbar: one field (search) + actions. The bulk scope is a labelled
             ACTION, so it can never be mistaken for a per-permission field. ── */}
        <div className="shrink-0 border-b border-nx-line px-6 py-3">
          <div className="flex flex-col gap-2 md:flex-row md:items-center">
            <div className="relative min-w-0 flex-1">
              <Search
                className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-nx-ink-3"
                aria-hidden="true"
              />
              <Input
                placeholder={t("permission.searchPlaceholder")}
                aria-label={t("permission.searchPlaceholder")}
                value={vm.search}
                onChange={(e) => vm.setSearch(e.target.value)}
                className="h-9 ps-9"
              />
            </div>

            <div className="flex shrink-0 items-center gap-1">
              <BulkScopeMenu
                value={vm.bulkScopeValue}
                // Same write path as before — remember the pick, then apply it.
                onValueChange={(val: string) => {
                  vm.setBulkScopeValue(val);
                  if (val) vm.bulkUpdateScope(val);
                }}
                disabled={controlsDisabled || vm.selectedCount === 0}
              />
              <Button
                id="role-permissions-expand-all"
                variant="ghost"
                size="sm"
                className="h-9 px-2 text-xs text-nx-ink-2"
                onClick={vm.expandAll}
                disabled={controlsDisabled}
              >
                {t("common.expandAll")}
              </Button>
              <Button
                id="role-permissions-collapse-all"
                variant="ghost"
                size="sm"
                className="h-9 px-2 text-xs text-nx-ink-2"
                onClick={vm.collapseAll}
                disabled={controlsDisabled}
              >
                {t("common.collapseAll")}
              </Button>
            </div>
          </div>
        </div>

        {/* ── The permission matrix — identical renderer to the role detail page ── */}
        <div className="min-h-0 flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            {vm.isLoading ? (
              <PermissionTreeSkeleton />
            ) : moduleCount === 0 ? (
              <div className="p-6">
                {hasSearch ? (
                  <EmptyState
                    icon={SearchX}
                    title={t("common.noResults")}
                    description={t("permission.adjustFilters")}
                    action={
                      <Button variant="outline" size="sm" onClick={() => vm.setSearch("")}>
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
              <div>
                {vm.groupedModules.map((moduleGroup) => (
                  <PermissionModuleMatrix
                    key={moduleGroup.module}
                    module={moduleGroup.module}
                    categories={moduleGroup.categories}
                    isExpanded={vm.isModuleExpanded(moduleGroup.module)}
                    selectedPermissionCodes={selectedCodes}
                    assignments={vm.assignments}
                    onToggleModule={() => vm.toggleModule(moduleGroup.module)}
                    onTogglePermission={vm.toggle}
                    // The matrix speaks in Permission objects; the ViewModel in codes.
                    onToggleGroup={(perms: Permission[]) =>
                      vm.toggleGroup(perms.map((p) => p.code))
                    }
                    onUpdateConfig={vm.updateAssignment}
                  />
                ))}
              </div>
            )}
          </ScrollArea>
        </div>

        {/* ── Footer ── */}
        <DialogFooter className="shrink-0 border-t border-nx-line px-6 py-4">
          <div className="flex w-full items-center justify-between gap-3">
            <p className="text-sm tabular-nums text-nx-ink-2">
              {vm.selectedCount} {t("common.selected")}
            </p>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                {t("common.cancel")}
              </Button>
              <Button onClick={vm.save} loading={vm.isSaving} className="min-w-[7rem]">
                {!vm.isSaving && <ShieldCheck className="me-2 h-4 w-4" aria-hidden="true" />}
                {t("common.save")}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
