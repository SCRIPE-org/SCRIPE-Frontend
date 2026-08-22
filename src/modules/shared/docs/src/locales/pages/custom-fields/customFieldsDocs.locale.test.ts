/**
 * Custom Fields docs-portal locale test — parity and completeness.
 *
 * Three separate guarantees, and it is worth being explicit about which is
 * which, because a failure in each one means something different:
 *
 *  1. STRUCTURAL PARITY between en.ts and ar.ts. Identical leaf-key sets, no
 *     empty, untrimmed or TODO-marked values in either. An English-only key in
 *     this dictionary does not fall back to English on screen — the portal
 *     renders the raw dot path, so an Arabic reader would see
 *     "modules.customFields.docs.references.pinTitle" sitting in a heading.
 *
 *  2. COMPLETENESS AGAINST THE PAGES. Every `modules.customFields.docs.*` key
 *     the eleven registered content pages reference must resolve in BOTH
 *     languages. This is the check that catches a page section pointing at a
 *     key that was renamed, or a key spelt one way in the page and another in
 *     the dictionary — neither of which parity alone would notice, because both
 *     files can agree with each other and disagree with the pages.
 *
 *     It walks the registered page data rather than a hand-maintained list of
 *     keys, so a section added to a page is covered the moment it is added.
 *     Table cells are literal strings as often as they are keys ("Entity Type",
 *     "VALIDATION_REQUIRED"), so the walk collects only strings that actually
 *     open with this namespace and leaves the literals alone.
 *
 *  3. THE ARABIC IS ARABIC. Every value carries Arabic script, except for the
 *     handful whose value is legitimately a Latin identifier — an entity-type
 *     registry key such as hrms.staff-member is the same string in both
 *     languages and translating it would break the thing it names. Those are
 *     listed by name below rather than detected by a heuristic, so adding one
 *     is a deliberate act.
 *
 * The other language files in this directory are English-fallback stubs on
 * purpose and are deliberately not checked here.
 */

import { describe, it, expect } from "vitest";
import { en } from "./en";
import { ar } from "./ar";
import { DocsRepository } from "../../../data/repositories/DocsRepository";

// Registering the eleven Custom Fields pages, and only those: this test is
// about this section, and pulling in the whole content registry would make an
// unrelated page's failure look like a Custom Fields failure.
import "../../../data/content/modules/custom-fields/custom-fields";
import "../../../data/content/modules/custom-fields/custom-fields-value-types";
import "../../../data/content/modules/custom-fields/custom-fields-references";
import "../../../data/content/modules/custom-fields/custom-fields-reference-lookups";
import "../../../data/content/modules/custom-fields/custom-fields-defining";
import "../../../data/content/modules/custom-fields/custom-fields-field-groups";
import "../../../data/content/modules/custom-fields/custom-fields-options";
import "../../../data/content/modules/custom-fields/custom-fields-validators";
import "../../../data/content/modules/custom-fields/custom-fields-security";
import "../../../data/content/modules/custom-fields/custom-fields-managing";
import "../../../data/content/modules/custom-fields/custom-fields-limits";

/** The dot-path namespace every key on these pages lives under. */
const NS = "modules.customFields.docs";

/** The slugs registered by the imports above, in navigation order. */
const SLUGS = [
  "modules/custom-fields",
  "modules/custom-fields-value-types",
  "modules/custom-fields-references",
  "modules/custom-fields-reference-lookups",
  "modules/custom-fields-defining",
  "modules/custom-fields-field-groups",
  "modules/custom-fields-options",
  "modules/custom-fields-validators",
  "modules/custom-fields-security",
  "modules/custom-fields-managing",
  "modules/custom-fields-limits",
] as const;

/**
 * Keys whose value is the same Latin text in both languages, so the
 * Arabic-script assertion below must not apply to them.
 *
 * Two kinds, and both are deliberate rather than untranslated. The first three
 * are quoted EXAMPLE INPUTS — the literal characters somebody types into a
 * field, which have to be reproduced exactly for the surrounding row to mean
 * anything. The last three are entity-type registry keys, quoted so an
 * administrator can match what the product shows them; translating one would
 * name nothing.
 *
 * Listed by name rather than detected by a heuristic, so admitting a fourth
 * example input is a deliberate act and an accidentally-untranslated sentence
 * still fails.
 */
const LATIN_LITERAL_PATHS = new Set([
  `${NS}.valueTypes.exAboutForty`,
  `${NS}.valueTypes.exNotADate`,
  `${NS}.valueTypes.exEmailDisplayName`,
  `${NS}.references.keyStaff`,
  `${NS}.references.keyUser`,
  `${NS}.references.keyPerson`,
]);

/** Any character in the Arabic Unicode block. */
const ARABIC_CHAR = /[؀-ۿ]/;

/** Every leaf dot-path in a nested dictionary. */
function leafPaths(node: unknown, prefix = ""): string[] {
  if (typeof node !== "object" || node === null) return [prefix];
  return Object.entries(node as Record<string, unknown>).flatMap(([key, value]) =>
    leafPaths(value, prefix ? `${prefix}.${key}` : key)
  );
}

/** Resolves a dot path, returning undefined rather than throwing on a gap. */
function readPath(dictionary: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((node, segment) => {
    if (node && typeof node === "object" && segment in (node as Record<string, unknown>)) {
      return (node as Record<string, unknown>)[segment];
    }
    return undefined;
  }, dictionary);
}

/**
 * Every string anywhere inside `value` that opens with this namespace.
 *
 * A blunt recursive walk on purpose. The alternative — enumerating each section
 * type's key-bearing properties — is a second copy of the DocSection union that
 * would go stale the first time a section type gained a property, and it is
 * exactly the section nobody would remember to update.
 */
function collectKeys(value: unknown, into: Set<string>): void {
  if (typeof value === "string") {
    if (value.startsWith(`${NS}.`)) into.add(value);
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((entry) => collectKeys(entry, into));
    return;
  }
  if (value && typeof value === "object") {
    Object.values(value as Record<string, unknown>).forEach((entry) => collectKeys(entry, into));
  }
}

const repository = new DocsRepository();

/** Every namespaced key the eleven pages reference, titles and descriptions included. */
const referencedKeys: string[] = (() => {
  const keys = new Set<string>();
  for (const slug of SLUGS) {
    const page = repository.getPage(slug);
    if (!page) continue;
    keys.add(page.titleKey);
    if (page.descriptionKey) keys.add(page.descriptionKey);
    collectKeys(page.sections, keys);
  }
  return [...keys].sort();
})();

describe("custom-fields docs locale parity", () => {
  it("covers exactly the same leaf keys in en and ar", () => {
    expect(leafPaths(ar).sort()).toEqual(leafPaths(en).sort());
  });

  it("has no empty, untrimmed or TODO-marked values in either language", () => {
    for (const [name, dictionary] of [
      ["en", en],
      ["ar", ar],
    ] as const) {
      for (const path of leafPaths(dictionary)) {
        const value = readPath(dictionary, path);
        expect(typeof value, `${name}:${path}`).toBe("string");
        expect((value as string).trim().length, `${name}:${path}`).toBeGreaterThan(0);
        expect(value, `${name}:${path}`).toBe((value as string).trim());
        expect(value, `${name}:${path}`).not.toMatch(/TODO|FIXME/i);
      }
    }
  });

  it("renders real Arabic prose, not English copied across", () => {
    for (const path of leafPaths(ar)) {
      if (LATIN_LITERAL_PATHS.has(path)) continue;
      const value = readPath(ar, path) as string;
      expect(value, path).toMatch(ARABIC_CHAR);
      // A value identical to the English one is the failure mode a script
      // check alone misses on a short string that happens to contain a quoted
      // Arabic word.
      expect(value, path).not.toBe(readPath(en, path));
    }
  });
});

describe("custom-fields docs page completeness", () => {
  it("registers all eleven pages", () => {
    for (const slug of SLUGS) {
      expect(repository.getPage(slug), slug).toBeDefined();
    }
  });

  it("resolves every key the pages reference, in both languages", () => {
    expect(referencedKeys.length).toBeGreaterThan(0);
    for (const key of referencedKeys) {
      expect(typeof readPath(en, key), `en:${key}`).toBe("string");
      expect(typeof readPath(ar, key), `ar:${key}`).toBe("string");
    }
  });

  it("gives the two reference pages their own key namespaces", () => {
    // Both pages were added at once and share a subject, so the cheap mistake
    // is one of them reaching into the other's namespace — which reads fine
    // until one page is edited and the other silently changes with it.
    const referencesPage = repository.getPage("modules/custom-fields-references");
    const lookupsPage = repository.getPage("modules/custom-fields-reference-lookups");
    const referencesKeys = new Set<string>();
    const lookupsKeys = new Set<string>();
    collectKeys(referencesPage?.sections, referencesKeys);
    collectKeys(lookupsPage?.sections, lookupsKeys);

    expect(referencesKeys.size).toBeGreaterThan(0);
    expect(lookupsKeys.size).toBeGreaterThan(0);
    for (const key of referencesKeys) {
      expect(key.startsWith(`${NS}.references.`), key).toBe(true);
    }
    for (const key of lookupsKeys) {
      expect(key.startsWith(`${NS}.referenceLookups.`), key).toBe(true);
    }
  });

  it("states nineteen value types rather than seventeen wherever a count appears", () => {
    // EntityReference = 17 and UserReference = 18 brought the enum to nineteen
    // members. Every page that counted them said "seventeen" until they
    // shipped, and a stale count is the one error in this section a reader can
    // check against the product in five seconds.
    const flat = leafPaths(en).map((path) => readPath(en, path) as string);
    const stale = flat.filter((value) => /\bseventeen\b/i.test(value));
    // The one legitimate remaining use: the Value Types intro contrasting the
    // seventeen typed-value types with the two reference types.
    expect(stale).toHaveLength(1);
    expect(stale[0]).toMatch(/nineteen/i);
  });
});
