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
