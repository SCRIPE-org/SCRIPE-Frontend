import { useState, useCallback, useRef, useMemo } from "react";
import { useGenericQuery } from "./useGenericQuery";
import { useGenericMutations } from "./useGenericMutations";
import { BaseEntity, PaginatedResult } from "../types";
import { useAppStore } from "@core/store/useAppStore";

export interface CrudViewModelOptions {
  initialPageSize?: number;
  enabled?: boolean;
  /**
   * Hold back the create/update success toast AND the automatic modal-close
   * on a successful save. For a caller doing additional async work after the
   * entity itself saves (e.g. GenericCrudView's entityTypeKey path saving
   * custom-field values) and needing the whole operation — not just the
   * entity's own save — to succeed before telling the user it's done. Call
   * `confirmCreateSuccess()` / `confirmUpdateSuccess()` once that follow-up
   * work actually finishes; call neither on failure, so the dialog stays
   * open with whatever error the caller surfaces. Defaults to false: every
   * existing caller keeps today's immediate toast + auto-close.
   */
  deferSuccessEffects?: boolean;
}

export type SortDirection = "asc" | "desc";

export function useCrudViewModel<T extends BaseEntity, TCreate = any, TUpdate = any>(
  key: any[],
  services: {
    getAll: (params: any) => Promise<PaginatedResult<T>>;
    create?: (data: TCreate) => Promise<T>;
    update?: (id: string, data: TUpdate) => Promise<T>;
    delete?: (id: string) => Promise<void>;
  },
  options: CrudViewModelOptions = {}
) {
  // Store Hydration Guard: ensure queries don't fire before auth/permission state is rehydrated
  const hasHydrated = useAppStore((state) => state._hasHydrated);
  const isQueryEnabled = (options.enabled !== false) && hasHydrated;

  // UI State
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(options.initialPageSize || 10);
  const [searchValue, setSearchValue] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Server-side sort — optional and additive (F-85). `sortBy` stays undefined
  // until a caller explicitly wires a column-header click to `handleSortChange`
  // (see GenericTable's `onSortChange` prop). Until then, `queryParams` below
  // never contains a sortBy/sortDirection key at all, so the object handed to
  // `getAll` is byte-identical to before this existed — no behavior change for
  // the ~10+ other modules built on this same shared hook.
  const [sortBy, setSortBy] = useState<string | undefined>(undefined);
  const [sortDirection, setSortDirection] = useState<SortDirection | undefined>(undefined);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);

  const [editingItem, setEditingItem] = useState<T | null>(null);
  const [viewItem, setViewItem] = useState<T | null>(null);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  // Conditionally-shaped params: only grows to include sortBy/sortDirection
  // once a consumer has actually requested a sort. Modules that never call
  // handleSortChange keep sending exactly { page, pageSize, search }.
  const queryParams = useMemo(
    () =>
      sortBy
        ? { page, pageSize, search: searchValue, sortBy, sortDirection }
        : { page, pageSize, search: searchValue },
    [page, pageSize, searchValue, sortBy, sortDirection]
  );

  // 1. Data Fetching
  const query = useGenericQuery<T>(key, services.getAll, queryParams, isQueryEnabled);

  // A delete (or a filter/search change) can shrink the result set below the page
  // we're currently sitting on, leaving a stale "page 5 of 3" state that renders an
  // empty list. Once the server confirms the real page count, snap back to the new
  // last valid page instead of leaving the user stranded past the end.
  //
  // Adjusted during render (React's documented pattern for "state derived from a
  // prop/query result") rather than in a useEffect, so the correction lands in the
  // same commit instead of an extra post-paint render pass.
  const pagesCount = query.data?.pagination?.pagesCount;
  const [lastSeenPagesCount, setLastSeenPagesCount] = useState(pagesCount);
  if (pagesCount !== lastSeenPagesCount) {
    setLastSeenPagesCount(pagesCount);
    if (pagesCount !== undefined && page > pagesCount) {
      setPage(Math.max(1, pagesCount));
    }
  }

  // 2. Mutations
  // Each mutation type closes ONLY the modal it belongs to. These used to
  // share one `onSuccess` that closed both the create AND edit modal on
  // either mutation's success — harmless while exactly one of the two could
  // ever be open, but a latent trap for any future path (or a modal={false}
  // interaction quirk) that left both flags true at once: a create landing
  // would silently discard whatever was mid-edit in the other dialog.
  const deferSuccessEffects = options.deferSuccessEffects === true;
  const mutations = useGenericMutations<T, TCreate, TUpdate>(key, services, {
    optimisticDelete: true,
    deferSuccessToast: deferSuccessEffects,
    onCreateSuccess: () => {
      if (!deferSuccessEffects) setIsCreateModalOpen(false);
    },
    onUpdateSuccess: () => {
      if (!deferSuccessEffects) closeEditModal();
    },
  });

  // Actions
  const handleSearchChange = useCallback((term: string) => {
    setSearchValue(term);
    setPage(1); // Reset to page 1 on search
  }, []);

  const changePage = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  const changePageSize = useCallback((newSize: number) => {
    setPageSize(newSize);
    setPage(1);
  }, []);

  // Server-side sort handler. Wire this to GenericTable's `onSortChange` (via
  // `customTableProps` on the CRUD config) to opt a specific list into real
  // server-side sorting; leaving it unwired keeps the existing client-side,
  // current-page-only sort behavior for that list.
  const handleSortChange = useCallback((column: string, direction: SortDirection) => {
    setSortBy(column);
    setSortDirection(direction);
    setPage(1); // Reset to page 1 — a new sort order invalidates the current page position
  }, []);

  const openEditModal = useCallback((item: T) => {
    setEditingItem(item);
    setIsEditModalOpen(true);
  }, []);

  const closeEditModal = useCallback(() => {
    setEditingItem(null);
    setIsEditModalOpen(false);
  }, []);

  const openViewModal = useCallback((item: T) => {
    setViewItem(item);
    setViewModalOpen(true);
  }, []);

  const closeViewModal = useCallback(() => {
    setViewItem(null);
    setViewModalOpen(false);
  }, []);

  const refreshItems = useCallback(async () => {
    await query.refetch();
  }, [query]);

  // Only meaningful when deferSuccessEffects is on — the caller invokes
  // these once ITS OWN follow-up work (beyond the entity's own save) has
  // actually succeeded. When deferSuccessEffects is off, onCreateSuccess/
  // onUpdateSuccess above already did this automatically, so calling these
  // too would double-toast and no-op the already-closed modal; callers gate
  // on the same option, not on these functions being merely present.
  const confirmCreateSuccess = useCallback(() => {
    mutations.showCreateSuccessToast();
    setIsCreateModalOpen(false);
  }, [mutations]);

  const confirmUpdateSuccess = useCallback(() => {
    mutations.showUpdateSuccessToast();
    closeEditModal();
  }, [mutations, closeEditModal]);

  return {
    // Data
    items: query.data?.items || [],
    pagination: query.data?.pagination || { itemsCount: 0, pageSize, page, pagesCount: 0 },
    loading: query.isLoading,
    error: query.error ? (query.error as Error).message : null,

    // State
    page,
    pageSize,
    searchValue,
    searchInputRef,
    selectedItems,
    setSelectedItems,
    sortBy,
    sortDirection,

    // Modals
    isCreateModalOpen,
    setIsCreateModalOpen,
    isEditModalOpen,
    setIsEditModalOpen,
    viewModalOpen,
    setViewModalOpen,
    viewItem,
    editingItem,

    // Actions
    handleSearchChange,
    changePage,
    changePageSize,
    handleSortChange,
    openEditModal,
    closeEditModal,
    openViewModal,
    closeViewModal,
    refreshItems,
    refresh: refreshItems, // Alias
    // Only meaningful with deferSuccessEffects: true — see the option's doc
    // comment. Present unconditionally so a caller can call it without an
    // extra existence check; it is simply never needed when the option is off.
    confirmCreateSuccess,
    confirmUpdateSuccess,

    // Mutation Wrappers
    createItem: mutations.create,
    updateItem: mutations.update,
    deleteItem: mutations.remove,

    // Loading States
    isCreating: mutations.isCreating,
    isUpdating: mutations.isUpdating,
    isDeleting: mutations.isDeleting,
  };
}
