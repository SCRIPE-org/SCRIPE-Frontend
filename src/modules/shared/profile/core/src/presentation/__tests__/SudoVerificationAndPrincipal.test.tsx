import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor, renderHook } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useSudoStore } from "@core/store/useSudoStore";
import { useAppStore } from "@core/store/useAppStore";
import { SudoVerificationModal, computeAllowedFactors } from "../components/SudoVerificationModal";
import { IdentityChangeVerificationModal } from "../components/IdentityChangeVerificationModal";
import { AccountLifecycleCard } from "../components/AccountLifecycleCard";
import { EnrollPasskeyModal } from "../components/EnrollPasskeyModal";
import { ProfileInfoForm } from "../components/ProfileInfoForm";
import { ProfileRailLayout } from "../components/ProfileRailLayout";
import { SectionInfoPopover } from "../components/SectionInfoPopover";
import { finalizeEmergencyLockdownCleanup } from "../utils/emergency-lockdown";
import { mapSudoStatus } from "../../data/mappers/SecurityRepositoryMapper";
import { SovereignAccountRepository } from "../../data/repositories/SovereignAccountRepository";
import {
  useAccountContextSliceViewModel,
  useAccountSecuritySliceViewModel,
} from "../viewmodels/useSovereignAccountSlicesViewModel";
import { useIntegrationsFederationViewModel } from "../viewmodels/useIntegrationsFederationViewModel";
import type { IApiService } from "@core/interfaces/api.interface";
import type { AdminProfile } from "../../domain/entities/AdminProfile";
import type { AccountPrincipalContext } from "../../domain/entities/SovereignAccountEntities";

const mockBeginSudoPasskey = vi.fn();
const mockGetSudoStatus = vi.fn();
const mockVerifySudoStepUp = vi.fn();
const mockAssertPasskey = vi.fn();
const mockGetAccountContext = vi.fn();
const mockGetAccountSecurity = vi.fn();
const mockGetAccountIntegrations = vi.fn();
const mockGetExternalLogins = vi.fn();

vi.mock("@core/providers/i18n-provider", () => ({
  useI18n: () => ({
    t: (key: string) => key,
    direction: "ltr" as const,
    language: "en" as const,
    isRtl: false,
    setLanguage: vi.fn(),
  }),
}));

vi.mock("@core/services/webauthn.service", () => ({
  assertPasskey: (...args: unknown[]) => mockAssertPasskey(...args),
  detectClientDevice: vi.fn().mockResolvedValue({
    os: "Windows",
    browser: "Chrome",
    platformName: "Windows Hello",
    suggestedLabel: "Chrome on Windows",
  }),
  isWebAuthnSupported: () => true,
}));

vi.mock("@modules/profile/di", () => ({
  container: {
    securityRepository: {
      getSudoStatus: (...args: unknown[]) => mockGetSudoStatus(...args),
      beginSudoPasskey: (...args: unknown[]) => mockBeginSudoPasskey(...args),
      verifySudoStepUp: (...args: unknown[]) => mockVerifySudoStepUp(...args),
    },
    sovereignAccountRepository: {
      getContext: (...args: unknown[]) => mockGetAccountContext(...args),
      getSecurity: (...args: unknown[]) => mockGetAccountSecurity(...args),
      getIntegrations: (...args: unknown[]) => mockGetAccountIntegrations(...args),
    },
    profileRepository: {
      getExternalLogins: (...args: unknown[]) => mockGetExternalLogins(...args),
    },
  },
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/account/security",
  useRouter: () => ({ replace: vi.fn(), push: vi.fn() }),
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

describe("Unified Sudo Engine, Passkey Step-Up & Principal Separation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useSudoStore.getState().reset();
  });

  it("computeAllowedFactors enforces strict backend policy without disallowed downgrades", () => {
    expect(
      computeAllowedFactors("PasskeyRequired", ["passkey", "totp", "password"], true)
    ).toEqual(["passkey"]);

    expect(
      computeAllowedFactors("TwoFactorRequired", ["password", "totp", "passkey"], true)
    ).toEqual(["passkey", "totp"]);

    expect(
      computeAllowedFactors("StandardPasswordOrMfa", ["totp", "passkey"], true)
    ).toEqual(["passkey", "totp", "password"]);

    // Never return an empty factor dead-end for StandardPasswordOrMfa even if allowsPasswordFallback is false
    expect(
      computeAllowedFactors("StandardPasswordOrMfa", ["password"], false)
    ).toEqual(["password"]);
    expect(
      computeAllowedFactors("StandardPasswordOrMfa", [], false)
    ).toEqual(["password"]);
  });

  it("queues on-demand elevation via requestElevation() and resolves on markVerified(), rejecting on cancel", async () => {
    const store = useSudoStore.getState();

    const pendingTokenPromise = store.requestElevation();
    expect(useSudoStore.getState().modalOpen).toBe(true);
    expect(useSudoStore.getState().isOnDemandChallenge).toBe(true);

    useSudoStore.getState().markVerified({
      sudoToken: "sudo-tok-123",
      expiresAtUtc: new Date(Date.now() + 600_000).toISOString(),
      methodUsed: "passkey",
      mandatoryFactorPolicy: "PasskeyRequired",
    });

    await expect(pendingTokenPromise).resolves.toBe("sudo-tok-123");
    expect(useSudoStore.getState().getValidSudoToken()).toBe("sudo-tok-123");

    useSudoStore.getState().markLocked();
    expect(useSudoStore.getState().getValidSudoToken()).toBeNull();

    const cancelledPromise = useSudoStore.getState().requestElevation();
    useSudoStore.getState().closeModal();
    await expect(cancelledPromise).rejects.toThrow("Sudo verification was cancelled.");
  });

  it("SudoVerificationModal enforces PasskeyRequired and calls authenticated beginSudoPasskey + verifySudoStepUp with challengeToken and userHandleBase64", async () => {
    mockGetSudoStatus.mockResolvedValue({
      isActive: false,
      expiresAtUtc: null,
      methodUsed: null,
      availableMethods: ["passkey", "totp", "password"],
      mandatoryFactorPolicy: "PasskeyRequired",
      allowsPasswordFallback: false,
      remainingSeconds: 0,
    });
    mockBeginSudoPasskey.mockResolvedValue({
      challenge: "c2VyLXJhbmRvbS1jaGFsbGVuZ2U",
      rpId: "localhost",
      challengeToken: "signed-challenge-token-abc",
      allowCredentials: [{ id: "cred-1", type: "public-key", transports: ["internal"] }],
    });
    mockAssertPasskey.mockResolvedValue({
      credentialIdBase64: "cred-1",
      authenticatorDataBase64: "auth-data",
      clientDataJsonBase64: "client-data",
      signatureBase64: "sig-data",
      userHandleBase64: "dXNlci1oYW5kbGU",
      clientExtensionResults: {},
    });
    mockVerifySudoStepUp.mockResolvedValue({
      sudoToken: "sudo-jwt-passkey",
      expiresAtUtc: new Date(Date.now() + 900_000).toISOString(),
      methodUsed: "passkey",
      mandatoryFactorPolicy: "PasskeyRequired",
      expiresInSeconds: 900,
      verified: true,
    });

    const elevationPromise = useSudoStore.getState().requestElevation();
    elevationPromise.catch(() => undefined);
    render(<SudoVerificationModal />);

    await waitFor(() => {
      expect(screen.getByTestId("sudo-panel-passkey")).toBeInTheDocument();
      expect(screen.getByTestId("sudo-verify-submit-btn")).toBeEnabled();
    });

    // Disallowed factors must NOT be rendered under PasskeyRequired
    expect(screen.queryByTestId("sudo-tab-totp")).not.toBeInTheDocument();
    expect(screen.queryByTestId("sudo-tab-password")).not.toBeInTheDocument();
    expect(screen.queryByTestId("sudo-totp-input")).not.toBeInTheDocument();
    expect(screen.queryByTestId("sudo-password-input")).not.toBeInTheDocument();

    fireEvent.click(screen.getByTestId("sudo-verify-submit-btn"));

    await expect(elevationPromise).resolves.toBe("sudo-jwt-passkey");
    expect(mockBeginSudoPasskey).toHaveBeenCalledTimes(1);
    expect(mockVerifySudoStepUp).toHaveBeenCalledWith({
      method: "passkey",
      passkeyAssertion: {
        credentialIdBase64: "cred-1",
        authenticatorDataBase64: "auth-data",
        clientDataJsonBase64: "client-data",
        signatureBase64: "sig-data",
        userHandleBase64: "dXNlci1oYW5kbGU",
        challengeToken: "signed-challenge-token-abc",
        clientExtensionResults: {},
      },
    });
  });

  it("mapSudoStatus infers password fallback when omitted under StandardPasswordOrMfa while honoring strict policies", () => {
    const omittedStandard = mapSudoStatus({
      isActive: false,
      expiresAtUtc: null,
      methodUsed: null,
      availableMethods: ["password"],
      mandatoryFactorPolicy: "StandardPasswordOrMfa",
      remainingSeconds: 0,
    } as unknown as Parameters<typeof mapSudoStatus>[0]);
    expect(omittedStandard.allowsPasswordFallback).toBe(true);

    const strictPasskeyOmitted = mapSudoStatus({
      isActive: false,
      expiresAtUtc: null,
      methodUsed: null,
      availableMethods: ["passkey"],
      mandatoryFactorPolicy: "PasskeyRequired",
      remainingSeconds: 0,
    } as unknown as Parameters<typeof mapSudoStatus>[0]);
    expect(strictPasskeyOmitted.allowsPasswordFallback).toBe(false);

    const strictTotpExplicitFalse = mapSudoStatus({
      isActive: false,
      expiresAtUtc: null,
      methodUsed: null,
      availableMethods: ["totp", "password"],
      mandatoryFactorPolicy: "TwoFactorRequired",
      allowsPasswordFallback: false,
      remainingSeconds: 0,
    });
    expect(strictTotpExplicitFalse.allowsPasswordFallback).toBe(false);
  });

  it("SudoVerificationModal renders password step-up under StandardPasswordOrMfa without explicit allowsPasswordFallback: true", async () => {
    mockGetSudoStatus.mockResolvedValue({
      isActive: false,
      expiresAtUtc: null,
      methodUsed: null,
      availableMethods: ["password"],
      mandatoryFactorPolicy: "StandardPasswordOrMfa",
      allowsPasswordFallback: false,
      remainingSeconds: 0,
    });
    mockVerifySudoStepUp.mockResolvedValue({
      sudoToken: "sudo-jwt-password",
      expiresAtUtc: new Date(Date.now() + 900_000).toISOString(),
      methodUsed: "password",
      mandatoryFactorPolicy: "StandardPasswordOrMfa",
      expiresInSeconds: 900,
      verified: true,
    });

    const elevationPromise = useSudoStore.getState().requestElevation();
    elevationPromise.catch(() => undefined);
    render(<SudoVerificationModal />);

    await waitFor(() => {
      expect(screen.getByTestId("sudo-panel-password")).toBeInTheDocument();
      expect(screen.getByTestId("sudo-password-input")).toBeInTheDocument();
    });

    const submitBtn = screen.getByTestId("sudo-verify-submit-btn");
    expect(submitBtn).toBeDisabled();

    fireEvent.change(screen.getByTestId("sudo-password-input"), {
      target: { value: "AdminPass!123" },
    });
    expect(submitBtn).toBeEnabled();

    fireEvent.click(submitBtn);

    await expect(elevationPromise).resolves.toBe("sudo-jwt-password");
    expect(mockVerifySudoStepUp).toHaveBeenCalledWith({
      method: "password",
      password: "AdminPass!123",
    });
  });

  it("preserves cookie-backed post-reload elevation without stale header token and resets on forceChallenge", async () => {
    const expiresAtUtc = new Date(Date.now() + 600_000).toISOString();
    useSudoStore.getState().hydrateStatus({
      isActive: true,
      expiresAtUtc,
      methodUsed: "passkey",
      availableMethods: ["passkey"],
      mandatoryFactorPolicy: "PasskeyRequired",
      allowsPasswordFallback: false,
      remainingSeconds: 600,
    });

    const afterHydrate = useSudoStore.getState();
    expect(afterHydrate.isActive).toBe(true);
    expect(afterHydrate.isSessionElevated()).toBe(true);
    // Must stay null after reload so HttpOnly cookie is used without overriding via stale X-Sudo-Token header
    expect(afterHydrate.getValidSudoToken()).toBeNull();

    const forcePromise = afterHydrate.requestElevation({ forceChallenge: true });
    const duringChallenge = useSudoStore.getState();
    expect(duringChallenge.isActive).toBe(false);
    expect(duringChallenge.isSessionElevated()).toBe(false);
    expect(duringChallenge.modalOpen).toBe(true);

    duringChallenge.markVerified({
      sudoToken: "sudo-jwt-reverified",
      expiresAtUtc: new Date(Date.now() + 600_000).toISOString(),
      methodUsed: "passkey",
      mandatoryFactorPolicy: "PasskeyRequired",
    });

    await expect(forcePromise).resolves.toBe("sudo-jwt-reverified");
    expect(useSudoStore.getState().isSessionElevated()).toBe(true);
    expect(useSudoStore.getState().getValidSudoToken()).toBe("sudo-jwt-reverified");
  });

  it("keeps tenant SuperAdmins as TenantUser in SovereignAccountRepository & ProfileRailLayout, while isolating PlatformAdmin", async () => {
    const api = {
      get: vi.fn().mockResolvedValue({
        adminId: "t-super-1",
        username: "club.owner",
        principalContext: {
          principalKind: "TenantUser",
          isSuperAdmin: true,
          controlPlaneLabel: "",
          activeTenantId: "tenant-1",
          activeTenantName: "Club Alpha",
          activeBranchId: "branch-1",
          activeBranchName: "North Facility",
          isSolePrimaryOwner: false,
          hasStandingRootAuthority: false,
          availableBranches: [
            { branchId: "branch-1", branchName: "North Facility", isCurrent: true },
          ],
        },
      }),
    } as unknown as IApiService;

    const repo = new SovereignAccountRepository(api);
    const tenantSuperAdminCtx = await repo.getContext();
    expect(tenantSuperAdminCtx.principalContext?.principalKind).toBe("TenantUser");
    expect(tenantSuperAdminCtx.principalContext?.isSuperAdmin).toBe(true);

    const profile = {
      firstName: "Tariq",
      lastName: "Samir",
      username: "club.owner",
      staffCode: "STF-10",
      availableAcademies: [{ id: "branch-1", name: "North Facility", isCurrent: true }],
    } as unknown as AdminProfile;

    const { rerender } = render(
      <ProfileRailLayout
        profile={profile}
        principalContext={tenantSuperAdminCtx.principalContext}
        selectedAcademyId="branch-1"
        onSwitchAcademy={vi.fn()}
      >
        <div>Tenant Workspace Content</div>
      </ProfileRailLayout>
    );

    // Tenant SuperAdmin keeps Subscription Plan nav & Branch Switcher
    expect(screen.getByText("profile.rail.plan")).toBeInTheDocument();
    expect(
      screen.getByRole("combobox", { name: "profile.rail.activeCampus" })
    ).toBeInTheDocument();

    const platformPrincipal: AccountPrincipalContext = {
      principalKind: "PlatformAdmin",
      isSuperAdmin: true,
      controlPlaneLabel: "Global Control Plane",
      activeTenantId: null,
      activeTenantName: null,
      activeBranchId: null,
      activeBranchName: null,
      isSolePrimaryOwner: true,
      hasStandingRootAuthority: true,
      availableBranches: [],
    };

    rerender(
      <ProfileRailLayout profile={profile} principalContext={platformPrincipal}>
        <div>Platform Root Content</div>
      </ProfileRailLayout>
    );

    // PlatformAdmin hides Subscription Plan nav & Branch Switcher and displays Control Plane badge
    expect(screen.queryByText("profile.rail.plan")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("combobox", { name: "profile.rail.activeCampus" })
    ).not.toBeInTheDocument();
    expect(screen.getByText("Global Control Plane")).toBeInTheDocument();
  });

  it("renders accessible SectionInfoPopover trigger button", () => {
    render(<SectionInfoPopover i18nPrefix="profile.infoPopover.passkeyVault" testId="info-btn" />);
    const trigger = screen.getByTestId("info-btn");
    expect(trigger).toHaveAttribute("aria-label", "profile.infoPopover.triggerAria");
  });

  it("finalizeEmergencyLockdownCleanup clears sudo, auth cookies/session, app store, and query cache cleanly", async () => {
    useSudoStore.getState().markVerified({
      sudoToken: "tok-before-lockdown",
      expiresAtUtc: new Date(Date.now() + 300_000).toISOString(),
      methodUsed: "passkey",
      mandatoryFactorPolicy: "PasskeyRequired",
    });
    const logoutSpy = vi.fn().mockResolvedValue(undefined);
    const markLockedSpy = vi.fn(() => useSudoStore.getState().markLocked());
    const clearCacheSpy = vi.fn();
    const appLogoutSpy = vi.spyOn(useAppStore.getState(), "logout").mockImplementation(() => undefined);

    await finalizeEmergencyLockdownCleanup(
      { clear: clearCacheSpy } as unknown as QueryClient,
      { logout: logoutSpy },
      markLockedSpy
    );

    expect(markLockedSpy).toHaveBeenCalledTimes(1);
    expect(logoutSpy).toHaveBeenCalledTimes(1);
    expect(useSudoStore.getState().isActive).toBe(false);
    expect(useSudoStore.getState().sudoToken).toBeNull();
    expect(appLogoutSpy).toHaveBeenCalledTimes(1);
    expect(clearCacheSpy).toHaveBeenCalledTimes(1);
    appLogoutSpy.mockRestore();
  });

  it("exposes context featureFlags, security 2FA/SSO feature gates, and integrations patQuota through ViewModels", async () => {
    mockGetAccountContext.mockResolvedValue({
      adminId: "adm-city",
      username: "city.admin",
      fullName: "City Admin",
      staffCode: "STF-2",
      clubAffiliation: "City Club",
      activeBranchName: "Main",
      editionName: "sports-pro",
      isAvailableForOperations: true,
      securityPostureScore: 80,
      postureChecklist: [],
      activeSessionsCount: 1,
      sudoActive: false,
      featureFlags: {
        integrationsEnabled: true,
        twoFactorEnabled: true,
        externalSsoEnabled: false,
        vacationDelegationEnabled: false,
        planAndQuotasEnabled: true,
      },
    });
    mockGetAccountSecurity.mockResolvedValue({
      isTwoFactorEnabled: false,
      isTwoFactorFeatureEnabled: true,
      isSsoFeatureEnabled: false,
      isSecurityPageEnabled: true,
      backupCodesRemaining: 0,
      passkeyCount: 0,
      hardwareKeyCount: 0,
      securityPostureScore: 80,
      postureChecklist: [],
      trustedCidrs: [],
      sudoActive: false,
      isCurrentIpAllowed: true,
    });
    mockGetAccountIntegrations.mockResolvedValue({
      externalIdpLinks: [],
      personalAccessTokens: [],
      availableScopes: ["venue:read"],
      rateLimitTelemetry: null,
      integrationsFeatureEnabled: true,
      patQuota: {
        activeCount: 5,
        maxLimit: 5,
        isUnlimited: false,
        remaining: 0,
        isEnabled: true,
      },
    });
    mockGetExternalLogins.mockResolvedValue([]);

    const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={qc}>{children}</QueryClientProvider>
    );

    const { result: ctxResult } = renderHook(() => useAccountContextSliceViewModel(), { wrapper });
    const { result: secResult } = renderHook(() => useAccountSecuritySliceViewModel(), { wrapper });
    const { result: intResult } = renderHook(() => useIntegrationsFederationViewModel(), { wrapper });

    await waitFor(() => {
      expect(ctxResult.current.featureFlags).toBeDefined();
      expect(secResult.current.security).toBeDefined();
      expect(intResult.current.isLoadingIntegrations).toBe(false);
    });

    expect(ctxResult.current.featureFlags).toEqual({
      integrationsEnabled: true,
      twoFactorEnabled: true,
      externalSsoEnabled: false,
      vacationDelegationEnabled: false,
      planAndQuotasEnabled: true,
    });
    expect(secResult.current.security?.isTwoFactorFeatureEnabled).toBe(true);
    expect(secResult.current.security?.isSsoFeatureEnabled).toBe(false);
    expect(secResult.current.security?.isSecurityPageEnabled).toBe(true);
    expect(intResult.current.integrationsFeatureEnabled).toBe(true);
    expect(mockGetExternalLogins).not.toHaveBeenCalled();
    expect(intResult.current.patQuota).toEqual({
      activeCount: 5,
      maxLimit: 5,
      isUnlimited: false,
      remaining: 0,
      isEnabled: true,
    });
  });

  it("IdentityChangeVerificationModal verifies Sudo in Step 1, blocks Step 2 when sent:false, and forwards otpCode in Step 3 with catch handling", async () => {
    const onVerifyStepUp = vi
      .fn()
      .mockRejectedValueOnce(new Error("Invalid TOTP code"))
      .mockResolvedValueOnce({ verified: true });
    const onSendOtp = vi
      .fn()
      .mockResolvedValueOnce({ sent: false, message: "Email already claimed" })
      .mockResolvedValueOnce({ sent: true });
    const onCommitChange = vi
      .fn()
      .mockRejectedValueOnce(new Error("Invalid verification OTP"))
      .mockResolvedValueOnce(undefined);
    const onOpenChange = vi.fn();

    render(
      <IdentityChangeVerificationModal
        open={true}
        mode="email"
        currentValue="old@scripe.org"
        onOpenChange={onOpenChange}
        onVerifyStepUp={onVerifyStepUp}
        onSendOtp={onSendOtp}
        onCommitChange={onCommitChange}
      />
    );

    // Step 1: failed verification stays on Step 1 and shows error
    fireEvent.change(screen.getByTestId("stepup-credential-input"), {
      target: { value: "111111" },
    });
    fireEvent.click(screen.getByTestId("identity-step-1-next-btn"));

    await waitFor(() => {
      expect(screen.getByTestId("identity-modal-error")).toHaveTextContent("Invalid TOTP code");
      expect(screen.getByTestId("identity-step-1")).toBeInTheDocument();
    });

    // Step 1: valid verification advances to Step 2
    fireEvent.change(screen.getByTestId("stepup-credential-input"), {
      target: { value: "222222" },
    });
    fireEvent.click(screen.getByTestId("identity-step-1-next-btn"));

    await waitFor(() => {
      expect(screen.getByTestId("identity-step-2")).toBeInTheDocument();
    });

    // Step 2: sent: false stays on Step 2 and displays backend message
    fireEvent.change(screen.getByTestId("identity-new-value-input"), {
      target: { value: "new.exec@scripe.org" },
    });
    fireEvent.click(screen.getByTestId("identity-step-2-send-otp-btn"));

    await waitFor(() => {
      expect(screen.getByTestId("identity-modal-error")).toHaveTextContent("Email already claimed");
      expect(screen.getByTestId("identity-step-2")).toBeInTheDocument();
    });

    // Step 2: sent: true advances to Step 3
    fireEvent.click(screen.getByTestId("identity-step-2-send-otp-btn"));
    await waitFor(() => {
      expect(screen.getByTestId("identity-step-3")).toBeInTheDocument();
    });

    // Step 3: failed commit stays open and displays error; retry succeeds and forwards otpCode
    fireEvent.change(screen.getByTestId("identity-otp-input"), {
      target: { value: "654321" },
    });
    fireEvent.click(screen.getByTestId("identity-step-3-commit-btn"));

    await waitFor(() => {
      expect(screen.getByTestId("identity-modal-error")).toHaveTextContent(
        "Invalid verification OTP"
      );
    });
    expect(onCommitChange).toHaveBeenCalledWith("email", "new.exec@scripe.org", "654321");
    expect(onOpenChange).not.toHaveBeenCalledWith(false);

    fireEvent.click(screen.getByTestId("identity-step-3-commit-btn"));
    await waitFor(() => {
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });
  });

  it("AccountLifecycleCard delegates policy-driven Sudo deactivation without hardcoded 6-digit TOTP input, ignores cancel cleanly, and ProfileInfoForm + EnrollPasskeyModal handle errors cleanly", async () => {
    const onDeactivate = vi
      .fn()
      .mockRejectedValueOnce(new Error("Sudo verification was cancelled."))
      .mockRejectedValueOnce(new Error("Forbidden: missing step-up token"))
      .mockResolvedValueOnce({ deactivated: true });

    const profile = {
      id: "adm-1",
      username: "exec.admin",
      email: "exec@scripe.org",
      firstName: "Exec",
      lastName: "Admin",
      isEmailVerified: true,
    } as unknown as AdminProfile;

    render(
      <AccountLifecycleCard
        profile={profile}
        isSolePrimaryOwner={false}
        primaryOrgName="City Club"
        onDeactivateAccount={onDeactivate}
      />
    );

    fireEvent.click(screen.getByTestId("open-deactivate-account-btn"));
    expect(screen.queryByTestId("deactivate-sudo-code-input")).not.toBeInTheDocument();

    fireEvent.change(screen.getByTestId("deactivate-confirm-username-input"), {
      target: { value: "exec.admin" },
    });

    // Cancellation closes step-up cleanly without surfacing spurious error alert
    fireEvent.click(screen.getByTestId("confirm-deactivate-account-btn"));
    await waitFor(() => {
      expect(onDeactivate).toHaveBeenCalledTimes(1);
    });
    expect(screen.queryByTestId("deactivate-error-alert")).not.toBeInTheDocument();
    expect(screen.getByTestId("deactivate-account-modal")).toBeInTheDocument();

    // Non-cancel error surfaces inside deactivate-error-alert keeping modal open
    fireEvent.click(screen.getByTestId("confirm-deactivate-account-btn"));
    await waitFor(() => {
      expect(screen.getByTestId("deactivate-error-alert")).toHaveTextContent(
        "Forbidden: missing step-up token"
      );
    });
    expect(onDeactivate).toHaveBeenCalledTimes(2);
    expect(screen.getByTestId("deactivate-account-modal")).toBeInTheDocument();

    // Retry succeeds and closes modal
    fireEvent.click(screen.getByTestId("confirm-deactivate-account-btn"));
    await waitFor(() => {
      expect(screen.queryByTestId("deactivate-account-modal")).not.toBeInTheDocument();
    });

    // ProfileInfoForm catches rejected onSubmit without throwing unhandled rejection
    const failingSave = vi.fn().mockRejectedValue(new Error("Save failed on server"));
    render(<ProfileInfoForm profile={profile} onSubmit={failingSave} isSubmitting={false} />);
    fireEvent.click(screen.getByTestId("edit-profile-btn"));
    fireEvent.submit(screen.getByTestId("personal-info-edit-form"));
    await waitFor(() => {
      expect(screen.getByText("Save failed on server")).toBeInTheDocument();
    });

    // EnrollPasskeyModal clears enrollError on close
    const onClearError = vi.fn();
    const onClose = vi.fn();
    render(
      <EnrollPasskeyModal
        isOpen={true}
        onClose={onClose}
        onClearError={onClearError}
        onEnroll={vi.fn()}
        isEnrolling={false}
        enrollError="Failed to register authenticator"
      />
    );
    fireEvent.click(screen.getByText("profile.common.cancel"));
    expect(onClearError).toHaveBeenCalled();
  });
});
