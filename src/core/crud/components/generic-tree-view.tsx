"use client";

import React, { useEffect, useRef, useMemo, useCallback } from "react";
import { TreeView } from "@core/ui/tree-view";
import { Button } from "@core/ui/button";
import { GenericForm } from "@core/ui/forms/generic-form";
import { GenericModal } from "./generic-modal";
import GenericSelect from "./generic-select";
import {
  // Pagination imports removed in favor of direct standard UI buttons
} from "@core/ui/pagination";
import { Plus } from "lucide-react";
import { cn } from "@core/common/utils";
import { ConfirmationDialog } from "@core/ui/confirmation-dialog";
import { useI18n } from "@core/providers/i18n-provider";
import type { TreeViewModel, TreeNode } from "@core/hooks/use-tree-view-model";
import { appLogger } from "@core/common/logger";
import { usePermission } from "@core/hooks/use-permission";
import { usePermissions } from "@core/hooks/use-permissions";
import type { PermissionCode } from "@core/common/types/permissions";

/**
 * Permission configuration for Tree CRUD operations
 */
export interface TreePermissions {
  canView?: boolean | PermissionCode;
  canCreate?: boolean | PermissionCode;
  canUpdate?: boolean | PermissionCode;
  canDelete?: boolean | PermissionCode;
}

export interface GenericTreeViewProps<T extends TreeNode, TCreate, TUpdate> {
  viewModel: TreeViewModel<T, TCreate, TUpdate>;
  title: string;
  subtitle: string;
  getId: (node: T) => string;
  getLabel: (node: T) => React.ReactNode;
  getChildren: (node: T) => T[] | undefined;
  renderFormFields?: (
    formValues: any,
    setFormValues: (values: any) => void,
    editing: T | null,
    parentForNew: T | null
  ) => any[]; // Return field configuration array instead of JSX
  className?: string;
  showAddRoot?: boolean;
  expandOnCardClick?: boolean; // Enable/disable card click expansion

  /* ========================================
   * CUSTOM ACTIONS
   * ======================================== */
  /**
   * Custom actions to add to each tree node's menu.
   * These are added after the standard Add Child/Edit/Delete actions.
   * @example customActions={(node) => [{ label: "Enter", onClick: () => enterTenant(node) }]}
   */
  customActions?: (node: T) => Array<{
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
    variant?: "default" | "destructive";
    disabled?: boolean;
    requiredPermission?: PermissionCode;
    show?: (node: T) => boolean;
  }>;

  /* ========================================
   * PERMISSIONS CONFIGURATION
   * ======================================== */
  /**
   * Permission configuration for this tree view.
   * If provided, controls visibility of Add/Edit/Delete buttons.
   */
  permissions?: TreePermissions;

  /**
   * Resource name for auto-generating permission codes.
   * If set, auto-checks: {resource}.create, {resource}.update, {resource}.delete
   * @example resource: "tenants" // Auto-checks tenants.create, tenants.update, tenants.delete
   */
  resource?: string;
}

export function GenericTreeView<T extends TreeNode, TCreate, TUpdate>({
  viewModel: vm,
  title,
  subtitle,
  getId,
  getLabel,
  getChildren,
  renderFormFields,
  className,
  showAddRoot = true,
  expandOnCardClick = false,
  customActions,
  permissions,
  resource,
}: GenericTreeViewProps<T, TCreate, TUpdate>) {
  const { t, direction } = useI18n();

  // Debounce mechanism to prevent rapid onOpenChange calls
  const lastOnOpenChangeRef = useRef<number>(0);
  const DEBOUNCE_DELAY = 100; // 100ms debounce

  // Fetch on mount and when pagination or search changes
  useEffect(() => {
    vm.listTree();
  }, [vm.listTree]);

  // ========================================
  // PERMISSION CHECKING LOGIC
  // ========================================
  // Call permission hooks at the top level (not inside useMemo/useCallback)
  const resourceCreatePerm = usePermission(resource ? `${resource}.create` : "");
  const resourceUpdatePerm = usePermission(resource ? `${resource}.update` : "");
  const resourceDeletePerm = usePermission(resource ? `${resource}.delete` : "");

  // Helper function to resolve permission values (no hooks inside)
  const resolvePermissionValue = useCallback(
    (value: boolean | PermissionCode | undefined, fallbackPermission: boolean): boolean => {
      if (value === undefined) {
        return fallbackPermission;
      }
      if (typeof value === "boolean") {
        return value;
      }
      // For string permission codes, we can't call hooks here
      // The caller should use the resource-based permissions instead
      return fallbackPermission;
    },
    []
  );

  const { hasPermission } = usePermissions();

  const effectivePermissions = useMemo(() => {
    if (permissions) {
      return {
        canCreate: resolvePermissionValue(permissions.canCreate, resourceCreatePerm),
        canUpdate: resolvePermissionValue(permissions.canUpdate, resourceUpdatePerm),
        canDelete: resolvePermissionValue(permissions.canDelete, resourceDeletePerm),
      };
    }
    if (resource) {
      return {
        canCreate: resourceCreatePerm,
        canUpdate: resourceUpdatePerm,
        canDelete: resourceDeletePerm,
      };
    }
    return { canCreate: true, canUpdate: true, canDelete: true };
  }, [
    permissions,
    resource,
    resolvePermissionValue,
    resourceCreatePerm,
    resourceUpdatePerm,
    resourceDeletePerm,
  ]);

  // Determine button visibility
  const showAddButton = showAddRoot && effectivePermissions.canCreate;

  // Remove interfering focus management - let natural input behavior work

  const toolbar = !vm.config.selectable ? (
    <div className="flex items-center gap-2">
      {showAddButton && (
        <Button size="sm" onClick={() => vm.openAddChild(null)}>
          <Plus className="mr-2 h-4 w-4 rtl:ml-2 rtl:mr-0" />
          {t("common.add")}
        </Button>
      )}
      {/* Advanced Pagination Controls from GenericCrudView / GenericTable */}
      <div className="hidden items-center gap-2 md:flex">
        {/* Page Size Selector */}
        <div className="flex items-center gap-2 border-r pr-4 rtl:border-l rtl:border-r-0 rtl:pl-4 rtl:pr-0">
          <span className="text-sm text-muted-foreground">{t("table.show")}:</span>
          <GenericSelect
            type="single"
            options={[5, 10, 25, 50, 100].map((size) => ({
              value: String(size),
              label: String(size),
            }))}
            value={String(vm.pagination.pageSize)}
            onValueChange={(v: string | string[]) =>
              vm.changePageSize(Number(typeof v === "string" ? v : v[0]))
            }
            className="h-8 w-auto min-w-[70px] max-w-[90px] text-center font-medium"
            allowClear={false}
          />
          <span className="text-sm text-muted-foreground">{t("table.perPage")}</span>
        </div>

        {vm.pagination.pagesCount > 1 && (
          <div className="flex items-center gap-2">
            {/* First Page */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => vm.changePage(1)}
              disabled={vm.pagination.page === 1}
              className={cn("h-8 w-8 p-0", direction === "rtl" && "rotate-180")}
              title={t("table.firstPage") || "First Page"}
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
            </Button>

            {/* Previous Page */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => vm.changePage(Math.max(1, vm.pagination.page - 1))}
              disabled={vm.pagination.page === 1}
              className={cn("h-8 w-8 p-0", direction === "rtl" && "rotate-180")}
              title={t("table.previousPage") || "Previous Page"}
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Button>

            {/* Page Numbers with Smart Truncation */}
            <div className="flex items-center gap-1">
              {(() => {
                const current = vm.pagination.page;
                const total = vm.pagination.pagesCount;
                const pages: (number | string)[] = [];

                if (total <= 7) {
                  for (let i = 1; i <= total; i++) pages.push(i);
                } else {
                  if (current <= 4) {
                    for (let i = 1; i <= 5; i++) pages.push(i);
                    pages.push("...");
                    pages.push(total);
                  } else if (current >= total - 3) {
                    pages.push(1);
                    pages.push("...");
                    for (let i = total - 4; i <= total; i++) pages.push(i);
                  } else {
                    pages.push(1);
                    pages.push("...");
                    for (let i = current - 1; i <= current + 1; i++) pages.push(i);
                    pages.push("...");
                    pages.push(total);
                  }
                }

                return pages.map((page, index) => {
                  if (page === "...") {
                    return (
                      <span key={`ellipsis-${index}`} className="px-2 py-1 text-muted-foreground">
                        ...
                      </span>
                    );
                  }
                  const pageNum = page as number;
                  const isActive = pageNum === current;
                  return (
                    <Button
                      key={pageNum}
                      variant={isActive ? "default" : "outline"}
                      size="sm"
                      onClick={() => vm.changePage(pageNum)}
                      className={cn(
                        "h-8 w-8 p-0",
                        isActive && "bg-primary text-primary-foreground shadow-sm"
                      )}
                    >
                      {pageNum}
                    </Button>
                  );
                });
              })()}
            </div>

            {/* Next Page */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => vm.changePage(Math.min(vm.pagination.pagesCount, vm.pagination.page + 1))}
              disabled={vm.pagination.page === vm.pagination.pagesCount}
              className={cn("h-8 w-8 p-0", direction === "rtl" && "rotate-180")}
              title={t("table.nextPage") || "Next Page"}
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Button>

            {/* Last Page */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => vm.changePage(vm.pagination.pagesCount)}
              disabled={vm.pagination.page === vm.pagination.pagesCount}
              className={cn("h-8 w-8 p-0", direction === "rtl" && "rotate-180")}
              title={t("table.lastPage") || "Last Page"}
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              </svg>
            </Button>
          </div>
        )}
      </div>
    </div>
  ) : undefined;

  return (
    <main className={cn("space-y-4", className)}>
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="text-muted-foreground">{subtitle}</p>
      </header>

      <TreeView<T>
        data={vm.tree}
        getId={getId}
        getLabel={getLabel}
        getChildren={getChildren}
        search={{
          value: vm.searchValue, // Use immediate display value
          onChange: vm.handleSearchChange, // Use new controlled handler
          placeholder: t("common.search"),
          inputRef: vm.searchInputRef,
        }}
        toolbar={toolbar}
        loading={vm.loading}
        emptyMessage={t("common.noData")}
        actions={
          vm.config.selectable
            ? undefined
            : (n) => {
              const actions = [];
              // Add Child - requires create permission
              if (effectivePermissions.canCreate) {
                actions.push({
                  label: t("common.add_child") ?? "Add child",
                  onClick: () => vm.openAddChild(n),
                  disabled: vm.loading,
                });
              }
              // Edit - requires update permission
              if (effectivePermissions.canUpdate) {
                actions.push({
                  label: t("common.edit"),
                  onClick: () => vm.openEdit(n),
                  disabled: vm.loading,
                });
              }
              // Custom actions (added before Delete)
              if (customActions) {
                const custom = customActions(n);
                custom.forEach((action) => {
                  if (action.show && !action.show(n)) return;
                  if (action.requiredPermission && !hasPermission(action.requiredPermission)) {
                    return;
                  }

                  actions.push({
                    label: action.label,
                    onClick: action.onClick,
                    variant: action.variant,
                    icon: action.icon,
                    disabled: action.disabled || vm.loading,
                  });
                });
              }
              // Delete - requires delete permission (stays at bottom)
              if (effectivePermissions.canDelete) {
                actions.push({
                  label: t("common.delete"),
                  onClick: () => vm.deleteItem(n),
                  variant: "destructive" as const,
                  disabled: vm.loading,
                });
              }
              return actions;
            }
        }
        selectable={vm.config.selectable}
        selectedValues={vm.selectedValues}
        onSelectionChange={vm.handleSelectionChange}
        getValueToSend={vm.config.getValueToSend}
        disabled={vm.disabled}
        expandOnCardClick={expandOnCardClick}
      />

      {/* Fixed GenericModal - Only show if not in selectable mode */}
      {!vm.config.selectable && renderFormFields && (
        <GenericModal
          open={vm.modalOpen}
          onOpenChange={(open) => {
            const now = Date.now();
            const timeSinceLastCall = now - lastOnOpenChangeRef.current;

            // Debounce rapid calls (likely from Radix UI internal behavior)
            if (timeSinceLastCall < DEBOUNCE_DELAY) {
              return;
            }

            lastOnOpenChangeRef.current = now;

            // Only handle closing when user explicitly wants to close
            // (ESC key, X button, backdrop click)
            if (!open) {
              vm.setModalOpen(false);
              vm.resetForm();
            }
            // Don't handle opening - let the view model control that
          }}
          title={
            vm.editing
              ? `${t("common.edit")} ${vm.config.itemTypeName}`
              : `${t("common.add")} ${vm.config.itemTypeName}`
          }
          description={
            vm.editing
              ? `Edit the ${vm.config.itemTypeName?.toLowerCase() ?? "item"} details below.`
              : `Add a new ${vm.config.itemTypeName?.toLowerCase() ?? "item"} below.`
          }
        >
          <GenericForm
            fields={renderFormFields(vm.formValues, vm.setFormValues, vm.editing, vm.parentForNew)}
            initialValues={vm.formValues}
            onSubmit={vm.onSubmit}
            onCancel={() => {
              appLogger.info("Cancel button clicked - resetting form");
              vm.setModalOpen(false);
              vm.resetForm(); // Only reset form on intentional cancel
            }}
          />
        </GenericModal>
      )}

      {/* Enhanced Confirmation Dialog - Only show if not in selectable mode */}
      {!vm.config.selectable && (
        <ConfirmationDialog
          open={vm.showConfirmation}
          onOpenChange={(open) => !open && vm.cancelDelete()}
          title={t("common.confirmDelete")}
          description={`${t("common.deleteConfirmation").replace(
            "{itemType}",
            vm.deleteOptions.itemType || t("common.item")
          )} "${vm.deleteOptions.itemName}". ${t("common.deleteWarning")}`}
          confirmText={vm.isDeleting ? t("common.deleting") : t("common.delete")}
          cancelText={t("common.cancel")}
          variant="destructive"
          isLoading={vm.isDeleting}
          onConfirm={vm.executeDelete}
          onCancel={vm.cancelDelete}
        />
      )}
    </main>
  );
}
