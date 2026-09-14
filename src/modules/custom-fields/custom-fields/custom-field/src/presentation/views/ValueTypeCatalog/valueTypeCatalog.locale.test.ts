// Value Types catalog i18n completeness -- Wave 5 row 5.4
//
// ValueTypeCatalogView.tsx derives each row's description key from that
// value type's OWN labelKey suffix (`entry.labelKey.split(".").pop()`)
// rather than a second hand-kept type -> key map, specifically so the
// customField.valueTypes.* and customField.valueTypeCatalog.descriptions.*
// blocks cannot silently drift apart in which 17 names they cover. This
// file is the guard that actually proves that -- both against the live
// ALL_VALUE_TYPES/VALUE_TYPE_CATALOG source of truth, and between the en
// and ar locale files themselves.
import { describe, it, expect } from "vitest";
import { en } from "../../../../locales/custom-field.en";
import { ar } from "../../../../locales/custom-field.ar";
import { ALL_VALUE_TYPES, VALUE_TYPE_CATALOG } from "../../registries/valueTypeRegistry";

const expectedLeafKeys = ALL_VALUE_TYPES.map(
  (type) => VALUE_TYPE_CATALOG[type].labelKey.split(".").pop() as string
).sort();

describe("customField.valueTypeCatalog i18n completeness (en)", () => {
  it("has exactly one description per known value type, matching the catalog's own labelKey suffixes", () => {
    const keys = Object.keys(en.customField.valueTypeCatalog.descriptions).sort();
    expect(keys).toEqual(expectedLeafKeys);
  });

  it("every description is real, non-empty prose (not a stray empty string or placeholder)", () => {
    for (const [key, value] of Object.entries(en.customField.valueTypeCatalog.descriptions)) {
      expect(typeof value).toBe("string");
      expect((value as string).length).toBeGreaterThan(10);
      // No trailing/leading whitespace and no leftover TODO markers.
      expect(value).toBe((value as string).trim());
      expect(value).not.toMatch(/TODO|FIXME/i);
      void key;
    }
  });

  it("has the page chrome strings (title/description/browseLink/stats/columns)", () => {
    const c = en.customField.valueTypeCatalog;
    expect(c.title.length).toBeGreaterThan(0);
    expect(c.description.length).toBeGreaterThan(0);
    expect(c.browseLink.length).toBeGreaterThan(0);
    expect(Object.keys(c.stats).sort()).toEqual(["total", "withOptions", "withValidator"]);
    expect(Object.keys(c.columns).sort()).toEqual([
      "description",
      "options",
      "placeholder",
      "validator",
      "valueType",
    ]);
    for (const value of [...Object.values(c.stats), ...Object.values(c.columns)]) {
      expect(typeof value).toBe("string");
      expect((value as string).length).toBeGreaterThan(0);
    }
  });
});

describe("customField.valueTypeCatalog i18n completeness (ar)", () => {
  it("has exactly one description per known value type, matching the catalog's own labelKey suffixes", () => {
    const keys = Object.keys(ar.customField.valueTypeCatalog.descriptions).sort();
    expect(keys).toEqual(expectedLeafKeys);
  });

  it("every description is real, non-empty Arabic prose", () => {
    // Any character in the Arabic Unicode block -- distinguishes genuine
    // Arabic copy from an accidental English placeholder or empty string.
    const ARABIC_CHAR = /[؀-ۿ]/;
    for (const [key, value] of Object.entries(ar.customField.valueTypeCatalog.descriptions)) {
      expect(typeof value).toBe("string");
      expect((value as string).length).toBeGreaterThan(10);
      expect(value).toMatch(ARABIC_CHAR);
      void key;
    }
  });

  it("has the page chrome strings (title/description/browseLink/stats/columns), all in Arabic", () => {
    const ARABIC_CHAR = /[؀-ۿ]/;
    const c = ar.customField.valueTypeCatalog;
    expect(c.title).toMatch(ARABIC_CHAR);
    expect(c.description).toMatch(ARABIC_CHAR);
    expect(c.browseLink).toMatch(ARABIC_CHAR);
    expect(Object.keys(c.stats).sort()).toEqual(["total", "withOptions", "withValidator"]);
    expect(Object.keys(c.columns).sort()).toEqual([
      "description",
      "options",
      "placeholder",
      "validator",
      "valueType",
    ]);
  });
});

describe("customField.valueTypeCatalog en/ar key parity", () => {
  it("en and ar declare the exact same set of description keys", () => {
    const enKeys = Object.keys(en.customField.valueTypeCatalog.descriptions).sort();
    const arKeys = Object.keys(ar.customField.valueTypeCatalog.descriptions).sort();
    expect(arKeys).toEqual(enKeys);
  });

  it("en and ar declare the exact same set of stats/columns keys", () => {
    expect(Object.keys(ar.customField.valueTypeCatalog.stats).sort()).toEqual(
      Object.keys(en.customField.valueTypeCatalog.stats).sort()
    );
    expect(Object.keys(ar.customField.valueTypeCatalog.columns).sort()).toEqual(
      Object.keys(en.customField.valueTypeCatalog.columns).sort()
    );
  });
});
