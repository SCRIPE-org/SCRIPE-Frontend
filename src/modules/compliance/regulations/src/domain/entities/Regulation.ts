/**
 * Interface structure detailing the properties and attributes of Consent Purpose Data.
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
 * Interface structure detailing the properties and attributes of Regulation Data.
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
 * Domain entity class representing a Regulation.
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
 * Interface structure detailing the properties and attributes of Create Regulation Request.
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
 * Type declaration definition describing the schema of update regulation request.
 */
export type UpdateRegulationRequest = CreateRegulationRequest;

/**
 * Interface structure detailing the properties and attributes of Add Consent Purpose Request.
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
 * Type declaration definition describing the schema of update consent purpose request.
 */
export type UpdateConsentPurposeRequest = AddConsentPurposeRequest;
