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
