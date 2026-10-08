// FILE-EXCEPTION: file length
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
    title: "Frontend CRUD Data Flow",
    direction: "vertical",
    nodes: [
      {
        id: "view",
        label: "View / GenericCrudView",
        type: "primary",
        description: "Renders table, modals, input forms",
      },
      {
        id: "vm",
        label: "useCrudViewModel",
        type: "warning",
        description: "Coordinates operational state and actions",
      },
      {
        id: "query",
        label: "useGenericQuery",
        type: "info",
        description: "Fetch list using keepPreviousData cache preservation",
      },
      {
        id: "mutations",
        label: "useGenericMutations",
        type: "success",
        description: "Handles create, update, delete mutations",
      },
      {
        id: "repo",
        label: "Repository Layer",
        type: "default",
        description: "Maps API DTO models to Domain Entities",
      },
      {
        id: "service",
        label: "API Service / Axios",
        type: "info",
        description: "Executes HTTP requests and extracts errors",
      },
    ],
    connections: [
      { from: "view", to: "vm", label: "binds UI state" },
      { from: "vm", to: "query", label: "subscribes to" },
      { from: "vm", to: "mutations", label: "triggers" },
      { from: "query", to: "repo", label: "calls getAll()" },
      { from: "mutations", to: "repo", label: "calls mutations" },
      { from: "repo", to: "service", label: "uses IApiService" },
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
    filename: "useCrudViewModel — Hook Signature & Options",
    code: `export interface CrudViewModelOptions {
  initialPageSize?: number; // Default: 10
  enabled?: boolean;         // Default: true
}

/**
 * Documentation for any>
 */
export function useCrudViewModel<T extends BaseEntity, TCreate = any, TUpdate = any>(
  key: any[],
  services: {
    getAll: (params: any) => Promise<PaginatedResult<T>>;
    create?: (data: TCreate) => Promise<T>;
    update?: (id: string, data: TUpdate) => Promise<T>;
    delete?: (id: string) => Promise<void>;
  },
  options: CrudViewModelOptions = {}
);`,
  },
  {
    type: "code",
    language: "typescript",
    filename: "useCrudViewModel — Returned State & Actions Interface",
    code: `interface CrudViewModelReturn<T, TCreate, TUpdate> {
  // Data & Status
  items: T[];
  pagination: {
    itemsCount: number;
    pageSize: number;
    page: number;
    pagesCount: number;
  };
  loading: boolean;
  error: string | null;

  // Pagination State & Actions
  page: number;
  pageSize: number;
  changePage: (newPage: number) => void;
  changePageSize: (newSize: number) => void;

  // Search State & Actions
  searchValue: string;
  searchInputRef: React.RefObject<HTMLInputElement>;
  handleSearchChange: (term: string) => void;

  // Selection State & Actions
  selectedItems: string[];
  setSelectedItems: React.Dispatch<React.SetStateAction<string[]>>;

  // Modal Dialog Controllers
  isCreateModalOpen: boolean;
  setIsCreateModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isEditModalOpen: boolean;
  setIsEditModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  viewModalOpen: boolean;
  setViewModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  editingItem: T | null;
  viewItem: T | null;

  // Modal State Transitions
  openEditModal: (item: T) => void;
  closeEditModal: () => void;
  openViewModal: (item: T) => void;
  closeViewModal: () => void;
  refreshItems: () => Promise<void>;
  refresh: () => Promise<void>; // Alias for refreshItems

  // Mutation Wrappers
  createItem: (data: TCreate) => Promise<T>;
  updateItem: (id: string, data: TUpdate) => Promise<T>;
  deleteItem: (id: string) => Promise<void>;

  // Pending States
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
}`,
  },

  // ─── Zero-Flicker Query Cache Preservation ────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "frontend.crudSystem.zeroFlickerTitle",
    id: "zero-flicker-query",
  },
  { type: "paragraph", contentKey: "frontend.crudSystem.zeroFlickerIntro" },
  {
    type: "code",
    language: "typescript",
    filename: "useGenericQuery.ts — Cache Preservation Config",
    code: `export function useGenericQuery<T, TParams = any>(
  key: any[],
  fetcher: (params: TParams) => Promise<PaginatedResult<T>>,
  params: TParams,
  enabled: boolean = true,
  options?: Omit<UseQueryOptions<PaginatedResult<T>>, "queryKey" | "queryFn">
) {
  return useQuery({
    queryKey: [...key, params],
    queryFn: () => fetcher(params),
    enabled,
    placeholderData: keepPreviousData, // Keeps the existing grid visible on page/search change
    ...options,
  });
}`,
  },

  // ─── Optimistic Deletes & Rollback Cache ──────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "frontend.crudSystem.optimisticDeletesTitle",
    id: "optimistic-deletes",
  },
  { type: "paragraph", contentKey: "frontend.crudSystem.optimisticDeletesIntro" },
  {
    type: "flowchart",
    title: "Optimistic Deletes & Rollback Sequence",
    direction: "vertical",
    nodes: [
      {
        id: "trigger",
        label: "User Delete Action",
        type: "danger",
        description: "Clicks delete confirm dialog",
      },
      {
        id: "onMutate",
        label: "onMutate Lifecycle Hook",
        type: "warning",
        description: "Executes immediately before API request",
      },
      {
        id: "cancel",
        label: "Cancel Outgoing Queries",
        type: "info",
        description: "Prevents race conditions from active fetches",
      },
      {
        id: "backup",
        label: "Capture Cache Snapshot",
        type: "default",
        description: "Saves previous list data to mutation context",
      },
      {
        id: "optimistic",
        label: "Update Cache In-Memory",
        type: "success",
        description: "Filters out deleted record from UI state",
      },
      {
        id: "apiCall",
        label: "Backend API Call",
        type: "primary",
        description: "Executes HTTP DELETE query",
      },
      {
        id: "success",
        label: "API Call Result",
        type: "info",
        description: "Checks if backend request succeeded",
      },
      {
        id: "rollback",
        label: "Rollback Cache State",
        type: "danger",
        description: "Restores saved list data snapshot on error",
      },
      {
        id: "settle",
        label: "Re-fetch / Invalidate",
        type: "success",
        description: "Forces query invalidate to sync with backend",
      },
    ],
    connections: [
      { from: "trigger", to: "onMutate" },
      { from: "onMutate", to: "cancel" },
      { from: "cancel", to: "backup" },
      { from: "backup", to: "optimistic" },
      { from: "optimistic", to: "apiCall" },
      { from: "apiCall", to: "success" },
      { from: "success", to: "settle", label: "Success" },
      { from: "success", to: "rollback", label: "Failure" },
      { from: "rollback", to: "settle", label: "Settles cache" },
    ],
  },
  {
    type: "code",
    language: "typescript",
    filename: "useGenericMutations.ts — Optimistic Delete Setup",
    code: `const deleteMutation = useMutation({
  mutationKey: [...(baseKey as unknown[]), "delete"],
  mutationFn: async (id: string) => services.delete(id),
  onMutate: options?.optimisticDelete
    ? async (id: string) => {
        await queryClient.cancelQueries({ queryKey: baseKey });
        const previous = queryClient.getQueryData(baseKey);
        
        // Optimistically remove from list cache
        queryClient.setQueryData(baseKey, (old: any) => {
          if (!old) return old;
          const items = old.items ?? old.data ?? [];
          const filtered = items.filter((item: any) => item.id !== id);
          return { ...old, items: filtered };
        });
        
        return { previous };
      }
    : undefined,
  onError: (_, __, context) => {
    if (context?.previous !== undefined) {
      // Rollback on failure
      queryClient.setQueryData(baseKey, context.previous);
    }
  },
  onSettled: () => {
    // Sync with database
    queryClient.invalidateQueries({ queryKey: baseKey });
  }
});`,
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
