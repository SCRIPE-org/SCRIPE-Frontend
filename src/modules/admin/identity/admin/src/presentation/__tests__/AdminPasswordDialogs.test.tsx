import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import type { PasswordPolicyModel } from "@core/common/password-policy";
import { Admin } from "../../domain/entities/Admin";
import { ResetPasswordDialog, ManualSetupDialog } from "../components/AdminRoleDialogs";

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

const sampleAdmin = new Admin({
  id: "adm-1",
  username: "ahly.ops",
  firstName: "Ahly",
  lastName: "Ops",
  isActive: true,
  createdAt: "2026-10-01T00:00:00Z",
  modifiedAt: "2026-10-01T00:00:00Z",
});

const strictPolicy: PasswordPolicyModel = {
  minLength: 14,
  maxLength: 128,
  requireUppercase: true,
  requireLowercase: false,
  requireNumber: true,
  requireSpecial: true,
  historyCount: 5,
  checkBreachedPasswords: true,
  expiryDays: 90,
};

describe("AdminRoleDialogs — policy-driven password reset & manual setup", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("ResetPasswordDialog removes default P@ssw0rd shortcut and enforces dynamic PasswordPolicyModel", async () => {
    const onResetPassword = vi.fn().mockResolvedValue(undefined);
    const onOpenChange = vi.fn();

    render(
      <ResetPasswordDialog
        open={true}
        onOpenChange={onOpenChange}
        admin={sampleAdmin}
        onResetPassword={onResetPassword}
        isLoading={false}
        passwordPolicy={strictPolicy}
      />
    );

    expect(screen.queryByText("P@ssw0rd")).not.toBeInTheDocument();
    expect(screen.queryByText("admin.useDefaultPassword")).not.toBeInTheDocument();
    expect(screen.getByText(/common\.passwordPolicy\.minLength min=14/)).toBeInTheDocument();

    const submitBtn = screen.getByRole("button", { name: "admin.resetPassword" });
    expect(submitBtn).toBeDisabled();

    const input = document.getElementById("admin-reset-password") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "Weak1!" } });
    expect(submitBtn).toBeDisabled();

    fireEvent.change(input, { target: { value: "STRONGPASS1234!A" } });
    expect(submitBtn).not.toBeDisabled();

    fireEvent.click(submitBtn);
    await waitFor(() => {
      expect(onResetPassword).toHaveBeenCalledWith("STRONGPASS1234!A");
    });
  });

  it("ManualSetupDialog fails closed when policy fails to load and validates against backend policy", async () => {
    const onManualSetup = vi.fn().mockResolvedValue(undefined);
    const onRetry = vi.fn();

    const { rerender } = render(
      <ManualSetupDialog
        open={true}
        onOpenChange={vi.fn()}
        admin={sampleAdmin}
        onManualSetup={onManualSetup}
        isLoading={false}
        passwordPolicy={null}
        passwordPolicyError="common.passwordPolicy.loadFailed"
        onRetryPasswordPolicy={onRetry}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "common.passwordPolicy.retryPolicy" }));
    expect(onRetry).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole("button", { name: "admin.manualSetup" }));
    expect(onManualSetup).not.toHaveBeenCalled();

    rerender(
      <ManualSetupDialog
        open={true}
        onOpenChange={vi.fn()}
        admin={sampleAdmin}
        onManualSetup={onManualSetup}
        isLoading={false}
        passwordPolicy={strictPolicy}
      />
    );

    const passwordInput = document.getElementById("manualSetupPassword") as HTMLInputElement;
    const confirmInput = document.getElementById("manualSetupConfirmPassword") as HTMLInputElement;

    fireEvent.change(passwordInput, { target: { value: "Short1!A" } });
    fireEvent.change(confirmInput, { target: { value: "Short1!A" } });
    fireEvent.click(screen.getByRole("button", { name: "admin.manualSetup" }));

    expect(onManualSetup).not.toHaveBeenCalled();
    expect(screen.getByRole("alert")).toHaveTextContent("common.passwordPolicy.minLength min=14");

    fireEvent.change(passwordInput, { target: { value: "VALIDADMIN1234!A" } });
    fireEvent.change(confirmInput, { target: { value: "VALIDADMIN1234!A" } });
    fireEvent.click(screen.getByRole("button", { name: "admin.manualSetup" }));

    await waitFor(() => {
      expect(onManualSetup).toHaveBeenCalledWith("VALIDADMIN1234!A", "VALIDADMIN1234!A", true);
    });
  });
});
