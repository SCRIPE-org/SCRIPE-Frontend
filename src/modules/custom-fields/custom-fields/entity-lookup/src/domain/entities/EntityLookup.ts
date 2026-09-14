/**
 * EntityLookup Domain Contracts (Wave 4 — EntityReference / UserReference)
 *
 * Domain contracts defining selectable entity types, lookup items, search queries,
 * and held entity references. Kept in the domain layer to adhere strictly to
 * Clean Architecture boundaries.
 */

export interface EntityLookupType {
  /** Stable cross-module registry key, e.g. `hrms.staff-member`. */
  key: string;
  /** Owning module name. */
  owningModule: string;
  /** English label. */
  displayNameEn: string;
  /** Arabic label. */
  displayNameAr: string;
}

export interface EntityLookupItem {
  /** The ENCRYPTED record id. */
  id: string;
  /** Primary label. */
  displayName: string;
  /** Optional disambiguator shown beneath the label (a job title, a code). */
  secondary: string | null;
  /** False for a row that still exists and is selectable but dormant. */
  isActive: boolean;
}

export interface EntityLookupSearchQuery {
  /** Free-text filter. Null means unfiltered. */
  search: string | null;
  /** 1-based page index. */
  page: number;
  /** Page size. */
  pageSize: number;
}

export const ENTITY_LOOKUP_DEFAULT_PAGE_SIZE = 20;
export const ENTITY_LOOKUP_SEARCH_DEBOUNCE_MS = 300;

export interface EntityLookupReference {
  /** Registry key of the referenced type. */
  entityTypeKey: string;
  /** The ENCRYPTED target id. */
  entityId: string;
}
