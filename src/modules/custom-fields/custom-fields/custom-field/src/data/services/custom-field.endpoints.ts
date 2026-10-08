import { V1 } from "@/core/config/api-endpoints/_shared";

/**
 * Documentation for module export
 */
export const CUSTOM_FIELD_ENDPOINTS = {
  LIST: `${V1}/custom-fields`,
  BY_ID: (id: string) => `${V1}/custom-fields/${id}`,
  CREATE: `${V1}/custom-fields`,
  UPDATE: (id: string) => `${V1}/custom-fields/${id}`,
  /**
   * `force=true` bypasses the server's data-integrity refusal (Wave 6 row 6.3). Only ever sent after
   * the user has confirmed against real counts -- see CustomFieldService.delete.
   */
  DELETE: (id: string, force?: boolean) =>
    force ? `${V1}/custom-fields/${id}?force=true` : `${V1}/custom-fields/${id}`,
  /** Wave 6 row 6.6 -- definition change history, paged. */
  HISTORY: (id: string, page: number, pageSize: number) =>
    `${V1}/custom-fields/${id}/history?page=${page}&pageSize=${pageSize}`,
  /** Wave 6 row 6.3 -- value counts and delete impact. */
  USAGE: (id: string) => `${V1}/custom-fields/${id}/usage`,
  ENTITY_TYPES: `${V1}/custom-fields/entity-types`,
  /**
   * P-4 follow-up (option-set binding). `FieldVersionsController`'s only read route -- a SEPARATE
   * controller under `custom-fields/versions`, not `custom-fields/{id}/versions`; see that
   * controller's own header for why the version lifecycle sits in its own flat segment rather than
   * nested under this one.
   */
  VERSIONS: (id: string) => `${V1}/custom-fields/versions/${id}`,
  /**
   * Visibility Rules endpoints (Wave 5 row 5.3) — flat controller at `custom-fields/visibility-rules`.
   */
  VISIBILITY_RULES: (customFieldId: string) =>
    `${V1}/custom-fields/visibility-rules?customFieldId=${customFieldId}`,
  CREATE_VISIBILITY_RULE: `${V1}/custom-fields/visibility-rules`,
  UPDATE_VISIBILITY_RULE: (id: string) => `${V1}/custom-fields/visibility-rules/${id}`,
  DELETE_VISIBILITY_RULE: (id: string) => `${V1}/custom-fields/visibility-rules/${id}`,
  /**
   * Value-Type Conversion endpoints (Wave 6 row 6.2).
   */
  CHANGE_TYPE: (id: string) => `${V1}/custom-fields/${id}/change-type`,
  ROLLBACK_CHANGE_TYPE: (jobRunId: string) => `${V1}/custom-fields/change-type/${jobRunId}/rollback`,
  /**
   * Version Lifecycle endpoints (Step 1.3 / P-10).
   */
  CREATE_VERSION_DRAFT: (customFieldId: string) => `${V1}/custom-fields/versions/${customFieldId}/draft`,
  PUBLISH_VERSION: (customFieldId: string) => `${V1}/custom-fields/versions/${customFieldId}/publish`,
  DISCARD_VERSION_DRAFT: (customFieldId: string) => `${V1}/custom-fields/versions/${customFieldId}/discard-draft`,
} as const;
