// CustomFieldListView — edit-form Options field visibility regression test
//
// The edit form's `options` field had no isVisible guard at all (unlike the
// identical field on the create form), so editing a non-Select definition
// showed an editable Options textarea that the backend then rejected on
// submit (design doc recon finding #1). This pins the guard's condition
// directly against the two constants it depends on, independent of full
// GenericForm rendering — the fields array construction is what regressed,
// not GenericForm's isVisible mechanism itself (already covered elsewhere).
import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const SELECT_VALUE_TYPE = "Select";
const isOptionsVisible = (form: Record<string, unknown>) =>
  String(form.valueType) === SELECT_VALUE_TYPE;

describe("CustomFieldListView edit-form Options visibility", () => {
  it("shows Options only when valueType is Select", () => {
    expect(isOptionsVisible({ valueType: "Select" })).toBe(true);
  });

  it.each(["Text", "Number", "Boolean", "Date"])(
    "hides Options when valueType is %s",
    (valueType) => {
      expect(isOptionsVisible({ valueType })).toBe(false);
    }
  );
});

// The cases above hand-duplicate the predicate rather than checking the real
// file, so they'd keep passing even if the actual guard on the edit form's
// `options` field were deleted again. This one additional case reads the
// real CustomFieldListView.tsx source and asserts that guard still exists
// on the EDIT form specifically (not the create form, which has always had
// it and would mask a regression here if the check weren't scoped to
// editFields). Scoping to the slice of the source starting at "editFields: ["
// is what makes it specific to the edit form; confirmed by hand that
// deleting the real isVisible guard on the edit form's options field
// (CustomFieldListView.tsx, in the editFields array) while leaving
// everything else (including the identical create-form guard and the
// comment above this field) intact makes this assertion fail.
//
// Wave 2 Step 2.2 Task 6 update: the guard's implementation changed from a
// `String(form.valueType) === SELECT_VALUE_TYPE` string-equality check to a
// `VALUE_TYPE_CATALOG[form.valueType]?.hasOptions ?? false` catalog lookup
// (both files now share Task 1's VALUE_TYPE_CATALOG instead of each
// independently re-declaring SELECT_VALUE_TYPE). The literal identifier this
// regex looks for was updated to match -- the guard's actual EXISTENCE and
// its scoping to editFields (not createFields) is still what's pinned, and
// re-confirmed by hand that deleting the isVisible guard on the edit form's
// options field still fails this assertion after the rewrite.
// Built from parts rather than written as an escaped literal: an earlier edit emitted a real
// newline inside this string and broke the whole file's parse.
const FIELD_BLOCK_END = String.fromCharCode(10) + "        },";

describe("CustomFieldListView edit-form Options visibility (real source)", () => {
  it("has an isVisible guard referencing VALUE_TYPE_CATALOG's hasOptions on the edit form's options field", () => {
    const here = dirname(fileURLToPath(import.meta.url));
    const source = readFileSync(resolve(here, "CustomFieldListView.tsx"), "utf-8");

    const editFieldsIdx = source.indexOf("editFields: [");
    expect(editFieldsIdx).toBeGreaterThan(-1);
    const editFieldsSource = source.slice(editFieldsIdx);

    // Bounded to the options field's OWN object literal rather than a character window.
    //
    // It used to be a proximity regex allowing 900 characters between `name: "options"` and
    // `isVisible:`. That broke the moment the field gained more properties (the bilingual options
    // editor added six), reporting a guard-deleted failure when the guard was untouched at 1312
    // characters' distance. A proximity heuristic measures formatting, not the thing it means to pin.
    //
    // Slicing to the field's own literal is both stricter (a guard on a DIFFERENT field can no longer
    // satisfy it) and stable (adding properties cannot break it).
    const optionsIdx = editFieldsSource.indexOf('name: "options"');
    expect(optionsIdx).toBeGreaterThan(-1);
    // The options field's own object literal ends at the next line that closes a block at this
    // file's field-array indentation.
    const afterOptions = editFieldsSource.slice(optionsIdx);
    const blockEnd = afterOptions.indexOf(FIELD_BLOCK_END);
    expect(blockEnd).toBeGreaterThan(-1);
    const optionsFieldSource = afterOptions.slice(0, blockEnd);

    expect(optionsFieldSource).toMatch(
      /isVisible:[\s\S]{0,200}?VALUE_TYPE_CATALOG\[[\s\S]{0,100}?\]\?\.hasOptions/
    );
  });
});
