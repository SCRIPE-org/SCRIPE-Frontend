import { describe, it, expect, vi, beforeEach } from "vitest";
import { CrmOpportunityService } from "./CrmOpportunityService";
import type { IApiService } from "@core/api/interfaces/IApiService";
import type { UpdateDefaultPipelineInput } from "../../domain/entities/OpportunityEntity";

describe("CrmOpportunityService - Default Pipeline Administration", () => {
  let mockApi: {
    get: ReturnType<typeof vi.fn>;
    post: ReturnType<typeof vi.fn>;
    put: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
    patch: ReturnType<typeof vi.fn>;
  };
  let service: CrmOpportunityService;

  beforeEach(() => {
    mockApi = {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
      patch: vi.fn(),
    };
    service = new CrmOpportunityService(mockApi as unknown as IApiService);
  });

  it("getDefaultPipeline queries default endpoint and normalizes backend wire DTO", async () => {
    const wireBackendResponse = {
      pipelineId: "pipe-backend-uuid",
      code: "default",
      nameEn: "Standard Commercial Pipeline",
      nameAr: "مسار المبيعات التجاري القياسي",
      version: 1,
      rowVersion: "ROWVER123==",
      stages: [
        {
          stageId: "stg-01",
          stageKey: "default.discovery",
          sortOrder: 1,
          labelEn: "Discovery",
          labelAr: "استكشاف",
          probabilityPercent: 10,
          requiredExitFields: [],
          requiresVerifiedParty: false,
          rowVersion: "STGROVER1==",
        },
        {
          stageId: "stg-04",
          stageKey: "default.proposal",
          sortOrder: 4,
          labelEn: "Proposal",
          labelAr: "عرض السعر",
          probabilityPercent: 60,
          requiredExitFields: ["partyId"],
          requiresVerifiedParty: true,
          rowVersion: "STGROVER4==",
        },
      ],
    };

    mockApi.get.mockResolvedValueOnce(wireBackendResponse);

    const result = await service.getDefaultPipeline();

    expect(mockApi.get).toHaveBeenCalledWith("/v1/crm/pipelines/default");
    expect(result.pipelineId).toBe("pipe-backend-uuid");
    expect(result.nameEn).toBe("Standard Commercial Pipeline");
    expect(result.name).toBe("Standard Commercial Pipeline");
    expect(result.rowVersion).toBe("ROWVER123==");
    expect(result.stages).toHaveLength(2);

    const discovery = result.stages[0];
    expect(discovery.stageKey).toBe("default.discovery");
    expect(discovery.probabilityPercent).toBe(10);
    expect(discovery.winProbabilityPercent).toBe(10);

    const proposal = result.stages[1];
    expect(proposal.stageKey).toBe("default.proposal");
    expect(proposal.requiresVerifiedParty).toBe(true);
    expect(proposal.probabilityPercent).toBe(60);
  });

  it("updateDefaultPipeline serializes nameEn, nameAr, probabilityPercent and expectedRowVersion", async () => {
    const input: UpdateDefaultPipelineInput = {
      nameEn: "Updated Pipeline Name",
      nameAr: "الاسم المحدث",
      expectedRowVersion: "ROWVER123==",
      stages: [
        {
          stageKey: "default.discovery",
          sortOrder: 1,
          labelEn: "Initial Contact",
          labelAr: "اتصال أولي",
          winProbabilityPercent: 15,
          requiredExitFields: [],
        },
        {
          stageKey: "default.proposal",
          sortOrder: 4,
          labelEn: "Formal Proposal",
          labelAr: "عرض رسمي",
          probabilityPercent: 75,
          requiredExitFields: ["partyId", "estimatedAmount"],
        },
      ],
    };

    const wireBackendResponse = {
      pipelineId: "pipe-backend-uuid",
      code: "default",
      nameEn: "Updated Pipeline Name",
      nameAr: "الاسم المحدث",
      version: 2,
      rowVersion: "ROWVER456==",
      stages: [
        {
          stageId: "stg-01",
          stageKey: "default.discovery",
          sortOrder: 1,
          labelEn: "Initial Contact",
          labelAr: "اتصال أولي",
          probabilityPercent: 15,
          requiredExitFields: [],
          requiresVerifiedParty: false,
          rowVersion: "STGROVER1A==",
        },
        {
          stageId: "stg-04",
          stageKey: "default.proposal",
          sortOrder: 4,
          labelEn: "Formal Proposal",
          labelAr: "عرض رسمي",
          probabilityPercent: 75,
          requiredExitFields: ["partyId", "estimatedAmount"],
          requiresVerifiedParty: true,
          rowVersion: "STGROVER4A==",
        },
      ],
    };

    mockApi.put.mockResolvedValueOnce(wireBackendResponse);

    const result = await service.updateDefaultPipeline(input);

    expect(mockApi.put).toHaveBeenCalledTimes(1);
    const [endpoint, payload, , options] = mockApi.put.mock.calls[0];

    expect(endpoint).toBe("/v1/crm/pipelines/default");
    expect(payload.nameEn).toBe("Updated Pipeline Name");
    expect(payload.nameAr).toBe("الاسم المحدث");
    expect(payload.expectedRowVersion).toBe("ROWVER123==");
    expect(payload.stages).toHaveLength(2);
    expect(payload.stages[0].probabilityPercent).toBe(15);
    expect(payload.stages[1].probabilityPercent).toBe(75);
    expect(options.headers["Idempotency-Key"]).toBeDefined();

    expect(result.nameEn).toBe("Updated Pipeline Name");
    expect(result.rowVersion).toBe("ROWVER456==");
    expect(result.version).toBe(2);
  });
});
