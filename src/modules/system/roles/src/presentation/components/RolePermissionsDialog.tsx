/**
 * Role Permissions Dialog
 *
 * Professional dialog for managing permissions assigned to a role.
 * Pure UI component - all logic is in useRolePermissionsDialog ViewModel.
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
} from "lucide-react";
import { cn } from "@core/common/utils";
import type { Role } from "../../domain/entities/Role";
import { useRolePermissionsDialog } from "../viewmodels/useRolePermissionsDialog";
import type { Permission } from "@modules/system/permissions/src/domain/entities/Permission";
import { PermissionConfigDialog } from "./PermissionConfigDialog";
import { BulkScopeSelect } from "./BulkScopeSelect";
import type { PermissionAssignmentJson } from "../../domain/types/PermissionTypes";

interface RolePermissionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role: Role | null;
  tenantId: string;
}

export function RolePermissionsDialog(props: RolePermissionsDialogProps) {
  const { open, onOpenChange, role } = props;
  const { t, language } = useI18n();
  const vm = useRolePermissionsDialog(props);

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
            <div className="flex items-center gap-4 text-sm">
              {/* Bulk Scope Control */}
              <div className="mr-0 flex items-center gap-2 border-r pr-4">
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
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Layers className="h-4 w-4" />
                <span>{vm.groupCount}</span>
              </div>
              <Separator orientation="vertical" className="h-4" />
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
              ) : vm.groupCount === 0 ? (
                <EmptyState />
              ) : (
                <PermissionGroups vm={vm} />
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
              <Button onClick={vm.save} disabled={vm.isSaving} className="min-w-[100px]">
                {vm.isSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <ShieldCheck className="me-2 h-4 w-4" />
                    {t("common.save") || "Save"}
                  </>
                )}
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

interface PermissionGroupsProps {
  vm: ReturnType<typeof useRolePermissionsDialog>;
}

function PermissionGroups({ vm }: PermissionGroupsProps) {
  return (
    <Accordion
      type="multiple"
      value={vm.expandedGroups}
      onValueChange={vm.setExpandedGroups}
      className="space-y-3"
    >
      {Object.entries(vm.grouped).map(([resource, perms]) => (
        <PermissionGroup key={resource} resource={resource} permissions={perms} vm={vm} />
      ))}
    </Accordion>
  );
}

interface PermissionGroupProps {
  resource: string;
  permissions: Permission[];
  vm: ReturnType<typeof useRolePermissionsDialog>;
}

function PermissionGroup({ resource, permissions, vm }: PermissionGroupProps) {
  const codes = permissions.map((p) => p.code);
  const stats = vm.getGroupStats(codes);

  return (
    <AccordionItem value={resource} className="overflow-hidden rounded-xl border bg-card shadow-sm">
      <AccordionTrigger className="px-4 py-3 hover:bg-muted/50 hover:no-underline [&>svg]:text-muted-foreground">
        <div className="flex flex-1 items-center gap-3">
          {/* Move checkbox outside trigger - use div with checkbox indicator */}
          <div
            className={cn(
              "flex h-4 w-4 shrink-0 cursor-pointer items-center justify-center rounded-sm border border-primary",
              stats.allChecked && "bg-primary",
              stats.someChecked && "bg-primary/50"
            )}
            onClick={(e) => {
              e.stopPropagation();
              vm.toggleGroup(codes);
            }}
          >
            {(stats.allChecked || stats.someChecked) && (
              <Check className="h-3 w-3 text-primary-foreground" />
            )}
          </div>
          <Badge variant={stats.count > 0 ? "default" : "secondary"} className="capitalize">
            {resource}
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
          {permissions.map((p) => (
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

  // Construct simple permission object for dialog
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

      {/* Config Button - Absolute positioned or standard layout? Relative creates stacking context */}
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
