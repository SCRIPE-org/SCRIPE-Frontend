import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor, renderHook, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SudoCancelledError } from "@core/store/useSudoStore";
import type { IApiService } from "@core/interfaces/api.interface";
import { Admin } from "../../domain/entities/Admin";
import { AdminService } from "../../data/services/AdminService";
import { AdminRepository } from "../../data/repositories/AdminRepository";
import { ResetPasswordDialog } from "../components/AdminRoleDialogs";
import { ResetAdminMfaDialog } from "../components/ResetAdminMfaDialog";

const { mockAdminRepo, mockSuccessToast, mockErrorToast, mockInfoToast } = vi.hoisted(() => ({
  mockAdminRepo: {
    resetPassword: vi.fn(),
    resetMfa: vi.fn(),
  },
  mockSuccessToast: vi.fn(),
  mockErrorToast: vi.fn(),
  mockInfoToast: vi.fn(),
}));

vi.mock("@modules/identity/di", () => ({
  identityContainer: {
    adminRepository: mockAdminRepo,
    roleRepository: { getAll: vi.fn(), getCurrentTenantRoles: vi.fn() },
    userGroupRepository: { getAll: vi.fn(), getCurrentTenantGroups: vi.fn() },
  },
}));

vi.mock("@core/providers/service-provider", () => ({
  useServices: () => ({ authRepository: {} }),
}));

vi.mock("@core/providers/navigation-provider", () => ({
  useOptionalNavigation: () => ({ refreshNavigation: vi.fn() }),
}));

vi.mock("@core/hooks/use-permission", () => ({
  usePermission: () => true,
}));

vi.mock("@core/hooks/use-auth-bridge", () => ({
  useCoreImpersonation: () => ({ startImpersonation: vi.fn(), isImpersonationLoading: false }),
}));

vi.mock("@core/hooks/use-enhanced-toast", () => ({
  useEnhancedToast: () => ({
    toast: vi.fn(),
    success: mockSuccessToast,
    error: mockErrorToast,
    info: mockInfoToast,
  }),
}));

vi.mock("@core/providers/i18n-provider", () => ({
  useI18n: () => ({
    t: (key: string, params?: Record<string, string | number>) => {
      if (!params) return key;
      let msg = key;
      for (const [k, v] of Object.entries(params)) {
        msg = `${msg} ${k}=${v}`;
      }
      return msg;
    },
    direction: "ltr" as const,
    language: "en" as const,
    isRtl: false,
  }),
}));

vi.mock("@core/providers/settings-provider", () => ({
  useSettings: () => ({
    inputStyle: "default",
    checkboxStyle: "default",
    buttonStyle: "default",
    modalStyle: "centered",
    spacingSize: "default",
  }),
}));

vi.mock("@core/crud/components/generic-modal", () => ({
  GenericModal: ({
    open,
    title,
    children,
  }: {
    open: boolean;
    title: string;
    children: React.ReactNode;
  }) =>
    open ? (
      <div role="dialog" aria-label={title}>
        <h2>{title}</h2>
        {children}
      </div>
    ) : null,
}));

import { useAdminOperations } from "../viewmodels/useAdminOperations";

const sampleAdmin = new Admin({
  id: "adm-1",
  username: "ahly.ops",
  firstName: "Ahly",
  lastName: "Ops",
  email: "ops@ahly.club",
  isActive: true,
  createdAt: "2026-10-01T00:00:00Z",
  modifiedAt: "2026-10-01T00:00:00Z",
});

function createWrapper() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  };
}

describe("Admin security recovery dialogs (PWD-02 link-only password reset & PWD-07 MFA reset)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("ResetPasswordDialog renders link-only confirmation flow without password inputs and dispatches optional audit reason", async () => {
    const onResetPassword = vi.fn().mockResolvedValue(undefined);
    const onOpenChange = vi.fn();

    render(
      <ResetPasswordDialog
        open={true}
        onOpenChange={onOpenChange}
        admin={sampleAdmin}
        onResetPassword={onResetPassword}
        isLoading={false}
      />
    );

    expect(document.getElementById("admin-reset-password")).toBeNull();
    expect(screen.queryByText("admin.writePassword")).not.toBeInTheDocument();
    expect(screen.getByText("admin.sendPasswordResetLinkImpactTitle")).toBeInTheDocument();
    expect(screen.getByText("admin.sendPasswordResetLinkImpactDesc")).toBeInTheDocument();
    expect(screen.getByText(/admin\.sendPasswordResetLinkTargetEmail email=ops@ahly\.club/)).toBeInTheDocument();

    const reasonInput = document.getElementById("admin-reset-password-reason") as HTMLTextAreaElement;
    fireEvent.change(reasonInput, { target: { value: "  Account locked out after device loss  " } });

    const submitBtn = screen.getByRole("button", { name: "admin.sendPasswordResetLinkCta" });
    expect(submitBtn).toBeEnabled();
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(onResetPassword).toHaveBeenCalledWith("Account locked out after device loss");
    });
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("ResetPasswordDialog disables submission when admin has no email and stays open if Sudo/API rejects", async () => {
    const noEmailAdmin = sampleAdmin.copyWith({ email: "" });
    const onResetPassword = vi.fn().mockRejectedValueOnce(new SudoCancelledError());
    const onOpenChange = vi.fn();

    const { rerender } = render(
      <ResetPasswordDialog
        open={true}
        onOpenChange={onOpenChange}
        admin={noEmailAdmin}
        onResetPassword={onResetPassword}
        isLoading={false}
      />
    );

    expect(screen.getByText("admin.sendPasswordResetLinkNoEmailWarning")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "admin.sendPasswordResetLinkCta" })).toBeDisabled();

    rerender(
      <ResetPasswordDialog
        open={true}
        onOpenChange={onOpenChange}
        admin={sampleAdmin}
        onResetPassword={onResetPassword}
        isLoading={false}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "admin.sendPasswordResetLinkCta" }));
    await waitFor(() => expect(onResetPassword).toHaveBeenCalledTimes(1));
    expect(onOpenChange).not.toHaveBeenCalledWith(false);
  });

  it("ResetAdminMfaDialog explains TOTP/session/re-enrollment impact, toggles revokePasskeys, and submits reason", async () => {
    const onResetMfa = vi.fn().mockResolvedValue(undefined);
    const onOpenChange = vi.fn();

    render(
      <ResetAdminMfaDialog
        open={true}
        onOpenChange={onOpenChange}
        admin={sampleAdmin}
        onResetMfa={onResetMfa}
        isLoading={false}
      />
    );

    expect(screen.getByText("admin.resetMfaImpactTitle")).toBeInTheDocument();
    expect(screen.getByText("admin.resetMfaImpactDesc")).toBeInTheDocument();

    const passkeyCheckbox = document.getElementById("reset-mfa-revoke-passkeys")!;
    fireEvent.click(passkeyCheckbox);

    const reasonInput = document.getElementById("admin-reset-mfa-reason") as HTMLTextAreaElement;
    fireEvent.change(reasonInput, { target: { value: "Lost YubiKey and phone" } });

    fireEvent.click(screen.getByRole("button", { name: "admin.resetMfaConfirmCta" }));

    await waitFor(() => {
      expect(onResetMfa).toHaveBeenCalledWith({
        reason: "Lost YubiKey and phone",
        revokePasskeys: true,
      });
    });
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("AdminService & AdminRepository wire POST reset-password (reason) and POST reset-mfa (reason + revokePasskeys)", async () => {
    const mockPost = vi.fn().mockResolvedValue(undefined);
    const service = new AdminService({ post: mockPost } as unknown as IApiService);
    const repo = new AdminRepository(service);

    await repo.resetPassword("adm-1", "Support verified identity");
    expect(mockPost).toHaveBeenCalledWith("/v1/Admins/adm-1/reset-password", {
      reason: "Support verified identity",
    });

    await repo.resetMfa("adm-1", { reason: "Hardware lost", revokePasskeys: true });
    expect(mockPost).toHaveBeenCalledWith("/v1/Admins/adm-1/reset-mfa", {
      reason: "Hardware lost",
      revokePasskeys: true,
    });
  });

  it("useAdminOperations handles resetPassword & resetMfa success toasts and SudoCancelledError cleanly", async () => {
    const { result } = renderHook(
      () =>
        useAdminOperations({
          tenantId: "tenant-1",
          queryKey: ["admins", "tenant-1"],
          refreshItems: vi.fn(),
        }),
      { wrapper: createWrapper() }
    );

    mockAdminRepo.resetPassword.mockResolvedValueOnce(undefined);
    await act(async () => {
      await result.current.handleResetPassword("adm-1", "Lost password");
    });
    expect(mockSuccessToast).toHaveBeenCalledWith({
      title: "admin.passwordResetLinkSent",
      description: "admin.passwordResetLinkSentDesc",
    });

    mockAdminRepo.resetMfa.mockRejectedValueOnce(new SudoCancelledError());
    await act(async () => {
      await expect(
        result.current.handleResetMfa("adm-1", { revokePasskeys: false })
      ).rejects.toThrow("Sudo verification was cancelled.");
    });
    expect(mockInfoToast).toHaveBeenCalledWith({
      title: "profile.sudo.cancelledTitle",
      description: "profile.sudo.cancelledDescription",
    });
    expect(mockErrorToast).not.toHaveBeenCalled();

    mockAdminRepo.resetMfa.mockResolvedValueOnce(undefined);
    await act(async () => {
      await result.current.handleResetMfa("adm-1", { revokePasskeys: true, reason: "Lost device" });
    });
    expect(mockSuccessToast).toHaveBeenCalledWith({
      title: "admin.mfaResetSuccess",
      description: "admin.mfaResetSuccessDesc",
    });
  });
});
