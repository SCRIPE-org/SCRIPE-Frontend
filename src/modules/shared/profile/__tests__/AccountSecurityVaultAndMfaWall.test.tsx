import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor, renderHook, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAppStore } from "@core/store/useAppStore";
import { useSudoStore } from "@core/store/useSudoStore";
import { User } from "@modules/auth/core/domain/entities/User";
import { mapSecuritySlice } from "@modules/profile/core/src/data/mappers/SovereignAccountIdentityMapper";
import type { SovereignSecuritySlice } from "@modules/profile/core/src/domain/entities/SovereignAccountEntities";
import { useSecurityVaultViewModel } from "@modules/profile/core/src/presentation/viewmodels/useSecurityVaultViewModel";
import {
  useAccountSecuritySliceViewModel,
  useSovereignAccountContextSlice,
} from "@modules/profile/core/src/presentation/viewmodels/useSovereignAccountSlicesViewModel";
import {
  useSessionsFleetViewModel,
  sessionsFleetKeys,
} from "@modules/profile/core/src/presentation/viewmodels/useSessionsFleetViewModel";
import { useProfileDossierViewModel } from "@modules/profile/core/src/presentation/viewmodels/useProfileDossierViewModel";
import { useSovereignPreferencesSlice } from "@modules/profile/core/src/presentation/viewmodels/useSovereignWorkstationSlicesViewModel";
import { useExternalLoginsViewModel } from "@modules/profile/core/src/presentation/viewmodels/useExternalLoginsViewModel";
import { useIntegrationsFederationViewModel } from "@modules/profile/core/src/presentation/viewmodels/useIntegrationsFederationViewModel";
import { sovereignAccountKeys } from "@modules/profile/core/src/presentation/utils/sovereignAccountKeys";
import { AccountSecurityView } from "@modules/profile/core/src/presentation/views/AccountSecurityView";
import { ProfileRailLayout } from "@modules/profile/core/src/presentation/components/ProfileRailLayout";
import { ProfileTelemetryHud } from "@modules/profile/core/src/presentation/components/ProfileTelemetryHud";
import { buildPostureChecklistItems } from "@modules/profile/core/src/presentation/components/ProfilePostureChecklistDialog";
import { EmergencyLockdownDialog } from "@modules/profile/core/src/presentation/components/EmergencyLockdownDialog";
import { EmergencyLockdownShieldCard } from "@modules/profile/core/src/presentation/components/EmergencyLockdownShieldCard";
import { PasskeyRenameDeleteModals } from "@modules/profile/core/src/presentation/sections/security/PasskeyRenameDeleteModals";
import { TrustedCidrSubnetRow } from "@modules/profile/core/src/presentation/components/TrustedCidrSubnetRow";
import { TwoFactorScanStep, TwoFactorVerifyStep } from "@modules/profile/core/src/presentation/components/TwoFactorWizardStepPanels";
import { TwoFactorBackupStep } from "@modules/profile/core/src/presentation/components/TwoFactorBackupStepPanel";
import { EnrollPasskeyNameStep } from "@modules/profile/core/src/presentation/components/EnrollPasskeyStepPanels";
import { EnterpriseSsoProviderTile } from "@modules/profile/core/src/presentation/components/EnterpriseSsoProviderTile";
import { ProfileInfoEditForm } from "@modules/profile/core/src/presentation/components/ProfileInfoEditForm";
import { Dialog, DialogContent } from "@core/ui/dialog";
import type { AdminProfile } from "@modules/profile/core/src/domain/entities/AdminProfile";
import type { PasskeyCredential } from "@modules/profile/core/src/domain/entities/PasskeyCredential";
import type { PasswordPolicyModel } from "@core/common/password-policy";

const mocks = vi.hoisted(() => ({
  replace: vi.fn(),
  push: vi.fn(),
  getProfile: vi.fn(),
  getContext: vi.fn(),
  getSecurity: vi.fn(),
  getPreferences: vi.fn(),
  getIntegrations: vi.fn(),
  getExternalLogins: vi.fn(),
  getSessions: vi.fn(),
  getSovereignSessions: vi.fn(),
  revokeSession: vi.fn(),
  revokeAllOtherSessions: vi.fn(),
  getPasswordPolicy: vi.fn(),
  listPasskeys: vi.fn(),
  removePasskey: vi.fn(),
  renamePasskey: vi.fn(),
  enable2FA: vi.fn(),
  confirm2FA: vi.fn(),
  refreshToken: vi.fn(),
  clipboardWriteText: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mocks.replace, push: mocks.push }),
  usePathname: () => "/account/security",
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock("next/image", () => ({
  default: ({ alt = "", ...props }: { alt?: string; [key: string]: unknown }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt} {...props} />
  ),
}));

vi.mock("@core/providers/i18n-provider", () => ({
  useI18n: () => ({
    t: (key: string, params?: Record<string, string | number>) =>
      params && Object.keys(params).length > 0 && !("defaultValue" in params)
        ? `${key}:${JSON.stringify(params)}`
        : key,
    direction: "ltr" as const,
    language: "en" as const,
    isRtl: false,
    setLanguage: vi.fn(),
  }),
}));

vi.mock("@core/ui/sileo-toast", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
  },
}));

vi.mock("@core/components/tenant-context", () => ({
  FeatureUnavailableGate: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock("@core/providers/service-provider", () => ({
  useServices: () => ({
    authRepository: {
      logout: vi.fn(),
      refreshToken: () => mocks.refreshToken(),
    },
  }),
}));

vi.mock("@core/services/webauthn.service", () => ({
  isWebAuthnAvailable: () => Promise.resolve(true),
  isPlatformAuthenticatorAvailable: () => Promise.resolve(true),
  isWebAuthnSupported: () => true,
  detectDeviceBadge: () => "platform",
  detectClientDevice: vi.fn().mockResolvedValue({
    os: "Windows",
    browser: "Chrome",
    platformName: "Windows Hello",
    suggestedLabel: "Chrome on Windows",
  }),
  assertPasskey: vi.fn(),
  createPasskeyCredential: vi.fn(),
}));

vi.mock("@modules/profile/di", () => ({
  container: {
    profileRepository: {
      getProfile: () => mocks.getProfile(),
      getExternalLogins: () => mocks.getExternalLogins(),
    },
    securityRepository: {
      listPasskeys: () => mocks.listPasskeys(),
      getPasswordPolicy: () => mocks.getPasswordPolicy(),
      getSessions: () => mocks.getSessions(),
      revokeSession: (id: string) => mocks.revokeSession(id),
      revokeAllOtherSessions: () => mocks.revokeAllOtherSessions(),
      enable2FA: () => mocks.enable2FA(),
      confirm2FA: (code: string) => mocks.confirm2FA(code),
      removePasskey: (id: string, sudoToken?: string) => mocks.removePasskey(id, sudoToken),
      renamePasskey: (id: string, newName: string, sudoToken?: string) =>
        mocks.renamePasskey(id, newName, sudoToken),
      disable2FA: vi.fn(),
      regenerateBackupCodes: vi.fn(),
      changePassword: vi.fn(),
      lockSudoSession: vi.fn(),
      emergencyLockdown: vi.fn(),
      getSudoStatus: vi.fn().mockResolvedValue({ isElevated: false }),
    },
    sovereignAccountRepository: {
      getContext: () => mocks.getContext(),
      getSecurity: () => mocks.getSecurity(),
      getPreferences: () => mocks.getPreferences(),
      getIntegrations: () => mocks.getIntegrations(),
      getSessions: () => mocks.getSovereignSessions(),
    },
  },
}));

const PASSWORD_POLICY: PasswordPolicyModel = {
  minLength: 12,
  maxLength: 128,
  requireUppercase: true,
  requireLowercase: true,
  requireNumber: true,
  requireSpecial: true,
  historyCount: 5,
  checkBreachedPasswords: false,
  expiryDays: 90,
};

function createTestClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
}

function createWrapper(client = createTestClient()) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  };
}

function buildSecuritySlice(overrides: Partial<SovereignSecuritySlice> = {}): SovereignSecuritySlice {
  return {
    isTwoFactorEnabled: false,
    isTwoFactorFeatureEnabled: true,
    isSsoFeatureEnabled: true,
    isSecurityPageEnabled: true,
    backupCodesRemaining: 0,
    passwordLastChangedUtc: null,
    isPasswordExpired: false,
    daysUntilPasswordExpiry: null,
    passkeyCount: 0,
    hardwareKeyCount: 0,
    securityPostureScore: 45,
    postureChecklist: [],
    trustedCidrs: [],
    sudoActive: false,
    sudoExpiresAtUtc: null,
    currentClientIp: "192.168.1.10",
    isCurrentIpAllowed: true,
    availableSsoProviders: [],
    passwordPolicy: PASSWORD_POLICY,
    rowVersion: "v1",
    ...overrides,
  };
}

describe("Account security vault contracts, wizard recovery step, and MFA wall", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAppStore.setState({
      user: null,
      tenantCode: null,
      requireMfaEnrollment: false,
    });
    useSudoStore.getState().markLocked();

    mocks.listPasskeys.mockResolvedValue([]);
    mocks.getPasswordPolicy.mockResolvedValue(PASSWORD_POLICY);
    mocks.getSecurity.mockResolvedValue(buildSecuritySlice());
    mocks.getProfile.mockResolvedValue({ id: "u-1" });
    mocks.getContext.mockResolvedValue({
      principalContext: { principalKind: "TenantUser", activeTenantName: "Al-Ahly SC" },
      featureFlags: {},
      securityPostureScore: 70,
      postureChecklist: [],
      activeSessionsCount: 2,
    });
    mocks.getPreferences.mockResolvedValue({});
    mocks.getIntegrations.mockResolvedValue({ scopeCatalog: [], personalAccessTokens: [] });
    mocks.getExternalLogins.mockResolvedValue([]);
    mocks.getSessions.mockResolvedValue([]);
    mocks.getSovereignSessions.mockResolvedValue({ sessions: [] });
    mocks.clipboardWriteText.mockResolvedValue(undefined);

    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: mocks.clipboardWriteText },
      configurable: true,
    });
  });

  afterEach(() => {
    useAppStore.setState({
      user: null,
      tenantCode: null,
      requireMfaEnrollment: false,
    });
  });

  it("maps and reads 2FA status and password expiry strictly from AccountSecurityDto without calling /dossier", async () => {
    const rawSecurity = mapSecuritySlice({
      securityScore: 85,
      isTwoFactorEnabled: true,
      backupCodesRemaining: 4,
      passwordLastChangedUtc: "2026-01-15T10:00:00Z",
      isPasswordExpired: true,
      daysUntilPasswordExpiry: 0,
      passkeys: [],
      allowedCidrs: [],
      isClientIpAllowed: true,
      availableSsoProviders: [],
    });

    expect(rawSecurity.isTwoFactorEnabled).toBe(true);
    expect(rawSecurity.backupCodesRemaining).toBe(4);
    expect(rawSecurity.passwordLastChangedUtc).toBe("2026-01-15T10:00:00Z");
    expect(rawSecurity.isPasswordExpired).toBe(true);
    expect(rawSecurity.daysUntilPasswordExpiry).toBe(0);

    mocks.getSecurity.mockResolvedValue(rawSecurity);

    const wrapper = createWrapper();
    const { result: sliceResult } = renderHook(() => useAccountSecuritySliceViewModel(), { wrapper });

    await waitFor(() => expect(sliceResult.current.security).toBeDefined());
    expect(sliceResult.current.security?.isTwoFactorEnabled).toBe(true);
    expect(sliceResult.current.security?.backupCodesRemaining).toBe(4);
    expect(sliceResult.current.security?.passwordLastChangedUtc).toBe("2026-01-15T10:00:00Z");
    expect(sliceResult.current.security?.isPasswordExpired).toBe(true);
    expect(sliceResult.current.security?.daysUntilPasswordExpiry).toBe(0);

    render(<AccountSecurityView />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText("profile.security.passwordExpired")).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText("profile.security.twoFactorCodePlaceholder")
      ).toBeInTheDocument();
      expect(screen.getByText("profile.security.twoFactor.enabled")).toBeInTheDocument();
    });

    expect(mocks.getProfile).not.toHaveBeenCalled();
  });

  it("keeps TwoFactorWizardModal open on the backup recovery codes step after confirm and finalizes MFA enrollment only on Done", async () => {
    useAppStore.getState().setRequireMfaEnrollment(true);
    mocks.getSecurity.mockResolvedValue(buildSecuritySlice({ isTwoFactorEnabled: false }));
    mocks.enable2FA.mockResolvedValueOnce({
      qrCodeUri: "otpauth://totp/SCRIPE:karim?secret=JBSWY3DPEHPK3PXP",
      manualEntryKey: "JBSWY3DPEHPK3PXP",
      backupCodes: ["REC-CODE-01", "REC-CODE-02"],
    });
    mocks.confirm2FA.mockResolvedValueOnce(undefined);
    mocks.refreshToken.mockResolvedValueOnce({
      kind: "ok",
      value: { requireMfaEnrollment: false },
    });

    const wrapper = createWrapper();
    render(<AccountSecurityView />, { wrapper });

    const enableButton = await screen.findByRole("button", {
      name: "common.enable",
    });
    fireEvent.click(enableButton);

    const continueButton = await screen.findByRole("button", {
      name: "profile.common.continue",
    });
    fireEvent.click(continueButton);

    const codeInput = await screen.findByPlaceholderText("000000");
    fireEvent.change(codeInput, { target: { value: "123456" } });
    fireEvent.click(
      screen.getByRole("button", { name: "profile.security.twoFactor.setup.verifyButton" })
    );

    await waitFor(() => {
      expect(mocks.confirm2FA).toHaveBeenCalledWith("123456");
      expect(
        screen.getByText("profile.security.twoFactor.setup.backupTitle")
      ).toBeInTheDocument();
      expect(screen.getByText("REC-CODE-01")).toBeInTheDocument();
      expect(screen.getByText("REC-CODE-02")).toBeInTheDocument();
    });

    // Must not clear enrollment or navigate until the user closes/finishes the recovery code step
    expect(mocks.refreshToken).not.toHaveBeenCalled();
    expect(mocks.replace).not.toHaveBeenCalled();

    fireEvent.click(
      screen.getByRole("button", { name: "profile.security.twoFactor.setup.copyCodes" })
    );
    expect(mocks.clipboardWriteText).toHaveBeenCalledWith("REC-CODE-01\nREC-CODE-02");

    fireEvent.click(screen.getByRole("button", { name: "profile.common.done" }));

    await waitFor(() => {
      expect(mocks.refreshToken).toHaveBeenCalledTimes(1);
      expect(useAppStore.getState().requireMfaEnrollment).toBe(false);
      expect(mocks.replace).toHaveBeenCalledWith("/");
    });
  });

  it("invalidates fleet sessions, sovereign sessions, and sovereign context caches when revoking sessions", async () => {
    mocks.getSessions.mockResolvedValue([
      {
        id: "sess-1",
        deviceName: "Current",
        isCurrentSession: true,
        lastActiveAt: new Date(),
      },
      {
        id: "sess-2",
        deviceName: "Mobile",
        isCurrentSession: false,
        lastActiveAt: new Date(),
      },
    ]);
    mocks.revokeSession.mockResolvedValue(undefined);
    mocks.revokeAllOtherSessions.mockResolvedValue(undefined);

    const queryClient = createTestClient();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");
    const wrapper = createWrapper(queryClient);

    const { result } = renderHook(() => useSessionsFleetViewModel(), { wrapper });
    await waitFor(() => expect(result.current.sessions).toHaveLength(2));

    await act(async () => {
      await result.current.revokeSession("sess-2");
    });

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: sessionsFleetKeys.list() });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: sovereignAccountKeys.sessions() });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: sovereignAccountKeys.context() });

    invalidateSpy.mockClear();

    await act(async () => {
      await result.current.revokeAllOtherSessions();
    });

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: sessionsFleetKeys.list() });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: sovereignAccountKeys.sessions() });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: sovereignAccountKeys.context() });
  });

  it("gates blocked account queries, renders identity fallbacks cleanly, and hides non-enrollment controls behind mfa_enroll wall", async () => {
    const tenantUser = new User({
      id: "admin-1",
      username: "karim.admin",
      firstName: "Karim",
      lastName: "Hassan",
      phoneNumber: "+201000000000",
      adminTypeName: "TenantAdmin",
      email: "karim@ahly.test",
      tenantId: "tenant-ahly",
      isSuperAdmin: false,
    });

    useAppStore.setState({
      user: tenantUser,
      tenantCode: "ahly",
      requireMfaEnrollment: true,
    });

    const wrapper = createWrapper();
    renderHook(
      () => ({
        dossier: useProfileDossierViewModel(),
        preferences: useSovereignPreferencesSlice(),
        externalLogins: useExternalLoginsViewModel(),
        integrations: useIntegrationsFederationViewModel(),
        context: useSovereignAccountContextSlice(),
        fleet: useSessionsFleetViewModel(),
      }),
      { wrapper }
    );

    expect(mocks.getProfile).not.toHaveBeenCalled();
    expect(mocks.getPreferences).not.toHaveBeenCalled();
    expect(mocks.getExternalLogins).not.toHaveBeenCalled();
    expect(mocks.getIntegrations).not.toHaveBeenCalled();
    expect(mocks.getContext).not.toHaveBeenCalled();
    expect(mocks.getSessions).not.toHaveBeenCalled();

    render(
      <ProfileRailLayout profile={undefined} isLoading={true}>
        <ProfileTelemetryHud
          profile={undefined}
          accountContext={undefined}
          security={{
            securityPostureScore: 65,
            postureChecklist: [],
            isTwoFactorEnabled: false,
          }}
          isLoading={true}
        />
        <AccountSecurityView />
      </ProfileRailLayout>,
      { wrapper }
    );

    await waitFor(() => {
      expect(screen.getByTestId("mfa-enrollment-required-banner")).toBeInTheDocument();
      const lockedNotice = screen.getByTestId("mfa-enroll-locked-controls-notice");
      expect(lockedNotice).toBeInTheDocument();
      expect(lockedNotice.className).not.toContain("bg-nx-surface-2");
    });

    // Security slice 2FA status overrides stale profile.isTwoFactorEnabled=false in posture checklist fallback
    const checklistWithStaleProfile = buildPostureChecklistItems(
      null,
      { isTwoFactorEnabled: false, email: "karim@ahly.test", phoneNumber: "+201000000000" } as AdminProfile,
      (key) => key,
      { isTwoFactorEnabled: true, postureChecklist: [], isPasswordExpired: false }
    );
    expect(checklistWithStaleProfile.find((item) => item.key === "totp")?.done).toBe(true);

    // Rail renders authentic fallback identity without stuck skeletons
    expect(screen.getByText("Karim Hassan")).toBeInTheDocument();
    expect(screen.getByText("@karim.admin")).toBeInTheDocument();

    // HUD displays real /account/security posture score and resolved tenant context
    expect(screen.getByText("65%")).toBeInTheDocument();
    expect(screen.getByText("ahly")).toBeInTheDocument();
    expect(screen.queryByText("profile.hud.noOrganizationScoped")).not.toBeInTheDocument();

    // Non-enrollment controls remain hidden while Passkeys + TOTP enrollment remain available
    expect(screen.queryByTestId("connected-enterprise-sso-card")).not.toBeInTheDocument();
    expect(screen.queryByText("profile.security.changePassword")).not.toBeInTheDocument();
    expect(screen.queryByTestId("trusted-cidr-shield-card")).not.toBeInTheDocument();
  });

  it("enforces EmergencyLockdownDialog error alerts & lock guard, proactive Sudo on passkey delete/rename without cancel alerts, BiDi/390px/a11y polish, and localized role fallback", async () => {
    // 1. EmergencyLockdownDialog: blocks Escape close during isLockingDown, surfaces real errors, ignores Sudo cancel
    const onCloseLockdown = vi.fn();
    const onConfirmLockdown = vi
      .fn()
      .mockRejectedValueOnce(new Error("Sudo verification was cancelled."))
      .mockRejectedValueOnce(new Error("Too many lockdown attempts (429)"));

    const { rerender } = render(
      <EmergencyLockdownDialog
        isOpen={true}
        onClose={onCloseLockdown}
        onConfirmLockdown={onConfirmLockdown}
        isLockingDown={true}
      />
    );
    fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });
    expect(onCloseLockdown).not.toHaveBeenCalled();

    rerender(
      <EmergencyLockdownDialog
        isOpen={true}
        onClose={onCloseLockdown}
        onConfirmLockdown={onConfirmLockdown}
        isLockingDown={false}
      />
    );
    fireEvent.change(screen.getByLabelText(/profile\.lockdown\.typePrompt/i), {
      target: { value: "LOCKDOWN" },
    });
    fireEvent.click(screen.getByRole("button", { name: "profile.lockdown.executeBtn" }));
    await waitFor(() => expect(onConfirmLockdown).toHaveBeenCalledTimes(1));
    expect(screen.queryByTestId("lockdown-error-alert")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "profile.lockdown.executeBtn" }));
    await waitFor(() => {
      expect(screen.getByTestId("lockdown-error-alert")).toHaveTextContent(
        "Too many lockdown attempts (429)"
      );
    });

    // 2. Proactive Sudo elevation on passkey delete/rename + zero Sudo-cancel alert in PasskeyRenameDeleteModals
    useSudoStore.getState().reset();
    mocks.removePasskey.mockResolvedValue(undefined);
    mocks.renamePasskey.mockResolvedValue(undefined);
    const qc = createTestClient();
    const wrapper = createWrapper(qc);
    const { result: vault } = renderHook(() => useSecurityVaultViewModel(), { wrapper });

    const renamePromise = vault.current.renamePasskey({ id: "pk-1", newName: "Work YubiKey" });
    await waitFor(() => expect(useSudoStore.getState().modalOpen).toBe(true));
    act(() => {
      useSudoStore.getState().markVerified({
        sudoToken: "sudo-pk-tok",
        expiresAtUtc: new Date(Date.now() + 600_000).toISOString(),
        methodUsed: "passkey",
        mandatoryFactorPolicy: "PasskeyRequired",
      });
    });
    await renamePromise;
    expect(mocks.renamePasskey).toHaveBeenCalledWith("pk-1", "Work YubiKey", "sudo-pk-tok");

    await act(async () => {
      await vault.current.removePasskey("pk-1");
    });
    expect(mocks.removePasskey).toHaveBeenCalledWith("pk-1", "sudo-pk-tok");

    const pk = { id: "pk-1", deviceName: "YubiKey" } as unknown as PasskeyCredential;
    const cancelDelete = vi.fn().mockRejectedValue(new Error("Sudo verification was cancelled."));
    render(
      <PasskeyRenameDeleteModals
        t={(k) => k}
        totalPasskeysCount={2}
        renameTarget={null}
        isRenamingPasskey={false}
        deleteTarget={pk}
        isRemovingPasskey={false}
        onRenameClose={vi.fn()}
        onRenameSubmit={vi.fn()}
        onDeleteClose={vi.fn()}
        onConfirmDelete={cancelDelete}
      />
    );
    fireEvent.click(screen.getByTestId("confirm-delete-passkey-btn"));
    await waitFor(() => expect(cancelDelete).toHaveBeenCalledTimes(1));
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();

    // 3. BiDi dir="ltr" on CIDR/2FA/Email, <form onSubmit> + maxLength={200}, 390px flex-col wrap, safe unlink
    render(
      <TrustedCidrSubnetRow
        subnet={{ cidr: "192.168.10.0/24", label: "HQ" }}
        index={0}
        isCopied={false}
        onCopy={vi.fn()}
        onRemove={vi.fn()}
      />
    );
    expect(screen.getByText("192.168.10.0/24").closest("bdi")).toHaveAttribute("dir", "ltr");

    render(
      <Dialog open={true} onOpenChange={vi.fn()}>
        <DialogContent>
          <TwoFactorVerifyStep
            totpCode="123456"
            confirmError={null}
            isConfirming={false}
            onCodeChange={vi.fn()}
            onBack={vi.fn()}
            onVerify={vi.fn()}
          />
          <TwoFactorScanStep
            setupData={{ qrCodeDataUri: "", manualEntryKey: "JBSWY3DPEHPK3PXP", backupCodes: [] }}
            copiedKey={false}
            onCopyKey={vi.fn()}
            onClose={vi.fn()}
            onContinue={vi.fn()}
          />
          <TwoFactorBackupStep
            backupCodes={["AAAA-BBBB-CCCC-DDDD"]}
            copiedBackupCodes={false}
            onCopyCodes={vi.fn()}
            onDownloadCodes={vi.fn()}
            onDone={vi.fn()}
          />
          <EnrollPasskeyNameStep
            selectedMode="platform"
            deviceName="MacBook Touch ID"
            isEnrolling={false}
            enrollError={null}
            onDeviceNameChange={vi.fn()}
            onBack={vi.fn()}
            onActivate={vi.fn()}
          />
        </DialogContent>
      </Dialog>
    );
    render(
      <>
        <EmergencyLockdownShieldCard onOpenLockdown={vi.fn()} />
        <ProfileInfoEditForm
          firstName="Tariq"
          lastName="Nabil"
          phoneNumber=""
          adminTypeName=""
          bio=""
          isSubmitting={false}
          customFields={[]}
          customFieldValues={{}}
          onFirstNameChange={vi.fn()}
          onLastNameChange={vi.fn()}
          onPhoneNumberChange={vi.fn()}
          onBioChange={vi.fn()}
          onCancel={vi.fn()}
          onSubmit={vi.fn()}
        />
      </>
    );

    const totpInput = document.getElementById("totp-input") as HTMLInputElement;
    expect(totpInput).toHaveAttribute("inputmode", "numeric");
    expect(totpInput).toHaveAttribute("dir", "ltr");
    expect(totpInput.closest("form")).not.toBeNull();
    expect(screen.getByText("JBSWY3DPEHPK3PXP").closest("div[dir='ltr']")).not.toBeNull();
    expect(screen.getByText("AAAA-BBBB-CCCC-DDDD").closest("div[dir='ltr']")).not.toBeNull();
    const passkeyInput = screen.getByTestId("passkey-name-input") as HTMLInputElement;
    expect(passkeyInput).toHaveAttribute("maxlength", "200");
    expect(passkeyInput.closest("form")).not.toBeNull();
    expect(screen.getByTestId("trigger-lockdown-btn").parentElement?.className).toContain("flex-col");
    expect(screen.getByText("profile.roleDefault")).toBeInTheDocument();
    expect(screen.queryByText("SuperAdmin")).not.toBeInTheDocument();

    // 4. EnterpriseSsoProviderTile safe async unlink without unhandled rejection + BiDi email
    const failingUnlink = vi.fn().mockRejectedValue(new Error("Sudo verification was cancelled."));
    render(
      <EnterpriseSsoProviderTile
        provider={{
          encryptedId: "idp-1",
          name: "Okta",
          slug: "okta",
          protocol: "oidc",
          scope: "Global",
          isLinked: true,
          externalLoginId: "ext-1",
          linkedEmail: "sec@club.com",
          linkedAtUtc: null,
          iconUrl: null,
          buttonColor: null,
          displayOrder: 1,
        }}
        isUnlinking={false}
        onConnect={vi.fn()}
        onDisconnect={failingUnlink}
      />
    );
    expect(screen.getByText("sec@club.com").closest("bdi")).toHaveAttribute("dir", "ltr");
    fireEvent.click(screen.getByTestId("disconnect-sso-okta"));
    fireEvent.click(screen.getByTestId("confirm-unlink-okta"));
    await waitFor(() => expect(failingUnlink).toHaveBeenCalledWith("ext-1"));
  });
});
