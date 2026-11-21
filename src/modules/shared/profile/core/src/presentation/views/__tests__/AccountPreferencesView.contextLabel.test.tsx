import React from "react";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import "@testing-library/jest-dom";
import type { TenantContextType } from "@core/providers/tenant-context-provider";
import type { SovereignAccountContext } from "../../../domain/entities/SovereignAccountEntities";
import { AccountPreferencesView } from "../AccountPreferencesView";

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
    workspaceGroups: [],
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
});
