/**
 * Interface structure detailing the properties and attributes of Consent Purpose Model.
 */
export interface ConsentPurposeModel {
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
 * Interface structure detailing the properties and attributes of Regulation Profile Model.
 */
export interface RegulationProfileModel {
  id: string;
  code: string;
  name: string;
  jurisdiction?: string;
  dsrDeadlineDays: number;
  referenceUrl?: string;
  isActive: boolean;
  purposes: ConsentPurposeModel[];
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
