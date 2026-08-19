/**
 * In-repo pin: `entityScreenManifest.ts` against the real screens it claims
 * to describe. Wave 5 row 5.5, ruling R6 deliverable (a).
 *
 * WHY THIS EXISTS
 * ---------------
 * The manifest is hand-maintained, so on its own it is just another list that
 * can go stale — exactly the failure mode it was written to fix on the
 * backend side. This file is the part that makes it self-maintaining: it
 * scans this repo's own `src/` for the two shapes that actually wire a screen
 * to custom fields, and fails NAMING the key whenever the scan and the
 * manifest disagree, in either direction.
 *
 *   - a new screen adds the wiring but nobody updates the manifest
 *       -> "missingFromManifest: [ 'foo.bar' ]"
 *   - a screen is deleted or unwired but the manifest still lists it
 *       -> "staleInManifest: [ 'foo.bar' ]"
 *
 * Same spirit as `valueTypeRegistry.test.ts` / the validator-kind pins:
 * resolve the real source, assert one entry per member, fail with the name of
 * what is missing rather than a bare count.
 *
 * SCOPE OF THE SCAN — and its honest limits
 * -----------------------------------------
 * The scan is textual, not a type-aware AST pass. Two consequences, both
 * chosen deliberately:
 *
 *   - a doc comment that spells out a NEW key in either declaration shape
 *     would be picked up as a declaration. That is fail-loud (a red test
 *     someone investigates), not fail-silent, so it is the safe direction to
 *     err in;
 *   - a screen that computes its key dynamically instead of writing a literal
 *     would be missed. No such site exists today — `useCustomFieldsFormFields`
 *     / `useCustomFieldColumns` / `saveValues` are called either with
 *     `config?.entityTypeKey` (which the CrudConfig literal already covers)
 *     or with one of the eight `*_ENTITY_TYPE_KEY` constants — and the
 *     call-site guard below fails if a ninth manual site appears that does
 *     not follow the constant convention.
 */
import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { ENTITY_TYPES_WITH_FRONTEND_SCREEN } from "./entityScreenManifest";

/** Frontend repo root — this file sits 7 directories below it. */
const FRONTEND_ROOT = path.resolve(__dirname, "../../../../../../..");
const SRC_ROOT = path.join(FRONTEND_ROOT, "src");

/** The manifest itself is the artifact under test, not a declaration site. */
const MANIFEST_FILE = path.join(__dirname, "entityScreenManifest.ts");

/**
 * `{module}.{kebab-entity}` — the shape every registered key uses. Also the
 * reason the locale directories can be skipped without risk: the admin form's
 * own placeholder copy is the string `"e.g. party.person"`, which sits under
 * an `entityTypeKey` key in `custom-field.en.ts` and is not a key at all.
 */
const KEY_SHAPE = /^[a-z][a-z0-9]*\.[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** `entityTypeKey: "x"` (CrudConfig) and `entityTypeKey="x"` (JSX prop). */
const CRUD_CONFIG_DECLARATION = /entityTypeKey\s*[:=]\s*"([^"]+)"/g;

/** `export const FOO_ENTITY_TYPE_KEY = "x"` (the hand-rolled form sections). */
const NAMED_CONSTANT_DECLARATION = /\b[A-Z][A-Z0-9_]*_ENTITY_TYPE_KEY\s*=\s*"([^"]+)"/g;

/**
 * A bare literal handed straight to one of the three custom-fields entry
 * points, e.g. `useCustomFieldsFormFields("foo.bar", ownerId)`.
 *
 * Matches ZERO sites today — all eight hand-rolled sections route through a
 * `*_ENTITY_TYPE_KEY` constant, and every generic screen passes
 * `config?.entityTypeKey`. It is here as a net rather than a style rule: a
 * ninth section that skipped the constant convention would otherwise render
 * custom fields for an entity type the manifest never learns about, which is
 * precisely the silent drift this row exists to close. Catching it as a
 * declaration makes it fail the "missingFromManifest" assertion below by
 * name, instead of forbidding a perfectly reasonable way to write the call.
 */
const INLINE_CALL_SITE_DECLARATION =
  /\b(?:useCustomFieldsFormFields|useCustomFieldColumns|saveValues)\(\s*"([^"]+)"/g;

interface Declaration {
  key: string;
  where: string;
  shape: "crud-config" | "named-constant" | "inline-call-site";
}

function collectSourceFiles(dir: string, out: string[] = []): string[] {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      // `locales` carries display copy, never wiring; `node_modules` is not ours.
      if (entry.name === "node_modules" || entry.name === "locales") continue;
      collectSourceFiles(full, out);
      continue;
    }
    if (!/\.tsx?$/.test(entry.name)) continue;
    if (/\.(test|spec|stories)\.tsx?$/.test(entry.name)) continue;
    if (full === MANIFEST_FILE) continue;
    out.push(full);
  }
  return out;
}

function scanDeclarations(): Declaration[] {
  const found: Declaration[] = [];
  for (const file of collectSourceFiles(SRC_ROOT)) {
    const lines = fs.readFileSync(file, "utf8").split(/\r?\n/);
    const relative = path.relative(FRONTEND_ROOT, file).split(path.sep).join("/");
    lines.forEach((line, index) => {
      for (const [pattern, shape] of [
        [CRUD_CONFIG_DECLARATION, "crud-config"],
        [NAMED_CONSTANT_DECLARATION, "named-constant"],
        [INLINE_CALL_SITE_DECLARATION, "inline-call-site"],
      ] as const) {
        pattern.lastIndex = 0;
        let match: RegExpExecArray | null;
        while ((match = pattern.exec(line)) !== null) {
          if (!KEY_SHAPE.test(match[1])) continue;
          found.push({ key: match[1], where: `${relative}:${index + 1}`, shape });
        }
      }
    });
  }
  return found;
}

const declarations = scanDeclarations();
const scannedKeys = [...new Set(declarations.map((d) => d.key))].sort();
// Widened to string[] deliberately: the scan produces arbitrary strings, and
// comparing them against the manifest's narrow literal union is the whole
// job — a `.includes(someScannedKey)` against the union would not typecheck.
const manifestKeys: string[] = [...ENTITY_TYPES_WITH_FRONTEND_SCREEN].sort();

/** Where each scanned key was found — quoted verbatim in failure output. */
const sitesByKey = new Map<string, string[]>();
for (const declaration of declarations) {
  const sites = sitesByKey.get(declaration.key) ?? [];
  sites.push(declaration.where);
  sitesByKey.set(declaration.key, sites);
}

describe("entityScreenManifest scanner (guards against a vacuous pass)", () => {
  it("actually walked this repo's source tree", () => {
    // A walker that resolved the wrong root, or a glob that matched nothing,
    // would make every comparison below compare two empty-ish things and
    // pass. 1000 is far under the real count and far over zero.
    expect(fs.existsSync(SRC_ROOT)).toBe(true);
    expect(collectSourceFiles(SRC_ROOT).length).toBeGreaterThan(1000);
  });

  it("found both declaration shapes, not just one", () => {
    // If either regex silently stopped matching, the other would still carry
    // most keys and the set comparison could stay green by luck.
    const crudConfig = declarations.filter((d) => d.shape === "crud-config");
    const namedConstant = declarations.filter((d) => d.shape === "named-constant");
    expect(crudConfig.length).toBeGreaterThanOrEqual(25);
    expect(namedConstant.length).toBeGreaterThanOrEqual(5);
  });

  it("did not pick up the admin form's `e.g. party.person` placeholder copy", () => {
    expect(scannedKeys).not.toContain("e.g. party.person");
    for (const key of scannedKeys) expect(key).toMatch(KEY_SHAPE);
  });
});

describe("entityScreenManifest matches the screens this repo actually wires", () => {
  it("names every wired entity type the manifest is missing", () => {
    const missingFromManifest = scannedKeys
      .filter((key) => !manifestKeys.includes(key))
      .map((key) => `${key}  (declared at ${sitesByKey.get(key)?.join(", ")})`);
    // Object-wrapped so a failure prints the label alongside the keys — the
    // whole point of this file is that the failure says WHICH key.
    expect({ missingFromManifest }).toEqual({ missingFromManifest: [] });
  });

  it("names every manifest entry no screen wires any more", () => {
    const staleInManifest = manifestKeys.filter((key) => !scannedKeys.includes(key));
    expect({ staleInManifest }).toEqual({ staleInManifest: [] });
  });

  it("has no duplicate entries", () => {
    expect(new Set(ENTITY_TYPES_WITH_FRONTEND_SCREEN).size).toBe(
      ENTITY_TYPES_WITH_FRONTEND_SCREEN.length
    );
  });

  it("stays sorted, so review diffs stay readable", () => {
    expect([...ENTITY_TYPES_WITH_FRONTEND_SCREEN]).toEqual(manifestKeys);
  });
});
