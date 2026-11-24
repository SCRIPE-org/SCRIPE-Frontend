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

  it("updateOpportunity omits currencyCode and dealKind when not supplied so restricted fields are never sent", async () => {
    mockApi.put.mockResolvedValueOnce({ success: true, data: { id: "opp-7" } });

    await service.updateOpportunity({
      opportunityId: "opp-7",
      title: "Renewal",
      estimatedAmount: 1000,
      expectedRowVersion: "rv-1",
      idempotencyKey: "idem-update-1",
    });

    const payload = mockApi.put.mock.calls[0][1] as Record<string, unknown>;
    expect(payload).not.toHaveProperty("currencyCode");
    expect(payload).not.toHaveProperty("dealKind");
    expect(payload).toMatchObject({ title: "Renewal", estimatedAmount: 1000, expectedRowVersion: "rv-1" });
  });

  it("updateOpportunity forwards explicit currencyCode and dealKind unchanged", async () => {
    mockApi.put.mockResolvedValueOnce({ success: true, data: { id: "opp-7" } });

    await service.updateOpportunity({
      opportunityId: "opp-7",
      title: "Renewal",
      estimatedAmount: 1000,
      currencyCode: "USD",
      dealKind: "Renewal",
      expectedRowVersion: "rv-1",
      idempotencyKey: "idem-update-2",
    });

    expect(mockApi.put.mock.calls[0][1]).toMatchObject({ currencyCode: "USD", dealKind: "Renewal" });
  });

  it("closeOpportunity omits dealKind when not supplied so existing dealKind is preserved and FLS is not tripped", async () => {
    mockApi.post.mockResolvedValueOnce({ success: true, data: { id: "opp-7" } });

    await service.closeOpportunity({
      opportunityId: "opp-7",
      outcome: "Won",
      expectedRowVersion: "rv-1",
      idempotencyKey: "idem-close-1",
    });

    const payload = mockApi.post.mock.calls[0][1] as Record<string, unknown>;
    expect(payload).not.toHaveProperty("dealKind");
    expect(payload).toMatchObject({ outcome: "Won", expectedRowVersion: "rv-1" });
  });

  it("closeOpportunity forwards explicit dealKind unchanged", async () => {
    mockApi.post.mockResolvedValueOnce({ success: true, data: { id: "opp-7" } });

    await service.closeOpportunity({
      opportunityId: "opp-7",
      outcome: "Won",
      dealKind: "Expansion",
      expectedRowVersion: "rv-1",
      idempotencyKey: "idem-close-2",
    });

    expect(mockApi.post.mock.calls[0][1]).toMatchObject({
      outcome: "Won",
      dealKind: "Expansion",
      expectedRowVersion: "rv-1",
    });
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
