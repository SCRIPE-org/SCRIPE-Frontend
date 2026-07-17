import { V1 } from "@/core/config/api-endpoints/_shared";

export const SIGNUP_CONTENT_ENDPOINTS = {
  GET: `${V1}/signup/content`,
  SET_MODE: `${V1}/signup/content/mode`,
  UPDATE_WELCOME: `${V1}/signup/content/welcome`,
  CREATE_TRUST_MARK: `${V1}/signup/content/trust-marks`,
  UPDATE_TRUST_MARK: (id: string) => `${V1}/signup/content/trust-marks/${id}`,
  DELETE_TRUST_MARK: (id: string) => `${V1}/signup/content/trust-marks/${id}`,
  REORDER_TRUST_MARKS: `${V1}/signup/content/trust-marks/reorder`,
  CREATE_CUSTOMER_LOGO: `${V1}/signup/content/logos`,
  UPDATE_CUSTOMER_LOGO: (id: string) => `${V1}/signup/content/logos/${id}`,
  DELETE_CUSTOMER_LOGO: (id: string) => `${V1}/signup/content/logos/${id}`,
  REORDER_CUSTOMER_LOGOS: `${V1}/signup/content/logos/reorder`,
} as const;
