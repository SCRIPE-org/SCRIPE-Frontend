import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TenantIdentityProvidersTab } from "../components/tabs/TenantIdentityProvidersTab";
import { en as tenantsEn } from "../../../locales/tenants.en";
import { ar as tenantsAr } from "../../../locales/tenants.ar";
import type {
  TenantIdentityProviderDetail,
  TenantIdentityProviderListItem,
} from "../../domain/entities/TenantIdentityProvider";

const {
  mockGetIdentityProviders,
  mockGetIdentityProviderById,
  mockCreateIdentityProvider,
  mockUpdateIdentityProvider,
  mockDeleteIdentityProvider,
  mockTestIdentityProviderConnection,
  mockToast,
} = vi.hoisted(() => ({
  mockGetIdentityProviders: vi.fn(),
  mockGetIdentityProviderById: vi.fn(),
  mockCreateIdentityProvider: vi.fn(),
  mockUpdateIdentityProvider: vi.fn(),
  mockDeleteIdentityProvider: vi.fn(),
  mockTestIdentityProviderConnection: vi.fn(),
  mockToast: vi.fn(),
}));

vi.mock("@core/providers/i18n-provider", () => ({
  useI18n: () => ({
    t: (key: string, vars?: Record<string, unknown>) =>
      vars ? `${key}:${JSON.stringify(vars)}` : key,
    direction: "ltr" as const,
    language: "en" as const,
    isRtl: false,
    setLanguage: vi.fn(),
  }),
}));

vi.mock("@core/hooks/use-enhanced-toast", () => ({
  useEnhancedToast: () => ({
    toast: mockToast,
    operationSuccess: vi.fn(),
    operationError: vi.fn(),
  }),
}));

vi.mock("@modules/identity/di", () => ({
  identityContainer: {
    tenantRepository: {
      getIdentityProviders: (...args: unknown[]) => mockGetIdentityProviders(...args),
      getIdentityProviderById: (...args: unknown[]) => mockGetIdentityProviderById(...args),
      createIdentityProvider: (...args: unknown[]) => mockCreateIdentityProvider(...args),
      updateIdentityProvider: (...args: unknown[]) => mockUpdateIdentityProvider(...args),
      deleteIdentityProvider: (...args: unknown[]) => mockDeleteIdentityProvider(...args),
      testIdentityProviderConnection: (...args: unknown[]) =>
        mockTestIdentityProviderConnection(...args),
    },
  },
}));

function renderWithQueryClient(ui: React.ReactElement) {
  const client = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>);
}

const sampleProvider: TenantIdentityProviderListItem = {
  id: "idp-ahly-okta",
  name: "Al-Ahly Okta",
  slug: "ahly-okta",
  protocol: "oidc",
  enabledForAdmins: true,
  enabledForUsers: false,
  isActive: true,
  trustIdpMfa: true,
  displayOrder: 1,
  iconUrl: null,
  buttonColor: "#c6ff00",
  createdAt: "2026-11-01T00:00:00Z",
};

const sampleDetail: TenantIdentityProviderDetail = {
  ...sampleProvider,
  tenantId: "enc_ahly",
  authority: "https://ahly.okta.com",
  authorizationEndpoint: null,
  tokenEndpoint: null,
  userInformationEndpoint: null,
  clientId: "okta-client-1",
  hasClientSecret: true,
  scopes: "openid email profile",
  redirectUri: null,
  samlIdpEntityId: null,
  samlSsoUrl: null,
  samlCertificate: null,
  claimMappingJson: null,
  buttonLabel: "Sign in with Okta",
  modifiedAt: null,
  rowVersion: "AAAAAQ==",
};

describe("TenantIdentityProvidersTab (BAM-03)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetIdentityProviders.mockResolvedValue({
      items: [sampleProvider],
      totalCount: 1,
      pageNumber: 1,
      pageSize: 100,
      totalPages: 1,
      hasNextPage: false,
      hasPreviousPage: false,
    });
  });

  it("loads and renders tenant-scoped identity providers with protocol and Trust IdP MFA badges", async () => {
    renderWithQueryClient(
      <TenantIdentityProvidersTab tenantId="enc_ahly" tenantName="Al-Ahly" />
    );

    await waitFor(() => {
      expect(screen.getByText("Al-Ahly Okta")).toBeInTheDocument();
    });

    expect(mockGetIdentityProviders).toHaveBeenCalledWith("enc_ahly", {
      page: 1,
      pageSize: 100,
      search: undefined,
    });
    expect(screen.getByText("tenant.idpProtocolOidcShort")).toBeInTheDocument();
    expect(screen.getByText("tenant.idpMfaTrustedBadge")).toBeInTheDocument();
  });

  it("runs Test Connection and renders discovered issuer diagnostics inline", async () => {
    mockTestIdentityProviderConnection.mockResolvedValueOnce({
      isSuccess: true,
      message: "OIDC discovery document validated",
      discoveredIssuer: "https://ahly.okta.com",
      discoveredEndpoints: ["authorization_endpoint", "token_endpoint"],
    });

    renderWithQueryClient(
      <TenantIdentityProvidersTab tenantId="enc_ahly" tenantName="Al-Ahly" />
    );

    await waitFor(() => {
      expect(screen.getByText("Al-Ahly Okta")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: "tenant.idpTestConnection" }));

    await waitFor(() => {
      expect(mockTestIdentityProviderConnection).toHaveBeenCalledWith("enc_ahly", "idp-ahly-okta");
      expect(screen.getByText("OIDC discovery document validated")).toBeInTheDocument();
    });
  });

  it("toggles active switch with optimistic update, preserves clientSecret=null & rowVersion, and rolls back on failure", async () => {
    mockGetIdentityProviderById.mockResolvedValueOnce(sampleDetail);
    mockUpdateIdentityProvider.mockRejectedValueOnce(new Error("Concurrency conflict"));

    renderWithQueryClient(
      <TenantIdentityProvidersTab tenantId="enc_ahly" tenantName="Al-Ahly" />
    );

    await waitFor(() => {
      expect(screen.getByText("Al-Ahly Okta")).toBeInTheDocument();
    });

    const toggleSwitch = screen.getByRole("switch", {
      name: 'tenant.idpToggleActiveAria:{"name":"Al-Ahly Okta"}',
    });
    expect(toggleSwitch).toHaveAttribute("aria-checked", "true");

    fireEvent.click(toggleSwitch);

    await waitFor(() => {
      expect(mockUpdateIdentityProvider).toHaveBeenCalledWith(
        "enc_ahly",
        "idp-ahly-okta",
        expect.objectContaining({
          isActive: false,
          clientSecret: null,
          rowVersion: "AAAAAQ==",
          trustIdpMfa: true,
        })
      );
    });

    // Rolled back to true after error
    await waitFor(() => {
      expect(toggleSwitch).toHaveAttribute("aria-checked", "true");
    });
    expect(mockToast).toHaveBeenCalledWith(
      expect.objectContaining({
        variant: "destructive",
        description: "Concurrency conflict",
      })
    );
  });

  it("opens Create dialog and submits new provider payload", async () => {
    mockCreateIdentityProvider.mockResolvedValueOnce({ id: "idp-new" });

    renderWithQueryClient(
      <TenantIdentityProvidersTab tenantId="enc_ahly" tenantName="Al-Ahly" />
    );

    await waitFor(() => {
      expect(screen.getByText("Al-Ahly Okta")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: "tenant.idpAddButton" }));

    const nameInput = document.getElementById("tenant-idp-name") as HTMLInputElement;
    fireEvent.change(nameInput, { target: { value: "Club Entra ID" } });

    const slugInput = document.getElementById("tenant-idp-slug") as HTMLInputElement;
    expect(slugInput.value).toBe("club-entra-id");

    fireEvent.click(screen.getByRole("button", { name: "tenant.idpCreateAction" }));

    await waitFor(() => {
      expect(mockCreateIdentityProvider).toHaveBeenCalledWith(
        "enc_ahly",
        expect.objectContaining({
          name: "Club Entra ID",
          slug: "club-entra-id",
          protocol: "oidc",
          isActive: true,
          trustIdpMfa: false,
          enabledForAdmins: true,
        })
      );
    });
  });

  it("exposes polished Require 2FA label and descriptive Password Expiry Help copy in EN and AR locales", () => {
    expect(tenantsEn.tenant.require2FA).toBe("Require 2FA");
    expect(tenantsEn.tenant.passwordExpiryHelp).not.toBe("Password Expiry Help");
    expect(tenantsEn.tenant.passwordExpiryHelp.length).toBeGreaterThan(20);
    expect(tenantsAr.tenant.passwordExpiryHelp.length).toBeGreaterThan(20);
  });

  it("keeps search input mounted on refetch, shows filtered empty state with clear button, and uses PasswordInput dir=ltr", async () => {
    mockGetIdentityProviders
      .mockResolvedValueOnce({
        items: [sampleProvider],
        totalCount: 1,
        pageNumber: 1,
        pageSize: 100,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      })
      .mockResolvedValue({
        items: [],
        totalCount: 0,
        pageNumber: 1,
        pageSize: 100,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      });

    renderWithQueryClient(
      <TenantIdentityProvidersTab tenantId="enc_ahly" tenantName="Al-Ahly" />
    );

    await waitFor(() => {
      expect(screen.getByText("Al-Ahly Okta")).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(
      "tenant.idpSearchPlaceholder"
    ) as HTMLInputElement;
    searchInput.focus();
    fireEvent.change(searchInput, { target: { value: "nonexistent-idp" } });

    expect(screen.getByPlaceholderText("tenant.idpSearchPlaceholder")).toBe(searchInput);

    await waitFor(() => {
      expect(screen.getByText("tenant.idpNoMatchingTitle")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: "tenant.idpClearSearch" }));
    expect(searchInput.value).toBe("");

    fireEvent.click(screen.getByRole("button", { name: "tenant.idpAddButton" }));
    const secretInput = document.getElementById("tenant-idp-client-secret") as HTMLInputElement;
    expect(secretInput).toHaveAttribute("type", "password");
    expect(secretInput).toHaveAttribute("dir", "ltr");
    expect(document.getElementById("tenant-idp-authority")).toHaveAttribute("dir", "ltr");
  });
});
