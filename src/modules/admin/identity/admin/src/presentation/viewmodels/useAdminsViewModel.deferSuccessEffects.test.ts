// useAdminsViewModel — create/update must not lose custom-field values
//
// create() used to fire success() then `return {} as Admin` with no id, and
// the hook wasn't opted into useCrudViewModel's deferSuccessEffects. Any
// screen setting entityTypeKey (this one does, in getConfigBase) needs BOTH:
// the created id returned (so GenericCrudView has something to save custom
// field values against), and deferSuccessEffects: true (so the toast/close
// don't fire before that save even starts). This test locates both fixes in
// the source rather than mocking the full DI graph, since useAdminsViewModel
// pulls in identityContainer, i18n, tenant context, and permission providers
// that a unit test would otherwise have to stub end-to-end for no behavioral
// gain over a direct source assertion.
import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const here = dirname(fileURLToPath(import.meta.url));
const source = readFileSync(resolve(here, "useAdminsViewModel.ts"), "utf-8");

describe("useAdminsViewModel create/update contract", () => {
  it("opts into deferSuccessEffects on useCrudViewModel", () => {
    expect(source).toMatch(/deferSuccessEffects:\s*true/);
  });

  it("create returns the created id instead of an empty object", () => {
    const createBlock = source.slice(source.indexOf("create: async (data)"), source.indexOf("update: async (id, data)"));
    expect(createBlock).toMatch(/return\s*\{\s*id\s*\}/);
    expect(createBlock).not.toMatch(/return\s*\{\}\s*as\s*Admin/);
  });

  it("update returns the id instead of an empty object", () => {
    const updateBlock = source.slice(source.indexOf("update: async (id, data)"), source.indexOf("delete: async (id)"));
    expect(updateBlock).toMatch(/return\s*\{\s*id\s*\}/);
    expect(updateBlock).not.toMatch(/return\s*\{\}\s*as\s*Admin/);
  });
});
