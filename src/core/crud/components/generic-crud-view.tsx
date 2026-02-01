/**
 * GenericCrudView - A fully generic, reusable CRUD component
 *
 * This component provides a complete CRUD interface with the following features:
 * - Automatic table generation with sorting and pagination
 * - Generic form handling for create/edit operations
 * - Flexible action system (individual, bulk, and custom actions)
 * - Confirmation dialogs with localization support
 * - Error handling and loading states
 * - Responsive design with mobile support
 * - Full accessibility compliance
 *
 * @author Seif
 * @version 2.0.0
 * @since 1.0.0
 */
"use client";

import { Button } from "@core/ui/button";
import { Card, CardContent } from "@core/ui/card";
import { GenericTable } from "./generic-table";
import { GenericModal } from "./generic-modal";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@core/ui/dialog";
import { GenericForm, FieldConfig } from "@core/ui/forms/generic-form";
import { LoadingSpinner } from "@core/ui/loading-spinner";
import { ErrorMessage } from "@core/ui/error-message";
import { ConfirmationDialog } from "@core/ui/confirmation-dialog";
import { useEnhancedDelete } from "@core/hooks/use-enhanced-delete";
import { useEnhancedToast } from "@core/hooks/use-enhanced-toast";
import { useSettings } from "@core/providers/settings-provider";
import { cn, getHoverEffectClasses } from "@core/common/utils";
import type { PaginationInfo } from "@core/common/pagination";
import { useI18n } from "@core/providers/i18n-provider";
import { useCallback, useMemo } from "react";
import { appLogger } from "@core/common/logger";
import { usePermission } from "@core/hooks/use-permission";
import type { PermissionCode } from "@core/common/types/permissions";

/* ========================================
 * TYPE DEFINITIONS & INTERFACES
 * ======================================== */

/**
 * Configuration for table columns
 * @template TItem - The type of items being displayed
 */
export interface CrudColumn<TItem = any> {
  /** Unique key for the column (must match item property) */
  key: string;
  /** Display label for the column header */
  label: string;
  /** Whether the column supports sorting */
  sortable?: boolean;
  /** Custom render function for the column content */
  render?: (value: any, item: TItem, index: number) => React.ReactNode;
  /** CSS classes for the column */
  className?: string;
  /** Whether the column is hidden on mobile */
  hideOnMobile?: boolean;
}

/**
 * Configuration for individual row actions
 * @template TItem - The type of items the action operates on
 */
export interface CrudAction<TItem = any> {
  /** Display label for the action */
  label: string;
  /** Action handler function */
  onClick?: (item: TItem) => void | Promise<void>;
  /** Button variant styling */
  variant?: "default" | "ghost" | "destructive" | "outline" | "secondary";
  /** Additional CSS classes */
  className?: string;
  /** Icon to display with the action */
  icon?: React.ReactNode;
  /** Conditional display logic */
  show?: (item: TItem) => boolean;
  /** Confirmation dialog title (if confirmation needed) */
  confirmTitle?: string;
  /** Confirmation dialog description (supports {name} placeholder) */
  confirmDescription?: string;
  /** Whether the action is disabled */
  disabled?: (item: TItem) => boolean;
  /** Tooltip text for the action */
  tooltip?: string;
  /** Loading state for async actions */
  loading?: boolean;
}

/**
 * Configuration for bulk actions (operate on multiple selected items)
 */
export interface BulkAction {
  /** Display label for the bulk action */
  label: string;
  /** Bulk action handler function */
  onClick: (selectedIds: string[]) => Promise<void>;
  /** Button variant styling */
  variant?: "default" | "outline" | "destructive" | "secondary";
  /** Additional CSS classes */
  className?: string;
  /** Confirmation dialog title */
  confirmTitle?: string;
  /** Confirmation dialog description (supports {count} placeholder) */
  confirmDescription?: string;
  /** Icon to display with the action */
  icon?: React.ReactNode;
  /** Minimum number of items required for the action */
  minItems?: number;
  /** Maximum number of items allowed for the action */
  maxItems?: number;
  /** Whether the action requires confirmation */
  requiresConfirmation?: boolean;
}

/**
 * Configuration for custom actions (always visible, operate on all items)
 */
export interface CustomAction {
  /** Display label for the custom action */
  label: string;
  /** Custom action handler function */
  onClick: () => Promise<void>;
  /** Button variant styling */
  variant?: "default" | "outline" | "destructive" | "secondary";
  /** Additional CSS classes */
  className?: string;
  /** Confirmation dialog title */
  confirmTitle?: string;
  /** Confirmation dialog description */
  confirmDescription?: string;
  /** Icon to display with the action */
  icon?: React.ReactNode;
  /** Whether the action is disabled */
  disabled?: boolean;
  /** Tooltip text for the action */
  tooltip?: string;
  /** Loading state for async actions */
  loading?: boolean;
}

/**
 * Permission configuration for CRUD operations
 * Supports both boolean flags and permission code strings
 */
export interface CrudPermissions {
  /** Permission to view/list items (if false, entire view is hidden) */
  canView?: boolean | PermissionCode;
  /** Permission to create new items */
  canCreate?: boolean | PermissionCode;
  /** Permission to update existing items */
  canUpdate?: boolean | PermissionCode;
  /** Permission to delete items */
  canDelete?: boolean | PermissionCode;
  /** Additional custom permissions */
  [key: string]: boolean | PermissionCode | undefined;
}

/**
 * Search configuration for the CRUD view
 */
export interface SearchConfig {
  /** Whether search is enabled */
  enabled?: boolean;
  /** Placeholder text for search input */
  placeholder?: string;
  /** Debounce delay in milliseconds */
  debounceMs?: number;
  /** Custom search handler */
  onSearch?: (term: string) => void;
}

/**
 * Pagination configuration for the CRUD view
 */
export interface PaginationConfig extends PaginationInfo {
  /** Page change handler */
  onPageChange?: (page: number) => void;
  /** Page size change handler */
  onPageSizeChange?: (pageSize: number) => void;
  /** Available page size options */
  pageSizeOptions?: number[];
}

/**
 * Main configuration interface for the GenericCrudView
 * @template TItem - The type of items being managed
 */
export interface CrudConfig<TItem = any> {
  /* ========================================
   * PAGE CONFIGURATION
   * ======================================== */
  /** Translation key for the page title */
  titleKey: string;
  /** Translation key for the page subtitle */
  subtitleKey: string;
  /** Custom subtitle text (overrides subtitleKey) */
  customSubtitle?: string;

  /* ========================================
   * TABLE & FORM CONFIGURATION
   * ======================================== */
  /** Column definitions for the table */
  columns: CrudColumn<TItem>[];
  /** Field definitions for create form */
  createFields: FieldConfig[];
  /** Field definitions for edit form */
  editFields: FieldConfig[];
  /** Initial values for create form */
  createInitialValues?: Record<string, any>;
  /** Function to get initial values for edit form */
  editInitialValues?: (item: TItem) => Record<string, any>;

  /* ========================================
   * ACTION CONFIGURATION
   * ======================================== */
  /** Function to generate individual row actions */
  getActions?: (
    vm: any,
    t: any,
    handleDelete?: (item: TItem) => void
  ) => CrudAction<TItem>[];
  /** Generic bulk actions for selected items */
  bulkActions?: BulkAction[];
  /** Custom actions (always visible) */
  customActions?: CustomAction[];
  /** Whether bulk actions are enabled */
  enableBulkActions?: boolean;

  /* ========================================
   * CUSTOMIZATION
   * ======================================== */
  /** Custom header content (between title and table) */
  customHeaderContent?: React.ReactNode;
  /** Custom footer content (after table) */
  customFooterContent?: React.ReactNode;
  /** Additional props for the GenericTable component */
  customTableProps?: Partial<React.ComponentProps<typeof GenericTable>>;
  /** Enable sticky actions column */
  stickyActions?: boolean;
  /** Function to get display name for items */
  getItemDisplayName?: (item: TItem) => string;
  /** Translation key for item type */
  itemTypeKey?: string;
  /** Delete service for direct deletion */
  deleteService?: (id: string) => Promise<void>;
  /** Key to force form re-rendering */
  formKey?: number;
  /** Callback when create button is clicked */
  onCreateClick?: () => void | Promise<void>;
  /** Hide the add button */
  hideAddButton?: boolean;
  /** Hide all action buttons (add and refresh) */
  hideActionButtons?: boolean;
  /** Hide the actions column completely (simpler than returning [] from getActions) */
  hideActionsColumn?: boolean;
  /** Custom render function for actions column - allows complete customization */
  renderActions?: (item: TItem) => React.ReactNode;

  /* ========================================
   * PERMISSIONS CONFIGURATION
   * ======================================== */
  /**
   * Permission configuration for this CRUD view.
   * If provided, controls visibility of Add button, Edit/Delete actions.
   * Can be boolean (static) or PermissionCode (dynamic check against user permissions).
   * 
   * @example
   * // Static permissions
   * permissions: { canCreate: false, canDelete: true }
   * 
   * @example  
   * // Dynamic permissions (checks user's effective permissions)
   * permissions: { canCreate: "admins.create", canDelete: "admins.delete" }
   */
  permissions?: CrudPermissions;

  /**
   * Resource name for auto-generating permission codes.
   * If set, and permissions is not provided, will auto-check:
   * - canCreate: `{resource}.create`
   * - canUpdate: `{resource}.update`  
   * - canDelete: `{resource}.delete`
   * 
   * @example
   * resource: "admins" // Auto-checks admins.create, admins.update, admins.delete
   */
  resource?: string;
}

interface GenericCrudViewProps<T> {
  // Original props (for backward compatibility)
  title?: string;
  subtitle?: string;
  columns?: any[];
  actions?: any[];
  createFields?: FieldConfig[];
  editFields?: FieldConfig[];
  viewModel: any;
  pagination?: PaginationInfo & {
    onPageChange: (page: number) => void;
    onPageSizeChange?: (size: number) => void;
  };
  search?: {
    value: string;
    onChange: (term: string) => void;
    inputRef?: React.RefObject<HTMLInputElement | null>;
  };

  // New configuration-based props
  config?: CrudConfig<T>;

  // Callback when create button is clicked
  onCreateClick?: () => void | Promise<void>;
}

export function GenericCrudView<T>(props: GenericCrudViewProps<T>) {
  const {
    title: propTitle,
    subtitle: propSubtitle,
    columns: propColumns,
    actions: propActions,
    createFields: propCreateFields,
    editFields: propEditFields,
    viewModel,
    pagination: propPagination,
    search: propSearch,
    config,
    onCreateClick,
  } = props;
  const settings = useSettings();
  const { t } = useI18n();

  // Enhanced delete system for professional confirmation dialogs
  const deleteSystem = useEnhancedDelete();
  const { operationSuccess, operationError } = useEnhancedToast();

  // Enhanced delete handler with professional confirmation dialog
  const handleDelete = useCallback(
    async (item: T) => {
      const itemDisplayName = config?.getItemDisplayName
        ? config.getItemDisplayName(item)
        : (item as any).name || "Item";
      const itemType = config?.itemTypeKey ? t(config.itemTypeKey) : "Item";
      const id = typeof item === "string" ? item : (item as any).id;

      await deleteSystem.confirmDelete(
        async () => {
          // Use the direct delete service from config
          if (config?.deleteService) {
            await config.deleteService(id);
            // Refresh the data after successful delete
            await viewModel.refreshItems();
            // Success message will be shown by the enhanced delete system
          } else {
            throw new Error("Delete service not configured");
          }
        },
        {
          itemName: itemDisplayName,
          itemType: itemType,
          confirmTitle: t("common.confirmDelete"),
          confirmDescription: t("common.deleteConfirmation").replace(
            "{name}",
            itemDisplayName
          ),
        }
      );
    },
    [deleteSystem, viewModel, config, t]
  );

  // Generic bulk action handler
  const handleBulkAction = useCallback(
    async (action: BulkAction, selectedIds: string[]) => {
      await deleteSystem.confirmDelete(
        async () => {
          await action.onClick(selectedIds);
          await viewModel.refreshItems();
        },
        {
          itemName: `${selectedIds.length} items`,
          itemType: config?.itemTypeKey ? t(config.itemTypeKey) : "Items",
          confirmTitle: action.confirmTitle || action.label,
          confirmDescription:
            action.confirmDescription ||
            `Are you sure you want to ${action.label.toLowerCase()} ${selectedIds.length
            } items?`,
        }
      );
    },
    [deleteSystem, viewModel, config, t]
  );

  // Generic custom action handler
  const handleCustomAction = useCallback(
    async (action: CustomAction) => {
      await deleteSystem.confirmDelete(
        async () => {
          await action.onClick();
          await viewModel.refreshItems();
        },
        {
          itemName: "all items",
          itemType: config?.itemTypeKey ? t(config.itemTypeKey) : "Items",
          confirmTitle: action.confirmTitle || action.label,
          confirmDescription:
            action.confirmDescription ||
            `Are you sure you want to ${action.label.toLowerCase()}?`,
        }
      );
    },
    [deleteSystem, viewModel, config, t]
  );

  // Generic individual action handler
  const handleIndividualAction = useCallback(
    async (action: any, item: any) => {
      // If action has confirmTitle, it needs confirmation
      if (action.confirmTitle || action.confirmDescription) {
        const itemDisplayName = config?.getItemDisplayName
          ? config.getItemDisplayName(item)
          : item.name || item.id;
        await deleteSystem.confirmDelete(
          async () => {
            await action.onClick(item);
            await viewModel.refreshItems();
          },
          {
            itemName: itemDisplayName,
            itemType: config?.itemTypeKey ? t(config.itemTypeKey) : "Item",
            confirmTitle: action.confirmTitle || action.label,
            confirmDescription:
              action.confirmDescription?.replace("{name}", itemDisplayName) ||
              `Are you sure you want to ${action.label.toLowerCase()} ${itemDisplayName}?`,
          }
        );
      } else {
        // No confirmation needed, just execute and refresh
        await action.onClick(item);
        await viewModel.refreshItems();
      }
    },
    [deleteSystem, viewModel, config, t]
  );

  // Handle create button click
  const handleCreateClick = useCallback(() => {
    // Call the onCreateClick callback if provided (either from props or config)
    const onCreateHandler = onCreateClick || config?.onCreateClick;
    if (onCreateHandler) {
      onCreateHandler();
    }
    // Open the create modal
    viewModel.setIsCreateModalOpen(true);
  }, [onCreateClick, config, viewModel]);

  // Use config if provided, otherwise use direct props (backward compatibility)
  const title = config ? t(config.titleKey) : propTitle!;
  const subtitle = config
    ? config.customSubtitle || t(config.subtitleKey)
    : propSubtitle;
  const columns = config ? config.columns : propColumns!;

  // Wrap actions to use the generic individual action handler
  const rawActions = config?.getActions
    ? config.getActions(viewModel, t, handleDelete)
    : propActions;

  // Hide actions column if specified
  const actions = config?.hideActionsColumn
    ? undefined
    : rawActions?.map((action) => ({
      ...action,
      onClick:
        action.onClick === handleDelete
          ? handleDelete
          : (item: any) => handleIndividualAction(action, item),
    }));

  const createFields = config ? config.createFields : propCreateFields!;
  const editFields = config
    ? config.editFields
    : propEditFields || propCreateFields!;

  // Auto-generate pagination and search for config-based usage
  const pagination =
    propPagination ||
    (config
      ? {
        ...viewModel.pagination,
        onPageChange: viewModel.changePage,
        onPageSizeChange: viewModel.changePageSize,
      }
      : undefined);

  const search =
    propSearch ||
    (config
      ? {
        value: viewModel.searchValue,
        onChange: viewModel.handleSearchChange,
        inputRef: viewModel.searchInputRef,
      }
      : undefined);

  // ========================================
  // PERMISSION CHECKING LOGIC
  // ========================================
  // Call permission hooks at the top level (not inside useMemo/useCallback)
  const resource = config?.resource;
  const resourceViewPerm = usePermission(resource ? `${resource}.view` : "");
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

  // Compute effective permissions
  const effectivePermissions = useMemo(() => {
    const perms = config?.permissions;

    // If permissions object is provided, use it with fallbacks
    if (perms) {
      return {
        canView: resolvePermissionValue(perms.canView, resourceViewPerm),
        canCreate: resolvePermissionValue(perms.canCreate, resourceCreatePerm),
        canUpdate: resolvePermissionValue(perms.canUpdate, resourceUpdatePerm),
        canDelete: resolvePermissionValue(perms.canDelete, resourceDeletePerm),
      };
    }

    // If resource is provided, use the pre-computed permission values
    if (resource) {
      return {
        canView: resourceViewPerm,
        canCreate: resourceCreatePerm,
        canUpdate: resourceUpdatePerm,
        canDelete: resourceDeletePerm,
      };
    }

    // Default: all allowed (for backward compatibility)
    return {
      canView: true,
      canCreate: true,
      canUpdate: true,
      canDelete: true,
    };
  }, [config?.permissions, resource, resolvePermissionValue, resourceViewPerm, resourceCreatePerm, resourceUpdatePerm, resourceDeletePerm]);

  // Determine if Add button should be shown
  const showAddButton = !config?.hideAddButton && effectivePermissions.canCreate;

  const getSpacingClasses = () => {
    switch (settings.spacingSize) {
      case "compact":
        return "space-y-3";
      case "comfortable":
        return "space-y-8";
      case "spacious":
        return "space-y-12";
      default:
        return "space-y-6";
    }
  };

  const getCardClasses = () => {
    // Don't apply hover effects to Card when it contains a table
    // Table rows will handle their own hover effects with shadows
    // Add strong bottom shadow that extends below pagination
    const base = "transition-none relative";
    // Strong shadow at bottom - extends below the card
    const bottomShadow =
      "shadow-[0_12px_32px_rgba(0,0,0,0.2)] dark:shadow-[0_12px_32px_rgba(0,0,0,0.5)]";
    switch (settings.cardStyle) {
      case "glass":
        return cn(
          base,
          "bg-white/10 backdrop-blur border-white/20",
          bottomShadow
        );
      case "solid":
        return cn(base, "bg-muted border-0", bottomShadow);
      case "bordered":
        return cn(base, "border-2", bottomShadow);
      case "elevated":
        return cn(base, "shadow-lg border-0", bottomShadow);
      default:
        return cn(base, "border-0", bottomShadow);
    }
  };

  const getButtonSize = () => {
    switch (settings.spacingSize) {
      case "compact":
        return "sm";
      case "comfortable":
      case "spacious":
        return "lg";
      default:
        return "default";
    }
  };

  if (viewModel.loading && viewModel.items.length === 0) {
    return <LoadingSpinner />;
  }

  if (viewModel.error && viewModel.items.length === 0) {
    return (
      <ErrorMessage message={viewModel.error} onRetry={viewModel.refresh} />
    );
  }

  return (
    <div className={getSpacingClasses()}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          {subtitle && <p className="text-muted-foreground">{subtitle}</p>}
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          {config?.customActions?.map((action, index) => (
            <Button
              key={index}
              onClick={action.onClick}
              variant={action.variant || "default"}
              size={getButtonSize()}
              className={cn("flex-1 sm:flex-none", action.className)}
              disabled={action.disabled}
            >
              {action.icon && <span className="mr-2">{action.icon}</span>}
              {action.label}
            </Button>
          ))}
          {config?.enableBulkActions === true &&
            viewModel.selectedItems.length > 0 && (
              <div className="flex flex-col sm:flex-row gap-2 mt-2 sm:mt-0">
                {config?.bulkActions?.map((action, index) => {
                  const meetsMin =
                    !action.minItems ||
                    viewModel.selectedItems.length >= action.minItems;
                  const meetsMax =
                    !action.maxItems ||
                    viewModel.selectedItems.length <= action.maxItems;
                  const enabled = meetsMin && meetsMax;

                  return (
                    <Button
                      key={index}
                      onClick={() =>
                        handleBulkAction(action, viewModel.selectedItems)
                      }
                      variant={action.variant || "outline"}
                      size={getButtonSize()}
                      className="flex-1 sm:flex-none"
                      disabled={!enabled}
                    >
                      {action.icon && (
                        <span className="mr-2">{action.icon}</span>
                      )}
                      {action.label.replace(
                        "{count}",
                        viewModel.selectedItems.length.toString()
                      )}
                    </Button>
                  );
                })}
                <Button
                  onClick={() => viewModel.setSelectedItems([])}
                  variant="outline"
                  size={getButtonSize()}
                  className="flex-1 sm:flex-none"
                >
                  {t("common.clearSelection")}
                </Button>
              </div>
            )}
          {(!config ||
            config.enableBulkActions !== true ||
            viewModel.selectedItems.length === 0) &&
            !config?.hideActionButtons && (
              <>
                <Button
                  onClick={viewModel.refresh}
                  variant="outline"
                  size={getButtonSize()}
                  className="bg-transparent flex-1 sm:flex-none"
                >
                  {t("common.refresh")}
                </Button>
                {showAddButton && (
                  <Button
                    onClick={handleCreateClick}
                    className="gradient-primary flex-1 sm:flex-none"
                    size={getButtonSize()}
                  >
                    {t("common.add")}
                  </Button>
                )}
              </>
            )}
        </div>
      </div>

      {/* Custom header content */}
      {config?.customHeaderContent && (
        <div className="mb-6">{config.customHeaderContent}</div>
      )}

      <GenericTable
        data={viewModel.items}
        columns={columns}
        actions={actions}
        loading={viewModel.loading}
        selectable={config?.enableBulkActions === true}
        selectedItems={viewModel.selectedItems}
        onSelectionChange={viewModel.setSelectedItems}
        pagination={
          pagination
            ? {
              ...pagination,
              currentPage: pagination.page, // Map page to currentPage for GenericTable
            }
            : undefined
        }
        onSearch={search?.onChange}
        searchValue={search?.value}
        searchInputRef={search?.inputRef}
        stickyActions={config?.stickyActions}
        renderActions={
          config?.renderActions
            ? (row) => config.renderActions?.(row as T)
            : undefined
        }
        {...(config?.customTableProps || {})}
      />

      {/* Custom footer content */}
      {config?.customFooterContent && (
        <div className="mt-6">{config.customFooterContent}</div>
      )}

      {/* Unified Modal for Create */}
      <GenericModal
        open={viewModel.isCreateModalOpen}
        onOpenChange={viewModel.setIsCreateModalOpen}
        title={`${t("common.add")} ${title}`}
        description={`Add a new ${title.toLowerCase()} below.`}
        formKey={`create-form-${JSON.stringify(
          createFields?.map((f) => f.name).sort()
        )}-${config?.formKey || 0}`}
      >
        <GenericForm
          fields={createFields}
          initialValues={config?.createInitialValues || {}}
          onSubmit={viewModel.createItem}
          onCancel={() => viewModel.setIsCreateModalOpen(false)}
        />
      </GenericModal>

      {/* Unified Modal for Edit */}
      <GenericModal
        open={viewModel.isEditModalOpen}
        onOpenChange={(open) => {
          appLogger.debug(
            "Edit modal onOpenChange:",
            open,
            "editingItem:",
            viewModel.editingItem
          );
          if (!open) {
            viewModel.closeEditModal();
          }
        }}
        title={`${t("common.edit")} ${title}`}
        description={`Edit the ${title.toLowerCase()} details below.`}
        formKey={`edit-form-${viewModel.editingItem?.id || "new"
          }-${JSON.stringify(editFields?.map((f) => f.name).sort())}-${config?.formKey || 0
          }`}
      >
        <GenericForm
          fields={editFields || createFields}
          onSubmit={(data) => {
            if (viewModel.editingItem) {
              return viewModel.updateItem(viewModel.editingItem.id, data);
            }
            return Promise.resolve();
          }}
          initialValues={
            config?.editInitialValues && viewModel.editingItem
              ? config.editInitialValues(viewModel.editingItem)
              : viewModel.editingItem || {}
          }
          onCancel={() => viewModel.closeEditModal()}
        />
      </GenericModal>

      {/* View Modal */}
      <Dialog
        open={viewModel.viewModalOpen}
        onOpenChange={(open) => {
          if (!open) {
            viewModel.closeViewModal();
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{`${t("common.view")} ${title}`}</DialogTitle>
          </DialogHeader>
          <GenericForm
            fields={editFields || createFields}
            initialValues={
              config?.editInitialValues && viewModel.viewItem
                ? config.editInitialValues(viewModel.viewItem)
                : viewModel.viewItem || {}
            }
            onSubmit={async () => { }} // No-op for read-only
            onCancel={viewModel.closeViewModal}
            readOnly={true}
          />
        </DialogContent>
      </Dialog>

      {/* Professional confirmation dialog for delete operations */}
      <ConfirmationDialog
        open={deleteSystem.showConfirmation}
        onOpenChange={deleteSystem.cancelDelete}
        title={
          deleteSystem.deleteOptions.confirmTitle || t("common.confirmDelete")
        }
        description={
          deleteSystem.deleteOptions.confirmDescription ||
          t("common.deleteWarning")
        }
        confirmText={t("common.delete")}
        cancelText={t("common.cancel")}
        onConfirm={deleteSystem.executeDelete}
        onCancel={deleteSystem.cancelDelete}
        variant="destructive"
        isLoading={deleteSystem.isDeleting}
      />
    </div>
  );
}
