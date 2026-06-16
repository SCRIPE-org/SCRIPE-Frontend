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

export interface CreateRegulationRequest {
  code: string;
  name: string;
  jurisdiction?: string;
  dsrDeadlineDays: number;
  defaultRetentionJson?: string;
  referenceUrl?: string;
  isActive: boolean;
}

export type UpdateRegulationRequest = CreateRegulationRequest;

export interface AddConsentPurposeRequest {
  key: string;
  name: string;
  description?: string;
  legalBasis: string;
  isRequired: boolean;
  sortOrder: number;
}

export type UpdateConsentPurposeRequest = AddConsentPurposeRequest;
