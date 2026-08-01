/**
 * Base-URL resolution contract guard (recovery finding F-03).
 *
 * WHY THIS EXISTS
 * ----------------
 * ApiService's constructor coerced any base URL that didn't start with "http"
 * into `https://${baseUrl}` (api.service.ts). The documented dev/monolith
 * default is the *relative* path "/api" (api-factory.ts: `NEXT_PUBLIC_API_URL
 * || "/api"`), which does not start with "http" either — so it became
 * `https:///api`, an authority-less URL.
 *
 * Empirically verified with Node's WHATWG URL parser:
 *   new URL("https:///api/v1/custom-fields")
 *     -> origin "https://api", pathname "/v1/custom-fields"
 * The browser silently targets a bogus host ("api") instead of staying on the
 * app's own origin. This surfaces as a network failure, not a clean HTTP
 * status, and only triggers when NEXT_PUBLIC_API_URL is unset — the
 * documented default path.
 */
import { describe, it, expect } from "vitest";
import { ApiService } from "../api.service";

function resolvedBaseUrl(service: ApiService): string {
  return (
    service as unknown as { axiosInstance: { defaults: { baseURL?: string } } }
  ).axiosInstance.defaults.baseURL as string;
}

describe("ApiService base URL resolution (F-03 regression)", () => {
  it("keeps a relative base path same-origin instead of an authority-less absolute URL", () => {
    const resolved = resolvedBaseUrl(new ApiService("/api"));
    expect(resolved).toBe("/api");

    // Prove the real-world network consequence with the actual URL parser: resolving
    // a request against this base must stay on the current origin.
    const requestUrl = new URL(resolved + "/v1/custom-fields", "https://admin.scripe.org");
    expect(requestUrl.origin).toBe("https://admin.scripe.org");
    expect(requestUrl.pathname).toBe("/api/v1/custom-fields");
  });

  it("never produces the authority-less triple-slash form for a relative base", () => {
    const resolved = resolvedBaseUrl(new ApiService("/api"));
    expect(resolved.startsWith("https:///")).toBe(false);
    expect(resolved.startsWith("http://")).toBe(false);
    expect(resolved.startsWith("https://")).toBe(false);
  });

  it("preserves an already-absolute http(s) base URL unchanged", () => {
    expect(resolvedBaseUrl(new ApiService("http://localhost:5000/api"))).toBe(
      "http://localhost:5000/api"
    );
    expect(resolvedBaseUrl(new ApiService("https://api.scripe.org/api"))).toBe(
      "https://api.scripe.org/api"
    );
  });

  it("coerces a bare host with no scheme and no leading slash into an https absolute URL", () => {
    expect(resolvedBaseUrl(new ApiService("api.scripe.org"))).toBe("https://api.scripe.org");
  });
});
