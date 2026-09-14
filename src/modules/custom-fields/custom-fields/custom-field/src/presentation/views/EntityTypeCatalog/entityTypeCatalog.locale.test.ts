// Entity Types registry i18n completeness -- Wave 5 row 5.5
//
// EntityTypeCatalogView renders one Status badge per
// EntityTypeScreenAgreement member, resolving its label through
// `customField.entityTypeCatalog.agreement.<member>`. That mapping is a
// Record keyed by the union, so TypeScript catches a MISSING badge entry --
// but nothing catches a missing i18n STRING, which would render as a raw key
// in the table. This file is that gate, driven off the live
// ENTITY_TYPE_SCREEN_AGREEMENTS source of truth rather than a hand-copied
// list, plus the en/ar parity check the value-types catalog already has.
import { describe, it, expect } from "vitest";
import { en } from "../../../../locales/custom-field.en";
import { ar } from "../../../../locales/custom-field.ar";
import { ENTITY_TYPE_SCREEN_AGREEMENTS } from "../../viewmodels/useEntityTypeCatalogViewModel";

const expectedAgreementKeys = [...ENTITY_TYPE_SCREEN_AGREEMENTS].sort();

const expectedColumnKeys = [
  "backendScreen",
  "entityType",
  "frontendScreen",
  "key",
  "owningModule",
  "status",
];

const expectedStatKeys = ["drift", "total", "withScreen"];

/** Any character in the Arabic Unicode block. */
const ARABIC_CHAR = /[؀-ۿ]/;

describe("customField.entityTypeCatalog i18n completeness (en)", () => {
  const catalog = en.customField.entityTypeCatalog;

  it("has exactly one Status label per EntityTypeScreenAgreement member", () => {
    expect(Object.keys(catalog.agreement).sort()).toEqual(expectedAgreementKeys);
  });

  it("has the page chrome strings (title/description/browseLink/loadFailed/empty)", () => {
    for (const value of [
      catalog.title,
      catalog.description,
      catalog.browseLink,
      catalog.loadFailed,
      catalog.empty,
    ]) {
      expect(typeof value).toBe("string");
      expect(value.length).toBeGreaterThan(0);
      expect(value).toBe(value.trim());
      expect(value).not.toMatch(/TODO|FIXME/i);
    }
  });

  it("has one label per stat figure and per table column", () => {
    expect(Object.keys(catalog.stats).sort()).toEqual(expectedStatKeys);
    expect(Object.keys(catalog.columns).sort()).toEqual(expectedColumnKeys);
  });

  it("every stat / column / agreement label is real, non-empty copy", () => {
    for (const value of [
      ...Object.values(catalog.stats),
      ...Object.values(catalog.columns),
      ...Object.values(catalog.agreement),
    ]) {
      expect(typeof value).toBe("string");
      expect((value as string).length).toBeGreaterThan(0);
    }
  });

  it("distinguishes the two 'has a screen' columns from each other", () => {
    // Both columns render Yes/No badges. If their headers read identically an
    // operator cannot tell which claim is which, which defeats the point of
    // showing both.
    expect(catalog.columns.backendScreen).not.toBe(catalog.columns.frontendScreen);
  });
});

describe("customField.entityTypeCatalog i18n completeness (ar)", () => {
  const catalog = ar.customField.entityTypeCatalog;

  it("has exactly one Status label per EntityTypeScreenAgreement member", () => {
    expect(Object.keys(catalog.agreement).sort()).toEqual(expectedAgreementKeys);
  });

  it("has one label per stat figure and per table column", () => {
    expect(Object.keys(catalog.stats).sort()).toEqual(expectedStatKeys);
    expect(Object.keys(catalog.columns).sort()).toEqual(expectedColumnKeys);
  });

  it("every user-facing string is real Arabic prose, not an English placeholder", () => {
    for (const value of [
      catalog.title,
      catalog.description,
      catalog.browseLink,
      catalog.loadFailed,
      catalog.empty,
      ...Object.values(catalog.stats),
      ...Object.values(catalog.columns),
      ...Object.values(catalog.agreement),
    ]) {
      expect(typeof value).toBe("string");
      expect((value as string).length).toBeGreaterThan(0);
      expect(value).toMatch(ARABIC_CHAR);
    }
  });

  it("distinguishes the two 'has a screen' columns from each other", () => {
    expect(catalog.columns.backendScreen).not.toBe(catalog.columns.frontendScreen);
  });
});

describe("customField.entityTypeCatalog en/ar key parity", () => {
  it("en and ar declare the exact same agreement / stats / columns keys", () => {
    const enCatalog = en.customField.entityTypeCatalog;
    const arCatalog = ar.customField.entityTypeCatalog;
    expect(Object.keys(arCatalog.agreement).sort()).toEqual(
      Object.keys(enCatalog.agreement).sort()
    );
    expect(Object.keys(arCatalog.stats).sort()).toEqual(Object.keys(enCatalog.stats).sort());
    expect(Object.keys(arCatalog.columns).sort()).toEqual(Object.keys(enCatalog.columns).sort());
  });
});
