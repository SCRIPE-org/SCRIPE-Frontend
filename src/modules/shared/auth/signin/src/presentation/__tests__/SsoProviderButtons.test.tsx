import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, renderHook, waitFor, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import { SsoProviderButtons } from "../components/SsoProviderButtons";
import { CredentialsPasswordInput } from "../components/CredentialsPasswordInput";
import { formatBidiCompanyName } from "../components/layouts/layout-shared";
import { NxThemeSwitcher } from "@core/ui/layout/common/theme-switcher";
import { useSsoProviders } from "../viewmodels/useSsoProviders";
import { SsoProvider, type SsoProviderData } from "@modules/auth/core/domain/entities/SsoProvider";
import { en as authEn } from "@modules/auth/core/locales/auth.en";
import { ar as authAr } from "@modules/auth/core/locales/auth.ar";

const mockGetProviders = vi.fn();
const mockInitiateLogin = vi.fn();
const mockLanguageRef = { current: "en" as "en" | "ar" };
const mockResolvedThemeRef = { current: "light" as string | undefined };

vi.mock("next-themes", () => ({
  useTheme: () => ({
    resolvedTheme: mockResolvedThemeRef.current,
    setTheme: vi.fn(),
  }),
}));

vi.mock("@modules/auth/di", () => ({
  getAuthContainer: () => ({
    ssoRepository: {
      getProviders: (params: unknown) => mockGetProviders(params),
      initiateLogin: (id: string, protocol?: string) => mockInitiateLogin(id, protocol),
    },
  }),
}));

vi.mock("@core/providers/i18n-provider", () => ({
  useI18n: () => ({
    t: (key: string, params?: Record<string, string | number>) => {
      if (key === "auth.sso.signInWithProvider" && params?.provider) {
        const template =
          mockLanguageRef.current === "ar"
            ? authAr.auth.sso.signInWithProvider
            : authEn.auth.sso.signInWithProvider;
        return template.replace("{{provider}}", String(params.provider));
      }
      return key;
    },
    direction: mockLanguageRef.current === "ar" ? ("rtl" as const) : ("ltr" as const),
  }),
}));

vi.mock("@core/hooks/use-resolved-file-url", () => ({
  useResolvedFileUrl: (url: string | null | undefined) => url ?? null,
}));

function makeProvider(overrides: Partial<SsoProviderData>): SsoProvider {
  return new SsoProvider({
    id: "p1",
    name: "Google",
    slug: "google",
    protocol: "oidc",
    iconUrl: null,
    buttonColor: "#4285F4",
    buttonLabel: null,
    displayOrder: 0,
    scope: "Global",
    ...overrides,
  });
}

describe("SsoProviderButtons smart adaptive layout & resilience", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLanguageRef.current = "en";
    mockResolvedThemeRef.current = "light";
    document.documentElement.classList.remove("dark", "light");
  });

  it("renders a single provider full-width (minmax(0, 1fr)) with full localized label and no colored dot", () => {
    const { container } = render(
      <SsoProviderButtons
        providers={[makeProvider({ id: "g", name: "Google", slug: "google", buttonColor: "#4285F4" })]}
        isLoading={false}
        error={null}
        onProviderClick={vi.fn()}
      />
    );

    const grid = screen.getByTestId("sso-provider-buttons-grid");
    expect(grid).toHaveStyle({ gridTemplateColumns: "minmax(0, 1fr)" });
    expect(screen.getByRole("button", { name: "Sign in with Google" })).toBeInTheDocument();
    expect(container.querySelector("span.h-2.w-2.rounded-full")).toBeNull();
  });

  it("renders 2 providers side-by-side with compact concise labels (no prefix truncation) and drives hover border from accentColor", () => {
    const { container } = render(
      <SsoProviderButtons
        providers={[
          makeProvider({
            id: "g",
            name: "Google Workspace SSO",
            slug: "google",
            buttonColor: "#4285F4",
            buttonLabel: "Sign in with Google Workspace",
          }),
          makeProvider({
            id: "m",
            name: "Microsoft Entra ID",
            slug: "microsoft",
            buttonColor: "#0078D4",
            scope: "Organization",
          }),
        ]}
        isLoading={false}
        error={null}
        onProviderClick={vi.fn()}
      />
    );

    const grid = screen.getByTestId("sso-provider-buttons-grid");
    expect(grid).toHaveStyle({ gridTemplateColumns: "repeat(2, minmax(0, 1fr))" });
    expect(container.querySelector("span.h-2.w-2.rounded-full")).toBeNull();

    const googleButton = screen.getByRole("button", { name: "Google Workspace" });
    expect(screen.getByRole("button", { name: /Microsoft/i })).toHaveTextContent("Microsoft");
    fireEvent.mouseEnter(googleButton);
    expect(googleButton).toHaveStyle({ borderColor: "#4285F4" });
    fireEvent.mouseLeave(googleButton);
  });

  it("separates 3 providers (1 Org + 2 Global) with Org hero col-span-2 at top and 2 Global side-by-side below", () => {
    const onProviderClick = vi.fn();
    render(
      <SsoProviderButtons
        providers={[
          makeProvider({ id: "g", name: "Google", slug: "google", scope: "Global" }),
          makeProvider({ id: "m", name: "Microsoft", slug: "microsoft", scope: "Global" }),
          makeProvider({
            id: "a",
            name: "Al Ahly SC Enterprise SSO",
            slug: "ahly-okta",
            buttonLabel: "Sign in with Ahly Corporate ID",
            scope: "Organization",
          }),
        ]}
        isLoading={false}
        error={null}
        onProviderClick={onProviderClick}
      />
    );

    const grid = screen.getByTestId("sso-provider-buttons-grid");
    expect(grid).toHaveStyle({ gridTemplateColumns: "repeat(2, minmax(0, 1fr))" });

    const cells = Array.from(grid.children) as HTMLElement[];
    expect(cells).toHaveLength(3);
    // Org provider hoisted to index 0 with span 2
    expect(cells[0]).toHaveTextContent("Sign in with Ahly Corporate ID");
    expect(cells[0]).toHaveTextContent("auth.sso.organizationScope");
    expect(cells[0]).toHaveStyle({ gridColumn: "span 2" });
    // Global providers side-by-side underneath
    expect(cells[1]).toHaveTextContent("Google");
    expect(cells[1].style.gridColumn).toBe("");
    expect(cells[2]).toHaveTextContent("Microsoft");
    expect(cells[2].style.gridColumn).toBe("");

    fireEvent.click(screen.getByText("Sign in with Ahly Corporate ID"));
    expect(onProviderClick).toHaveBeenCalledWith("a", "oidc");
  });

  it("handles 4+ providers with Org heroes at top and trailing odd Global spanning col-span-2", () => {
    render(
      <SsoProviderButtons
        providers={[
          makeProvider({ id: "g1", name: "Google", slug: "google", scope: "Global" }),
          makeProvider({ id: "g2", name: "Microsoft", slug: "microsoft", scope: "Global" }),
          makeProvider({ id: "g3", name: "GitHub", slug: "github", scope: "Global" }),
          makeProvider({
            id: "o1",
            name: "Corp Okta",
            slug: "okta",
            buttonLabel: "Corp Okta",
            scope: "Organization",
          }),
        ]}
        isLoading={false}
        error={null}
        onProviderClick={vi.fn()}
      />
    );

    const grid = screen.getByTestId("sso-provider-buttons-grid");
    const cells = Array.from(grid.children) as HTMLElement[];
    expect(cells).toHaveLength(4);
    expect(cells[0]).toHaveTextContent("Corp Okta");
    expect(cells[0]).toHaveStyle({ gridColumn: "span 2" });
    expect(cells[1].style.gridColumn).toBe("");
    expect(cells[2].style.gridColumn).toBe("");
    expect(cells[3]).toHaveTextContent("GitHub");
    expect(cells[3]).toHaveStyle({ gridColumn: "span 2" });
  });

  it("renders role='alert' on SSO error and renders accessible retry notice on discoveryError", () => {
    const onRetry = vi.fn();
    render(
      <SsoProviderButtons
        providers={[]}
        isLoading={false}
        error="auth.sso.callbackErrorGeneric"
        discoveryError="auth.sso.discoveryRateLimited"
        onRetryProviders={onRetry}
        onProviderClick={vi.fn()}
      />
    );

    const alerts = screen.getAllByRole("alert");
    expect(alerts.length).toBe(2);
    expect(screen.getByText("auth.sso.callbackErrorGeneric")).toBeInTheDocument();
    expect(screen.getByTestId("sso-discovery-error")).toHaveTextContent(
      "auth.sso.discoveryRateLimited"
    );

    fireEvent.click(screen.getByRole("button", { name: /auth\.sso\.retryProviders/i }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("useSsoProviders surfaces 429 rate-limit discoveryError and recovers via retryProviders()", async () => {
    const rateLimitError = Object.assign(new Error("Too Many Requests"), { status: 429 });
    mockGetProviders
      .mockRejectedValueOnce(rateLimitError)
      .mockResolvedValueOnce([makeProvider({ id: "g", name: "Google", slug: "google" })]);

    const { result } = renderHook(() => useSsoProviders({ tenantId: "t1", mode: "inherit" }));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    expect(result.current.providers).toEqual([]);
    expect(result.current.discoveryError).toBe("auth.sso.discoveryRateLimited");

    act(() => {
      result.current.retryProviders();
    });

    await waitFor(() => {
      expect(result.current.providers).toHaveLength(1);
    });
    expect(result.current.discoveryError).toBeNull();
  });

  it("expands 3-digit #RGB buttonColor to #RRGGBB before appending hex alpha suffixes on hover", () => {
    render(
      <SsoProviderButtons
        providers={[makeProvider({ id: "g", name: "Google", slug: "google", buttonColor: "#abc" })]}
        isLoading={false}
        error={null}
        onProviderClick={vi.fn()}
      />
    );

    const btn = screen.getByRole("button", { name: "Sign in with Google" });
    fireEvent.mouseEnter(btn);

    expect(btn.style.boxShadow).toContain("#aabbcc30");
    expect(btn.style.boxShadow).toContain("#aabbcc18");
    expect(btn.style.boxShadow).not.toContain("#abc30");
  });

  it("localizes full-width hero prefix in Arabic RTL while keeping 2-col global buttons concise", () => {
    mockLanguageRef.current = "ar";
    render(
      <SsoProviderButtons
        providers={[
          makeProvider({ id: "g", name: "Google", slug: "google", buttonLabel: "Sign in with Google" }),
          makeProvider({ id: "m", name: "Microsoft", slug: "microsoft", buttonLabel: "Sign in with Microsoft" }),
          makeProvider({
            id: "a",
            name: "Al Ahly SC Enterprise SSO",
            slug: "ahly-okta",
            buttonLabel: "Sign in with Ahly Corporate ID",
            scope: "Organization",
          }),
        ]}
        isLoading={false}
        error={null}
        onProviderClick={vi.fn()}
      />
    );

    const grid = screen.getByTestId("sso-provider-buttons-grid");
    const cells = Array.from(grid.children) as HTMLElement[];
    expect(cells[0]).toHaveTextContent("تسجيل الدخول عبر Ahly Corporate ID");
    expect(cells[1]).toHaveTextContent("Google");
    expect(cells[1]).not.toHaveTextContent("Sign in with");
    expect(cells[2]).toHaveTextContent("Microsoft");
    expect(cells[2]).not.toHaveTextContent("Sign in with");
  });

  it("uses RTL-aware logical positioning on CredentialsPasswordInput without forcing dir='ltr'", () => {
    render(
      <CredentialsPasswordInput
        value="secret"
        onChange={vi.fn()}
        showPassword={false}
        onToggleShowPassword={vi.fn()}
        disabled={false}
        hasError={false}
        t={(key) => key}
      />
    );

    const input = document.getElementById("password") as HTMLInputElement;
    const toggleBtn = screen.getByRole("button", { name: "auth.showPassword" });

    expect(input).not.toHaveAttribute("dir", "ltr");
    expect(input.className).toContain("ps-4");
    expect(input.className).toContain("pe-12");
    expect(input.className).toContain("text-start");
    expect(toggleBtn.className).toContain("end-1");
    expect(toggleBtn.style.right).toBe("");
  });

  it("isolates parenthetical Arabic company names inside <bdi> and syncs NxThemeSwitcher with html.dark", () => {
    const { container } = render(
      <div>{formatBidiCompanyName("Arab Contractors FC (نادي المقاولون العرب)")}</div>
    );
    const bdi = container.querySelector("bdi");
    expect(bdi).not.toBeNull();
    expect(bdi?.textContent).toBe("(نادي المقاولون العرب)");

    document.documentElement.classList.add("dark");
    mockResolvedThemeRef.current = "light";
    render(<NxThemeSwitcher variant="ghost" />);
    expect(screen.getByRole("button", { name: "chrome.theme.toLight" })).toBeInTheDocument();
  });
});
