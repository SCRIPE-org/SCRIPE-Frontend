/**
 * Cross-repo pin: this frontend catalog against the real C# source it mirrors.
 * Wave 2 Step 2.5 fix round, finding I-1.
 *
 * WHY THIS EXISTS
 * ---------------
 * `ValidatorKindName`, `ALL_VALIDATOR_KINDS`, `VALIDATOR_KIND_CATALOG` and
 * PostalCode's seven-country `supportedParamValues` are all hand
 * transcriptions of backend declarations. Until this file, NOTHING compared
 * them to the originals:
 *
 *   - a review pass added a 14th member to the C# `ValidatorKind` enum and
 *     only the backend's own `ValidatorKindDispatchSymmetryTests` noticed;
 *     all 2459 other backend tests and every frontend test stayed green;
 *   - `validatorKindRegistry.test.ts` hardcodes the same seven country codes
 *     the registry does, so a change to
 *     `ValidatorPresets.SupportedPostalCodeCountries` leaves both passing.
 *
 * The registry's own doc comment used to claim the frontend's offered options
 * and "the backend's actual gate can never drift apart". That was true only
 * within this repo; the comment has been corrected and this file is the part
 * that makes some of it actually true.
 *
 * HONEST LIMIT — read before trusting a green run
 * -----------------------------------------------
 * These repos are separate git submodules of one superproject. In the normal
 * checkout `SCRIPE-Backend` sits beside `SCRIPE-Frontend`, and then this file
 * parses the real C# and fails on any drift. In a frontend-only checkout
 * those files do not exist, and this suite reports itself SKIPPED rather than
 * passing vacuously — vitest prints the skip, so a run without the pin is
 * visible in the output rather than silent. It is a real guard where both
 * repos are present, and an honest no-op where only one is.
 *
 * The parser self-tests below exist for the other failure mode: a regex that
 * silently matches nothing would otherwise make every comparison trivially
 * true.
 */
import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { ALL_VALIDATOR_KINDS, VALIDATOR_KIND_CATALOG } from "./validatorKindRegistry";

/** Frontend repo root — this file sits 7 directories below it. */
const FRONTEND_ROOT = path.resolve(__dirname, "../../../../../../../..");
const BACKEND_ROOT = path.resolve(FRONTEND_ROOT, "../SCRIPE-Backend");

const ENUM_FILE = path.join(
  BACKEND_ROOT,
  "src/Modules/CustomFields/CustomFields.Domain/Enums/ValidatorKind.cs"
);
const PRESETS_FILE = path.join(
  BACKEND_ROOT,
  "src/Modules/CustomFields/CustomFields.Application/ValueTypes/ValidatorPresets.cs"
);
const POSTAL_CODES_FILE = path.join(
  BACKEND_ROOT,
  "src/Modules/CustomFields/CustomFields.Application/ValueTypes/ValidatorPresets.PostalCodes.cs"
);
const OWNERSHIP_FILE = path.join(
  BACKEND_ROOT,
  "src/Modules/CustomFields/CustomFields.Application/ValueTypes/ValidatorKindOwnership.cs"
);

const backendAvailable =
  fs.existsSync(ENUM_FILE) && fs.existsSync(PRESETS_FILE) && fs.existsSync(OWNERSHIP_FILE);

/**
 * Members of the C# `enum ValidatorKind { ... }` body, in declaration order.
 * Scoped to the enum body so the doc comment above it (which names every
 * member in `<see cref="..."/>` tags) cannot be mistaken for declarations.
 */
function parseEnumMembers(source: string): string[] {
  const bodyStart = source.indexOf("public enum ValidatorKind");
  if (bodyStart < 0) return [];
  const open = source.indexOf("{", bodyStart);
  const close = source.indexOf("}", open);
  if (open < 0 || close < 0) return [];
  const body = source.slice(open + 1, close);
  return [...body.matchAll(/^\s*([A-Za-z][A-Za-z0-9]*)\s*=\s*\d+\s*,/gm)].map((m) => m[1]);
}

/** The string literals of `SupportedPostalCodeCountries = [...]`. */
function parseSupportedCountries(source: string): string[] {
  const anchor = source.indexOf("SupportedPostalCodeCountries =");
  if (anchor < 0) return [];
  const open = source.indexOf("[", anchor);
  const close = source.indexOf("]", open);
  if (open < 0 || close < 0) return [];
  return [...source.slice(open + 1, close).matchAll(/"([A-Z]{2})"/g)].map((m) => m[1]);
}

/** The members of `ValidatorKindOwnership.ParameterizedKinds`. */
function parseParameterizedKinds(source: string): string[] {
  const anchor = source.indexOf("ParameterizedKinds =");
  if (anchor < 0) return [];
  const open = source.indexOf("[", anchor);
  const close = source.indexOf("]", open);
  if (open < 0 || close < 0) return [];
  return [...source.slice(open + 1, close).matchAll(/ValidatorKind\.([A-Za-z][A-Za-z0-9]*)/g)].map(
    (m) => m[1]
  );
}

const suite = backendAvailable ? describe : describe.skip;

suite("validatorKindRegistry pinned against the real SCRIPE-Backend source", () => {
  const enumSource = backendAvailable ? fs.readFileSync(ENUM_FILE, "utf8") : "";
  const presetsSource = backendAvailable
    ? fs.readFileSync(PRESETS_FILE, "utf8") +
      (fs.existsSync(POSTAL_CODES_FILE) ? fs.readFileSync(POSTAL_CODES_FILE, "utf8") : "")
    : "";
  const ownershipSource = backendAvailable ? fs.readFileSync(OWNERSHIP_FILE, "utf8") : "";

  const enumMembers = parseEnumMembers(enumSource);
  const supportedCountries = parseSupportedCountries(presetsSource);
  const parameterizedKinds = parseParameterizedKinds(ownershipSource);

  // Parser self-tests. Without these, a regex that matched nothing would make
  // every comparison below compare two empty-ish things and pass.
  it("the parsers actually found something (guards against a vacuous pass)", () => {
    expect(enumMembers.length).toBeGreaterThanOrEqual(13);
    expect(supportedCountries.length).toBeGreaterThanOrEqual(1);
    expect(parameterizedKinds.length).toBeGreaterThanOrEqual(1);
  });

  it("ALL_VALIDATOR_KINDS matches the C# enum member names, in the enum's own order", () => {
    expect([...ALL_VALIDATOR_KINDS]).toEqual(enumMembers);
  });

  it("VALIDATOR_KIND_CATALOG has exactly one entry per C# enum member — no extras, none missing", () => {
    expect(Object.keys(VALIDATOR_KIND_CATALOG).sort()).toEqual([...enumMembers].sort());
  });

  it("the catalog's hasParam split matches ValidatorKindOwnership.ParameterizedKinds exactly", () => {
    const catalogParameterized = ALL_VALIDATOR_KINDS.filter(
      (kind) => VALIDATOR_KIND_CATALOG[kind].hasParam
    );
    expect([...catalogParameterized].sort()).toEqual([...parameterizedKinds].sort());
  });

  it("PostalCode's offered countries match ValidatorPresets.SupportedPostalCodeCountries exactly, in order", () => {
    expect([...(VALIDATOR_KIND_CATALOG.PostalCode.supportedParamValues ?? [])]).toEqual(
      supportedCountries
    );
  });

  it("does not offer AE — the backend rejects it by name (R9 correction)", () => {
    expect(supportedCountries).not.toContain("AE");
    expect(VALIDATOR_KIND_CATALOG.PostalCode.supportedParamValues).not.toContain("AE");
  });
});
