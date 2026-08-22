// CustomFieldListView — Entity Types registry discoverability link (Wave 5 row 5.5)
//
// /custom-fields/entity-types has no sidebar nav entry of its own (nav is
// backend-seeded, out of this row's frontend-only scope), so its only entry
// point is a link on this screen's own customHeaderContent — the same
// arrangement rows 5.4 and 5.2 already made for the value-types catalog and
// the field-groups admin. Reads the real source rather than fully mounting
// CustomFieldListView, matching this file's siblings
// (CustomFieldListView.valueTypesLink.test.ts,
// CustomFieldListView.optionsVisibility.test.tsx), because fully rendering
// this view needs the whole GenericCrudView dependency chain (DI container,
// tenant-context, permissions, react-query) for a check that needs none of it.
import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

describe("CustomFieldListView Entity Types registry link (real source)", () => {
  const here = dirname(fileURLToPath(import.meta.url));
  const source = readFileSync(resolve(here, "CustomFieldListView.tsx"), "utf-8");

  it("links to /custom-fields/entity-types", () => {
    expect(source).toMatch(/<Link\s+href="\/custom-fields\/entity-types">/);
  });

  it("labels the link via the real customField.entityTypeCatalog.browseLink i18n key, not a hardcoded string", () => {
    expect(source).toMatch(/t\("customField\.entityTypeCatalog\.browseLink"\)/);
  });

  it("renders the link inside customHeaderContent, beside the other two reference links", () => {
    const headerContentIdx = source.indexOf("customHeaderContent:");
    expect(headerContentIdx).toBeGreaterThan(-1);

    const valueTypesIdx = source.indexOf('href="/custom-fields/value-types"');
    const fieldGroupsIdx = source.indexOf('href="/custom-fields/field-groups"');
    const entityTypesIdx = source.indexOf('href="/custom-fields/entity-types"');

    // All three sit in the same always-visible link row, above the two
    // conditional branches (error / platform-context) that follow it.
    for (const idx of [valueTypesIdx, fieldGroupsIdx, entityTypesIdx]) {
      expect(idx).toBeGreaterThan(headerContentIdx);
    }
    const errorBranchIdx = source.indexOf("isEntityTypesError", headerContentIdx);
    expect(errorBranchIdx).toBeGreaterThan(entityTypesIdx);
  });
});
