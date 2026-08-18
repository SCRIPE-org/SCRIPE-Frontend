// CustomFieldListView — validator picker visibility + wiring (Wave 2 Step
// 2.5 Task 10)
//
// Follows the same convention CustomFieldListView.optionsVisibility.test.ts
// and CustomFieldListView.unsetValueTypeVisibility.test.ts already use for
// this file: a hand-duplicated logic check (cheap, fast, independent of
// GenericForm/GenericCrudView rendering, which this screen's own tests
// avoid full-mounting given how many providers it pulls in), PLUS a
// real-source assertion so the hand-duplicated case can't silently drift
// from what CustomFieldListView.tsx actually does.
import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

// Byte-identical to the real guard now used on both createFields' and
// editFields' "validatorKind" entries in CustomFieldListView.tsx.
const isValidatorKindVisible = (form: Record<string, unknown>) => form.valueType === "Text";

describe("validatorKind picker visibility (hand-duplicated logic)", () => {
  it("shows only for a Text-typed definition", () => {
    expect(isValidatorKindVisible({ valueType: "Text" })).toBe(true);
  });

  it.each(["Number", "Boolean", "Date", "Select"])("hides for %s", (valueType) => {
    expect(isValidatorKindVisible({ valueType })).toBe(false);
  });

  it("hides for an unset/undefined valueType (before the admin has picked one yet)", () => {
    expect(isValidatorKindVisible({})).toBe(false);
    expect(isValidatorKindVisible({ valueType: undefined })).toBe(false);
  });
});

describe("CustomFieldListView.tsx — real source", () => {
  const here = dirname(fileURLToPath(import.meta.url));
  const source = readFileSync(resolve(here, "CustomFieldListView.tsx"), "utf-8");

  it("createFields carries a validatorKind select gated on valueType === \"Text\"", () => {
    const createFieldsIdx = source.indexOf("createFields: [");
    const editFieldsIdx = source.indexOf("editFields: [");
    expect(createFieldsIdx).toBeGreaterThan(-1);
    expect(editFieldsIdx).toBeGreaterThan(createFieldsIdx);
    const createFieldsSource = source.slice(createFieldsIdx, editFieldsIdx);

    expect(createFieldsSource).toMatch(
      /name:\s*"validatorKind"[\s\S]{0,700}?isVisible:[\s\S]{0,120}?form\.valueType\s*===\s*"Text"/
    );
  });

  it("editFields carries the matching validatorKind select", () => {
    const editFieldsIdx = source.indexOf("editFields: [");
    const editFieldsSource = source.slice(editFieldsIdx, source.indexOf("createInitialValues:"));

    expect(editFieldsSource).toMatch(
      /name:\s*"validatorKind"[\s\S]{0,400}?isVisible:[\s\S]{0,120}?form\.valueType\s*===\s*"Text"/
    );
  });

  it("the per-kind validatorParam fields are generated from the catalog (ALL_VALIDATOR_KINDS), never hand-enumerated per member", () => {
    // Would fail if a future edit replaced the data-driven .filter(...).map(...)
    // with 6 hand-copied field blocks -- the whole point of building this off
    // Task 8's catalog instead of a hardcoded per-kind list.
    expect(source).toMatch(/ALL_VALIDATOR_KINDS\.filter\([\s\S]{0,80}?hasParam\)/);
    expect(source).toMatch(/\.\.\.validatorParamFields/);
  });

  it("PostalCode's param field is sourced from supportedParamValues, not a re-typed country list", () => {
    expect(source).toMatch(/entry\.supportedParamValues/);
    expect(source).not.toMatch(/"EG",\s*"SA",\s*"US",\s*"GB",\s*"DE",\s*"FR",\s*"CA"/);
  });

  it("createInitialValues carries validatorKind/validatorParam, matching this file's own '' convention for every other optional field", () => {
    const createInitialIdx = source.indexOf("createInitialValues:");
    const editInitialIdx = source.indexOf("editInitialValues:");
    expect(createInitialIdx).toBeGreaterThan(-1);
    expect(editInitialIdx).toBeGreaterThan(createInitialIdx);

    const createInitialSource = source.slice(createInitialIdx, editInitialIdx);
    expect(createInitialSource).toMatch(/validatorKind:\s*""/);
    expect(createInitialSource).toMatch(/validatorParam:\s*""/);
  });

  // The edit half of this case used to live here as a source regex asserting
  // that `validatorKind: item.validatorKind ?? ""` appeared below
  // `editInitialValues:`. It did appear, and it passed — while the object that
  // expression ran against was a LIST ROW with no validatorKind at all, so
  // every edit silently detached the validator (fix round, finding C-1). The
  // regex could never have caught that: it checked the text, not the value.
  //
  // The builder is now its own module and is exercised for real, against real
  // entities, in customFieldEditInitialValues.test.ts (unit) and
  // __tests__/useCustomFieldViewModel.editHydration.test.tsx (the whole
  // list-row -> detail-fetch -> form -> update-payload chain). What is left
  // here is the one thing those cannot see: that this view still delegates to
  // that builder instead of quietly reintroducing an inline copy.
  it("delegates editInitialValues to the shared builder rather than inlining it", () => {
    const editInitialIdx = source.indexOf("editInitialValues:");
    const editInitialSource = source.slice(editInitialIdx, source.indexOf("getItemDisplayName:"));

    expect(editInitialSource).toMatch(/editInitialValues:\s*buildCustomFieldEditInitialValues/);
    expect(source).toMatch(
      /import\s*\{\s*buildCustomFieldEditInitialValues\s*\}\s*from\s*"\.\.\/customFieldEditInitialValues"/
    );
    // No inline `item.<field> ?? ""` reconstruction anywhere in the config.
    expect(editInitialSource).not.toMatch(/item\.validatorKind/);
  });

  // TRAP 8 (fact sheet §6): the pinning test at
  // CustomFieldListView.unsetValueTypeVisibility.test.ts asserts EXACT counts
  // of `hasPlaceholder ??` / `hasOptions ??` in this file's real source (4+2).
  // This task's new isVisible guards deliberately use a differently-named
  // predicate (`form.valueType === "Text"`, not `hasOptions`/`hasPlaceholder`)
  // specifically so they don't perturb those counts -- confirmed here rather
  // than left to be discovered by that other file's test alone.
  it("does not introduce a new hasPlaceholder/hasOptions guard (TRAP 8 counts stay 4+2)", () => {
    expect([...source.matchAll(/hasPlaceholder\s*\?\?\s*(\w+)/g)]).toHaveLength(4);
    expect([...source.matchAll(/hasOptions\s*\?\?\s*(\w+)/g)]).toHaveLength(2);
  });
});
