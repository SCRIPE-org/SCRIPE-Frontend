/**
 * Interface defining property specifications, keys types, and structural contract rules for consent purpose model.
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
 * Interface defining property specifications, keys types, and structural contract rules for regulation profile model.
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
 * Interface defining property specifications, keys types, and structural contract rules for create regulation request.
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
 * Exported type defining parameters and fields for update regulation request configurations.
 */
export type UpdateRegulationRequest = CreateRegulationRequest;

/**
 * Interface defining property specifications, keys types, and structural contract rules for add consent purpose request.
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
 * Exported type defining parameters and fields for update consent purpose request configurations.
 */
export type UpdateConsentPurposeRequest = AddConsentPurposeRequest;
