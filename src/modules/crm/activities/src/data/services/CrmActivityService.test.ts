import { describe, it, expect, vi, beforeEach } from "vitest";
import { CrmActivityService } from "./CrmActivityService";
import type { IApiService } from "@/core/interfaces/api.interface";
import type {
  CreateSalesActivityPayload,
  CreateActivityFollowUpPayload,
} from "../../domain/entities/CrmActivityEntity";

describe("CrmActivityService (SCRIPE-739)", () => {
  let mockApi: {
    get: ReturnType<typeof vi.fn>;
    post: ReturnType<typeof vi.fn>;
    put: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
    patch: ReturnType<typeof vi.fn>;
  };
  let service: CrmActivityService;

  beforeEach(() => {
    mockApi = {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
      patch: vi.fn(),
    };
    service = new CrmActivityService(mockApi as unknown as IApiService);
  });

  it("getActivities passes query filters and unwraps response", async () => {
    const mockPaged = {
      items: [
        {
          activityId: "act-1",
          activityKind: "Note",
          summary: "Initial meeting summary",
          actorDisplaySnapshot: "CRM Manager",
          occurredAtUtc: "2026-11-02T10:00:00Z",
          maskedFieldKeys: [],
        },
      ],
      page: 1,
      pageSize: 20,
      totalCount: 1,
      totalPages: 1,
      hasPreviousPage: false,
      hasNextPage: false,
    };

    mockApi.get.mockResolvedValueOnce({ success: true, data: mockPaged });

    const result = await service.getActivities({
      accountId: "acc-123",
      activityKind: "Note",
      page: 1,
      pageSize: 20,
    });

    expect(mockApi.get).toHaveBeenCalledWith("/v1/crm/activities", {
      page: 1,
      pageSize: 20,
      accountId: "acc-123",
      activityKind: "Note",
    });
    expect(result.items).toHaveLength(1);
    expect(result.items[0].summary).toBe("Initial meeting summary");
  });

  it("createActivity posts payload and unwraps result", async () => {
    const payload: CreateSalesActivityPayload = {
      activityKind: "CallLog",
      summary: "Customer Discovery Call",
      bodyText: "Discussed enterprise multi-sport requirements.",
      accountId: "acc-123",
    };

    const mockResponse = {
      activityId: "act-new-123",
      activityKind: "CallLog",
      summary: "Customer Discovery Call",
      bodyText: "Discussed enterprise multi-sport requirements.",
      actorDisplaySnapshot: "CRM Manager",
      occurredAtUtc: "2026-11-02T12:00:00Z",
      maskedFieldKeys: [],
    };

    mockApi.post.mockResolvedValueOnce({ success: true, data: mockResponse });

    const result = await service.createActivity(payload);

    expect(mockApi.post).toHaveBeenCalledWith("/v1/crm/activities", payload);
    expect(result.activityId).toBe("act-new-123");
    expect(result.activityKind).toBe("CallLog");
  });

  it("createFollowUp posts to follow-up endpoint with task dispatch payload", async () => {
    const payload: CreateActivityFollowUpPayload = {
      title: "Send revised proposal draft",
      description: "Follow up with client after discussion",
      assigneeUserId: "user-456",
      dueAtUtc: "2026-11-05T00:00:00Z",
    };

    const mockResponse = {
      workItemRefId: "workitem-uuid-789",
      workItemStatus: "Open",
      followUpActivity: {
        activityId: "act-followup-999",
        activityKind: "FollowUpLinked",
        summary: "Follow-up task created: Send revised proposal draft",
        workItemRefId: "workitem-uuid-789",
        workItemStatus: "Open",
        actorDisplaySnapshot: "CRM Manager",
        occurredAtUtc: "2026-11-02T12:30:00Z",
        maskedFieldKeys: [],
      },
    };

    mockApi.post.mockResolvedValueOnce({ success: true, data: mockResponse });

    const result = await service.createFollowUp("act-1", payload);

    expect(mockApi.post).toHaveBeenCalledWith("/v1/crm/activities/act-1/follow-up", payload);
    expect(result.workItemRefId).toBe("workitem-uuid-789");
    expect(result.followUpActivity.activityKind).toBe("FollowUpLinked");
  });
});
