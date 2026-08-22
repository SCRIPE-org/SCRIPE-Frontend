// ═══════════════════════════════════════════════════════════════════════════
// OptionSetService — wire-contract tests (P-4)
//
// OptionSetsController is routed at /api/v1/custom-fields/option-sets and has a shape no type check
// can protect: `versions/{versionId}` and `bindings/{fieldVersionId}` are LITERAL-prefixed siblings
// of `{id}`, one route is nested under the set (`{id}/versions`) while the other three version routes
// are flat, and three different verbs share the bindings path. Every assertion below pins one of
// those against the real service, because a mis-shaped URL or body fails at runtime with a 404/400
// that tsc never sees.
//
// The URL assertions use toBe rather than toContain wherever a whole path is known, so a route that
// gains an extra segment fails instead of still "containing" the old one.
// ═══════════════════════════════════════════════════════════════════════════

import { describe, it, expect, vi, beforeEach } from "vitest";
import { OptionSetService } from "./OptionSetService";
import type { IApiService } from "@core/interfaces/api.interface";
import type {
  OptionSetJson,
  OptionSetDetailJson,
  OptionSetVersionJson,
  OptionSetBindingResultJson,
} from "../models/OptionSetModel";

const SET_JSON: OptionSetJson = {
  id: "enc-set-1",
  stableKey: "age_groups",
  labelEn: "Age groups",
  labelAr: "الفئات العمرية",
  description: "Squad age bands",
  isSystemManaged: false,
  isPlatformOwned: false,
  versionCount: 3,
  publishedVersionId: "enc-ver-2",
  publishedVersionNumber: 2,
};

const DETAIL_JSON: OptionSetDetailJson = {
  set: SET_JSON,
  // Newest first, as the server sends it.
  versions: [
    { id: "enc-ver-3", versionNumber: 3, status: "Draft", publishedAtUtc: null, itemCount: 4 },
    {
      id: "enc-ver-2",
      versionNumber: 2,
      status: "Published",
      publishedAtUtc: "2026-08-01T09:00:00Z",
      itemCount: 3,
    },
  ],
};

const VERSION_JSON: OptionSetVersionJson = {
  id: "enc-ver-2",
  optionSetId: "enc-set-1",
  versionNumber: 2,
  status: "Published",
  publishedAtUtc: "2026-08-01T09:00:00Z",
  items: [
    {
      id: "enc-item-1",
      key: "u18",
      labelEn: "Under 18",
      labelAr: "تحت 18",
      color: "#0af",
      iconKey: "shield",
      sortOrder: 0,
      status: "Active",
    },
    {
      id: "enc-item-2",
      key: "u21",
      labelEn: "Under 21",
      labelAr: null,
      color: null,
      iconKey: null,
      sortOrder: 1,
      status: "Deactivated",
    },
  ],
};

const BINDING_JSON: OptionSetBindingResultJson = {
  inserted: 2,
  updated: 1,
  deactivated: 3,
  untouched: 4,
  preservedLocalOptions: 5,
};

/**
 * The api double. Every verb resolves a value the corresponding call actually needs, so a test only
 * has to override the one it is about.
 */
function makeApi(getResult: unknown) {
  const api = {
    get: vi.fn().mockResolvedValue(getResult),
    post: vi.fn().mockResolvedValue({ id: "enc-new" }),
    put: vi.fn().mockResolvedValue(undefined),
    delete: vi.fn().mockResolvedValue(BINDING_JSON),
  };
  return { api, service: new OptionSetService(api as unknown as IApiService) };
}

describe("OptionSetService", () => {
  let harness: ReturnType<typeof makeApi>;

  beforeEach(() => {
    harness = makeApi([SET_JSON]);
  });

  describe("reads", () => {
    it("lists from the collection route with NO query string — this endpoint has no parameters", async () => {
      await harness.service.getAll();

      expect(harness.api.get).toHaveBeenCalledTimes(1);
      const url = harness.api.get.mock.calls[0][0] as string;
      expect(url).toBe("/v1/custom-fields/option-sets");
      // Pinned explicitly: the closest analogue (FieldGroupService) REQUIRES a query parameter, so
      // "copy field-group" is a live route to accidentally adding one here.
      expect(url).not.toContain("?");
    });

    it("maps the bare array response into models — there is no PagedResult envelope", async () => {
      const models = await harness.service.getAll();

      expect(models).toHaveLength(1);
      expect(models[0].id).toBe("enc-set-1");
      expect(models[0].stableKey).toBe("age_groups");
      expect(models[0].publishedVersionNumber).toBe(2);
      expect(models[0].isSystemManaged).toBe(false);
    });

    it("survives an empty list body instead of throwing on .map of undefined", async () => {
      // `undefined` is passed EXPLICITLY (makeApi takes no default) — a defaulted parameter would
      // substitute the populated fixture and this guard would assert nothing.
      const { service } = makeApi(undefined);

      await expect(service.getAll()).resolves.toEqual([]);
    });

    it("reads one set from the per-id route and keeps the server's newest-first version order", async () => {
      const { api, service } = makeApi(DETAIL_JSON);

      const detail = await service.getById("enc-set-1");

      expect(api.get).toHaveBeenCalledWith("/v1/custom-fields/option-sets/enc-set-1");
      expect(detail.set.stableKey).toBe("age_groups");
      expect(detail.versions.map((v) => v.versionNumber)).toEqual([3, 2]);
      expect(detail.versions[0].status).toBe("Draft");
    });

    it("reads one version from the LITERAL versions/ route, not from under the set id", async () => {
      const { api, service } = makeApi(VERSION_JSON);

      const version = await service.getVersion("enc-ver-2");

      expect(api.get).toHaveBeenCalledWith("/v1/custom-fields/option-sets/versions/enc-ver-2");
      // The route is a sibling of `{id}`, not a child of it. A URL of the shape
      // option-sets/{setId}/versions/{versionId} would 404.
      const url = api.get.mock.calls[0][0] as string;
      expect(url).not.toMatch(/option-sets\/[^/]+\/versions\/[^/]+$/);
      expect(version.optionSetId).toBe("enc-set-1");
      expect(version.items).toHaveLength(2);
      expect(version.items[1].status).toBe("Deactivated");
    });
  });

  describe("set writes", () => {
    it("posts a create to the collection route and returns the new id", async () => {
      const result = await harness.service.create({
        stableKey: "age_groups",
        labelEn: "Age groups",
        labelAr: null,
        description: null,
        isGlobal: false,
      });

      expect(harness.api.post).toHaveBeenCalledWith("/v1/custom-fields/option-sets", {
        stableKey: "age_groups",
        labelEn: "Age groups",
        labelAr: null,
        description: null,
        isGlobal: false,
      });
      expect(result.id).toBe("enc-new");
    });

    it("puts an update to the per-id route carrying only display metadata", async () => {
      await harness.service.update("enc-set-1", {
        labelEn: "Renamed",
        labelAr: null,
        description: "Note",
      });

      expect(harness.api.put).toHaveBeenCalledWith("/v1/custom-fields/option-sets/enc-set-1", {
        labelEn: "Renamed",
        labelAr: null,
        description: "Note",
      });
      // stableKey and isGlobal are immutable; UpdateOptionSetRequest has no property for either.
      const body = harness.api.put.mock.calls[0][1] as Record<string, unknown>;
      expect(body).not.toHaveProperty("stableKey");
      expect(body).not.toHaveProperty("isGlobal");
    });

    it("deletes via the per-id route", async () => {
      await harness.service.delete("enc-set-1");

      expect(harness.api.delete).toHaveBeenCalledWith("/v1/custom-fields/option-sets/enc-set-1");
    });
  });

  describe("version writes", () => {
    const ITEMS = {
      items: [
        {
          key: "u18",
          labelEn: "Under 18",
          labelAr: null,
          color: null,
          iconKey: null,
          sortOrder: 0,
          status: "Active" as const,
        },
      ],
    };

    it("posts a new version NESTED under the set id — the one nested route on this controller", async () => {
      const result = await harness.service.createVersion("enc-set-1", ITEMS);

      expect(harness.api.post).toHaveBeenCalledWith(
        "/v1/custom-fields/option-sets/enc-set-1/versions",
        ITEMS
      );
      expect(result.id).toBe("enc-new");
    });

    it("puts a draft item replace to the FLAT versions/ route, keyed by the version id alone", async () => {
      await harness.service.updateVersion("enc-ver-3", ITEMS);

      expect(harness.api.put).toHaveBeenCalledWith(
        "/v1/custom-fields/option-sets/versions/enc-ver-3",
        ITEMS
      );
    });

    it("posts a publish to versions/{id}/publish with NO body", async () => {
      await harness.service.publishVersion("enc-ver-3");

      expect(harness.api.post).toHaveBeenCalledWith(
        "/v1/custom-fields/option-sets/versions/enc-ver-3/publish"
      );
      // Asserted as a whole-call match above AND as an arity check here: passing a body would be
      // harmless to the server but would signal that publish takes a choice, which it does not.
      expect(harness.api.post.mock.calls[0]).toHaveLength(1);
    });
  });

  describe("bindings", () => {
    it("posts a first-time bind to bindings/{fieldVersionId} and maps the receipt", async () => {
      const { api, service } = makeApi(undefined);
      api.post.mockResolvedValue(BINDING_JSON);

      const outcome = await service.bind("enc-fv-1", { optionSetVersionId: "enc-ver-2" });

      expect(api.post).toHaveBeenCalledWith("/v1/custom-fields/option-sets/bindings/enc-fv-1", {
        optionSetVersionId: "enc-ver-2",
      });
      expect(outcome.inserted).toBe(2);
      expect(outcome.deactivated).toBe(3);
      expect(outcome.preservedLocalOptions).toBe(5);
    });

    it("puts a rebind to the SAME path as bind — the verb is the whole difference", async () => {
      const { api, service } = makeApi(undefined);
      api.put.mockResolvedValue(BINDING_JSON);

      const outcome = await service.rebind("enc-fv-1", { optionSetVersionId: "enc-ver-3" });

      expect(api.put).toHaveBeenCalledWith("/v1/custom-fields/option-sets/bindings/enc-fv-1", {
        optionSetVersionId: "enc-ver-3",
      });
      expect(outcome.updated).toBe(1);
    });

    it("deletes an unbind and still maps a RESPONSE BODY — this DELETE is not a 204", async () => {
      const outcome = await harness.service.unbind("enc-fv-1");

      expect(harness.api.delete).toHaveBeenCalledWith(
        "/v1/custom-fields/option-sets/bindings/enc-fv-1"
      );
      // Distinct values per field in the fixture, so a mapper that transposed two of them fails.
      expect(outcome.untouched).toBe(4);
      expect(outcome.preservedLocalOptions).toBe(5);
    });

    it("keys every binding call by the FIELD version, never by the option-set version", async () => {
      const { api, service } = makeApi(undefined);
      api.post.mockResolvedValue(BINDING_JSON);

      await service.bind("enc-fv-1", { optionSetVersionId: "enc-ver-2" });

      // The set version travels in the BODY and the field version in the PATH. Swapping them would
      // bind the wrong record and, with encrypted ids, would look plausible in a log.
      const url = api.post.mock.calls[0][0] as string;
      expect(url).toContain("enc-fv-1");
      expect(url).not.toContain("enc-ver-2");
    });
  });
});
