// ═══════════════════════════════════════════════════════════════════════════
// Option sets — module wiring (P-4)
//
// Guards the six seams that make the option-set submodule REACHABLE, none of which any other test in
// this submodule can see. The submodule's own tests all mock `getCustomFieldsContainer()` and grant
// permissions by literal key, which is correct for testing behaviour and is exactly why they stay
// green while the screen is unreachable in the running app: a route with no PAGE_PERMISSIONS entry, a
// container with no `optionSetRepository`, and a definitions header with no link are all invisible to
// them.
//
// Every group below fails loudly for one specific regression:
//
//   1. ROUTE GATE — PAGE_PERMISSIONS matches by exact path/segment-count, never by prefix, so a page
//      nested under /custom-fields does NOT inherit the parent's entry. A route with no entry falls
//      through to "open to any authenticated user", silently.
//   2. THE GATED PATH IS REAL — a typo'd key would guard nothing forever while the real page stayed
//      ungated. Asserted against the file on disk, not against a string.
//   3. PERMISSION KEYS — the backend's OptionSetsController decorates every action with these exact
//      strings. A frontend typo does not fail to compile; it hides a control from everyone, or shows
//      one to someone the server will refuse.
//   4. BARREL SURFACE — what the submodule publishes, and (more importantly) what it must NOT.
//   5. DI REGISTRATION — asserted by driving a real repository through a real service to a fake api,
//      because "the property exists" is a weaker claim than "the property is wired to the endpoint".
//   6. THE DISCOVERY LINK — /custom-fields/option-sets has no backend-seeded sidebar entry, so the
//      definitions screen's header is its ONLY entry point. Read from the real source rather than by
//      mounting CustomFieldListView, matching that file's existing sibling tests: rendering it needs
//      the whole GenericCrudView dependency chain for a check that needs none of it.
// ═══════════════════════════════════════════════════════════════════════════

import { describe, it, expect, vi, beforeEach } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import type { IApiService } from "@core/interfaces/api.interface";
import { PAGE_PERMISSIONS, SYSTEM_PERMISSIONS } from "@core/common/types/permissions";
import { CUSTOM_FIELDS_PERMISSIONS } from "../permission-constants";
import type { OptionSetJson } from "./src/data/models/OptionSetModel";

// The api factory is mocked, not the container: the whole point of group 5 is to exercise the REAL
// `getCustomFieldsContainer()` composition, and the only thing about it that must not be real is the
// HTTP client at the bottom.
const apiDouble = {
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
};

vi.mock("@/core/services/api-factory", () => ({
  getModuleApiService: vi.fn(() => apiDouble as unknown as IApiService),
}));

const HERE = dirname(fileURLToPath(import.meta.url));
// …/src/modules/custom-fields/custom-fields/option-set — five levels up is the frontend root.
const FRONTEND_ROOT = resolve(HERE, "../../../../..");
const PAGE_PATH = resolve(
  FRONTEND_ROOT,
  "src/app/(modules)/(workspace-custom-fields)/custom-fields/option-sets/page.tsx"
);
const DEFINITIONS_VIEW_PATH = resolve(
  HERE,
  "../custom-field/src/presentation/views/CustomFieldList/CustomFieldListView.tsx"
);

const ROUTE = "/custom-fields/option-sets";

const SET_JSON: OptionSetJson = {
  id: "enc-set-1",
  stableKey: "age_groups",
  labelEn: "Age groups",
  labelAr: "الفئات العمرية",
  description: null,
  isSystemManaged: false,
  isPlatformOwned: false,
  versionCount: 2,
  publishedVersionId: "enc-ver-1",
  publishedVersionNumber: 1,
};

// ─────────────────────────────────────────────────────────────────────────────
// 1 + 2. Route gate
// ─────────────────────────────────────────────────────────────────────────────
describe("/custom-fields/option-sets route gate", () => {
  it("has its own PAGE_PERMISSIONS entry (no entry means open to any authenticated user)", () => {
    expect(Object.keys(PAGE_PERMISSIONS)).toContain(ROUTE);
  });

  it("requires exactly custom-field-option-sets.view — the permission the controller requires", () => {
    expect(PAGE_PERMISSIONS[ROUTE]).toEqual([SYSTEM_PERMISSIONS.OPTION_SET_VIEW]);
    expect(SYSTEM_PERMISSIONS.OPTION_SET_VIEW).toBe("custom-field-option-sets.view");
  });

  it("is gated on its OWN permission, not the parent route's", () => {
    // The discriminating assertion, and the reason this entry is not a copy of the value-types one:
    // OptionSetsController requires `custom-field-option-sets.view` on every read, so an admin
    // holding only `custom-fields.view` would pass a parent-gated route straight into a 403.
    //
    // Existence is asserted HERE and not left to the sibling case above, because "differs from the
    // parent" is satisfied by a DELETED entry too: `undefined` is not equal to the parent's array,
    // so the bare inequality passes for the exact regression that leaves the route ungated. A test
    // that only holds while another test also holds is not a guard.
    const required = PAGE_PERMISSIONS[ROUTE] as readonly string[] | undefined;

    expect(required).toBeDefined();
    // An empty list is also "different from the parent" and also means open to any authenticated
    // user, so the entry has to name at least one permission for the inequality to mean anything.
    expect(required).not.toHaveLength(0);
    expect(required).not.toEqual(PAGE_PERMISSIONS["/custom-fields"]);
  });

  it("does not demand any WRITE permission to arrive", () => {
    // Read-only visitors are the point: the seeded ISO 3166 / ISO 4217 / BCP 47 sets are reference
    // data an auditor must be able to read without holding a single mutating permission. The write
    // permissions gate controls INSIDE the screen, which the viewmodel's own tests cover.
    const required = PAGE_PERMISSIONS[ROUTE] as readonly string[];
    for (const write of [
      CUSTOM_FIELDS_PERMISSIONS.OPTION_SET_CREATE,
      CUSTOM_FIELDS_PERMISSIONS.OPTION_SET_UPDATE,
      CUSTOM_FIELDS_PERMISSIONS.OPTION_SET_DELETE,
      CUSTOM_FIELDS_PERMISSIONS.OPTION_SET_PUBLISH,
      CUSTOM_FIELDS_PERMISSIONS.OPTION_SET_BIND,
    ]) {
      expect(required).not.toContain(write);
    }
  });

  it("guards a real app route, not a string that matches nothing", () => {
    expect(existsSync(PAGE_PATH)).toBe(true);
  });

  it("mounts the screen inside a module error boundary", () => {
    const source = readFileSync(PAGE_PATH, "utf-8");
    expect(source).toMatch(/<ModuleErrorBoundary\s+moduleName="optionSet\.title">/);
    expect(source).toMatch(/<OptionSetListView\s*\/>/);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. Permission keys
// ─────────────────────────────────────────────────────────────────────────────
describe("option-set permission constants", () => {
  it("matches the backend resource keys exactly", () => {
    expect(CUSTOM_FIELDS_PERMISSIONS.OPTION_SET_VIEW).toBe("custom-field-option-sets.view");
    expect(CUSTOM_FIELDS_PERMISSIONS.OPTION_SET_CREATE).toBe("custom-field-option-sets.create");
    expect(CUSTOM_FIELDS_PERMISSIONS.OPTION_SET_UPDATE).toBe("custom-field-option-sets.update");
    expect(CUSTOM_FIELDS_PERMISSIONS.OPTION_SET_DELETE).toBe("custom-field-option-sets.delete");
    expect(CUSTOM_FIELDS_PERMISSIONS.OPTION_SET_PUBLISH).toBe("custom-field-option-sets.publish");
    expect(CUSTOM_FIELDS_PERMISSIONS.OPTION_SET_BIND).toBe("custom-field-option-sets.bind");
  });

  it("keeps publish and bind DISTINCT from the CRUD quartet", () => {
    // The reason they exist as separate keys: `update` covers curating a draft, which nothing is
    // using yet, while `publish` takes a version live and `bind` repoints a field that already has
    // users. Collapsing either into `update` would silently widen who can do those two.
    const keys = [
      CUSTOM_FIELDS_PERMISSIONS.OPTION_SET_VIEW,
      CUSTOM_FIELDS_PERMISSIONS.OPTION_SET_CREATE,
      CUSTOM_FIELDS_PERMISSIONS.OPTION_SET_UPDATE,
      CUSTOM_FIELDS_PERMISSIONS.OPTION_SET_DELETE,
      CUSTOM_FIELDS_PERMISSIONS.OPTION_SET_PUBLISH,
      CUSTOM_FIELDS_PERMISSIONS.OPTION_SET_BIND,
    ];
    expect(new Set(keys).size).toBe(6);
  });

  it("leaves the pre-existing CustomFields permissions untouched", () => {
    // This section was added to a shared file; these four are what a careless merge drops.
    expect(CUSTOM_FIELDS_PERMISSIONS.CUSTOM_FIELD_VIEW).toBe("custom-fields.view");
    expect(CUSTOM_FIELDS_PERMISSIONS.FIELD_GROUP_REORDER).toBe("custom-field-groups.reorder");
    expect(CUSTOM_FIELDS_PERMISSIONS.VIEW_HISTORY).toBe("custom-fields.view-history");
    expect(CUSTOM_FIELDS_PERMISSIONS.VIEW_USAGE).toBe("custom-fields.view-usage");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 4. Barrel surface
// ─────────────────────────────────────────────────────────────────────────────
describe("option-set barrel", () => {
  it("publishes the screen, the query-key factories and the entities", async () => {
    const barrel = await import("./index");

    expect(typeof barrel.OptionSetListView).toBe("function");
    expect(typeof barrel.optionSetsQueryKey).toBe("function");
    expect(typeof barrel.optionSetDetailQueryKey).toBe("function");
    expect(typeof barrel.optionSetVersionQueryKey).toBe("function");
    expect(barrel.OPTION_SET_QUERY_ROOT).toEqual(["customFields", "optionSets"]);
    expect(typeof barrel.OptionSet).toBe("function");
    expect(typeof barrel.OptionSetVersion).toBe("function");
    expect(typeof barrel.OptionSetItem).toBe("function");
  }, 60000);

  it("exports the entities as CLASSES, so their rules travel with them", async () => {
    const { OptionSet } = await import("./index");

    // A type-only re-export would satisfy the compiler and leave a consumer free to re-implement
    // `isContentEditable` — the rule that keeps the UI from offering an edit the server refuses.
    const platformMaintained = new OptionSet({ ...SET_JSON, isSystemManaged: true });
    expect(platformMaintained.isContentEditable).toBe(false);
    expect(platformMaintained.isPlatformMaintained).toBe(true);

    const tenantOwned = new OptionSet(SET_JSON);
    expect(tenantOwned.isContentEditable).toBe(true);
  });

  it("does NOT publish the concrete Service or Repository", async () => {
    // Load-bearing omission, not an oversight. `di.ts` is the only place allowed to construct these,
    // because the container's single cached ApiService is what carries `X-Tenant-Context` — and that
    // header decides whether a platform-owned set reads back as writable. A view that could
    // `new OptionSetRepository(new OptionSetService(ownApi))` would be free to disagree with the rest
    // of the module about which context the admin is in.
    const barrel = (await import("./index")) as Record<string, unknown>;

    expect(barrel).not.toHaveProperty("OptionSetService");
    expect(barrel).not.toHaveProperty("OptionSetRepository");
  });

  it("does NOT publish OptionSetDetailPanel", async () => {
    // It takes eleven props wired from `useOptionSetViewModel` and is meaningless without them, so
    // exporting it would advertise a component no outside caller can legally construct.
    const barrel = (await import("./index")) as Record<string, unknown>;

    expect(barrel).not.toHaveProperty("OptionSetDetailPanel");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 5. DI registration
// ─────────────────────────────────────────────────────────────────────────────
describe("CustomFields container — option-set registration", () => {
  beforeEach(() => {
    apiDouble.get.mockReset();
    apiDouble.post.mockReset();
    apiDouble.put.mockReset();
    apiDouble.delete.mockReset();
  });

  it("registers both the service and the repository", async () => {
    const { getCustomFieldsContainer } = await import("../di");
    const container = getCustomFieldsContainer();

    expect(container.optionSetService).toBeDefined();
    expect(container.optionSetRepository).toBeDefined();
  });

  it("hands out ONE cached instance, so every screen shares the tenant-context header", async () => {
    const { getCustomFieldsContainer, customFieldsContainer } = await import("../di");

    expect(getCustomFieldsContainer().optionSetRepository).toBe(
      getCustomFieldsContainer().optionSetRepository
    );
    // The accessor components use must reach the SAME instance as the function the viewmodels call.
    expect(customFieldsContainer.optionSetRepository).toBe(
      getCustomFieldsContainer().optionSetRepository
    );
  });

  it("wires the repository through the service to the option-sets endpoint", async () => {
    // The assertion that "the property exists" cannot make: a repository constructed over the WRONG
    // service, or a service constructed over a second ApiService, both satisfy the interface.
    const { getCustomFieldsContainer } = await import("../di");
    apiDouble.get.mockResolvedValue([SET_JSON]);

    const sets = await getCustomFieldsContainer().optionSetRepository.getAll();

    expect(apiDouble.get).toHaveBeenCalledTimes(1);
    expect(apiDouble.get.mock.calls[0][0]).toBe("/v1/custom-fields/option-sets");
    // Entities out, not models: the repository layer is what maps, and skipping it would still
    // "work" for a caller that only reads `.labelEn`.
    expect(sets).toHaveLength(1);
    expect(sets[0].displayLabel("en")).toBe("Age groups");
    expect(sets[0].isBindable).toBe(true);
  });

  it("leaves every pre-existing registration in place", async () => {
    // di.ts is shared; this pins that the option-set entries were ADDED, not swapped in.
    const { getCustomFieldsContainer } = await import("../di");
    const container = getCustomFieldsContainer();

    for (const key of [
      "customFieldService",
      "customFieldRepository",
      "customFieldValueService",
      "customFieldValueRepository",
      "fieldGroupService",
      "fieldGroupRepository",
      "entityLookupService",
      "entityLookupRepository",
    ] as const) {
      expect(container[key]).toBeDefined();
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 6. The discovery link on the definitions screen
// ─────────────────────────────────────────────────────────────────────────────
describe("CustomFieldListView Option Sets link (real source)", () => {
  const source = readFileSync(DEFINITIONS_VIEW_PATH, "utf-8");

  it("links to /custom-fields/option-sets", () => {
    expect(source).toMatch(/<Link\s+href="\/custom-fields\/option-sets">/);
  });

  it("labels the link from the destination's own optionSet.title key, not a hardcoded string", () => {
    expect(source).toMatch(/t\("optionSet\.title"\)/);
  });

  it("loads the option-set locale chunk, or the label would render its raw key forever", () => {
    // The label lives in the option-set dictionary, not this module's, so the definitions screen has
    // to register that chunk itself. Same dedup key the option-set views use.
    expect(source).toMatch(
      /useModuleLocales\(\(\) => import\("\.\.\/\.\.\/\.\.\/\.\.\/\.\.\/option-set\/locales"\), "customFieldOptionSets"\)/
    );
  });

  it("gates the link on the option-set view permission", () => {
    expect(source).toMatch(
      /const canViewOptionSets = usePermission\(CUSTOM_FIELDS_PERMISSIONS\.OPTION_SET_VIEW\)/
    );
    expect(source).toMatch(/\{canViewOptionSets && \(/);
  });

  it("renders inside customHeaderContent, in the always-visible link row", () => {
    const headerContentIdx = source.indexOf("customHeaderContent:");
    const optionSetsIdx = source.indexOf('href="/custom-fields/option-sets"');
    const errorBranchIdx = source.indexOf("isEntityTypesError", headerContentIdx);

    expect(headerContentIdx).toBeGreaterThan(-1);
    expect(optionSetsIdx).toBeGreaterThan(headerContentIdx);
    // Above the two conditional branches (error / platform-context) that close the header.
    expect(errorBranchIdx).toBeGreaterThan(optionSetsIdx);
  });

  it("keeps the gate in the config memo's dependency list", () => {
    // Without this the link keeps its first-render visibility after the permission set resolves,
    // which for a newly-seeded permission means "hidden from the admin who has it".
    //
    // The dependency array is isolated by its CLOSING boundary rather than by searching for a name
    // inside it: every identifier in that list also appears earlier in the file (that is what a
    // dependency array is), so an `indexOf` on any of them lands on the declaration or a use site
    // instead. `isPlatformContext,` followed by the array's own closing bracket occurs once.
    const depsEnd = source.indexOf("      isPlatformContext,\n    ]\n  );");
    expect(depsEnd).toBeGreaterThan(-1);
    const depsStart = source.lastIndexOf("    [\n", depsEnd);
    expect(depsStart).toBeGreaterThan(-1);

    const deps = source.slice(depsStart, depsEnd);
    expect(deps).toContain("canViewOptionSets,");
    // Sanity check on the extraction itself, so a bracket-matching mistake cannot make the assertion
    // above pass against the whole file.
    expect(deps).not.toContain("customHeaderContent:");
  });

  it("leaves the three pre-existing links alone", () => {
    // The brief for this edit was "change nothing else"; these are what a careless insert eats.
    expect(source).toMatch(/<Link\s+href="\/custom-fields\/value-types">/);
    expect(source).toMatch(/<Link\s+href="\/custom-fields\/field-groups">/);
    expect(source).toMatch(/<Link\s+href="\/custom-fields\/entity-types">/);
  });
});
