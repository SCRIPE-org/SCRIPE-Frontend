import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { SignupThemeProvider } from "@core/providers/signup-theme";
import { VerificationStep } from "../components/verify/VerificationStep";
import type { SignupWizardViewModel } from "../viewmodels/useSignupWizard";

vi.mock("@core/providers/i18n-provider", () => ({
  useI18n: () => ({
    t: (key: string) => key,
    direction: "ltr" as const,
    language: "en" as const,
    isRtl: false,
  }),
}));

vi.mock("next-themes", () => ({
  useTheme: () => ({
    resolvedTheme: "light",
    setTheme: vi.fn(),
  }),
}));

vi.mock("@core/ui/otp-input-field", () => ({
  OtpInputField: ({
    id,
    value,
    onChange,
    variant,
  }: {
    id?: string;
    value: string;
    onChange: (v: string) => void;
    variant?: string;
  }) => (
    <input
      data-testid={`otp-field-${id}`}
      data-variant={variant}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  ),
}));

describe("Signup VerificationStep OTP standardization", () => {
  it("renders VerificationStep OTP input via OtpInputField variant=nexus for light/dark theme contrast", () => {
    const setOtpCode = vi.fn();
    const mockWizard = {
      otpCode: "",
      setOtpCode,
      isSubmitting: false,
      otpResendCooldown: 0,
      error: "",
      wizardData: { email: "founder@scripe.test" },
      verifyOtp: vi.fn(),
      resendOtp: vi.fn(),
      changeEmail: vi.fn(),
    } as unknown as SignupWizardViewModel;

    render(
      <SignupThemeProvider>
        <VerificationStep wizard={mockWizard} />
      </SignupThemeProvider>
    );

    const input = screen.getByTestId("otp-field-signup-otp");
    expect(input).toHaveAttribute("data-variant", "nexus");
    fireEvent.change(input, { target: { value: "111222" } });
    expect(setOtpCode).toHaveBeenCalledWith("111222");
  });
});
