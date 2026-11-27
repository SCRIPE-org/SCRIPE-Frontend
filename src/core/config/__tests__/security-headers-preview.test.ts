import { afterEach, describe, expect, it, vi } from "vitest";
import { buildPageCsp } from "../security-headers";

function getDirective(csp: string, name: string): string {
  return (
    csp
      .split(";")
      .map((part) => part.trim())
      .find((part) => part.startsWith(`${name} `)) ?? ""
  );
}

describe("security-headers Vercel preview toolbar CSP (VERCEL-PREVIEW-CSP-01)", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("allows https://vercel.live only when VERCEL_ENV=preview while keeping nonce strict", () => {
    vi.stubEnv("VERCEL_ENV", "preview");
    const csp = buildPageCsp({
      nonce: "test-nonce-123",
      isDev: false,
      allowSelfFraming: false,
      isHttps: true,
    });

    const scriptSrc = getDirective(csp, "script-src");
    const connectSrc = getDirective(csp, "connect-src");
    const frameSrc = getDirective(csp, "frame-src");

    expect(scriptSrc).toContain("'nonce-test-nonce-123'");
    expect(scriptSrc).toContain("https://vercel.live");
    expect(scriptSrc).not.toContain("'unsafe-inline'");
    expect(connectSrc).toContain("https://vercel.live");
    expect(connectSrc).toContain("wss://ws-us3.pusher.com");
    expect(frameSrc).toContain("https://vercel.live");
  });

  it("excludes vercel.live and pusher from script-src, connect-src, and frame-src in production and when unset", () => {
    for (const envVal of ["production", ""]) {
      if (envVal) {
        vi.stubEnv("VERCEL_ENV", envVal);
      } else {
        vi.unstubAllEnvs();
        delete process.env.VERCEL_ENV;
      }

      const csp = buildPageCsp({
        nonce: "prod-nonce-456",
        isDev: false,
        allowSelfFraming: false,
        isHttps: true,
      });

      const scriptSrc = getDirective(csp, "script-src");
      const connectSrc = getDirective(csp, "connect-src");
      const frameSrc = getDirective(csp, "frame-src");

      expect(scriptSrc).toContain("'nonce-prod-nonce-456'");
      expect(scriptSrc).not.toContain("vercel.live");
      expect(scriptSrc).not.toContain("'unsafe-inline'");
      expect(connectSrc).not.toContain("vercel.live");
      expect(connectSrc).not.toContain("pusher.com");
      expect(frameSrc).not.toContain("vercel.live");
    }
  });
});
