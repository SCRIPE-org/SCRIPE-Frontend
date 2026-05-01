import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
  { type: "paragraph", contentKey: "frontend.crudSystem.intro" },

  // ─── Architecture Overview ────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "frontend.crudSystem.architectureTitle",
    id: "architecture",
  },
  {
    type: "flowchart",
    title: "CRUD System Architecture",
    direction: "vertical",
    nodes: [
      {
        id: "view",
        label: "GenericCrudView",
        type: "primary",
        description: "Orchestrates table, dialogs, pagination",
      },
      {
        id: "datatable",
        label: "DataTable",
        type: "info",
        description: "Flexible table with sorting, search, selection",
      },
      {
        id: "formDialog",
        label: "FormDialog",
        type: "success",
        description: "Create/Edit form in a dialog",
      },
      {
        id: "confirm",
        label: "ConfirmDialog",
        type: "danger",
        description: "Delete/bulk action confirmation",
      },
      {
        id: "viewModel",
        label: "useCrudViewModel",
        type: "warning",
        description: "Hook: all CRUD state & mutations",
      },
      {
        id: "repo",
        label: "ICrudRepository",
        type: "default",
        description: "Data access abstraction",
      },
    ],
    connections: [
      { from: "view", to: "datatable" },
      { from: "view", to: "formDialog" },
      { from: "view", to: "confirm" },
      { from: "view", to: "viewModel", label: "uses" },
      { from: "viewModel", to: "repo", label: "calls" },
    ],
  },

  // ─── useCrudViewModel ─────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "frontend.crudSystem.viewModelTitle",
    id: "use-crud-viewmodel",
  },
  { type: "paragraph", contentKey: "frontend.crudSystem.viewModelIntro" },
  {
    type: "code",
    language: "typescript",
    filename: "useCrudViewModel — Configuration",
    code: `interface CrudViewModelConfig<T, TCreate, TUpdate> {
  // Data fetching
  queryKey: string;
  fetchFn: (params: PaginationParams) => Promise<PaginatedResult<T>>;
  
  // Mutations (optional)
  createFn?: (data: TCreate) => Promise<T>;
  updateFn?: (id: string, data: TUpdate) => Promise<T>;
  deleteFn?: (id: string) => Promise<void>;
  
  // Bulk operations (optional)
  bulkDeleteFn?: (ids: string[]) => Promise<void>;
  bulkDeleteAllFn?: (filter: FilterParams, excludeIds: string[]) => Promise<void>;
  bulkActionFn?: (ids: string[], action: string) => Promise<void>;
  
  // Configuration
  defaultPageSize?: number;           // Default: 10
  searchDebounceMs?: number;          // Default: 300
  enableSelection?: boolean;          // Default: false
  enableBulkActions?: boolean;        // Default: false
  enableGlobalFilter?: boolean;       // Default: true
  staleTime?: number;                 // Default: 5 min
  
  // Form configuration
  formSchema?: ZodSchema;             // For validation
  defaultFormValues?: Partial<TCreate>;
  
  // Callbacks
  onCreateSuccess?: (item: T) => void;
  onUpdateSuccess?: (item: T) => void;
  onDeleteSuccess?: () => void;
  onError?: (error: Error) => void;
}`,
  },
  {
    type: "code",
    language: "typescript",
    filename: "useCrudViewModel — Returned Interface",
    code: `interface CrudViewModelReturn<T> {
  // Data
  items: T[];
  totalCount: number;
  isLoading: boolean;
  error: Error | null;
  
  // Pagination
  page: number;
  pageSize: number;
  totalPages: number;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  
  // Search
  search: string;
  setSearch: (search: string) => void;
  debouncedSearch: string;
  
  // Sorting
  sortBy: string;
  sortDirection: 'asc' | 'desc';
  setSorting: (field: string, direction: 'asc' | 'desc') => void;
  
  // Selection
  selectedIds: Set<string>;
  selectAll: boolean;
  toggleSelect: (id: string) => void;
  toggleSelectAll: () => void;
  clearSelection: () => void;
  
  // CRUD operations
  create: UseMutationResult<T, Error, TCreate>;
  update: UseMutationResult<T, Error, { id: string; data: TUpdate }>;
  remove: UseMutationResult<void, Error, string>;
  
  // Dialog state
  isCreateDialogOpen: boolean;
  isEditDialogOpen: boolean;
  isDeleteDialogOpen: boolean;
  editingItem: T | null;
  deletingItem: T | null;
  openCreateDialog: () => void;
  openEditDialog: (item: T) => void;
  openDeleteDialog: (item: T) => void;
  closeDialogs: () => void;
  
  // Bulk
  bulkDelete: () => void;
  bulkAction: (action: string) => void;
}`,
  },

  // ─── GenericCrudView ──────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "frontend.crudSystem.genericCrudViewTitle",
    id: "generic-crud-view",
  },
  { type: "paragraph", contentKey: "frontend.crudSystem.genericCrudViewIntro" },
  {
    type: "code",
    language: "tsx",
    filename: "GenericCrudView — Usage Example",
    code: `<GenericCrudView
  crud={vm.table}
  columns={vm.columns}
  title={t("admins.title")}
  
  // Optional customization
  createButtonLabel={t("admins.create")}
  searchPlaceholder={t("admins.searchPlaceholder")}
  emptyMessage={t("admins.noData")}
  
  // Form configuration
  createForm={<AdminForm mode="create" />}
  editForm={<AdminForm mode="edit" item={vm.table.editingItem} />}
  
  // Slot components
  headerSlot={<FilterSection {...vm.filters} />}
  beforeTableSlot={<StatisticsSection {...vm.statistics} />}
/>`,
  },

  // ─── Column System ────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "frontend.crudSystem.columnsTitle",
    id: "column-system",
  },
  {
    type: "code",
    language: "typescript",
    filename: "Column Helper API — All Builder Methods",
    code: `const column = createColumnHelper<Admin>();

// Built-in column types:
column.index("No");                        // Auto-incrementing row number
column.text("firstName", t("name"));       // Simple text rendering
column.date("createdAt", t("date"));       // Formatted date (locale-aware)
column.date("createdAt", t("date"), {      // With custom format
  locale: "en-GB",
  format: "dd/MM/yyyy HH:mm"
});

column.status("isActive", t("status"), {   // Status badge with colors
  true:  { label: t("active"),   color: "success" },
  false: { label: t("inactive"), color: "danger" },
});

column.switch("isBlocked", t("block"), {    // Toggle switch
  getChecked: (row) => row.isBlocked,
  onChange: (row, checked) => vm.toggleBlock(row.id, checked),
  isLoading: vm.isBlockLoading,
});

column.link("email", t("email"), {          // Clickable link
  type: "email",                            // "email" | "phone" | "url"
});

column.image("avatarUrl", t("avatar"), {    // Image thumbnail
  width: 40, height: 40,
  fallback: "/default-avatar.png",
});

column.custom("actions", t("actions"), (row) => (  // Fully custom
  <ActionButtons
    onEdit={() => vm.table.openEditDialog(row)}
    onDelete={() => vm.table.openDeleteDialog(row)}
  />
));`,
  },

  // ─── DataTable ────────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "frontend.crudSystem.dataTableTitle",
    id: "data-table",
  },
  {
    type: "feature-grid",
    columns: 3,
    items: [
      {
        icon: "🔍",
        titleKey: "frontend.crudSystem.searchTitle",
        descriptionKey: "frontend.crudSystem.searchDesc",
      },
      {
        icon: "🔄",
        titleKey: "frontend.crudSystem.sortingTitle",
        descriptionKey: "frontend.crudSystem.sortingDesc",
      },
      {
        icon: "📄",
        titleKey: "frontend.crudSystem.paginationTitle",
        descriptionKey: "frontend.crudSystem.paginationDesc",
      },
      {
        icon: "☑️",
        titleKey: "frontend.crudSystem.selectionTitle",
        descriptionKey: "frontend.crudSystem.selectionDesc",
      },
      {
        icon: "📱",
        titleKey: "frontend.crudSystem.responsiveTitle",
        descriptionKey: "frontend.crudSystem.responsiveDesc",
      },
      {
        icon: "🌐",
        titleKey: "frontend.crudSystem.rtlTitle",
        descriptionKey: "frontend.crudSystem.rtlDesc",
      },
    ],
  },

  // ─── Form System ─────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "frontend.crudSystem.formTitle",
    id: "form-system",
  },
  { type: "paragraph", contentKey: "frontend.crudSystem.formIntro" },
  {
    type: "code",
    language: "tsx",
    filename: "GenericForm + FormDialog — Usage",
    code: `// GenericForm provides schema-driven form rendering
<GenericForm
  schema={adminSchema}
  defaultValues={editingAdmin}
  onSubmit={(data) => crud.update.mutate({ id: admin.id, data })}
  isLoading={crud.update.isPending}
  fields={[
    { name: "firstName", label: t("firstName"), type: "text" },
    { name: "email", label: t("email"), type: "email" },
    { name: "roleId", label: t("role"), type: "select",
      options: roles.map(r => ({ value: r.id, label: r.name })) },
    { name: "isActive", label: t("active"), type: "switch" },
  ]}
/>

// FormDialog wraps GenericForm in a dialog
<FormDialog
  open={crud.isEditDialogOpen}
  onClose={crud.closeDialogs}
  title={t("admins.editTitle")}
>
  <GenericForm ... />
</FormDialog>

// ConfirmDialog for destructive actions
<ConfirmDialog
  open={crud.isDeleteDialogOpen}
  onConfirm={() => crud.remove.mutate(crud.deletingItem?.id)}
  onCancel={crud.closeDialogs}
  title={t("admins.deleteTitle")}
  message={t("admins.deleteMessage", { name: crud.deletingItem?.firstName })}
  variant="danger"
  isLoading={crud.remove.isPending}
/>`,
  },
  {
    type: "info",
    variant: "tip",
    contentKey: "frontend.crudSystem.extensionTip",
  },
];

registerPage({
  slug: "frontend/crud-system",
  titleKey: "frontend.crudSystem.title",
  descriptionKey: "frontend.crudSystem.description",
  category: "frontend",
  order: 2,
  sections,
  relatedSlugs: ["frontend/state-management", "architecture/frontend", "frontend/localization"],
  lastUpdated: "2026-02-20",
});
