/**
 * Consent Domain Entity
 */

export type ConsentAction = "Granted" | "Withdrawn";

/**
 * Domain model representing a Consent Status Data structure.
 * Bundles read-only attributes, computed properties, and copy builders for safe mutation state transfers.
 */
export interface ConsentStatusData {
  purposeId: string;
  purposeKey: string;
  purposeName: string;
  currentAction: ConsentAction;
  requiresReConsent: boolean;
  lastUpdatedAt: string;
  consentVersion?: string;
}

/**
 * Domain model representing a Consent Status structure.
 * Bundles read-only attributes, computed properties, and copy builders for safe mutation state transfers.
 */
export class ConsentStatus {
  constructor(private readonly data: ConsentStatusData) {}

  get purposeId() {
    return this.data.purposeId;
  }
  get purposeKey() {
    return this.data.purposeKey ?? "";
  }
  get purposeName() {
    return this.data.purposeName ?? this.data.purposeKey ?? "";
  }
  get currentAction() {
    return this.data.currentAction;
  }
  get isGranted() {
    return this.data.currentAction === "Granted";
  }
  get requiresReConsent() {
    return this.data.requiresReConsent ?? false;
  }
  get lastUpdatedAt() {
    return new Date(this.data.lastUpdatedAt);
  }
  get consentVersion() {
    return this.data.consentVersion ?? "1.0";
  }

  copyWith(updates: Partial<ConsentStatusData>): ConsentStatus {
    return new ConsentStatus({ ...this.data, ...updates });
  }
}

/**
 * Domain model representing a Record Consent Request structure.
 * Bundles read-only attributes, computed properties, and copy builders for safe mutation state transfers.
 */
export interface RecordConsentRequest {
  purposeId: string;
  action: ConsentAction;
  consentVersion: string;
  collectionMethod?: string;
}

/**
 * Domain model representing a Consent Analytics structure.
 * Bundles read-only attributes, computed properties, and copy builders for safe mutation state transfers.
 */
export class ConsentAnalytics {
  constructor(private readonly data: any) {}

  get optInRates(): Record<string, number> {
    return this.data.optInRates ?? {};
  }
  get totalSubjects() {
    return this.data.totalSubjects ?? 0;
  }
  get subjectsRequiringReConsent() {
    return this.data.subjectsRequiringReConsent ?? 0;
  }
  get generatedAt() {
    return new Date(this.data.generatedAt);
  }
}
