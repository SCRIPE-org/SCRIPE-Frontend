import { V1 } from "@/core/config/api-endpoints/_shared";

/**
 * Documentation for module export
 */
export const SIGNUP_ENDPOINTS = {
  PRICING_CONTEXT: `${V1}/auth/signup/pricing-context`,
  GET_CATEGORIES: `${V1}/auth/signup/categories`,
  GET_EDITIONS: `${V1}/auth/signup/editions`,
  RECOMMENDATION: `${V1}/auth/signup/recommendation`,
  SEND_OTP: `${V1}/auth/signup/send-otp`,
  VERIFY_OTP: `${V1}/auth/signup/verify-otp`,
  CHECK_SUBDOMAIN: `${V1}/auth/signup/check-subdomain`,
  CONTACT_SALES: `${V1}/auth/signup/contact-sales`,
  REGISTER: `${V1}/auth/signup/register`,
  STATUS: `${V1}/auth/signup/status`,
  CHECKOUT_STATUS: `${V1}/auth/signup/checkout/status`,
  COMPLETE_SESSION: `${V1}/auth/signup/complete-session`,
  ABANDON: `${V1}/auth/signup/abandon`,
  RESUME: `${V1}/auth/signup/resume`,
  CHANGE_PLAN: `${V1}/auth/signup/change-plan`,
  ONBOARDING_FLOW: `${V1}/onboarding/flow`,
  ONBOARDING_RECOMMENDATION: `${V1}/onboarding/recommendation`,
  ONBOARDING_WELCOME_CONTENT: `${V1}/onboarding/welcome-content`,
  ONBOARDING_ANSWER: `${V1}/onboarding/answer`,
} as const;
