import { renderHook, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { isPlatformDomain, useTenantResolution } from "../viewmodels/useTenantResolution";
import type { TenantBranding } from "../../../domain/entities/TenantBranding";

const { mockResolveTenant } = vi.hoisted(() => ({
  mockResolveTenant: vi.fn(),
}));

vi.mock("@modules/auth/di", () => ({
  getAuthContainer: () => ({
    tenantResolutionRepository: {
      resolveTenant: (...args: unknown[]) => mockResolveTenant(...args),
    },
  }),
}));

function setBrowserLocation(hostname: string, search = "") {
  Object.defineProperty(window, "location", {
    configurable: true,
    value: {
      ...window.location,
      hostname,
      search,
      origin: `http://${hostname}:3000`,
      href: `http://${hostname}:3000/login${search}`,
    },
  });
}

describe("useTenantResolution & isPlatformDomain (BAM-04, BAM-05)", () => {
  const originalLocation = window.location;

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    Object.defineProperty(window, "location", {
      configurable: true,
      value: originalLocation,
    });
  });

  it("treats bare localhost and loopback IPs as platform domain, while *.localhost is a tenant subdomain", () => {
    expect(isPlatformDomain("localhost")).toBe(true);
    expect(isPlatformDomain("127.0.0.1")).toBe(true);
    expect(isPlatformDomain("ahly.localhost")).toBe(false);
    expect(isPlatformDomain("club.admin.scripe.org")).toBe(false);
  });

  it("skips tenant lookup on bare localhost platform domain without _tenant query", async () => {
    setBrowserLocation("localhost", "");

    const { result } = renderHook(() => useTenantResolution("login"));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(mockResolveTenant).not.toHaveBeenCalled();
    expect(result.current.isTenantExpected).toBe(false);
    expect(result.current.isResolved).toBe(false);
    expect(result.current.isApiError).toBe(false);
    expect(result.current.tenantId).toBeNull();
  });

  it("resolves ahly.localhost automatically by domain without requiring ?_tenant=", async () => {
    setBrowserLocation("ahly.localhost", "");
    const branding = {
      tenantId: "enc_ahly_id",
      companyName: "Al-Ahly Sporting Club",
    } as TenantBranding;
    mockResolveTenant.mockResolvedValueOnce(branding);

    const { result } = renderHook(() => useTenantResolution("login"));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(mockResolveTenant).toHaveBeenCalledWith({
      code: null,
      domain: "ahly.localhost",
      page: "login",
    });
    expect(result.current.isTenantExpected).toBe(true);
    expect(result.current.isResolved).toBe(true);
    expect(result.current.tenantId).toBe("enc_ahly_id");
    expect(result.current.isApiError).toBe(false);
    expect(result.current.isNotFound).toBe(false);
  });

  it("continues resolving explicit ?_tenant=AHLY query on localhost", async () => {
    setBrowserLocation("localhost", "?_tenant=ahly");
    const branding = {
      tenantId: "enc_ahly_id",
      companyName: "Al-Ahly",
    } as TenantBranding;
    mockResolveTenant.mockResolvedValueOnce(branding);

    const { result } = renderHook(() => useTenantResolution("login"));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(mockResolveTenant).toHaveBeenCalledWith({
      code: "AHLY",
      domain: null,
      page: "login",
    });
    expect(result.current.isTenantExpected).toBe(true);
    expect(result.current.isResolved).toBe(true);
    expect(result.current.tenantId).toBe("enc_ahly_id");
  });

  it("fails closed on unknown *.localhost subdomain (404) without falling back to platform", async () => {
    setBrowserLocation("unknown.localhost", "");
    mockResolveTenant.mockRejectedValueOnce({ status: 404, message: "Tenant not found" });

    const { result } = renderHook(() => useTenantResolution("login"));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.isTenantExpected).toBe(true);
    expect(result.current.isResolved).toBe(false);
    expect(result.current.isApiError).toBe(true);
    expect(result.current.isNotFound).toBe(true);
    expect(result.current.tenantId).toBeNull();
    expect(result.current.branding).toBeNull();
  });

  it("fails closed when explicit ?_tenant=UNKNOWN lookup rejects", async () => {
    setBrowserLocation("localhost", "?_tenant=UNKNOWN");
    mockResolveTenant.mockRejectedValueOnce({ statusCode: 404, message: "Not found" });

    const { result } = renderHook(() => useTenantResolution("login"));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.isTenantExpected).toBe(true);
    expect(result.current.isResolved).toBe(false);
    expect(result.current.isApiError).toBe(true);
    expect(result.current.isNotFound).toBe(true);
    expect(result.current.tenantId).toBeNull();
  });
});
