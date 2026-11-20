import { describe, expect, it } from "vitest";
import { DataExchangePresetMapper } from "../src/data/mappers/DataExchangePresetMapper";
import type { DataExchangePresetModel } from "../src/data/models/DataExchangePresetModel";

describe("DataExchangePresetMapper", () => {
  const samplePresetModel: DataExchangePresetModel = {
    id: "preset-123",
    entityKey: "CrmLead",
    name: "HubSpot Leads Export Template",
    importMode: "Insert",
    mappings: [
      {
        sourceColumnHeader: "First Name",
        targetFieldKey: "firstName",
      },
      {
        sourceColumnHeader: "Email Address",
        targetFieldKey: "email",
      },
    ],
    isDefault: true,
    createdAt: "2026-11-14T00:00:00Z",
  };

  it("maps API model to domain entity with full fidelity", () => {
    const preset = DataExchangePresetMapper.toDomain(samplePresetModel);

    expect(preset.id).toBe("preset-123");
    expect(preset.entityKey).toBe("CrmLead");
    expect(preset.name).toBe("HubSpot Leads Export Template");
    expect(preset.importMode).toBe("Insert");
    expect(preset.isDefault).toBe(true);
    expect(preset.mappingCount).toBe(2);
    expect(preset.mappings[0].sourceColumnHeader).toBe("First Name");
  });

  it("maps domain entity back to API model", () => {
    const preset = DataExchangePresetMapper.toDomain(samplePresetModel);
    const model = DataExchangePresetMapper.toModel(preset);

    expect(model).toEqual(samplePresetModel);
  });

  it("supports immutable copyWith", () => {
    const preset = DataExchangePresetMapper.toDomain(samplePresetModel);
    const updated = preset.copyWith({ name: "Renamed Preset", isDefault: false });

    expect(updated.name).toBe("Renamed Preset");
    expect(updated.isDefault).toBe(false);
    expect(preset.name).toBe("HubSpot Leads Export Template");
  });
});
