import { V1 } from "@/core/config/api-endpoints/_shared";

export const CUSTOM_FIELD_ENDPOINTS = {
  LIST: `${V1}/custom-fields`,
  BY_ID: (id: string) => `${V1}/custom-fields/${id}`,
  CREATE: `${V1}/custom-fields`,
  UPDATE: (id: string) => `${V1}/custom-fields/${id}`,
  DELETE: (id: string) => `${V1}/custom-fields/${id}`,
  ENTITY_TYPES: `${V1}/custom-fields/entity-types`,
} as const;
