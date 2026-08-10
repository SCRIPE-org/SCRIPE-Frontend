import { V1 } from "@/core/config/api-endpoints/_shared";

export const CUSTOM_FIELD_VALUE_ENDPOINTS = {
  DEFINITIONS: (entityTypeKey: string) => `${V1}/custom-fields/values/${entityTypeKey}`,
  VALUES: (entityTypeKey: string, ownerId: string) =>
    `${V1}/custom-fields/values/${entityTypeKey}/${ownerId}`,
} as const;
