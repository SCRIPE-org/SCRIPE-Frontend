import { describe, it, expect, vi } from "vitest";
import { CustomFieldValueService } from "./CustomFieldValueService";
import type { IApiService } from "@core/interfaces/api.interface";
import type {
  BulkEntityCustomFieldValuesData,
  EntityCustomFieldValueData,
} from "../models/CustomFieldValueModel";

function mockApiService(response: EntityCustomFieldValueData[]): IApiService {
  return {
    get: vi.fn().mockResolvedValue(response),
    put: vi.fn().mockResolvedValue(undefined),
  } as unknown as IApiService;
}

function mockApiServiceForPost(response: BulkEntityCustomFieldValuesData): IApiService {
  return {
    post: vi.fn().mockResolvedValue(response),
  } as unknown as IApiService;
}

describe("CustomFieldValueService", () => {
  it("getDefinitions calls the entity-type-only route", async () => {
    const api = mockApiService([]);
    const service = new CustomFieldValueService(api);

    await service.getDefinitions("party.person");

    expect(api.get).toHaveBeenCalledWith("/v1/custom-fields/values/party.person");
  });

  it("getValues calls the owner-scoped route and returns the merged list", async () => {
    const wireResponse: EntityCustomFieldValueData[] = [
      {
        customFieldId: "encrypted-id",
        key: "shirt_size",
        labelEn: "Shirt Size",
        valueType: "Text",
        isRequired: false,
        sortOrder: 0,
        value: "M",
      },
    ];
    const api = mockApiService(wireResponse);
    const service = new CustomFieldValueService(api);

    const result = await service.getValues("party.person", "encrypted-owner-id");

    expect(api.get).toHaveBeenCalledWith(
      "/v1/custom-fields/values/party.person/encrypted-owner-id"
    );
    expect(result[0].value).toBe("M");
  });

  it("saveValues PUTs to the owner-scoped route with a values envelope", async () => {
    const api = mockApiService([]);
    const service = new CustomFieldValueService(api);

    await service.saveValues("party.person", "encrypted-owner-id", { shirt_size: "L" });

    expect(api.put).toHaveBeenCalledWith(
      "/v1/custom-fields/values/party.person/encrypted-owner-id",
      { values: { shirt_size: "L" } }
    );
  });

  it("getBulkValues POSTs to the bulk route with an ownerIds envelope and returns columns plus per-owner values", async () => {
    const wireResponse: BulkEntityCustomFieldValuesData = {
      columns: [
        {
          customFieldId: "encrypted-field-id",
          key: "shirt_size",
          labelEn: "Shirt Size",
          labelAr: null,
          valueType: "Text",
          options: null,
          sortOrder: 0,
        },
      ],
      valuesByOwnerId: {
        "encrypted-owner-id": { shirt_size: "M" },
      },
    };
    const api = mockApiServiceForPost(wireResponse);
    const service = new CustomFieldValueService(api);

    const result = await service.getBulkValues("party.person", ["encrypted-owner-id"]);

    expect(api.post).toHaveBeenCalledWith("/v1/custom-fields/values/party.person/bulk", {
      ownerIds: ["encrypted-owner-id"],
    });
    expect(result).toBe(wireResponse);
  });
});
