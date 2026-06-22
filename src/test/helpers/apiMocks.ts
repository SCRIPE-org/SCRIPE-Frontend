import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { createMockTokenResponse, createMockAdmin } from "./mockFactories";

/**
 * MSW server for intercepting API requests in tests.
 * Import and use in test files:
 *
 * ```ts
 * import { server, handlers } from "@/test/helpers/apiMocks";
 *
 * beforeAll(() => server.listen());
 * afterEach(() => server.resetHandlers());
 * afterAll(() => server.close());
 * ```
 */

// ──────────────────────────────────────────────
// Default handlers (happy path)
// ──────────────────────────────────────────────

export const handlers = [
  // Auth - Login
  http.post("*/api/v1/auth/admin/login", () => {
    return HttpResponse.json(createMockTokenResponse());
  }),

  // Auth - Refresh Token
  http.post("*/api/v1/auth/admin/refresh-token", () => {
    return HttpResponse.json(createMockTokenResponse());
  }),

  // Auth - Logout
  http.post("*/api/v1/auth/admin/logout", () => {
    return new HttpResponse(null, { status: 200 });
  }),

  // Auth - Me
  http.get("*/api/v1/admins/me", () => {
    return HttpResponse.json(createMockAdmin());
  }),

  // Admins - List
  http.get("*/api/v1/admins", () => {
    return HttpResponse.json({
      items: [createMockAdmin(), createMockAdmin({ id: "2", username: "admin2" })],
      totalCount: 2,
      page: 1,
      pageSize: 10,
    });
  }),
];

// ──────────────────────────────────────────────
// Server setup
// ──────────────────────────────────────────────

export const server = setupServer(...handlers);

// ──────────────────────────────────────────────
// Override helpers for specific test scenarios
// ──────────────────────────────────────────────

export const overrides = {
  /** Make login return an error */
  loginError: (status = 401, message = "Invalid credentials") =>
    http.post("*/api/v1/auth/admin/login", () => {
      return HttpResponse.json({ error: { code: "INVALID_CREDENTIALS", message } }, { status });
    }),

  /** Make login require 2FA */
  login2FA: () =>
    http.post("*/api/v1/auth/admin/login", () => {
      return HttpResponse.json(
        createMockTokenResponse({ requires2FA: true, accessToken: "", refreshToken: "" })
      );
    }),

  /** Make any endpoint return a network error */
  networkError: (path: string) =>
    http.all(path, () => {
      return HttpResponse.error();
    }),
};
