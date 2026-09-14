/**
 * Cross-repo pin: this repo's entity-screen manifest against the real
 * `hasFrontendScreen` literals in the C# entity-type catalogs.
 * Wave 5 row 5.5, ruling R6 deliverable (b).
 *
 * WHY THIS EXISTS
 * ---------------
 * `hasFrontendScreen` is a hand-typed boolean at each backend registration
 * site — an assertion the BACKEND makes about the FRONTEND. Nothing verified
 * it: the backend cannot see this repo's screens, and until
 * `entityScreenManifest.ts` this repo had no machine-readable statement of
 * which screens exist. So the flag could go stale in either direction the day
 * a screen shipped or was deleted, and the only symptom would be a Custom
 * Fields admin either warned about a screen that exists or NOT warned about
 * a definition that renders nowhere.
 *
 * BOTH DIRECTIONS ARE CHECKED, deliberately. A one-directional check reads as
 * complete and is not: "backend says screen, frontend has none" (an admin
 * defines a field that silently renders nowhere) and "frontend has a screen,
 * backend says none" (an admin is warned off an entity type that works fine,
 * and it is sorted into the API-only group in the picker) are different bugs
 * with different victims. A third check covers the case the flag cannot
 * express at all: a frontend screen wired to a key the registry does not
 * carry, whose values API calls would 400 on an unregistered entity type.
 *
 * HONEST LIMIT — read before trusting a green run
 * -----------------------------------------------
 * These repos are separate git submodules of one superproject. In the normal
 * checkout `SCRIPE-Backend` sits beside `SCRIPE-Frontend`, and then this file
 * parses the real C# and fails on any drift. In a frontend-only checkout
 * those files do not exist, and the pin suite reports itself SKIPPED rather
 * than passing vacuously.
 *
 * Three things say WHICH of the two states a given run was in, so an unpinned
 * run cannot be mistaken for coverage — verified in that order of strength:
 *
 *   1. the skip COUNT. Pinned: "9 passed". Unpinned: "1 passed | 8 skipped".
 *      This repo's suite has no other skipped test, so any nonzero skip count
 *      is the signal, and it survives every reporter including the bare
 *      default one;
 *   2. a stderr line from the always-running availability test below, naming
 *      the path it looked in. Printed by the `dot` and `verbose` reporters;
 *      vitest 4's `default` reporter collapses console output on a passing
 *      file, which is why the count above is the primary signal and not this;
 *   3. the pin suite's own NAME, which spells out "SKIPPED: no SCRIPE-Backend
 *      checkout" next to each skipped case under `verbose`.
 *
 * That is the one improvement on `validatorKindRegistry.backendContract.test.ts`,
 * whose shape this file otherwise reuses wholesale.
 *
 * The parser self-tests below exist for the other failure mode: a regex that
 * silently matched nothing, or that skipped the registrations written in a
 * shape it does not recognise, would otherwise make every comparison
 * trivially true.
 *
 * INITIAL STATE, recorded on purpose
 * ----------------------------------
 * At the commit that introduced this file the two sides agreed exactly: 55
 * registrations, 33 flagged `hasFrontendScreen: true`, 33 keys in the
 * manifest, zero drift in all three directions. Nothing here was loosened to
 * reach green — the assertions are the strict set equalities they look like.
 * That is a finding, not an assumption: it means the backend's hand-typed
 * literals happened to be accurate on the day they were pinned, and from now
 * on they stay accurate or this file goes red.
 */
import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { ENTITY_TYPES_WITH_FRONTEND_SCREEN } from "./entityScreenManifest";

/** Frontend repo root — this file sits 7 directories below it. */
const FRONTEND_ROOT = path.resolve(__dirname, "../../../../../../../..");
const BACKEND_ROOT = path.resolve(FRONTEND_ROOT, "../SCRIPE-Backend");

/**
 * Availability anchor. Same convention as the validator-kind pin: probe a
 * specific known file rather than the directory, so a stray empty
 * `SCRIPE-Backend/` folder cannot be mistaken for a real checkout.
 */
const CORE_CATALOG = path.join(BACKEND_ROOT, "src/Core/Core.Application/CoreEntityTypeCatalog.cs");

const backendAvailable = fs.existsSync(CORE_CATALOG);

/** Directories with no catalogs in them and a lot of files. */
const SKIP_DIRS = new Set(["bin", "obj", "Migrations", ".git", "node_modules"]);

function collectCatalogFiles(dir: string, out: string[] = []): string[] {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue;
      collectCatalogFiles(path.join(dir, entry.name), out);
      continue;
    }
    if (entry.name.endsWith("EntityTypeCatalog.cs")) out.push(path.join(dir, entry.name));
  }
  return out;
}

interface BackendRegistration {
  key: string;
  owningModule: string;
  hasFrontendScreen: boolean;
  where: string;
}

/**
 * `registry.Register("key", "Module", "En", "Ar", "resource"[, hasFrontendScreen: false])`.
 *
 * The trailing boolean is optional because it defaults to `true` in
 * `IEntityTypeRegistry.Register`, and the majority of call sites rely on that
 * default. It is accepted both named (`hasFrontendScreen: false`, every
 * current site) and positional (`, false`), so a future site written the
 * other way is parsed rather than dropped — and `parsedMatchesRawCallCount`
 * below fails loudly if some third spelling appears that neither form covers.
 */
const REGISTER_CALL =
  /registry\.Register\(\s*"([^"]+)"\s*,\s*"([^"]*)"\s*,\s*"([^"]*)"\s*,\s*"([^"]*)"\s*,\s*"([^"]*)"\s*(?:,\s*(?:hasFrontendScreen\s*:\s*)?(true|false)\s*)?\)/g;

function parseRegistrations(files: string[]): {
  registrations: BackendRegistration[];
  rawCallCount: number;
} {
  const registrations: BackendRegistration[] = [];
  let rawCallCount = 0;
  for (const file of files) {
    const source = fs.readFileSync(file, "utf8");
    const relative = path.relative(BACKEND_ROOT, file).split(path.sep).join("/");
    rawCallCount += (source.match(/registry\.Register\(/g) ?? []).length;
    REGISTER_CALL.lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = REGISTER_CALL.exec(source)) !== null) {
      const line = source.slice(0, match.index).split(/\r?\n/).length;
      registrations.push({
        key: match[1],
        owningModule: match[2],
        hasFrontendScreen: match[6] === undefined ? true : match[6] === "true",
        where: `${relative}:${line}`,
      });
    }
  }
  return { registrations, rawCallCount };
}

/**
 * Always runs, in both states — this is what makes the two states legible.
 *
 * `describe.skip` alone leaves vitest's DEFAULT reporter printing a bare
 * "8 skipped" and nothing about why; console output from a fully-skipped file
 * is swallowed with it, so a top-level `console.warn` would not survive
 * either. A suite that actually executes does get its console output
 * attributed and printed, so the unpinned case announces itself by name and
 * by the path it looked in. The pinned case stays silent — a green run should
 * not shout.
 */
describe("entityScreenManifest cross-repo pin availability", () => {
  it("reports whether hasFrontendScreen is verified or unverified in this run", () => {
    if (!backendAvailable) {
      console.warn(
        `[entityScreenManifest] SKIPPING the cross-repo hasFrontendScreen drift check: ` +
          `no SCRIPE-Backend checkout at ${BACKEND_ROOT}. ` +
          `hasFrontendScreen is UNVERIFIED in this run.`
      );
    }
    // Asserts nothing about which state we are in — either is legitimate.
    // The point of this test is the announcement above, and that the
    // availability probe itself resolved to a real boolean rather than
    // throwing on a malformed path.
    expect(typeof backendAvailable).toBe("boolean");
  });
});

const suiteName = backendAvailable
  ? "entityScreenManifest pinned against the real SCRIPE-Backend entity-type catalogs"
  : "entityScreenManifest backend pin — SKIPPED: no SCRIPE-Backend checkout beside this repo, so hasFrontendScreen is UNVERIFIED in this run";

const suite = backendAvailable ? describe : describe.skip;

suite(suiteName, () => {
  const catalogFiles = backendAvailable ? collectCatalogFiles(path.join(BACKEND_ROOT, "src")) : [];
  const { registrations, rawCallCount } = parseRegistrations(catalogFiles);

  const manifest = [...ENTITY_TYPES_WITH_FRONTEND_SCREEN].sort();
  const manifestSet = new Set<string>(manifest);
  const byKey = new Map(registrations.map((r) => [r.key, r]));
  const claimsScreen = registrations.filter((r) => r.hasFrontendScreen);

  // ── Parser self-tests ──────────────────────────────────────────────
  // Without these, a regex that matched nothing would make every comparison
  // below compare two empty-ish things and pass.
  it("found the catalog files and parsed real registrations", () => {
    expect(catalogFiles.length).toBeGreaterThanOrEqual(10);
    expect(registrations.length).toBeGreaterThanOrEqual(40);
  });

  it("parsed EVERY registry.Register call, not just the ones its regex happens to fit", () => {
    // The single most important self-test here. A registration written in an
    // unrecognised shape would be dropped silently, and a dropped key that
    // the manifest also lacks would look like agreement.
    expect(registrations.length).toBe(rawCallCount);
  });

  it("saw both boolean states, so the flag is genuinely being read", () => {
    // If the optional group stopped matching, every entry would default to
    // `true` and the "backend says none" direction would become untestable.
    expect(claimsScreen.length).toBeGreaterThanOrEqual(1);
    expect(registrations.length - claimsScreen.length).toBeGreaterThanOrEqual(1);
  });

  it("registered no key twice (first registration wins on the backend, so a dupe would hide one)", () => {
    expect(new Set(registrations.map((r) => r.key)).size).toBe(registrations.length);
  });

  // ── Direction 1 ────────────────────────────────────────────────────
  it("names every key the backend claims has a screen that this repo does not render", () => {
    const backendClaimsScreenButFrontendHasNone = claimsScreen
      .filter((r) => !manifestSet.has(r.key))
      .map((r) => `${r.key}  (backend says true at ${r.where})`);
    expect({ backendClaimsScreenButFrontendHasNone }).toEqual({
      backendClaimsScreenButFrontendHasNone: [],
    });
  });

  // ── Direction 2 ────────────────────────────────────────────────────
  it("names every key this repo renders that the backend says has no screen", () => {
    const frontendHasScreenButBackendSaysNone = manifest
      .filter((key) => byKey.has(key) && !byKey.get(key)!.hasFrontendScreen)
      .map((key) => `${key}  (backend says false at ${byKey.get(key)!.where})`);
    expect({ frontendHasScreenButBackendSaysNone }).toEqual({
      frontendHasScreenButBackendSaysNone: [],
    });
  });

  // ── Direction 3 ────────────────────────────────────────────────────
  it("names every key this repo renders that the backend registry does not carry at all", () => {
    // Not a hasFrontendScreen disagreement — a harder failure. The values API
    // validates against the registry, so a screen wired to an unregistered
    // key cannot save anything.
    const frontendKeysMissingFromRegistry = manifest.filter((key) => !byKey.has(key));
    expect({ frontendKeysMissingFromRegistry }).toEqual({
      frontendKeysMissingFromRegistry: [],
    });
  });

  // ── The set equality the three directions add up to ────────────────
  it("the backend's screen-flagged set and this repo's manifest are the same set", () => {
    expect(claimsScreen.map((r) => r.key).sort()).toEqual(manifest);
  });
});
