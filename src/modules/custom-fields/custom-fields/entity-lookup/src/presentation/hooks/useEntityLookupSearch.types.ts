import type { EntityLookupItem } from "../../data/models/EntityLookupModel";
import type { EntityLookupError } from "../../domain/entities/EntityLookupError";

/** Arguments for useEntityLookupSearch hook. */
export interface UseEntityLookupSearchArgs {
  /**
   * Registry key of the type being searched, e.g. `identity.user`.
   * Nullable when an unpinned custom field has not yet selected a target type.
   */
  entityTypeKey?: string | null;
  /**
   * Gate for conditional fetching. Defaults to true.
   */
  enabled?: boolean;
  /** Page size. Defaults to 20. */
  pageSize?: number;
}

/** Result object returned by useEntityLookupSearch hook. */
export interface UseEntityLookupSearchResult {
  /** The live text in the search box. */
  query: string;
  /** Sets the search query text with debounced execution. */
  setQuery: (next: string) => void;
  /** Accumulated entity lookup items for the current query. */
  items: EntityLookupItem[];
  /** True while the initial page is fetching. */
  isLoading: boolean;
  /** True while subsequent pages are fetching. */
  isLoadingMore: boolean;
  /** Indicates if additional pages are available from the server. */
  hasNextPage: boolean;
  /** Fetches the next page of results. */
  loadMore: () => void;
  /** Any error encountered during entity lookup. */
  error: EntityLookupError | null;
  /** Retries the current query from page 1. */
  reload: () => void;
}

/** Internal state tracking active search request parameters. */
export interface SearchRequest {
  entityTypeKey: string | null | undefined;
  query: string;
  requestQuery: string;
  page: number;
  nonce: number;
}
