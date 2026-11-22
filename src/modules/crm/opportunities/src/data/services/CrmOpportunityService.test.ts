import { describe, it, expect, vi, beforeEach } from "vitest";
import { CrmOpportunityService } from "./CrmOpportunityService";
import { CrmOpportunityMapper } from "../mappers/CrmOpportunityMapper";
import type { IApiService } from "@core/interfaces/api.interface";

describe("CrmOpportunityService - Lifecycle & Mapper", () => {
  let mockApi: {
    get: ReturnType<typeof vi.fn>;
    post: ReturnType<typeof vi.fn>;
    put: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
    patch: ReturnType<typeof vi.fn>;
  };
  let service: CrmOpportunityService;

  beforeEach(() => {
    mockApi = { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn(), patch: vi.fn() };
    service = new CrmOpportunityService(mockApi as unknown as IApiService);
  });

  it("getOpportunities queries /v1/crm/opportunities with sanitized filters", async () => {
    mockApi.get.mockResolvedValueOnce({
      success: true,
      data: { items: [], totalCount: 0, page: 1, pageSize: 20 },
    });

    const result = await service.getOpportunities({ page: 2, pageSize: 50, search: "  Sponsorship  ", stageKey: "default.proposal" });
    expect(mockApi.get).toHaveBeenCalledWith(
      "/v1/crm/opportunities",
      expect.objectContaining({ page: 2, pageSize: 50, search: "Sponsorship", stageKey: "default.proposal" })
    );
    expect(result.items).toEqual([]);
  });

  it("moveStage posts transition payload with idempotency headers and maps entity via CrmOpportunityMapper", async () => {
    mockApi.post.mockResolvedValueOnce({
      success: true,
      data: {
        id: "opp-101",
        title: "Stadium Naming Rights",
        pipelineId: "wf-deal-default",
        stageId: "stg-4",
        stageKey: "default.proposal",
        stageLabelEnSnapshot: "Proposal",
        pipelineVersionSnapshot: 2,
        estimatedAmount: "250000",
        currencyCode: "SAR",
        status: "Open",
        statusName: "Open",
        createdAt: "2026-11-01T00:00:00Z",
        rowVersion: "rv-9",
      },
    });

    const dto = await service.moveStage({
      opportunityId: "opp-101",
      targetStageKey: "default.proposal",
      transitionId: "tr-prop",
      expectedRowVersion: "rv-8",
      partyId: "party-1",
      estimatedAmount: 250000,
    });

    expect(mockApi.post).toHaveBeenCalledWith(
      "/v1/crm/opportunities/opp-101/stage",
      expect.objectContaining({ targetStageKey: "default.proposal", transitionId: "tr-prop", expectedRowVersion: "rv-8" }),
      undefined,
      expect.objectContaining({ headers: expect.objectContaining({ "Idempotency-Key": expect.any(String) }) })
    );

    const entity = CrmOpportunityMapper.toEntity(dto as never);
    expect(entity.estimatedAmount).toBe(250000);
    expect(entity.stageKey).toBe("default.proposal");
  });
});
