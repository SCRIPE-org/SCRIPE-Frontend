import { describe, expect, it, vi } from "vitest";
import { EntitiesRepository } from "../src/data/repositories/EntitiesRepository";
import type { IEntitiesService } from "../src/domain/interfaces/IEntitiesService";
import type { DataExchangeEntityModel } from "../src/data/models/DataExchangeEntityModel";

describe("EntitiesRepository", () => {
  const sampleModel: DataExchangeEntityModel = {
    entityKey: "CrmDeal",
    owningModule: "CRM",
    displayNameEn: "CRM Deals",
    displayNameAr: "صفقات",
    descriptionEn: "Sales deals",
    descriptionAr: "صفقات المبيعات",
    supportsBulkAutoCreateLookup: false,
    supportsIdentityOnboardingModes: false,
    supportedModes: ["Insert"],
    parentEntityKeys: [],
    remainingQuotaSlots: 200,
    quotaMaxLimit: 500,
    isImportFeatureEnabled: true,
    isExportFeatureEnabled: true,
    canImport: true,
    canExport: true,
  };

  const mockService: IEntitiesService = {
    fetchEntities: vi.fn().mockResolvedValue([sampleModel]),
    fetchDescriptor: vi.fn().mockResolvedValue({
      descriptor: {
        entityKey: "CrmDeal",
        columns: [],
      },
      isQuotaEnforced: false,
      isImportFeatureEnabled: true,
      isExportFeatureEnabled: true,
      canImport: true,
      canExport: true,
      restrictedFieldKeys: [],
    }),
    fetchTemplateBlob: vi.fn().mockResolvedValue(new Blob(["test"])),
  };

  it("fetches entities and maps them to domain entities", async () => {
    const repo = new EntitiesRepository(mockService);
    const result = await repo.getAll();

    expect(mockService.fetchEntities).toHaveBeenCalled();
    expect(result).toHaveLength(1);
    expect(result[0].entityKey).toBe("CrmDeal");
    expect(result[0].displayNameEn).toBe("CRM Deals");
  });

  it("fetches descriptor metadata by entity key", async () => {
    const repo = new EntitiesRepository(mockService);
    const descriptor = await repo.getDescriptor("CrmDeal");

    expect(mockService.fetchDescriptor).toHaveBeenCalledWith("CrmDeal", undefined);
    expect(descriptor.descriptor.entityKey).toBe("CrmDeal");
  });

  it("fetches template blob with parameters", async () => {
    const repo = new EntitiesRepository(mockService);
    const blob = await repo.downloadTemplate({
      entityKey: "CrmDeal",
      format: "csv",
    });

    expect(mockService.fetchTemplateBlob).toHaveBeenCalledWith(
      {
        entityKey: "CrmDeal",
        format: "csv",
      },
      undefined
    );
    expect(blob).toBeInstanceOf(Blob);
  });
});
