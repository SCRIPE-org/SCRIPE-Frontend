import { V1 } from "@/core/config/api-endpoints/_shared";

export const EDITIONS_ENDPOINTS = {
  LIST: `${V1}/editions`,
  BY_ID: (id: string) => `${V1}/editions/${id}`,
  CREATE: `${V1}/editions`,
  UPDATE: (id: string) => `${V1}/editions/${id}`,
  DELETE: (id: string) => `${V1}/editions/${id}`,
  SET_FEATURE: (editionId: string, featureId: string) =>
    `${V1}/editions/${editionId}/features/${featureId}`,
  REMOVE_FEATURE: (editionId: string, featureId: string) =>
    `${V1}/editions/${editionId}/features/${featureId}`,
  VERSIONS: (editionId: string) => `${V1}/editions/${editionId}/versions`,
  CREATE_VERSION: (editionId: string) => `${V1}/editions/${editionId}/versions`,
  PUBLISH_VERSION: (editionId: string, versionId: string) =>
    `${V1}/editions/${editionId}/versions/${versionId}/publish`,
  CANCEL_VERSION: (editionId: string, versionId: string) =>
    `${V1}/editions/${editionId}/versions/${versionId}/cancel`,
  DIRECT_APPLY_FEATURES: (editionId: string) => `${V1}/editions/${editionId}/features/apply`,
  PRICES: (editionId: string) => `${V1}/editions/${editionId}/prices`,
  SET_PRICES: (editionId: string) => `${V1}/editions/${editionId}/prices`,
  RATES: (baseCurrency: string = "USD") => `${V1}/currency/rates?baseCurrency=${baseCurrency}`,
  PROMOTIONS: (editionId: string) => `${V1}/editions/${editionId}/promotions`,
  CREATE_PROMOTION: (editionId: string) => `${V1}/editions/${editionId}/promotions`,
  UPDATE_PROMOTION: (editionId: string, promoId: string) =>
    `${V1}/editions/${editionId}/promotions/${promoId}`,
  DELETE_PROMOTION: (editionId: string, promoId: string) =>
    `${V1}/editions/${editionId}/promotions/${promoId}`,
  VALIDATE_PROMO_CODE: (editionId: string) =>
    `${V1}/editions/${editionId}/promotions/validate-code`,
} as const;
