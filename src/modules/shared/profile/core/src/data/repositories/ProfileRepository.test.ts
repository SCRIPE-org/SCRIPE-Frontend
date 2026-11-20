import { describe, it, expect, vi } from "vitest";
import type { QueryClient } from "@tanstack/react-query";
import { ProfileRepository } from "./ProfileRepository";
import { PROFILE_ENDPOINTS } from "../services/profile.endpoints";
import type { IApiService } from "@core/interfaces/api.interface";
import {
  isConcurrencyConflictError,
  invalidateOnConcurrencyConflict,
  resolveProfileSaveErrorMessage,
} from "../../presentation/utils/concurrency";

function createMockApi(overrides: Partial<IApiService> = {}): IApiService {
  return {
    get: vi.fn().mockResolvedValue({
      id: "adm-1",
      firstName: "Alex",
      lastName: "Morgan",
      email: "alex@scripe.test",
      username: "alex",
      phoneNumber: "+201000000000",
      rowVersion: "rv-initial",
    }),
    put: vi.fn().mockResolvedValue({
      id: "adm-1",
      firstName: "Alex",
      lastName: "Morgan",
      email: "alex@scripe.test",
      username: "alex",
      phoneNumber: "+201000000000",
      rowVersion: "rv-updated",
    }),
    post: vi.fn().mockResolvedValue({}),
    delete: vi.fn().mockResolvedValue({}),
    patch: vi.fn().mockResolvedValue({}),
    ...overrides,
  } as unknown as IApiService;
}

describe("ProfileRepository & Optimistic Concurrency", () => {
  it("carries rowVersion from getProfile() and forwards it on updateProfile()", async () => {
    const api = createMockApi();
    const repo = new ProfileRepository(api);

    const profile = await repo.getProfile();
    expect(profile.rowVersion).toBe("rv-initial");

    const updated = await repo.updateProfile({
      firstName: "Alex",
      lastName: "Morgan",
      phoneNumber: "+201000000000",
      rowVersion: profile.rowVersion,
    });

    expect(api.put).toHaveBeenCalledWith(
      PROFILE_ENDPOINTS.UPDATE_DOSSIER,
      expect.objectContaining({
        firstName: "Alex",
        rowVersion: "rv-initial",
      })
    );
    expect(updated.rowVersion).toBe("rv-updated");
  });

  it("detects 409 conflicts, invalidates query cache, and resolves localized messages", () => {
    const invalidateQueries = vi.fn();
    const mockQueryClient = { invalidateQueries } as unknown as QueryClient;

    const api409 = Object.assign(new Error("Precondition"), { status: 409 });
    const axios409 = { response: { status: 409 } };
    const details409 = { details: { statusCode: 409, errorCode: "CONCURRENCY_CONFLICT" } };
    const other500 = Object.assign(new Error("Server down"), { status: 500 });

    expect(isConcurrencyConflictError(api409)).toBe(true);
    expect(isConcurrencyConflictError(axios409)).toBe(true);
    expect(isConcurrencyConflictError(details409)).toBe(true);
    expect(isConcurrencyConflictError(other500)).toBe(false);

    expect(invalidateOnConcurrencyConflict(mockQueryClient, ["profile", "me"], api409)).toBe(true);
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ["profile", "me"] });

    expect(invalidateOnConcurrencyConflict(mockQueryClient, ["profile", "me"], other500)).toBe(
      false
    );
    expect(invalidateQueries).toHaveBeenCalledTimes(1);

    const t = (key: string) => `translated:${key}`;
    expect(resolveProfileSaveErrorMessage(api409, t)).toBe(
      "translated:profile.common.concurrencyConflict"
    );
    expect(resolveProfileSaveErrorMessage(other500, t)).toBe("Server down");
  });
});
