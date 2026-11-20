import fs from "node:fs";
import path from "node:path";
import { describe, it, expect } from "vitest";
import { APP_ROUTE_MANIFEST, matchAppRoute } from "../app-route-manifest";
import { PAGE_PERMISSIONS } from "@core/common/types/permissions";

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
});
