import { render, renderHook, act, screen, waitFor, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { OpportunityDetailView } from "./OpportunityDetailView";
import { useOpportunityDetailViewModel } from "../viewmodels/useOpportunityDetailViewModel";
import { setCrmContainer, type CrmContainer } from "@modules/crm/di";
import { queryClient } from "@core/query-client";
import { useCrmClientPrefsStore } from "@modules/crm";
import {
  type OpportunityDetailResult,
  OpportunityStageTransitionKind,
} from "../../domain/models/crm-opportunity.types";

import { en as crmOpportunitiesEn } from "../../../locales/crm-opportunities.en";

vi.mock("@core/providers/i18n-provider", () => ({
  useI18n: () => ({
    t: (key: string, params?: Record<string, string | number>) => {
      if (params?.defaultValue) return String(params.defaultValue);
      const parts = key.split(".");
      let cur: any = crmOpportunitiesEn;
      for (const p of parts) {
        cur = cur?.[p];
      }
      return typeof cur === "string" ? cur : key;
    },
    language: "en",
  }),
}));

const mockUsePermission = vi.fn((_perm?: string) => true);

vi.mock("@core/hooks/use-permission", () => ({
  usePermission: (perm: string) => mockUsePermission(perm),
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
  useSearchParams: () => new URLSearchParams(),
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
  let mockOverviewRepo: any;
  let mockActivityRepo: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockUsePermission.mockReturnValue(true);
    queryClient.clear();
    useCrmClientPrefsStore.getState().resetClientPrefs();

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

    mockOverviewRepo = {
      getOverview: vi.fn(),
    };
    const mockSettingsRepo = {
      getSettings: vi.fn().mockResolvedValue({}),
      getGovernanceCatalog: vi.fn().mockResolvedValue({}),
      lookupAssignees: vi.fn().mockResolvedValue([]),
      updateTenantSettings: vi.fn().mockResolvedValue({}),
      updateUserPreferences: vi.fn().mockResolvedValue({}),
    };

    // Required so ActivityTimeline (force-mounted in the activity tab) doesn't throw
    // when useCrmActivitiesViewModel checks container.activityRepository.
    mockActivityRepo = {
      getActivities: vi.fn().mockResolvedValue({ items: [], totalCount: 0, page: 1, pageSize: 20 }),
      createActivity: vi.fn().mockResolvedValue({}),
      createFollowUp: vi.fn().mockResolvedValue({}),
      completeFollowUpWorkItem: vi.fn().mockResolvedValue({}),
    };

    const container: CrmContainer = {
      overviewService: {} as any,
      overviewRepository: mockOverviewRepo,

      workflowService: {} as never,

      workflowRepository: {} as never,
      reportsService: {} as any,
      reportsRepository: {} as any,
      settingsService: {} as any,
      settingsRepository: mockSettingsRepo as any,
      leadService: {} as any,
      leadRepository: {} as any,
      opportunityService: {} as any,
      opportunityRepository: mockRepo,
      accountService: {} as any,
      accountRepository: {} as any,
      contactService: {} as any,
      contactRepository: {} as any,
      activityService: {} as any,
      activityRepository: mockActivityRepo,
      entityLookup: {} as any,
    };

    setCrmContainer(container);
  });

  it("renders shape-accurate OpportunityDetailSkeleton while opportunity detail is loading", () => {
    mockRepo.getOpportunityById.mockReturnValue(new Promise(() => {}));
    render(<OpportunityDetailView opportunityId="opp-123" />);
    expect(screen.getByTestId("deal-detail-skeleton")).toBeDefined();
  });

  it("renders opportunity header, detail metrics, unclipped Buying Committee contact placeholder, and stage audit history", async () => {
    render(<OpportunityDetailView opportunityId="opp-123" />);

    await waitFor(() => {
      expect(screen.getByText("Saudi Pro League Broadcast Rights Extension")).toBeDefined();
      expect(screen.getAllByText("SAR 1,200,000").length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText("Renewal")).toBeDefined();
      expect(screen.getByText("Verified Account / Contact Linked")).toBeDefined();
    });

    const partySelect = screen.getByTestId("committee-party-select");
    expect(partySelect.textContent).toContain("Select Contact / Stakeholder...");

    // Check stage history table rendering
    await waitFor(() => {
      expect(screen.getByText("Pre-approved solution architecture via previous contract renewal")).toBeDefined();
      expect(screen.getByText("Stage Override")).toBeDefined();
    });

    expect(mockRepo.getOpportunityById).toHaveBeenCalledWith("opp-123");
  });

  it("manages Opportunity-scoped commercial package quote items and handoff statuses without mutating tenant-wide settings", async () => {
    render(<OpportunityDetailView opportunityId="opp-123" />);

    await waitFor(() => {
      expect(screen.getByTestId("venue-block-booking-hold-btn")).toBeDefined();
    });

    fireEvent.click(screen.getByTestId("venue-block-booking-hold-btn"));
    fireEvent.click(screen.getByTestId("academy-b2b-sponsorship-btn"));

    fireEvent.change(screen.getByTestId("quote-item-name-input"), {
      target: { value: "VIP Hospitality Suite Add-On" },
    });
    fireEvent.change(screen.getByTestId("quote-item-discount-input"), {
      target: { value: "10" },
    });
    fireEvent.click(screen.getByTestId("quote-add-item-btn"));

    await waitFor(() => {
      expect(screen.getByText("VIP Hospitality Suite Add-On")).toBeDefined();
    });

    const cachedRaw = window.sessionStorage.getItem("scripe:crm:deal-package:platform:anon:opp-123");
    expect(cachedRaw).not.toBeNull();
    const parsedPkg = JSON.parse(cachedRaw!);
    expect(parsedPkg.venueHoldStatus).toBe("reserved");
    expect(parsedPkg.academyCohortStatus).toBe("provisioned");
    expect(parsedPkg.quoteItems).toHaveLength(3);
  });

  it("silently refreshes opportunity rowVersion via getOpportunityById after addContactRole and removeContactRole", async () => {
    mockRepo.addContactRole = vi.fn().mockResolvedValue({
      id: "role-new-1",
      opportunityId: "opp-123",
      contactPartyId: "party-contact-9",
      contactName: "Khalid Al-Subaie",
      stakeholderRole: "DecisionMaker",
      isPrimary: true,
      createdAtUtc: "2026-11-18T08:00:00Z",
    });
    mockRepo.removeContactRole = vi.fn().mockResolvedValue(undefined);

    const { result } = renderHook(() => useOpportunityDetailViewModel("opp-123"));
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    expect(mockRepo.getOpportunityById).toHaveBeenCalledTimes(1);

    mockRepo.getOpportunityById.mockResolvedValueOnce({
      ...mockDetailData,
      opportunity: { ...mockDetailData.opportunity, rowVersion: "rv-after-add", primaryContactRole: "DecisionMaker" },
    });

    await act(async () => {
      await result.current.handleAddContactRole({
        contactPartyId: "party-contact-9",
        contactName: "Khalid Al-Subaie",
        stakeholderRole: "DecisionMaker",
        isPrimary: true,
      });
    });

    expect(result.current.loading).toBe(false);
    expect(mockRepo.getOpportunityById).toHaveBeenCalledTimes(2);
    expect(result.current.data?.opportunity.rowVersion).toBe("rv-after-add");

    mockRepo.getOpportunityById.mockResolvedValueOnce({
      ...mockDetailData,
      opportunity: { ...mockDetailData.opportunity, rowVersion: "rv-after-remove", primaryContactRole: null },
    });

    await act(async () => {
      await result.current.handleRemoveContactRole("role-new-1");
    });

    expect(result.current.loading).toBe(false);
    expect(mockRepo.getOpportunityById).toHaveBeenCalledTimes(3);
    expect(result.current.data?.opportunity.rowVersion).toBe("rv-after-remove");
  });

  it("propagates fulfillment dispatch failures via submitError and returns false", async () => {
    mockActivityRepo.createActivity = vi.fn().mockRejectedValueOnce(new Error("HQ Fulfillment Endpoint Offline"));
    const { result } = renderHook(() => useOpportunityDetailViewModel("opp-123"));
    await waitFor(() => expect(result.current.loading).toBe(false));

    let ok = true;
    await act(async () => {
      ok = await result.current.handleRequestFulfillment();
    });

    expect(ok).toBe(false);
    expect(result.current.fulfillmentRequested).toBe(false);
    expect(result.current.submitError).toBe("HQ Fulfillment Endpoint Offline");
  });

  it("blocks Deal 360 rendering when OPPORTUNITIES_READ permission is denied", () => {
    mockUsePermission.mockReturnValue(false);
    render(<OpportunityDetailView opportunityId="opp-123" />);
    expect(screen.getByText("crm.errors.accessDenied")).toBeDefined();
    expect(mockRepo.getOpportunityById).not.toHaveBeenCalled();
  });
});

