import { createHash } from "node:crypto";
import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  DELETE as bindDelete,
  GET as bindGet,
  POST as bindPost,
} from "../bind/route";
import {
  GET as consumeGet,
  POST as consumePost,
  PUT as consumePut,
} from "../consume-binding/route";
import {
  SSO_BINDING_COOKIE_DEV_HTTP,
  SSO_BINDING_COOKIE_PROD,
} from "@core/services/session-relay-sso-binding";
import {
  bindSsoBrowserNonce,
  consumeSsoBrowserNonce,
  postCustomDomainSessionRelay,
} from "@core/services/custom-domain-relay-client";
import { secureTokenService } from "@core/common/secure-token-service";
import { SudoCancelledError, isSudoCancelledError, useSudoStore } from "@core/store/useSudoStore";

describe("First-party SSO Login CSRF binding routes (/api/auth/sso/*)", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
    secureTokenService.clearTokens();
    useSudoStore.getState().reset();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    secureTokenService.clearTokens();
    useSudoStore.getState().reset();
  });

  it("rejects non-POST methods with 405 Method Not Allowed and no-store headers", () => {
    for (const handler of [bindGet, bindDelete, consumeGet, consumePut]) {
      const res = handler();
      expect(res.status).toBe(405);
      expect(res.headers.get("allow")).toBe("POST");
      expect(res.headers.get("cache-control")).toContain("no-store");
    }
  });

  it("binds __Host-scripe_sso_nonce on POST /api/auth/sso/bind without needing HMAC secret and verifies SHA-256 binding on consume", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("SCRIPE_SESSION_RELAY_HMAC_SECRET", "");

    const bindReq = new NextRequest("https://portal.club.com/api/auth/sso/bind", {
      method: "POST",
      headers: {
        host: "portal.club.com",
        origin: "https://portal.club.com",
        "sec-fetch-site": "same-origin",
      },
    });
    const bindRes = await bindPost(bindReq);
    expect(bindRes.status).toBe(200);
    expect(bindRes.headers.get("cache-control")).toContain("no-store");

    const bindJson = (await bindRes.json()) as { browserBindingHash: string };
    expect(bindJson.browserBindingHash).toMatch(/^[A-Za-z0-9_-]{43}$/);

    const cookie = bindRes.cookies.get(SSO_BINDING_COOKIE_PROD);
    expect(cookie?.value).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(cookie?.httpOnly).toBe(true);
    expect(cookie?.sameSite).toBe("lax");
    expect(cookie?.secure).toBe(true);
    expect(cookie?.path).toBe("/");
    expect(cookie?.maxAge).toBe(600);
    expect(bindRes.headers.get("set-cookie") ?? "").not.toMatch(/Domain=/i);

    const expectedHash = createHash("sha256")
      .update(cookie!.value, "utf8")
      .digest("base64url");
    expect(bindJson.browserBindingHash).toBe(expectedHash);

    const consumeReq = new NextRequest("https://portal.club.com/api/auth/sso/consume-binding", {
      method: "POST",
      headers: {
        host: "portal.club.com",
        origin: "https://portal.club.com",
        "sec-fetch-site": "same-origin",
        cookie: `${SSO_BINDING_COOKIE_PROD}=${cookie!.value}`,
      },
    });
    const consumeRes = await consumePost(consumeReq);
    expect(consumeRes.status).toBe(200);
    expect(consumeRes.headers.get("cache-control")).toContain("no-store");

    const consumeJson = (await consumeRes.json()) as { browserBindingNonce: string | null };
    expect(consumeJson.browserBindingNonce).toBe(cookie!.value);
    expect(consumeRes.cookies.get(SSO_BINDING_COOKIE_PROD)?.maxAge).toBe(0);
  });

  it("enforces strict Sec-Fetch-Site: same-origin and Origin === authority on bind/consume", async () => {
    vi.stubEnv("NODE_ENV", "production");

    const missingFetchSiteConsume = new NextRequest(
      "https://admin.scripe.org/api/auth/sso/consume-binding",
      {
        method: "POST",
        headers: {
          host: "admin.scripe.org",
          origin: "https://admin.scripe.org",
          cookie: `${SSO_BINDING_COOKIE_PROD}=${"a".repeat(43)}`,
        },
      }
    );
    expect((await consumePost(missingFetchSiteConsume)).status).toBe(403);

    const crossOriginBind = new NextRequest("https://admin.scripe.org/api/auth/sso/bind", {
      method: "POST",
      headers: {
        host: "admin.scripe.org",
        origin: "https://evil.example",
        "sec-fetch-site": "same-origin",
      },
    });
    expect((await bindPost(crossOriginBind)).status).toBe(403);

    const crossSiteBind = new NextRequest("https://admin.scripe.org/api/auth/sso/bind", {
      method: "POST",
      headers: {
        host: "admin.scripe.org",
        origin: "https://admin.scripe.org",
        "sec-fetch-site": "cross-site",
      },
    });
    expect((await bindPost(crossSiteBind)).status).toBe(403);
  });

  it("supports dev HTTP cookie fallback ONLY outside production and rejects malformed nonces", async () => {
    vi.stubEnv("NODE_ENV", "development");
    const devBindReq = new NextRequest("http://localhost:3000/api/auth/sso/bind", {
      method: "POST",
      headers: {
        host: "localhost:3000",
        origin: "http://localhost:3000",
      },
    });
    const devBindRes = await bindPost(devBindReq);
    expect(devBindRes.status).toBe(200);
    const devNonce = devBindRes.cookies.get(SSO_BINDING_COOKIE_DEV_HTTP)?.value ?? "";
    expect(devNonce).toMatch(/^[A-Za-z0-9_-]{43}$/);

    const malformedReq = new NextRequest("http://localhost:3000/api/auth/sso/consume-binding", {
      method: "POST",
      headers: {
        host: "localhost:3000",
        origin: "http://localhost:3000",
        "sec-fetch-site": "same-origin",
        cookie: `${SSO_BINDING_COOKIE_DEV_HTTP}=short-invalid`,
      },
    });
    const malformedRes = await consumePost(malformedReq);
    expect(malformedRes.status).toBe(200);
    expect(await malformedRes.json()).toEqual({ browserBindingNonce: null });

    // In production, dev HTTP cookie MUST be ignored
    vi.stubEnv("NODE_ENV", "production");
    const prodWithDevCookie = new NextRequest(
      "https://admin.scripe.org/api/auth/sso/consume-binding",
      {
        method: "POST",
        headers: {
          host: "admin.scripe.org",
          origin: "https://admin.scripe.org",
          "sec-fetch-site": "same-origin",
          cookie: `${SSO_BINDING_COOKIE_DEV_HTTP}=${devNonce}`,
        },
      }
    );
    const prodRes = await consumePost(prodWithDevCookie);
    expect(await prodRes.json()).toEqual({ browserBindingNonce: null });
  });

  it("provides custom-domain relay client helpers for SSO binding and authenticated Bearer/Sudo forwarding", async () => {
    const calls: Array<{ url: string; headers: Record<string, string> }> = [];
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string | URL | Request, init?: RequestInit) => {
        const hdrs = (init?.headers ?? {}) as Record<string, string>;
        calls.push({ url: String(url), headers: hdrs });
        if (String(url).endsWith("/api/auth/sso/bind")) {
          return new Response(JSON.stringify({ browserBindingHash: "h".repeat(43) }), { status: 200 });
        }
        if (String(url).endsWith("/api/auth/sso/consume-binding")) {
          return new Response(JSON.stringify({ browserBindingNonce: "n".repeat(43) }), { status: 200 });
        }
        return new Response(JSON.stringify({ accessToken: "new-jwt" }), { status: 200 });
      })
    );

    const hash = await bindSsoBrowserNonce();
    expect(hash).toBe("h".repeat(43));

    const nonce = await consumeSsoBrowserNonce();
    expect(nonce).toBe("n".repeat(43));

    secureTokenService.setAccessToken("active-bearer-jwt");
    await postCustomDomainSessionRelay(
      "/api/auth/session/establish",
      { mode: "impersonate", adminId: "admin_target_12345" },
      { sudoToken: "sudo-ticket-xyz" }
    );
    expect(calls[2].headers.Authorization).toBe("Bearer active-bearer-jwt");
    expect(calls[2].headers["X-Sudo-Token"]).toBe("sudo-ticket-xyz");
  });

  it("supports { clear: false } on consume-binding for canonical 2-hop continuations and handles Sudo auto-attach + 403 step-up replay/cancel (FE-RELAY-SUDO-02)", async () => {
    vi.stubEnv("NODE_ENV", "production");
    const nonce = "c".repeat(43);

    const peekReq = new NextRequest("https://admin.scripe.org/api/auth/sso/consume-binding", {
      method: "POST",
      headers: {
        host: "admin.scripe.org",
        origin: "https://admin.scripe.org",
        "sec-fetch-site": "same-origin",
        "content-type": "application/json",
        cookie: `${SSO_BINDING_COOKIE_PROD}=${nonce}`,
      },
      body: JSON.stringify({ clear: false }),
    });
    const peekRes = await consumePost(peekReq);
    expect(peekRes.status).toBe(200);
    expect(await peekRes.json()).toEqual({ browserBindingNonce: nonce });
    expect(peekRes.cookies.get(SSO_BINDING_COOKIE_PROD)).toBeUndefined();

    const clearReq = new NextRequest("https://admin.scripe.org/api/auth/sso/consume-binding", {
      method: "POST",
      headers: {
        host: "admin.scripe.org",
        origin: "https://admin.scripe.org",
        "sec-fetch-site": "same-origin",
        "content-type": "application/json",
        cookie: `${SSO_BINDING_COOKIE_PROD}=${nonce}`,
      },
      body: JSON.stringify({ clear: true }),
    });
    const clearRes = await consumePost(clearReq);
    expect(clearRes.status).toBe(200);
    expect(await clearRes.json()).toEqual({ browserBindingNonce: nonce });
    expect(clearRes.cookies.get(SSO_BINDING_COOKIE_PROD)?.maxAge).toBe(0);

    // FE-RELAY-SUDO-02: auto-attaches active sudo token from useSudoStore, challenges once on 403 Identity.SudoRequired, and propagates SudoCancelledError
    secureTokenService.setAccessToken("active-bearer-jwt");
    useSudoStore.getState().markVerified({
      sudoToken: "stored-sudo-1",
      expiresAtUtc: new Date(Date.now() + 60_000).toISOString(),
      methodUsed: "password",
    });

    const sentHeaders: Array<Record<string, string>> = [];
    let attempt = 0;
    vi.stubGlobal(
      "fetch",
      vi.fn(async (_url: string | URL | Request, init?: RequestInit) => {
        attempt += 1;
        sentHeaders.push((init?.headers ?? {}) as Record<string, string>);
        if (attempt === 1) {
          return new Response(JSON.stringify({ revokedCount: 1 }), { status: 200 });
        }
        if (attempt === 2) {
          return new Response(
            JSON.stringify({ statusCode: 403, errorCode: "Identity.SudoRequired", message: "Sudo required" }),
            { status: 403 }
          );
        }
        if (attempt === 3) {
          return new Response(JSON.stringify({ revokedCount: 2 }), { status: 200 });
        }
        return new Response(
          JSON.stringify({ statusCode: 403, errorCode: "Identity.SudoExpired", message: "Sudo expired" }),
          { status: 403 }
        );
      })
    );

    await postCustomDomainSessionRelay("/api/auth/session/establish", {
      mode: "revoke-other-sessions",
    });
    expect(sentHeaders[0]["X-Sudo-Token"]).toBe("stored-sudo-1");

    const elevationSpy = vi
      .spyOn(useSudoStore.getState(), "requestElevation")
      .mockResolvedValueOnce("fresh-sudo-2")
      .mockRejectedValueOnce(new SudoCancelledError());

    const replayed = await postCustomDomainSessionRelay<{ revokedCount: number }>(
      "/api/auth/session/establish",
      { mode: "revoke-other-sessions" }
    );
    expect(replayed.revokedCount).toBe(2);
    expect(elevationSpy).toHaveBeenCalledWith({ forceChallenge: true });
    expect(sentHeaders[2]["X-Sudo-Token"]).toBe("fresh-sudo-2");

    await expect(
      postCustomDomainSessionRelay("/api/auth/session/establish", {
        mode: "revoke-other-sessions",
      })
    ).rejects.toSatisfy(
      (err: unknown) =>
        isSudoCancelledError(err) &&
        (err as { status?: number; details?: { errorCode?: string } }).status === 403 &&
        (err as { details?: { errorCode?: string } }).details?.errorCode === "Identity.SudoExpired"
    );
  });
});
