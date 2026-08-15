// CustomFieldListView / InlineAddCustomFieldDialog — value-type list parity guard
//
// Both files hardcode the same 5-entry value-type option list and the same
// two constants (SELECT_VALUE_TYPE, NO_PLACEHOLDER_VALUE_TYPES), each with a
// comment stating they're "kept in sync deliberately rather than imported"
// (design doc recon finding #4). That's a real, currently-unenforced risk:
// nothing stops the two files from drifting. A single source of truth is
// Wave 2 scope (the IValueTypeHandler registry) -- this test is the Wave 0
// stopgap: it fails the moment the two option lists or constants disagree,
// rather than letting a drift ship silently.
import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const here = dirname(fileURLToPath(import.meta.url));
const listViewSource = readFileSync(resolve(here, "CustomFieldListView.tsx"), "utf-8");
const inlineDialogSource = readFileSync(
  resolve(
    here,
    "../../../../custom-field-value/src/presentation/components/InlineAddCustomFieldDialog.tsx"
  ),
  "utf-8"
);

function extractValueTypeValues(source: string): string[] {
  // Matches `{ value: "Text", label: ... }`-shaped entries inside a
  // valueType options array -- both files use this exact literal shape.
  const matches = [...source.matchAll(/\{\s*value:\s*"([A-Za-z]+)",\s*label:\s*t\("customField\.valueTypes\./g)];
  return matches.map((m) => m[1]);
}

describe("CustomField value-type list parity (List view vs Inline dialog)", () => {
  it("both files declare the exact same value-type options, in the same order", () => {
    const listViewValues = extractValueTypeValues(listViewSource);
    const inlineDialogValues = extractValueTypeValues(inlineDialogSource);

    expect(listViewValues).toEqual(["Text", "Number", "Boolean", "Date", "Select"]);
    expect(inlineDialogValues).toEqual(listViewValues);
  });

  it("both files declare the same SELECT_VALUE_TYPE constant", () => {
    expect(listViewSource).toMatch(/const SELECT_VALUE_TYPE = "Select"/);
    expect(inlineDialogSource).toMatch(/const SELECT_VALUE_TYPE = "Select"/);
  });

  it("both files declare the same NO_PLACEHOLDER_VALUE_TYPES constant", () => {
    expect(listViewSource).toMatch(/NO_PLACEHOLDER_VALUE_TYPES = new Set\(\["Boolean", "Date"\]\)/);
    expect(inlineDialogSource).toMatch(/NO_PLACEHOLDER_VALUE_TYPES = new Set\(\["Boolean", "Date"\]\)/);
  });
});
