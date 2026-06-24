/**
 * Domain model representing a Consent Purpose Data structure.
 * Bundles read-only attributes, computed properties, and copy builders for safe mutation state transfers.
 */
export interface ConsentPurposeData {
  id: string;
  key: string;
  name: string;
  nameAr?: string;
  description?: string;
  legalBasis: string;
  isRequired: boolean;
  sortOrder: number;
}

/**
 * Domain model representing a Regulation Data structure.
 * Bundles read-only attributes, computed properties, and copy builders for safe mutation state transfers.
 */
export interface RegulationData {
  id: string;
  code: string;
  name: string;
  jurisdiction?: string;
  dsrDeadlineDays: number;
  referenceUrl?: string;
  isActive: boolean;
  purposes: ConsentPurposeData[];
}

/**
 * Domain model representing a Regulation structure.
 * Bundles read-only attributes, computed properties, and copy builders for safe mutation state transfers.
 */
export class Regulation {
  constructor(private readonly data: RegulationData) {}

  get id() {
    return this.data.id;
  }
  get code() {
    return this.data.code;
  }
  get name() {
    return this.data.name;
  }
  get jurisdiction() {
    return this.data.jurisdiction ?? null;
  }
  get dsrDeadlineDays() {
    return this.data.dsrDeadlineDays;
  }
  get referenceUrl() {
    return this.data.referenceUrl ?? null;
  }
  get isActive() {
    return this.data.isActive;
  }
  get purposes(): ConsentPurposeData[] {
    return this.data.purposes ?? [];
  }

  copyWith(updates: Partial<RegulationData>): Regulation {
    return new Regulation({ ...this.data, ...updates });
  }
}

/**
 * Domain model representing a Create Regulation Request structure.
 * Bundles read-only attributes, computed properties, and copy builders for safe mutation state transfers.
 */
export interface CreateRegulationRequest {
  code: string;
  name: string;
  jurisdiction?: string;
  dsrDeadlineDays: number;
  defaultRetentionJson?: string;
  referenceUrl?: string;
  isActive: boolean;
}

/**
 * Domain model representing a Update Regulation Request structure.
 * Bundles read-only attributes, computed properties, and copy builders for safe mutation state transfers.
 */
export type UpdateRegulationRequest = CreateRegulationRequest;

/**
 * Domain model representing a Add Consent Purpose Request structure.
 * Bundles read-only attributes, computed properties, and copy builders for safe mutation state transfers.
 */
export interface AddConsentPurposeRequest {
  key: string;
  name: string;
  description?: string;
  legalBasis: string;
  isRequired: boolean;
  sortOrder: number;
}

/**
 * Domain model representing a Update Consent Purpose Request structure.
 * Bundles read-only attributes, computed properties, and copy builders for safe mutation state transfers.
 */
export type UpdateConsentPurposeRequest = AddConsentPurposeRequest;
