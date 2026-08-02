import { V1 } from "@/core/config/api-endpoints/_shared";

export const PERMISSIONS_ENDPOINTS = {
  LIST: `${V1}/Permissions`,
  MY: `${V1}/Permissions/my`,
  BY_ID: (id: string) => `${V1}/Permissions/${id}`,
  CATEGORIES: `${V1}/Permissions/categories`,
  GROUPED: `${V1}/Permissions/grouped`,
  TENANTS: {
    PERMISSIONS: (id: string) => `${V1}/Tenants/${id}/permissions`,
    PERMISSIONS_GROUPED: (id: string) => `${V1}/Tenants/${id}/permissions/grouped`,
  },
} as const;
