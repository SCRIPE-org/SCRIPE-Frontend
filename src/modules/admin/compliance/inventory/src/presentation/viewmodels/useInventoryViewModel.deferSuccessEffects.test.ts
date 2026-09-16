// useInventoryViewModel — create/update must not lose custom-field values
//
// create() used to fire a manual success() toast then `return {} as
// InventoryItem` with no id, and the hook wasn't opted into
// useCrudViewModel's deferSuccessEffects. Any screen setting entityTypeKey
// (this one does, in getConfigBase) needs BOTH: the created id returned (so
// GenericCrudView has something to save custom field values against), and
// deferSuccessEffects: true (so the toast/close don't fire before that save
// even starts). This test locates both fixes in the source rather than
// mocking the full DI graph, since useInventoryViewModel pulls in
// complianceContainer, i18n, permission, and tenant-store providers that a
// unit test would otherwise have to stub end-to-end for no behavioral gain
// over a direct source assertion. Same pattern as useAdminsViewModel's
// equivalent test (W0-1).
//
// The "opts into deferSuccessEffects" assertion below matches the option
// object only as the real trailing argument to useCrudViewModel(...) --
// i.e. the services object's closing "}," immediately followed by
// "{ deferSuccessEffects: true }" and the call's closing ")". A plain
// /deferSuccessEffects:\s*true/ match also passes on the doc comment above
// the useCrudViewModel call alone, so deleting the real option while
// leaving that comment in place would still pass a plain match -- this
// structural match requires the actual option object.
import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const here = dirname(fileURLToPath(import.meta.url));
const source = readFileSync(resolve(here, "useInventoryViewModel.ts"), "utf-8");

describe("useInventoryViewModel create/update contract", () => {
  it("opts into deferSuccessEffects as the real trailing option to useCrudViewModel", () => {
    expect(source).toMatch(/\},\s*\{\s*deferSuccessEffects:\s*true\s*\}\s*\)/);
  });

  it("create returns the created id instead of an empty object", () => {
    const createBlock = source.slice(
      source.indexOf("create: async (data)"),
      source.indexOf("update: async (id, data)")
    );
    expect(createBlock).toMatch(/return\s*\{\s*id\s*\}/);
    expect(createBlock).not.toMatch(/return\s*\{\}\s*as\s*InventoryItem/);
  });

  it("update returns the id instead of an empty object", () => {
    const updateBlock = source.slice(
      source.indexOf("update: async (id, data)"),
      source.indexOf("delete: async (id)")
    );
    expect(updateBlock).toMatch(/return\s*\{\s*id\s*\}/);
    expect(updateBlock).not.toMatch(/return\s*\{\}\s*as\s*InventoryItem/);
  });
});
