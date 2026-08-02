import { renderHook } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import usePermission, { usePermissions } from "../use-permission";

// Mock the app store the hook reads permissions/user from. Follows the
// selector-mock pattern used in route-guard.test.tsx: useAppStore is a
// callable that applies the given selector to a mutable mock state object,
// so each test can just mutate mockAppState before rendering the hook.
const { mockUseAppStore, mockAppState } = vi.hoisted(() => {
  const mockAppState = {
    permissions: [] as string[],
    user: null as { id: string } | null,
  };

  const mockUseAppStore = Object.assign(
    (selector: (state: typeof mockAppState) => unknown) => selector(mockAppState),
    {
      getState: () => mockAppState,
    }
  );

  return { mockUseAppStore, mockAppState };
});

vi.mock("@core/store/useAppStore", () => ({
  useAppStore: mockUseAppStore,
}));

describe("usePermission — deny-by-default", () => {
  beforeEach(() => {
    mockAppState.permissions = [];
    mockAppState.user = null;
  });

  it("denies an unknown/unrecognized permission key when the user has no matching permission", () => {
    mockAppState.permissions = ["admins.view", "roles.view"];

    const { result } = renderHook(() => usePermission("some.totally.unknown.permission"));

    expect(result.current).toBe(false);
  });

  it("denies an unknown permission key even when the user has zero permissions", () => {
    mockAppState.permissions = [];

    const { result } = renderHook(() => usePermission("reports.export"));

    expect(result.current).toBe(false);
  });

  it("does not throw for an unrecognized permission key", () => {
    mockAppState.permissions = ["admins.view"];

    expect(() => renderHook(() => usePermission("not.a.real.permission"))).not.toThrow();
  });

  it("allows when no permission is required (undefined)", () => {
    mockAppState.permissions = [];

    const { result } = renderHook(() => usePermission(undefined));

    expect(result.current).toBe(true);
  });

  it("grants access when the user holds the exact permission", () => {
    mockAppState.permissions = ["admins.view"];

    const { result } = renderHook(() => usePermission("admins.view"));

    expect(result.current).toBe(true);
  });
});

describe("usePermissions().has — deny-by-default", () => {
  beforeEach(() => {
    mockAppState.permissions = [];
    mockAppState.user = null;
  });

  it("returns false for an unrecognized permission key rather than throwing or defaulting to true", () => {
    mockAppState.permissions = ["admins.view", "roles.view"];

    const { result } = renderHook(() => usePermissions());

    expect(() => result.current.has("completely.unknown.key")).not.toThrow();
    expect(result.current.has("completely.unknown.key")).toBe(false);
  });

  it("does not grant an unrecognized key via a wildcard unless the user actually holds one", () => {
    mockAppState.permissions = ["admins.view"];

    const { result } = renderHook(() => usePermissions());

    expect(result.current.has("billing.refund")).toBe(false);
  });

  it("grants access when the user holds the superadmin wildcard", () => {
    mockAppState.permissions = ["*"];

    const { result } = renderHook(() => usePermissions());

    expect(result.current.has("anything.at.all")).toBe(true);
  });
});
