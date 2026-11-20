import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { setCrmContainer, type CrmContainer } from "@modules/crm/di";
import { convertCrmCurrencyAmount, getCrossExchangeRate } from "../../../../shared";
import {
  DEFAULT_CONFIGURED_ACTIVITY_TYPES,
  DEFAULT_CONFIGURED_LOSS_REASONS,
  DEFAULT_CRM_CUSTOM_FIELDS,
  DEFAULT_SETTINGS_BUYING_COMMITTEE_ROLES,
  DEFAULT_SETTINGS_SCOPED_ROLES,
} from "../../domain/constants/crmSettingsDefaults";
import { CrmSettingsMapper } from "../../data/mappers/CrmSettingsMapper";
import { CrmSettingsView } from "./CrmSettingsView";

vi.mock("@core/providers/i18n-provider", () => ({
  useI18n: () => ({
    t: (key: string, params?: Record<string, string | number>) => {
      if (params?.defaultValue) return String(params.defaultValue);
      return key;
    },
    language: "en",
  }),
}));

const mockUsePermission = vi.fn((_perm?: string) => true);

vi.mock("@core/hooks/use-permission", () => ({
  usePermission: (perm: string) => mockUsePermission(perm),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => "/crm/settings",
}));

function renderWithQuery(ui: React.ReactElement) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>);
}

describe("CrmSettingsView & Multi-Currency FX Engine", () => {
  const mockGetSettings = vi.fn();
  const mockGetGovernanceCatalog = vi.fn();
  const mockUpdateTenantSettings = vi.fn();
  const mockUpdateUserPreferences = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockUsePermission.mockReturnValue(true);
    window.localStorage.clear();

    let serverTenantSettings = {
      baseCurrencyCode: "EGP",
      defaultDealCurrencyCode: "USD",
      autoConvertAmountsToBase: true,
      showDualCurrencyBadges: true,
      allowUserCurrencyOverride: true,
      snapshotExchangeRateOnDealCreation: true,
      stageGateStrictness: "strict" as const,
      requireVerifiedPartyOnProposal: true,
      requireCloseNotesOnWin: true,
      defaultLeadSource: "Inbound",
      slaLeadResponseHours: 4,
      stalledDealThresholdDays: 14,
      duplicateDetectionMode: "strict" as const,
      leadAutoAssignmentRule: "round_robin" as const,
      enableCatalogPricingQuoteHandoff: true,
      enableVenueAcademyCommercialHandoff: true,
      autoCreateWorkItemsOnStageMove: true,
      defaultCommunicationChannel: "email" as const,
      autoSyncPartyKernelOnConvert: true,
      customFieldsConfigJson: null as string | null,
      rowVersion: "v1",
    };

    const serverUserPrefs = {
      overrideCurrencyCode: null,
      defaultDealViewMode: "Kanban" as const,
      defaultPipelineCode: "default",
      cardDensity: "Comfortable" as const,
      autoConvertAmountsOverride: null,
      showDualCurrencyBadgesOverride: null,
      dailyDigestEnabled: true,
      stageMoveNotificationsEnabled: true,
      rowVersion: "v1",
    };

    mockGetSettings.mockImplementation(async () => ({
      tenantSettings: serverTenantSettings,
      userPreferences: serverUserPrefs,
      effectiveBaseCurrencyCode: serverTenantSettings.baseCurrencyCode,
      effectiveAutoConvertToBase: serverTenantSettings.autoConvertAmountsToBase,
      effectiveShowDualCurrencyBadges: serverTenantSettings.showDualCurrencyBadges,
      exchangeRatesUsdBase: { USD: 1, EGP: 50.85, SAR: 3.75 },
    }));

    mockGetGovernanceCatalog.mockResolvedValue({
      defaultScopedRoles: DEFAULT_SETTINGS_SCOPED_ROLES,
      defaultBuyingCommitteeRoles: DEFAULT_SETTINGS_BUYING_COMMITTEE_ROLES,
      recordPrincipals: [],
      scopedPermissions: [],
    });

    mockUpdateTenantSettings.mockImplementation(async (payload) => {
      serverTenantSettings = { ...serverTenantSettings, ...payload, rowVersion: "v2" };
      return {
        tenantSettings: serverTenantSettings,
        userPreferences: serverUserPrefs,
        effectiveBaseCurrencyCode: serverTenantSettings.baseCurrencyCode ?? "EGP",
        effectiveAutoConvertToBase: serverTenantSettings.autoConvertAmountsToBase ?? true,
        effectiveShowDualCurrencyBadges: serverTenantSettings.showDualCurrencyBadges ?? true,
        exchangeRatesUsdBase: { USD: 1, EGP: 50.85, SAR: 3.75 },
      };
    });

    mockUpdateUserPreferences.mockImplementation(async (payload) => ({
      tenantSettings: serverTenantSettings,
      userPreferences: { ...serverUserPrefs, ...payload },
      effectiveBaseCurrencyCode: serverTenantSettings.baseCurrencyCode ?? "EGP",
      effectiveAutoConvertToBase: serverTenantSettings.autoConvertAmountsToBase ?? true,
      effectiveShowDualCurrencyBadges: serverTenantSettings.showDualCurrencyBadges ?? true,
      exchangeRatesUsdBase: { USD: 1, EGP: 50.85, SAR: 3.75 },
    }));

    const mockContainer: CrmContainer = {
      overviewService: {} as never,
      overviewRepository: {} as never,

      workflowService: {} as never,
      workflowRepository: {
        getPipelines: vi.fn().mockResolvedValue([]),
      } as never,
      reportsService: {} as never,
      reportsRepository: {} as never,
      settingsService: {} as never,
      settingsRepository: {
        getSettings: mockGetSettings,
        getGovernanceCatalog: mockGetGovernanceCatalog,
        lookupAssignees: vi.fn().mockResolvedValue([]),
        updateTenantSettings: mockUpdateTenantSettings,
        updateUserPreferences: mockUpdateUserPreferences,
      },
      leadService: {} as never,
      leadRepository: {} as never,
      opportunityService: {} as never,
      opportunityRepository: {} as never,
      accountService: {} as never,
      accountRepository: {} as never,
      contactService: {} as never,
      contactRepository: {} as never,
      activityService: {} as never,
      activityRepository: {} as never,
      entityLookup: {} as never,
    };

    setCrmContainer(mockContainer);
  });

  it("converts USD, EGP, and SAR accurately using Triple-Value FX cross-rates", () => {
    expect(convertCrmCurrencyAmount(1000, "USD", "EGP")).toBe(50850);
    expect(convertCrmCurrencyAmount(3750, "SAR", "USD")).toBe(1000);
    expect(convertCrmCurrencyAmount(3750, "SAR", "EGP")).toBe(50850);
    expect(getCrossExchangeRate("USD", "EGP")).toBeCloseTo(50.85, 2);
  });

  it("renders all governance cards and persists tenant + user settings cleanly", async () => {
    renderWithQuery(<CrmSettingsView />);

    await waitFor(() => {
      expect(screen.getByTestId("crm-settings-view")).toBeDefined();
      expect(screen.getByTestId("crm-settings-currency-card")).toBeDefined();
      expect(screen.getByTestId("crm-settings-governance-card")).toBeDefined();
      expect(screen.getByTestId("crm-settings-custom-fields-card")).toBeDefined();
    });

    fireEvent.click(screen.getByTestId("crm-settings-save-btn"));

    await waitFor(() => {
      expect(mockUpdateTenantSettings).toHaveBeenCalled();
      expect(mockUpdateUserPreferences).toHaveBeenCalled();
    });
  });

  it("creates a custom field in the Custom Fields Studio and persists it to tenant settings", async () => {
    renderWithQuery(<CrmSettingsView />);

    await waitFor(() => {
      expect(screen.getByTestId("crm-cf-key-input")).toBeDefined();
    });

    fireEvent.change(screen.getByTestId("crm-cf-key-input"), { target: { value: "sponsor_tier_approval" } });
    fireEvent.change(screen.getByTestId("crm-cf-label-en-input"), { target: { value: "Sponsor Tier Approval" } });
    fireEvent.click(screen.getByTestId("crm-cf-submit-btn"));

    await waitFor(() => {
      expect(screen.getByTestId("crm-cf-row-sponsor_tier_approval")).toBeDefined();
      expect(mockUpdateTenantSettings).toHaveBeenCalled();
    });
  });

  it("respects empty arrays in parseCustomGovernanceConfigJson and renders CrmSettingsSkeleton while hydrating", () => {
    expect(DEFAULT_SETTINGS_SCOPED_ROLES.every((r) => (r.memberNames ?? []).length === 0)).toBe(true);

    const parsed = CrmSettingsMapper.parseCustomGovernanceConfigJson(
      JSON.stringify({
        customFields: [],
        crmRoles: [],
        buyingCommitteeRoles: [],
        configuredLossReasons: [{ code: "budget_freeze", labelEn: "Budget Freeze", labelAr: "تجميد الميزانية" }],
        configuredActivityTypes: [{ code: "exec_briefing", labelEn: "Executive Briefing", labelAr: "إحاطة تنفيذية" }],
      }),
      {
        customFields: DEFAULT_CRM_CUSTOM_FIELDS,
        crmRoles: DEFAULT_SETTINGS_SCOPED_ROLES,
        buyingCommitteeRoles: DEFAULT_SETTINGS_BUYING_COMMITTEE_ROLES,
        configuredLossReasons: DEFAULT_CONFIGURED_LOSS_REASONS,
        configuredActivityTypes: DEFAULT_CONFIGURED_ACTIVITY_TYPES,
      }
    );

    expect(parsed.customFields).toEqual([]);
    expect(parsed.crmRoles).toEqual([]);
    expect(parsed.buyingCommitteeRoles).toEqual([]);
    expect(parsed.configuredLossReasons).toHaveLength(1);
    expect(parsed.configuredActivityTypes).toHaveLength(1);

    mockGetSettings.mockReturnValue(new Promise(() => {}));
    renderWithQuery(<CrmSettingsView />);
    expect(screen.getByTestId("crm-settings-skeleton")).toBeDefined();
  });

  it("enforces PBAC unauthorized screen, honest error banner on rejection, and tenant-scoped client pref isolation without overwriting target tenant storage", async () => {
    const { useCrmClientPrefsStore } = await import("@modules/crm/shared");
    const store = useCrmClientPrefsStore.getState();

    // Seed Tenant A and Tenant B preferences in scoped localStorage
    store.syncScopeContext("tenantA:user1");
    useCrmClientPrefsStore.getState().setDisplayCurrencyPrefs({ baseCurrency: "USD" });
    useCrmClientPrefsStore.getState().setTipDismissed(true);

    store.syncScopeContext("tenantB:user2");
    expect(useCrmClientPrefsStore.getState().baseCurrency).toBe("SAR");
    expect(useCrmClientPrefsStore.getState().tipDismissed).toBe(false);
    useCrmClientPrefsStore.getState().setDisplayCurrencyPrefs({ baseCurrency: "EUR" });

    // Switching back to Tenant A must restore USD/true without overwriting Tenant B's EUR
    store.syncScopeContext("tenantA:user1");
    expect(useCrmClientPrefsStore.getState().baseCurrency).toBe("USD");
    expect(useCrmClientPrefsStore.getState().tipDismissed).toBe(true);

    // Switching back to Tenant B must still restore EUR (not DEFAULT_CRM_CLIENT_PREFS "SAR")
    store.syncScopeContext("tenantB:user2");
    expect(useCrmClientPrefsStore.getState().baseCurrency).toBe("EUR");
    expect(useCrmClientPrefsStore.getState().tipDismissed).toBe(false);

    // PBAC denial
    mockUsePermission.mockReturnValue(false);
    const { rerender } = renderWithQuery(<CrmSettingsView />);
    expect(screen.getByTestId("crm-settings-unauthorized")).toBeDefined();
    expect(screen.queryByTestId("crm-settings-save-btn")).toBeNull();

    // Error honesty on failed save
    mockUsePermission.mockReturnValue(true);
    mockUpdateTenantSettings.mockRejectedValueOnce(new Error("409 Conflict: stale rowVersion"));
    const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(
      <QueryClientProvider client={qc}>
        <CrmSettingsView />
      </QueryClientProvider>
    );
    await waitFor(() => expect(screen.getAllByTestId("crm-settings-save-btn").length).toBeGreaterThan(0));
    const saveBtns = screen.getAllByTestId("crm-settings-save-btn");
    fireEvent.click(saveBtns[saveBtns.length - 1]);
    await waitFor(() => {
      expect(screen.getByTestId("crm-settings-error-banner")).toBeDefined();
      expect(screen.queryByTestId("crm-settings-save-banner")).toBeNull();
    });
    void rerender;
  });
});
