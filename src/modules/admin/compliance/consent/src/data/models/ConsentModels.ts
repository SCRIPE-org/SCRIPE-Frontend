/**
 * Consent Data Models — Raw DTOs matching backend API response exactly.
 * NEVER used in presentation layer.
 */

export interface ConsentStatusModel {
  purposeId: string;
  purposeKey: string;
  purposeName: string;
  currentAction: string;
  requiresReConsent: boolean;
  lastUpdatedAt: string;
  consentVersion?: string;
}

/**
 * Interface defining property specifications, keys types, and structural contract rules for consent analytics model.
 */
export interface ConsentAnalyticsModel {
  optInRates: Record<string, number>;
  totalSubjects: number;
  subjectsRequiringReConsent: number;
  generatedAt: string;
}
