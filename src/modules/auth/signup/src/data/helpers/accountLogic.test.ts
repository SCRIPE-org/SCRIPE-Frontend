// ═══════════════════════════════════════════════════════════════════════════
// accountLogic — focused unit tests for the pure account/workspace logic (F5–F7).
//
// No React: exercises the password-strength buckets the meter renders and the
// subdomain format rule the workspace field gates "continue" on.
// ═══════════════════════════════════════════════════════════════════════════

import { describe, it, expect } from "vitest";
import { calcPasswordStrengthScore, isValidSubdomainFormat } from "./accountLogic";

describe("calcPasswordStrengthScore", () => {
  it("scores an empty password as 0", () => {
    expect(calcPasswordStrengthScore("")).toBe(0);
  });

  it("scores a short, single-class password low", () => {
    // "abc" → lowercase only, length < 8 → 1 point
    expect(calcPasswordStrengthScore("abc")).toBe(1);
  });

  it("rewards length thresholds (8 and 12)", () => {
    // 8 lowercase chars → length≥8 + lowercase = 2
    expect(calcPasswordStrengthScore("aaaaaaaa")).toBe(2);
    // 12 lowercase chars → length≥8 + length≥12 + lowercase = 3
    expect(calcPasswordStrengthScore("aaaaaaaaaaaa")).toBe(3);
  });

  it("caps at 5 for a strong mixed password", () => {
    // ≥12 chars + upper + lower + digit + symbol = 6 raw → capped at 5
    expect(calcPasswordStrengthScore("Abcdef12345!@")).toBe(5);
  });

  it("is monotonic-ish: a 12-char mixed password beats a short one", () => {
    expect(calcPasswordStrengthScore("Aa1!aaaaaaaa")).toBeGreaterThan(
      calcPasswordStrengthScore("Aa1!")
    );
  });
});

describe("isValidSubdomainFormat", () => {
  it("accepts a simple valid subdomain", () => {
    expect(isValidSubdomainFormat("acme")).toBe(true);
  });

  it("accepts internal hyphens and digits", () => {
    expect(isValidSubdomainFormat("acme-corp-2025")).toBe(true);
  });

  it("rejects too-short values", () => {
    expect(isValidSubdomainFormat("ab")).toBe(false);
  });

  it("rejects leading/trailing hyphens", () => {
    expect(isValidSubdomainFormat("-acme")).toBe(false);
    expect(isValidSubdomainFormat("acme-")).toBe(false);
  });

  it("rejects uppercase and illegal characters", () => {
    expect(isValidSubdomainFormat("Acme")).toBe(false);
    expect(isValidSubdomainFormat("acme_corp")).toBe(false);
    expect(isValidSubdomainFormat("acme.corp")).toBe(false);
  });
});
