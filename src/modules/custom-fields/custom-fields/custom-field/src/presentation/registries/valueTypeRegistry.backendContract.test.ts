/**
 * Cross-repo pin: this repo's value-type vocabulary against the real
 * `CustomFieldValueType` C# enum and `RichTextValueTypeHandler`'s length cap.
 * Wave 3.4 adversarial-review fix round, findings P1 and P2.
 *
 * WHY THIS EXISTS
 * ---------------
 * `ALL_VALUE_TYPES` is a hand-written `as const` array, and
 * `valueTypeRegistry.test.ts`'s own "orders ALL_VALUE_TYPES by the backend
 * enum's ordinals" test is a hand-transcribed literal list, not a derived
 * one -- its own comment used to say that was unavoidable because "the enum
 * lives in another repository and cannot be imported". That was false: this
 * file is the solution the repository already contains for exactly that
 * problem (see `entityScreenManifest.backendContract.test.ts` and
 * `validatorKindRegistry.backendContract.test.ts`, both older). Left
 * unaddressed, a 23rd backend member (`Signature = 22`, say) with a handler
 * and a descriptor leaves BOTH repos green while `getValueTypeCatalogEntry`
 * returns `undefined` for it and the type falls through every switch in this
 * module to a generic fallback -- the exact `[object Object]`-then-crash
 * defect this module's own completeness gates (`formatCustomFieldValue.test.tsx`,
 * `renderCustomFieldControl.test.tsx`) were written to prevent, just one step
 * further upstream than those gates can see, because they only iterate
 * `ALL_VALUE_TYPES` and cannot know it is short a member.
 *
 * `RICH_TEXT_MAX_CHARACTERS` has the same shape of gap: every consuming test
 * (`customFieldValueValidation.richText.test.ts`,
 * `RichTextCustomFieldControl.test.tsx` and friends) writes its boundary
 * assertions as `"x".repeat(RICH_TEXT_MAX_CHARACTERS)` /
 * `RICH_TEXT_MAX_CHARACTERS + 1`, which is the right way to test a boundary
 * but agrees with the constant for ANY value of it, zero included, and cannot
 * by itself prove the constant still equals the backend's
 * `RichTextValueTypeHandler.MaxRichTextLength` -- the "byte-for-byte" claim
 * this catalog's own header comment makes for it.
 *
 * BOTH DIRECTIONS of the enum comparison are checked, deliberately, matching
 * `entityScreenManifest.backendContract.test.ts`'s own reasoning: "backend has
 * a member this repo's array does not" and "this repo's array has a name the
 * backend enum does not" are different bugs (a value type nothing in this
 * catalog can format/render vs. a catalog entry for a type that no longer
 * exists), and a one-directional `.sort()`-equality check would pass for
 * either without saying which. Ordinals are checked too, not just names --
 * this enum's own doc comment states the ordinals ARE durable persisted data
 * ("the underlying int is durable data ... a member's number must never be
 * reassigned"), so a name that matches at the wrong ordinal is its own
 * distinct failure, not a rounding error.
 *
 * HONEST LIMIT — read before trusting a green run
 * -----------------------------------------------
 * These repos are separate git submodules of one superproject. In the normal
 * checkout `SCRIPE-Backend` sits beside `SCRIPE-Frontend`, and then this file
 * parses the real C# and fails on any drift. In a frontend-only checkout
 * those files do not exist, and the pin suite reports itself SKIPPED rather
 * than passing vacuously -- a cross-repo test that silently passes when the
 * other repo is missing is worse than none.
 *
 * Three things say WHICH of the two states a given run was in, so an unpinned
 * run cannot be mistaken for coverage -- verified in that order of strength,
 * the same three `entityScreenManifest.backendContract.test.ts` documents for
 * itself:
 *
 *   1. the skip COUNT, printed by every reporter including the bare default
 *      one;
 *   2. a stderr line from the always-running availability test below, naming
 *      the path it looked in;
 *   3. the pin suite's own NAME, spelling out "SKIPPED: no SCRIPE-Backend
 *      checkout" under `verbose`.
 *
 * Because a frontend-only checkout leaves the enum's ordinals and the
 * character cap UNVERIFIED against the backend, `valueTypeRegistry.test.ts`
 * separately pins `RICH_TEXT_MAX_CHARACTERS` to the plain literal `50_000` --
 * a real assertion that survives even when this file skips, the same reason
 * `formatCustomFieldValue.test.tsx` pins `ALL_VALUE_TYPES`'s length to the
 * literal `22` rather than deriving it from itself.
 *
 * The parser self-tests below exist for the other failure mode: a regex that
 * silently matched nothing, or stopped early, would otherwise make every
 * comparison trivially true.
 *
 * INITIAL STATE, recorded on purpose
 * ----------------------------------
 * At the commit that introduced this file the two sides agreed exactly: 22
 * enum members, Text=0 through RichText=21, zero drift in either direction,
 * and `RichTextValueTypeHandler.MaxRichTextLength` equal to this catalog's
 * `RICH_TEXT_MAX_CHARACTERS` at 50,000. Nothing here was loosened to reach
 * green -- the assertions are the strict equalities they look like.
 */
import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { ALL_VALUE_TYPES, RICH_TEXT_MAX_CHARACTERS } from "./valueTypeRegistry";

/** Frontend repo root — this file sits 7 directories below it. */
const FRONTEND_ROOT = path.resolve(__dirname, "../../../../../../../..");
const BACKEND_ROOT = path.resolve(FRONTEND_ROOT, "../SCRIPE-Backend");

const ENUM_FILE = path.join(
  BACKEND_ROOT,
  "src/Modules/CustomFields/CustomFields.Domain/Enums/CustomFieldValueType.cs"
);
const RICH_TEXT_HANDLER_FILE = path.join(
  BACKEND_ROOT,
  "src/Modules/CustomFields/CustomFields.Application/ValueTypes/RichTextValueTypeHandler.cs"
);

/**
 * Availability anchor. Same convention as the other two backend-contract
 * suites in this folder: probe a specific known file rather than the
 * directory, so a stray empty `SCRIPE-Backend/` folder cannot be mistaken for
 * a real checkout.
 */
const backendAvailable = fs.existsSync(ENUM_FILE);

interface BackendEnumMember {
  name: string;
  ordinal: number;
}

/**
 * Members of `public enum CustomFieldValueType { Name = N, ... }`, scoped to
 * the enum BODY (between its opening and closing brace) so the enum's own
 * doc comment -- which names every member in prose, including ordinal
 * numbers like "LongText = 5" -- cannot be mistaken for a declaration.
 */
function parseEnumMembers(source: string): BackendEnumMember[] {
  const anchor = source.indexOf("public enum CustomFieldValueType");
  if (anchor < 0) return [];
  const open = source.indexOf("{", anchor);
  const close = source.indexOf("}", open);
  if (open < 0 || close < 0) return [];
  const body = source.slice(open + 1, close);
  return [...body.matchAll(/^\s*([A-Za-z][A-Za-z0-9]*)\s*=\s*(\d+)\s*,?\s*$/gm)].map((m) => ({
    name: m[1],
    ordinal: Number(m[2]),
  }));
}

/**
 * A deliberately DIFFERENT, cruder count of the same body, so the "parsed
 * every member" self-test below is not just the same regex asked twice. Any
 * non-blank, non-comment line inside the enum body is one member, since this
 * file (verified by reading it) puts exactly one member per line with no
 * trailing same-line comments.
 */
function rawMemberLineCount(source: string): number {
  const anchor = source.indexOf("public enum CustomFieldValueType");
  if (anchor < 0) return 0;
  const open = source.indexOf("{", anchor);
  const close = source.indexOf("}", open);
  if (open < 0 || close < 0) return 0;
  return source
    .slice(open + 1, close)
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith("//")).length;
}

/**
 * `private const int MaxRichTextLength = 50_000;` -- C# digit-separator
 * underscores are stripped before parsing, since `Number("50_000")` is `NaN`.
 */
function parseMaxRichTextLength(source: string): number | null {
  const match = source.match(/MaxRichTextLength\s*=\s*([\d_]+)\s*;/);
  if (!match) return null;
  return Number(match[1].replace(/_/g, ""));
}

/**
 * Always runs, in both states — this is what makes the two states legible.
 * Mirrors `entityScreenManifest.backendContract.test.ts`'s own reasoning for
 * why this has to be a real, executing test rather than a bare `describe.skip`:
 * a fully-skipped file's console output is swallowed by vitest's default
 * reporter along with it, so only a test that actually runs gets its
 * `console.warn` attributed and printed.
 */
describe("valueTypeRegistry cross-repo pin availability", () => {
  it("reports whether the value-type enum and the rich-text cap are verified or unverified in this run", () => {
    if (!backendAvailable) {
      console.warn(
        `[valueTypeRegistry] SKIPPING the cross-repo CustomFieldValueType/MaxRichTextLength drift check: ` +
          `no SCRIPE-Backend checkout at ${BACKEND_ROOT}. ` +
          `ALL_VALUE_TYPES's ordinals and RICH_TEXT_MAX_CHARACTERS are UNVERIFIED against the backend in this run.`
      );
    }
    expect(typeof backendAvailable).toBe("boolean");
  });
});

const suiteName = backendAvailable
  ? "valueTypeRegistry pinned against the real SCRIPE-Backend CustomFieldValueType enum and RichTextValueTypeHandler"
  : "valueTypeRegistry backend pin — SKIPPED: no SCRIPE-Backend checkout beside this repo, so the enum ordinals and the rich-text cap are UNVERIFIED in this run";

const suite = backendAvailable ? describe : describe.skip;

suite(suiteName, () => {
  const enumSource = backendAvailable ? fs.readFileSync(ENUM_FILE, "utf8") : "";
  const richTextSource =
    backendAvailable && fs.existsSync(RICH_TEXT_HANDLER_FILE)
      ? fs.readFileSync(RICH_TEXT_HANDLER_FILE, "utf8")
      : "";

  const backendMembers = parseEnumMembers(enumSource);
  const backendByName = new Map<string, number>(backendMembers.map((m) => [m.name, m.ordinal]));
  // Typed as `Map<string, number>`, not `Map<CustomFieldValueTypeName, number>`:
  // this map is deliberately looked up BY the backend's own (plain-string) member
  // names in Direction 1 below, which TypeScript cannot know are real
  // `CustomFieldValueTypeName`s -- that is the exact fact under test.
  const frontendByName = new Map<string, number>(
    ALL_VALUE_TYPES.map((name, ordinal) => [name, ordinal])
  );
  const backendMaxRichTextLength = parseMaxRichTextLength(richTextSource);

  // ── Parser self-tests ──────────────────────────────────────────────
  // Without these, a regex that matched nothing (or stopped at the first
  // member) would make every comparison below compare two empty-ish or
  // truncated things and pass.
  it("found the enum file and the rich-text handler file, and parsed real content out of both", () => {
    expect(enumSource.length).toBeGreaterThan(0);
    expect(richTextSource.length).toBeGreaterThan(0);
    expect(backendMembers.length).toBeGreaterThanOrEqual(20);
  });

  it("parsed EVERY enum member, not just the ones its regex happens to fit", () => {
    // The single most important self-test here, mirroring
    // entityScreenManifest's own "parsed EVERY registry.Register call" check:
    // a member dropped silently by a too-narrow regex, if this array is also
    // missing it, would look like agreement instead of a gap.
    expect(backendMembers.length).toBe(rawMemberLineCount(enumSource));
  });

  it("found MaxRichTextLength as a real, parseable number", () => {
    expect(backendMaxRichTextLength).not.toBeNull();
    expect(Number.isNaN(backendMaxRichTextLength)).toBe(false);
  });

  it("assigned every backend ordinal exactly once, with no gaps, starting at 0", () => {
    // Not required by the enum's own contract (a future removal could leave a
    // gap since numbers must never be reused), but true today and a cheap
    // extra guard that the parse captured real, distinct integers rather than
    // e.g. matching the same line twice.
    const ordinals = backendMembers.map((m) => m.ordinal).sort((a, b) => a - b);
    expect(ordinals).toEqual(Array.from({ length: backendMembers.length }, (_, i) => i));
  });

  // ── Direction 1 ────────────────────────────────────────────────────
  it("names every backend enum member this repo's ALL_VALUE_TYPES does not carry, or carries at the wrong ordinal", () => {
    const backendHasButFrontendMissingOrWrong = backendMembers
      .filter((m) => frontendByName.get(m.name) !== m.ordinal)
      .map((m) =>
        frontendByName.has(m.name)
          ? `${m.name}  (backend ordinal ${m.ordinal}, frontend ordinal ${frontendByName.get(m.name)})`
          : `${m.name}  (backend ordinal ${m.ordinal}, missing from ALL_VALUE_TYPES)`
      );
    expect({ backendHasButFrontendMissingOrWrong }).toEqual({
      backendHasButFrontendMissingOrWrong: [],
    });
  });

  // ── Direction 2 ────────────────────────────────────────────────────
  it("names every ALL_VALUE_TYPES member the backend enum does not carry, or carries at the wrong ordinal", () => {
    const frontendHasButBackendMissingOrWrong = ALL_VALUE_TYPES.filter(
      (name, ordinal) => backendByName.get(name) !== ordinal
    ).map((name) =>
      backendByName.has(name)
        ? `${name}  (frontend ordinal ${frontendByName.get(name)}, backend ordinal ${backendByName.get(name)})`
        : `${name}  (frontend ordinal ${frontendByName.get(name)}, missing from the backend enum)`
    );
    expect({ frontendHasButBackendMissingOrWrong }).toEqual({
      frontendHasButBackendMissingOrWrong: [],
    });
  });

  // ── The full ordered equality the two directions add up to ─────────
  it("ALL_VALUE_TYPES is the backend enum's member names, in the enum's own ordinal order", () => {
    const backendNamesInOrdinalOrder = [...backendMembers]
      .sort((a, b) => a.ordinal - b.ordinal)
      .map((m) => m.name);
    expect([...ALL_VALUE_TYPES]).toEqual(backendNamesInOrdinalOrder);
  });

  // ── The rich-text cap ────────────────────────────────────────────────
  it("RICH_TEXT_MAX_CHARACTERS equals RichTextValueTypeHandler.MaxRichTextLength exactly", () => {
    expect(RICH_TEXT_MAX_CHARACTERS).toBe(backendMaxRichTextLength);
  });
});
