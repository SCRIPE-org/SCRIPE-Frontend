import { describe, it, expect, vi, afterEach } from "vitest";
import { NextRequest } from "next/server";
import { proxy } from "../../proxy";
import { STORAGE_KEYS } from "@core/config/storage-keys";
import { buildA11yTypographyCss } from "@/modules/shared/auth/core/src/presentation/viewmodels/branding/buildA11yTypographyCss";

describe("proxy.ts per-request nonce CSP and browser security headers", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("issues unique per-request nonce CSP without unsafe-inline or strict-dynamic on production HTTPS pages", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_API_URL", "https://api.scripe.org/api");
    vi.stubEnv("NEXT_PUBLIC_IDENTITY_API_URL", "https://auth.scripe.org");

    const req1 = new NextRequest("https://ahly.admin.scripe.org/login");
    const req2 = new NextRequest("https://ahly.admin.scripe.org/login");

    const res1 = proxy(req1);
    const res2 = proxy(req2);

    expect(res1.status).toBe(200);
    const nonce1 = res1.headers.get("x-middleware-request-x-nonce");
    const nonce2 = res2.headers.get("x-middleware-request-x-nonce");

    expect(nonce1).toMatch(/^[A-Za-z0-9+/=]{20,}$/);
    expect(nonce2).toMatch(/^[A-Za-z0-9+/=]{20,}$/);
    expect(nonce1).not.toBe(nonce2);

    const csp = res1.headers.get("Content-Security-Policy") ?? "";
    expect(res1.headers.get("x-middleware-request-content-security-policy")).toBe(csp);

    const scriptSrc = csp.split("; ").find((d) => d.startsWith("script-src ")) ?? "";
    expect(scriptSrc).toContain(`'self' 'nonce-${nonce1}'`);
    expect(scriptSrc).not.toContain("'unsafe-inline'");
    expect(scriptSrc).not.toContain("'unsafe-eval'");
    expect(scriptSrc).not.toContain("'strict-dynamic'");

    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("object-src 'none'");
    expect(csp).toContain("base-uri 'self'");
    expect(csp).toContain("font-src 'self' data: https://fonts.gstatic.com");
    expect(csp).not.toContain("cdn.jsdelivr.net");
    expect(csp).toContain("form-action 'self' https://api.scripe.org https://auth.scripe.org");
    expect(csp).toContain("upgrade-insecure-requests");

    expect(res1.headers.get("Content-Security-Policy-Report-Only")).toContain(
      "require-trusted-types-for 'script'"
    );
    expect(res1.headers.get("X-Frame-Options")).toBe("DENY");
    expect(res1.headers.get("X-Content-Type-Options")).toBe("nosniff");
    expect(res1.headers.get("Cross-Origin-Opener-Policy")).toBe("same-origin-allow-popups");
    expect(res1.headers.get("Strict-Transport-Security")).toBe(
      "max-age=31536000; includeSubDomains"
    );
    expect(res1.headers.get("Cache-Control")).toContain("no-store");
  });

  it("scopes SAMEORIGIN framing and frame-ancestors 'self' strictly to studio/dashboard previews", () => {
    vi.stubEnv("NODE_ENV", "production");
    const cookieHeader = `${STORAGE_KEYS.scr_auth_state}=true`;

    for (const previewPath of ["/studio-preview?page=login", "/dashboard-preview"]) {
      const req = new NextRequest(`https://admin.scripe.org${previewPath}`, {
        headers: { cookie: cookieHeader },
      });
      const res = proxy(req);
      expect(res.status).toBe(200);
      expect(res.headers.get("X-Frame-Options")).toBe("SAMEORIGIN");
      expect(res.headers.get("Content-Security-Policy")).toContain("frame-ancestors 'self'");
    }

    const normalReq = new NextRequest("https://admin.scripe.org/overview", {
      headers: { cookie: cookieHeader },
    });
    const normalRes = proxy(normalReq);
    expect(normalRes.headers.get("X-Frame-Options")).toBe("DENY");
    expect(normalRes.headers.get("Content-Security-Policy")).toContain("frame-ancestors 'none'");
  });

  it("applies full security headers and Cache-Control: no-store to 307 auth redirects", () => {
    vi.stubEnv("NODE_ENV", "production");

    const req = new NextRequest("https://admin.scripe.org/overview");
    const res = proxy(req);

    expect(res.status).toBe(307);
    expect(res.headers.get("Content-Security-Policy")).toContain("frame-ancestors 'none'");
    expect(res.headers.get("X-Frame-Options")).toBe("DENY");
    expect(res.headers.get("Cache-Control")).toContain("no-store");
  });

  it("omits upgrade-insecure-requests on local HTTP production builds so local Playwright E2E stays intact", () => {
    vi.stubEnv("NODE_ENV", "production");

    const req = new NextRequest("http://localhost:3000/login");
    const res = proxy(req);
    const csp = res.headers.get("Content-Security-Policy") ?? "";

    expect(csp).not.toContain("upgrade-insecure-requests");
  });

  it("serves self-hosted OpenDyslexic WOFF URLs without external cdn.jsdelivr.net fetches", () => {
    const css = buildA11yTypographyCss({ "a11y.dyslexicFont": "true" }, "#2563eb").join("\n");
    expect(css).toContain("/fonts/open-dyslexic/OpenDyslexic-Regular.woff");
    expect(css).toContain("/fonts/open-dyslexic/OpenDyslexic-Bold.woff");
    expect(css).not.toContain("cdn.jsdelivr.net");
  });
});
