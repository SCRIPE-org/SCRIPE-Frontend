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
      examined: 50,
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
    // Mirrors the backend record verbatim (SnapshotsFound/Restored/ValuesGone/Unreadable/
    // TypeReverted). The previous fixture named seven properties of which only `restored` was
    // real, which is exactly why the drift went unnoticed: the service reads this shape through an
    // unchecked generic, so a fictional fixture round-trips happily through a passing test.
    const mockRollbackResult: RollbackFieldTypeChangeResult = {
      snapshotsFound: 50,
      restored: 50,
      valuesGone: 0,
      unreadable: 0,
      typeReverted: true,
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
