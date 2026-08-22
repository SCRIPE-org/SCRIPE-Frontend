/**
 * EntityLookupService tests (Wave 4)
 *
 * Two jobs. The route/property assertions pin the wire contract, which is untyped at runtime: these
 * interfaces have no mapper, so a server-side rename would otherwise surface as a blank picker row
 * rather than a compile error.
 *
 * The classification assertions pin the thing this feature is most likely to ship broken — 403, 404
 * and 422 collapsing into one indistinguishable failure. Each of those tests is named after the
 * property it holds, not after the method it calls.
 */
import { describe, it, expect, vi } from "vitest";
import { EntityLookupService } from "./EntityLookupService";
import type { IApiService } from "@core/interfaces/api.interface";
import { EntityLookupError } from "../../domain/entities/EntityLookupError";
import type { EntityLookupItem, EntityLookupType } from "../models/EntityLookupModel";

/** An IApiService whose `get` resolves with `response`. */
function mockApiService(response: unknown): IApiService {
  return {
    get: vi.fn().mockResolvedValue(response),
  } as unknown as IApiService;
}

/** An IApiService whose `get` rejects with `error`. */
function mockFailingApiService(error: unknown): IApiService {
  return {
    get: vi.fn().mockRejectedValue(error),
  } as unknown as IApiService;
}

/**
 * The shape `ApiService`'s interceptor produces for a failure that carried an `ErrorResponse` body:
 * a plain Error with the parsed body hung off `.details`. Built here rather than imported because
 * `.details` is an untyped ad-hoc property on the transport's rejection, not a declared contract.
 */
function apiErrorWithBody(statusCode: number, errorCode: string, message = "server said so") {
  const error = new Error(message) as Error & { details?: unknown };
  error.details = { statusCode, errorCode, message };
  return error;
}

describe("EntityLookupService", () => {
  describe("getAvailableTypes", () => {
    it("calls the literal types route, not the entity-type search route", async () => {
      const api = mockApiService([]);
      const service = new EntityLookupService(api);

      await service.getAvailableTypes();

      expect(api.get).toHaveBeenCalledWith("/v1/entity-lookup/types", undefined, undefined);
    });

    it("returns the wire property names verbatim (key, owningModule, displayNameEn, displayNameAr)", async () => {
      const wireResponse: EntityLookupType[] = [
        {
          key: "identity.user",
          owningModule: "Identity",
          displayNameEn: "User",
          displayNameAr: "مستخدم",
        },
      ];
      const service = new EntityLookupService(mockApiService(wireResponse));

      const result = await service.getAvailableTypes();

      expect(result).toEqual([
        {
          key: "identity.user",
          owningModule: "Identity",
          displayNameEn: "User",
          displayNameAr: "مستخدم",
        },
      ]);
    });

    it("treats an empty available-types list as a legitimate answer, not a failure", async () => {
      const service = new EntityLookupService(mockApiService([]));

      // "You may not reference anything" is a 200 with an empty array. If this ever rejects or
      // returns null, a caller with no target-type permissions gets an error banner instead of an
      // accurate empty state.
      await expect(service.getAvailableTypes()).resolves.toEqual([]);
    });

    it("returns an empty list rather than undefined when the body is empty", async () => {
      const service = new EntityLookupService(mockApiService(undefined));

      await expect(service.getAvailableTypes()).resolves.toEqual([]);
    });
  });

  describe("search", () => {
    it("calls the entity-type route with search, page and pageSize as query params", async () => {
      const api = mockApiService({ items: [], totalCount: 0, hasNextPage: false });
      const service = new EntityLookupService(api);
      const signal = new AbortController().signal;

      await service.search("hrms.staff-member", { search: "ali", page: 2, pageSize: 20 }, signal);

      expect(api.get).toHaveBeenCalledWith(
        "/v1/entity-lookup/hrms.staff-member",
        { search: "ali", page: 2, pageSize: 20 },
        signal
      );
    });

    it("sends no search param at all when the query is unfiltered", async () => {
      const api = mockApiService({ items: [], totalCount: 0, hasNextPage: false });
      const service = new EntityLookupService(api);

      await service.search("identity.user", { search: null, page: 1, pageSize: 20 }, undefined);

      // undefined, not "" — axios drops it, so the request does not look like a filtered search
      // that matched everything.
      expect(api.get).toHaveBeenCalledWith(
        "/v1/entity-lookup/identity.user",
        { search: undefined, page: 1, pageSize: 20 },
        undefined
      );
    });

    it("returns the paged envelope with item property names verbatim (id, displayName, secondary, isActive)", async () => {
      const item: EntityLookupItem = {
        id: "AbC-dEf_123",
        displayName: "Ali Hassan",
        secondary: "Head Coach",
        isActive: true,
      };
      const service = new EntityLookupService(
        mockApiService({
          items: [item],
          totalCount: 1,
          pageNumber: 1,
          pageSize: 20,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        })
      );

      const result = await service.search("hrms.staff-member", {
        search: null,
        page: 1,
        pageSize: 20,
      });

      expect(result.items[0]).toEqual({
        id: "AbC-dEf_123",
        displayName: "Ali Hassan",
        secondary: "Head Coach",
        isActive: true,
      });
      expect(result.hasNextPage).toBe(false);
    });

    it("classifies a search failure rather than leaking the raw transport error", async () => {
      const service = new EntityLookupService(
        mockFailingApiService(apiErrorWithBody(403, "AUTH_FORBIDDEN"))
      );

      await expect(
        service.search("hrms.staff-member", { search: null, page: 1, pageSize: 20 })
      ).rejects.toBeInstanceOf(EntityLookupError);
    });
  });

  describe("resolve", () => {
    it("calls the record route with the encrypted id passed through byte for byte", async () => {
      const api = mockApiService({
        id: "AbC-dEf_123",
        displayName: "Ali Hassan",
        secondary: null,
        isActive: true,
      });
      const service = new EntityLookupService(api);

      await service.resolve("hrms.staff-member", "AbC-dEf_123");

      // No encoding, no trimming, no case change: the id is URL-safe base64 of a ciphertext, and any
      // transformation makes the server's TryDecrypt return null on a reference that was fine.
      expect(api.get).toHaveBeenCalledWith(
        "/v1/entity-lookup/hrms.staff-member/AbC-dEf_123",
        undefined,
        undefined
      );
    });

    it("keeps a dormant row (isActive false) a successful resolve, not a failure", async () => {
      const service = new EntityLookupService(
        mockApiService({
          id: "AbC-dEf_123",
          displayName: "Departed Coach",
          secondary: null,
          isActive: false,
        })
      );

      const result = await service.resolve("hrms.staff-member", "AbC-dEf_123");

      // isActive:false never means deleted — a deleted row does not resolve at all — so this value
      // is still selectable and still savable.
      expect(result.isActive).toBe(false);
      expect(result.displayName).toBe("Departed Coach");
    });

    it("classifies 403 as forbidden — a fact about the caller's role, not the data", async () => {
      const service = new EntityLookupService(
        mockFailingApiService(apiErrorWithBody(403, "AUTH_FORBIDDEN"))
      );

      await expect(service.resolve("hrms.staff-member", "id")).rejects.toMatchObject({
        kind: "forbidden",
      });
    });

    it("classifies 404 as missing — a fact about the data, not the caller", async () => {
      const service = new EntityLookupService(
        mockFailingApiService(apiErrorWithBody(404, "ENTITY_NOT_FOUND"))
      );

      await expect(service.resolve("hrms.staff-member", "id")).rejects.toMatchObject({
        kind: "missing",
      });
    });

    it("classifies a malformed stored id as invalid, on the real 422 status and not the advertised 400", async () => {
      // ErrorResponse.FromError maps ErrorType.Validation to 422, even though the controller's
      // [ProducesResponseType] attribute advertises 400. Keying on the errorCode is what makes this
      // work either way.
      const service = new EntityLookupService(
        mockFailingApiService(apiErrorWithBody(422, "ENTITY_INVALID_ID"))
      );

      await expect(service.resolve("hrms.staff-member", "tampered")).rejects.toMatchObject({
        kind: "invalid",
      });
    });

    it("keeps forbidden, missing and invalid three distinct kinds", async () => {
      const kinds = await Promise.all(
        [
          apiErrorWithBody(403, "AUTH_FORBIDDEN"),
          apiErrorWithBody(404, "ENTITY_NOT_FOUND"),
          apiErrorWithBody(422, "ENTITY_INVALID_ID"),
        ].map(async (error) => {
          const service = new EntityLookupService(mockFailingApiService(error));
          return service
            .resolve("hrms.staff-member", "id")
            .then(() => "resolved")
            .catch((caught: EntityLookupError) => caught.kind);
        })
      );

      // The single assertion this whole taxonomy exists for: three inputs, three answers. Merging
      // any two of them is what leaves a dangling reference invisible.
      expect(new Set(kinds).size).toBe(3);
      expect(kinds).toEqual(["forbidden", "missing", "invalid"]);
    });

    it("separates an unregistered entity type from a deleted record, though both arrive as 404", async () => {
      const service = new EntityLookupService(
        mockFailingApiService(apiErrorWithBody(404, "ENTITY_UNKNOWN_TYPE"))
      );

      // A key this deployment does not have is a configuration fault, not a deleted record. Telling
      // an admin their referenced record was deleted would send them looking for data loss that
      // never happened.
      await expect(service.resolve("nope.nothing", "id")).rejects.toMatchObject({
        kind: "unavailable",
      });
    });

    it("does not guess a kind for a failure that carried no error body", async () => {
      const service = new EntityLookupService(mockFailingApiService(new Error("Network Error")));

      // ApiService's 403 branch rejects without `.details`, so an unclassifiable failure is real.
      // The honest answer is `unknown` -> a generic error; inventing `forbidden` or `missing` here
      // would put a confident, wrong sentence on screen.
      await expect(service.resolve("hrms.staff-member", "id")).rejects.toMatchObject({
        kind: "unknown",
        statusCode: 0,
        errorCode: "UNKNOWN",
      });
    });

    it("reports an aborted request as cancelled rather than as a server failure", async () => {
      // Our own AbortController.abort() reaches ApiService's `isExternalAbort` check and is rejected
      // as DownloadInterceptedError. Unrecognised, every superseded keystroke would render as a
      // lookup failure.
      const aborted = new Error("Download intercepted by external download manager");
      aborted.name = "DownloadInterceptedError";
      const service = new EntityLookupService(mockFailingApiService(aborted));

      await expect(service.resolve("hrms.staff-member", "id")).rejects.toMatchObject({
        kind: "cancelled",
      });
    });

    it("passes an already-classified error through unchanged", async () => {
      const original = new EntityLookupError({
        kind: "forbidden",
        statusCode: 403,
        errorCode: "AUTH_FORBIDDEN",
        message: "nope",
      });
      const service = new EntityLookupService(mockFailingApiService(original));

      // Idempotence matters because the hooks call `EntityLookupError.from` again defensively; a
      // second pass must not downgrade a known kind to `unknown`.
      await expect(service.resolve("hrms.staff-member", "id")).rejects.toBe(original);
    });
  });
});
