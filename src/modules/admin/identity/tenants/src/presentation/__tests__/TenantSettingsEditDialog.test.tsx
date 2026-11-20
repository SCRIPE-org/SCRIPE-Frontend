import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { TenantSettingsEditDialog } from "../components/TenantSettingsEditDialog";

type TenantSettingsModel = React.ComponentProps<typeof TenantSettingsEditDialog>["settings"];

vi.mock("@core/providers/i18n-provider", () => ({
  useI18n: () => ({
    t: (key: string) => key,
    direction: "ltr" as const,
    language: "en" as const,
    isRtl: false,
    setLanguage: vi.fn(),
  }),
}));

vi.mock("@core/ui/image-upload-field", () => ({
  ImageUploadField: ({ label }: { label: string }) => <div data-testid="image-upload">{label}</div>,
}));

vi.mock("@core/ui/select", () => ({
  Select: ({
    value,
    onValueChange,
    children,
  }: {
    value: string;
    onValueChange: (val: string) => void;
    children: React.ReactNode;
  }) => (
    <div data-testid="mock-select" data-value={value}>
      <button type="button" data-testid="select-custom-idp" onClick={() => onValueChange("custom")}>
        select-custom
      </button>
      <button
        type="button"
        data-testid="select-inherit-idp"
        onClick={() => onValueChange("inherit")}
      >
        select-inherit
      </button>
      {children}
    </div>
  ),
  SelectTrigger: ({ children, id }: { children: React.ReactNode; id?: string }) => (
    <div id={id}>{children}</div>
  ),
  SelectValue: () => null,
  SelectContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SelectItem: ({ children, value }: { children: React.ReactNode; value: string }) => (
    <div data-option={value}>{children}</div>
  ),
}));

function buildSettings(overrides?: Partial<TenantSettingsModel>): TenantSettingsModel {
  return {
    maxAdmins: 10,
    maxRoles: 20,
    maxSubTenants: 2,
    passwordMinLength: 10,
    passwordRequireUppercase: true,
    passwordRequireNumber: true,
    passwordRequireSpecial: false,
    passwordExpiryDays: 90,
    loginLockoutThreshold: 5,
    loginLockoutMinutes: 15,
    require2FA: false,
    identityProviderMode: "inherit",
    auditEnabled: true,
    auditRetentionDays: 90,
    logoUrl: null,
    primaryColor: "#111111",
    secondaryColor: "#222222",
    faviconUrl: null,
    loginHeadline: "Welcome",
    loginSubtitle: "Sign in",
    companyName: "Al-Ahly",
    loginBrandingJson: null,
    dashboardThemeJson: null,
    allowedLayoutsJson: null,
    allowAdminThemeOverride: false,
    allowedAdminSettingsJson: null,
    draftBrandingJson: null,
    loginTextOverridesJson: null,
    customFeaturesJson: null,
    slotConfigJson: null,
    termsOfServiceUrl: null,
    privacyPolicyUrl: null,
    settingsVersion: 1,
    isSafeMode: false,
    mode: "tenant",
    ...overrides,
  };
}

describe("TenantSettingsEditDialog (BAM-03, SEC-07)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders identityProviderMode in Security tab and persists custom mode on save", () => {
    const onSave = vi.fn();
    render(
      <TenantSettingsEditDialog
        open={true}
        onOpenChange={vi.fn()}
        initialSection="security"
        settings={buildSettings({ identityProviderMode: "inherit" })}
        onSave={onSave}
        isSaving={false}
      />
    );

    expect(screen.getByText("tenant.identityProviderMode")).toBeInTheDocument();
    expect(screen.getByText("tenant.identityProviderModeInheritDesc")).toBeInTheDocument();

    fireEvent.click(screen.getByTestId("select-custom-idp"));
    expect(screen.getByText("tenant.identityProviderModeCustomDesc")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "common.save" }));

    expect(onSave).toHaveBeenCalledTimes(1);
    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        identityProviderMode: "custom",
        passwordMinLength: 10,
        loginLockoutThreshold: 5,
        loginLockoutMinutes: 15,
      })
    );
  });

  it("enforces SEC-07 security numeric bounds on passwordMinLength, lockout threshold, and duration", () => {
    render(
      <TenantSettingsEditDialog
        open={true}
        onOpenChange={vi.fn()}
        initialSection="security"
        settings={buildSettings()}
        onSave={vi.fn()}
        isSaving={false}
      />
    );

    const minLenInput = document.getElementById("dialog-password-min-length") as HTMLInputElement;
    const lockoutThreshold = document.getElementById("dialog-lockout-threshold") as HTMLInputElement;
    const lockoutDuration = document.getElementById("dialog-lockout-duration") as HTMLInputElement;

    expect(minLenInput).toHaveAttribute("min", "8");
    expect(minLenInput).toHaveAttribute("max", "128");
    expect(lockoutThreshold).toHaveAttribute("min", "3");
    expect(lockoutThreshold).toHaveAttribute("max", "20");
    expect(lockoutDuration).toHaveAttribute("min", "1");
    expect(lockoutDuration).toHaveAttribute("max", "1440");
  });

  it("SEC-07: disables Audit tab and redirects audit initialSection to security when self-tenant admin edits", () => {
    const onSave = vi.fn();
    render(
      <TenantSettingsEditDialog
        open={true}
        onOpenChange={vi.fn()}
        initialSection="audit"
        settings={buildSettings()}
        onSave={onSave}
        isSaving={false}
        canEditPlatformManagedFields={false}
      />
    );

    const auditTab = screen.getByRole("tab", { name: "tenant.audit" });
    expect(auditTab).toBeDisabled();

    fireEvent.click(screen.getByRole("button", { name: "common.save" }));

    expect(onSave).toHaveBeenCalledTimes(1);
    const savedPayload = onSave.mock.calls[0][0] as Record<string, unknown>;
    expect(savedPayload.auditEnabled).toBeUndefined();
    expect(savedPayload.auditRetentionDays).toBeUndefined();
    expect(savedPayload.identityProviderMode).toBe("inherit");
  });
});
