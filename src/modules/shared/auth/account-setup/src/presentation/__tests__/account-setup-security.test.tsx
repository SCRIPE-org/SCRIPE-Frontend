import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { AccountSetupMapper } from "../../data/mappers/AccountSetupMapper";
import { AccountSetupService } from "../../data/services/AccountSetupService";
import { ACCOUNT_SETUP_ENDPOINTS } from "../../data/services/account-setup.endpoints";
import { AUTH_ENDPOINTS } from "@core/config/api-endpoints/auth.endpoints";
import type { IPublicApiService } from "@core/interfaces/public-api.interface";
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

  it("retains ?token= query parameter across Next.js 16 replaceState re-render when useSearchParams syncs to empty", async () => {
    window.history.replaceState(
      {},
      "",
      "/setup-account?token=query-invite-tok-123&_tenant=SCRIPE"
    );
    mockValidateToken.mockResolvedValue(
      new SetupTokenInfo({
        isValid: true,
        email: "invited@scripe.test",
        adminUsername: "invited.admin",
        tenantName: "SCRIPE",
        tenantCode: "SCRIPE",
        passwordMinLength: 12,
        passwordRequireUppercase: true,
        passwordRequireLowercase: true,
        passwordRequireNumber: true,
        passwordRequireSpecial: true,
      })
    );
    mockGetCustomFields.mockResolvedValue([]);

    const { rerender } = render(<SetupAccountView />);

    // Effect 1 strips ?token= via history.replaceState, leaving ?_tenant=SCRIPE
    expect(window.location.search).toBe("?_tenant=SCRIPE");

    // Simulate Next.js 16 App Router re-rendering after history.replaceState updates useSearchParams()
    rerender(<SetupAccountView />);

    await waitFor(() => {
      expect(mockValidateToken).toHaveBeenCalledWith("query-invite-tok-123");
    });
    expect(screen.queryByText("auth.accountSetup.missingToken")).not.toBeInTheDocument();
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

  it("prioritizes #token= over ?token= when both are present and strips both via replaceState (SETUP-QUERY-TOK-01)", async () => {
    window.history.replaceState(
      {},
      "",
      "/setup-account?token=legacy-query-tok&_tenant=SCRIPE#token=preferred-hash-tok&step=1"
    );
    mockValidateToken.mockResolvedValue(
      new SetupTokenInfo({
        isValid: true,
        email: "ops@club.test",
        adminUsername: "ops",
        tenantName: "Club",
        tenantCode: "SCRIPE",
        passwordMinLength: 12,
      })
    );
    mockGetCustomFields.mockResolvedValue([]);

    render(<SetupAccountView />);

    await waitFor(() => {
      expect(mockValidateToken).toHaveBeenCalledWith("preferred-hash-tok");
    });
    expect(window.location.search).toBe("?_tenant=SCRIPE");
    expect(window.location.hash).toBe("#step=1");
  });

  it("sends setup token exclusively via X-Setup-Token header and never in query string (PWD-05 / SETUP-QUERY-TOK-01)", async () => {
    const publicApi: IPublicApiService = {
      get: vi.fn().mockResolvedValue({}),
      post: vi.fn().mockResolvedValue({ success: true }),
    };
    const service = new AccountSetupService(publicApi);

    await service.validateToken("hdr-secret-tok");
    expect(publicApi.get).toHaveBeenNthCalledWith(
      1,
      ACCOUNT_SETUP_ENDPOINTS.VALIDATE_TOKEN,
      undefined,
      undefined,
      { headers: { "X-Setup-Token": "hdr-secret-tok" } }
    );
    expect(ACCOUNT_SETUP_ENDPOINTS.VALIDATE_TOKEN).not.toContain("token=");
    expect(AUTH_ENDPOINTS.ACCOUNT_SETUP.VALIDATE_TOKEN).not.toContain("token=");

    await service.getCustomFields("hdr-secret-tok");
    expect(publicApi.get).toHaveBeenNthCalledWith(
      2,
      ACCOUNT_SETUP_ENDPOINTS.CUSTOM_FIELDS,
      undefined,
      undefined,
      { headers: { "X-Setup-Token": "hdr-secret-tok" } }
    );
    expect(ACCOUNT_SETUP_ENDPOINTS.CUSTOM_FIELDS).not.toContain("token=");

    await service.activateAccount({
      token: "hdr-secret-tok",
      password: "StrongPassword123!",
      confirmPassword: "StrongPassword123!",
    });
    expect(publicApi.post).toHaveBeenCalledWith(
      ACCOUNT_SETUP_ENDPOINTS.ACTIVATE,
      expect.objectContaining({ token: "hdr-secret-tok" }),
      undefined,
      { headers: { "X-Setup-Token": "hdr-secret-tok" } }
    );
  });
});
