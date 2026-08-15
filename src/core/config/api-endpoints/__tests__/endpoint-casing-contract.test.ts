/**
 * Endpoint casing / shape contract guard.
 *
 * WHY THIS EXISTS
 * ---------------
 * The backend registers `SlugifyParameterTransformer` globally
 * (SCRIPE-Backend/src/Host/API/Extensions/ServiceExtensions.cs, via
 * RouteTokenTransformerConvention), so every `[controller]` route token is
 * emitted as kebab-case:
 *
 *     UserGroupsController   ->  api/v1/user-groups
 *     StaffMembersController ->  api/v1/staff-members
 *
 * ASP.NET route matching is case-INsensitive but NOT hyphen-insensitive.
 * A frontend constant of `/v1/UserGroups` is therefore a hard 404, while a
 * single-word `/v1/Tenants` still resolves (it differs only by case). So the
 * defect class is specifically: multi-word path segments that are not
 * kebab-case.
 *
 * Wave 2B risk R-21 recorded this convention but explicitly left it unpinned:
 * "Not yet done: no automated test pins this convention". This test is that pin.
 * Without it, any future endpoint constant can silently reintroduce a 404 that
 * no build, lint, or unit test would catch — which is exactly how the Custom
 * Fields workspace incident surfaced in a browser instead of in CI.
 */
import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

/** Repo-root-relative `src/` directory (this file lives in src/core/config/api-endpoints/__tests__). */
const SRC = path.resolve(__dirname, "../../../..");

/** Recursively collect every `*.endpoints.ts` file under src/. */
function endpointFiles(dir: string, acc: string[] = []): string[] {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === "node_modules" || entry.name.startsWith(".")) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) endpointFiles(full, acc);
    else if (entry.name.endsWith(".endpoints.ts")) acc.push(full);
  }
  return acc;
}

/**
 * Extract literal URL templates from an endpoints file — the `${V1}/...` /
 * `${V2}/...` template-literal form the convention mandates, e.g.
 * `` LIST: `${V1}/custom-fields` ``.
 */
function extractTemplates(text: string): { raw: string; line: number }[] {
  const out: { raw: string; line: number }[] = [];
  text.split(/\r?\n/).forEach((line, idx) => {
    const re = /\$\{V\d\}(\/[A-Za-z0-9\-_/${}.]*)/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(line)) !== null) out.push({ raw: m[1], line: idx + 1 });
  });
  return out;
}

/** Static path segments only — drop `${...}` interpolations and query strings. */
function staticSegments(template: string): string[] {
  return template
    .split("?")[0]
    .split("/")
    .filter((s) => s.length > 0 && !s.includes("${"));
}

/**
 * A segment violates the convention when an uppercase letter follows a
 * lowercase letter or digit — i.e. it is multi-word PascalCase/camelCase
 * ("UserGroups", "myTenantGroups").
 */
const MULTIWORD_NOT_KEBAB = /[a-z0-9][A-Z]/;

/**
 * Documented allowlist — segments this guard intentionally does NOT flag as a
 * casing defect, because renaming them would not fix anything.
 *
 * ThemeBundles: verified there is NO `ThemeBundlesController` (or any
 * controller serving "bundle") anywhere in SCRIPE-Backend, at any casing —
 * see reports/system-recovery/manifests/backend-api-routes.json (0 matches
 * for /bundle/i). BRANDING_ENDPOINTS.BUNDLES.* is live-consumed by
 * ThemeBundleService / useThemeBundleViewModel / SaveBundleDialog, so this is
 * a genuine missing-backend-feature gap, tracked separately in the recovery
 * ledger — not a kebab-case rename. Kebab-casing it would only trade one
 * 404 spelling for another and hide the real defect from this guard.
 */
const ALLOWED_NON_KEBAB_CONTROLLERS = new Set(["ThemeBundles"]);

const files = endpointFiles(SRC);

describe("API endpoint constants match the backend kebab-case route convention", () => {
  it("discovers endpoint files to check", () => {
    expect(files.length).toBeGreaterThan(0);
  });

  /**
   * Only the FIRST static path segment corresponds to the ASP.NET
   * `[controller]` route token — the only token `SlugifyParameterTransformer`
   * rewrites. No controller in this codebase uses an `[action]` token
   * (verified: zero matches for "[action]" under
   * SCRIPE-Backend/src/Host/API/Controllers), so every segment after the
   * first is a literal string from `[HttpGet("...")]`/etc., which ASP.NET
   * already matches case-insensitively regardless of hyphenation. Checking
   * those literal segments produced false positives: e.g. `myTenantGroups`
   * in `/user-groups/myTenantGroups` genuinely resolves, because the
   * backend's own `[HttpGet("myTenantGroups")]` is matched
   * case-insensitively too — verified live in
   * reports/system-recovery/manifests/backend-api-routes.json
   * ("GET api/v1/user-groups/mytenantgroups" exists).
   */
  it("has a kebab-case (or single-word) [controller] segment (else it 404s)", () => {
    const violations: string[] = [];

    for (const file of files) {
      const text = fs.readFileSync(file, "utf8");
      for (const { raw, line } of extractTemplates(text)) {
        const [firstSeg] = staticSegments(raw);
        if (
          firstSeg &&
          MULTIWORD_NOT_KEBAB.test(firstSeg) &&
          !ALLOWED_NON_KEBAB_CONTROLLERS.has(firstSeg)
        ) {
          const expected = firstSeg.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
          violations.push(
            `${path.relative(SRC, file).replace(/\\/g, "/")}:${line}  ` +
              `"${firstSeg}" in "${raw}" -> should be "${expected}"`
          );
        }
      }
    }

    expect(
      violations,
      `Endpoint constants use a multi-word [controller] segment the backend does not serve.\n` +
        `The backend slugifies [controller] tokens (the first route segment) to kebab-case,\n` +
        `and ASP.NET route matching is not hyphen-insensitive, so each of these is a 404:\n\n` +
        violations.join("\n")
    ).toEqual([]);
  });
});
