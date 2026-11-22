import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { beforeEach, describe, expect, it, vi } from "vitest";
import "@testing-library/jest-dom";
import { LandingTargetCatalog } from "@core/navigation";
import { WorkspaceGroup } from "@core/navigation/domain/entities/WorkspaceGroup";
import type { TenantContextType } from "@core/providers/tenant-context-provider";
import type { SovereignAccountContext } from "../../../domain/entities/SovereignAccountEntities";
import { AccountPreferencesView } from "../AccountPreferencesView";

if (typeof (globalThis as Record<string, unknown>).ResizeObserver === "undefined") {
  (globalThis as Record<string, unknown>).ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}

if (typeof Element.prototype.scrollIntoView !== "function") {
  Element.prototype.scrollIntoView = () => {};
}

const mockState = vi.hoisted(() => ({
  language: "en" as "en" | "ar",
  direction: "ltr" as "ltr" | "rtl",
  organizationTranslation: "Organization",
  isPlatform: false,
  activeTenantName: null as string | null,
  isImpersonating: false,
  tenantContext: null as Pick<TenantContextType, "currentTenant"> | null,
  accountContext: undefined as Partial<SovereignAccountContext> | undefined,
  activeContextKey: "tenant:944caec0-1111-2222-3333-444455556666",
  workspaceGroups: [] as WorkspaceGroup[],
  fetchLandingTargetCatalog: vi.fn(),
  setWorkspaceStartPage: vi.fn(),
  resetWorkspaceStartPage: vi.fn(),
  refreshNavigation: vi.fn(),
}));

vi.mock("@core/providers/i18n-provider", () => ({
  useI18n: () => ({
    language: mockState.language,
    direction: mockState.direction,
    setLanguage: vi.fn(),
    t: (key: string, params?: Record<string, string | number>) => {
      if (key === "chrome.section.organization") {
        return mockState.organizationTranslation;
      }
      if (params?.defaultValue !== undefined) {
        return String(params.defaultValue);
      }
      return key;
    },
  }),
}));

vi.mock("@core/providers/settings-provider", () => ({
  useSettings: () => ({
    buttonStyle: "default",
    borderRadius: "default",
    animationLevel: "default",
    inputStyle: "default",
  }),
}));

vi.mock("@core/hooks/use-auth-bridge", () => ({
  useCoreImpersonation: () => ({
    isImpersonating: mockState.isImpersonating,
  }),
}));

vi.mock("@core/hooks/useAdminContext", () => ({
  useAdminContext: () => ({
    contextType: mockState.isPlatform ? "platform" : "tenant",
    isPlatform: mockState.isPlatform,
    isTenant: !mockState.isPlatform,
    isImpersonating: Boolean(mockState.tenantContext?.currentTenant),
    activeTenantId: mockState.isPlatform ? null : "944caec0-1111-2222-3333-444455556666",
    activeTenantName: mockState.activeTenantName,
    isHydrated: true,
  }),
}));

vi.mock("@core/providers/tenant-context-provider", () => ({
  useOptionalTenantContext: () => mockState.tenantContext,
}));

vi.mock("@core/providers/workspace-provider", () => ({
  useWorkspace: () => ({
    workspaceGroups: mockState.workspaceGroups,
  }),
}));

vi.mock("@core/providers/navigation-provider", () => ({
  useOptionalNavigation: () => ({
    refreshNavigation: () => mockState.refreshNavigation(),
  }),
}));

vi.mock("@core/di", () => ({
  getCoreContainer: () => ({
    navigationRepository: {
      fetchLandingTargetCatalog: (...args: unknown[]) => mockState.fetchLandingTargetCatalog(...args),
      setWorkspaceStartPage: (...args: unknown[]) => mockState.setWorkspaceStartPage(...args),
      resetWorkspaceStartPage: (...args: unknown[]) => mockState.resetWorkspaceStartPage(...args),
    },
  }),
}));

vi.mock("../../viewmodels/useSovereignAccountSlicesViewModel", () => ({
  useAccountContextSliceViewModel: () => ({
    accountContext: mockState.accountContext,
    principalContext: mockState.accountContext?.principalContext,
    featureFlags: mockState.accountContext?.featureFlags,
    isLoadingContext: false,
    isFetchingContext: false,
    isContextError: false,
    contextError: null,
    refetchContext: vi.fn(),
  }),
}));

vi.mock("../../viewmodels/useWorkstationPreferencesViewModel", () => ({
  useWorkstationPreferencesViewModel: () => ({
    theme: "dark",
    setTheme: vi.fn(),
    accent: "signal-lime",
    setAccent: vi.fn(),
    availableAccents: [],
    density: "comfortable" as const,
    setDensity: vi.fn(),
    language: "en",
    setLanguage: vi.fn(),
    privacyBlur: false,
    setPrivacyBlur: vi.fn(),
    numeralSystem: "latn" as const,
    setNumeralSystem: vi.fn(),
    timezone: "UTC",
    setTimezone: vi.fn(),
    reducedMotion: false,
    setReducedMotion: vi.fn(),
    toastPosition: "top-end" as const,
    setToastPosition: vi.fn(),
    startupTarget: "default",
    setStartupTarget: vi.fn(),
    clearStartupTarget: vi.fn(),
    activeContextKey: mockState.activeContextKey,
    isStartupTargetEnforcedByRole: false,
    enforcingRoleName: null,
    startupTargetFallbackActive: false,
    startupTargetFallbackReason: null,
    syncStatus: "idle" as const,
    pendingCount: 0,
    persistError: null,
    isLoadingPreferences: false,
    isPreferencesError: false,
    preferencesError: null,
    refetchPreferences: vi.fn(),
    preferences: { rowVersion: "rv-1" },
  }),
}));

describe("AccountPreferencesView — startup active context label resolution", () => {
  beforeEach(() => {
    mockState.language = "en";
    mockState.direction = "ltr";
    mockState.organizationTranslation = "Organization";
    mockState.isPlatform = false;
    mockState.activeTenantName = null;
    mockState.isImpersonating = false;
    mockState.tenantContext = null;
    mockState.accountContext = undefined;
    mockState.activeContextKey = "tenant:944caec0-1111-2222-3333-444455556666";
    mockState.workspaceGroups = [];
    mockState.fetchLandingTargetCatalog.mockReset();
    mockState.setWorkspaceStartPage.mockReset().mockResolvedValue({});
    mockState.resetWorkspaceStartPage.mockReset().mockResolvedValue(undefined);
    mockState.refreshNavigation.mockReset().mockResolvedValue(undefined);
  });

  it("renders startupContextPlatform when isPlatform is true", () => {
    mockState.isPlatform = true;
    mockState.activeContextKey = "platform";
    mockState.activeTenantName = null;
    mockState.accountContext = {
      clubAffiliation: "Ignored Club",
      principalContext: {
        principalKind: "PlatformAdmin",
        isSuperAdmin: true,
        controlPlaneLabel: "Global Control Plane",
        activeTenantName: "Ignored Tenant",
        isSolePrimaryOwner: true,
        hasStandingRootAuthority: true,
        availableBranches: [],
      },
    };

    render(<AccountPreferencesView />);

    expect(screen.getByTestId("startup-active-context-badge")).toHaveTextContent(
      "profile.preferences.startupContextPlatform"
    );
    expect(screen.getByTestId("account-scope-banner-context")).toHaveTextContent(
      "profile.preferences.startupContextPlatform"
    );
    expect(screen.getByTestId("scope-banner-superadmin-note")).toBeInTheDocument();
  });

  it("uses accountContext.principalContext.activeTenantName over Organization fallback for direct and impersonated tenant admins", () => {
    mockState.isPlatform = false;
    mockState.tenantContext = { currentTenant: null };
    mockState.activeTenantName = "Organization";
    mockState.accountContext = {
      clubAffiliation: "Secondary Club Name",
      principalContext: {
        principalKind: "TenantUser",
        isSuperAdmin: false,
        controlPlaneLabel: "",
        activeTenantName: "Al-Ahly Sports Academy / أكاديمية الأهلي الرياضية",
        isSolePrimaryOwner: false,
        hasStandingRootAuthority: false,
        availableBranches: [],
      },
    };

    const { rerender } = render(<AccountPreferencesView />);

    const directBadge = screen.getByTestId("startup-active-context-badge");
    expect(directBadge).toHaveTextContent("Al-Ahly Sports Academy / أكاديمية الأهلي الرياضية");
    expect(directBadge).not.toHaveTextContent("Organization");

    mockState.isImpersonating = true;
    rerender(<AccountPreferencesView />);

    const impersonatedBadge = screen.getByTestId("startup-active-context-badge");
    expect(impersonatedBadge).toHaveTextContent(
      "Al-Ahly Sports Academy / أكاديمية الأهلي الرياضية"
    );
    expect(impersonatedBadge).not.toHaveTextContent("Organization");
  });

  it("prefers non-fallback currentTenant.name, falls back to clubAffiliation, and honors explicit activeTenantName", () => {
    mockState.isPlatform = false;
    mockState.tenantContext = {
      currentTenant: {
        id: "944caec0-1111-2222-3333-444455556666",
        name: "  Al-Ahly Drilled-Down Tenant  ",
      },
    };
    mockState.activeTenantName = "Explicit Fallback Name";
    mockState.accountContext = {
      clubAffiliation: "Club Affiliation Fallback",
      principalContext: {
        principalKind: "TenantUser",
        isSuperAdmin: false,
        controlPlaneLabel: "",
        activeTenantName: "Account Context Tenant",
        isSolePrimaryOwner: false,
        hasStandingRootAuthority: false,
        availableBranches: [],
      },
    };

    const { rerender } = render(<AccountPreferencesView />);
    expect(screen.getByTestId("startup-active-context-badge")).toHaveTextContent(
      "Al-Ahly Drilled-Down Tenant"
    );

    // Without currentTenant and principalContext.activeTenantName, use clubAffiliation over "Organization"
    mockState.tenantContext = null;
    mockState.activeTenantName = "Organization";
    mockState.accountContext = {
      clubAffiliation: "  Al-Ahly Club Affiliation  ",
      principalContext: {
        principalKind: "TenantUser",
        isSuperAdmin: false,
        controlPlaneLabel: "",
        activeTenantName: "   ",
        isSolePrimaryOwner: false,
        hasStandingRootAuthority: false,
        availableBranches: [],
      },
    };
    rerender(<AccountPreferencesView />);
    expect(screen.getByTestId("startup-active-context-badge")).toHaveTextContent(
      "Al-Ahly Club Affiliation"
    );

    // Without currentTenant or accountContext tenant fields, explicit non-fallback activeTenantName works cleanly
    mockState.accountContext = undefined;
    mockState.activeTenantName = "  SCRIPE Technologies SAE  ";
    rerender(<AccountPreferencesView />);
    expect(screen.getByTestId("startup-active-context-badge")).toHaveTextContent(
      "SCRIPE Technologies SAE"
    );
  });

  it("falls back to startupContextTenant when tenant metadata is empty or only generic Organization fallback", () => {
    mockState.isPlatform = false;
    mockState.tenantContext = { currentTenant: null };
    mockState.accountContext = undefined;
    mockState.activeTenantName = "Organization";

    const { rerender } = render(<AccountPreferencesView />);
    const badge = screen.getByTestId("startup-active-context-badge");
    expect(badge).toHaveTextContent("profile.preferences.startupContextTenant");
    expect(badge).not.toHaveTextContent("Organization");

    // Localized Arabic generic organization fallback is also rejected cleanly
    mockState.language = "ar";
    mockState.direction = "rtl";
    mockState.organizationTranslation = "المؤسسة";
    mockState.activeTenantName = "المؤسسة";
    rerender(<AccountPreferencesView />);

    const arBadge = screen.getByTestId("startup-active-context-badge");
    expect(arBadge).toHaveTextContent("profile.preferences.startupContextTenant");
    expect(arBadge).not.toHaveTextContent("المؤسسة");

    // Completely null/empty metadata also resolves to startupContextTenant
    mockState.activeTenantName = "   ";
    mockState.accountContext = {
      clubAffiliation: "",
      principalContext: {
        principalKind: "TenantUser",
        isSuperAdmin: false,
        controlPlaneLabel: "",
        activeTenantName: null,
        isSolePrimaryOwner: false,
        hasStandingRootAuthority: false,
        availableBranches: [],
      },
    };
    rerender(<AccountPreferencesView />);
    expect(screen.getByTestId("startup-active-context-badge")).toHaveTextContent(
      "profile.preferences.startupContextTenant"
    );
  });

  it("lazily fetches landing target catalog via TanStack Query and populates unhydrated workspace pages", async () => {
    mockState.workspaceGroups = [
      new WorkspaceGroup({
        workspaceId: "ws-crm",
        workspaceKey: "crm",
        workspaceNameEn: "CRM",
        workspaceNameAr: "المبيعات",
        workspaceIcon: "LayoutGrid",
        workspaceSortOrder: 1,
        colorHue: 190,
        colorChroma: 0.14,
        workspaceType: "Module",
        menuItems: [],
        isLocked: false,
        homeRoute: "/crm",
        platformHomeRoute: null,
        effectiveHomeRoute: "/crm",
        isPinned: false,
        pinSortOrder: null,
        accessibleItemCount: 2,
      }),
    ];
    mockState.fetchLandingTargetCatalog.mockResolvedValue(
      new LandingTargetCatalog({
        scopeMode: "current_context",
        contextKey: mockState.activeContextKey,
        overviewAuthorized: true,
        workspaces: [
          {
            workspaceKey: "crm",
            workspaceNameEn: "CRM",
            workspaceNameAr: "المبيعات",
            workspaceIcon: "LayoutGrid",
            workspaceSortOrder: 1,
            workspaceType: "Module",
            contextScope: "TenantOnly",
            effectiveHomeRoute: "/crm",
          },
        ],
        items: [
          {
            workspaceKey: "crm",
            workspaceNameEn: "CRM",
            workspaceNameAr: "المبيعات",
            contextScope: "TenantOnly",
            slug: "crm-leads",
            nameEn: "Leads",
            nameAr: "العملاء المحتملون",
            route: "/crm/leads",
            breadcrumbEn: ["CRM Operations", "Leads"],
            breadcrumbAr: ["عمليات العملاء", "العملاء المحتملون"],
          },
        ],
      })
    );

    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <AccountPreferencesView />
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(mockState.fetchLandingTargetCatalog).toHaveBeenCalledWith("current_context");
    });

    const combobox = screen.getByTestId("startup-target-select");
    fireEvent.click(combobox);

    await waitFor(() => {
      expect(screen.getByRole("option", { name: /Leads/i })).toBeInTheDocument();
    });
  });

  it("persists and resets per-workspace start page via navigationRepository and refreshes navigation", async () => {
    mockState.workspaceGroups = [
      new WorkspaceGroup({
        workspaceId: "ws-crm",
        workspaceKey: "crm",
        workspaceNameEn: "CRM",
        workspaceNameAr: "المبيعات",
        workspaceIcon: "LayoutGrid",
        workspaceSortOrder: 1,
        colorHue: 190,
        colorChroma: 0.14,
        workspaceType: "Module",
        menuItems: [],
        isLocked: false,
        homeRoute: "/crm",
        platformHomeRoute: null,
        effectiveHomeRoute: "/crm/leads",
        effectiveHomeMenuSlug: "crm-leads",
        effectiveHomeSource: "PersonalOverride",
        effectiveHomeLabelEn: "Leads",
        isPinned: false,
        pinSortOrder: null,
        accessibleItemCount: 2,
      }),
      new WorkspaceGroup({
        workspaceId: "ws-venue",
        workspaceKey: "venue",
        workspaceNameEn: "Venue",
        workspaceNameAr: "المرافق",
        workspaceIcon: "Building2",
        workspaceSortOrder: 2,
        colorHue: 145,
        colorChroma: 0.14,
        workspaceType: "Module",
        menuItems: [],
        isLocked: false,
        homeRoute: "/venue",
        platformHomeRoute: null,
        effectiveHomeRoute: "/venue/calendar",
        effectiveHomeMenuSlug: "venue-calendar",
        effectiveHomeSource: "WorkspaceHome",
        effectiveHomeLabelEn: "Calendar",
        isPinned: false,
        pinSortOrder: null,
        accessibleItemCount: 2,
      }),
    ];

    mockState.fetchLandingTargetCatalog.mockResolvedValue(
      new LandingTargetCatalog({
        scopeMode: "current_context",
        contextKey: mockState.activeContextKey,
        overviewAuthorized: true,
        workspaces: [
          {
            workspaceKey: "crm",
            workspaceNameEn: "CRM",
            workspaceNameAr: "المبيعات",
            workspaceIcon: "LayoutGrid",
            workspaceSortOrder: 1,
            workspaceType: "Module",
            contextScope: "TenantOnly",
            effectiveHomeRoute: "/crm/leads",
          },
          {
            workspaceKey: "venue",
            workspaceNameEn: "Venue",
            workspaceNameAr: "المرافق",
            workspaceIcon: "Building2",
            workspaceSortOrder: 2,
            workspaceType: "Module",
            contextScope: "TenantOnly",
            effectiveHomeRoute: "/venue/calendar",
          },
        ],
        items: [
          {
            workspaceKey: "crm",
            workspaceNameEn: "CRM",
            workspaceNameAr: "المبيعات",
            contextScope: "TenantOnly",
            slug: "crm-leads",
            nameEn: "Leads",
            nameAr: "العملاء",
            route: "/crm/leads",
            breadcrumbEn: ["CRM Operations"],
            breadcrumbAr: ["العمليات"],
          },
          {
            workspaceKey: "crm",
            workspaceNameEn: "CRM",
            workspaceNameAr: "المبيعات",
            contextScope: "TenantOnly",
            slug: "crm-pipeline",
            nameEn: "Pipeline",
            nameAr: "المسار",
            route: "/crm/pipeline",
            breadcrumbEn: ["CRM Operations"],
            breadcrumbAr: ["العمليات"],
          },
          {
            workspaceKey: "venue",
            workspaceNameEn: "Venue",
            workspaceNameAr: "المرافق",
            contextScope: "TenantOnly",
            slug: "venue-calendar",
            nameEn: "Calendar",
            nameAr: "التقويم",
            route: "/venue/calendar",
            breadcrumbEn: ["Scheduling"],
            breadcrumbAr: ["الجدولة"],
          },
        ],
      })
    );

    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <AccountPreferencesView />
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("workspace-start-pages-section")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId("workspace-start-picker-crm"));
    await waitFor(() => {
      expect(screen.getByRole("option", { name: /Pipeline/i })).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole("option", { name: /Pipeline/i }));

    await waitFor(() => {
      expect(mockState.setWorkspaceStartPage).toHaveBeenCalledWith("crm", "menu:crm-pipeline");
      expect(mockState.refreshNavigation).toHaveBeenCalled();
    });

    fireEvent.click(screen.getByTestId("workspace-start-reset-crm"));
    await waitFor(() => {
      expect(mockState.resetWorkspaceStartPage).toHaveBeenCalledWith("crm");
    });
  });
});
