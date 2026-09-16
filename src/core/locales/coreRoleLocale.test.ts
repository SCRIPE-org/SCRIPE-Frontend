/**
 * Core `role` namespace i18n completeness — Tier 1 slice 7.
 *
 * WHY THIS EXISTS, AND WHY IT IS SCOPED TO ONE NAMESPACE
 * -----------------------------------------------------
 * The permissions dialog reads its copy from `role.*` in the CORE dictionaries, not from
 * the roles module's own `roles.*` bundle — the two coexist and are easy to confuse (this
 * file exists partly because slice 7's strings were first added to the wrong one, and
 * nothing caught it: `t()` returns the bare key on a miss rather than throwing, so a
 * missing string renders as `role.restrictedFieldsTruncated` to the user).
 *
 * Scoped to `role` rather than asserting parity across the whole core dictionary on
 * purpose: those files are large and pre-existing, a full-parity assertion would very
 * likely fail on unrelated drift, and a test that has to be weakened to pass teaches
 * nothing. This covers the namespace slice 7 touched, strictly.
 */
import { describe, it, expect } from "vitest";
import { en } from "./en";
import { ar } from "./ar";

// Cast through `unknown`: the core dictionaries are NOT uniformly
// Record<string, Record<string, string>> — some namespaces nest a third level
// (`imageUploader.errors`, for one) — so a direct assertion is rejected, correctly.
// This file only reads the `role` namespace, which is flat.
const enRole = (en as unknown as Record<string, Record<string, string>>).role;
const arRole = (ar as unknown as Record<string, Record<string, string>>).role;

describe("core role locale", () => {
  it("has a role namespace in both languages", () => {
    expect(enRole).toBeTypeOf("object");
    expect(arRole).toBeTypeOf("object");
  });

  it("covers exactly the same keys in en and ar", () => {
    expect(Object.keys(arRole).sort()).toEqual(Object.keys(enRole).sort());
  });

  it("has no empty or untrimmed strings", () => {
    for (const [namespace, dictionary] of [
      ["en", enRole],
      ["ar", arRole],
    ] as const) {
      for (const [key, value] of Object.entries(dictionary)) {
        expect(typeof value, `${namespace}.${key}`).toBe("string");
        expect(value.trim().length, `${namespace}.${key}`).toBeGreaterThan(0);
      }
    }
  });

  it("carries every string the permissions dialog reads for restricted fields", () => {
    // Named explicitly rather than inferred: these are the keys
    // PermissionConfigDialog resolves, and a missing one renders the raw key into the
    // UI rather than failing anything.
    for (const key of [
      "restrictedFields",
      "enterField",
      "noRestrictions",
      "restrictionHint",
      "restrictedFieldRequiredWarning",
      "restrictedFieldsRequiredConflict",
      "restrictedFieldsTruncated",
    ]) {
      expect(enRole, `en.role.${key}`).toHaveProperty(key);
      expect(arRole, `ar.role.${key}`).toHaveProperty(key);
    }
  });

  it("keeps the {fields} placeholder in the required-conflict warning, in both languages", () => {
    // The warning names WHICH fields conflict, and the save fails wholesale — so the
    // list is the actionable half. A translation that dropped the placeholder would
    // tell an admin that "these fields" are required without saying which.
    expect(enRole.restrictedFieldsRequiredConflict).toContain("{fields}");
    expect(arRole.restrictedFieldsRequiredConflict).toContain("{fields}");
  });
});
