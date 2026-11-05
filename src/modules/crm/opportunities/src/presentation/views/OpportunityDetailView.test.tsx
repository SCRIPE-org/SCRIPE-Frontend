import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { OpportunityDetailView } from "./OpportunityDetailView";
import { setCrmContainer } from "@modules/crm/di";
import type { CrmContainer } from "@modules/crm/di";
import {
  type OpportunityDetailResult,
  OpportunityStageTransitionKind,
} from "../../domain/models/crm-opportunity.types";

vi.mock("@core/providers/i18n-provider", () => ({
  useI18n: () => ({
    t: (key: string, params?: Record<string, string | number>) => {
      if (params?.defaultValue) return String(params.defaultValue);
      return key;
    },
    language: "en",
  }),
}));

vi.mock("@core/hooks/use-permission", () => ({
  usePermission: () => true,
}));

vi.mock("@core/providers/permission-provider", () => ({
  usePermissions: () => ({
    permissions: [],
    hasPermission: () => true,
    hasAnyPermission: () => true,
    hasAllPermissions: () => true,
    canAccessPage: () => true,
    roleNames: [],
    isSuperAdmin: true,
  }),
  PermissionGate: ({ children }: { children: unknown }) => children,
}));

globalThis.ResizeObserver ??= class {
  observe() {}
  unobserve() {}
  disconnect() {}
} as unknown as typeof ResizeObserver;

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => "/crm/opportunities/opp-123",
}));

describe("OpportunityDetailView Component", () => {
  const mockDetailData: OpportunityDetailResult = {
    opportunity: {
      id: "opp-123",
      title: "Saudi Pro League Broadcast Rights Extension",
      leadId: null,
      accountId: null,
      partyId: "party-corp-999",
      pipelineId: "pipe-001",
      stageId: "stage-003",
      stageKey: "default.solution_fit",
      stageLabelEnSnapshot: "Solution Fit",
      pipelineVersionSnapshot: 1,
      lastActiveStageKey: null,
      ownerUserId: "user-admin",
      ownerTeamId: null,
      dealKind: "Renewal",
      hqOutcomeKind: null,
      targetExistingTenantId: null,
      estimatedAmount: 1200000,
      currencyCode: "SAR",
      targetCloseDate: "2027-01-01T00:00:00Z",
      status: "Open",
      statusName: "Open",
      directCreateSource: "ManualDirect",
      directCreateRationale: "Executive broadcast rights renewal",
      createdAt: "2026-10-01T12:00:00Z",
      rowVersion: "CCCC==",
      maskedFieldKeys: [],
    },
    stageHistory: [
      {
        id: "hist-001",
        opportunityId: "opp-123",
        pipelineId: "pipe-001",
        pipelineVersion: 1,
        fromStageKey: null,
        toStageKey: "default.discovery",
        fromStageLabelEnSnapshot: null,
        toStageLabelEnSnapshot: "Discovery",
        fromStatus: null,
        toStatus: "Open",
        transitionKind: OpportunityStageTransitionKind.Created,
        usedStageOverride: false,
        reason: "Initial direct opportunity intake",
        actorUserId: "user-admin",
        occurredAtUtc: "2026-10-01T12:00:00Z",
      },
      {
        id: "hist-002",
        opportunityId: "opp-123",
        pipelineId: "pipe-001",
        pipelineVersion: 1,
        fromStageKey: "default.discovery",
        toStageKey: "default.solution_fit",
        fromStageLabelEnSnapshot: "Discovery",
        toStageLabelEnSnapshot: "Solution Fit",
        fromStatus: "Open",
        toStatus: "Open",
        transitionKind: OpportunityStageTransitionKind.OverrideSkipForward,
        usedStageOverride: true,
        reason: "Pre-approved solution architecture via previous contract renewal",
        actorUserId: "user-admin",
        occurredAtUtc: "2026-10-15T09:30:00Z",
      },
    ],
  };

  let mockRepo: any;

  beforeEach(() => {
    vi.clearAllMocks();

    mockRepo = {
      getOpportunities: vi.fn(),
      getOpportunityById: vi.fn().mockResolvedValue(mockDetailData),
      createOpportunity: vi.fn(),
      updateOpportunity: vi.fn(),
      assignOwner: vi.fn(),
      moveStage: vi.fn(),
      closeOpportunity: vi.fn(),
      reopenOpportunity: vi.fn(),
    };

    const container: CrmContainer = {
      overviewService: {} as any,
      overviewRepository: {} as any,
      leadService: {} as any,
      leadRepository: {} as any,
      opportunityService: {} as any,
      opportunityRepository: mockRepo,
      accountService: {} as any,
      accountRepository: {} as any,
      contactService: {} as any,
      contactRepository: {} as any,
    };

    setCrmContainer(container);
  });

  it("renders opportunity header, detail metrics, and stage audit history", async () => {
    render(<OpportunityDetailView opportunityId="opp-123" />);

    await waitFor(() => {
      expect(screen.getByText("Saudi Pro League Broadcast Rights Extension")).toBeDefined();
      expect(screen.getByText("SAR 1,200,000")).toBeDefined();
      expect(screen.getByText("Renewal")).toBeDefined();
      expect(screen.getByText("Verified Account / Contact Linked")).toBeDefined();
    });

    // Check stage history table rendering
    await waitFor(() => {
      expect(screen.getByText("Pre-approved solution architecture via previous contract renewal")).toBeDefined();
      expect(screen.getByText("Stage Override")).toBeDefined();
    });

    expect(mockRepo.getOpportunityById).toHaveBeenCalledWith("opp-123");
  });
});
