/**
 * Field-level security, client side — Tier 1 slice 5.
 *
 * This hook is the client half of a control whose server half is enforced in three
 * places, so the property that actually matters here is AGREEMENT with the server,
 * not the filtering itself:
 *
 *  - the server compares restricted names with `OrdinalIgnoreCase` on all three of
 *    its surfaces, and the names are typed by hand into a free-text tag input, so a
 *    case-SENSITIVE client filter renders a column the server has already stopped
 *    filling. Nulled cells read as missing data, not as security;
 *  - the map's keys are lowercased server-side when token data is built, so an
 *    exact-match lookup on a screen's `resource` string works today only because
 *    every one of those strings happens to be lowercase.
 *
 * Both are asserted below rather than left to luck.
 */
import { describe, it, expect, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useAppStore } from "@core/store/useAppStore";
import { useRestrictedFields, useIsFieldRestricted } from "./use-restricted-fields";

function setRestrictions(restrictedFields: Record<string, string[]>) {
  useAppStore.setState({ restrictedFields });
}

describe("useRestrictedFields", () => {
  beforeEach(() => setRestrictions({}));

  it("returns the resource's configured names verbatim", () => {
    setRestrictions({ admins: ["email", "phoneNumber"] });

    const { result } = renderHook(() => useRestrictedFields("admins"));

    expect(result.current).toEqual(["email", "phoneNumber"]);
  });

  it("looks the resource up case-insensitively, because the map's keys are lowercased server-side", () => {
    setRestrictions({ admins: ["email"] });

    const { result } = renderHook(() => useRestrictedFields("Admins"));

    // Without the lowercase on the lookup key, a screen declaring `resource:
    // "Admins"` would find nothing and its filter would be silently inert —
    // the failure mode that looks exactly like "no restrictions configured".
    expect(result.current).toEqual(["email"]);
  });

  it("returns a stable empty array for no resource and for an unrestricted resource", () => {
    setRestrictions({ admins: ["email"] });

    const noResource = renderHook(() => useRestrictedFields(undefined));
    const otherResource = renderHook(() => useRestrictedFields("party-people"));

    expect(noResource.result.current).toEqual([]);
    expect(otherResource.result.current).toEqual([]);
    // Same reference: a fresh [] per render would invalidate every consumer's
    // useMemo on every render.
    expect(noResource.result.current).toBe(otherResource.result.current);
  });
});

describe("useIsFieldRestricted", () => {
  beforeEach(() => setRestrictions({}));

  it("reports a restricted field as restricted", () => {
    setRestrictions({ admins: ["email"] });

    const { result } = renderHook(() => useIsFieldRestricted("admins"));

    expect(result.current("email")).toBe(true);
    expect(result.current("firstName")).toBe(false);
  });

  it("matches case-insensitively in both directions, so the client agrees with the server", () => {
    // An admin types "Salary" into the tag input. The server restricts the value
    // (OrdinalIgnoreCase). A case-sensitive client filter would keep drawing the
    // column and show blanks.
    setRestrictions({ employees: ["Salary"] });

    const { result } = renderHook(() => useIsFieldRestricted("employees"));

    expect(result.current("salary")).toBe(true);
    expect(result.current("SALARY")).toBe(true);
    expect(result.current("sAlArY")).toBe(true);
  });

  it("does not leak one resource's restrictions into another", () => {
    setRestrictions({ admins: ["salary"], employees: ["nationalId"] });

    const { result } = renderHook(() => useIsFieldRestricted("employees"));

    expect(result.current("nationalId")).toBe(true);
    expect(result.current("salary")).toBe(false);
  });

  it("treats a non-string key as unrestricted rather than throwing", () => {
    // A table Column's key is typed `keyof T`, which widens to
    // string | number | symbol. A numeric or symbol key is not a restricted
    // field name, and must not crash the predicate.
    setRestrictions({ admins: ["email"] });

    const { result } = renderHook(() => useIsFieldRestricted("admins"));

    expect(result.current(42)).toBe(false);
    expect(result.current(Symbol("x"))).toBe(false);
    expect(result.current(undefined)).toBe(false);
  });

  it("is a stable predicate when nothing is restricted", () => {
    const first = renderHook(() => useIsFieldRestricted("admins"));
    const second = renderHook(() => useIsFieldRestricted("party-people"));

    expect(first.result.current("anything")).toBe(false);
    // Shared no-op identity, so a consumer memoising over this predicate is not
    // invalidated on every render of every unrestricted screen.
    expect(first.result.current).toBe(second.result.current);
  });
});
