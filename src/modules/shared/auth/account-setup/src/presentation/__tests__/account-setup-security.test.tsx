import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { AccountSetupMapper } from "../../data/mappers/AccountSetupMapper";
import { LaunchCelebrationCard } from "../components/LaunchCelebrationCard";
import { SetupAccountView } from "../views/SetupAccountView";
import { SetupTokenInfo } from "../../domain/entities";

const mockPush = vi.fn();
const mockValidateToken = vi.fn();
const mockGetCustomFields = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => new URLSearchParams(window.location.search),
}));

vi.mock("canvas-confetti", () => ({
  default: vi.fn(),
}));

vi.mock("@core/providers/i18n-provider", () => ({
  useI18n: () => ({
    t: (key: string, params?: Record<string, string | number>) => {
      if (!params) return key;
      let msg = key;
      for (const [k, v] of Object.entries(params)) {
        msg += ` ${k}=${v}`;
      }
      return msg;
    },
    direction: "ltr" as const,
    language: "en" as const,
    isRtl: false,
  }),
}));

vi.mock("@core/providers/service-provider", () => ({
  useServices: () => ({
    accountSetupRepository: {
      validateToken: mockValidateToken,
      getCustomFields: mockGetCustomFields,
      activateAccount: vi.fn(),
    },
  }),
}));

describe("Account setup security, mapper policy & URL hygiene", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.history.replaceState({}, "", "/setup-account");
  });

  it("maps legacy setup DTO without forcing passwordRequireSpecial or lowercase when omitted", () => {
    const entity = AccountSetupMapper.toTokenInfoEntity({
      isValid: true,
      email: "ops@club.test",
      adminUsername: "ops",
      tenantName: "Club",
      tenantCode: "club",
      passwordMinLength: 10,
      passwordRequireUppercase: true,
      passwordRequireNumber: false,
    });

    expect(entity.passwordRequireSpecial).toBe(false);
    expect(entity.passwordRequireLowercase).toBe(false);
    expect(entity.passwordPolicy).toEqual({
      minLength: 10,
      maxLength: 128,
      requireUppercase: true,
      requireLowercase: false,
      requireNumber: false,
      requireSpecial: false,
      historyCount: 0,
      checkBreachedPasswords: false,
      expiryDays: null,
    });
  });

  it("extracts #token= from URL fragment and immediately strips token via history.replaceState", async () => {
    window.history.replaceState({}, "", "/setup-account?foo=bar#token=secret-frag-tok&other=1");
    mockValidateToken.mockResolvedValue(
      new SetupTokenInfo({
        isValid: true,
        email: "ops@club.test",
        adminUsername: "ops",
        tenantName: "Club",
        tenantCode: "club",
        passwordMinLength: 12,
        passwordRequireUppercase: true,
        passwordRequireLowercase: false,
        passwordRequireNumber: true,
        passwordRequireSpecial: false,
      })
    );
    mockGetCustomFields.mockResolvedValue([]);

    render(<SetupAccountView />);

    await waitFor(() => {
      expect(mockValidateToken).toHaveBeenCalledWith("secret-frag-tok");
    });
    expect(window.location.search).toBe("?foo=bar");
    expect(window.location.hash).toBe("#other=1");
  });

  it("preserves email and _tenant when launching login from LaunchCelebrationCard", () => {
    render(
      <LaunchCelebrationCard
        tenantName="Ahly Club"
        tenantCode="ahly"
        adminUsername="admin.ahly"
        adminName="Admin Ahly"
        adminEmail="admin@ahly.test"
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /auth.accountSetup.enterWorkspace/i }));
    expect(mockPush).toHaveBeenCalledWith("/login?email=admin%40ahly.test&_tenant=ahly");
  });
});
