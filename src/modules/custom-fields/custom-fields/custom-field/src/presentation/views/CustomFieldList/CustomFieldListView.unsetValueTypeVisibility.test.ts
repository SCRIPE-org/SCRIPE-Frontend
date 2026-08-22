// CustomFieldListView / InlineAddCustomFieldDialog — unset valueType
// visibility-guard parity (Wave 2 Step 2.2, Task 6)
//
// Task 6 collapsed both files' independently-hardcoded Group B constants
// (SELECT_VALUE_TYPE, NO_PLACEHOLDER_VALUE_TYPES) onto Task 1's shared
// VALUE_TYPE_CATALOG. The isVisible guards changed shape from
// Set/string-equality checks to catalog lookups:
//
//   old placeholder guard: !NO_PLACEHOLDER_VALUE_TYPES.has(String(form.valueType))
//   new placeholder guard: VALUE_TYPE_CATALOG[form.valueType]?.hasPlaceholder ?? true
//
//   old options guard:     String(form.valueType) === SELECT_VALUE_TYPE
//   new options guard:     VALUE_TYPE_CATALOG[form.valueType]?.hasOptions ?? false
//
// These two rewrites must degrade identically to the old code for a
// genuinely unset/undefined valueType -- the state both the create form
// (before entityTypeKey/valueType selection settles) and, transiently, the
// edit form are in before/while GenericForm's initial values populate.
//
// The old placeholder guard's `String(undefined)` reads the *string*
// "undefined", which is never a member of NO_PLACEHOLDER_VALUE_TYPES, so
// `.has(...)` is false and the `!` flips it to true -- SHOW the placeholder
// field for an unset value. A naive rewrite as
// `VALUE_TYPE_CATALOG[form.valueType]?.hasPlaceholder` (no `?? true`)
// silently flips this: an optional-chained lookup miss on `undefined`
// evaluates to `undefined`, which is falsy, so the guard would evaluate to
// "don't show" -- the OPPOSITE of the old behavior. This is exactly the
// off-by-behavior risk flagged in the Task 6 brief; this file pins that both
// source files actually carry the `?? true` / `?? false` fallback that
// avoids it, for every isVisible guard site.
import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";
import { VALUE_TYPE_CATALOG, type CustomFieldValueTypeName } from "../../registries/valueTypeRegistry";

// Byte-identical to the real guards now used in both CustomFieldListView.tsx
// and InlineAddCustomFieldDialog.tsx.
const isPlaceholderVisible = (form: Record<string, unknown>) =>
  VALUE_TYPE_CATALOG[form.valueType as CustomFieldValueTypeName]?.hasPlaceholder ?? true;
const isOptionsVisible = (form: Record<string, unknown>) =>
  VALUE_TYPE_CATALOG[form.valueType as CustomFieldValueTypeName]?.hasOptions ?? false;

describe("unset valueType visibility guard behavior (new catalog lookup vs old Set/string-equality)", () => {
  it("shows the placeholder fields for an unset/undefined valueType, matching the old NO_PLACEHOLDER_VALUE_TYPES.has(String(undefined)) === false behavior", () => {
    expect(isPlaceholderVisible({})).toBe(true);
    expect(isPlaceholderVisible({ valueType: undefined })).toBe(true);
  });

  it("hides the options field for an unset/undefined valueType, matching the old String(undefined) === SELECT_VALUE_TYPE === false behavior", () => {
    expect(isOptionsVisible({})).toBe(false);
    expect(isOptionsVisible({ valueType: undefined })).toBe(false);
  });

  it("also degrades the same way for a genuinely invalid/unrecognized valueType string", () => {
    expect(isPlaceholderVisible({ valueType: "NotARealType" })).toBe(true);
    expect(isOptionsVisible({ valueType: "NotARealType" })).toBe(false);
  });

  it("still matches the old per-type behavior for all 5 real value types (placeholder)", () => {
    expect(isPlaceholderVisible({ valueType: "Text" })).toBe(true);
    expect(isPlaceholderVisible({ valueType: "Number" })).toBe(true);
    expect(isPlaceholderVisible({ valueType: "Boolean" })).toBe(false);
    expect(isPlaceholderVisible({ valueType: "Date" })).toBe(false);
    expect(isPlaceholderVisible({ valueType: "Select" })).toBe(true);
  });

  it("still matches the old per-type behavior for all 5 real value types (options)", () => {
    expect(isOptionsVisible({ valueType: "Text" })).toBe(false);
    expect(isOptionsVisible({ valueType: "Number" })).toBe(false);
    expect(isOptionsVisible({ valueType: "Boolean" })).toBe(false);
    expect(isOptionsVisible({ valueType: "Date" })).toBe(false);
    expect(isOptionsVisible({ valueType: "Select" })).toBe(true);
  });
});

// The cases above hand-duplicate the predicate (same convention as
// CustomFieldListView.optionsVisibility.test.tsx), so they would not catch a
// real source file quietly dropping the `??` fallback (which would compile
// and pass those hand-duplicated cases since the duplicate itself would need
// to be edited too). These two checks read the real source of both files
// and assert every hasPlaceholder guard falls back to `?? true` and every
// hasOptions guard falls back to `?? false`.
describe("both source files carry the unset-safe `??` fallback on every isVisible guard (real source)", () => {
  const here = dirname(fileURLToPath(import.meta.url));
  const listViewSource = readFileSync(resolve(here, "CustomFieldListView.tsx"), "utf-8");
  const inlineDialogSource = readFileSync(
    resolve(
      here,
      "../../../../../custom-field-value/src/presentation/components/InlineAddCustomFieldDialog.tsx"
    ),
    "utf-8"
  );

  it("CustomFieldListView.tsx: 4 hasPlaceholder guards fall back to `?? true` (create pair + edit pair), 2 hasOptions guards fall back to `?? false` (create + edit)", () => {
    const placeholderGuards = [...listViewSource.matchAll(/hasPlaceholder\s*\?\?\s*(\w+)/g)];
    const optionsGuards = [...listViewSource.matchAll(/hasOptions\s*\?\?\s*(\w+)/g)];

    expect(placeholderGuards).toHaveLength(4);
    expect(placeholderGuards.every((m) => m[1] === "true")).toBe(true);

    expect(optionsGuards).toHaveLength(2);
    expect(optionsGuards.every((m) => m[1] === "false")).toBe(true);
  });

  it("InlineAddCustomFieldDialog.tsx: 2 hasPlaceholder guards fall back to `?? true`, 1 hasOptions guard falls back to `?? false`", () => {
    const placeholderGuards = [...inlineDialogSource.matchAll(/hasPlaceholder\s*\?\?\s*(\w+)/g)];
    const optionsGuards = [...inlineDialogSource.matchAll(/hasOptions\s*\?\?\s*(\w+)/g)];

    expect(placeholderGuards).toHaveLength(2);
    expect(placeholderGuards.every((m) => m[1] === "true")).toBe(true);

    expect(optionsGuards).toHaveLength(1);
    expect(optionsGuards.every((m) => m[1] === "false")).toBe(true);
  });
});
