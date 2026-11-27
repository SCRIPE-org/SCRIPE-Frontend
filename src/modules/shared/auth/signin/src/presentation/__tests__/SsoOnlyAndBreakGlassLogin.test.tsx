import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { TenantBrandingMapper } from "@modules/auth/core/data/mappers/TenantBrandingMapper";
import { LoginRequestModel } from "@modules/auth/core/data/models/AuthModel";
import { en as authEn } from "@modules/auth/core/locales/auth.en";
import { ar as authAr } from "@modules/auth/core/locales/auth.ar";
import { SsoProvider } from "@modules/auth/core/domain/entities/SsoProvider";
import { SsoOnlyCredentialsPanel } from "../components/SsoOnlyCredentialsPanel";

vi.mock("@core/providers/i18n-provider", () => ({
  useI18n: () => ({
    t: (key: string) => key,
    direction: "ltr" as const,
    language: "en" as const,
    isRtl: false,
    setLanguage: vi.fn(),
  }),
}));

vi.mock("@core/providers/settings-provider", () => ({
  useSettings: () => ({
    inputStyle: "default",
    checkboxStyle: "default",
    buttonStyle: "default",
  }),
}));

vi.mock("@core/ui/layout/common/language-switcher", () => ({
  LanguageSwitcher: () => <button type="button">Lang</button>,
}));

vi.mock("@core/ui/layout/common/theme-switcher", () => ({
  ThemeSwitcher: () => <button type="button">Theme</button>,
}));

vi.mock("@core/hooks/use-resolved-file-url", () => ({
  useResolvedFileUrl: (url: string | null | undefined) => url ?? null,
}));

const sampleProvider = new SsoProvider({
  id: "idp-1",
  name: "Okta Enterprise",
  slug: "okta",
  protocol: "oidc",
  iconUrl: null,
  buttonColor: "#007dc1",
  buttonLabel: "Sign in with Okta",
  displayOrder: 0,
  scope: "Organization",
});

describe("PWD-03: SsoOnly Workspace Authentication & Audited Break-Glass Login", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("TenantBrandingMapper parses Hybrid/SsoOnly enum strings/numbers and allowOwnerBreakGlassLocalLogin", () => {
    const ssoOnly = TenantBrandingMapper.toDomain({
      tenantId: "t-1",
      name: "Al Ahly",
      authenticationMode: "SsoOnly",
      allowOwnerBreakGlassLocalLogin: false,
    });
    expect(ssoOnly.authenticationMode).toBe("SsoOnly");
    expect(ssoOnly.isSsoOnly).toBe(true);
    expect(ssoOnly.allowOwnerBreakGlassLocalLogin).toBe(false);

    const numericSsoOnly = TenantBrandingMapper.toDomain({
      tenantId: "t-2",
      name: "Numeric",
      authenticationMode: 1,
    });
    expect(numericSsoOnly.authenticationMode).toBe("SsoOnly");
    expect(numericSsoOnly.allowOwnerBreakGlassLocalLogin).toBe(true);

    const hybrid = TenantBrandingMapper.toDomain({
      tenantId: "t-3",
      name: "Hybrid Club",
    });
    expect(hybrid.authenticationMode).toBe("Hybrid");
    expect(hybrid.isSsoOnly).toBe(false);
  });

  it("LoginRequestModel serializes breakGlass=true only when explicitly activated", () => {
    const standard = new LoginRequestModel("admin@club.com", "pw", "t-1");
    expect(standard.toJson().breakGlass).toBeUndefined();

    const breakGlass = new LoginRequestModel("owner@club.com", "pw", "t-1", undefined, false, false, true);
    expect(breakGlass.toJson().breakGlass).toBe(true);
  });

  it("SsoOnlyCredentialsPanel hides local login by default, emphasizes SSO providers, and reveals Break-Glass form on toggle", () => {
    const onToggleBreakGlass = vi.fn();
    const handleBreakGlassLogin = vi.fn();
    const onProviderClick = vi.fn();

    const { rerender } = render(
      <SsoOnlyCredentialsPanel
        formData={{ identifier: "owner@ahly.club", password: "SecretPassword!1", staySignedIn: false }}
        showPassword={false}
        isLoading={false}
        isFormValid={true}
        error=""
        shakeKey={0}
        isRTL={false}
        allowOwnerBreakGlassLocalLogin={true}
        isBreakGlassExpanded={false}
        onToggleBreakGlass={onToggleBreakGlass}
        updateField={vi.fn()}
        togglePasswordVisibility={vi.fn()}
        handleBreakGlassLogin={handleBreakGlassLogin}
        providers={[sampleProvider]}
        isProvidersLoading={false}
        ssoError={null}
        onProviderClick={onProviderClick}
      />
    );

    expect(screen.getByText("auth.ssoOnly.title")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /auth\.sso\.signInWithProvider/i })).toBeInTheDocument();
    expect(screen.queryByTestId("break-glass-login-form")).not.toBeInTheDocument();

    const toggle = screen.getByTestId("break-glass-toggle");
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    fireEvent.click(toggle);
    expect(onToggleBreakGlass).toHaveBeenCalledTimes(1);

    rerender(
      <SsoOnlyCredentialsPanel
        formData={{ identifier: "owner@ahly.club", password: "SecretPassword!1", staySignedIn: false }}
        showPassword={false}
        isLoading={false}
        isFormValid={true}
        error=""
        shakeKey={0}
        isRTL={false}
        allowOwnerBreakGlassLocalLogin={true}
        isBreakGlassExpanded={true}
        onToggleBreakGlass={onToggleBreakGlass}
        updateField={vi.fn()}
        togglePasswordVisibility={vi.fn()}
        handleBreakGlassLogin={handleBreakGlassLogin}
        providers={[sampleProvider]}
        isProvidersLoading={false}
        ssoError={null}
        onProviderClick={onProviderClick}
      />
    );

    expect(screen.getByTestId("break-glass-login-form")).toBeInTheDocument();
    expect(screen.getByText("auth.ssoOnly.breakGlassWarningTitle")).toBeInTheDocument();

    fireEvent.submit(screen.getByTestId("break-glass-login-form"));
    expect(handleBreakGlassLogin).toHaveBeenCalledTimes(1);
  });

  it("SsoOnlyCredentialsPanel hides Break-Glass toggle when allowOwnerBreakGlassLocalLogin is false", () => {
    render(
      <SsoOnlyCredentialsPanel
        formData={{ identifier: "", password: "", staySignedIn: false }}
        showPassword={false}
        isLoading={false}
        isFormValid={false}
        error=""
        shakeKey={0}
        isRTL={false}
        allowOwnerBreakGlassLocalLogin={false}
        isBreakGlassExpanded={false}
        onToggleBreakGlass={vi.fn()}
        updateField={vi.fn()}
        togglePasswordVisibility={vi.fn()}
        handleBreakGlassLogin={vi.fn()}
        providers={[sampleProvider]}
        isProvidersLoading={false}
        ssoError={null}
        onProviderClick={vi.fn()}
      />
    );

    expect(screen.queryByTestId("break-glass-toggle")).not.toBeInTheDocument();
    expect(screen.getByText("auth.ssoOnly.localDisabledNotice")).toBeInTheDocument();
  });

  it("EN and AR locales have complete key parity for auth.ssoOnly", () => {
    expect(Object.keys(authEn.auth.ssoOnly).sort()).toEqual(
      Object.keys(authAr.auth.ssoOnly).sort()
    );
  });
});
