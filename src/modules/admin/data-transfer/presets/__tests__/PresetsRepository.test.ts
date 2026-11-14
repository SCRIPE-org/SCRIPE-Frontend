import { describe, expect, it, vi } from "vitest";
import { PresetsRepository } from "../src/data/repositories/PresetsRepository";
import type { IPresetsService } from "../src/domain/interfaces/IPresetsService";
import type { DataExchangePresetModel } from "../src/data/models/DataExchangePresetModel";

describe("PresetsRepository", () => {
  const samplePresetModel: DataExchangePresetModel = {
    id: "preset-abc",
    entityKey: "CrmDeal",
    name: "Deals Standard Mapping",
    importMode: "Upsert",
    mappings: [],
    isDefault: false,
    createdAt: "2026-11-14T00:00:00Z",
  };

  const mockService: IPresetsService = {
    fetchPresets: vi.fn().mockResolvedValue([samplePresetModel]),
    persistPreset: vi.fn().mockResolvedValue(samplePresetModel),
    removePreset: vi.fn().mockResolvedValue(undefined),
  };

  it("fetches presets and maps to domain entities", async () => {
    const repo = new PresetsRepository(mockService);
    const result = await repo.getPresets("CrmDeal");

    expect(mockService.fetchPresets).toHaveBeenCalledWith("CrmDeal", undefined);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("preset-abc");
    expect(result[0].name).toBe("Deals Standard Mapping");
  });

  it("saves a preset and maps to domain entity", async () => {
    const repo = new PresetsRepository(mockService);
    const saved = await repo.savePreset({
      entityKey: "CrmDeal",
      name: "Deals Standard Mapping",
      importMode: "Upsert",
      mappings: [],
    });

    expect(mockService.persistPreset).toHaveBeenCalled();
    expect(saved.id).toBe("preset-abc");
  });

  it("deletes a preset by id", async () => {
    const repo = new PresetsRepository(mockService);
    await repo.deletePreset("preset-abc");

    expect(mockService.removePreset).toHaveBeenCalledWith("preset-abc", undefined);
  });
});
