import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import type { AdminProfile } from "../../domain/entities/AdminProfile";
import { ProfileRailLayout } from "../components/ProfileRailLayout";
import { SovereignCommandBar } from "../components/SovereignCommandBar";
import { IntegrationsTelemetryStrip } from "../sections/integrations/IntegrationsTelemetryStrip";
import { PatConsoleListSection } from "../sections/integrations/PatConsoleListSection";
import { AccountIntegrationsView } from "../views/AccountIntegrationsView";
import { AccountSecurityView } from "../views/AccountSecurityView";
import { AccountGovernanceView } from "../views/AccountGovernanceView";
import { PatDetailPageView } from "../views/PatDetailPageView";

const mockContextVm = vi.fn();
const mockSecuritySliceVm = vi.fn();
const mockGovernanceSliceVm = vi.fn();
const mockColleaguesVm = vi.fn();
const mockIntegrationsVm = vi.fn();
const mockSecurityVaultVm = vi.fn();
const mockExternalLoginsVm = vi.fn();

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

vi.mock("@core/components/tenant-context", () => ({
  FeatureUnavailableGate: ({ featureKey }: { featureKey?: string | null }) => (
    <div data-testid="feature-unavailable-gate" data-feature-key={featureKey ?? ""} />
  ),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/account/security",
  useRouter: () => ({ replace: vi.fn(), push: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
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

vi.mock("../viewmodels/useSovereignAccountSlicesViewModel", () => ({
  useAccountContextSliceViewModel: () => mockContextVm(),
  useAccountSecuritySliceViewModel: () => mockSecuritySliceVm(),
  useAccountGovernanceSliceViewModel: () => mockGovernanceSliceVm(),
  useColleaguesSearchViewModel: () => mockColleaguesVm(),
}));

vi.mock("../viewmodels/useIntegrationsFederationViewModel", () => ({
  useIntegrationsFederationViewModel: () => mockIntegrationsVm(),
}));

vi.mock("../viewmodels/useSecurityVaultViewModel", () => ({
  useSecurityVaultViewModel: () => mockSecurityVaultVm(),
}));

vi.mock("../viewmodels/useExternalLoginsViewModel", () => ({
  useExternalLoginsViewModel: () => mockExternalLoginsVm(),
}));

const baseProfile = {
  firstName: "Tariq",
  lastName: "Nabil",
  username: "tariq",
  staffCode: "STF-10",
  availableAcademies: [],
} as unknown as AdminProfile;

describe("Milestone 9 Feature, Quota & Nav Rail Zero-Phantom-Feature Gating", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockContextVm.mockReturnValue({
      principalContext: {
        principalKind: "TenantUser",
        isSuperAdmin: false,
        controlPlaneLabel: "City FC",
        activeTenantName: "City FC",
        isSolePrimaryOwner: false,
        hasStandingRootAuthority: false,
        availableBranches: [],
      },
      featureFlags: {
        integrationsEnabled: true,
        twoFactorEnabled: true,
        externalSsoEnabled: true,
        vacationDelegationEnabled: true,
        planAndQuotasEnabled: true,
      },
    });
    mockSecuritySliceVm.mockReturnValue({
      security: {
        trustedCidrs: [],
        currentClientIp: "10.0.0.1",
        rowVersion: "1",
        isTwoFactorFeatureEnabled: true,
        isSsoFeatureEnabled: true,
        isSecurityPageEnabled: true,
      },
      isLoadingSecurity: false,
      updateSecurityPolicy: vi.fn(),
      isUpdatingPolicy: false,
      updatePolicyError: null,
    });
    mockGovernanceSliceVm.mockReturnValue({
      governance: {
        activeTenantName: "City FC",
        assignedRoles: [],
        allowedBranches: [],
        effectivePermissions: [],
        delegations: [],
        isDelegationFeatureEnabled: true,
      },
      isLoadingGovernance: false,
      createDelegation: vi.fn(),
      isCreatingDelegation: false,
      revokeDelegation: vi.fn(),
      isRevokingDelegation: false,
    });
    mockColleaguesVm.mockReturnValue({ colleagues: [], isSearchingColleagues: false });
    mockIntegrationsVm.mockReturnValue({
      personalTokens: [],
      availableScopes: ["venue:read"],
      rateLimitTelemetry: {
        rateLimitingEnabled: false,
        requestsPerMinuteLimit: null,
        configuredRequestsPerMinuteLimit: null,
        hourlyLimit: null,
        hourlyRequestsUsed: 0,
        hourlyRemaining: null,
        dailyRequestsUsed: 0,
        remainingQuotaPercentage: null,
      },
      patQuota: { activeCount: 5, maxLimit: 5, isUnlimited: false, remaining: 0, isEnabled: true },
      integrationsFeatureEnabled: true,
      isLoadingIntegrations: false,
      isCreatingToken: false,
      isRollingToken: false,
      isRevokingToken: false,
      createdTokenSecret: null,
      clearCreatedTokenSecret: vi.fn(),
      generateToken: vi.fn(),
      rollToken: vi.fn(),
      revokeToken: vi.fn(),
    });
    mockSecurityVaultVm.mockReturnValue({
      passkeys: [],
      isLoadingPasskeys: false,
      webAuthnSupported: true,
      isRemovingPasskey: false,
      isRenamingPasskey: false,
      isEnrollingPasskey: false,
      enrollError: null,
      detectDeviceBadge: () => "platform",
      isSudoActive: false,
      sudoExpiresAt: null,
      sudoMethodUsed: null,
      openSudoModal: vi.fn(),
      lockSudoSession: vi.fn(),
      isTwoFactorEnabled: false,
      backupCodesRemaining: 0,
      isBeginning2Fa: false,
      begin2FaSetup: vi.fn(),
      twoFaSetupData: null,
      clearTwoFaSetup: vi.fn(),
      confirm2Fa: vi.fn(),
      isConfirming2Fa: false,
      isDisabling2Fa: false,
      disable2FaError: null,
      disable2Fa: vi.fn(),
      isRegeneratingCodes: false,
      regenerateCodesError: null,
      regenerateBackupCodes: vi.fn(),
      isChangingPassword: false,
      changePasswordError: null,
      changePassword: vi.fn(),
      emergencyLockdown: vi.fn(),
      isLockingDown: false,
      enrollPasskey: vi.fn(),
      renamePasskey: vi.fn(),
      removePasskey: vi.fn(),
    });
    mockExternalLoginsVm.mockReturnValue({
      availableSsoProviders: [],
      externalLogins: [],
      orphanedExternalLogins: [],
      isLoading: false,
      isSudoActive: false,
      isUnlinking: false,
      isInitiatingLink: false,
      linkErrorMessage: null,
      resetLinkError: vi.fn(),
      unlink: vi.fn(),
      unlinkAsync: vi.fn(),
      initiateFederatedLink: vi.fn(),
      invalidateSsoQueries: vi.fn(),
    });
  });

  it("omits rate-limit card when unthrottled and shows finite PAT quota exhaustion state", () => {
    const t = (key: string, params?: Record<string, string | number>) =>
      params ? `${key}:${JSON.stringify(params)}` : key;

    render(
      <IntegrationsTelemetryStrip
        t={t}
        rateLimitTelemetry={{
          rateLimitingEnabled: false,
          requestsPerMinuteLimit: null,
          configuredRequestsPerMinuteLimit: 300,
          hourlyLimit: null,
          hourlyRequestsUsed: 4,
          hourlyRemaining: null,
          dailyRequestsUsed: 12,
          remainingQuotaPercentage: null,
        }}
        patQuota={{ activeCount: 5, maxLimit: 5, isUnlimited: false, remaining: 0, isEnabled: true }}
        activeTokensCount={5}
        cidrEnforcedCount={1}
        trustedCidrsCount={1}
        currentClientIp="197.38.14.88"
      />
    );
    expect(screen.queryByTestId("integrations-rate-limit-card")).not.toBeInTheDocument();
    expect(screen.getByTestId("integrations-active-pats-value")).toHaveTextContent("5 / 5");

    render(
      <IntegrationsTelemetryStrip
        t={t}
        rateLimitTelemetry={{
          rateLimitingEnabled: true,
          requestsPerMinuteLimit: 120,
          configuredRequestsPerMinuteLimit: 120,
          hourlyLimit: 1000,
          hourlyRequestsUsed: 100,
          hourlyRemaining: 900,
          dailyRequestsUsed: 250,
          remainingQuotaPercentage: 90,
        }}
        patQuota={{ activeCount: 1, maxLimit: 10, isUnlimited: false, remaining: 9, isEnabled: true }}
        activeTokensCount={1}
        cidrEnforcedCount={0}
        trustedCidrsCount={0}
        currentClientIp="197.38.14.88"
      />
    );
    expect(screen.getByTestId("integrations-rate-limit-card")).toBeInTheDocument();

    render(
      <PatConsoleListSection
        t={t}
        personalTokens={[]}
        patQuota={{ activeCount: 5, maxLimit: 5, isUnlimited: false, remaining: 0, isEnabled: true }}
        isRollingToken={false}
        isRevokingToken={false}
        onOpenCreate={vi.fn()}
        onRequestRoll={vi.fn()}
        onRequestRevoke={vi.fn()}
      />
    );
    expect(screen.getByTestId("open-create-pat-modal-btn")).toBeDisabled();
    expect(screen.getByTestId("pat-quota-reached-badge")).toBeInTheDocument();
    expect(screen.getByTestId("pat-quota-reached-hint")).toBeInTheDocument();
  });

  it("renders FeatureUnavailableGate and hides PAT controls when Integrations.ApiKeys.Enabled is false", () => {
    mockIntegrationsVm.mockReturnValue({
      ...mockIntegrationsVm(),
      integrationsFeatureEnabled: false,
      patQuota: { activeCount: 0, maxLimit: 0, isUnlimited: false, remaining: 0, isEnabled: false },
    });

    render(<AccountIntegrationsView />);
    const gate = screen.getByTestId("feature-unavailable-gate");
    expect(gate).toHaveAttribute("data-feature-key", "Integrations.ApiKeys.Enabled");
    expect(screen.queryByTestId("integrations-pat-console-card")).not.toBeInTheDocument();
    expect(screen.queryByTestId("open-create-pat-modal-btn")).not.toBeInTheDocument();
  });

  it("gates 2FA, SSO cards, and full page on /account/security by Edition flags while rendering SSO for PlatformAdmin with 0 logins", () => {
    const { rerender } = render(<AccountSecurityView />);
    expect(screen.getByTestId("connected-enterprise-sso-card")).toBeInTheDocument();
    expect(screen.getByText("profile.security.twoFactor.sectionTitle")).toBeInTheDocument();

    mockSecuritySliceVm.mockReturnValue({
      ...mockSecuritySliceVm(),
      security: {
        trustedCidrs: [],
        currentClientIp: "10.0.0.1",
        isTwoFactorFeatureEnabled: false,
        isSsoFeatureEnabled: false,
        isSecurityPageEnabled: true,
        availableSsoProviders: [],
      },
    });
    rerender(<AccountSecurityView />);
    expect(screen.queryByTestId("connected-enterprise-sso-card")).not.toBeInTheDocument();
    expect(screen.queryByText("profile.security.twoFactor.sectionTitle")).not.toBeInTheDocument();

    mockContextVm.mockReturnValue({
      principalContext: {
        principalKind: "PlatformAdmin",
        isSuperAdmin: true,
        controlPlaneLabel: "Global Control Plane",
        isSolePrimaryOwner: false,
        hasStandingRootAuthority: true,
        availableBranches: [],
      },
      featureFlags: {
        integrationsEnabled: true,
        twoFactorEnabled: true,
        externalSsoEnabled: true,
        vacationDelegationEnabled: true,
        planAndQuotasEnabled: false,
      },
    });
    mockSecuritySliceVm.mockReturnValue({
      ...mockSecuritySliceVm(),
      security: {
        trustedCidrs: [],
        currentClientIp: "10.0.0.1",
        isTwoFactorFeatureEnabled: true,
        isSsoFeatureEnabled: true,
        isSecurityPageEnabled: true,
        availableSsoProviders: [],
      },
    });
    rerender(<AccountSecurityView />);
    expect(screen.getByTestId("connected-enterprise-sso-card")).toBeInTheDocument();
    expect(screen.getByText("profile.security.twoFactor.sectionTitle")).toBeInTheDocument();

    mockSecuritySliceVm.mockReturnValue({
      ...mockSecuritySliceVm(),
      security: {
        trustedCidrs: [],
        currentClientIp: "10.0.0.1",
        isTwoFactorFeatureEnabled: true,
        isSsoFeatureEnabled: true,
        isSecurityPageEnabled: false,
        availableSsoProviders: [],
      },
    });
    rerender(<AccountSecurityView />);
    expect(screen.getByTestId("feature-unavailable-gate")).toBeInTheDocument();
  });

  it("gates delegation section on /account/governance by feature flag", () => {
    const { rerender } = render(<AccountGovernanceView />);
    expect(screen.getByTestId("governance-delegations-card")).toBeInTheDocument();

    mockGovernanceSliceVm.mockReturnValue({
      ...mockGovernanceSliceVm(),
      governance: {
        activeTenantName: "City FC",
        assignedRoles: [],
        allowedBranches: [],
        effectivePermissions: [],
        delegations: [],
        isDelegationFeatureEnabled: false,
      },
    });
    rerender(<AccountGovernanceView />);
    expect(screen.queryByTestId("governance-delegations-card")).not.toBeInTheDocument();
  });

  it("hides /account/integrations in ProfileRailLayout when integrationsEnabled is false", () => {
    render(
      <ProfileRailLayout
        profile={baseProfile}
        principalContext={{
          principalKind: "TenantUser",
          isSuperAdmin: false,
          controlPlaneLabel: "City",
          isSolePrimaryOwner: false,
          hasStandingRootAuthority: false,
          availableBranches: [],
        }}
        featureFlags={{
          integrationsEnabled: false,
          twoFactorEnabled: false,
          externalSsoEnabled: false,
          vacationDelegationEnabled: false,
          planAndQuotasEnabled: true,
        }}
      >
        <div>Body</div>
      </ProfileRailLayout>
    );
    expect(screen.queryByRole("link", { name: /profile\.rail\.integrations/i })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: /profile\.rail\.plan/i })).toBeInTheDocument();
  });

  it("gates /account/plan and /account/integrations in SovereignCommandBar by PlatformAdmin and featureFlags", () => {
    const { rerender } = render(<SovereignCommandBar open={true} onOpenChange={vi.fn()} />);
    expect(screen.getByTestId("command-bar-item-plan")).toBeInTheDocument();
    expect(screen.getByTestId("command-bar-item-integrations")).toBeInTheDocument();

    // PlatformAdmin hides /account/plan
    mockContextVm.mockReturnValue({
      principalContext: {
        principalKind: "PlatformAdmin",
        isSuperAdmin: true,
        controlPlaneLabel: "Global Control Plane",
        isSolePrimaryOwner: true,
        hasStandingRootAuthority: true,
        availableBranches: [],
      },
      featureFlags: {
        integrationsEnabled: false,
        twoFactorEnabled: true,
        externalSsoEnabled: false,
        vacationDelegationEnabled: false,
        planAndQuotasEnabled: false,
      },
    });
    rerender(<SovereignCommandBar open={true} onOpenChange={vi.fn()} />);
    expect(screen.queryByTestId("command-bar-item-plan")).not.toBeInTheDocument();
    expect(screen.queryByTestId("command-bar-item-integrations")).not.toBeInTheDocument();
  });

  it("keeps SecurityPageSkeleton mounted until security slice finishes loading and catches begin2FaSetup errors", async () => {
    // Passkeys finished (isLoadingPasskeys: false), but security is still loading (!security)
    mockSecuritySliceVm.mockReturnValue({
      security: undefined,
      isLoadingSecurity: true,
      isSecurityError: false,
      securityError: null,
      refetchSecurity: vi.fn(),
      updateSecurityPolicy: vi.fn(),
      isUpdatingPolicy: false,
      updatePolicyError: null,
    });
    const { rerender } = render(<AccountSecurityView />);
    expect(screen.getByTestId("security-skeleton")).toBeInTheDocument();

    // When security slice errors, renders AccountSliceErrorState with retry
    const refetchSecurity = vi.fn();
    mockSecuritySliceVm.mockReturnValue({
      security: undefined,
      isLoadingSecurity: false,
      isSecurityError: true,
      securityError: "Security posture unavailable",
      refetchSecurity,
      updateSecurityPolicy: vi.fn(),
      isUpdatingPolicy: false,
      updatePolicyError: null,
    });
    rerender(<AccountSecurityView />);
    expect(screen.getByTestId("account-slice-error")).toHaveTextContent(
      "Security posture unavailable"
    );

    // When loaded and begin2FaSetup rejects, catches rejection and renders two-fa-setup-error-alert
    const begin2FaSetup = vi.fn().mockRejectedValue(new Error("2FA provisioning service offline"));
    mockSecuritySliceVm.mockReturnValue({
      security: {
        trustedCidrs: [],
        currentClientIp: "10.0.0.1",
        isTwoFactorFeatureEnabled: true,
        isSsoFeatureEnabled: true,
        isSecurityPageEnabled: true,
      },
      isLoadingSecurity: false,
      isSecurityError: false,
      updateSecurityPolicy: vi.fn(),
      isUpdatingPolicy: false,
      updatePolicyError: null,
    });
    mockSecurityVaultVm.mockReturnValue({
      ...mockSecurityVaultVm(),
      begin2FaSetup,
    });
    rerender(<AccountSecurityView />);
    fireEvent.click(screen.getByText("common.enable"));
    await waitFor(() => {
      expect(screen.getByTestId("two-fa-setup-error-alert")).toHaveTextContent(
        "2FA provisioning service offline"
      );
    });
  });

  it("wires AccountGovernanceView Break-Glass submission to backend requestBreakGlass with error & success states", async () => {
    const requestBreakGlass = vi
      .fn()
      .mockRejectedValueOnce(new Error("Break-Glass policy denied"))
      .mockResolvedValueOnce({ id: "bg-1" });
    mockGovernanceSliceVm.mockReturnValue({
      ...mockGovernanceSliceVm(),
      governance: {
        activeTenantName: "City FC",
        assignedRoles: [{ name: "Ops Lead" }],
        allowedBranches: ["Main"],
        effectivePermissions: [
          {
            permission: "venue.bookings.manage",
            domain: "Venue",
            sourceEdition: "Enterprise",
            sourceBranch: "Main",
            sourceRole: "Ops Lead",
          },
        ],
        delegations: [],
        isDelegationFeatureEnabled: true,
      },
      requestBreakGlass,
      isRequestingBreakGlass: false,
    });

    render(<AccountGovernanceView />);

    fireEvent.change(screen.getByTestId("break-glass-ticket-input"), {
      target: { value: "INC-9001" },
    });
    fireEvent.change(screen.getByTestId("break-glass-reason-input"), {
      target: { value: "Emergency stadium gate override during cup final" },
    });
    fireEvent.click(screen.getByTestId("submit-break-glass-btn"));

    await waitFor(() => {
      expect(screen.getByTestId("break-glass-error-alert")).toHaveTextContent(
        "Break-Glass policy denied"
      );
    });

    fireEvent.click(screen.getByTestId("submit-break-glass-btn"));
    await waitFor(() => {
      expect(screen.getByTestId("break-glass-success-notice")).toBeInTheDocument();
    });
    expect(requestBreakGlass).toHaveBeenCalledWith({
      incidentTicketId: "INC-9001",
      justification: "Emergency stadium gate override during cup final",
      permissions: ["venue.bookings.manage"],
      durationHours: 2,
    });
  });

  it("prevents PatDetailPageView from flashing tokenNotFoundTitle while redirecting after revokeToken", async () => {
    let tokens = [
      {
        id: "pat-42",
        name: "Production Runner",
        description: "CI runner",
        prefix: "scr_live_42",
        scopes: ["venue:read"],
        scopeDetails: [],
        allowedCidrs: [],
        createdAt: new Date("2026-11-10T00:00:00Z"),
        expiresAt: new Date("2026-12-10T00:00:00Z"),
        lastUsedAt: null,
      },
    ];
    const revokeToken = vi.fn().mockImplementation(async () => {
      tokens = [];
    });
    mockIntegrationsVm.mockImplementation(() => ({
      personalTokens: tokens,
      scopeCatalog: [],
      availableScopes: ["venue:read"],
      rateLimitTelemetry: null,
      patQuota: { activeCount: 1, maxLimit: 5, isUnlimited: false, remaining: 4, isEnabled: true },
      integrationsFeatureEnabled: true,
      isLoadingIntegrations: false,
      isUpdatingToken: false,
      isRollingToken: false,
      isRevokingToken: false,
      pendingSecretReceipt: null,
      clearCreatedTokenSecret: vi.fn(),
      updateToken: vi.fn(),
      rollToken: vi.fn(),
      revokeToken,
    }));

    const { rerender } = render(<PatDetailPageView tokenId="pat-42" />);
    fireEvent.click(screen.getByTestId("revoke-pat-btn-pat-42"));
    fireEvent.click(screen.getByTestId("confirm-revoke-pat-btn"));

    await waitFor(() => {
      expect(revokeToken).toHaveBeenCalledWith("pat-42");
    });

    rerender(<PatDetailPageView tokenId="pat-42" />);
    expect(
      screen.queryByText("profile.integrations.tokenNotFoundTitle")
    ).not.toBeInTheDocument();
    expect(screen.getByTestId("pat-detail-skeleton")).toBeInTheDocument();
  });
});
