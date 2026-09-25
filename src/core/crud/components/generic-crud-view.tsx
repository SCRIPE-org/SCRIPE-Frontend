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
import { GenericTable } from "./generic-table";
import { GenericModal } from "./generic-modal";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@core/ui/dialog";
import { GenericForm, FieldConfig } from "@core/ui/forms/generic-form";
import { LoadingSpinner } from "@core/ui/loading-spinner";
import { ErrorMessage } from "@core/ui/error-message";
import { EmptyState } from "@core/ui/empty-state";
import { PageHeader } from "@core/ui/page-header";
import { ConfirmationDialog } from "@core/ui/confirmation-dialog";
import { useEnhancedDelete } from "@core/hooks/use-enhanced-delete";
import { useEnhancedToast } from "@core/hooks/use-enhanced-toast";
import { useSettings } from "@core/providers/settings-provider";
import { cn } from "@core/common/utils";
import type { PaginationInfo } from "@core/common/pagination";
import { useI18n } from "@core/providers/i18n-provider";
import { useCallback, useMemo, memo, useEffect } from "react";
import {
  Users,
  Sliders,
  ListTodo,
  Activity,
  ShieldCheck,
  Key,
  FileText,
  Inbox,
  Lock,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { usePermission } from "@core/hooks/use-permission";
import { usePermissions } from "@core/hooks/use-permissions";
import { useIsFieldRestricted } from "@core/hooks/use-restricted-fields";
import type { PermissionCode } from "@core/common/types/permissions";
import {
  useCustomFieldsFormFields,
  useCustomFieldColumns,
  decodeCustomFieldName,
  getCustomFieldsExtension,
} from "@core/crud/customFieldsExtension";

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
  /** Permission required to show this action */
  requiredPermission?: PermissionCode;
  /** Confirmation dialog title (if confirmation needed) */
  confirmTitle?: string;
  /** Confirmation dialog description (supports {name} placeholder) */
  confirmDescription?: string;
  /** Confirmation dialog variant: destructive (red/trash), warning, info, or default (green/check) */
  confirmVariant?: "destructive" | "warning" | "info" | "default";
  /** Custom confirm button text (e.g. 'Confirm', 'Transfer', 'Restore') */
  confirmButtonText?: string;
  /** Whether the action is disabled */
  disabled?: (item: TItem) => boolean;
  /** Tooltip text for the action */
  tooltip?: string;
  /** Loading state for async actions */
  loading?: boolean;
  /**
   * Marks this as the row's EDIT action so `permissions.canUpdate` gates it.
   * Optional and additive — an action without it is never auto-hidden, so no
   * existing config changes behaviour by upgrading.
   */
  isEdit?: boolean;
  /**
   * Marks this as the row's DELETE action so `permissions.canDelete` gates it.
   * An action whose `onClick` is the `handleDelete` passed into `getActions`
   * is detected automatically and does not need this flag.
   */
  isDelete?: boolean;
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
  /** Permission required to show this action */
  requiredPermission?: PermissionCode;
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
  /** Permission required to show this action */
  requiredPermission?: PermissionCode;
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
  /** Field definitions for create form (omit for read-only views) */
  createFields?: FieldConfig[];
  /** Field definitions for edit form (omit for read-only views). Can be a function that receives the editing item to generate dynamic fields. */
  editFields?: FieldConfig[] | ((item: TItem) => FieldConfig[]);
  /** Initial values for create form */
  createInitialValues?: Record<string, any>;
  /** Function to get initial values for edit form */
  editInitialValues?: (item: TItem) => Record<string, any>;

  /* ========================================
   * ACTION CONFIGURATION
   * ======================================== */
  /** Function to generate individual row actions */
  getActions?: (vm: any, t: any, handleDelete?: (item: TItem) => void) => CrudAction<TItem>[];
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

  /**
   * When set, GenericCrudView fetches this entity type's active custom-field
   * definitions and appends them to the create/edit form under a "Custom
   * Fields" section, then saves their values after a successful create or
   * update. See CustomFieldsExtensionApi (@core/crud/customFieldsExtension)
   * for how this is wired without core depending on the CustomFields module.
   *
   * REQUIREMENT: this screen's `createItem` must resolve to an object carrying
   * the new record's `id` — custom-field values are saved against that id
   * immediately after create. A create response without one throws a visible
   * error rather than silently dropping the values the user just typed.
   */
  entityTypeKey?: string;
}

interface GenericCrudViewProps<T> {
  // Original props (for backward compatibility)
  title?: string;
  subtitle?: string;
  columns?: any[];
  actions?: any[];
  createFields?: FieldConfig[];
  editFields?: FieldConfig[] | ((item: any) => FieldConfig[]);
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

function GenericCrudViewInner<T>(props: GenericCrudViewProps<T>) {
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
  const { hasPermission } = usePermissions();

  // Enhanced delete system for professional confirmation dialogs
  const deleteSystem = useEnhancedDelete();
  const { operationSuccess, operationError } = useEnhancedToast();

  // Enhanced delete handler with professional confirmation dialog
  const handleDelete = useCallback(
    async (item: T) => {
      const itemDisplayName = config?.getItemDisplayName
        ? config.getItemDisplayName(item)
        : (item as any).name || t("common.item");
      const itemType = config?.itemTypeKey ? t(config.itemTypeKey) : t("common.item");
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
          confirmDescription: t("crud.confirm.deleteItem", { name: itemDisplayName }),
        }
      );
    },
    [deleteSystem, viewModel, config, t]
  );

  // Generic bulk action handler
  const handleBulkAction = useCallback(
    async (action: BulkAction, selectedIds: string[]) => {
      const execute = async () => {
        await action.onClick(selectedIds);
        viewModel.setSelectedItems([]);
        await viewModel.refreshItems();
      };

      if (action.requiresConfirmation || action.confirmTitle || action.confirmDescription) {
        await deleteSystem.confirmDelete(execute, {
          itemName: t("crud.confirm.selectionLabel", { count: selectedIds.length }),
          itemType: config?.itemTypeKey ? t(config.itemTypeKey) : t("common.items"),
          confirmTitle: action.confirmTitle || action.label,
          confirmDescription:
            action.confirmDescription ||
            t("crud.confirm.bulkAction", {
              action: action.label.toLowerCase(),
              count: selectedIds.length,
            }),
        });
      } else {
        await execute();
      }
    },
    [deleteSystem, viewModel, config, t]
  );

  // Generic custom action handler
  const handleCustomAction = useCallback(
    async (action: CustomAction) => {
      const execute = async () => {
        await action.onClick();
        await viewModel.refreshItems();
      };

      if (action.confirmTitle || action.confirmDescription) {
        await deleteSystem.confirmDelete(execute, {
          itemName: t("crud.confirm.allItems"),
          itemType: config?.itemTypeKey ? t(config.itemTypeKey) : t("common.items"),
          confirmTitle: action.confirmTitle || action.label,
          confirmDescription:
            action.confirmDescription ||
            t("crud.confirm.globalAction", { action: action.label.toLowerCase() }),
        });
      } else {
        await execute();
      }
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
            itemType: config?.itemTypeKey ? t(config.itemTypeKey) : t("common.item"),
            confirmTitle: action.confirmTitle || action.label,
            confirmDescription:
              action.confirmDescription?.replace("{name}", itemDisplayName) ||
              t("crud.confirm.itemAction", {
                action: action.label.toLowerCase(),
                name: itemDisplayName,
              }),
            variant: action.confirmVariant || "default",
            confirmButtonText: action.confirmButtonText,
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
    // If a custom create handler is provided (e.g. page navigation), use it exclusively
    const onCreateHandler = onCreateClick || config?.onCreateClick;
    if (onCreateHandler) {
      onCreateHandler();
      return; // Don't open the modal — the handler owns the flow
    }
    // Otherwise open the create modal
    viewModel.setIsCreateModalOpen(true);
  }, [onCreateClick, config, viewModel]);

  // Use config if provided, otherwise use direct props (backward compatibility)
  const title = (config?.titleKey ? t(config.titleKey) : propTitle) || "";
  const subtitle =
    config?.customSubtitle || (config?.subtitleKey ? t(config.subtitleKey) : propSubtitle) || "";
  // The modal copy names ONE record, so it prefers the singular item type a
  // module declares and only falls back to the (usually plural) page title.
  const entity = config?.itemTypeKey ? t(config.itemTypeKey) : title;
  const allColumns = config?.columns || propColumns || [];

  // Dynamic custom-field table columns. Row ids re-derive every render
  // from the current page's items — useCustomFieldColumns internally guards
  // against refetching unless the SET of ids actually changed (pagination,
  // sort, filter, search), so this plain re-derivation needs no outer
  // memoization. The hook itself no-ops (and returns no columns) when
  // entityTypeKey is unset, so every screen without it is unaffected.
  const customFieldColumnOwnerIds = (viewModel.items || [])
    .map((item: any) => item?.id)
    .filter((id: unknown): id is string => typeof id === "string" && id.length > 0);
  const customFieldColumns = useCustomFieldColumns(config?.entityTypeKey, customFieldColumnOwnerIds);

  // Field-level security, keyed on the screen's OWN resource — the same resource
  // that guards the record itself, never Custom Fields' admin resource. Getting
  // that wrong is not a smaller filter, it is no filter: it was the exact defect
  // that let custom-field values bypass FLS on the server until Tier 1 fixed it.
  const isFieldRestricted = useIsFieldRestricted(config?.resource);

  // Only real field-level security hides a column now.
  //
  // There used to be a second layer here that dropped any column whose value
  // was null on every row of the CURRENT PAGE. It was a heuristic standing in
  // for FLS, and it was wrong in three ways: it read `item[col.key]` directly,
  // so a column whose `render` derives its content from other fields was
  // dropped even though it displays fine (that is why the Roles list had no
  // Description column — `Role` exposes descriptionEn/descriptionAr and no
  // `description` getter); it made columns appear and disappear as the user
  // paginated; and it had already forced a compatibility shim into the domain
  // model to work around itself.
  //
  // CUSTOM-FIELD COLUMNS ARE FILTERED TOO, on the same restricted set. They used
  // to be exempt, and the comment here justified it on the grounds that a custom
  // field's key "has no relationship to" the screen's static field names. That was
  // wrong on the only point that mattered: `buildCustomFieldColumn` sets
  // `key: definition.key` — the field's real machine key — which is precisely the
  // string an admin types into the restricted-field list and precisely what the
  // server now matches on. So the same filter applies, with no translation needed.
  //
  // This is defence in depth, not the control. After Tier 1 the server omits a
  // restricted custom field from the bulk response entirely, so its column would
  // usually not be built in the first place. Filtering here means the UI cannot
  // render a header for a field it will never receive a value for — including
  // against a stale cache or an older server.
  const customColumns = customFieldColumns.columns;
  const columns = useMemo(
    () => [
      ...allColumns.filter((col) => !isFieldRestricted(col.key)),
      ...customColumns.filter((col) => !isFieldRestricted(col.key)),
    ],
    [allColumns, isFieldRestricted, customColumns]
  );

  // Wrap actions to use the generic individual action handler
  const rawActions = config?.getActions
    ? config.getActions(viewModel, t, handleDelete)
    : propActions;

  // Real screens (UsersView, DsrView, InvoiceListView, EditionsView,
  // TenantPlansView, TenantFeatureDefinitionsView, ThemeManagementView,
  // ConnectOnboardingView, …) render read-only lists and set neither
  // `config.createFields` nor the `createFields` prop, so this is genuinely
  // `undefined` at runtime — the `!` this used to carry was a lie the
  // compiler had no way to check. Every existing read of this variable
  // already guarded with `|| []`; keep it typed honestly so a future spread
  // (like createFieldsWithCustom below) can't skip that guard again.
  const createFields = config?.createFields || propCreateFields;
  const customFieldsForCreate = useCustomFieldsFormFields(config?.entityTypeKey, undefined);
  const customFieldsForEdit = useCustomFieldsFormFields(
    config?.entityTypeKey,
    viewModel.editingItem?.id
  );
  // The read-only View dialog is a separate open/item pair from Edit
  // (viewModel.viewItem, not viewModel.editingItem) — fetching custom-field
  // values off editingItem here left View always empty unless a record
  // happened to also be the current edit target.
  const customFieldsForView = useCustomFieldsFormFields(
    config?.entityTypeKey,
    viewModel.viewItem?.id
  );

  const rawCustomConfigs = customFieldsForCreate.fieldConfigs;
  const createFieldsWithCustom = useMemo(() => {
    const hasCustomFields = rawCustomConfigs.length > 0;
    const hasSendSetupEmail = Boolean(createFields?.some((f) => f.name === "sendSetupEmail"));
    const alreadyHasDeferSwitch = Boolean(
      createFields?.some((f) => f.name === "deferCustomFieldsToSetup")
    );

    // If there are no custom fields for the entity, do not include deferCustomFieldsToSetup
    let baseFields = createFields ?? [];
    if (!hasCustomFields && alreadyHasDeferSwitch) {
      baseFields = baseFields.filter((f) => f.name !== "deferCustomFieldsToSetup");
    }

    if (!hasCustomFields) {
      return baseFields.filter((field) => !isFieldRestricted(field.name));
    }

    const shouldInjectDeferSwitch = hasSendSetupEmail && !alreadyHasDeferSwitch;
    const hasDeferSwitch = alreadyHasDeferSwitch || shouldInjectDeferSwitch;

    const mappedCustomConfigs = hasDeferSwitch
      ? rawCustomConfigs.map((fc) => ({
          ...fc,
          isVisible: (values: Record<string, any>) =>
            (values.sendSetupEmail === false || values.deferCustomFieldsToSetup === false) &&
            (!fc.isVisible || fc.isVisible(values)),
        }))
      : rawCustomConfigs;

    const injectedFields: FieldConfig[] = [];
    if (shouldInjectDeferSwitch) {
      const deferSwitch: FieldConfig = {
        name: "deferCustomFieldsToSetup",
        label:
          t("admin.deferCustomFieldsToSetup") ||
          "Complete custom fields during account setup",
        type: "switch",
        description:
          t("admin.deferCustomFieldsToSetupDescription") ||
          "Allow completing custom fields during the account setup invitation flow",
        section: "Custom Fields",
        defaultValue: false,
        isVisible: (values: Record<string, any>) => values.sendSetupEmail !== false,
      };
      injectedFields.push(deferSwitch);
    }

    return [...baseFields, ...injectedFields, ...mappedCustomConfigs].filter(
      (field) => !isFieldRestricted(field.name)
    );
  }, [
    createFields,
    rawCustomConfigs,
    isFieldRestricted,
    t,
  ]);

  /**
   * Splits a submitted form's data into the entity's own fields and the
   * custom-field values contributed by customFieldsForCreate/Edit — the
   * latter are namespaced (encodeCustomFieldName) precisely so this split is
   * unambiguous. Pure function of the form data; doesn't need to know which
   * FieldConfig[] produced which entries.
   */
  const splitCustomFieldValues = useCallback((data: Record<string, any>) => {
    const entityData: Record<string, any> = {};
    const customFieldValues: Record<string, unknown> = {};
    for (const [name, value] of Object.entries(data)) {
      const decoded = decodeCustomFieldName(name);
      if (decoded !== null) {
        // A cleared input submits "". The API reads null as "clear this value
        // in place", but rejects "" for a Number field (it fails decimal
        // parsing → 422) and would store "" verbatim for a Text field with no
        // way back to unset. Boolean/Select/Date controls don't produce "" the
        // same way, so mapping it unconditionally here is safe and needs no
        // per-type branch. Deliberately NOT applied to entityData below: the
        // screen's own fields keep whatever they submit today.
        customFieldValues[decoded] = value === "" ? null : value;
      } else {
        entityData[name] = value;
      }
    }
    return { entityData, customFieldValues };
  }, []);

  // Support dynamic editFields: if it's a function, resolve it with the current editing item
  const resolveEditFields = useCallback(
    (editingItem: any): FieldConfig[] => {
      const raw = config?.editFields || propEditFields || propCreateFields;
      if (typeof raw === "function") {
        // Only invoke with a real item. This runs on every render, including
        // the ones after the edit modal closes and `editingItem` is back to
        // null — and the call sites that use the function form type the
        // parameter as non-nullable, so any property access inside threw the
        // moment the dialog was dismissed.
        return editingItem ? raw(editingItem) : [];
      }
      return (raw || createFields || []) as FieldConfig[];
    },
    [config, propEditFields, propCreateFields, createFields]
  );
  const editingItem = viewModel.editingItem;
  const editFieldsOwn = useMemo(
    () => resolveEditFields(editingItem),
    [resolveEditFields, editingItem]
  );
  const editCustomFieldConfigs = customFieldsForEdit.fieldConfigs;
  const editFieldsWithCustom = useMemo(
    () =>
      [...editFieldsOwn, ...editCustomFieldConfigs].filter(
        (field) => !isFieldRestricted(field.name)
      ),
    [editFieldsOwn, editCustomFieldConfigs, isFieldRestricted]
  );
  // Same entity-owned field set as Edit (editFieldsOwn) — View has never had
  // its own field-shape resolution, only the custom-field portion needs the
  // view-item-keyed source.
  const viewCustomFieldConfigs = customFieldsForView.fieldConfigs;
  const viewFieldsWithCustom = useMemo(
    () =>
      [...editFieldsOwn, ...viewCustomFieldConfigs].filter(
        (field) => !isFieldRestricted(field.name)
      ),
    [editFieldsOwn, viewCustomFieldConfigs, isFieldRestricted]
  );

  // NOTE (not fixed here): this key embeds `editingItem?.id`, and
  // `closeEditModal` nulls `editingItem` in the same batch that closes the
  // modal — so during the exit animation the key flips and the form remounts
  // empty for a couple of frames. Freezing it needs the last item id to survive
  // the close, which belongs in the viewmodel; doing it in the view requires
  // reading a ref during render, which this codebase's lint rules correctly
  // forbid. Tracked separately rather than papered over.
  //
  // Hashes the SCREEN'S OWN field names only — never the custom-field configs.
  // GenericModal uses this string as a React `key` on the wrapper around
  // GenericForm, so anything in it that changes while the modal is open
  // unmounts the form and throws away everything the user typed. Custom fields
  // arrive asynchronously and grow by one every time the inline "+ Add custom
  // field" dialog succeeds; keying on them wiped the open form on each add.
  // GenericForm already absorbs a growing `fields` array without a remount (it
  // seeds only fields that have no value yet, preserving typed input), so no
  // remount is needed for custom fields to appear or to pick up their stored
  // values on edit.
  const editFormKey = `edit-form-${
    viewModel.editingItem?.id || "new"
  }-${JSON.stringify(editFieldsOwn?.map((f) => f.name).sort())}-${config?.formKey || 0}`;

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
      // A string IS a permission code — the documented form of this API.
      // It used to fall through to `fallbackPermission`, and for a config
      // that declares codes but no `resource` that fallback is
      // usePermission("") === true (use-permission.ts:35). So every module
      // using the documented string form failed OPEN: the control rendered
      // for every user regardless of their permissions. `hasPermission` is
      // the provider's memoised checker, so this fails CLOSED instead.
      return hasPermission(value);
    },
    [hasPermission]
  );

  // Compute effective permissions
  const perms = config?.permissions;
  const effectivePermissions = useMemo(() => {
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
  }, [
    perms,
    resource,
    resolvePermissionValue,
    resourceViewPerm,
    resourceCreatePerm,
    resourceUpdatePerm,
    resourceDeletePerm,
  ]);

  // Determine if Add button should be shown
  const showAddButton = !config?.hideAddButton && effectivePermissions.canCreate;

  // Hide actions column if specified.
  // Declared AFTER the permission block on purpose: `canUpdate`/`canDelete`
  // are documented as gating the row's Edit/Delete actions (see CrudPermissions)
  // but were computed and never read. There is no built-in Edit/Delete — every
  // module supplies its own through `getActions` — so gating keys off the two
  // things that ARE identifiable: an action whose `onClick` is the injected
  // `handleDelete`, and the opt-in `isEdit`/`isDelete` flags. An action that
  // declares neither is never auto-hidden, so no existing config changes.
  const actions = config?.hideActionsColumn
    ? undefined
    : rawActions
        ?.filter((action) => {
          if (action.requiredPermission && !hasPermission(action.requiredPermission)) {
            return false;
          }
          const isDeleteAction = action.isDelete || action.onClick === handleDelete;
          if (isDeleteAction && !effectivePermissions.canDelete) {
            return false;
          }
          if (action.isEdit && !effectivePermissions.canUpdate) {
            return false;
          }
          return true;
        })
        .map((action) => ({
          ...action,
          onClick:
            action.onClick === handleDelete
              ? handleDelete
              : (item: any) => handleIndividualAction(action, item),
        }));

  // The glyph only — PageHeader owns the tile, its size and its single accent
  // hue. The per-resource colours this used to hand out (success for parties,
  // danger for analytics…) gave each list page an accent found nowhere else in
  // the product, which is the incoherence the shared header exists to end.
  const getPageIcon = (): LucideIcon => {
    // Keyed off `resource` ONLY. This used to also match English substrings
    // against `title`, which is the TRANSLATED page title — so in Arabic none
    // of them matched and the page icon changed when the user switched
    // language.
    const res = config?.resource?.toLowerCase() || "";

    if (res.includes("staff") || res.includes("hrms") || res.includes("party")) return Users;
    if (res.includes("work") || res.includes("task")) return ListTodo;
    if (res.includes("custom") || res.includes("field")) return Sliders;
    if (res.includes("analytics") || res.includes("metric") || res.includes("event"))
      return Activity;
    if (res.includes("compliance") || res.includes("consent") || res.includes("gdpr"))
      return ShieldCheck;
    if (
      res.includes("entitlement") ||
      res.includes("quota") ||
      res.includes("plan") ||
      res.includes("billing")
    )
      return Key;
    return FileText;
  };

  // Keyboard shortcut listener for power users.
  //
  // This listener is global (window) and used to be unguarded, which made it a
  // dialog killer: Ctrl/Cmd+K pulled focus to the page-level search input while
  // a create/edit modal was open, and because GenericModal is `modal={false}`
  // (deliberately — see generic-modal.tsx) that focus move outside the panel
  // dismissed it mid-edit. Alt+N and Alt+R fired from inside open forms too.
  // Two guards now: never while the user is typing, never while any dialog is
  // open.
  useEffect(() => {
    const isTypingTarget = (target: EventTarget | null): boolean => {
      const el = target as HTMLElement | null;
      if (!el) return false;
      if (el.isContentEditable) return true;
      const tag = el.tagName;
      return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";
    };

    const anyDialogOpen = (): boolean =>
      viewModel.isCreateModalOpen ||
      viewModel.isEditModalOpen ||
      viewModel.viewModalOpen ||
      // Covers dialogs this view does not own (module-specific modals,
      // confirmation dialogs, command palette) — Radix stamps both attributes.
      document.querySelector('[role="dialog"][data-state="open"]') !== null;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (isTypingTarget(e.target) || anyDialogOpen()) return;

      // Focus search input: Cmd/Ctrl + K
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        search?.inputRef?.current?.focus();
        return;
      }
      // AltGr reports altKey AND ctrlKey; on Arabic and most European layouts
      // that combination is how real characters are typed, so it must not be
      // read as a shortcut.
      if (!e.altKey || e.ctrlKey) return;

      // Open add modal: Alt + N (only if allowed)
      if (e.key.toLowerCase() === "n" && showAddButton) {
        e.preventDefault();
        handleCreateClick();
      }
      // Refresh list: Alt + R
      if (e.key.toLowerCase() === "r") {
        e.preventDefault();
        viewModel.refresh();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [search, showAddButton, handleCreateClick, viewModel]);

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

  // `canView` is documented as "if false, entire view is hidden" but was
  // computed and never read, so a module that declared it got no enforcement
  // at all. It is enforced here, above every other branch — a user without
  // read permission must not see the list, its count, or its empty state.
  if (!effectivePermissions.canView) {
    return (
      <EmptyState
        icon={Lock}
        title={t("notAuthorized.title")}
        description={t("notAuthorized.description")}
      />
    );
  }

  // These two early returns replace the ENTIRE view — including any open
  // modal, which is then unmounted mid-edit. That is reachable: a tenant whose
  // list is empty (exactly the person clicking "Add") hits `items.length === 0`
  // the moment a refetch starts with no cached previous data, and the create
  // form vanishes while they are typing in it. Suppressing them while a dialog
  // is open keeps the dialog mounted; the list underneath is not what the user
  // is looking at anyway.
  //
  // Still outstanding: both branches discard the page header, search and
  // pagination rather than rendering a skeleton in place. That is a layout
  // change too large to make safely here and is tracked separately.
  const anyModalOpen =
    viewModel.isCreateModalOpen || viewModel.isEditModalOpen || viewModel.viewModalOpen;

  if (viewModel.loading && viewModel.items.length === 0 && !anyModalOpen) {
    return <LoadingSpinner showText={false} />;
  }

  if (viewModel.error && viewModel.items.length === 0 && !anyModalOpen) {
    return <ErrorMessage message={viewModel.error} onRetry={viewModel.refresh} />;
  }

  return (
    // The settings-driven rhythm rides the ONE --spacing-unit the applicator
    // writes — the per-size space-y switch collapsed into it.
    <div className="flex flex-col" style={{ gap: "calc(var(--spacing-unit) * 1.5)" }}>
      {/* The one page header. It owns the icon tile, the h1 and the description
          measure; the action cluster rides its actions slot, so a list page and
          a record page open identically. */}
      <PageHeader
        className="mb-0"
        icon={getPageIcon()}
        title={title}
        description={subtitle}
        actions={
          <>
            {config?.customActions
              ?.filter(
                (action) => !action.requiredPermission || hasPermission(action.requiredPermission)
              )
              .map((action, index) => (
                <Button
                  key={index}
                  onClick={action.onClick}
                  variant={action.variant || "default"}
                  size={getButtonSize()}
                  className={cn("flex-1 sm:flex-none", action.className)}
                  loading={action.loading}
                  disabled={action.disabled}
                >
                  {!action.loading && action.icon && (
                    <span className="me-2" aria-hidden="true">
                      {action.icon}
                    </span>
                  )}
                  {action.label}
                </Button>
              ))}
            {config?.enableBulkActions === true &&
              viewModel.selectedItems.length > 0 &&
              config?.bulkActions
                ?.filter(
                  (action) => !action.requiredPermission || hasPermission(action.requiredPermission)
                )
                .map((action, index) => {
                  const meetsMin =
                    !action.minItems || viewModel.selectedItems.length >= action.minItems;
                  const meetsMax =
                    !action.maxItems || viewModel.selectedItems.length <= action.maxItems;
                  const enabled = meetsMin && meetsMax;

                  return (
                    <Button
                      key={index}
                      onClick={() => handleBulkAction(action, viewModel.selectedItems)}
                      variant={action.variant || "outline"}
                      size={getButtonSize()}
                      className="flex-1 sm:flex-none"
                      disabled={!enabled}
                    >
                      {action.icon && (
                        <span className="me-2" aria-hidden="true">
                          {action.icon}
                        </span>
                      )}
                      {action.label.replace("{count}", viewModel.selectedItems.length.toString())}
                    </Button>
                  );
                })}
            {config?.enableBulkActions === true && viewModel.selectedItems.length > 0 && (
              <Button
                onClick={() => viewModel.setSelectedItems([])}
                variant="outline"
                size={getButtonSize()}
                className="flex-1 sm:flex-none"
              >
                {t("common.clearSelection")}
              </Button>
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
                    className="flex-1 sm:flex-none"
                  >
                    {t("common.refresh")}
                  </Button>
                  {/* No className: the primary variant IS the primary treatment. */}
                  {showAddButton && (
                    <Button
                      onClick={handleCreateClick}
                      className="flex-1 sm:flex-none"
                      size={getButtonSize()}
                    >
                      {t("common.add")}
                    </Button>
                  )}
                </>
              )}
          </>
        }
      />

      {/* Custom header content */}
      {config?.customHeaderContent && <div className="mb-6">{config.customHeaderContent}</div>}

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
        // The empty branch routes through the core EmptyState, so every CRUD
        // list inherits the nexus empty anatomy. `bare` because the table
        // container already draws the surface; customTableProps can still
        // override the node below.
        emptyMessage={<EmptyState bare icon={Inbox} title={t("common.noData")} />}
        stickyActions={config?.stickyActions}
        renderActions={
          config?.renderActions ? (row) => config.renderActions?.(row as T) : undefined
        }
        {...(config?.customTableProps || {})}
      />

      {/* Custom footer content */}
      {config?.customFooterContent && <div className="mt-6">{config.customFooterContent}</div>}

      {/* Unified Modal for Create */}
      <GenericModal
        open={viewModel.isCreateModalOpen}
        onOpenChange={viewModel.setIsCreateModalOpen}
        title={t("crud.modal.createTitle", { entity: title })}
        description={t("crud.modal.createDescription", { entity })}
        // Screen's own fields only — see the editFormKey note above: keying on
        // the custom-field configs remounted the form (wiping it) every time
        // the inline "+ Add custom field" dialog added one.
        formKey={`create-form-${JSON.stringify(createFields?.map((f) => f.name).sort())}-${
          config?.formKey || 0
        }`}
      >
        <GenericForm
          fields={createFieldsWithCustom || []}
          initialValues={config?.createInitialValues || {}}
          onSubmit={async (data) => {
            const { entityData, customFieldValues } = splitCustomFieldValues(data);
            // Sanitize: never submit restricted fields to the server
            for (const key of Object.keys(entityData)) {
              if (isFieldRestricted(key)) {
                delete entityData[key];
              }
            }
            const shouldSaveCustomFields = !entityData.deferCustomFieldsToSetup;
            delete entityData.deferCustomFieldsToSetup;
            const created = await viewModel.createItem(entityData);
            const newId = (created as { id?: string } | undefined)?.id;
            if (config?.entityTypeKey && shouldSaveCustomFields) {
              if (Object.keys(customFieldValues).length > 0) {
                if (!newId) {
                  // The values were typed, the record was created, and there is
                  // no id to hang them on — dropping them silently is the one
                  // outcome the user can't detect. Throwing routes this into
                  // GenericForm's catch → setServerError, which renders it.
                  // Deliberately NOT calling setIsCreateModalOpen(false) below
                  // this point: the dialog must stay mounted for that error to
                  // be visible.
                  throw new Error(
                    "Custom field values could not be saved: this screen's create response did not return an id. entityTypeKey requires createItem to resolve to { id }."
                  );
                }
                // Let a save failure here propagate too — same reasoning as
                // above, same catch → setServerError path, same "don't close"
                // requirement.
                await getCustomFieldsExtensionOrThrow().saveValues(
                  config.entityTypeKey,
                  newId,
                  customFieldValues
                );
                void customFieldsForCreate.refetch();
              }
            }
            // Reaching this line means the entity creation and any custom-field
            // save (if there was one to do and not deferred) have settled
            // successfully — fire the success toast and close the modal.
            // If the viewmodel opted into deferSuccessEffects (e.g. for custom fields),
            // confirmCreateSuccess triggers the deferred toast and closes the modal.
            // Otherwise, fall back to closing the modal directly if confirmCreateSuccess is not defined.
            if (viewModel.confirmCreateSuccess) {
              viewModel.confirmCreateSuccess();
            } else {
              viewModel.setIsCreateModalOpen(false);
            }
          }}
          onCancel={() => viewModel.setIsCreateModalOpen(false)}
        />
        {config?.entityTypeKey && (
          <CustomFieldsExtensionTrigger
            entityTypeKey={config.entityTypeKey}
            entityDisplayName={title}
            // InlineAddTrigger's onCreated is `() => void`, so handing it
            // `refetch` directly floated the returned promise. refetch never
            // rejects (useCustomFieldsFormFields captures failures into its own
            // `error` state), and the explicit `void` keeps that intentional.
            onCreated={() => {
              void customFieldsForCreate.refetch();
            }}
          />
        )}
      </GenericModal>

      {/* Unified Modal for Edit */}
      <GenericModal
        open={viewModel.isEditModalOpen}
        onOpenChange={(open) => {
          if (!open) {
            viewModel.closeEditModal();
          }
        }}
        title={t("crud.modal.editTitle", { entity: title })}
        description={t("crud.modal.editDescription", { entity })}
        // Frozen while the modal is closing. `closeEditModal` nulls
        // `editingItem` and flips `isEditModalOpen` in the same batch, so the
        // key used to flip to "…-new-…" during the exit animation and remount
        // the form to an empty state — the user watched their data blank out on
        // the way out.
        formKey={editFormKey}
      >
        <GenericForm
          fields={editFieldsWithCustom || createFieldsWithCustom || []}
          onSubmit={async (data) => {
            if (!viewModel.editingItem) return;
            const { entityData, customFieldValues } = splitCustomFieldValues(data);
            // Sanitize: never submit restricted fields to the server
            for (const key of Object.keys(entityData)) {
              if (isFieldRestricted(key)) {
                delete entityData[key];
              }
            }
            await viewModel.updateItem(viewModel.editingItem.id, entityData);
            if (config?.entityTypeKey) {
              if (Object.keys(customFieldValues).length > 0) {
                // Let a save failure here propagate — GenericForm's catch →
                // setServerError renders it, and (with the screen's
                // useXViewModel opted into deferSuccessEffects) the dialog
                // stays open and un-auto-closed to show it, same reasoning
                // as the create path above.
                await getCustomFieldsExtensionOrThrow().saveValues(
                  config.entityTypeKey,
                  viewModel.editingItem.id,
                  customFieldValues
                );
                void customFieldsForEdit.refetch();
              }
            }
            // Same sequencing as the create path: fire the toast and close
            // only after the entity update and custom-field save (if any) have settled.
            if (viewModel.confirmUpdateSuccess) {
              viewModel.confirmUpdateSuccess();
            } else {
              viewModel.closeEditModal();
            }
          }}
          initialValues={
            config?.editInitialValues && viewModel.editingItem
              ? config.editInitialValues(viewModel.editingItem)
              : viewModel.editingItem || {}
          }
          onCancel={() => viewModel.closeEditModal()}
        />
        {config?.entityTypeKey && (
          <CustomFieldsExtensionTrigger
            entityTypeKey={config.entityTypeKey}
            entityDisplayName={title}
            // Same fire-and-forget contract as the create modal's trigger.
            onCreated={() => {
              void customFieldsForEdit.refetch();
            }}
          />
        )}
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
            <DialogTitle>{t("crud.modal.viewTitle", { entity: title })}</DialogTitle>
          </DialogHeader>
          <GenericForm
            fields={viewFieldsWithCustom || createFieldsWithCustom || []}
            initialValues={
              config?.editInitialValues && viewModel.viewItem
                ? config.editInitialValues(viewModel.viewItem)
                : viewModel.viewItem || {}
            }
            onSubmit={async () => {}} // No-op for read-only
            onCancel={viewModel.closeViewModal}
            readOnly={true}
          />
        </DialogContent>
      </Dialog>

      {/* Professional confirmation dialog for delete and action operations */}
      <ConfirmationDialog
        open={deleteSystem.showConfirmation}
        onOpenChange={deleteSystem.cancelDelete}
        title={deleteSystem.deleteOptions.confirmTitle || t("common.confirmDelete")}
        description={deleteSystem.deleteOptions.confirmDescription || t("common.deleteWarning")}
        confirmText={
          deleteSystem.deleteOptions.confirmButtonText ||
          (deleteSystem.deleteOptions.variant === "destructive" ||
          !deleteSystem.deleteOptions.variant
            ? t("common.delete")
            : t("common.confirm"))
        }
        cancelText={t("common.cancel")}
        onConfirm={deleteSystem.executeDelete}
        onCancel={deleteSystem.cancelDelete}
        variant={deleteSystem.deleteOptions.variant || "destructive"}
        isLoading={deleteSystem.isDeleting}
      />
    </div>
  );
}

// P1.4: Memoize to prevent re-renders when parent state changes
export const GenericCrudView = memo(GenericCrudViewInner) as typeof GenericCrudViewInner;

function getCustomFieldsExtensionOrThrow() {
  const api = getCustomFieldsExtension();
  if (!api) {
    throw new Error(
      "entityTypeKey was set on a CrudConfig but the CustomFields extension is not registered — check that src/app/layout.tsx imports the CustomFields bootstrap module."
    );
  }
  return api;
}

function CustomFieldsExtensionTrigger(props: {
  entityTypeKey: string;
  entityDisplayName?: string;
  onCreated: () => void;
}) {
  const api = getCustomFieldsExtension();
  if (!api) return null;
  const Trigger = api.InlineAddTrigger;
  return <Trigger {...props} />;
}
