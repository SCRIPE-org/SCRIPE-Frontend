// FILE-EXCEPTION: file length
// UI-EXCEPTION: compact studio layout
/**
 * Role Permissions Dialog
 *
 * Professional dialog for managing permissions assigned to a role.
 * Pure UI component - all logic is in useRolePermissionsDialog ViewModel.
 *
 * Renders backend-grouped PermissionModuleGroup[] (Module → Category → Permissions).
 * Zero client-side groupBy — hierarchy comes 100% from the backend.
 *
 * @module roles/presentation/components
 */
"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@core/ui/dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@core/ui/accordion";
import { Button } from "@core/ui/button";
import { Checkbox } from "@core/ui/checkbox";
import { Input } from "@core/ui/input";
import { ScrollArea } from "@core/ui/scroll-area";
import { Badge } from "@core/ui/badge";
import { Separator } from "@core/ui/separator";
import { useI18n } from "@core/providers/i18n-provider";
import {
  Loader2,
  Search,
  Shield,
  ShieldCheck,
  Check,
  Layers,
  FolderOpen,
  Settings,
  ChevronRight,
  ChevronsUpDown,
  ChevronsDownUp,
} from "lucide-react";
import { cn } from "@core/common/utils";
import type { Role } from "../../domain/entities/Role";
import { useRolePermissionsDialog } from "../viewmodels/useRolePermissionsDialog";
import type {
  Permission,
  PermissionModuleGroup,
  PermissionCategoryGroup,
} from "@modules/identity/permissions";
import { PermissionConfigDialog } from "./PermissionConfigDialog";
import { BulkScopeSelect } from "./BulkScopeSelect";
import type { PermissionAssignmentJson } from "../../domain/types/PermissionTypes";

interface RolePermissionsDialogProps {
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[85vh] max-w-2xl flex-col gap-0 p-0">
        {/* Header */}
        <DialogHeader className="shrink-0 border-b bg-gradient-to-r from-primary/5 to-transparent px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Shield className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-lg font-semibold">
                {t("role.managePermissions") || "Manage Permissions"}
              </DialogTitle>
              {/* Use div instead of DialogDescription to avoid p > div nesting */}
              <div className="mt-0.5 flex items-center gap-2 text-sm text-muted-foreground">
                <Badge variant="secondary" className="font-mono text-xs">
                  {role?.code}
                </Badge>
                <span>•</span>
                <span>{language === "ar" ? role?.nameAr : role?.nameEn}</span>
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* Search & Stats Bar */}
        <div className="shrink-0 border-b bg-muted/30 px-6 py-3">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={t("common.search") || "Search permissions..."}
                value={vm.search}
                onChange={(e) => vm.setSearch(e.target.value)}
                className="bg-background ps-9"
              />
            </div>
            <div className="flex items-center gap-2 text-sm">
              {/* Bulk Scope Control */}
              <div className="flex items-center gap-2 border-r pe-3">
                <span className="whitespace-nowrap text-xs text-muted-foreground">
                  {t("role.bulkScope") || "Bulk Scope"}:
                </span>
                <BulkScopeSelect
                  value={vm.bulkScopeValue}
                  onValueChange={(val: string) => {
                    vm.setBulkScopeValue(val);
                    if (val) vm.bulkUpdateScope(val);
                  }}
                />
              </div>
              {/* Expand / Collapse All */}
              <Button
                id="role-permissions-expand-all"
                variant="ghost"
                size="sm"
                className="h-7 gap-1 px-2 text-xs text-muted-foreground hover:text-foreground"
                onClick={vm.expandAll}
                disabled={vm.isLoading || moduleCount === 0}
              >
                <ChevronsUpDown className="h-3.5 w-3.5" />
                {t("common.expandAll") || "Expand All"}
              </Button>
              <Button
                id="role-permissions-collapse-all"
                variant="ghost"
                size="sm"
                className="h-7 gap-1 px-2 text-xs text-muted-foreground hover:text-foreground"
                onClick={vm.collapseAll}
                disabled={vm.isLoading || moduleCount === 0}
              >
                <ChevronsDownUp className="h-3.5 w-3.5" />
                {t("common.collapseAll") || "Collapse All"}
              </Button>
              <Separator orientation="vertical" className="h-4" />
              {/* Module count */}
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Layers className="h-4 w-4" />
                <span>{moduleCount}</span>
              </div>
              <Separator orientation="vertical" className="h-4" />
              {/* Selected count */}
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-primary" />
                <span className="font-medium text-primary">{vm.selectedCount}</span>
                <span className="text-muted-foreground">/ {vm.totalCount}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content - Scrollable Area */}
        <div className="min-h-0 flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="px-6 py-4">
              {vm.isLoading ? (
                <LoadingState />
              ) : moduleCount === 0 ? (
                <EmptyState />
              ) : (
                <PermissionModulesTree vm={vm} />
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Footer */}
        <DialogFooter className="shrink-0 border-t bg-muted/30 px-6 py-4">
          <div className="flex w-full items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {vm.selectedCount} {t("common.selected") || "selected"}
            </p>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                {t("common.cancel") || "Cancel"}
              </Button>
              <Button onClick={vm.save} loading={vm.isSaving} className="min-w-[100px]">
                {!vm.isSaving && <ShieldCheck className="me-2 h-4 w-4" />}
                {t("common.save") || "Save"}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────

function LoadingState() {
  const { t } = useI18n();
  return (
    <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
      <Loader2 className="mb-3 h-8 w-8 animate-spin" />
      <p>{t("common.loading") || "Loading..."}</p>
    </div>
  );
}

function EmptyState() {
  const { t } = useI18n();
  return (
    <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
      <FolderOpen className="mb-3 h-12 w-12 opacity-50" />
      <p className="font-medium">{t("permission.noPermissionsFound") || "No permissions found"}</p>
    </div>
  );
}

interface PermissionModulesTreeProps {
  vm: ReturnType<typeof useRolePermissionsDialog>;
}

/**
 * Renders the Module → Category → Permission tree.
 * Data comes 100% backend-grouped — zero client-side groupBy.
 *
 * Module-level expand/collapse uses MANUAL toggle state (no outer Radix Accordion).
 * Category-level expand/collapse uses an isolated Radix Accordion per module.
 * This prevents nested Accordion interference that was causing all modules to
 * expand/collapse together.
 */
function PermissionModulesTree({ vm }: PermissionModulesTreeProps) {
  return (
    <div className="space-y-3">
      {vm.groupedModules.map((moduleGroup) => (
        <PermissionModule key={moduleGroup.module} moduleGroup={moduleGroup} vm={vm} />
      ))}
    </div>
  );
}

interface PermissionModuleProps {
  moduleGroup: PermissionModuleGroup;
  vm: ReturnType<typeof useRolePermissionsDialog>;
}

function PermissionModule({ moduleGroup, vm }: PermissionModuleProps) {
  // Aggregate stats across all categories in this module
  const allCodes = moduleGroup.categories.flatMap((c) => c.permissions.map((p) => p.code));
  const stats = vm.getGroupStats(allCodes);

  // ── Each module reads ONLY its own slice of the category expand-state map ──
  const moduleOpenKeys = vm.expandedGroups[moduleGroup.module] ?? [];

  const isExpanded = vm.isModuleExpanded(moduleGroup.module);

  return (
    <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
      {/* Module Header — manual toggle (no Radix AccordionTrigger) */}
      <button
        type="button"
        className="flex w-full items-center gap-3 border-b bg-muted/40 px-4 py-2.5 text-left transition-colors hover:bg-muted/60"
        onClick={() => vm.toggleModule(moduleGroup.module)}
      >
        <div
          className={cn(
            "flex h-4 w-4 shrink-0 cursor-pointer items-center justify-center rounded-sm border border-primary",
            stats.allChecked && "bg-primary",
            stats.someChecked && "bg-primary/50"
          )}
          onClick={(e) => {
            e.stopPropagation(); // don't toggle the module when clicking the checkbox
            vm.toggleGroup(allCodes);
          }}
        >
          {(stats.allChecked || stats.someChecked) && (
            <Check className="h-3 w-3 text-primary-foreground" />
          )}
        </div>
        <span className="text-sm font-semibold capitalize">{moduleGroup.module}</span>
        <div className="me-2 ms-auto text-xs text-muted-foreground">
          <span className={stats.count > 0 ? "font-medium text-primary" : ""}>{stats.count}</span>
          <span> / {stats.total}</span>
        </div>
        <ChevronRight
          className={cn(
            "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200",
            isExpanded && "rotate-90"
          )}
        />
      </button>

      {/* Module Content — conditionally rendered based on manual toggle state */}
      {isExpanded && (
        <div>
          {/* Categories — isolated Radix accordion per module */}
          <Accordion
            type="multiple"
            value={moduleOpenKeys}
            onValueChange={(openKeys) => vm.setModuleExpanded(moduleGroup.module, openKeys)}
            className="divide-y"
          >
            {moduleGroup.categories.map((catGroup) => (
              <PermissionCategory
                key={`${moduleGroup.module}-${catGroup.category}`}
                moduleKey={moduleGroup.module}
                catGroup={catGroup}
                vm={vm}
              />
            ))}
          </Accordion>
        </div>
      )}
    </div>
  );
}

interface PermissionCategoryProps {
  moduleKey: string;
  catGroup: PermissionCategoryGroup;
  vm: ReturnType<typeof useRolePermissionsDialog>;
}

function PermissionCategory({ moduleKey, catGroup, vm }: PermissionCategoryProps) {
  const codes = catGroup.permissions.map((p) => p.code);
  const stats = vm.getGroupStats(codes);
  const accordionKey = `${moduleKey}-${catGroup.category}`;

  return (
    <AccordionItem value={accordionKey} className="border-0">
      <AccordionTrigger className="px-4 py-3 hover:bg-muted/30 hover:no-underline [&>svg]:text-muted-foreground">
        <div className="flex flex-1 items-center gap-3">
          {/* Category toggle checkbox */}
          <div
            className={cn(
              "flex h-3.5 w-3.5 shrink-0 cursor-pointer items-center justify-center rounded-sm border border-primary/70",
              stats.allChecked && "bg-primary",
              stats.someChecked && "bg-primary/50"
            )}
            onClick={(e) => {
              e.stopPropagation();
              vm.toggleGroup(codes);
            }}
          >
            {(stats.allChecked || stats.someChecked) && (
              <Check className="h-2.5 w-2.5 text-primary-foreground" />
            )}
          </div>
          <Badge variant={stats.count > 0 ? "default" : "secondary"} className="text-xs capitalize">
            {catGroup.category}
          </Badge>
          <div className="me-2 ms-auto text-sm">
            <span
              className={stats.count > 0 ? "font-medium text-primary" : "text-muted-foreground"}
            >
              {stats.count}
            </span>
            <span className="text-muted-foreground"> / {stats.total}</span>
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-4 pb-3">
        <div className="grid gap-1.5 pt-1">
          {catGroup.permissions.map((p) => (
            <PermissionItem key={p.id} permission={p} vm={vm} />
          ))}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}

interface PermissionItemProps {
  permission: Permission;
  vm: ReturnType<typeof useRolePermissionsDialog>;
}

function PermissionItem({ permission, vm }: PermissionItemProps) {
  const { language } = useI18n();
  const [showConfig, setShowConfig] = useState(false);
  const isChecked = vm.isChecked(permission.code);
  const assignment = vm.assignments.get(permission.code);
  const hasCustomConfig =
    !!assignment?.scopeOverride || (assignment?.restrictedFields?.length ?? 0) > 0;

  const permissionSimple = {
    id: permission.id,
    code: permission.code,
    displayName: vm.getName(permission),
  };

  const handleUpdateConfig = (newAssignment: PermissionAssignmentJson) => {
    vm.updateAssignment(permission.code, newAssignment);
  };

  return (
    <div className="group relative">
      <label
        className={cn(
          "flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-all",
          isChecked
            ? "border-primary/30 bg-primary/5 shadow-sm"
            : "border-transparent bg-background hover:bg-muted/50"
        )}
      >
        <Checkbox
          checked={isChecked}
          onCheckedChange={() => vm.toggle(permission.code)}
          className="translate-y-[2px]"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <div className={cn("text-sm font-medium", isChecked && "text-primary")}>
              {vm.getName(permission)}
            </div>
            {isChecked && hasCustomConfig && (
              <Badge
                variant="outline"
                className="h-4 border-blue-200 bg-blue-50 px-1 text-[10px] text-blue-700"
              >
                Custom
              </Badge>
            )}
          </div>
          <div className="mt-0.5 font-mono text-xs text-muted-foreground">{permission.code}</div>
        </div>
        {isChecked && (
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Check className="h-3.5 w-3.5" />
          </div>
        )}
      </label>

      {isChecked && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-12 top-1/2 h-8 w-8 -translate-y-1/2 opacity-0 transition-opacity group-hover:opacity-100"
          onClick={(e) => {
            e.stopPropagation();
            setShowConfig(true);
          }}
        >
          <Settings className="h-4 w-4 text-muted-foreground" />
        </Button>
      )}

      {showConfig && (
        <PermissionConfigDialog
          open={showConfig}
          onOpenChange={setShowConfig}
          permission={permissionSimple}
          currentAssignment={assignment}
          onSave={handleUpdateConfig}
        />
      )}
    </div>
  );
}
