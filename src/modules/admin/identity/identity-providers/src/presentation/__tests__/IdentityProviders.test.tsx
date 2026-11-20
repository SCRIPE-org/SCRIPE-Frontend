import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor, renderHook, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { IdentityProvidersView } from "../views/IdentityProvidersView";
import { IdentityProviderDetailView } from "../views/IdentityProviderDetailView";
import { useIdentityProviderDetailViewModel } from "../viewmodels/useIdentityProviderDetailViewModel";
import { CallbackUrlCard } from "../components/CallbackUrlCard";
import { IdentityProviderCard } from "../components/IdentityProviderCard";
import { SSOButtonPreview } from "../components/SSOButtonPreview";
import {
  AccessControlSection,
  AppearanceSection,
  OidcConfigSection,
} from "../components/IdentityProviderFormSections";
import { PROVIDER_TEMPLATES } from "../components/WellKnownProviderGallery";
import { IdentityProviderMapper } from "../../data/mappers/IdentityProviderMapper";
import { IdentityProvider, IdentityProviderListItem } from "../../domain/entities/IdentityProvider";
import { useAppStore } from "@core/store/useAppStore";

const mockGetAll = vi.fn();
const mockGetById = vi.fn();
const mockCreate = vi.fn();
const mockUpdate = vi.fn();
const mockRemove = vi.fn();
const mockTestConnection = vi.fn();
const mockToastSuccess = vi.fn();
const mockToastError = vi.fn();

vi.mock("@modules/identity/di", () => ({
  identityContainer: {
    identityProviderRepository: {
      getAll: (params: unknown) => mockGetAll(params),
      getById: (id: string) => mockGetById(id),
      create: (data: unknown) => mockCreate(data),
      update: (id: string, data: unknown) => mockUpdate(id, data),
      remove: (id: string) => mockRemove(id),
      testConnection: (id: string) => mockTestConnection(id),
    },
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

vi.mock("@core/hooks/use-module-locales", () => ({
  useModuleLocales: vi.fn(),
}));

vi.mock("@core/hooks/use-enhanced-toast", () => ({
  useEnhancedToast: () => ({
    success: mockToastSuccess,
    error: mockToastError,
    toast: vi.fn(),
  }),
}));

vi.mock("@core/hooks/use-resolved-file-url", () => ({
  useResolvedFileUrl: (url: string | null | undefined) => url ?? null,
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));

vi.mock("next/image", () => ({
  default: ({ src, alt }: { src: string; alt: string }) => (
    <span data-testid="next-image-mock" data-src={src} aria-label={alt} />
  ),
}));

function renderWithQuery(ui: React.ReactElement) {
  const client = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>);
}

describe("Identity Providers Admin CRUD, Diagnostics & Callback URLs", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAppStore.setState({
      _hasHydrated: true,
      permissions: ["*"],
      user: { id: "u-1", username: "superadmin", isSuperAdmin: true } as never,
    });
  });

  it("toggles isActive optimistically with rollback + error toast on failure, and renders Test Connection diagnostics", async () => {
    const providerItem = new IdentityProviderListItem({
      id: "idp-1",
      name: "Okta Corp",
      slug: "okta-corp",
      protocol: "oidc",
      enabledForAdmins: true,
      enabledForUsers: true,
      isActive: true,
      trustIdpMfa: true,
      displayOrder: 1,
      iconUrl: null,
      buttonColor: "#007DC1",
      createdAt: "2026-01-01T00:00:00Z",
    });

    mockGetAll.mockResolvedValue({
      items: [providerItem],
      totalCount: 1,
    });

    let rejectUpdate!: (err: Error) => void;
    mockUpdate.mockImplementationOnce(
      () =>
        new Promise((_resolve, reject) => {
          rejectUpdate = reject;
        })
    );

    mockTestConnection.mockResolvedValue({
      isSuccess: true,
      message: "OIDC discovery metadata verified (RS256).",
      discoveredIssuer: "https://okta.example.com",
      discoveredEndpoints: [
        "https://okta.example.com/oauth2/v1/authorize",
        "https://okta.example.com/oauth2/v1/token",
      ],
    });

    renderWithQuery(<IdentityProvidersView />);

    await waitFor(() => {
      expect(screen.getByTestId("identity-provider-card-okta-corp")).toBeInTheDocument();
    });

    // Trust IdP MFA badge renders cleanly on card
    expect(screen.getByText("identityProviders.badgeTrustMfa")).toBeInTheDocument();

    // Toggle switch triggers optimistic UI flip then rolls back when rejected
    const activeSwitch = screen.getByTestId("toggle-active-switch-okta-corp");
    expect(activeSwitch).toHaveAttribute("aria-checked", "true");
    fireEvent.click(activeSwitch);

    await waitFor(() => {
      expect(screen.getByTestId("toggle-active-switch-okta-corp")).toHaveAttribute(
        "aria-checked",
        "false"
      );
    });

    rejectUpdate(new Error("403 forbidden"));

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith(
        expect.objectContaining({
          description: "identityProviders.toggleStatusError",
        })
      );
      expect(screen.getByTestId("toggle-active-switch-okta-corp")).toHaveAttribute(
        "aria-checked",
        "true"
      );
    });

    // Test Connection shows full diagnostic banner with issuer and discovered endpoints
    fireEvent.click(screen.getByTestId("test-connection-btn-okta-corp"));
    await waitFor(() => {
      const panel = screen.getByTestId("test-connection-diagnostics-panel");
      expect(panel).toBeInTheDocument();
      expect(panel.textContent).toContain("OIDC discovery metadata verified (RS256).");
      expect(panel.textContent).toContain("https://okta.example.com");
      expect(panel.textContent).toContain("https://okta.example.com/oauth2/v1/authorize");
    });
  });

  it("CallbackUrlCard shows informative Create note without {providerId}, and uses http://localhost:5035/api fallback in Edit mode", () => {
    const prevApiUrl = process.env.NEXT_PUBLIC_API_URL;
    delete process.env.NEXT_PUBLIC_API_URL;

    const { rerender } = render(<CallbackUrlCard protocol="saml" />);
    expect(screen.getByTestId("callback-create-mode-note")).toBeInTheDocument();
    expect(screen.getByText("identityProviders.saveProviderFirstAcsNote")).toBeInTheDocument();
    expect(screen.queryByTestId("saml-acs-url-input")).not.toBeInTheDocument();

    rerender(<CallbackUrlCard protocol="saml" providerId="enc-idp-99" />);
    const acsInput = screen.getByTestId("saml-acs-url-input") as HTMLInputElement;
    expect(acsInput.value).toBe("http://localhost:5035/api/v1/auth/saml/acs/enc-idp-99");

    rerender(<CallbackUrlCard protocol="oidc" providerId="enc-idp-99" />);
    const oidcInput = screen.getByTestId("standard-callback-url-input") as HTMLInputElement;
    expect(oidcInput.value).toMatch(/\/sso\/callback$/);

    if (prevApiUrl !== undefined) {
      process.env.NEXT_PUBLIC_API_URL = prevApiUrl;
    }
  });

  it("maps trustIdpMfa + rowVersion, strips blank clientSecret, wires trustIdpMfa switch, and populates GitHub OAuth2 endpoints", () => {
    const entity = IdentityProviderMapper.fromJsonToEntity({
      id: "00000000-0000-0000-0000-000000000042",
      name: "GitHub",
      slug: "github",
      protocol: "oauth2",
      tenantId: null,
      authority: "https://github.com",
      authorizationEndpoint: "https://github.com/login/oauth/authorize",
      tokenEndpoint: "https://github.com/login/oauth/access_token",
      userInformationEndpoint: "https://api.github.com/user",
      clientId: "cid",
      hasClientSecret: true,
      scopes: "user:email",
      redirectUri: null,
      samlIdpEntityId: null,
      samlSsoUrl: null,
      samlCertificate: null,
      claimMappingJson: "{}",
      enabledForAdmins: true,
      enabledForUsers: true,
      iconUrl: null,
      buttonColor: "#24292E",
      buttonLabel: "Continue with GitHub",
      displayOrder: 3,
      isActive: true,
      trustIdpMfa: true,
      rowVersion: "AQAAAA==",
      createdAt: "2026-01-01T00:00:00Z",
      modifiedAt: null,
    });

    expect(entity.trustIdpMfa).toBe(true);
    expect(entity.rowVersion).toBe("AQAAAA==");

    const updatePayload = IdentityProviderMapper.toUpdateJson({
      name: "GitHub",
      clientSecret: "   ",
      isActive: false,
      trustIdpMfa: true,
      rowVersion: "AQAAAA==",
    });
    expect(updatePayload.clientSecret).toBeUndefined();
    expect(updatePayload.rowVersion).toBe("AQAAAA==");
    expect(updatePayload.trustIdpMfa).toBe(true);
    expect(updatePayload.isActive).toBe(false);

    // GitHub preset has explicit OAuth2 endpoints & enabledForAdmins: true
    const githubTpl = PROVIDER_TEMPLATES.find((t) => t.id === "github");
    expect(githubTpl?.preset.protocol).toBe("oauth2");
    expect(githubTpl?.preset.authorizationEndpoint).toBe(
      "https://github.com/login/oauth/authorize"
    );
    expect(githubTpl?.preset.tokenEndpoint).toBe("https://github.com/login/oauth/access_token");
    expect(githubTpl?.preset.userInformationEndpoint).toBe("https://api.github.com/user");
    expect(githubTpl?.preset.enabledForAdmins).toBe(true);

    // AccessControlSection toggles trustIdpMfa
    const updateField = vi.fn();
    render(
      <AccessControlSection
        form={{
          name: "GitHub",
          slug: "github",
          protocol: "oauth2",
          displayOrder: 1,
          isActive: true,
          authority: "",
          clientId: "",
          clientSecret: "",
          scopes: "openid",
          redirectUri: "",
          iconUrl: "",
          buttonColor: "#4285F4",
          buttonLabel: "",
          enabledForAdmins: true,
          enabledForUsers: true,
          trustIdpMfa: false,
          rowVersion: null,
          claimMappingJson: "{}",
        }}
        updateField={updateField}
        protocolOptions={[]}
        isCreateMode={false}
      />
    );

    fireEvent.click(screen.getByTestId("trust-idp-mfa-switch"));
    expect(updateField).toHaveBeenCalledWith("trustIdpMfa", true);
  });

  it("useIdentityProviderDetailViewModel defaults enabledForAdmins=true and forwards trustIdpMfa, isActive, rowVersion without blank clientSecret", async () => {
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    );

    const createHook = renderHook(() => useIdentityProviderDetailViewModel(), { wrapper });
    expect(createHook.result.current.form.enabledForAdmins).toBe(true);
    expect(createHook.result.current.form.enabledForUsers).toBe(true);
    expect(createHook.result.current.form.trustIdpMfa).toBe(false);

    mockGetById.mockResolvedValue(
      new IdentityProvider({
        id: "idp-edit-1",
        name: "Azure Entra",
        slug: "azure-entra",
        protocol: "oidc",
        tenantId: null,
        authority: "https://login.microsoftonline.com/common/v2.0",
        authorizationEndpoint: null,
        tokenEndpoint: null,
        userInformationEndpoint: null,
        clientId: "cid-123",
        hasClientSecret: true,
        scopes: "openid profile email",
        redirectUri: null,
        samlIdpEntityId: null,
        samlSsoUrl: null,
        samlCertificate: null,
        claimMappingJson: "{}",
        enabledForAdmins: true,
        enabledForUsers: false,
        iconUrl: null,
        buttonColor: "#0078D4",
        buttonLabel: "Microsoft",
        displayOrder: 2,
        isActive: true,
        trustIdpMfa: true,
        rowVersion: "rv-token-77",
        createdAt: "2026-01-01T00:00:00Z",
        modifiedAt: null,
      })
    );
    mockUpdate.mockResolvedValue(undefined);

    const editHook = renderHook(() => useIdentityProviderDetailViewModel("idp-edit-1"), { wrapper });
    await waitFor(() => {
      expect(editHook.result.current.form.name).toBe("Azure Entra");
    });

    act(() => {
      editHook.result.current.updateField("isActive", false);
      editHook.result.current.updateField("clientSecret", "   ");
      editHook.result.current.updateField("trustIdpMfa", false);
    });

    await act(async () => {
      editHook.result.current.save();
    });

    await waitFor(() => {
      expect(mockUpdate).toHaveBeenCalledWith(
        "idp-edit-1",
        expect.objectContaining({
          isActive: false,
          trustIdpMfa: false,
          rowVersion: "rv-token-77",
        })
      );
    });
    const sentPayload = mockUpdate.mock.calls[0][1] as Record<string, unknown>;
    expect(sentPayload.clientSecret).toBeUndefined();
  });

  it("IdentityProviderCard uses BrandIcon fallback, min-w-0, and validates hex brandColor", () => {
    const validItem = new IdentityProviderListItem({
      id: "idp-google",
      name: "Google Workspace With Very Long Name",
      slug: "google-workspace-very-long-slug",
      protocol: "oidc",
      enabledForAdmins: true,
      enabledForUsers: true,
      isActive: true,
      trustIdpMfa: false,
      displayOrder: 0,
      iconUrl: null,
      buttonColor: "#4285F4",
      createdAt: "2026-01-01T00:00:00Z",
    });

    const invalidColorItem = validItem.copyWith({
      id: "idp-bad",
      slug: "custom-bad",
      buttonColor: "javascript:alert(1)",
    });

    const { rerender, container } = render(
      <IdentityProviderCard
        item={validItem}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onToggleActive={vi.fn()}
        onTestConnection={vi.fn()}
        isTesting={false}
      />
    );

    const card = screen.getByTestId("identity-provider-card-google-workspace-very-long-slug");
    const minW0Wrappers = card.querySelectorAll(".min-w-0");
    expect(minW0Wrappers.length).toBeGreaterThanOrEqual(2);
    // Google BrandIcon SVG renders instead of generic Fingerprint
    expect(container.querySelector("svg[viewBox='0 0 24 24']")).toBeInTheDocument();

    rerender(
      <IdentityProviderCard
        item={invalidColorItem}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onToggleActive={vi.fn()}
        onTestConnection={vi.fn()}
        isTesting={false}
      />
    );
    const badCard = screen.getByTestId("identity-provider-card-custom-bad");
    const iconBox = badCard.querySelector(".h-11.w-11") as HTMLElement;
    expect(iconBox.style.backgroundColor).toBe("");
  });

  it("SSOButtonPreview is non-dimmed with buttonColor hover border, and AppearanceSection has no duplicate disabled preview", () => {
    render(
      <SSOButtonPreview
        name="Google Workspace"
        slug="google"
        protocol="oidc"
        buttonColor="#EA4335"
        buttonLabel="Continue with Google"
      />
    );

    const hoverBtn = screen.getByTestId("sso-preview-hover-light");
    expect(hoverBtn).not.toBeDisabled();
    expect(hoverBtn).toHaveStyle({ borderColor: "#EA4335" });

    const updateField = vi.fn();
    const baseForm = {
      name: "Google",
      slug: "google",
      protocol: "oidc",
      displayOrder: 0,
      isActive: true,
      authority: "https://accounts.google.com",
      clientId: "cid",
      clientSecret: "",
      scopes: "openid",
      redirectUri: "",
      iconUrl: "",
      buttonColor: "#4285F4",
      buttonLabel: "",
      enabledForAdmins: true,
      enabledForUsers: true,
      trustIdpMfa: false,
      rowVersion: null,
      claimMappingJson: "{}",
    };

    const { container: appearanceContainer } = render(
      <AppearanceSection
        form={baseForm}
        updateField={updateField}
        protocolOptions={[]}
        isCreateMode={false}
      />
    );

    expect(screen.getByLabelText("identityProviders.buttonColor")).toHaveAttribute("id", "idp-color");
    expect(screen.getByLabelText("identityProviders.buttonColor")).toHaveAttribute("dir", "ltr");
    expect(appearanceContainer.querySelector("[data-testid='sso-button-preview']")).toBeNull();

    // Open color popover and verify swatches have aria-label + aria-pressed
    fireEvent.click(screen.getByRole("button", { name: "identityProviders.chooseColor" }));
    const selectedSwatch = screen.getByRole("button", {
      name: /#4285F4/i,
    });
    expect(selectedSwatch).toHaveAttribute("aria-pressed", "true");

    // AccessControlSection switches have id/htmlFor/aria-label
    render(
      <AccessControlSection
        form={baseForm}
        updateField={updateField}
        protocolOptions={[]}
        isCreateMode={false}
      />
    );
    expect(screen.getByLabelText("identityProviders.enabledForAdmins")).toHaveAttribute(
      "id",
      "idp-enabled-admins"
    );
    expect(screen.getByLabelText("identityProviders.enabledForUsers")).toHaveAttribute(
      "id",
      "idp-enabled-users"
    );

    // OidcConfigSection technical inputs have dir="ltr"
    render(
      <OidcConfigSection
        form={baseForm}
        updateField={updateField}
        protocolOptions={[]}
        isCreateMode={false}
      />
    );
    expect(screen.getByLabelText("identityProviders.authority")).toHaveAttribute("dir", "ltr");
  });

  it("IdentityProvidersView sets aria-pressed on filter pills and renders filtered empty state with Clear filters button", async () => {
    const providerItem = new IdentityProviderListItem({
      id: "idp-1",
      name: "Okta Corp",
      slug: "okta-corp",
      protocol: "oidc",
      enabledForAdmins: true,
      enabledForUsers: true,
      isActive: true,
      trustIdpMfa: false,
      displayOrder: 1,
      iconUrl: null,
      buttonColor: "#007DC1",
      createdAt: "2026-01-01T00:00:00Z",
    });
    mockGetAll.mockResolvedValue({ items: [providerItem], totalCount: 1 });

    renderWithQuery(<IdentityProvidersView />);
    await waitFor(() => {
      expect(screen.getByTestId("identity-provider-card-okta-corp")).toBeInTheDocument();
    });

    const allPill = screen.getByRole("button", { name: "common.all" });
    const samlPill = screen.getByRole("button", { name: "SAML 2.0" });
    expect(allPill).toHaveAttribute("aria-pressed", "true");
    expect(samlPill).toHaveAttribute("aria-pressed", "false");

    fireEvent.click(samlPill);
    expect(samlPill).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText("identityProviders.noMatchingTitle")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "identityProviders.clearFilters" }));
    expect(allPill).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByTestId("identity-provider-card-okta-corp")).toBeInTheDocument();
  });

  it("IdentityProviderDetailView adds rtl:rotate-180 on ArrowLeft", () => {
    const { container: detailContainer } = renderWithQuery(<IdentityProviderDetailView />);
    const backArrow = detailContainer.querySelector("svg.lucide-arrow-left");
    expect(backArrow).toHaveClass("rtl:rotate-180");
  });
});
