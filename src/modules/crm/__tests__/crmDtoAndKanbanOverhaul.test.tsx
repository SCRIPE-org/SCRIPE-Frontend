import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import type { IApiService } from "@/core/interfaces/api.interface";
import { useCrmClientPrefsStore } from "@modules/crm";
import { CrmOpportunityService } from "../opportunities/src/data/services/CrmOpportunityService";
import { CrmLeadService } from "../leads/src/data/services/CrmLeadService";
import { CrmActivityService } from "../activities/src/data/services/CrmActivityService";
import { KanbanStageValueSummary } from "../opportunities/src/presentation/components/kanban/KanbanStageValueSummary";
import type { CrmOpportunity } from "../opportunities/src/domain/entities/OpportunityEntity";

function createMockApi() {
  return {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    patch: vi.fn(),
  };
}

describe("CRM Phase C DTO Alignment & Multi-Currency Kanban Overhaul", () => {
  afterEach(() => {
    useCrmClientPrefsStore.getState().resetClientPrefs();
  });

  it("normalizes backend CrmDealContactRoleDto fields and sends notes on addContactRole", async () => {
    const mockApi = createMockApi();
    const service = new CrmOpportunityService(mockApi as unknown as IApiService);

    mockApi.get.mockResolvedValueOnce({
      success: true,
      data: [
        {
          id: "role-1",
          opportunityId: "opp-1",
          contactPartyId: "party-contact-1",
          contactDisplayName: "Noura Al-Qahtani",
          email: "noura@club.sa",
          jobTitle: "Chief Commercial Officer",
          stakeholderRole: "DecisionMaker",
          isPrimary: true,
          notes: "Approves final sponsorship term sheet",
          createdAt: "2026-11-17T08:00:00Z",
        },
      ],
    });

    const roles = await service.getContactRoles("opp-1");
    expect(roles).toHaveLength(1);
    expect(roles[0]).toMatchObject({
      id: "role-1",
      contactPartyId: "party-contact-1",
      contactName: "Noura Al-Qahtani",
      contactEmail: "noura@club.sa",
      jobTitle: "Chief Commercial Officer",
      stakeholderRole: "DecisionMaker",
      isPrimary: true,
      influenceNotes: "Approves final sponsorship term sheet",
      createdAtUtc: "2026-11-17T08:00:00Z",
    });

    mockApi.post.mockResolvedValueOnce({
      success: true,
      data: {
        id: "role-2",
        opportunityId: "opp-1",
        contactPartyId: "party-contact-2",
        contactDisplayName: "Tariq Al-Harbi",
        email: "tariq@club.sa",
        stakeholderRole: "Champion",
        isPrimary: false,
        notes: "Technical lead",
        createdAt: "2026-11-17T09:00:00Z",
      },
    });

    const created = await service.addContactRole({
      opportunityId: "opp-1",
      contactPartyId: "party-contact-2",
      stakeholderRole: "Champion",
      isPrimary: false,
      influenceNotes: "Technical lead",
    });

    expect(mockApi.post).toHaveBeenCalledWith(
      "/v1/crm/opportunities/opp-1/contact-roles",
      expect.objectContaining({
        contactPartyId: "party-contact-2",
        stakeholderRole: "Champion",
        notes: "Technical lead",
      }),
      undefined,
      expect.any(Object),
    );
    expect(created.contactName).toBe("Tariq Al-Harbi");
    expect(created.contactEmail).toBe("tariq@club.sa");
    expect(created.influenceNotes).toBe("Technical lead");
  });

  it("maps reopenReason and nextStepSummary on stage moves and normalizes backend lead display names", async () => {
    const mockApi = createMockApi();
    const oppService = new CrmOpportunityService(mockApi as unknown as IApiService);
    const leadService = new CrmLeadService(mockApi as unknown as IApiService);

    mockApi.post.mockResolvedValueOnce({ success: true, data: { id: "opp-1", stageKey: "default.negotiation" } });
    await oppService.moveStage({
      opportunityId: "opp-1",
      targetStageKey: "default.negotiation",
      reopenReason: "Customer reopened pricing review",
    });
    expect(mockApi.post).toHaveBeenCalledWith(
      "/v1/crm/opportunities/opp-1/stage",
      expect.objectContaining({
        reason: "Customer reopened pricing review",
        reopenReason: "Customer reopened pricing review",
      }),
      undefined,
      expect.any(Object),
    );

    mockApi.post.mockResolvedValueOnce({
      success: true,
      data: {
        id: "lead-1",
        fullName: "Faisal Al-Dossari",
        status: "Qualified",
        accountDisplayName: "Al-Ettifaq FC",
        primaryContactName: "Faisal Al-Dossari",
        partyDisplayName: "Al-Ettifaq FC",
      },
    });
    const movedLead = await leadService.moveLeadStage({
      leadId: "lead-1",
      targetStageKey: "lead.qualified",
      reopenReason: "Confirmed budget availability",
      nextStepSummary: "Schedule executive demo",
    });
    expect(mockApi.post).toHaveBeenCalledWith(
      "/v1/crm/leads/lead-1/move-stage",
      expect.objectContaining({
        reason: "Confirmed budget availability",
        nextStepSummary: "Schedule executive demo",
      }),
      undefined,
      expect.any(Object),
    );
    expect(movedLead.organizationDisplayName).toBe("Al-Ettifaq FC");
    expect(movedLead.personDisplayName).toBe("Faisal Al-Dossari");
    expect(movedLead.stageKey).toBe("lead.qualified");
  });

  it("unwraps ApiSuccessResponse envelope before completing follow-up work items", async () => {
    const mockApi = createMockApi();
    const activityService = new CrmActivityService(mockApi as unknown as IApiService);

    mockApi.get.mockResolvedValueOnce({
      success: true,
      data: {
        title: "Send stadium signage proposal",
        description: "Include VIP hospitality tiers",
        priority: 2,
        dueAt: "2026-11-20T12:00:00Z",
        assignedToId: "user-42",
        isActive: true,
      },
    });
    mockApi.put.mockResolvedValueOnce({ success: true });

    await activityService.completeFollowUpWorkItem("wi-99");
    expect(mockApi.put).toHaveBeenCalledWith(
      "/v1/work-items/wi-99",
      expect.objectContaining({
        title: "Send stadium signage proposal",
        description: "Include VIP hospitality tiers",
        status: 3,
        priority: 2,
        assignedToId: "user-42",
      }),
    );
  });

  it("renders base currency 0 on empty Kanban stage and converts mixed currencies cleanly", () => {
    useCrmClientPrefsStore.setState({
      baseCurrency: "SAR",
      autoConvertToBase: true,
      customRateOverrides: { USD: 1, SAR: 3.75 },
    });

    const emptyDrop = vi.fn();
    const { rerender } = render(
      <KanbanStageValueSummary stageKey="default.discovery" items={[]} allItems={[]} onDropStage={emptyDrop} />,
    );
    expect(screen.getByTestId("kanban-stage-value-default.discovery").textContent).toBe("SAR 0");

    const items: CrmOpportunity[] = [
      { id: "opp-a", title: "USD Deal", pipelineId: "wf-deal-default", stageId: "stg-prop", stageKey: "default.proposal", stageLabelEnSnapshot: "Proposal", pipelineVersionSnapshot: 1, status: "Open", statusName: "Open", dealKind: "NewBusiness", estimatedAmount: 1000, currencyCode: "USD", maskedFieldKeys: [], rowVersion: "v1", createdAt: "2026-11-01T00:00:00Z" },
      { id: "opp-b", title: "SAR Deal", pipelineId: "wf-deal-default", stageId: "stg-prop", stageKey: "default.proposal", stageLabelEnSnapshot: "Proposal", pipelineVersionSnapshot: 1, status: "Open", statusName: "Open", dealKind: "NewBusiness", estimatedAmount: 500, currencyCode: "SAR", maskedFieldKeys: [], rowVersion: "v1", createdAt: "2026-11-01T00:00:00Z" },
    ];
    rerender(
      <KanbanStageValueSummary stageKey="default.proposal" items={items} allItems={items} onDropStage={emptyDrop} />,
    );
    expect(screen.getByTestId("kanban-stage-value-default.proposal").textContent).toBe("SAR 4,250");
  });
});
