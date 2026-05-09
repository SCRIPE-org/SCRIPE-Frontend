import type {
  RegulationProfileModel,
  ConsentPurposeModel,
} from "../../data/models/RegulationModels";

export class Regulation {
  constructor(private readonly data: RegulationProfileModel) {}

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
  get purposes(): ConsentPurposeModel[] {
    return this.data.purposes ?? [];
  }

  copyWith(updates: Partial<RegulationProfileModel>): Regulation {
    return new Regulation({ ...this.data, ...updates });
  }
}
