import { describe, it, expect, vi } from "vitest";
import { CustomFieldService } from "./CustomFieldService";
import type { IApiService } from "@core/interfaces/api.interface";
import type { FieldVisibilityRuleAdmin } from "../../domain/entities/FieldInsight";

describe("CustomFieldService visibility rules API calls", () => {
  it("getVisibilityRules queries the flat visibility rules endpoint with customFieldId", async () => {
    const mockRules: FieldVisibilityRuleAdmin[] = [
      {
        id: "rule-1",
        expressionJson:
          '{"version":1,"visibleWhen":{"fieldKey":"status","operator":"equals","value":"active"}}',
        operandFieldKey: "status",
        operator: "equals",
        priority: 0,
        isUnreadable: false,
      },
    ];

    const api: IApiService = {
      get: vi.fn().mockResolvedValue(mockRules),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
    } as unknown as IApiService;

    const service = new CustomFieldService(api);
    const result = await service.getVisibilityRules("field-123");

    expect(api.get).toHaveBeenCalledWith(
      "/v1/custom-fields/visibility-rules?customFieldId=field-123"
    );
    expect(result).toEqual(mockRules);
  });

  it("createVisibilityRule posts to the flat visibility rules endpoint", async () => {
    const api: IApiService = {
      get: vi.fn(),
      post: vi.fn().mockResolvedValue({ id: "rule-created-1" }),
      put: vi.fn(),
      delete: vi.fn(),
    } as unknown as IApiService;

    const service = new CustomFieldService(api);
    const payload = {
      customFieldId: "field-123",
      expressionJson:
        '{"version":1,"visibleWhen":{"fieldKey":"status","operator":"equals","value":"active"}}',
      priority: 1,
    };

    const result = await service.createVisibilityRule(payload);

    expect(api.post).toHaveBeenCalledWith("/v1/custom-fields/visibility-rules", payload);
    expect(result).toEqual({ id: "rule-created-1" });
  });

  it("updateVisibilityRule puts to the rule id endpoint", async () => {
    const api: IApiService = {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn().mockResolvedValue(undefined),
      delete: vi.fn(),
    } as unknown as IApiService;

    const service = new CustomFieldService(api);
    const payload = {
      expressionJson:
        '{"version":1,"visibleWhen":{"fieldKey":"status","operator":"equals","value":"terminated"}}',
      priority: 2,
    };

    await service.updateVisibilityRule("rule-1", payload);

    expect(api.put).toHaveBeenCalledWith("/v1/custom-fields/visibility-rules/rule-1", payload);
  });

  it("deleteVisibilityRule deletes the rule by id", async () => {
    const api: IApiService = {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn().mockResolvedValue(undefined),
    } as unknown as IApiService;

    const service = new CustomFieldService(api);
    await service.deleteVisibilityRule("rule-1");

    expect(api.delete).toHaveBeenCalledWith("/v1/custom-fields/visibility-rules/rule-1");
  });
});
