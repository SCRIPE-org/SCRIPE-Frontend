// /custom-fields/entity-types permission gate -- Wave 5 row 5.5
//
// PAGE_PERMISSIONS matches by exact path/segment-count, not by prefix, so a
// page nested under /custom-fields does NOT inherit the parent's entry. A
// route with no entry falls through to "open to any authenticated user" --
// which is why rows 5.4 and 5.2 each had to add their own line, and why this
// one does too. That fall-through is silent, so this file is the guard.
//
// The gate is CUSTOM_FIELD_VIEW rather than a new permission because the
// page's only data source is GET /api/v1/custom-fields/entity-types, which
// the backend's CustomFieldsController decorates
// [PermissionRequired("custom-fields.view")] -- so an admin who can already
// reach /custom-fields can already read exactly this list, and gating harder
// here would hide a page whose data they are entitled to.
import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { PAGE_PERMISSIONS, SYSTEM_PERMISSIONS } from "@core/common/types/permissions";

const ROUTE = "/custom-fields/entity-types";

describe("/custom-fields/entity-types route gate", () => {
  it("has its own PAGE_PERMISSIONS entry (no entry means open to any authenticated user)", () => {
    expect(Object.keys(PAGE_PERMISSIONS)).toContain(ROUTE);
  });

  it("requires exactly custom-fields.view, the same permission the parent route and the endpoint require", () => {
    expect(PAGE_PERMISSIONS[ROUTE]).toEqual([SYSTEM_PERMISSIONS.CUSTOM_FIELD_VIEW]);
    expect(SYSTEM_PERMISSIONS.CUSTOM_FIELD_VIEW).toBe("custom-fields.view");
    expect(PAGE_PERMISSIONS[ROUTE]).toEqual(PAGE_PERMISSIONS["/custom-fields"]);
  });

  it("the gated path is a real app route, not a string that matches nothing", () => {
    // Without this the entry above could guard a typo forever while the real
    // page stayed ungated.
    // This file sits 8 directories below the repo root (…/presentation/views).
    const frontendRoot = path.resolve(__dirname, "../../../../../../../../..");
    const page = path.join(
      frontendRoot,
      "src/app/(modules)/(workspace-custom-fields)/custom-fields/entity-types/page.tsx"
    );
    expect(fs.existsSync(page)).toBe(true);
  });
});
