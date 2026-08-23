/**
 * ApiService 403 handling — contract guard for all three cases.
 *
 * WHY THIS FILE EXISTS
 * --------------------
 * `api.service.ts`'s response interceptor splits a 403 three ways, and the three outcomes are
 * deliberately, visibly different: Case 1 silently clears a bad tenant context, Case 2 surfaces a
 * business-rule rejection inline, Case 3 hard-redirects the entire app to /not-authorized. Which
 * branch a given response body falls into is therefore a real behavioural contract shared by every
 * feature in the product, and it is decided purely by the shape of the JSON body — a `error` field
 * holding one of three tenant-context codes, an `errorCode` field, or neither.
 *
 * The change these tests were written for is narrow: Case 2 used to reject with a bare
 * `new Error(message)` while every other rejection path in the file attached the parsed body as
 * `errObj.details`. Because `IApiService` exposes no HTTP status codes at all, `details` is the only
 * machine-readable classification a caller can reach, so dropping it made a structured 403
 * indistinguishable from an unclassifiable failure. `EntityLookupError` (Custom Fields' reference
 * picker) has a correct `forbidden` arm keyed on `details.errorCode` / `details.statusCode` that
 * could not be reached in production for exactly that reason.
 *
 * The fix is one branch, so the risk is not "does the fix work" but "did the fix disturb the routing
 * or the other two branches". Hence a test per case, not a test for the fix.
 *
 * HOW IT DRIVES THE INTERCEPTOR
 * -----------------------------
 * By invoking the registered rejection handler directly with a synthetic `AxiosError`, rather than
 * by mocking the network. The handler IS the unit under test; going through a mock adapter would add
 * a second thing that can fail while testing nothing extra. Synthetic errors are built to avoid
 * every shape `isExternalAbort` matches (no `ERR_CANCELED`/`ECONNABORTED` code, message not
 * "canceled"), because that check runs BEFORE the 403 block and would short-circuit it.
 *
 * The body shapes used below are the real ones, read off the backend rather than invented:
 *   Case 1  TenantContextMiddleware.WriteForbiddenAsync -> { error, message, code }
 *   Case 2  ErrorResultExtensions.ErrorResult -> ErrorResponse.FromError -> { statusCode, errorCode, message }
 *   Case 3a ASP.NET Core `UseAuthorization()` policy failure -> empty body (no custom
 *           IAuthorizationMiddlewareResultHandler is registered in the host pipeline)
 *   Case 3b CloudflareOriginVerificationMiddleware -> { error: "forbidden", message } — an `error`
 *           field that is NOT a tenant-context code and no `errorCode`, so it lands in Case 3.
 */
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import type { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from "axios";
import { ApiService } from "../api.service";
import { STORAGE_KEYS } from "@core/config/storage-keys";
// Read-only import of the consumer whose shipped UI state the Case 2 defect made unreachable.
// Asserting through the real classifier — instead of re-implementing its `details` lookup here — is
// the only way this file can prove the actual user-visible consequence rather than restating the
// implementation. Nothing in that module is modified by these tests.
//
// Imported via the submodule's `index.ts` barrel, matching every other cross-module import in this
// codebase. The barrel also re-exports the react-query hooks (`useEntityLookupSearch` and friends),
// so this drags their module graph -- including the DI container and `@tanstack/react-query` -- into
// this file's import chain. None of it executes: `EntityLookupError` is a side-effect-free class and
// nothing here calls a hook, so the extra graph is load cost, not a live dependency.
import { EntityLookupError } from "@modules/custom-fields/entity-lookup";

/** The interceptor's rejection handler: `(error) => Promise<never>` in practice. */
type RejectedHandler = (error: unknown) => Promise<unknown>;

/**
 * Pulls the response interceptor's rejection handler off the authenticated axios instance.
 *
 * Reaches through `as unknown as` because both the instance and axios's `handlers` array are private
 * to their owners. The alternative — exporting a seam from `api.service.ts` purely for tests — would
 * widen a file that every request in the product goes through, to prove something a test can observe
 * without it.
 */
function responseRejectedHandler(service: ApiService): RejectedHandler {
  const instance = (service as unknown as { axiosInstance: AxiosInstance }).axiosInstance;
  const handlers = (
    instance.interceptors.response as unknown as {
      handlers: Array<{ rejected?: RejectedHandler } | null>;
    }
  ).handlers;

  const rejected = handlers.find((entry) => typeof entry?.rejected === "function")?.rejected;
  if (!rejected) {
    throw new Error("ApiService registered no response rejection handler — interceptor wiring moved");
  }
  return rejected;
}

/** A minimal `AxiosError` carrying a 403 and the given parsed body. */
function forbiddenError(data: unknown): AxiosError {
  const config = { headers: {}, method: "get", url: "/v1/entity-lookup/identity.user" };
  return {
    isAxiosError: true,
    name: "AxiosError",
    // Axios's real message for a 403. Deliberately not "canceled", which `isExternalAbort` matches.
    message: "Request failed with status code 403",
    config: config as unknown as InternalAxiosRequestConfig,
    response: {
      status: 403,
      statusText: "Forbidden",
      data,
      headers: {},
      config: config as unknown as InternalAxiosRequestConfig,
    },
    toJSON: () => ({}),
  } as unknown as AxiosError;
}

/** The rejection value, typed for the `details` channel callers actually read. */
type RejectedValue = Error & { details?: unknown };

/** Runs the handler and returns what it rejected with, failing loudly if it resolves. */
async function rejectionOf(handler: RejectedHandler, error: AxiosError): Promise<RejectedValue> {
  try {
    await handler(error);
  } catch (caught) {
    return caught as RejectedValue;
  }
  throw new Error("403 handler resolved instead of rejecting");
}

/** Replaceable stand-in for `window.location`; jsdom's own throws on navigation. */
interface LocationStub {
  pathname: string;
  href: string;
}

describe("ApiService 403 handling", () => {
  let originalLocation: Location;
  let location: LocationStub;
  let service: ApiService;
  let handler: RejectedHandler;

  beforeEach(() => {
    originalLocation = window.location;
    // Starts on an ordinary in-app page: Case 3's redirect is guarded on the current pathname not
    // already being /not-authorized or /login, so starting anywhere else is what makes the redirect
    // observable at all.
    location = { pathname: "/dashboard", href: "http://localhost/dashboard" };
    Object.defineProperty(window, "location", {
      value: location,
      configurable: true,
      writable: true,
    });

    sessionStorage.clear();
    service = new ApiService("/api");
    handler = responseRejectedHandler(service);
  });

  afterEach(() => {
    Object.defineProperty(window, "location", {
      value: originalLocation,
      configurable: true,
      writable: true,
    });
    sessionStorage.clear();
  });

  describe("Case 2 — structured business-rule rejection", () => {
    // The exact body `ErrorResponse.FromError(Error.Forbidden(ErrorCodes.Forbidden, ...))` produces
    // for an entity-lookup denial: ErrorCodes.Forbidden is "AUTH_FORBIDDEN", and FromError maps
    // ErrorType.Forbidden to 403. Serialized camelCase (AppJsonContext pins CamelCase for
    // ErrorResponse), which is why the interceptor keys on `errorCode` and not `ErrorCode`.
    const lookupDenialBody = {
      statusCode: 403,
      errorCode: "AUTH_FORBIDDEN",
      message: "Permission 'identity.user.view' is required.",
    };

    it("attaches the parsed body as `details`, the same channel every sibling path uses", async () => {
      const rejection = await rejectionOf(handler, forbiddenError(lookupDenialBody));

      // Same object, not a copy: callers read nested fields off it, and a clone would be a second
      // representation of the response body that could drift.
      expect(rejection.details).toBe(lookupDenialBody);
    });

    it("exposes statusCode and errorCode, the only machine-readable classification callers get", async () => {
      const rejection = await rejectionOf(handler, forbiddenError(lookupDenialBody));

      expect(rejection.details).toMatchObject({ statusCode: 403, errorCode: "AUTH_FORBIDDEN" });
    });

    it("lets EntityLookupError classify a picker denial as `forbidden` rather than `unknown`", async () => {
      const rejection = await rejectionOf(handler, forbiddenError(lookupDenialBody));

      // The whole point of the change, asserted through the real consumer: "you do not have
      // permission to view this type of record" is reachable, and the fix is a role change rather
      // than the generic failure text.
      const classified = EntityLookupError.from(rejection);
      expect(classified.kind).toBe("forbidden");
      expect(classified.errorCode).toBe("AUTH_FORBIDDEN");
      expect(classified.statusCode).toBe(403);
    });

    it("still surfaces the server's own localized message", async () => {
      const rejection = await rejectionOf(handler, forbiddenError(lookupDenialBody));

      expect(rejection.message).toBe("Permission 'identity.user.view' is required.");
    });

    it("does not navigate the user away from what they were doing", async () => {
      await rejectionOf(handler, forbiddenError(lookupDenialBody));

      // A picker search that 403s must leave a half-filled form intact. This is the difference
      // between Case 2 and Case 3 and the reason the split exists.
      expect(location.href).toBe("http://localhost/dashboard");
    });

    it("classifies by `errorCode` alone, so a body without statusCode still stays inline", async () => {
      // A handler that emitted only errorCode is still a business-rule rejection. Pins that the
      // branch condition is `data.errorCode`, not a status-code match.
      const rejection = await rejectionOf(
        handler,
        forbiddenError({ errorCode: "MUST_CHANGE_PASSWORD", message: "Password change required." })
      );

      expect(rejection.details).toMatchObject({ errorCode: "MUST_CHANGE_PASSWORD" });
      expect(location.href).toBe("http://localhost/dashboard");
    });
  });

  describe("Case 1 — tenant-context rejection (unchanged)", () => {
    // Every code TenantContextMiddleware can emit. Enumerated rather than sampled because the
    // interceptor holds them in a literal Set: a code dropped from that Set silently becomes a hard
    // redirect, which is the failure this loop exists to catch.
    const tenantContextCodes = [
      "TENANT_CONTEXT_FORBIDDEN",
      "TENANT_CONTEXT_INVALID",
      "TENANT_CONTEXT_OUT_OF_SCOPE",
    ] as const;

    for (const code of tenantContextCodes) {
      it(`clears the bad context and does not redirect for ${code}`, async () => {
        service.setTenantContext("encrypted-tenant-id");
        sessionStorage.setItem(
          STORAGE_KEYS.tenant_context,
          JSON.stringify({ id: "encrypted-tenant-id" })
        );

        const rejection = await rejectionOf(
          handler,
          // Real middleware shape: `error` + `message` + `code`, and notably NO `errorCode`, which
          // is what keeps it out of Case 2.
          forbiddenError({ error: code, message: "You may not switch tenant context.", code: 403 })
        );

        expect(service.getTenantContext()).toBeNull();
        expect(sessionStorage.getItem(STORAGE_KEYS.tenant_context)).toBeNull();
        expect(rejection.message).toBe("You may not switch tenant context.");
        expect(location.href).toBe("http://localhost/dashboard");
      });
    }

    it("does not attach `details` — scope fence on the Case 2 change", async () => {
      const rejection = await rejectionOf(
        handler,
        forbiddenError({ error: "TENANT_CONTEXT_INVALID", message: "Invalid.", code: 403 })
      );

      // Not an endorsement of the omission: Case 1 and Case 3 drop the body too, and extending the
      // fix to them is a separate, deliberate decision. This assertion exists so that decision is
      // made on purpose and shows up as a failing test rather than as an unreviewed side effect of
      // editing the Case 2 branch.
      expect(rejection.details).toBeUndefined();
    });
  });

  describe("Case 3 — unstructured 403 (unchanged)", () => {
    it("hard-redirects to /not-authorized for an empty body", async () => {
      // ASP.NET Core's own authorization middleware failing `[Authorize]`/`[AdminOnly]` writes no
      // body at all — the host registers no custom IAuthorizationMiddlewareResultHandler.
      const rejection = await rejectionOf(handler, forbiddenError(undefined));

      expect(location.href).toBe("/not-authorized");
      expect(rejection.message).toBe("You do not have permission to perform this action.");
    });

    it("hard-redirects for an `error` field that is not a tenant-context code", async () => {
      // CloudflareOriginVerificationMiddleware's real body. It has an `error` field, so it is worth
      // pinning that having `error` is not by itself enough to reach Case 1.
      await rejectionOf(
        handler,
        forbiddenError({ error: "forbidden", message: "Origin verification required." })
      );

      expect(location.href).toBe("/not-authorized");
    });

    it("does not redirect when already on /not-authorized", async () => {
      location.pathname = "/not-authorized";
      location.href = "http://localhost/not-authorized";

      await rejectionOf(handler, forbiddenError({}));

      // Without this guard the app would reload itself forever on the error page.
      expect(location.href).toBe("http://localhost/not-authorized");
    });

    it("does not redirect when already on /login", async () => {
      location.pathname = "/login";
      location.href = "http://localhost/login";

      await rejectionOf(handler, forbiddenError({}));

      expect(location.href).toBe("http://localhost/login");
    });

    it("does not attach `details` — scope fence on the Case 2 change", async () => {
      const rejection = await rejectionOf(
        handler,
        forbiddenError({ message: "No structured code here." })
      );

      expect(rejection.details).toBeUndefined();
    });
  });

  describe("case routing is decided by body shape, not by status alone", () => {
    it("prefers Case 1 over Case 2 when a body carries both a tenant-context code and an errorCode", async () => {
      service.setTenantContext("encrypted-tenant-id");

      await rejectionOf(
        handler,
        forbiddenError({
          error: "TENANT_CONTEXT_OUT_OF_SCOPE",
          errorCode: "AUTH_FORBIDDEN",
          message: "Out of scope.",
        })
      );

      // Order matters: a drill-down rejection must clear the context even if a future middleware
      // starts emitting both fields, because leaving a bad context in place would make every
      // subsequent request fail the same way.
      expect(service.getTenantContext()).toBeNull();
      expect(location.href).toBe("http://localhost/dashboard");
    });

    it("leaves non-403 errors on the generic path, which already attached `details`", async () => {
      const body = { statusCode: 404, errorCode: "ENTITY_NOT_FOUND", message: "Not found." };
      const notFound = forbiddenError(body);
      (notFound.response as { status: number }).status = 404;

      const rejection = await rejectionOf(handler, notFound);

      // Baseline for the fix: this is the behaviour Case 2 now matches.
      expect(rejection.details).toBe(body);
      expect(location.href).toBe("http://localhost/dashboard");
    });
  });
});
