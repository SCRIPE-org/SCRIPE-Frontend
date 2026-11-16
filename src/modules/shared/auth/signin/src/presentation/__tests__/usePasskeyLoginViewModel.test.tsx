import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import type { IApiService } from "@core/interfaces/api.interface";
import { AuthService } from "../../../../core/data/services/AuthService";
import { AUTH_CORE_ENDPOINTS } from "../../../../core/data/services/auth-core.endpoints";
import { PasskeyPrompt } from "../components/PasskeyPrompt";
import { CredentialsForm } from "../components/CredentialsForm";

const {
  mockBeginPasskeyAuth,
  mockVerifyPasskeyAuth,
  mockAssertPasskey,
  mockIsWebAuthnAvailable,
} = vi.hoisted(() => ({
  mockBeginPasskeyAuth: vi.fn(),
  mockVerifyPasskeyAuth: vi.fn(),
  mockAssertPasskey: vi.fn(),
  mockIsWebAuthnAvailable: vi.fn(),
}));

vi.mock("@core/providers/i18n-provider", () => ({
  useI18n: () => ({
    t: (key: string) => key,
    direction: "ltr" as const,
    language: "en" as const,
    isRtl: false,
    setLanguage: vi.fn(),
  }),
}));

vi.mock("@modules/auth/di", () => ({
  authContainer: {
    authRepository: {
      beginPasskeyAuth: (...args: unknown[]) => mockBeginPasskeyAuth(...args),
      verifyPasskeyAuth: (...args: unknown[]) => mockVerifyPasskeyAuth(...args),
    },
  },
}));

vi.mock("@core/services/webauthn.service", () => ({
  assertPasskey: (...args: unknown[]) => mockAssertPasskey(...args),
  isWebAuthnAvailable: (...args: unknown[]) => mockIsWebAuthnAvailable(...args),
  bufferToBase64Url: (buf: ArrayBuffer) =>
    Buffer.from(buf).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, ""),
}));

describe("Passkey Sign-In Contract & Components", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIsWebAuthnAvailable.mockResolvedValue(true);
  });

  it("AuthService.beginPasskeyAuth normalizes flat PasskeyAuthenticationOptions and forwards challengeToken & clientExtensionResults in verifyPasskeyAuth", async () => {
    const api = {
      postPublic: vi
        .fn()
        .mockResolvedValueOnce({
          challenge: "flat-challenge-b64url",
          rpId: "localhost",
          timeout: 60000,
          allowCredentials: [{ id: "cred-1", type: "public-key", transports: ["internal"] }],
          userVerification: "required",
          challengeToken: "signed-challenge-tok-999",
        })
        .mockResolvedValueOnce({
          accessToken: "jwt-access",
          refreshToken: "jwt-refresh",
          mustChangePassword: true,
        }),
    } as unknown as IApiService;

    const service = new AuthService(api);
    const begin = await service.beginPasskeyAuth("admin@scripe.test", "tenant-1");

    expect(api.postPublic).toHaveBeenNthCalledWith(1, AUTH_CORE_ENDPOINTS.PASSKEY.AUTH_BEGIN, {
      identifier: "admin@scripe.test",
      tenantId: "tenant-1",
    });
    expect(begin).toMatchObject({
      challenge: "flat-challenge-b64url",
      rpId: "localhost",
      timeout: 60000,
      userVerification: "required",
      challengeToken: "signed-challenge-tok-999",
      allowCredentials: [{ id: "cred-1", type: "public-key", transports: ["internal"] }],
    });

    const verified = await service.verifyPasskeyAuth({
      credentialId: "Y3JlZC0x",
      rawId: "Y3JlZC0x",
      clientDataJSON: "Y2xpZW50",
      authenticatorData: "YXV0aA",
      signature: "c2ln",
      userHandle: "dXNlcg",
      challengeToken: begin.challengeToken,
      clientExtensionResults: { credProps: { rk: true } },
      tenantId: "tenant-1",
    });

    expect(api.postPublic).toHaveBeenNthCalledWith(
      2,
      AUTH_CORE_ENDPOINTS.PASSKEY.AUTH_VERIFY,
      expect.objectContaining({
        challengeToken: "signed-challenge-tok-999",
        clientExtensionResults: { credProps: { rk: true } },
        tenantId: "tenant-1",
      })
    );
    expect(verified.mustChangePassword).toBe(true);
    expect(verified.accessToken).toBe("jwt-access");
  });

  it("PasskeyPrompt renders passkey-authenticate-btn, consumes flat begin response without .options errors, and preserves mustChangePassword", async () => {
    mockBeginPasskeyAuth.mockResolvedValue({
      challenge: "flat-challenge-123",
      rpId: "localhost",
      timeout: 60000,
      userVerification: "required",
      challengeToken: "tok-flat-123",
      allowCredentials: [{ id: "cred-1", type: "public-key", transports: ["internal"] }],
    });
    mockAssertPasskey.mockResolvedValue({
      credentialIdBase64: "cred-1",
      authenticatorDataBase64: "auth-data",
      clientDataJsonBase64: "client-data",
      signatureBase64: "sig-data",
      userHandleBase64: "user-handle",
      clientExtensionResults: { uvm: [[1, 2, 4]] },
    });
    mockVerifyPasskeyAuth.mockResolvedValue({
      accessToken: "acc-1",
      refreshToken: "ref-1",
      mustChangePassword: true,
    });

    const onSuccess = vi.fn();
    render(
      <PasskeyPrompt
        onSuccess={onSuccess}
        onBack={vi.fn()}
        isRTL={false}
        tenantId="tenant-1"
        identifier="founder@scripe.test"
      />
    );

    const submitBtn = screen.getByTestId("passkey-authenticate-btn");
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockVerifyPasskeyAuth).toHaveBeenCalledWith({
        challengeToken: "tok-flat-123",
        challengeId: undefined,
        credentialId: "cred-1",
        rawId: "cred-1",
        clientDataJSON: "client-data",
        authenticatorData: "auth-data",
        signature: "sig-data",
        userHandle: "user-handle",
        clientExtensionResults: { uvm: [[1, 2, 4]] },
        tenantId: "tenant-1",
      });
    });

    expect(mockBeginPasskeyAuth).toHaveBeenCalledWith("founder@scripe.test", "tenant-1");
    expect(onSuccess).toHaveBeenCalledWith({
      accessToken: "acc-1",
      refreshToken: "ref-1",
      mustChangePassword: true,
    });
  });

  it("CredentialsForm exposes login-passkey-chip testid when passkey sign-in is enabled", () => {
    const onSwitchToPasskey = vi.fn();
    render(
      <CredentialsForm
        formData={{ identifier: "user@test.com", password: "", staySignedIn: false }}
        showPassword={false}
        isLoading={false}
        isFormValid={false}
        error=""
        shakeKey={0}
        isRTL={false}
        updateField={vi.fn()}
        togglePasswordVisibility={vi.fn()}
        handleLogin={vi.fn()}
        onSwitchToPasskey={onSwitchToPasskey}
      />
    );

    const passkeyChip = screen.getByTestId("login-passkey-chip");
    expect(passkeyChip).toBeInTheDocument();
    fireEvent.click(passkeyChip);
    expect(onSwitchToPasskey).toHaveBeenCalledTimes(1);
  });
});
