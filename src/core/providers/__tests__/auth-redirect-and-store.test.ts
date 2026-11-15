import { describe, it, expect, beforeEach } from "vitest";
import { useAppStore } from "@core/store/useAppStore";
import {
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
