import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { OpportunityDetailView } from "./OpportunityDetailView";
import { setCrmContainer } from "@modules/crm/di";
import type { CrmContainer } from "@modules/crm/di";
import { useCrmSettingsStore } from "@modules/crm";
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
  let mockOverviewRepo: any;

  beforeEach(() => {
    vi.clearAllMocks();
    useCrmSettingsStore.getState().resetDefaults();

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
      getSettings: vi.fn().mockResolvedValue({}),
      updateTenantSettings: vi.fn().mockResolvedValue({}),
      updateUserPreferences: vi.fn().mockResolvedValue({}),
    };

    const container: CrmContainer = {
      overviewService: {} as any,
      overviewRepository: mockOverviewRepo,
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

  it("renders shape-accurate OpportunityDetailSkeleton while opportunity detail is loading", () => {
    mockRepo.getOpportunityById.mockReturnValue(new Promise(() => {}));
    render(<OpportunityDetailView opportunityId="opp-123" />);
    expect(screen.getByTestId("deal-detail-skeleton")).toBeDefined();
  });

  it("renders opportunity header, detail metrics, unclipped Buying Committee contact placeholder, and stage audit history", async () => {
    render(<OpportunityDetailView opportunityId="opp-123" />);

    await waitFor(() => {
      expect(screen.getByText("Saudi Pro League Broadcast Rights Extension")).toBeDefined();
      expect(screen.getByText("SAR 1,200,000")).toBeDefined();
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

  it("persists Deal Commercial Package quote items and handoff statuses to the backend server via CustomFieldsConfigJson", async () => {
    render(<OpportunityDetailView opportunityId="opp-123" />);

    await waitFor(() => {
      expect(screen.getByTestId("venue-block-booking-hold-btn")).toBeDefined();
    });

    fireEvent.click(screen.getByTestId("venue-block-booking-hold-btn"));
    fireEvent.click(screen.getByTestId("academy-b2b-sponsorship-btn"));

    // Add a new commercial quote line item
    fireEvent.change(screen.getByTestId("quote-item-name-input"), {
      target: { value: "VIP Hospitality Suite Add-On" },
    });
    fireEvent.change(screen.getByTestId("quote-item-discount-input"), {
      target: { value: "10" },
    });
    fireEvent.click(screen.getByTestId("quote-add-item-btn"));

    await waitFor(() => {
      const pkg = useCrmSettingsStore.getState().dealCommercialPackages["opp-123"];
      expect(pkg).toBeDefined();
      expect(pkg.venueHoldStatus).toBe("reserved");
      expect(pkg.academyCohortStatus).toBe("provisioned");
      expect(pkg.quoteItems.some((item) => item.itemName === "VIP Hospitality Suite Add-On")).toBe(true);
      expect(mockOverviewRepo.updateTenantSettings).toHaveBeenCalled();
    });

    const lastPayload =
      mockOverviewRepo.updateTenantSettings.mock.calls[
        mockOverviewRepo.updateTenantSettings.mock.calls.length - 1
      ][0];
    const parsedEnvelope = JSON.parse(lastPayload.customFieldsConfigJson);
    expect(parsedEnvelope.dealCommercialPackages["opp-123"].venueHoldStatus).toBe("reserved");
    expect(parsedEnvelope.dealCommercialPackages["opp-123"].academyCohortStatus).toBe("provisioned");
    expect(parsedEnvelope.dealCommercialPackages["opp-123"].quoteItems).toHaveLength(3);
  });
});

