import fs from "node:fs";
import path from "node:path";
import { describe, it, expect } from "vitest";
import { APP_ROUTE_MANIFEST, matchAppRoute } from "../app-route-manifest";
import { PAGE_PERMISSIONS, hasPermission } from "@core/common/types/permissions";

function collectAppRouterPages(dir: string, appRoot: string, out: string[] = []): string[] {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      collectAppRouterPages(fullPath, appRoot, out);
    } else if (entry.isFile() && entry.name === "page.tsx") {
      const relDir = path.relative(appRoot, path.dirname(fullPath)).replace(/\\/g, "/");
      const segs =
        relDir === ""
          ? []
          : relDir.split("/").filter((s) => !(s.startsWith("(") && s.endsWith(")")));
      out.push(`/${segs.join("/")}`);
    }
  }
  return out;
}

function collectBackendMenuProviderFiles(dir: string, out: string[] = []): string[] {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      collectBackendMenuProviderFiles(fullPath, out);
    } else if (entry.isFile() && /MenuProvider(\.[^.]+)?\.cs$/.test(entry.name)) {
      out.push(fullPath);
    }
  }
  return out;
}

function extractBackendMenuEntries(fileContent: string): Array<{ route: string; resource: string | null }> {
  const withoutComments = fileContent
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/^\s*\/\/.*$/gm, "");
  const results: Array<{ route: string; resource: string | null }> = [];

  // Match MenuItemDefinition constructors after `GetMenuItems()` / `Get*Group*` helpers (skip WorkspaceDefinition block)
  const itemSectionStart = withoutComments.search(/GetMenuItems\s*\(|MenuItemDefinition/);
  if (itemSectionStart < 0) return results;
  const body = withoutComments.slice(itemSectionStart);

  // Extract balanced `new(` or `new MenuItemDefinition(` argument lists that include a route literal
  const newPattern = /new(?:\s+MenuItemDefinition)?\s*\(/g;
  let match: RegExpExecArray | null;
  while ((match = newPattern.exec(body)) !== null) {
    let depth = 1;
    let i = match.index + match[0].length;
    while (i < body.length && depth > 0) {
      if (body[i] === "(") depth += 1;
      else if (body[i] === ")") depth -= 1;
      i += 1;
    }
    const argsBlock = body.slice(match.index + match[0].length, i - 1);
    if (argsBlock.includes("Children:")) {
      // Group header container — still check if it has its own Route
      const namedRouteMatch = argsBlock.match(/Route\s*:\s*"(\/[^"]+)"/);
      const namedResMatch = argsBlock.match(/Resource\s*:\s*"([^"]+)"/);
      if (namedRouteMatch) {
        results.push({
          route: namedRouteMatch[1],
          resource: namedResMatch?.[1] ?? null,
        });
      }
      continue;
    }

    const namedRoute = argsBlock.match(/Route\s*:\s*"(\/[^"]+)"/)?.[1];
    const namedResource = argsBlock.match(/Resource\s*:\s*"([^"]+)"/)?.[1] ?? null;
    if (namedRoute) {
      results.push({ route: namedRoute, resource: namedResource });
      continue;
    }

    // Positional constructor: (Slug, NameEn, NameAr, Route, Icon, SortOrder, Resource: ...)
    const positionalStrings = [...argsBlock.matchAll(/"([^"]*)"/g)].map((m) => m[1]);
    const routeLiteral = positionalStrings.find((s) => s.startsWith("/"));
    if (routeLiteral) {
      results.push({ route: routeLiteral, resource: namedResource });
    }
  }

  return results;
}

function backendResourceSatisfiesFrontend(resource: string, requiredPermissions: readonly string[]): boolean {
  if (!resource || requiredPermissions.length === 0) return true;
  // Simulate MenuPermissionEvaluator expansion on a user holding ONLY the resource's view/read permission
  const simulatedPerms: string[] = [];
  for (const alt of resource.split("|").map((s) => s.trim()).filter(Boolean)) {
    for (const tok of alt.split(/[&+]/).map((s) => s.trim()).filter(Boolean)) {
      if (tok.includes(".")) {
        simulatedPerms.push(tok, `${tok}.view`, `${tok}.read`);
      } else {
        simulatedPerms.push(`${tok}.view`, `${tok}.read`);
      }
    }
  }
  return requiredPermissions.every((req) => hasPermission(simulatedPerms, req));
}

describe("APP_ROUTE_MANIFEST & PAGE_PERMISSIONS parity with src/app/**/page.tsx", () => {
  const appRoot = path.resolve(process.cwd(), "src/app");
  const diskRoutes = [...new Set(collectAppRouterPages(appRoot, appRoot))].sort();
  const manifestPatterns = APP_ROUTE_MANIFEST.map((e) => e.pattern);
  const manifestSet = new Set(manifestPatterns);
  const pagePermissionKeys = Object.keys(PAGE_PERMISSIONS);
  const pagePermissionSet = new Set(pagePermissionKeys);

  it("has zero duplicate route patterns in APP_ROUTE_MANIFEST", () => {
    expect(manifestPatterns.length).toBe(manifestSet.size);
  });

  it("maps every concrete src/app/**/page.tsx route in APP_ROUTE_MANIFEST with zero missing routes", () => {
    const missingFromManifest = diskRoutes.filter((r) => !manifestSet.has(r));
    expect(missingFromManifest).toEqual([]);
  });

  it("contains zero ghost routes in APP_ROUTE_MANIFEST that lack a src/app/**/page.tsx", () => {
    const diskSet = new Set(diskRoutes);
    const ghostManifestRoutes = manifestPatterns.filter((r) => !diskSet.has(r));
    expect(ghostManifestRoutes).toEqual([]);
  });

  it("maintains exact 1:1 parity between src/app/**/page.tsx and PAGE_PERMISSIONS (zero missing, zero ghosts)", () => {
    const missingPermissions = diskRoutes.filter((r) => !pagePermissionSet.has(r));
    const ghostPermissions = pagePermissionKeys.filter((r) => !new Set(diskRoutes).has(r));

    expect(missingPermissions).toEqual([]);
    expect(ghostPermissions).toEqual([]);
  });

  it("ensures every menu_bound route declares a valid menuRouteKey and never falls back to SYSTEM_PAGES prefix bypasses", () => {
    for (const entry of APP_ROUTE_MANIFEST) {
      if (entry.binding === "menu_bound") {
        expect(typeof entry.menuRouteKey).toBe("string");
        expect(entry.menuRouteKey?.startsWith("/")).toBe(true);
      }
      if (entry.binding === "shell_authenticated") {
        expect(entry.pattern.startsWith("/crm")).toBe(false);
        expect(entry.pattern === "/settings" || !entry.pattern.startsWith("/settings/")).toBe(
          true
        );
      }
    }

    // Dynamic concrete samples resolve accurately without matching non-existent routes
    expect(matchAppRoute("/roles/role-123")?.pattern).toBe("/roles/[id]");
    expect(matchAppRoute("/plugins/inst-1/logs")?.pattern).toBe(
      "/plugins/[installationId]/logs"
    );
    expect(matchAppRoute("/completely-unknown-route-404")).toBeNull();
  });

  it("maintains route and PBAC parity against backend IModuleMenuProvider definitions", () => {
    const backendModulesDir = path.resolve(process.cwd(), "../SCRIPE-Backend/src/Modules");
    if (!fs.existsSync(backendModulesDir)) return;

    const providerFiles = collectBackendMenuProviderFiles(backendModulesDir);
    expect(providerFiles.length).toBeGreaterThan(0);

    const allBackendEntries: Array<{ file: string; route: string; resource: string | null }> = [];
    for (const file of providerFiles) {
      const content = fs.readFileSync(file, "utf8");
      for (const entry of extractBackendMenuEntries(content)) {
        allBackendEntries.push({
          file: path.basename(file),
          route: entry.route,
          resource: entry.resource,
        });
      }
    }

    expect(allBackendEntries.length).toBeGreaterThan(20);

    // 1. Every backend menu route must be mapped in APP_ROUTE_MANIFEST and PAGE_PERMISSIONS
    for (const entry of allBackendEntries) {
      const matched = matchAppRoute(entry.route);
      expect(matched, `Missing APP_ROUTE_MANIFEST entry for ${entry.file}:${entry.route}`).not.toBeNull();
      expect(matched?.binding).toBe("menu_bound");
      expect(
        Object.prototype.hasOwnProperty.call(PAGE_PERMISSIONS, entry.route),
        `Missing PAGE_PERMISSIONS entry for ${entry.file}:${entry.route}`
      ).toBe(true);
    }

    // 2. Strict PBAC Resource parity for Venue, HRMS, WorkManagement, and CRM
    const parityCheckedProviders = new Set([
      "VenueMenuProvider.cs",
      "HrmsMenuProvider.cs",
      "WorkManagementMenuProvider.cs",
      "CRMMenuProvider.cs",
    ]);

    for (const entry of allBackendEntries) {
      if (!parityCheckedProviders.has(entry.file) || !entry.resource) continue;
      const requiredPerms = PAGE_PERMISSIONS[entry.route] ?? [];
      expect(
        backendResourceSatisfiesFrontend(entry.resource, requiredPerms),
        `PBAC drift on ${entry.file} ${entry.route}: BE resource "${entry.resource}" vs FE PAGE_PERMISSIONS ${JSON.stringify(requiredPerms)}`
      ).toBe(true);
    }

    // /hrms accepts any HRMS or WorkManagement view permission (never locked strictly to STAFF_MEMBER_VIEW)
    expect(hasPermission(["employment-records.view"], PAGE_PERMISSIONS["/hrms"][0])).toBe(true);
    expect(hasPermission(["work-items.view"], PAGE_PERMISSIONS["/hrms"][0])).toBe(true);
    expect(hasPermission(["venue-dashboard.view"], PAGE_PERMISSIONS["/hrms"][0])).toBe(false);
  });

  it("guards shell and navigation code against workspace-entry fallback drift regressions", () => {
    const srcRoot = path.resolve(process.cwd(), "src");
    const buildSearchIndexSrc = fs.readFileSync(
      path.join(srcRoot, "core/navigation/search/buildSearchIndex.ts"),
      "utf8"
    );
    const primaryRailSrc = fs.readFileSync(
      path.join(srcRoot, "core/ui/layout/nexus/nexus-primary-rail.tsx"),
      "utf8"
    );
    const topbarPartsSrc = fs.readFileSync(
      path.join(srcRoot, "core/ui/layout/nexus/_parts/topbar-parts.tsx"),
      "utf8"
    );
    const topbarSrc = fs.readFileSync(
      path.join(srcRoot, "core/ui/layout/nexus/nexus-topbar.tsx"),
      "utf8"
    );
    const secondaryRailSrc = fs.readFileSync(
      path.join(srcRoot, "core/ui/layout/nexus/nexus-secondary-rail.tsx"),
      "utf8"
    );
    const routeGuardSrc = fs.readFileSync(
      path.join(srcRoot, "core/providers/route-guard.tsx"),
      "utf8"
    );
    const hrmsPageSrc = fs.readFileSync(
      path.join(srcRoot, "app/(modules)/(workspace-hrms)/hrms/page.tsx"),
      "utf8"
    );

    expect(buildSearchIndexSrc).not.toContain('"/overview"');
    expect(primaryRailSrc).not.toContain("findAny");
    expect(topbarPartsSrc).not.toContain("findAny");
    expect(routeGuardSrc).not.toContain("allWorkspaceRoutes");
    expect(secondaryRailSrc).toContain('t("chrome.allWorkspaces")');
    expect(secondaryRailSrc).not.toContain('t("chrome.goToHome")');
    expect(topbarPartsSrc).toContain("effectiveHomeRoute");
    expect(topbarSrc).toContain("resolveWorkspaceStartTarget");
    expect(hrmsPageSrc).toContain("effectiveHomeRoute");
    expect(hrmsPageSrc).not.toMatch(/redirect\(["']\/hrms\/staff-members["']\)/);
  });
});
