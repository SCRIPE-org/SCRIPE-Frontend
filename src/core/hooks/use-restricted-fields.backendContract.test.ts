/**
 * Cross-repo pin: every screen's FLS `resource` against the `PermissionResource`
 * its entity type is registered with in the C# catalogs. Tier 1 slice 5.
 *
 * WHY THIS EXISTS
 * ---------------
 * Field-level security is looked up by PERMISSION RESOURCE. The server keys the
 * restricted-field map on `Permission.Resource`; the client looks it up with the
 * screen's own `config.resource` (`useRestrictedFields`). Those two strings are
 * declared in different repositories by different hands, and **nothing compared
 * them**.
 *
 * When they disagree the filter does not weaken — it vanishes. The lookup misses,
 * the restricted list reads as empty, and every restricted column renders. There is
 * no error and no log: a screen with a silently inert security filter looks
 * identical to a screen with nothing restricted. That is the same shape as the
 * defect Tier 1 fixed on the server (custom-field values were authorized against
 * Custom Fields' own resource instead of the host entity type's), which is why it
 * gets a pin rather than a comment.
 *
 * WHAT IS COMPARED
 * ----------------
 * The frontend side is scanned rather than hand-listed, so a new screen is covered
 * the day it ships instead of the day someone remembers a manifest. Only files with
 * EXACTLY ONE `resource:` and ONE `entityTypeKey:` string literal are paired, which
 * makes the pairing unambiguous without parsing TypeScript. At the commit that
 * introduced this file that was 31 of the 35 candidate files; the other four are
 * locale dictionaries where `entityTypeKey` is a translation key, excluded by path.
 *
 * HONEST LIMIT — read before trusting a green run
 * -----------------------------------------------
 * Same submodule caveat as `entityScreenManifest.backendContract.test.ts`, whose
 * parser and skip mechanics this file reuses: with no `SCRIPE-Backend` beside this
 * repo the pin suite reports itself SKIPPED rather than passing vacuously. A
 * nonzero skip count is the signal.
 *
 * KNOWN DRIFT, RECORDED RATHER THAN HIDDEN
 * ----------------------------------------
 * Two screens are already wrong, and this pin does not fix them — it fences them.
 * `DsrView` and `InventoryView` both declare `resource: "compliance"`, while the
 * backend registers `compliance_dsr` and `compliance_data_inventory`, and the
 * controllers gate on `compliance_dsr.view` / `compliance_data_inventory.view`. So
 * on those two screens the FLS filter can never fire AND the `canView` fallback
 * resolves to a permission that does not exist, which renders the Lock empty state
 * for every admin without a wildcard grant. See
 * `reports/SCRIPE_Compliance_Screen_Resource_Drift_Finding.md`.
 *
 * Fixing them changes a permission gate on two screens in another module, which is
 * not this slice's business. They are listed below by name, and **the allow-list is
 * asserted to be exactly these two** — so it cannot quietly grow, and removing a
 * fixed entry is a one-line change.
 */
import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

/** Frontend repo root — this file sits 3 directories below it. */
const FRONTEND_ROOT = path.resolve(__dirname, "../../..");
const BACKEND_ROOT = path.resolve(FRONTEND_ROOT, "../SCRIPE-Backend");

/**
 * Availability anchor: probe a specific known file, not the directory, so a stray
 * empty `SCRIPE-Backend/` folder cannot be mistaken for a real checkout.
 */
const CORE_CATALOG = path.join(BACKEND_ROOT, "src/Core/Core.Application/CoreEntityTypeCatalog.cs");
const backendAvailable = fs.existsSync(CORE_CATALOG);

/**
 * Screens whose `resource` does not match their entity type's registered
 * `PermissionResource`. Pre-existing, filed separately, NOT fixed here.
 */
const KNOWN_DRIFT = new Set(["compliance.dsr", "compliance.data-inventory"]);

const SKIP_DIRS = new Set(["bin", "obj", "node_modules", ".git", ".next", "dist"]);

function collectSourceFiles(dir: string, out: string[] = []): string[] {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue;
      collectSourceFiles(full, out);
      continue;
    }
    if (!/\.tsx?$/.test(entry.name)) continue;
    if (entry.name.includes(".test.")) continue;
    // `entityTypeKey` is also a translation key in the locale dictionaries.
    if (full.split(path.sep).includes("locales")) continue;
    out.push(full);
  }
  return out;
}

interface ScreenPair {
  entityTypeKey: string;
  resource: string;
  where: string;
}

/**
 * Pairs `resource:` with `entityTypeKey:` per file, and ONLY when each appears
 * exactly once — an unambiguous pairing without a TS parser. A file with two
 * configs is reported as unpaired rather than guessed at.
 */
function scanFrontendScreens(): { pairs: ScreenPair[]; unpaired: string[] } {
  const pairs: ScreenPair[] = [];
  const unpaired: string[] = [];
  for (const file of collectSourceFiles(path.join(FRONTEND_ROOT, "src"))) {
    const source = fs.readFileSync(file, "utf8");
    const keys = [...source.matchAll(/entityTypeKey:\s*"([^"]+)"/g)];
    if (keys.length === 0) continue;
    const resources = [...source.matchAll(/\bresource:\s*"([^"]+)"/g)];
    const relative = path.relative(FRONTEND_ROOT, file).split(path.sep).join("/");
    if (keys.length !== 1 || resources.length !== 1) {
      unpaired.push(relative);
      continue;
    }
    pairs.push({
      entityTypeKey: keys[0][1],
      resource: resources[0][1],
      where: relative,
    });
  }
  return { pairs, unpaired };
}

/** Same regex as the entity-screen pin; group 5 is the PermissionResource. */
const REGISTER_CALL =
  /registry\.Register\(\s*"([^"]+)"\s*,\s*"([^"]*)"\s*,\s*"([^"]*)"\s*,\s*"([^"]*)"\s*,\s*"([^"]*)"\s*(?:,\s*(?:hasFrontendScreen\s*:\s*)?(true|false)\s*)?\)/g;

function collectCatalogFiles(dir: string, out: string[] = []): string[] {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name) || entry.name === "Migrations") continue;
      collectCatalogFiles(path.join(dir, entry.name), out);
      continue;
    }
    if (entry.name.endsWith("EntityTypeCatalog.cs")) out.push(path.join(dir, entry.name));
  }
  return out;
}

function parseBackendResources(): Map<string, string> {
  const byKey = new Map<string, string>();
  for (const file of collectCatalogFiles(path.join(BACKEND_ROOT, "src"))) {
    const source = fs.readFileSync(file, "utf8");
    REGISTER_CALL.lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = REGISTER_CALL.exec(source)) !== null) {
      byKey.set(match[1], match[5]);
    }
  }
  return byKey;
}

// Always runs, in both states — this is what makes an unpinned run legible
// rather than silently green.
describe("FLS resource pin — availability", () => {
  it("reports whether the sibling backend checkout was found", () => {
    if (!backendAvailable) {
      console.warn(
        `[FLS resource pin] SKIPPED — no SCRIPE-Backend checkout at ${BACKEND_ROOT}. ` +
          `Screen FLS resources were NOT verified against the C# catalogs.`
      );
    }
    expect(typeof backendAvailable).toBe("boolean");
  });
});

describe.skipIf(!backendAvailable)("every screen's FLS resource matches its registered PermissionResource", () => {
  it("finds screens to check at all (guards against a scan that silently matched nothing)", () => {
    const { pairs } = scanFrontendScreens();
    // 31 at the commit that introduced this pin. A floor rather than an equality
    // so adding a screen does not fail the build, while a regex that stopped
    // matching does.
    expect(pairs.length).toBeGreaterThanOrEqual(30);
  });

  it("parses the backend registry at all (same guard, other side)", () => {
    // 55 registrations at the commit that introduced this pin.
    expect(parseBackendResources().size).toBeGreaterThanOrEqual(50);
  });

  it("matches every screen's resource against the backend, or the screen is a known-drift exception", () => {
    const backend = parseBackendResources();
    const { pairs } = scanFrontendScreens();
    const mismatches: string[] = [];

    for (const pair of pairs) {
      const registered = backend.get(pair.entityTypeKey);
      // A screen wired to an unregistered entity type is a different defect, and
      // the entity-screen pin already covers it.
      if (registered === undefined) continue;
      if (KNOWN_DRIFT.has(pair.entityTypeKey)) continue;
      // Case-insensitive: the server lowercases the map's keys when it builds
      // token data, so that is the comparison that decides whether the lookup hits.
      if (registered.toLowerCase() !== pair.resource.toLowerCase()) {
        mismatches.push(
          `${pair.where}: entityTypeKey "${pair.entityTypeKey}" declares resource ` +
            `"${pair.resource}" but the backend registers "${registered}"`
        );
      }
    }

    expect(mismatches).toEqual([]);
  });

  it("still has exactly the two known-drift screens, so the exception list cannot quietly grow", () => {
    const backend = parseBackendResources();
    const { pairs } = scanFrontendScreens();

    const actuallyDrifting = pairs
      .filter((pair) => {
        const registered = backend.get(pair.entityTypeKey);
        return (
          registered !== undefined &&
          registered.toLowerCase() !== pair.resource.toLowerCase()
        );
      })
      .map((pair) => pair.entityTypeKey)
      .sort();

    // If one is fixed, this fails and the allow-list above must shrink with it —
    // which is the point: a stale exception is indistinguishable from a real one.
    expect(actuallyDrifting).toEqual([...KNOWN_DRIFT].sort());
  });
});
