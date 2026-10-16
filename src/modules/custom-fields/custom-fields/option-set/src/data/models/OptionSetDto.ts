/**
 * OptionSet Data Transfer Objects (DTOs) and Requests
 *
 * Defines API payload interfaces for shared option sets, versions, items, and binding receipts.
 */

import type { FieldVersionStatus } from "../../domain/entities/OptionSetVersion";
import type {
  FieldOptionStatus,
  OptionSetItemWritableStatus,
} from "../../domain/entities/OptionSetItem";

/**
 * Documentation for module export
 */
export type { FieldVersionStatus, FieldOptionStatus, OptionSetItemWritableStatus };

/**
 * OptionSet summary and list row JSON structure.
 */
export interface OptionSetJson {
  id: string;
  stableKey: string;
  labelEn: string;
  labelAr: string | null;
  description: string | null;
  isSystemManaged: boolean;
  isPlatformOwned: boolean;
  versionCount: number;
  publishedVersionId: string | null;
  publishedVersionNumber: number | null;
}

/**
 * Version summary JSON structure excluding child items.
 */
export interface OptionSetVersionSummaryJson {
  id: string;
  versionNumber: number;
  status: FieldVersionStatus;
  publishedAtUtc: string | null;
  itemCount: number;
}

/**
 * OptionSet detail payload containing metadata and the complete version chain.
 */
export interface OptionSetDetailJson {
  set: OptionSetJson;
  versions: OptionSetVersionSummaryJson[];
}

/**
 * Option item JSON representation within a version.
 */
export interface OptionSetItemJson {
  id: string;
  key: string;
  labelEn: string;
  labelAr: string | null;
  color: string | null;
  iconKey: string | null;
  sortOrder: number;
  status: FieldOptionStatus;
}

/**
 * Full version JSON representation including the complete ordered option list.
 */
export interface OptionSetVersionJson {
  id: string;
  optionSetId: string;
  versionNumber: number;
  status: FieldVersionStatus;
  publishedAtUtc: string | null;
  items: OptionSetItemJson[];
}

/**
 * Receipt payload reporting counts of affected options after a bind, rebind, or unbind action.
 */
export interface OptionSetBindingResultJson {
  inserted: number;
  updated: number;
  deactivated: number;
  untouched: number;
  preservedLocalOptions: number;
}

/**
 * Request payload for creating a new option set.
 */
export interface CreateOptionSetRequestJson {
  stableKey: string;
  labelEn: string;
  labelAr: string | null;
  description: string | null;
  isGlobal: boolean;
}

/**
 * Request payload for updating mutable option set metadata.
 */
export interface UpdateOptionSetRequestJson {
  labelEn: string;
  labelAr: string | null;
  description: string | null;
}

/**
 * Request payload for an individual option set item.
 */
export interface OptionSetItemRequestJson {
  key: string;
  labelEn: string;
  labelAr: string | null;
  color: string | null;
  iconKey: string | null;
  sortOrder: number;
  status: OptionSetItemWritableStatus;
}

/**
 * Request payload for updating or creating version items in batch.
 */
export interface OptionSetVersionItemsRequestJson {
  items: OptionSetItemRequestJson[];
}

/**
 * Request payload for binding a field version to a published option set version.
 */
export interface BindOptionSetRequestJson {
  optionSetVersionId: string;
}
