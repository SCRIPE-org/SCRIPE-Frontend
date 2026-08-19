// ═══════════════════════════════════════════════════════════════════════════
// FieldGroupService — wire-contract tests (Wave 5 row 5.2)
//
// FieldGroupsController is routed at /api/v1/custom-fields/field-groups, with
// `reorder` as a LITERAL sibling segment rather than a per-id verb, and the
// list read gated behind a required `entityTypeKey` query parameter. Every
// assertion below pins one of those against the real service, because a
// mis-shaped URL or body fails at runtime with a 404/400 that no type check
// catches.
// ═══════════════════════════════════════════════════════════════════════════

import { describe, it, expect, vi, beforeEach } from "vitest";
import { FieldGroupService } from "./FieldGroupService";
import type { IApiService } from "@core/interfaces/api.interface";
import type { FieldGroupJson } from "../models/FieldGroupModel";

const GROUP_JSON: FieldGroupJson = {
  id: "enc-group-1",
  entityTypeKey: "party.person",
  labelEn: "Contact details",
  labelAr: "بيانات الاتصال",
  sortOrder: 2,
  isGlobal: false,
};

function makeApi(getResult: unknown) {
  const api = {
    get: vi.fn().mockResolvedValue(getResult),
    post: vi.fn().mockResolvedValue({ id: "enc-new" }),
    put: vi.fn().mockResolvedValue(undefined),
    delete: vi.fn().mockResolvedValue(undefined),
  };
  return { api, service: new FieldGroupService(api as unknown as IApiService) };
}

describe("FieldGroupService", () => {
  let harness: ReturnType<typeof makeApi>;

  beforeEach(() => {
    harness = makeApi([GROUP_JSON]);
  });

  it("sends entityTypeKey as a query parameter on the list read", async () => {
    await harness.service.getByEntityType("party.person");

    expect(harness.api.get).toHaveBeenCalledTimes(1);
    const url = harness.api.get.mock.calls[0][0] as string;
    expect(url).toBe("/v1/custom-fields/field-groups?entityTypeKey=party.person");
  });

  it("URL-encodes an entity type key containing characters that are unsafe in a query string", async () => {
    await harness.service.getByEntityType("work.item type");

    const url = harness.api.get.mock.calls[0][0] as string;
    expect(url).toContain("entityTypeKey=work.item+type");
  });

  it("maps the bare array response into models — the endpoint has no PagedResult envelope", async () => {
    const models = await harness.service.getByEntityType("party.person");

    expect(models).toHaveLength(1);
    expect(models[0].id).toBe("enc-group-1");
    expect(models[0].labelAr).toBe("بيانات الاتصال");
    expect(models[0].sortOrder).toBe(2);
    expect(models[0].isGlobal).toBe(false);
  });

  it("survives an empty body instead of throwing on .map of undefined", async () => {
    // `undefined` is passed EXPLICITLY here (makeApi takes no default) — a
    // defaulted parameter would silently substitute the populated fixture and
    // this guard would assert nothing.
    const { service } = makeApi(undefined);

    await expect(service.getByEntityType("party.person")).resolves.toEqual([]);
  });

  it("posts a create to the collection route and returns the new id", async () => {
    const result = await harness.service.create({
      entityTypeKey: "party.person",
      labelEn: "Contact details",
      labelAr: null,
      sortOrder: 0,
      isGlobal: false,
    });

    expect(harness.api.post).toHaveBeenCalledWith("/v1/custom-fields/field-groups", {
      entityTypeKey: "party.person",
      labelEn: "Contact details",
      labelAr: null,
      sortOrder: 0,
      isGlobal: false,
    });
    expect(result.id).toBe("enc-new");
  });

  it("puts an update to the per-id route", async () => {
    await harness.service.update("enc-group-1", {
      labelEn: "Renamed",
      labelAr: null,
      sortOrder: 5,
    });

    expect(harness.api.put).toHaveBeenCalledWith("/v1/custom-fields/field-groups/enc-group-1", {
      labelEn: "Renamed",
      labelAr: null,
      sortOrder: 5,
    });
  });

  it("deletes via the per-id route", async () => {
    await harness.service.delete("enc-group-1");

    expect(harness.api.delete).toHaveBeenCalledWith("/v1/custom-fields/field-groups/enc-group-1");
  });

  it("puts a reorder to the literal /reorder sibling route, wrapping the set in { items }", async () => {
    await harness.service.reorder({
      items: [
        { id: "a", sortOrder: 0 },
        { id: "b", sortOrder: 1 },
      ],
    });

    expect(harness.api.put).toHaveBeenCalledWith("/v1/custom-fields/field-groups/reorder", {
      items: [
        { id: "a", sortOrder: 0 },
        { id: "b", sortOrder: 1 },
      ],
    });
    // Not /field-groups/{id}/reorder: the backend action is [HttpPut("reorder")]
    // on the controller, taking the whole set at once.
    const url = harness.api.put.mock.calls[0][0] as string;
    expect(url).not.toMatch(/field-groups\/[^/]+\/reorder$/);
  });
});
