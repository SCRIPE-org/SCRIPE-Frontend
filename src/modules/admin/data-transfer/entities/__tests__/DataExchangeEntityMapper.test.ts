import { describe, expect, it } from "vitest";
import { DataExchangeEntityMapper } from "../src/data/mappers/DataExchangeEntityMapper";
import type { DataExchangeEntityModel } from "../src/data/models/DataExchangeEntityModel";

describe("DataExchangeEntityMapper", () => {
  const sampleModel: DataExchangeEntityModel = {
    entityKey: "CrmLead",
    owningModule: "CRM",
    displayNameEn: "CRM Leads",
    displayNameAr: "عملاء محتملون",
    descriptionEn: "Prospective sales leads",
    descriptionAr: "العملاء المحتملون للمبيعات",
    supportsBulkAutoCreateLookup: true,
    supportsIdentityOnboardingModes: false,
    supportedModes: ["Insert", "Upsert"],
    parentEntityKeys: ["Organization"],
    remainingQuotaSlots: 500,
    quotaMaxLimit: 1000,
    isImportFeatureEnabled: true,
    isExportFeatureEnabled: true,
    canImport: true,
    canExport: true,
  };

  it("maps API model to domain entity with full fidelity", () => {
    const entity = DataExchangeEntityMapper.toDomain(sampleModel);

    expect(entity.id).toBe("CrmLead");
    expect(entity.entityKey).toBe("CrmLead");
    expect(entity.owningModule).toBe("CRM");
    expect(entity.displayNameEn).toBe("CRM Leads");
    expect(entity.displayNameAr).toBe("عملاء محتملون");
    expect(entity.supportsBulkAutoCreateLookup).toBe(true);
    expect(entity.supportedModes).toEqual(["Insert", "Upsert"]);
    expect(entity.parentEntityKeys).toEqual(["Organization"]);
    expect(entity.remainingQuotaSlots).toBe(500);
    expect(entity.quotaMaxLimit).toBe(1000);
    expect(entity.canImport).toBe(true);
    expect(entity.canExport).toBe(true);
  });

  it("maps domain entity back to API model", () => {
    const entity = DataExchangeEntityMapper.toDomain(sampleModel);
    const model = DataExchangeEntityMapper.toModel(entity);

    expect(model).toEqual(sampleModel);
  });

  it("supports copyWith immutability on domain entity", () => {
    const entity = DataExchangeEntityMapper.toDomain(sampleModel);
    const updated = entity.copyWith({ remainingQuotaSlots: 450 });

    expect(updated.remainingQuotaSlots).toBe(450);
    expect(updated.entityKey).toBe(entity.entityKey);
    expect(entity.remainingQuotaSlots).toBe(500);
  });
});
