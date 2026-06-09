import { registerPage } from "../../repositories/DocsRepository";

registerPage({
  slug: "frontend/crud-system",
  titleKey: "frontend.crudSystem.title",
  category: "frontend",
  order: 2,
  sections: [
  {
    "type": "paragraph",
    "contentKey": "frontend.crudSystem.section_0_content"
  },
  {
    "type": "paragraph",
    "contentKey": "frontend.crudSystem.section_1_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "frontend.crudSystem.section_2_title",
    "id": "sec_2"
  },
  {
    "type": "code",
    "language": "mermaid",
    "code": "graph TD\n    view([\"GenericCrudView\"])\n    %% view: Orchestrates table, dialogs, pagination\n    datatable([\"DataTable\"])\n    %% datatable: Flexible table with sorting, search, selection\n    formDialog([\"FormDialog\"])\n    %% formDialog: Create/Edit form in a dialog\n    confirm[\"ConfirmDialog\"]\n    %% confirm: Delete/bulk action confirmation\n    viewModel{{\"useCrudViewModel\"}}\n    %% viewModel: Hook: all CRUD state & mutations\n    repo[\"ICrudRepository\"]\n    %% repo: Data access abstraction\n    view --> datatable\n    view --> formDialog\n    view --> confirm\n    view -->|\"uses\"| viewModel\n    viewModel -->|\"calls\"| repo",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "frontend.crudSystem.section_4_title",
    "id": "sec_4"
  },
  {
    "type": "paragraph",
    "contentKey": "frontend.crudSystem.section_5_content"
  },
  {
    "type": "paragraph",
    "contentKey": "frontend.crudSystem.section_6_content"
  },
  {
    "type": "code",
    "language": "typescript",
    "code": "interface CrudViewModelConfig<T, TCreate, TUpdate> {\n  // Data fetching\n  queryKey: string;\n  fetchFn: (params: PaginationParams) => Promise<PaginatedResult<T>>;\n  \n  // Mutations (optional)\n  createFn?: (data: TCreate) => Promise<T>;\n  updateFn?: (id: string, data: TUpdate) => Promise<T>;\n  deleteFn?: (id: string) => Promise<void>;\n  \n  // Bulk operations (optional)\n  bulkDeleteFn?: (ids: string[]) => Promise<void>;\n  bulkDeleteAllFn?: (filter: FilterParams, excludeIds: string[]) => Promise<void>;\n  bulkActionFn?: (ids: string[], action: string) => Promise<void>;\n  \n  // Configuration\n  defaultPageSize?: number;           // Default: 10\n  searchDebounceMs?: number;          // Default: 300\n  enableSelection?: boolean;          // Default: false\n  enableBulkActions?: boolean;        // Default: false\n  enableGlobalFilter?: boolean;       // Default: true\n  staleTime?: number;                 // Default: 5 min\n  \n  // Form configuration\n  formSchema?: ZodSchema;             // For validation\n  defaultFormValues?: Partial<TCreate>;\n  \n  // Callbacks\n  onCreateSuccess?: (item: T) => void;\n  onUpdateSuccess?: (item: T) => void;\n  onDeleteSuccess?: () => void;\n  onError?: (error: Error) => void;\n}",
    "filename": ""
  },
  {
    "type": "paragraph",
    "contentKey": "frontend.crudSystem.section_8_content"
  },
  {
    "type": "code",
    "language": "typescript",
    "code": "interface CrudViewModelReturn<T> {\n  // Data\n  items: T[];\n  totalCount: number;\n  isLoading: boolean;\n  error: Error | null;\n  \n  // Pagination\n  page: number;\n  pageSize: number;\n  totalPages: number;\n  setPage: (page: number) => void;\n  setPageSize: (size: number) => void;\n  \n  // Search\n  search: string;\n  setSearch: (search: string) => void;\n  debouncedSearch: string;\n  \n  // Sorting\n  sortBy: string;\n  sortDirection: 'asc' | 'desc';\n  setSorting: (field: string, direction: 'asc' | 'desc') => void;\n  \n  // Selection\n  selectedIds: Set<string>;\n  selectAll: boolean;\n  toggleSelect: (id: string) => void;\n  toggleSelectAll: () => void;\n  clearSelection: () => void;\n  \n  // CRUD operations\n  create: UseMutationResult<T, Error, TCreate>;\n  update: UseMutationResult<T, Error, { id: string; data: TUpdate }>;\n  remove: UseMutationResult<void, Error, string>;\n  \n  // Dialog state\n  isCreateDialogOpen: boolean;\n  isEditDialogOpen: boolean;\n  isDeleteDialogOpen: boolean;\n  editingItem: T | null;\n  deletingItem: T | null;\n  openCreateDialog: () => void;\n  openEditDialog: (item: T) => void;\n  openDeleteDialog: (item: T) => void;\n  closeDialogs: () => void;\n  \n  // Bulk\n  bulkDelete: () => void;\n  bulkAction: (action: string) => void;\n}",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "frontend.crudSystem.section_10_title",
    "id": "sec_10"
  },
  {
    "type": "paragraph",
    "contentKey": "frontend.crudSystem.section_11_content"
  },
  {
    "type": "paragraph",
    "contentKey": "frontend.crudSystem.section_12_content"
  },
  {
    "type": "code",
    "language": "tsx",
    "code": "<GenericCrudView\n  crud={vm.table}\n  columns={vm.columns}\n  title={t(\"admins.title\")}\n  \n  // Optional customization\n  createButtonLabel={t(\"admins.create\")}\n  searchPlaceholder={t(\"admins.searchPlaceholder\")}\n  emptyMessage={t(\"admins.noData\")}\n  \n  // Form configuration\n  createForm={<AdminForm mode=\"create\" />}\n  editForm={<AdminForm mode=\"edit\" item={vm.table.editingItem} />}\n  \n  // Slot components\n  headerSlot={<FilterSection {...vm.filters} />}\n  beforeTableSlot={<StatisticsSection {...vm.statistics} />}\n/>",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "frontend.crudSystem.section_14_title",
    "id": "sec_14"
  },
  {
    "type": "paragraph",
    "contentKey": "frontend.crudSystem.section_15_content"
  },
  {
    "type": "code",
    "language": "typescript",
    "code": "const column = createColumnHelper<Admin>();\n\n// Built-in column types:\ncolumn.index(\"No\");                        // Auto-incrementing row number\ncolumn.text(\"firstName\", t(\"name\"));       // Simple text rendering\ncolumn.date(\"createdAt\", t(\"date\"));       // Formatted date (locale-aware)\ncolumn.date(\"createdAt\", t(\"date\"), {      // With custom format\n  locale: \"en-GB\",\n  format: \"dd/MM/yyyy HH:mm\"\n});\n\ncolumn.status(\"isActive\", t(\"status\"), {   // Status badge with colors\n  true:  { label: t(\"active\"),   color: \"success\" },\n  false: { label: t(\"inactive\"), color: \"danger\" },\n});\n\ncolumn.switch(\"isBlocked\", t(\"block\"), {    // Toggle switch\n  getChecked: (row) => row.isBlocked,\n  onChange: (row, checked) => vm.toggleBlock(row.id, checked),\n  isLoading: vm.isBlockLoading,\n});\n\ncolumn.link(\"email\", t(\"email\"), {          // Clickable link\n  type: \"email\",                            // \"email\" | \"phone\" | \"url\"\n});\n\ncolumn.image(\"avatarUrl\", t(\"avatar\"), {    // Image thumbnail\n  width: 40, height: 40,\n  fallback: \"/default-avatar.png\",\n});\n\ncolumn.custom(\"actions\", t(\"actions\"), (row) => (  // Fully custom\n  <ActionButtons\n    onEdit={() => vm.table.openEditDialog(row)}\n    onDelete={() => vm.table.openDeleteDialog(row)}\n  />\n));",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "frontend.crudSystem.section_17_title",
    "id": "sec_17"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "frontend.crudSystem.section_18_title",
    "id": "sec_18"
  },
  {
    "type": "paragraph",
    "contentKey": "frontend.crudSystem.section_19_content"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "frontend.crudSystem.section_20_title",
    "id": "sec_20"
  },
  {
    "type": "paragraph",
    "contentKey": "frontend.crudSystem.section_21_content"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "frontend.crudSystem.section_22_title",
    "id": "sec_22"
  },
  {
    "type": "paragraph",
    "contentKey": "frontend.crudSystem.section_23_content"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "frontend.crudSystem.section_24_title",
    "id": "sec_24"
  },
  {
    "type": "paragraph",
    "contentKey": "frontend.crudSystem.section_25_content"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "frontend.crudSystem.section_26_title",
    "id": "sec_26"
  },
  {
    "type": "paragraph",
    "contentKey": "frontend.crudSystem.section_27_content"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "frontend.crudSystem.section_28_title",
    "id": "sec_28"
  },
  {
    "type": "paragraph",
    "contentKey": "frontend.crudSystem.section_29_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "frontend.crudSystem.section_30_title",
    "id": "sec_30"
  },
  {
    "type": "paragraph",
    "contentKey": "frontend.crudSystem.section_31_content"
  },
  {
    "type": "paragraph",
    "contentKey": "frontend.crudSystem.section_32_content"
  },
  {
    "type": "code",
    "language": "tsx",
    "code": "// GenericForm provides schema-driven form rendering\n<GenericForm\n  schema={adminSchema}\n  defaultValues={editingAdmin}\n  onSubmit={(data) => crud.update.mutate({ id: admin.id, data })}\n  isLoading={crud.update.isPending}\n  fields={[\n    { name: \"firstName\", label: t(\"firstName\"), type: \"text\" },\n    { name: \"email\", label: t(\"email\"), type: \"email\" },\n    { name: \"roleId\", label: t(\"role\"), type: \"select\",\n      options: roles.map(r => ({ value: r.id, label: r.name })) },\n    { name: \"isActive\", label: t(\"active\"), type: \"switch\" },\n  ]}\n/>\n\n// FormDialog wraps GenericForm in a dialog\n<FormDialog\n  open={crud.isEditDialogOpen}\n  onClose={crud.closeDialogs}\n  title={t(\"admins.editTitle\")}\n>\n  <GenericForm ... />\n</FormDialog>\n\n// ConfirmDialog for destructive actions\n<ConfirmDialog\n  open={crud.isDeleteDialogOpen}\n  onConfirm={() => crud.remove.mutate(crud.deletingItem?.id)}\n  onCancel={crud.closeDialogs}\n  title={t(\"admins.deleteTitle\")}\n  message={t(\"admins.deleteMessage\", { name: crud.deletingItem?.firstName })}\n  variant=\"danger\"\n  isLoading={crud.remove.isPending}\n/>",
    "filename": ""
  },
  {
    "type": "info",
    "variant": "tip",
    "titleKey": "frontend.crudSystem.section_34_title",
    "contentKey": "frontend.crudSystem.section_34_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "frontend.crudSystem.section_35_title",
    "id": "sec_35"
  },
  {
    "type": "list",
    "variant": "unordered",
    "items": [
      "frontend.crudSystem.section_36_item_0",
      "frontend.crudSystem.section_36_item_1",
      "frontend.crudSystem.section_36_item_2"
    ]
  }
],
  relatedSlugs: [
  "frontend/state-management",
  "architecture/frontend",
  "frontend/localization"
],
  lastUpdated: "2026-06-09",
});
