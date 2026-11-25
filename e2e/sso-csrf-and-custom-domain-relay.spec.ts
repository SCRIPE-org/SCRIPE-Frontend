import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import fs from "node:fs";
import http from "node:http";
import type { AddressInfo } from "node:net";
import path from "node:path";
import { expect, test, type APIRequestContext } from "@playwright/test";
import { getDevAdminPassword } from "./helpers/auth-credentials";

const PSQL_EXE = process.env.PSQL_PATH || "C:\\Program Files\\PostgreSQL\\18\\bin\\psql.exe";
const API_BASE = (process.env.E2E_API_URL || "http://localhost:5035").replace(/\/+$/, "");
const FE_BASE = "http://localhost:3000";
const CITY_ADMIN = "city.admin@scripe-dev.local";
const BACKEND_LOCAL_SETTINGS = path.resolve(__dirname, "../../SCRIPE-Backend/src/Host/API/appsettings.local.json");

function loadPgEnv(): Record<string, string> {
  const raw = fs.readFileSync(BACKEND_LOCAL_SETTINGS, "utf8").replace(/^\s*\/\/.*$/gm, "");
  const conn = (JSON.parse(raw) as { Database?: { ConnectionString?: string } }).Database?.ConnectionString || "";
  const kv: Record<string, string> = {};
  for (const part of conn.split(";")) {
    const idx = part.indexOf("=");
    if (idx > 0) kv[part.slice(0, idx).trim().toLowerCase()] = part.slice(idx + 1).trim();
  }
  return {
    PGHOST: kv.host || kv.server || "localhost",
    PGPORT: kv.port || "5432",
    PGDATABASE: kv.database || "SCRIPE_UAT",
    PGUSER: kv.username || kv["user id"] || "postgres",
    PGPASSWORD: kv.password || "",
  };
}

function queryPg<T>(pgEnv: Record<string, string>, sql: string): T[] {
  const wrapped = `SELECT COALESCE(json_agg(t), '[]'::json)::text FROM (${sql}) t;`;
  const out = execFileSync(PSQL_EXE, ["-X", "-t", "-A", "-v", "ON_ERROR_STOP=1", "-c", wrapped], { env: { ...process.env, ...pgEnv }, encoding: "utf8" }).trim();
  return out ? (JSON.parse(out) as T[]) : [];
}

function execPg(pgEnv: Record<string, string>, sql: string): void {
  execFileSync(PSQL_EXE, ["-X", "-v", "ON_ERROR_STOP=1", "-c", sql], {
    env: { ...process.env, ...pgEnv },
    encoding: "utf8",
  });
}

function parseCookieHeader(setCookies: string[], cookieName: string): string | null {
  for (const item of setCookies) {
    const match = item.match(new RegExp(`(?:^|\\s)${cookieName}=([^;]+)`));
    if (match) return decodeURIComponent(match[1]!);
  }
  return null;
}

function getSetCookies(res: { headersArray(): Array<{ name: string; value: string }> }): string[] {
  return res.headersArray().filter((h) => h.name.toLowerCase() === "set-cookie").map((h) => h.value);
}

async function mintLiveOAuth2HandoffTicket(
  request: APIRequestContext,
  encryptedProviderId: string,
  browserBindingHash: string
): Promise<{ handoffCode: string; handoffState: string }> {
  const startRes = await request.get(
    `${API_BASE}/api/v1/auth/oidc/start?providerId=${encodeURIComponent(encryptedProviderId)}&returnOrigin=${encodeURIComponent(FE_BASE)}&targetTenantCode=CITY&browserBindingHash=${encodeURIComponent(browserBindingHash)}`,
    { maxRedirects: 0 }
  );
  expect(startRes.status()).toBe(302);
  expect(startRes.headers()["cache-control"]).toContain("no-store");

  const startCookies = getSetCookies(startRes);
  const txNonce =
    parseCookieHeader(startCookies, "scripe_oidc_tx") ??
    parseCookieHeader(startCookies, "__Host-scripe_oidc_tx");
  expect(txNonce, `Expected scripe_oidc_tx cookie on /oidc/start (loc=${startRes.headers()["location"]})`).toBeTruthy();

  const state = new URL(startRes.headers()["location"]!).searchParams.get("state");
  expect(state).toBeTruthy();

  const cbRes = await request.get(
    `${API_BASE}/api/v1/auth/oidc/callback?code=live-e2e-oauth2-code&state=${encodeURIComponent(state!)}`,
    { maxRedirects: 0, headers: { Cookie: `scripe_oidc_tx=${encodeURIComponent(txNonce!)}` } }
  );
  expect(cbRes.status()).toBe(302);
  const redirectLoc = new URL(cbRes.headers()["location"]!);
  expect(redirectLoc.origin).toBe(FE_BASE);
  const handoffCode = redirectLoc.searchParams.get("code") || "";
  const handoffState = redirectLoc.searchParams.get("state") || "";
  expect(handoffCode.length, `cbRes loc=${cbRes.headers()["location"]}`).toBeGreaterThan(10);
  expect(handoffState.length).toBeGreaterThan(10);
  return { handoffCode, handoffState };
}

test.describe.serial("SSO Login CSRF Binding & Custom-Domain First-Party Session Relay E2E", () => {
  test.setTimeout(120_000);

  test("[SSO-RELAY-01] enforces first-party /api/auth/sso/bind and /api/auth/sso/consume-binding lifecycle", async ({
    request,
  }) => {
    const getBind = await request.get(`${FE_BASE}/api/auth/sso/bind`);
    expect(getBind.status()).toBe(405);
    expect(getBind.headers()["allow"]).toBe("POST");

    const crossSiteBind = await request.post(`${FE_BASE}/api/auth/sso/bind`, {
      headers: { Origin: "https://evil.attacker.example", "Sec-Fetch-Site": "cross-site" },
    });
    expect(crossSiteBind.status()).toBe(403);

    const bindRes = await request.post(`${FE_BASE}/api/auth/sso/bind`, {
      headers: { Origin: FE_BASE, "Sec-Fetch-Site": "same-origin" },
    });
    expect(bindRes.status()).toBe(200);
    expect(bindRes.headers()["cache-control"]).toContain("no-store");
    const { browserBindingHash } = (await bindRes.json()) as { browserBindingHash: string };
    expect(browserBindingHash).toMatch(/^[A-Za-z0-9_-]{43}$/);

    const setCookies = getSetCookies(bindRes);
    const cookieJoin = setCookies.join("; ");
    expect(cookieJoin.toLowerCase()).toContain("httponly");
    expect(cookieJoin.toLowerCase()).toContain("samesite=lax");
    expect(cookieJoin).not.toMatch(/Domain=/i);
    const rawNonce =
      parseCookieHeader(setCookies, "scripe_sso_nonce") ??
      parseCookieHeader(setCookies, "__Host-scripe_sso_nonce");
    expect(rawNonce).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(browserBindingHash).toBe(createHash("sha256").update(rawNonce!, "utf8").digest("base64url"));

    const ssoCookiePair = `__Host-scripe_sso_nonce=${rawNonce}; scripe_sso_nonce=${rawNonce}`;
    const missingFetchSite = await request.post(`${FE_BASE}/api/auth/sso/consume-binding`, {
      headers: { Origin: FE_BASE, Cookie: ssoCookiePair },
      data: { clear: false },
    });
    expect(missingFetchSite.status()).toBe(403);

    const preserveRes = await request.post(`${FE_BASE}/api/auth/sso/consume-binding`, {
      headers: { Origin: FE_BASE, "Sec-Fetch-Site": "same-origin", Cookie: ssoCookiePair },
      data: { clear: false },
    });
    expect(preserveRes.status()).toBe(200);
    expect(((await preserveRes.json()) as { browserBindingNonce: string }).browserBindingNonce).toBe(rawNonce);
    expect(getSetCookies(preserveRes).join("; ")).not.toMatch(/Max-Age=0/i);

    const clearRes = await request.post(`${FE_BASE}/api/auth/sso/consume-binding`, {
      headers: { Origin: FE_BASE, "Sec-Fetch-Site": "same-origin", Cookie: ssoCookiePair },
      data: { clear: true },
    });
    expect(clearRes.status()).toBe(200);
    expect(((await clearRes.json()) as { browserBindingNonce: string }).browserBindingNonce).toBe(rawNonce);
    expect(getSetCookies(clearRes).join("; ")).toMatch(/Max-Age=0|Expires=Thu, 01 Jan 1970/i);
  });

  test("[SSO-RELAY-02] enforces /oidc/start transaction binding and /sso/handoff MISSING_CALLER_ORIGIN & SSO_LOGIN_CSRF_MISMATCH", async ({
    request,
  }) => {
    const pgEnv = loadPgEnv();
    const providersRes = await request.get(`${API_BASE}/api/v1/auth/oidc/providers/admin`);
    expect(providersRes.status()).toBe(200);
    const providers = (await providersRes.json()) as Array<{ id: string; slug: string }>;
    const targetProvider = providers.find((p) => p.slug === "microsoft") ?? providers[0]!;

    const missingHashStart = await request.get(
      `${API_BASE}/api/v1/auth/oidc/start?providerId=${encodeURIComponent(targetProvider.id)}&returnOrigin=${encodeURIComponent(FE_BASE)}`,
      { maxRedirects: 0 }
    );
    expect(missingHashStart.status()).toBe(302);
    expect(missingHashStart.headers()["location"]).toContain("sso_csrf_failed");

    const [snap] = queryPg<Record<string, string | null>>(
      pgEnv,
      `SELECT id::text, protocol, authority, authorization_endpoint, token_endpoint, user_information_endpoint, client_id, client_secret_encrypted, redirect_uri FROM identity.identity_providers WHERE slug = '${targetProvider.slug}' LIMIT 1`
    );
    expect(snap).toBeTruthy();

    const mockIdpServer = http.createServer((req, res) => {
      if (req.url?.startsWith("/token")) {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ access_token: "e2e-mock-oauth2-access-token", token_type: "Bearer" }));
        return;
      }
      if (req.url?.startsWith("/userinfo")) {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ id: "e2e-oauth2-city-admin-sub", sub: "e2e-oauth2-city-admin-sub", oid: "e2e-oauth2-city-admin-sub", email: CITY_ADMIN, email_verified: true, xms_edov: true, name: "City Admin" }));
        return;
      }
      res.writeHead(404).end();
    });
    await new Promise<void>((resolve) => mockIdpServer.listen(0, "127.0.0.1", () => resolve()));
    const mockBase = `http://127.0.0.1:${(mockIdpServer.address() as AddressInfo).port}`;

    try {
      execPg(
        pgEnv,
        `DELETE FROM identity.external_logins WHERE provider_key = 'e2e-oauth2-city-admin-sub';
         INSERT INTO identity.external_logins (id, admin_id, provider_name, provider_key, email, display_name, identity_provider_id, linked_at, is_deleted, is_active, created_at)
         SELECT gen_random_uuid(), a.id, '${targetProvider.slug}', 'e2e-oauth2-city-admin-sub', a.email, 'City Admin', '${snap!.id}', NOW(), false, true, NOW()
         FROM identity.admins a WHERE a.email = '${CITY_ADMIN}' LIMIT 1;
         UPDATE identity.identity_providers SET protocol = 'oauth2', authorization_endpoint = '${mockBase}/authorize', token_endpoint = '${mockBase}/token', user_information_endpoint = '${mockBase}/userinfo', client_id = COALESCE(NULLIF(client_id, ''), 'e2e-client'), client_secret_encrypted = NULL, redirect_uri = '${API_BASE}/api/v1/auth/oidc/callback' WHERE id = '${snap!.id}';`
      );

      const bindRes = await request.post(`${FE_BASE}/api/auth/sso/bind`, {
        headers: { Origin: FE_BASE, "Sec-Fetch-Site": "same-origin" },
      });
      const { browserBindingHash } = (await bindRes.json()) as { browserBindingHash: string };
      const rawBrowserNonce =
        parseCookieHeader(getSetCookies(bindRes), "scripe_sso_nonce") ??
        parseCookieHeader(getSetCookies(bindRes), "__Host-scripe_sso_nonce")!;

      const ticket1 = await mintLiveOAuth2HandoffTicket(request, targetProvider.id, browserBindingHash);
      const noOriginRes = await request.post(`${API_BASE}/api/v1/auth/sso/handoff`, {
        data: { code: ticket1.handoffCode, state: ticket1.handoffState, browserBindingNonce: rawBrowserNonce },
      });
      expect(noOriginRes.status()).toBe(403);
      expect(JSON.stringify(await noOriginRes.json())).toContain("MISSING_CALLER_ORIGIN");

      const ticket2 = await mintLiveOAuth2HandoffTicket(request, targetProvider.id, browserBindingHash);
      const csrfMismatchRes = await request.post(`${API_BASE}/api/v1/auth/sso/handoff`, {
        headers: { Origin: FE_BASE },
        data: { code: ticket2.handoffCode, state: ticket2.handoffState, browserBindingNonce: "forged-wrong-nonce-value" },
      });
      expect(csrfMismatchRes.status()).toBe(403);
      expect(JSON.stringify(await csrfMismatchRes.json())).toContain("SSO_LOGIN_CSRF_MISMATCH");

      const ticket3 = await mintLiveOAuth2HandoffTicket(request, targetProvider.id, browserBindingHash);
      const validHandoffRes = await request.post(`${API_BASE}/api/v1/auth/sso/handoff`, {
        headers: { Origin: FE_BASE },
        data: { code: ticket3.handoffCode, state: ticket3.handoffState, browserBindingNonce: rawBrowserNonce },
      });
      expect(validHandoffRes.status()).toBe(200);
    } finally {
      await new Promise<void>((resolve) => mockIdpServer.close(() => resolve()));
      const sqlStr = (v: string | null) => (v === null ? "NULL" : `'${v.replace(/'/g, "''")}'`);
      execPg(
        pgEnv,
        `DELETE FROM identity.external_logins WHERE provider_key = 'e2e-oauth2-city-admin-sub';
         UPDATE identity.identity_providers SET protocol = ${sqlStr(snap!.protocol)}, authority = ${sqlStr(snap!.authority)}, authorization_endpoint = ${sqlStr(snap!.authorization_endpoint)}, token_endpoint = ${sqlStr(snap!.token_endpoint)}, user_information_endpoint = ${sqlStr(snap!.user_information_endpoint)}, client_id = ${sqlStr(snap!.client_id)}, client_secret_encrypted = ${sqlStr(snap!.client_secret_encrypted)}, redirect_uri = ${sqlStr(snap!.redirect_uri)} WHERE id = '${snap!.id}';`
      );
    }
  });

  test("[SSO-RELAY-03] establishes, refreshes, and terminates first-party custom-domain sessions via /api/auth/session/*", async ({
    request,
  }) => {
    const invalidModeRes = await request.post(`${FE_BASE}/api/auth/session/establish`, {
      headers: { Origin: FE_BASE, "Sec-Fetch-Site": "same-origin" },
      data: { mode: "invalid-mode" },
    });
    expect(invalidModeRes.status()).toBe(400);
    expect(((await invalidModeRes.json()) as { error?: string }).error).toBe("invalid_establish_mode");

    const establishRes = await request.post(`${FE_BASE}/api/auth/session/establish`, {
      headers: { Origin: FE_BASE, "Sec-Fetch-Site": "same-origin" },
      data: { mode: "admin-login", identifier: CITY_ADMIN, password: getDevAdminPassword(), isPlatformAdmin: false },
    });
    expect(establishRes.status()).toBe(200);
    const establishJson = (await establishRes.json()) as { data?: { accessToken?: string; refreshToken?: string }; accessToken?: string; refreshToken?: string };
    const unwrapped = establishJson.data ?? establishJson;
    expect(unwrapped.accessToken).toBeTruthy();
    expect(unwrapped.refreshToken).toBeUndefined();

    const setCookies = getSetCookies(establishRes);
    expect(setCookies.join("; ")).not.toMatch(/Domain=.*api\.scripe\.org/i);
    const relayCookieValue =
      parseCookieHeader(setCookies, "scripe_refresh_token") ??
      parseCookieHeader(setCookies, "__Host-scripe_refresh_token");
    expect(relayCookieValue).toBeTruthy();

    const refreshCookieHdr = `__Host-scripe_refresh_token=${encodeURIComponent(relayCookieValue!)}; scripe_refresh_token=${encodeURIComponent(relayCookieValue!)}`;
    const refreshRes = await request.post(`${FE_BASE}/api/auth/session/refresh`, {
      headers: { Origin: FE_BASE, "Sec-Fetch-Site": "same-origin", Cookie: refreshCookieHdr },
    });
    expect(refreshRes.status()).toBe(200);
    const rotatedCookie =
      parseCookieHeader(getSetCookies(refreshRes), "scripe_refresh_token") ??
      parseCookieHeader(getSetCookies(refreshRes), "__Host-scripe_refresh_token") ??
      relayCookieValue!;

    const rotatedCookieHdr = `__Host-scripe_refresh_token=${encodeURIComponent(rotatedCookie)}; scripe_refresh_token=${encodeURIComponent(rotatedCookie)}`;
    const logoutRes = await request.post(`${FE_BASE}/api/auth/session/logout`, {
      headers: { Origin: FE_BASE, "Sec-Fetch-Site": "same-origin", Cookie: rotatedCookieHdr },
      data: { logoutScope: "app" },
    });
    expect(logoutRes.status()).toBe(200);
    expect(getSetCookies(logoutRes).join("; ")).toMatch(/Max-Age=0|Expires=Thu, 01 Jan 1970/i);
  });
});
