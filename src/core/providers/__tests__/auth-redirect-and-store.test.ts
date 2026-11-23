import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { useAppStore } from "@core/store/useAppStore";
import {
  buildPostAuthEntryUrl,
  extractEligibleDeepLink,
  isSafeRedirectTarget,
  getSafeRedirectPath,
} from "@modules/shared/auth/signin/src/presentation/utils/redirect-safety";

describe("redirect-safety hardening", () => {
  it("accepts clean relative in-app paths", () => {
    expect(isSafeRedirectTarget("/venue")).toBe(true);
    expect(isSafeRedirectTarget("/venue/calendar?view=week#today")).toBe(true);
    expect(getSafeRedirectPath("/crm/leads", "/overview")).toBe("/crm/leads");
  });

  it("rejects backslashes, percent-encoded backslashes, protocol-relative paths, and external origins", () => {
    expect(isSafeRedirectTarget("//evil.com")).toBe(false);
    expect(isSafeRedirectTarget("/\\evil.com")).toBe(false);
    expect(isSafeRedirectTarget("/%5cevil.com")).toBe(false);
    expect(isSafeRedirectTarget("/%5Cevil.com")).toBe(false);
    expect(isSafeRedirectTarget("/foo\\bar")).toBe(false);
    expect(isSafeRedirectTarget("https://evil.com/phish")).toBe(false);
    expect(isSafeRedirectTarget("javascript:alert(1)")).toBe(false);
    expect(getSafeRedirectPath("/%5cevil.com", "/overview")).toBe("/overview");
  });

  it("extractEligibleDeepLink & buildPostAuthEntryUrl enforce Tier 0 gates and wrap safe relative ?redirect= targets through '/'", () => {
    expect(extractEligibleDeepLink("/crm/leads?status=open")).toBe("/crm/leads?status=open");
    expect(extractEligibleDeepLink("/")).toBeNull();
    expect(extractEligibleDeepLink("/login")).toBeNull();
    expect(extractEligibleDeepLink("/change-password")).toBeNull();
    expect(extractEligibleDeepLink("/activate-workspace")).toBeNull();
    expect(extractEligibleDeepLink("/api/v1/admins")).toBeNull();

    expect(
      buildPostAuthEntryUrl({
        mustChangePassword: true,
        subscriptionStatus: "PendingPayment",
        redirect: "/crm/leads",
      })
    ).toBe("/change-password");
    expect(
      buildPostAuthEntryUrl({
        mustChangePassword: false,
        subscriptionStatus: "PendingPayment",
        redirect: "/crm/leads",
      })
    ).toBe("/activate-workspace");
    expect(
      buildPostAuthEntryUrl({
        mustChangePassword: false,
        subscriptionStatus: "Active",
        redirect: "/crm/leads?tab=open",
      })
    ).toBe(`/?redirect=${encodeURIComponent("/crm/leads?tab=open")}`);
    expect(
      buildPostAuthEntryUrl({
        mustChangePassword: false,
        subscriptionStatus: "Active",
        redirect: "https://evil.example/steal",
      })
    ).toBe("/");
  });
});

describe("useAppStore defaultRedirectPath non-persistence", () => {
  beforeEach(() => {
    localStorage.clear();
    useAppStore.getState().logout();
  });

  it("does not persist defaultRedirectPath in app-storage partialize and ignores legacy persisted values", () => {
    useAppStore.getState().setDefaultRedirectPath("/stale-route");
    const partialize = useAppStore.persist.getOptions().partialize!;
    const persistedSlice = partialize(useAppStore.getState()) as Record<string, unknown>;
    expect(persistedSlice.defaultRedirectPath).toBeUndefined();
    expect("defaultRedirectPath" in persistedSlice).toBe(false);

    const merge = useAppStore.persist.getOptions().merge!;
    useAppStore.getState().logout();
    const merged = merge(
      { defaultRedirectPath: "/legacy-route", tenantCode: "AHLY" },
      useAppStore.getState()
    );
    expect(merged.defaultRedirectPath).toBe("/");
    expect(merged.tenantCode).toBe("AHLY");
  });
});

describe("useAppStore.setAuth empty array preservation", () => {
  beforeEach(() => {
    useAppStore.getState().logout();
  });

  it("replaces previous permissions and restrictedFields with explicit empty values instead of inheriting stale state", () => {
    const initialUser = {
      id: "u-1",
      username: "admin",
      roles: [{ id: "r-1", roleCode: "ADMIN", roleName: "Admin" }],
      permissions: ["tenants.delete", "roles.manage"],
      restrictedFields: { Party: ["salary"] },
    } as any;

    useAppStore.getState().setAuth(initialUser, ["tenants.delete", "roles.manage"] as any, [], true);
    expect(useAppStore.getState().permissions).toEqual(["tenants.delete", "roles.manage"]);
    expect(useAppStore.getState().restrictedFields).toEqual({ Party: ["salary"] });

    const updatedUser = {
      id: "u-1",
      username: "admin",
      roles: [],
      permissions: [],
    } as any;

    useAppStore.getState().setAuth(updatedUser, [], [], false);
    expect(useAppStore.getState().permissions).toEqual([]);
    expect(useAppStore.getState().roles).toEqual([]);
    expect(useAppStore.getState().restrictedFields).toEqual({});
  });
});

describe("redirect-safety identity microservice origin & auth-state hint cookie Security", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("permits allow-listed OIDC/SAML resume paths on NEXT_PUBLIC_IDENTITY_API_URL origin while rejecting untrusted origins", () => {
    vi.stubEnv("NEXT_PUBLIC_API_URL", "https://api.example.com/api");
    vi.stubEnv("NEXT_PUBLIC_IDENTITY_API_URL", "https://id.example.com/identity");

    expect(isSafeRedirectTarget("https://id.example.com/connect/authorize?client_id=web")).toBe(true);
    expect(isSafeRedirectTarget("https://api.example.com/api/v1/auth/saml/sso?RelayState=x")).toBe(true);
    expect(isSafeRedirectTarget("https://id.example.com/arbitrary-open-redirect")).toBe(false);
    expect(isSafeRedirectTarget("https://evil.example.com/connect/authorize")).toBe(false);
  });

  it("writes scr_auth_state hint cookie with Secure attribute when running over HTTPS", () => {
    const cookieWrites: string[] = [];
    const cookieDesc = Object.getOwnPropertyDescriptor(Document.prototype, "cookie")!;
    vi.spyOn(document, "cookie", "set").mockImplementation((val: string) => {
      cookieWrites.push(val);
    });
    const originalProtocol = window.location.protocol;
    Object.defineProperty(window, "location", {
      configurable: true,
      value: { ...window.location, protocol: "https:" },
    });

    try {
      useAppStore.getState().beginSessionTransition();
      useAppStore.getState().logout();
    } finally {
      Object.defineProperty(window, "location", {
        configurable: true,
        value: { ...window.location, protocol: originalProtocol },
      });
      if (cookieDesc.set) {
        Object.defineProperty(document, "cookie", cookieDesc);
      }
    }

    expect(cookieWrites.some((c) => c.includes("scr_auth_state=true") && c.includes("; Secure"))).toBe(true);
    expect(cookieWrites.some((c) => c.includes("max-age=0") && c.includes("; Secure"))).toBe(true);
  });
});
