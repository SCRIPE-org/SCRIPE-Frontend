"use client";

import { useEffect, useRef, useMemo, useCallback } from "react";
import { TreeView } from "@core/ui/tree-view";
import { Button } from "@core/ui/button";
import { GenericForm } from "@core/ui/forms/generic-form";
import { GenericModal } from "./generic-modal";
import GenericSelect from "./generic-select";
import {
  Pagination as Pager,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@core/ui/pagination";
import { Plus } from "lucide-react";
import { cn } from "@core/common/utils";
import { ConfirmationDialog } from "@core/ui/confirmation-dialog";
import { useI18n } from "@core/providers/i18n-provider";
import type { TreeViewModel, TreeNode } from "@core/hooks/use-tree-view-model";
import { appLogger } from "@core/common/logger";
import { usePermission } from "@core/hooks/use-permission";
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
  const { t } = useI18n();

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
  }, [permissions, resource, resolvePermissionValue, resourceCreatePerm, resourceUpdatePerm, resourceDeletePerm]);

  // Determine button visibility
  const showAddButton = showAddRoot && effectivePermissions.canCreate;

  // Remove interfering focus management - let natural input behavior work

  const toolbar = !vm.config.selectable ? (
    <div className="flex items-center gap-2">
      {showAddButton && (
        <Button size="sm" onClick={() => vm.openAddChild(null)}>
          <Plus className="h-4 w-4 mr-2 rtl:mr-0 rtl:ml-2" />
          {t("common.add")}
        </Button>
      )}
      {/* Pagination controls */}
      <div className="hidden md:flex items-center gap-2">
        <GenericSelect
          type="single"
          options={[10, 25, 50, 100].map((size) => ({
            value: String(size),
            label: String(size),
          }))}
          value={String(vm.pagination.pageSize)}
          onValueChange={(v: string | string[]) =>
            vm.changePageSize(Number(typeof v === "string" ? v : v[0]))
          }
          className="min-w-[100px] w-auto max-w-[120px] h-8 text-center font-medium"
          allowClear={false}
        />
        {vm.pagination.pagesCount > 1 && (
          <Pager>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    vm.changePage(Math.max(1, vm.pagination.page - 1));
                  }}
                  className={
                    vm.pagination.page === 1
                      ? "pointer-events-none opacity-50"
                      : ""
                  }
                />
              </PaginationItem>
              {Array.from(
                { length: vm.pagination.pagesCount },
                (_, i) => i + 1
              ).map((page) => (
                <PaginationItem key={page}>
                  <PaginationLink
                    href="#"
                    isActive={page === vm.pagination.page}
                    onClick={(e) => {
                      e.preventDefault();
                      vm.changePage(page);
                    }}
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    vm.changePage(
                      Math.min(vm.pagination.pagesCount, vm.pagination.page + 1)
                    );
                  }}
                  className={
                    vm.pagination.page === vm.pagination.pagesCount
                      ? "pointer-events-none opacity-50"
                      : ""
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pager>
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
              ? `Edit the ${vm.config.itemTypeName?.toLowerCase() ?? "item"
              } details below.`
              : `Add a new ${vm.config.itemTypeName?.toLowerCase() ?? "item"
              } below.`
          }
        >
          <GenericForm
            fields={renderFormFields(
              vm.formValues,
              vm.setFormValues,
              vm.editing,
              vm.parentForNew
            )}
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
          confirmText={
            vm.isDeleting ? t("common.deleting") : t("common.delete")
          }
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
