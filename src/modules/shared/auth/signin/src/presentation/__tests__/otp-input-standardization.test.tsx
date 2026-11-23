import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { TwoFactorForm } from "../components/TwoFactorForm";
import { PhoneOtpForm } from "../components/PhoneOtpForm";

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

const mockSetCode = vi.fn();
vi.mock("../viewmodels/usePhoneOtpViewModel", () => ({
  usePhoneOtpViewModel: () => ({
    step: "code",
    phone: "+966500000000",
    setPhone: vi.fn(),
    code: "",
    setCode: mockSetCode,
    error: "",
    shakeKey: 0,
    isLoading: false,
    cooldown: 0,
    availableWorkspaces: [],
    requestOtp: vi.fn(),
    verifyOtp: vi.fn(),
    resendOtp: vi.fn(),
    selectWorkspace: vi.fn(),
    changeNumber: vi.fn(),
  }),
}));

describe("OTP input standardization onto @core/ui/otp-input-field", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders TwoFactorForm TOTP input via OtpInputField variant=vault", () => {
    const setTwoFactorCode = vi.fn();
    render(
      <TwoFactorForm
        twoFactorCode="123"
        setTwoFactorCode={setTwoFactorCode}
        isVerifying2FA={false}
        useBackupCode={false}
        toggleBackupCode={vi.fn()}
        error=""
        isRTL={false}
        handleVerify2FA={vi.fn()}
        goBackToCredentials={vi.fn()}
      />
    );

    const input = screen.getByTestId("otp-field-two-factor-code");
    expect(input).toHaveAttribute("data-variant", "vault");
    fireEvent.change(input, { target: { value: "123456" } });
    expect(setTwoFactorCode).toHaveBeenCalledWith("123456");
  });

  it("renders PhoneOtpForm verification input via OtpInputField variant=vault", () => {
    render(<PhoneOtpForm onSuccess={vi.fn()} onBack={vi.fn()} isRTL={false} />);

    const input = screen.getByTestId("otp-field-phone-otp-code");
    expect(input).toHaveAttribute("data-variant", "vault");
    fireEvent.change(input, { target: { value: "654321" } });
    expect(mockSetCode).toHaveBeenCalledWith("654321");
  });
});
