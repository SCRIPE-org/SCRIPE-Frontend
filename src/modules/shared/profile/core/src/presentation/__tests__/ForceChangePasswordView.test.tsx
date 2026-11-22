import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { describe, expect, it, vi } from "vitest";

vi.mock("@core/providers/settings-provider", () => ({
  useSettings: () => ({
    showLogo: true,
    logoType: "sparkles",
    logoText: "SCRIPE",
    logoSize: "md",
  }),
}));

vi.mock("@core/providers/tenant-branding-provider", () => ({
  useTenantBranding: () => ({
    logoUrl: null,
  }),
}));

vi.mock("next/image", () => ({
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img {...props} alt={props.alt ?? ""} />
  ),
}));

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...rest
  }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

vi.mock("@core/ui/layout/common/theme-switcher", () => ({
  NxThemeSwitcher: () => <button type="button" data-testid="force-change-theme-switcher">Theme</button>,
}));

vi.mock("@core/ui/layout/common/language-switcher", () => ({
  LanguageSwitcher: () => <button type="button" data-testid="force-change-language-switcher">Lang</button>,
}));

vi.mock("../viewmodels/useForceChangePasswordViewModel", () => ({
  useForceChangePasswordViewModel: () => ({
    t: (key: string) => key,
    direction: "ltr" as const,
    username: "AHLY_admin",
    newPassword: "",
    setNewPassword: vi.fn(),
    confirmPassword: "",
    setConfirmPassword: vi.fn(),
    showNew: false,
    setShowNew: vi.fn(),
    showConfirm: false,
    setShowConfirm: vi.fn(),
    isSubmitting: false,
    submitError: null,
    rules: {
      minLength: false,
      hasUppercase: false,
      hasLowercase: false,
      hasNumber: false,
      hasSpecial: false,
    },
    showMismatch: false,
    canSubmit: false,
    handleSubmit: vi.fn(),
    handleLogout: vi.fn(),
  }),
}));

import { ForceChangePasswordView } from "../views/ForceChangePasswordView";

describe("ForceChangePasswordView compact chrome header", () => {
  it("renders SCRIPE brand mark alongside NxThemeSwitcher and LanguageSwitcher", () => {
    render(<ForceChangePasswordView />);

    expect(screen.getByAltText("SCRIPE")).toBeInTheDocument();
    expect(screen.getByTestId("force-change-theme-switcher")).toBeInTheDocument();
    expect(screen.getByTestId("force-change-language-switcher")).toBeInTheDocument();
  });
});
