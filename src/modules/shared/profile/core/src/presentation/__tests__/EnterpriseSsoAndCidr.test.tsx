import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConnectedEnterpriseSsoCard } from "../components/ConnectedEnterpriseSsoCard";
import { SecurityAdvancedShieldSection } from "../components/SecurityAdvancedShieldSection";
import { DelegationScopeChecklistField } from "../sections/governance/DelegationScopeChecklistField";
import { mapSecuritySlice } from "../../data/mappers/SovereignAccountIdentityMapper";
import { ProfileRepository } from "../../data/repositories/ProfileRepository";
import { SecurityRepository } from "../../data/repositories/SecurityRepository";
import { PROFILE_ENDPOINTS } from "../../data/services/profile.endpoints";
import { useAppStore } from "@core/store/useAppStore";
import { useSudoStore } from "@core/store/useSudoStore";
import { SYSTEM_PERMISSIONS } from "@core/common/types/permissions";
import type { IApiService } from "@core/interfaces/api.interface";

const mockGetExternalLogins = vi.fn();
const mockInitiateExternalLoginLink = vi.fn();
const mockUnlinkExternalLogin = vi.fn();
const mockGetSecurity = vi.fn();
const mockRouterReplace = vi.fn();
const mockToastSuccess = vi.fn();
const mockToastError = vi.fn();
const mockToastWarning = vi.fn();

let currentSearchParams = new URLSearchParams();

vi.mock("@modules/profile/di", () => ({
  container: {
    profileRepository: {
      getExternalLogins: () => mockGetExternalLogins(),
      initiateExternalLoginLink: (
        data: { identityProviderId: string; redirectUri?: string },
        sudoToken?: string
      ) => mockInitiateExternalLoginLink(data, sudoToken),
      unlinkExternalLogin: (id: string, sudoToken?: string) =>
        mockUnlinkExternalLogin(id, sudoToken),
    },
    sovereignAccountRepository: {
      getContext: vi.fn(),
      getSecurity: () => mockGetSecurity(),
      updateSecurityPosture: vi.fn(),
    },
    securityRepository: {},
  },
}));

vi.mock("@core/providers/i18n-provider", () => ({
  useI18n: () => ({
    t: (key: string, params?: Record<string, string | number>) =>
      params ? `${key}:${JSON.stringify(params)}` : key,
    direction: "ltr" as const,
    language: "en" as const,
    isRtl: false,
    setLanguage: vi.fn(),
  }),
}));

vi.mock("@core/ui/sileo-toast", () => ({
  toast: {
    success: (...args: unknown[]) => mockToastSuccess(...args),
    error: (...args: unknown[]) => mockToastError(...args),
    warning: (...args: unknown[]) => mockToastWarning(...args),
  },
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/account/security",
  useRouter: () => ({ replace: mockRouterReplace, push: vi.fn() }),
  useSearchParams: () => currentSearchParams,
}));

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...props
  }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock("next/image", () => ({
  default: ({ src, alt }: { src: string; alt: string }) => (
    <span data-testid="next-image-mock" data-src={src} aria-label={alt} />
  ),
}));

function createWrapper() {
  const client = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  }
  return { client, Wrapper };
}

describe("Enterprise SSO Live DB Federation & CIDR Anti-Lockout Flow", () => {
  const originalLocation = window.location;

  beforeEach(() => {
    vi.clearAllMocks();
    currentSearchParams = new URLSearchParams();
    sessionStorage.clear();

    useAppStore.setState({
      permissions: [],
      user: { id: "u-1", username: "admin", isSuperAdmin: false } as never,
    });
    useSudoStore.getState().reset();

    Object.defineProperty(window, "location", {
      configurable: true,
      writable: true,
      value: {
        ...originalLocation,
        origin: "http://localhost:3000",
        href: "http://localhost:3000/account/security",
      },
    });
  });

  afterEach(() => {
    Object.defineProperty(window, "location", {
      configurable: true,
      writable: true,
      value: originalLocation,
    });
  });

  it("maps availableSsoProviders sorted by displayOrder from AccountSecurityDto", () => {
    const slice = mapSecuritySlice({
      isTwoFactorEnabled: true,
      availableSsoProviders: [
        {
          encryptedId: "enc-2",
          name: "Corporate SAML",
          slug: "corp-saml",
          protocol: "saml",
          scope: "Organization",
          displayOrder: 2,
          isLinked: false,
        },
        {
          encryptedId: "enc-1",
          name: "Google Workspace",
          slug: "google",
          protocol: "oidc",
          scope: "Global",
          displayOrder: 1,
          isLinked: true,
          linkedEmail: "ali@scripe.io",
          linkedAtUtc: "2026-01-15T10:00:00Z",
          externalLoginId: "ext-101",
        },
      ],
    });

    expect(slice.availableSsoProviders).toHaveLength(2);
    expect(slice.availableSsoProviders[0].slug).toBe("google");
    expect(slice.availableSsoProviders[0].isLinked).toBe(true);
    expect(slice.availableSsoProviders[0].externalLoginId).toBe("ext-101");
    expect(slice.availableSsoProviders[1].slug).toBe("corp-saml");
    expect(slice.availableSsoProviders[1].scope).toBe("Organization");
  });

  it("renders ONLY live DB providers + orphaned disabled logins without hardcoded catalog entries", async () => {
    mockGetSecurity.mockResolvedValue({
      isTwoFactorEnabled: true,
      isTwoFactorFeatureEnabled: true,
      isSsoFeatureEnabled: true,
      isSecurityPageEnabled: true,
      backupCodesRemaining: 0,
      passkeyCount: 0,
      hardwareKeyCount: 0,
      securityPostureScore: 80,
      postureChecklist: [],
      trustedCidrs: [],
      isCurrentIpAllowed: true,
      sudoActive: true,
      availableSsoProviders: [
        {
          encryptedId: "enc-github",
          name: "GitHub Enterprise",
          slug: "github-ent",
          protocol: "oauth2",
          scope: "Global",
          displayOrder: 1,
          isLinked: true,
          linkedEmail: "dev@scripe.io",
          linkedAtUtc: "2026-02-01T12:00:00Z",
          externalLoginId: "ext-gh",
        },
      ],
    });
    mockGetExternalLogins.mockResolvedValue([
      {
        id: "ext-gh",
        providerName: "GitHub Enterprise",
        providerKey: "gh-123",
        email: "dev@scripe.io",
        displayName: null,
        linkedAt: new Date("2026-02-01T12:00:00Z"),
        lastUsedAt: null,
      },
      {
        id: "ext-legacy",
        providerName: "Retired Okta",
        providerKey: "okta-999",
        email: "legacy@scripe.io",
        displayName: null,
        linkedAt: new Date("2025-11-01T09:00:00Z"),
        lastUsedAt: null,
      },
    ]);

    const { Wrapper } = createWrapper();
    render(<ConnectedEnterpriseSsoCard />, { wrapper: Wrapper });

    await waitFor(() => {
      expect(screen.getByTestId("enterprise-sso-tile-github-ent")).toBeInTheDocument();
    });

    // Live DB provider shows OAuth 2.0 + Global + linked email
    expect(screen.getByText("GitHub Enterprise")).toBeInTheDocument();
    expect(screen.getByText("OAuth 2.0")).toBeInTheDocument();
    expect(screen.getByText("profile.security.ssoScopeGlobal")).toBeInTheDocument();
    expect(screen.getByText("dev@scripe.io")).toBeInTheDocument();

    // No hardcoded Microsoft Entra ID or Google Workspace catalog items
    expect(screen.queryByText("Microsoft Entra ID")).not.toBeInTheDocument();
    expect(screen.queryByText("Google Workspace")).not.toBeInTheDocument();

    // Orphaned legacy login is rendered with Disabled / Archived badge
    expect(screen.getByTestId("orphaned-sso-tile-ext-legacy")).toBeInTheDocument();
    expect(screen.getByText("Retired Okta")).toBeInTheDocument();
    expect(screen.getByText("profile.security.ssoProviderDisabledBadge")).toBeInTheDocument();
  });

  it("shows Nexus empty state with permission-gated link to /settings/identity-providers", async () => {
    mockGetSecurity.mockResolvedValue({
      isTwoFactorEnabled: false,
      isSsoFeatureEnabled: true,
      isSecurityPageEnabled: true,
      backupCodesRemaining: 0,
      passkeyCount: 0,
      hardwareKeyCount: 0,
      securityPostureScore: 50,
      postureChecklist: [],
      trustedCidrs: [],
      isCurrentIpAllowed: true,
      sudoActive: false,
      availableSsoProviders: [],
    });
    mockGetExternalLogins.mockResolvedValue([]);

    const { Wrapper } = createWrapper();
    const { rerender } = render(<ConnectedEnterpriseSsoCard />, { wrapper: Wrapper });

    await waitFor(() => {
      expect(screen.getByTestId("sso-empty-state")).toBeInTheDocument();
    });
    expect(screen.queryByTestId("configure-sso-providers-link")).not.toBeInTheDocument();

    useAppStore.setState({
      permissions: [SYSTEM_PERMISSIONS.IDENTITY_PROVIDERS_VIEW],
    });
    rerender(<ConnectedEnterpriseSsoCard />);
    expect(screen.getByTestId("configure-sso-providers-link")).toHaveAttribute(
      "href",
      "/settings/identity-providers"
    );
  });

  it("initiates Sudo-gated federated link without email/callback hints, sets sessionStorage, and redirects", async () => {
    mockGetSecurity.mockResolvedValue({
      isTwoFactorEnabled: true,
      isSsoFeatureEnabled: true,
      isSecurityPageEnabled: true,
      backupCodesRemaining: 0,
      passkeyCount: 0,
      hardwareKeyCount: 0,
      securityPostureScore: 90,
      postureChecklist: [],
      trustedCidrs: [],
      isCurrentIpAllowed: true,
      sudoActive: true,
      availableSsoProviders: [
        {
          encryptedId: "enc-oidc-1",
          name: "Okta Workforce",
          slug: "okta",
          protocol: "oidc",
          scope: "Organization",
          displayOrder: 1,
          isLinked: false,
        },
      ],
    });
    mockGetExternalLogins.mockResolvedValue([]);
    mockInitiateExternalLoginLink.mockResolvedValue({
      authorizationUrl: "https://idp.okta.example/authorize?state=st-42",
      protocol: "oidc",
      state: "st-42",
    });

    useSudoStore.getState().markVerified({
      sudoToken: "sudo-hdr-xyz",
      expiresAtUtc: new Date(Date.now() + 600_000).toISOString(),
      methodUsed: "passkey",
    });

    const { Wrapper } = createWrapper();
    render(<ConnectedEnterpriseSsoCard />, { wrapper: Wrapper });

    await waitFor(() => {
      expect(screen.getByTestId("connect-sso-okta")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId("connect-sso-okta"));
    expect(screen.getByTestId("enterprise-sso-connect-dialog")).toBeInTheDocument();

    // Old raw email input & dead /api/v1/auth/callback/oidc hint must NEVER exist
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
    expect(screen.queryByText(/\/api\/v1\/auth\/callback\/oidc/i)).not.toBeInTheDocument();

    fireEvent.click(screen.getByTestId("initiate-sso-handshake-btn"));

    await waitFor(() => {
      expect(mockInitiateExternalLoginLink).toHaveBeenCalledWith(
        {
          identityProviderId: "enc-oidc-1",
          redirectUri: "http://localhost:3000/sso/callback",
        },
        "sudo-hdr-xyz"
      );
    });

    expect(sessionStorage.getItem("sso_linking")).toBe("true");
    expect(sessionStorage.getItem("sso_linking_origin")).toBe("/account/security");
    expect(sessionStorage.getItem("sso_provider_id")).toBe("enc-oidc-1");
    expect(sessionStorage.getItem("sso_state")).toBe("st-42");
    expect(window.location.href).toBe("https://idp.okta.example/authorize?state=st-42");
  });

  it("handles ?ssoLinked=success return by toasting, invalidating queries, and cleaning URL", async () => {
    currentSearchParams = new URLSearchParams("ssoLinked=success&tab=security");
    mockGetSecurity.mockResolvedValue({
      isTwoFactorEnabled: true,
      isSsoFeatureEnabled: true,
      isSecurityPageEnabled: true,
      backupCodesRemaining: 0,
      passkeyCount: 0,
      hardwareKeyCount: 0,
      securityPostureScore: 90,
      postureChecklist: [],
      trustedCidrs: [],
      isCurrentIpAllowed: true,
      sudoActive: true,
      availableSsoProviders: [],
    });
    mockGetExternalLogins.mockResolvedValue([]);

    const { client, Wrapper } = createWrapper();
    const invalidateSpy = vi.spyOn(client, "invalidateQueries");
    render(<ConnectedEnterpriseSsoCard />, { wrapper: Wrapper });

    await waitFor(() => {
      expect(mockToastSuccess).toHaveBeenCalledWith("profile.security.ssoAccountLinkedNotice");
      expect(screen.getByTestId("sso-callback-status-alert")).toBeInTheDocument();
    });

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["profile", "external-logins"] });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["sovereign-account", "security"] });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["sovereign-account", "context"] });
    expect(mockRouterReplace).toHaveBeenCalledWith("/account/security?tab=security", {
      scroll: false,
    });
  });

  it("displays currentClientIp quick-add (/32) helper button and surfaces anti-lockout backend errors", async () => {
    const antiLockoutError = Object.assign(new Error("Save failed"), {
      details: {
        detail: "Anti-lockout guard: Your current IP 203.0.113.10 would be blocked by these CIDRs.",
      },
    });
    const onUpdatePolicy = vi.fn().mockRejectedValueOnce(antiLockoutError);

    render(
      <SecurityAdvancedShieldSection
        trustedCidrs={[]}
        currentClientIp="203.0.113.10"
        rowVersion="rv-1"
        onUpdatePolicy={onUpdatePolicy}
        isUpdatingPolicy={false}
        onOpenLockdown={vi.fn()}
      />
    );

    const quickAddBtn = screen.getByTestId("use-current-ip-btn");
    expect(quickAddBtn.textContent).toContain("203.0.113.10/32");

    fireEvent.click(quickAddBtn);
    expect(screen.getByText("203.0.113.10/32")).toBeInTheDocument();

    fireEvent.click(screen.getByTestId("save-security-shield-btn"));

    await waitFor(() => {
      const banner = screen.getByTestId("cidr-validation-error-banner");
      expect(banner.textContent).toContain("Anti-lockout guard: Your current IP 203.0.113.10");
      expect(mockToastError).toHaveBeenCalled();
    });
  });

  it("forwards X-Sudo-Token headers on ProfileRepository and SecurityRepository passkey registration calls", async () => {
    const api: IApiService = {
      get: vi.fn(),
      post: vi.fn().mockResolvedValue({
        authorizationUrl: "https://idp.test/auth",
        protocol: "oidc",
        state: "s1",
        challenge: "c1",
        rpId: "localhost",
        id: "pk-1",
        deviceName: "Laptop",
        createdAt: "2026-01-01T00:00:00Z",
      }),
      put: vi.fn(),
      patch: vi.fn(),
      delete: vi.fn().mockResolvedValue(undefined),
    } as unknown as IApiService;

    const profileRepo = new ProfileRepository(api);
    await profileRepo.initiateExternalLoginLink(
      { identityProviderId: "idp-enc", redirectUri: "http://localhost:3000/sso/callback" },
      "tok-1"
    );
    expect(api.post).toHaveBeenCalledWith(
      PROFILE_ENDPOINTS.INITIATE_EXTERNAL_LOGIN_LINK,
      { identityProviderId: "idp-enc", redirectUri: "http://localhost:3000/sso/callback" },
      undefined,
      { headers: { "X-Sudo-Token": "tok-1" } }
    );

    await profileRepo.unlinkExternalLogin("ext-1", "tok-2");
    expect(api.delete).toHaveBeenCalledWith(
      PROFILE_ENDPOINTS.UNLINK_EXTERNAL_LOGIN("ext-1"),
      undefined,
      { headers: { "X-Sudo-Token": "tok-2" } }
    );

    const securityRepo = new SecurityRepository(api);
    await securityRepo.beginPasskeyRegistration("MacBook", "platform", "tok-3");
    expect(api.post).toHaveBeenCalledWith(
      PROFILE_ENDPOINTS.PASSKEYS.REGISTER_BEGIN,
      { deviceName: "MacBook", mode: "platform" },
      undefined,
      { headers: { "X-Sudo-Token": "tok-3" } }
    );
  });

  it("DelegationScopeChecklistField renders @core/ui/label primitives for scope items", () => {
    const { container } = render(
      <DelegationScopeChecklistField
        t={(k) => k}
        selectedScopes={["users.read"]}
        availableScopeCodes={["users.read", "users.write"]}
        filteredModalScopes={["users.read", "users.write"]}
        scopeSearch=""
        justification=""
        onScopeSearchChange={vi.fn()}
        onToggleScope={vi.fn()}
        onSelectAllScopes={vi.fn()}
        onClearScopes={vi.fn()}
        onJustificationChange={vi.fn()}
      />
    );
    const scopeLabels = container.querySelectorAll("label.text-nx-ink-2");
    expect(scopeLabels.length).toBeGreaterThanOrEqual(2);
  });
});
