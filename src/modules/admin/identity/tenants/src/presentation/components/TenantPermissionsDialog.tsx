// FILE-EXCEPTION: file length
// UI-EXCEPTION: compact studio layout
/**
 * Tenant Permissions Dialog
 *
 * Professional dialog for managing permissions available to a tenant.
 * Pure UI component - all logic is in useTenantPermissionsDialog ViewModel.
 *
 * Renders backend-grouped PermissionModuleGroup[] (Module → Category → Permissions).
 * Zero client-side groupBy — hierarchy comes 100% from the backend.
 *
 * @module tenants/presentation/components
 */
"use client";

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
  Search,
  Shield,
  ShieldCheck,
  Check,
  Layers,
  FolderOpen,
  Building,
  Lock,
  ChevronRight,
  ChevronsUpDown,
  ChevronsDownUp,
} from "lucide-react";
import { LoadingSpinner } from "@core/ui/loading-spinner";
import { cn } from "@core/common/utils";
import { useTenantPermissionsDialog } from "../viewmodels/useTenantPermissionsViewModel";
import type {
  Permission,
  PermissionModuleGroup,
  PermissionCategoryGroup,
} from "@modules/identity/permissions";

interface TenantPermissionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tenantId: string;
  tenantName: string;
  parentTenantId?: string | null;
}

/**
 * Presentation UI component rendering the tenant permissions dialog.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function TenantPermissionsDialog(props: TenantPermissionsDialogProps) {
  const { open, onOpenChange, tenantName } = props;
  const { t } = useI18n();
  const vm = useTenantPermissionsDialog(props);

  const moduleCount = vm.groupedModules.length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[85vh] max-w-2xl flex-col gap-0 p-0">
        {/* Header */}
        <DialogHeader className="shrink-0 border-b border-nx-line bg-gradient-to-r from-nx-accent-wash to-transparent px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-nx-lg bg-nx-accent-wash text-nx-accent">
              <Shield className="h-5 w-5" aria-hidden="true" />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-lg font-semibold">
                {t("tenant.managePermissions")}
              </DialogTitle>
              <div className="mt-0.5 flex items-center gap-2 text-sm text-nx-ink-2">
                <Badge variant="secondary" className="font-mono text-xs">
                  <Building className="me-1 h-3 w-3" aria-hidden="true" />
                  {tenantName}
                </Badge>
                {vm.hasParent && (
                  <>
                    <span aria-hidden="true">•</span>
                    <div className="flex items-center gap-1 text-xs text-nx-ink-2">
                      <Lock className="h-3 w-3" aria-hidden="true" />
                      <span>{t("tenant.limitedByParent")}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* Search & Stats Bar */}
        <div className="shrink-0 border-b border-nx-line bg-nx-raised px-6 py-3">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search
                className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-nx-ink-2"
                aria-hidden="true"
              />
              <Input
                placeholder={t("common.search")}
                value={vm.search}
                onChange={(e) => vm.setSearch(e.target.value)}
                className="ps-9"
              />
            </div>
            <div className="flex items-center gap-2 text-sm">
              {/* Expand / Collapse All */}
              <Button
                id="tenant-permissions-expand-all"
                variant="ghost"
                size="sm"
                className="h-7 gap-1 px-2 text-xs text-nx-ink-2 hover:text-nx-ink"
                onClick={vm.expandAll}
                disabled={vm.isLoading || moduleCount === 0}
              >
                <ChevronsUpDown className="h-3.5 w-3.5" aria-hidden="true" />
                {t("common.expandAll")}
              </Button>
              <Button
                id="tenant-permissions-collapse-all"
                variant="ghost"
                size="sm"
                className="h-7 gap-1 px-2 text-xs text-nx-ink-2 hover:text-nx-ink"
                onClick={vm.collapseAll}
                disabled={vm.isLoading || moduleCount === 0}
              >
                <ChevronsDownUp className="h-3.5 w-3.5" aria-hidden="true" />
                {t("common.collapseAll")}
              </Button>
              <Separator orientation="vertical" className="h-4" />
              <div className="flex items-center gap-1.5 text-nx-ink-2">
                <Layers className="h-4 w-4" aria-hidden="true" />
                <span className="tabular-nums">{moduleCount}</span>
              </div>
              <Separator orientation="vertical" className="h-4" />
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-nx-accent" aria-hidden="true" />
                <span className="font-medium tabular-nums text-nx-accent">
                  {vm.selectedCount}
                </span>
                <span className="tabular-nums text-nx-ink-2">/ {vm.totalCount}</span>
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
        <DialogFooter className="shrink-0 border-t border-nx-line bg-nx-raised px-6 py-4">
          <div className="flex w-full items-center justify-between">
            <p className="text-sm text-nx-ink-2">
              {vm.hasParent && (
                <span className="flex items-center gap-1">
                  <Lock className="h-3 w-3" aria-hidden="true" />
                  {t("tenant.permissionsLimitedByParent")}
                </span>
              )}
              {!vm.hasParent && (
                <span>
                  <span className="tabular-nums">{vm.selectedCount}</span>{" "}
                  {t("common.selected")}
                </span>
              )}
            </p>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                {t("common.cancel")}
              </Button>
              <Button onClick={vm.save} loading={vm.isSaving} className="min-w-[100px]">
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

// ─────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────

function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <LoadingSpinner size="sm" />
    </div>
  );
}

function EmptyState() {
  const { t } = useI18n();
  return (
    <div className="flex flex-col items-center justify-center py-16 text-nx-ink-2">
      <FolderOpen className="mb-3 h-12 w-12 opacity-50" aria-hidden="true" />
      <p className="font-medium">{t("permission.noPermissionsFound")}</p>
    </div>
  );
}

interface PermissionModulesTreeProps {
  vm: ReturnType<typeof useTenantPermissionsDialog>;
}

/**
 * Renders the Module → Category → Permission tree.
 * Data comes 100% backend-grouped — zero client-side groupBy.
 *
 * Module-level expand/collapse uses MANUAL toggle state (no outer Radix Accordion).
 * Category-level expand/collapse uses an isolated Radix Accordion per module.
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
  vm: ReturnType<typeof useTenantPermissionsDialog>;
}

function PermissionModule({ moduleGroup, vm }: PermissionModuleProps) {
  const allCodes = moduleGroup.categories.flatMap((c) => c.permissions.map((p) => p.code));
  const stats = vm.getGroupStats(allCodes);
  const moduleOpenKeys = vm.expandedGroups[moduleGroup.module] ?? [];
  const { t } = useI18n();

  const isExpanded = vm.isModuleExpanded(moduleGroup.module);

  return (
    <div className="overflow-hidden rounded-nx-lg border border-nx-line bg-nx-surface">
      {/* Module Header — manual toggle (no Radix AccordionTrigger) */}
      <button
        type="button"
        className="flex w-full items-center gap-3 border-b border-nx-line bg-nx-raised px-4 py-2.5 text-start transition-colors duration-nx-micro ease-nx-enter motion-reduce:transition-none hover:bg-nx-hover"
        onClick={() => vm.toggleModule(moduleGroup.module)}
      >
        <div
          role="checkbox"
          aria-checked={stats.allChecked ? true : stats.someChecked ? "mixed" : false}
          aria-label={t("common.selectAll")}
          tabIndex={0}
          className={cn(
            "flex h-4 w-4 shrink-0 cursor-pointer items-center justify-center rounded-nx-sm border border-nx-line bg-nx-ground",
            "focus-visible:outline-none focus-visible:shadow-nx-focus",
            stats.allChecked && "border-nx-accent bg-nx-accent-fill text-nx-on-fill",
            stats.someChecked &&
              "border-nx-accent bg-[color:color-mix(in_srgb,var(--nx-accent-fill)_50%,transparent)] text-nx-on-fill"
          )}
          onClick={(e) => {
            e.stopPropagation();
            vm.toggleGroup(allCodes);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              e.stopPropagation();
              vm.toggleGroup(allCodes);
            }
          }}
        >
          {(stats.allChecked || stats.someChecked) && (
            <Check className="h-3 w-3" aria-hidden="true" />
          )}
        </div>
        <span className="text-sm font-semibold capitalize">{moduleGroup.module}</span>
        <div className="me-2 ms-auto text-xs tabular-nums text-nx-ink-2">
          <span className={stats.count > 0 ? "font-medium text-nx-accent" : ""}>
            {stats.count}
          </span>
          <span> / {stats.total}</span>
        </div>
        <ChevronRight
          className={cn(
            "h-4 w-4 shrink-0 text-nx-ink-2 transition-transform duration-nx-micro ease-nx-enter motion-reduce:transition-none",
            isExpanded && "rotate-90"
          )}
          aria-hidden="true"
        />
      </button>

      {/* Module Content — conditionally rendered based on manual toggle state */}
      {isExpanded && (
        <div>
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
  vm: ReturnType<typeof useTenantPermissionsDialog>;
}

function PermissionCategory({ moduleKey, catGroup, vm }: PermissionCategoryProps) {
  const codes = catGroup.permissions.map((p) => p.code);
  const stats = vm.getGroupStats(codes);
  const accordionKey = `${moduleKey}-${catGroup.category}`;
  const { t } = useI18n();

  return (
    <AccordionItem value={accordionKey} className="border-0">
      <AccordionTrigger className="px-4 py-3 hover:bg-nx-hover hover:no-underline [&>svg]:text-nx-ink-2">
        <div className="flex flex-1 items-center gap-3">
          <div
            role="checkbox"
            aria-checked={stats.allChecked ? true : stats.someChecked ? "mixed" : false}
            aria-label={t("common.selectAll")}
            tabIndex={0}
            className={cn(
              "flex h-3.5 w-3.5 shrink-0 cursor-pointer items-center justify-center rounded-nx-sm border border-nx-line bg-nx-ground",
              "focus-visible:outline-none focus-visible:shadow-nx-focus",
              stats.allChecked && "border-nx-accent bg-nx-accent-fill text-nx-on-fill",
              stats.someChecked &&
                "border-nx-accent bg-[color:color-mix(in_srgb,var(--nx-accent-fill)_50%,transparent)] text-nx-on-fill"
            )}
            onClick={(e) => {
              e.stopPropagation();
              vm.toggleGroup(codes);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                e.stopPropagation();
                vm.toggleGroup(codes);
              }
            }}
          >
            {(stats.allChecked || stats.someChecked) && (
              <Check className="h-2.5 w-2.5" aria-hidden="true" />
            )}
          </div>
          <Badge variant={stats.count > 0 ? "default" : "secondary"} className="text-xs capitalize">
            {catGroup.category}
          </Badge>
          <div className="me-2 ms-auto text-sm tabular-nums">
            <span className={stats.count > 0 ? "font-medium text-nx-accent" : "text-nx-ink-2"}>
              {stats.count}
            </span>
            <span className="text-nx-ink-2"> / {stats.total}</span>
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
  vm: ReturnType<typeof useTenantPermissionsDialog>;
}

function PermissionItem({ permission, vm }: PermissionItemProps) {
  const isChecked = vm.isChecked(permission.code);

  return (
    <label
      className={cn(
        "flex cursor-pointer items-center gap-3 rounded-nx-md border p-3",
        "transition-colors duration-nx-micro ease-nx-enter motion-reduce:transition-none",
        isChecked
          ? "border-[color:color-mix(in_srgb,var(--nx-accent)_30%,transparent)] bg-nx-accent-wash"
          : "border-transparent hover:bg-nx-hover"
      )}
    >
      <Checkbox checked={isChecked} onCheckedChange={() => vm.toggle(permission.code)} />
      <div className="min-w-0 flex-1">
        <div className={cn("text-sm font-medium", isChecked && "text-nx-accent")}>
          {vm.getName(permission)}
        </div>
        <div className="mt-0.5 font-mono text-xs text-nx-ink-2">{permission.code}</div>
      </div>
      {isChecked && (
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-nx-accent-fill text-nx-on-fill">
          <Check className="h-3.5 w-3.5" aria-hidden="true" />
        </div>
      )}
    </label>
  );
}
