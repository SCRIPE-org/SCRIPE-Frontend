import { describe, it, expect, vi } from "vitest";
import { CustomFieldService } from "./CustomFieldService";
import type { IApiService } from "@core/interfaces/api.interface";
import type {
  FieldVersionsResponse,
  CreateFieldVersionDraftResult,
  PublishFieldVersionResult,
  DiscardFieldVersionDraftResult,
} from "../../domain/entities/FieldInsight";

describe("CustomFieldService versioning API calls", () => {
  it("getVersions calls GET /v1/custom-fields/versions/{id}", async () => {
    const mockVersions: FieldVersionsResponse = {
      fieldId: "field-123",
      hasDraft: true,
      publishedVersionNumber: 2,
      versions: [
        {
          versionId: "v-3",
          versionNumber: 3,
          status: "Draft",
          effectiveFrom: null,
          effectiveTo: null,
          optionsCount: 5,
          rulesCount: 2,
          createdAt: "2026-08-25T12:00:00Z",
        },
        {
          versionId: "v-2",
          versionNumber: 2,
          status: "Published",
          effectiveFrom: "2026-08-20T00:00:00Z",
          effectiveTo: null,
          optionsCount: 4,
          rulesCount: 2,
          createdAt: "2026-08-20T00:00:00Z",
        },
      ],
    };

    const api: IApiService = {
      get: vi.fn().mockResolvedValue(mockVersions),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
    } as unknown as IApiService;

    const service = new CustomFieldService(api);
    const result = await service.getVersions("field-123");

    expect(api.get).toHaveBeenCalledWith("/v1/custom-fields/versions/field-123");
    expect(result).toEqual(mockVersions);
  });

  it("createFieldVersionDraft posts to /v1/custom-fields/versions/{customFieldId}/draft", async () => {
    const mockDraftResult: CreateFieldVersionDraftResult = {
      draftVersionId: "v-draft-3",
      versionNumber: 3,
      optionsCopied: 5,
      rulesCopied: 2,
      tenantsWithRules: 1,
    };

    const api: IApiService = {
      get: vi.fn(),
      post: vi.fn().mockResolvedValue(mockDraftResult),
      put: vi.fn(),
      delete: vi.fn(),
    } as unknown as IApiService;

    const service = new CustomFieldService(api);
    const result = await service.createFieldVersionDraft("field-123");

    expect(api.post).toHaveBeenCalledWith("/v1/custom-fields/versions/field-123/draft", {});
    expect(result).toEqual(mockDraftResult);
  });

  it("publishFieldVersion posts to /v1/custom-fields/versions/{customFieldId}/publish", async () => {
    const mockPublishResult: PublishFieldVersionResult = {
      publishedVersionId: "v-draft-3",
      versionNumber: 3,
      deprecatedVersionId: "v-live-2",
      rulesOnPublishedVersion: 2,
    };

    const api: IApiService = {
      get: vi.fn(),
      post: vi.fn().mockResolvedValue(mockPublishResult),
      put: vi.fn(),
      delete: vi.fn(),
    } as unknown as IApiService;

    const service = new CustomFieldService(api);
    const result = await service.publishFieldVersion("field-123");

    expect(api.post).toHaveBeenCalledWith("/v1/custom-fields/versions/field-123/publish", {});
    expect(result).toEqual(mockPublishResult);
  });

  it("discardFieldVersionDraft posts to /v1/custom-fields/versions/{customFieldId}/discard-draft", async () => {
    const mockDiscardResult: DiscardFieldVersionDraftResult = {
      discardedVersionId: "v-draft-3",
      versionNumber: 3,
      optionsRetained: 5,
      rulesRetained: 2,
    };

    const api: IApiService = {
      get: vi.fn(),
      post: vi.fn().mockResolvedValue(mockDiscardResult),
      put: vi.fn(),
      delete: vi.fn(),
    } as unknown as IApiService;

    const service = new CustomFieldService(api);
    const result = await service.discardFieldVersionDraft("field-123");

    expect(api.post).toHaveBeenCalledWith(
      "/v1/custom-fields/versions/field-123/discard-draft",
      {}
    );
    expect(result).toEqual(mockDiscardResult);
  });
});
