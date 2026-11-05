import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { CrmSettingsView } from "./CrmSettingsView";
import {
  useCrmSettingsStore,
  convertCrmCurrencyAmount,
  getCrossExchangeRate,
} from "../viewmodels/useCrmSettingsStore";
import { setCrmContainer, type CrmContainer } from "@modules/crm/di";

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

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => "/crm/settings",
}));

describe("CrmSettingsView & Multi-Currency FX Engine", () => {
  const mockGetSettings = vi.fn();
  const mockUpdateTenantSettings = vi.fn();
  const mockUpdateUserPreferences = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    useCrmSettingsStore.getState().resetDefaults();

    mockGetSettings.mockResolvedValue({
      tenantSettings: {
        baseCurrencyCode: "EGP",
        defaultDealCurrencyCode: "USD",
        autoConvertAmountsToBase: true,
        showDualCurrencyBadges: true,
        allowUserCurrencyOverride: true,
        snapshotExchangeRateOnDealCreation: true,
        stageGateStrictness: "strict",
        requireVerifiedPartyOnProposal: true,
        requireCloseNotesOnWin: true,
        defaultLeadSource: "Inbound",
        slaLeadResponseHours: 4,
        stalledDealThresholdDays: 14,
        duplicateDetectionMode: "strict",
        leadAutoAssignmentRule: "round_robin",
        enableCatalogPricingQuoteHandoff: true,
        enableVenueAcademyCommercialHandoff: true,
        autoCreateWorkItemsOnStageMove: true,
        defaultCommunicationChannel: "email",
        autoSyncPartyKernelOnConvert: true,
        customFieldsConfigJson: null,
        rowVersion: "v1",
      },
      userPreferences: {
        overrideCurrencyCode: null,
        defaultDealViewMode: "Kanban",
        defaultPipelineCode: "default",
        cardDensity: "Comfortable",
        autoConvertAmountsOverride: null,
        showDualCurrencyBadgesOverride: null,
        dailyDigestEnabled: true,
        stageMoveNotificationsEnabled: true,
        rowVersion: "v1",
      },
      effectiveBaseCurrencyCode: "EGP",
      effectiveAutoConvertToBase: true,
      effectiveShowDualCurrencyBadges: true,
      exchangeRatesPerUsd: { USD: 1, EGP: 50.85, SAR: 3.75 },
      ratesLastUpdatedUtc: "2026-11-04T00:00:00Z",
    });

    mockUpdateTenantSettings.mockImplementation(async (payload) => ({
      tenantSettings: { ...payload, rowVersion: "v2" },
      userPreferences: {},
      effectiveBaseCurrencyCode: payload.baseCurrencyCode,
      effectiveAutoConvertToBase: payload.autoConvertAmountsToBase,
      effectiveShowDualCurrencyBadges: payload.showDualCurrencyBadges,
      exchangeRatesPerUsd: { USD: 1, EGP: 50.85, SAR: 3.75 },
      ratesLastUpdatedUtc: "2026-11-04T00:00:00Z",
    }));

    mockUpdateUserPreferences.mockResolvedValue({});

    const mockContainer: CrmContainer = {
      overviewService: {} as any,
      overviewRepository: {
        getOverviewSummary: vi.fn(),
        getPipelineReport: vi.fn(),
        getSettings: mockGetSettings,
        updateTenantSettings: mockUpdateTenantSettings,
        updateUserPreferences: mockUpdateUserPreferences,
      } as any,
      leadService: {} as any,
      leadRepository: {} as any,
      opportunityService: {} as any,
      opportunityRepository: {} as any,
      accountService: {} as any,
      accountRepository: {} as any,
      contactService: {} as any,
      contactRepository: {} as any,
    };

    setCrmContainer(mockContainer);
  });

  it("converts USD, EGP, and SAR accurately using Triple-Value FX cross-rates", () => {
    // 1,000 USD -> EGP at 50.85 = 50,850 EGP
    expect(convertCrmCurrencyAmount(1000, "USD", "EGP")).toBe(50850);
    // 3,750 SAR -> USD at 3.75 = 1,000 USD
    expect(convertCrmCurrencyAmount(3750, "SAR", "USD")).toBe(1000);
    // 3,750 SAR -> EGP = 50,850 EGP
    expect(convertCrmCurrencyAmount(3750, "SAR", "EGP")).toBe(50850);
    expect(getCrossExchangeRate("USD", "EGP")).toBeCloseTo(50.85, 2);
  });

  it("renders all 4 governance & configuration cards and saves server-side settings", async () => {
    render(<CrmSettingsView />);

    expect(screen.getByTestId("crm-settings-view")).toBeDefined();
    expect(screen.getByTestId("crm-settings-currency-card")).toBeDefined();
    expect(screen.getByTestId("crm-settings-governance-card")).toBeDefined();
    expect(screen.getByTestId("crm-settings-custom-fields-card")).toBeDefined();

    const saveBtn = screen.getByTestId("crm-settings-save-btn");
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(mockUpdateTenantSettings).toHaveBeenCalled();
      expect(mockUpdateUserPreferences).toHaveBeenCalled();
    });
  });

  it("creates a custom field in the Custom Fields Studio and persists it to tenant settings", async () => {
    render(<CrmSettingsView />);

    const keyInput = screen.getByTestId("crm-cf-key-input");
    const labelEnInput = screen.getByTestId("crm-cf-label-en-input");
    const submitBtn = screen.getByTestId("crm-cf-submit-btn");

    fireEvent.change(keyInput, { target: { value: "sponsor_tier_approval" } });
    fireEvent.change(labelEnInput, { target: { value: "Sponsor Tier Approval" } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByTestId("crm-cf-row-sponsor_tier_approval")).toBeDefined();
      expect(mockUpdateTenantSettings).toHaveBeenCalled();
    });
  });
});
