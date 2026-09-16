// CustomFieldListView — Value Types catalog discoverability link (Wave 5 row 5.4)
//
// /custom-fields/value-types has no sidebar nav entry of its own (that would
// need a backend nav-seed change, out of this row's frontend-only scope), so
// its only entry point is a link on this screen's own customHeaderContent.
// Reads the real source rather than fully mounting CustomFieldListView --
// same convention this file's sibling tests already use
// (CustomFieldListView.optionsVisibility.test.tsx,
// CustomFieldListView.unsetValueTypeVisibility.test.ts), because fully
// rendering this view needs the whole GenericCrudView dependency chain
// (DI container, tenant-context, permissions, react-query) for a check that
// does not need any of that machinery.
import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

describe("CustomFieldListView Value Types catalog link (real source)", () => {
  const here = dirname(fileURLToPath(import.meta.url));
  const source = readFileSync(resolve(here, "CustomFieldListView.tsx"), "utf-8");

  it("links to /custom-fields/value-types", () => {
    expect(source).toMatch(/<Link\s+href="\/custom-fields\/value-types">/);
  });

  it("labels the link via the real customField.valueTypeCatalog.browseLink i18n key, not a hardcoded string", () => {
    expect(source).toMatch(/t\("customField\.valueTypeCatalog\.browseLink"\)/);
  });

  it("renders the link inside customHeaderContent (always visible, not gated behind the error/platform-context branches)", () => {
    const headerContentIdx = source.indexOf("customHeaderContent:");
    expect(headerContentIdx).toBeGreaterThan(-1);
    const linkIdx = source.indexOf('href="/custom-fields/value-types"');
    expect(linkIdx).toBeGreaterThan(headerContentIdx);
    // Sanity bound: the link must appear before the two conditional
    // branches it sits above, not somewhere unrelated later in the file.
    const errorBranchIdx = source.indexOf("isEntityTypesError", headerContentIdx);
    expect(errorBranchIdx).toBeGreaterThan(linkIdx);
  });
});
