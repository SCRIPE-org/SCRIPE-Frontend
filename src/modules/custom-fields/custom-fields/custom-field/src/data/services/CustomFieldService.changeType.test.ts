import { describe, it, expect, vi } from "vitest";
import { CustomFieldService } from "./CustomFieldService";
import type { IApiService } from "@core/interfaces/api.interface";
import type {
  ChangeFieldTypeResult,
  RollbackFieldTypeChangeResult,
} from "../../domain/entities/FieldInsight";

describe("CustomFieldService type change & rollback API calls", () => {
  it("changeFieldType posts to /v1/custom-fields/{id}/change-type with request payload", async () => {
    const mockResult: ChangeFieldTypeResult = {
      applied: true,
      jobRunId: "job-123",
      kind: "Lossless",
      totalScanned: 50,
      converted: 50,
      totalRefusals: 0,
      refusals: [],
    };

    const api: IApiService = {
      get: vi.fn(),
      post: vi.fn().mockResolvedValue(mockResult),
      put: vi.fn(),
      delete: vi.fn(),
    } as unknown as IApiService;

    const service = new CustomFieldService(api);
    const result = await service.changeFieldType("field-123", {
      targetType: "LongText",
      confirmDataLoss: false,
    });

    expect(api.post).toHaveBeenCalledWith("/v1/custom-fields/field-123/change-type", {
      targetType: "LongText",
      confirmDataLoss: false,
    });
    expect(result).toEqual(mockResult);
  });

  it("rollbackFieldTypeChange posts to /v1/custom-fields/change-type/{jobRunId}/rollback", async () => {
    const mockRollbackResult: RollbackFieldTypeChangeResult = {
      applied: true,
      restoredRows: 50,
      message: "Successfully rolled back type change",
    };

    const api: IApiService = {
      get: vi.fn(),
      post: vi.fn().mockResolvedValue(mockRollbackResult),
      put: vi.fn(),
      delete: vi.fn(),
    } as unknown as IApiService;

    const service = new CustomFieldService(api);
    const result = await service.rollbackFieldTypeChange("job-123");

    expect(api.post).toHaveBeenCalledWith(
      "/v1/custom-fields/change-type/job-123/rollback",
      {}
    );
    expect(result).toEqual(mockRollbackResult);
  });
});
