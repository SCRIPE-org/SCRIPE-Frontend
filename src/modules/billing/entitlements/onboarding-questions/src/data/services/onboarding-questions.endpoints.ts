import { V1 } from "@/core/config/api-endpoints/_shared";

/**
 * Documentation for module export
 */
export const ONBOARDING_QUESTIONS_ENDPOINTS = {
  QUESTIONS: {
    LIST: `${V1}/onboarding/questions`,
    BY_ID: (id: string) => `${V1}/onboarding/questions/${id}`,
    CREATE: `${V1}/onboarding/questions`,
    UPDATE: (id: string) => `${V1}/onboarding/questions/${id}`,
    DELETE: (id: string) => `${V1}/onboarding/questions/${id}`,
  },
  OPTIONS: {
    LIST: (questionId: string) => `${V1}/onboarding/questions/${questionId}/options`,
    CREATE: (questionId: string) => `${V1}/onboarding/questions/${questionId}/options`,
    UPDATE: (questionId: string, optionId: string) =>
      `${V1}/onboarding/questions/${questionId}/options/${optionId}`,
    DELETE: (questionId: string, optionId: string) =>
      `${V1}/onboarding/questions/${questionId}/options/${optionId}`,
    REORDER: (questionId: string) =>
      `${V1}/onboarding/questions/${questionId}/options/reorder`,
  },
} as const;
