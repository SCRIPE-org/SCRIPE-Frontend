import { V1 } from "@/core/config/api-endpoints/_shared";

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
} as const;
