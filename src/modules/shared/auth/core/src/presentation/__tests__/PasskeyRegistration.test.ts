import { describe, it, expect, vi } from "vitest";
import type { IApiService } from "@core/interfaces/api.interface";
import { PasskeyService } from "../../data/services/PasskeyService";
import { PasskeyRepository } from "../../data/repositories/PasskeyRepository";
import { AUTH_CORE_ENDPOINTS } from "../../../data/services/auth-core.endpoints";

describe("PasskeyService & PasskeyRepository registration anti-stripping contract", () => {
  it("preserves base64url options and forwards challengeToken from registration/begin to registration/complete", async () => {
    const api = {
      post: vi
        .fn()
        .mockResolvedValueOnce({
          // Contains `-` and `_` base64url chars that would fail raw atob()
          challenge: "ab-cd_ef1234",
          rpId: "localhost",
          rpName: "SCRIPE",
          userId: "user-id_9876",
          userName: "admin@scripe.test",
          userDisplayName: "Admin",
          rp: { id: "localhost", name: "SCRIPE" },
          user: { id: "user-id_9876", name: "admin@scripe.test", displayName: "Admin" },
          pubKeyCredParams: [{ type: "public-key", alg: -7 }],
          timeout: 60000,
          attestation: "none",
          authenticatorSelection: { residentKey: "required", userVerification: "required" },
          excludeCredentials: [{ id: "old-cred_1", type: "public-key", transports: ["internal"] }],
          challengeToken: "signed-reg-token-xyz",
          mode: "platform",
        })
        .mockResolvedValueOnce({
          id: "pk-99",
          deviceName: "Workstation Touch ID",
          credentialIdMasked: "••••99",
          createdAt: "2026-11-15T22:10:00Z",
          lastUsedAt: null,
          isDiscoverable: true,
          signCount: 0,
        }),
      patch: vi.fn().mockResolvedValueOnce(undefined),
    } as unknown as IApiService;

    const repo = new PasskeyRepository(new PasskeyService(api));
    const options = await repo.beginRegistration("Workstation Touch ID", "platform");

    expect(options.challengeToken).toBe("signed-reg-token-xyz");
    expect(options.mode).toBe("platform");
    expect(options.challenge).toBeInstanceOf(Uint8Array);
    expect((options.challenge as Uint8Array).length).toBeGreaterThan(0);

    const entity = await repo.completeRegistration(
      "Workstation Touch ID",
      {
        id: "cred-b64url",
        rawId: "cred-raw-b64url",
        type: "public-key",
        response: {
          attestationObject: "att-b64url",
          clientDataJSON: "client-data-b64url",
          transports: ["internal"],
        },
        clientExtensionResults: { credProps: { rk: true } },
      },
      {
        challengeToken: options.challengeToken,
        attestationMode: options.mode,
      }
    );

    expect(api.post).toHaveBeenNthCalledWith(1, AUTH_CORE_ENDPOINTS.PASSKEY.REGISTER_BEGIN, {
      deviceName: "Workstation Touch ID",
      mode: "platform",
    });
    expect(api.post).toHaveBeenNthCalledWith(2, AUTH_CORE_ENDPOINTS.PASSKEY.REGISTER_VERIFY, {
      attestationObjectBase64: "att-b64url",
      clientDataJsonBase64: "client-data-b64url",
      deviceName: "Workstation Touch ID",
      transports: ["internal"],
      clientExtensionResults: { credProps: { rk: true } },
      challengeToken: "signed-reg-token-xyz",
      attestationMode: "platform",
      credentialIdBase64: "cred-raw-b64url",
    });
    expect(entity.id).toBe("pk-99");

    await repo.rename("pk-99", "Renamed Touch ID");
    expect(api.patch).toHaveBeenCalledWith(`${AUTH_CORE_ENDPOINTS.PASSKEY.LIST}/pk-99/name`, {
      newName: "Renamed Touch ID",
    });
  });
});
