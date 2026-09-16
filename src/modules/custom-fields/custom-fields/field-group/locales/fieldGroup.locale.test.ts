// Field-group i18n completeness -- Wave 5 row 5.2
//
// Two things are pinned here, not one:
//
//  1. STRUCTURAL PARITY. The en and ar dictionaries must cover the same key
//     set, recursively. A screen that renders a raw key like
//     "fieldGroup.toast.reorderFailed" to an Arabic-speaking admin is a real
//     defect, and nothing else in the suite would notice it.
//
//  2. THE DELETE-CONFIRMATION PROMISE. Deleting a group UNGROUPS its member
//     fields -- the backend never blocks and never cascades. The confirmation
//     copy is the only place an admin is told that, so it is asserted as
//     CONTENT in both languages, not merely as "a non-empty string".
import { describe, it, expect } from "vitest";
import { en } from "./field-group.en";
import { ar } from "./field-group.ar";

function leafPaths(node: unknown, prefix = ""): string[] {
  if (typeof node !== "object" || node === null) return [prefix];
  return Object.entries(node as Record<string, unknown>).flatMap(([key, value]) =>
    leafPaths(value, prefix ? `${prefix}.${key}` : key)
  );
}

describe("fieldGroup locale parity", () => {
  it("covers exactly the same key set in en and ar", () => {
    expect(leafPaths(ar).sort()).toEqual(leafPaths(en).sort());
  });

  it("has no empty, untrimmed or TODO-marked strings in either language", () => {
    for (const dictionary of [en, ar]) {
      for (const path of leafPaths(dictionary)) {
        const value = path
          .split(".")
          .reduce<unknown>(
            (node, segment) => (node as Record<string, unknown>)[segment],
            dictionary
          );
        expect(typeof value, path).toBe("string");
        expect((value as string).trim().length, path).toBeGreaterThan(0);
        expect(value, path).toBe((value as string).trim());
        expect(value, path).not.toMatch(/TODO|FIXME/i);
      }
    }
  });
});

describe("fieldGroup delete confirmation copy", () => {
  it("names the group being deleted through the {name} placeholder", () => {
    expect(en.fieldGroup.deleteConfirm).toContain("{name}");
    expect(ar.fieldGroup.deleteConfirm).toContain("{name}");
  });

  it("tells an English admin the fields survive and become ungrouped", () => {
    expect(en.fieldGroup.deleteConfirm).toMatch(/not deleted/i);
    expect(en.fieldGroup.deleteConfirm).toMatch(/ungrouped/i);
  });

  it("tells an Arabic admin the same thing", () => {
    // "لن تُحذف" = "will not be deleted"; "بلا مجموعة" = "without a group".
    expect(ar.fieldGroup.deleteConfirm).toContain("لن تُحذف");
    expect(ar.fieldGroup.deleteConfirm).toContain("بلا مجموعة");
  });

  it("says the same thing again on the success toast, in both languages", () => {
    expect(en.fieldGroup.toast.deleted).toMatch(/ungrouped/i);
    expect(ar.fieldGroup.toast.deleted).toContain("بلا مجموعة");
  });
});

describe("fieldGroup reorder controls", () => {
  it("gives the two move directions distinct accessible names in both languages", () => {
    // These are the accessible names of the buttons that make reordering
    // possible without dragging (WCAG 2.2 SC 2.5.7). Identical names would
    // leave a screen-reader user unable to tell them apart.
    expect(en.fieldGroup.moveUp).not.toBe(en.fieldGroup.moveDown);
    expect(ar.fieldGroup.moveUp).not.toBe(ar.fieldGroup.moveDown);
  });

  it("promises nothing was changed when a reorder fails — the backend is all-or-nothing", () => {
    expect(en.fieldGroup.toast.reorderFailed).toMatch(/nothing was changed/i);
    expect(ar.fieldGroup.toast.reorderFailed).toContain("لم يتغيّر");
  });
});
