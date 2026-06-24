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
 * Interface structure detailing the properties and attributes of Consent Analytics Model.
 */
export interface ConsentAnalyticsModel {
  optInRates: Record<string, number>;
  totalSubjects: number;
  subjectsRequiringReConsent: number;
  generatedAt: string;
}
