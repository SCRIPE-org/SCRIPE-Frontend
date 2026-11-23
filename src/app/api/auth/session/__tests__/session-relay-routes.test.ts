import { createHash, createHmac } from "node:crypto";
import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  DELETE as establishDelete,
  GET as establishGet,
  OPTIONS as establishOptions,
  POST as establishPost,
  PUT as establishPut,
} from "../establish/route";
import { GET as refreshGet, POST as refreshPost } from "../refresh/route";
import { GET as logoutGet, POST as logoutPost } from "../logout/route";
import { RELAY_COOKIE_DEV_HTTP, RELAY_COOKIE_PROD } from "@core/services/session-relay-hmac";

const TEST_RELAY_SECRET = "test-relay-hmac-secret-at-least-32-characters-long-1234";

function buildJsonPostRequest(
  url: string,
  body: Record<string, unknown>,
  headers: Record<string, string> = {}
): NextRequest {
  return new NextRequest(url, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...headers,
    },
    body: JSON.stringify(body),
  });
}

describe("Custom-domain 3-route session micro-relay (/api/auth/session/*)", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
    vi.stubEnv("SCRIPE_SESSION_RELAY_HMAC_SECRET", TEST_RELAY_SECRET);
    vi.stubEnv("NEXT_PUBLIC_API_URL", "https://api.scripe.org/api");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("rejects non-POST methods with 405 Method Not Allowed and Allow: POST", async () => {
    for (const handler of [establishGet, establishPut, establishDelete, establishOptions, refreshGet, logoutGet]) {
      const res = handler();
      expect(res.status).toBe(405);
      expect(res.headers.get("allow")).toBe("POST");
    }
  });

  it("rejects cross-site Fetch Metadata and mismatched Origin headers (SEC-RELAY-01)", async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);

    const crossSiteReq = buildJsonPostRequest(
      "https://portal.club.com/api/auth/session/establish",
      { code: "c1", state: "s1" },
      {
        host: "portal.club.com",
        origin: "https://portal.club.com",
        "sec-fetch-site": "cross-site",
      }
    );
    const crossSiteRes = await establishPost(crossSiteReq);
    expect(crossSiteRes.status).toBe(403);
    expect(fetchSpy).not.toHaveBeenCalled();

    const badOriginReq = buildJsonPostRequest(
      "https://portal.club.com/api/auth/session/refresh",
      {},
      {
        host: "portal.club.com",
        origin: "https://evil.com",
        "sec-fetch-site": "same-origin",
      }
    );
    const badOriginRes = await refreshPost(badOriginReq);
    expect(badOriginRes.status).toBe(403);
    expect(fetchSpy).not.toHaveBeenCalled();

    const missingOriginReq = buildJsonPostRequest(
      "https://portal.club.com/api/auth/session/logout",
      {},
      { host: "portal.club.com" }
    );
    const missingOriginRes = await logoutPost(missingOriginReq);
    expect(missingOriginRes.status).toBe(403);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("fails closed in production when SCRIPE_SESSION_RELAY_HMAC_SECRET is missing or weak", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("SCRIPE_SESSION_RELAY_HMAC_SECRET", "");
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);

    const req = buildJsonPostRequest(
      "https://portal.club.com/api/auth/session/establish",
      { code: "c1", state: "s1" },
      {
        "x-forwarded-host": "portal.club.com",
        "x-forwarded-proto": "https",
        origin: "https://portal.club.com",
      }
    );
    const res = await establishPost(req);
    expect(res.status).toBe(503);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("signs S2S /establish request with HMAC-SHA256, sets __Host-scripe_refresh_token for admin/user, and strips refreshToken JSON", async () => {
    vi.stubEnv("NODE_ENV", "production");
    let capturedUrl = "";
    let capturedHeaders: Record<string, string> = {};
    let capturedBody = "";

    const fetchMock = vi.fn(async (url: string | URL | Request, init?: RequestInit) => {
      capturedUrl = String(url);
      capturedHeaders = (init?.headers ?? {}) as Record<string, string>;
      capturedBody = String(init?.body ?? "");
      return new Response(
        JSON.stringify({
          type: "admin",
          accessToken: "jwt-access-1",
          refreshToken: "should-be-stripped-if-present",
          staySignedIn: true,
          expiresAt: "2026-12-01T00:00:00Z",
          mustChangePassword: false,
        }),
        {
          status: 200,
          headers: {
            "content-type": "application/json",
            "x-scripe-relay-refresh-token": "srv-refresh-tok-admin",
            "x-scripe-relay-principal-type": "admin",
            "x-scripe-relay-refresh-maxage": "3600",
          },
        }
      );
    });
    vi.stubGlobal("fetch", fetchMock);

    const req = buildJsonPostRequest(
      "https://portal.club.com/api/auth/session/establish",
      { code: "handoff-code-1", state: "handoff-state-1" },
      {
        "x-forwarded-host": "portal.club.com",
        "x-forwarded-proto": "https",
        origin: "https://portal.club.com",
        "sec-fetch-site": "same-origin",
        "x-forwarded-for": "203.0.113.42, 10.0.0.1",
      }
    );

    const res = await establishPost(req);
    expect(res.status).toBe(200);
    expect(capturedUrl).toBe("https://api.scripe.org/api/v1/auth/sso/handoff");

    // Verify canonical HMAC signature matches server verifier contract
    const ts = capturedHeaders["X-Scripe-Session-Relay-Ts"];
    const nonce = capturedHeaders["X-Scripe-Session-Relay-Nonce"];
    const clientIp = capturedHeaders["X-Scripe-Session-Relay-Client-Ip"];
    const sig = capturedHeaders["X-Scripe-Session-Relay-Sig"];
    expect(clientIp).toBe("203.0.113.42");
    expect(capturedHeaders["X-Forwarded-For"]).toBe("203.0.113.42");
    expect(capturedHeaders.Origin).toBe("https://portal.club.com");
    const bodyHash = createHash("sha256").update(capturedBody, "utf8").digest("hex");
    const canonical = `POST\n/api/v1/auth/sso/handoff\n${bodyHash}\n${nonce}\n${ts}\n${clientIp}`;
    const expectedSig = createHmac("sha256", TEST_RELAY_SECRET).update(canonical, "utf8").digest("hex");
    expect(sig).toBe(expectedSig);

    // Refresh secret stripped from browser JSON
    const json = (await res.json()) as Record<string, unknown>;
    expect(json.accessToken).toBe("jwt-access-1");
    expect(json.refreshToken).toBeUndefined();
    expect(json.staySignedIn).toBeUndefined();

    // First-party __Host- cookie set cleanly with no Domain
    const cookie = res.cookies.get(RELAY_COOKIE_PROD);
    expect(cookie?.value).toBe("admin|srv-refresh-tok-admin");
    expect(cookie?.httpOnly).toBe(true);
    expect(cookie?.secure).toBe(true);
    expect(cookie?.sameSite).toBe("lax");
    expect(cookie?.path).toBe("/");
    expect(cookie?.maxAge).toBe(3600);
    const setCookieHeader = res.headers.get("set-cookie") ?? "";
    expect(setCookieHeader).not.toMatch(/Domain=/i);
  });

  it("dispatches /refresh for user and admin principals accurately, rotates cookie, and clears on 401", async () => {
    vi.stubEnv("NODE_ENV", "production");
    const calls: Array<{ url: string; body: string }> = [];
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string | URL | Request, init?: RequestInit) => {
        calls.push({ url: String(url), body: String(init?.body ?? "") });
        if (calls.length === 1) {
          return new Response(JSON.stringify({ accessToken: "new-user-jwt" }), {
            status: 200,
            headers: {
              "x-scripe-relay-refresh-token": "rotated-user-refresh",
              "x-scripe-relay-principal-type": "user",
            },
          });
        }
        return new Response(JSON.stringify({ error: "invalid_refresh" }), { status: 401 });
      })
    );

    const userReq = new NextRequest("https://portal.club.com/api/auth/session/refresh", {
      method: "POST",
      headers: {
        "x-forwarded-host": "portal.club.com",
        "x-forwarded-proto": "https",
        origin: "https://portal.club.com",
        cookie: `${RELAY_COOKIE_PROD}=user|initial-user-refresh`,
      },
    });
    const userRes = await refreshPost(userReq);
    expect(userRes.status).toBe(200);
    expect(calls[0].url).toBe("https://api.scripe.org/api/v1/auth/user/refresh");
    expect(JSON.parse(calls[0].body)).toEqual({ refreshToken: "initial-user-refresh" });
    expect(userRes.cookies.get(RELAY_COOKIE_PROD)?.value).toBe("user|rotated-user-refresh");

    // 401 expires __Host-scripe_refresh_token
    const expiredReq = new NextRequest("https://portal.club.com/api/auth/session/refresh", {
      method: "POST",
      headers: {
        "x-forwarded-host": "portal.club.com",
        "x-forwarded-proto": "https",
        origin: "https://portal.club.com",
        cookie: `${RELAY_COOKIE_PROD}=admin|revoked-tok`,
      },
    });
    const expiredRes = await refreshPost(expiredReq);
    expect(expiredRes.status).toBe(401);
    expect(calls[1].url).toBe("https://api.scripe.org/api/v1/auth/admin/refresh");
    expect(expiredRes.cookies.get(RELAY_COOKIE_PROD)?.maxAge).toBe(0);
  });

  it("forwards logoutScope on /logout and allows dev HTTP cookie fallback ONLY outside production", async () => {
    vi.stubEnv("NODE_ENV", "development");
    const calls: Array<{ url: string; body: string }> = [];
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string | URL | Request, init?: RequestInit) => {
        calls.push({ url: String(url), body: String(init?.body ?? "") });
        return new Response(JSON.stringify({ success: true }), { status: 200 });
      })
    );

    const devReq = new NextRequest("http://portal.club.test/api/auth/session/logout", {
      method: "POST",
      headers: {
        host: "portal.club.test",
        origin: "http://portal.club.test",
        cookie: `${RELAY_COOKIE_DEV_HTTP}=admin|dev-rtok`,
      },
      body: JSON.stringify({ logoutScope: "central" }),
    });
    const devRes = await logoutPost(devReq);
    expect(devRes.status).toBe(200);
    expect(calls[0].url).toBe("https://api.scripe.org/api/v1/auth/admin/logout");
    expect(JSON.parse(calls[0].body)).toEqual({
      refreshToken: "dev-rtok",
      logoutScope: "central",
    });
    expect(devRes.cookies.get(RELAY_COOKIE_DEV_HTTP)?.maxAge).toBe(0);

    // Outside HTTP dev (Production), dev cookie MUST be ignored -> /refresh returns 401
    vi.stubEnv("NODE_ENV", "production");
    const prodWithDevCookie = new NextRequest("https://portal.club.com/api/auth/session/refresh", {
      method: "POST",
      headers: {
        "x-forwarded-host": "portal.club.com",
        "x-forwarded-proto": "https",
        origin: "https://portal.club.com",
        cookie: `${RELAY_COOKIE_DEV_HTTP}=admin|dev-rtok`,
      },
    });
    const rejectedRes = await refreshPost(prodWithDevCookie);
    expect(rejectedRes.status).toBe(401);
  });

  it("enforces FE-RELAY-01..03 & #256/#258: non-spoofable IP/authority, placeholder secret guard, ephemeral cookie (maxAge=0), 502 missing refresh cookie, security headers, and manual redirect", async () => {
    // 1. Short (<32 chars) rejected even outside prod; dev placeholder rejected in prod (#256 #2, FE-RELAY-03)
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("SCRIPE_SESSION_RELAY_HMAC_SECRET", "short-secret-under-32-chars");
    const shortRes = await establishPost(
      buildJsonPostRequest(
        "https://portal.club.com/api/auth/session/establish",
        { code: "c1", state: "s1" },
        { host: "portal.club.com", origin: "https://portal.club.com" }
      )
    );
    expect(shortRes.status).toBe(503);
    expect(shortRes.headers.get("x-content-type-options")).toBe("nosniff");
    expect(shortRes.headers.get("vary")).toBe("Origin, Sec-Fetch-Site");

    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv(
      "SCRIPE_SESSION_RELAY_HMAC_SECRET",
      "SCRIPE_DEV_SESSION_RELAY_HMAC_not_for_production"
    );
    const placeholderRes = await establishPost(
      buildJsonPostRequest(
        "https://portal.club.com/api/auth/session/establish",
        { code: "c1", state: "s1" },
        { host: "portal.club.com", origin: "https://portal.club.com" }
      )
    );
    expect(placeholderRes.status).toBe(503);

    // 2. Host header takes precedence over spoofable X-Forwarded-Host (#256 #1)
    vi.stubEnv("SCRIPE_SESSION_RELAY_HMAC_SECRET", TEST_RELAY_SECRET);
    const spoofHostRes = await establishPost(
      buildJsonPostRequest(
        "https://portal.club.com/api/auth/session/establish",
        { code: "c1", state: "s1" },
        {
          host: "real.club.com",
          "x-forwarded-host": "portal.club.com",
          origin: "https://portal.club.com",
        }
      )
    );
    expect(spoofHostRes.status).toBe(403);

    // 3. Fail closed 502 when accessToken returned without refresh cookie (FE-RELAY-01)
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        new Response(JSON.stringify({ accessToken: "orphan-jwt", type: "admin" }), {
          status: 200,
          headers: { "content-type": "application/json" },
        })
      )
    );
    const missingCookieRes = await establishPost(
      buildJsonPostRequest(
        "https://portal.club.com/api/auth/session/establish",
        { code: "c1", state: "s1" },
        { host: "portal.club.com", origin: "https://portal.club.com" }
      )
    );
    expect(missingCookieRes.status).toBe(502);

    // 4. Rightmost non-private IP in X-Forwarded-For, manual redirect + signal, and staySignedIn=false (maxAge=0 -> session cookie omitted maxAge) (#256 #1/#3, #258, FE-RELAY-02)
    let capturedClientIp = "";
    let capturedRedirect: RequestRedirect | undefined;
    let hasSignal = false;
    vi.stubGlobal(
      "fetch",
      vi.fn(async (_url: string | URL | Request, init?: RequestInit) => {
        const hdrs = (init?.headers ?? {}) as Record<string, string>;
        capturedClientIp = hdrs["X-Scripe-Session-Relay-Client-Ip"] ?? "";
        capturedRedirect = init?.redirect;
        hasSignal = Boolean(init?.signal);
        return new Response(JSON.stringify({ accessToken: "ephemeral-jwt", type: "admin" }), {
          status: 200,
          headers: {
            "content-type": "application/json",
            "x-scripe-relay-refresh-token": "ephemeral-rtok",
            "x-scripe-relay-principal-type": "admin",
            "x-scripe-relay-refresh-maxage": "0",
          },
        });
      })
    );
    const ephemeralRes = await establishPost(
      buildJsonPostRequest(
        "https://portal.club.com/api/auth/session/establish",
        { code: "c2", state: "s2" },
        {
          host: "portal.club.com",
          origin: "https://portal.club.com",
          "x-forwarded-for": "198.51.100.99, 203.0.113.42, 10.0.0.5",
        }
      )
    );
    expect(ephemeralRes.status).toBe(200);
    expect(capturedClientIp).toBe("203.0.113.42");
    expect(capturedRedirect).toBe("manual");
    expect(hasSignal).toBe(true);
    expect(ephemeralRes.cookies.get(RELAY_COOKIE_PROD)?.maxAge).toBeUndefined();
    expect(ephemeralRes.headers.get("set-cookie") ?? "").not.toMatch(/Max-Age=/i);
  });
});
