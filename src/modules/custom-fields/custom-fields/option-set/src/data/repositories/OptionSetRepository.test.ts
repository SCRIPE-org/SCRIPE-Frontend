/**
 * OptionSetRepository — mapping, request narrowing and the Deleted-status tripwire (P-4)
 *
 * Three classes of behaviour are pinned here, and none of them is visible from a view-level test:
 *
 *  1. Models become real ENTITIES, with the derived predicates the UI reasons about. A repository
 *     that passed models through would satisfy every "the label rendered" assertion and still leave
 *     `isContentEditable` undefined, which reads as false and silently hides every Edit button.
 *
 *  2. `update` narrows to the three properties `UpdateOptionSetRequest` declares. The view already
 *     happens to build exactly that object, so a repository that spread its input would look correct
 *     everywhere until someone widened the input type.
 *
 *  3. A `Deleted` item status throws instead of being sent. The type system already forbids it, so
 *     this test has to CAST to reach the guard — which is precisely the shape of the mistake it
 *     exists to stop.
 */
import { describe, it, expect, vi } from "vitest";
import { OptionSetRepository } from "./OptionSetRepository";
import type { IOptionSetService } from "../../domain/interfaces/IOptionSetService";
import type {
  UpdateOptionSetInput,
  OptionSetItemInput,
} from "../../domain/interfaces/IOptionSetRepository";
import {
  OptionSetModel,
  OptionSetDetailModel,
  OptionSetVersionModel,
  OptionSetVersionSummaryModel,
  OptionSetItemModel,
  OptionSetBindingResultModel,
} from "../models/OptionSetModel";

function makeSetModel(overrides: Partial<ConstructorParameters<typeof OptionSetModel>[0]> = {}) {
  return new OptionSetModel({
    id: "enc-set-1",
    stableKey: "age_groups",
    labelEn: "Age groups",
    labelAr: "الفئات العمرية",
    description: "Squad age bands",
    isSystemManaged: false,
    isPlatformOwned: false,
    versionCount: 2,
    publishedVersionId: "enc-ver-1",
    publishedVersionNumber: 1,
    ...overrides,
  });
}

function makeService(overrides: Partial<IOptionSetService> = {}) {
  return {
    getAll: vi.fn().mockResolvedValue([]),
    getById: vi.fn().mockResolvedValue(
      new OptionSetDetailModel({ set: makeSetModel(), versions: [] })
    ),
    getVersion: vi.fn().mockResolvedValue(
      new OptionSetVersionModel({
        id: "enc-ver-1",
        optionSetId: "enc-set-1",
        versionNumber: 1,
        status: "Draft",
        publishedAtUtc: null,
        items: [],
      })
    ),
    create: vi.fn().mockResolvedValue({ id: "enc-new" }),
    update: vi.fn().mockResolvedValue(undefined),
    delete: vi.fn().mockResolvedValue(undefined),
    createVersion: vi.fn().mockResolvedValue({ id: "enc-new-ver" }),
    updateVersion: vi.fn().mockResolvedValue(undefined),
    publishVersion: vi.fn().mockResolvedValue(undefined),
    bind: vi.fn().mockResolvedValue(
      new OptionSetBindingResultModel({
        inserted: 1,
        updated: 2,
        deactivated: 3,
        untouched: 4,
        preservedLocalOptions: 5,
      })
    ),
    rebind: vi.fn().mockResolvedValue(
      new OptionSetBindingResultModel({
        inserted: 0,
        updated: 1,
        deactivated: 2,
        untouched: 0,
        preservedLocalOptions: 1,
      })
    ),
    unbind: vi.fn().mockResolvedValue(
      new OptionSetBindingResultModel({
        inserted: 0,
        updated: 0,
        deactivated: 0,
        untouched: 7,
        preservedLocalOptions: 2,
      })
    ),
    ...overrides,
  } as IOptionSetService & Record<string, ReturnType<typeof vi.fn>>;
}

const ITEM: OptionSetItemInput = {
  key: "u18",
  labelEn: "Under 18",
  sortOrder: 0,
  status: "Active",
};

describe("OptionSetRepository", () => {
  describe("reads produce entities, not passthrough models", () => {
    it("maps list models into OptionSet entities with their derived predicates", async () => {
      const service = makeService({ getAll: vi.fn().mockResolvedValue([makeSetModel()]) });

      const sets = await new OptionSetRepository(service).getAll();

      expect(sets).toHaveLength(1);
      expect(sets[0].id).toBe("enc-set-1");
      // displayLabel and the predicates only exist on the entity.
      expect(sets[0].displayLabel("ar")).toBe("الفئات العمرية");
      expect(sets[0].displayLabel("en")).toBe("Age groups");
      expect(sets[0].isContentEditable).toBe(true);
      expect(sets[0].hasPublishedVersion).toBe(true);
      expect(sets[0].isBindable).toBe(true);
    });

    it("marks a system-managed set uneditable while leaving it bindable", async () => {
      const service = makeService({
        getAll: vi.fn().mockResolvedValue([makeSetModel({ isSystemManaged: true, isPlatformOwned: true })]),
      });

      const [set] = await new OptionSetRepository(service).getAll();

      expect(set.isContentEditable).toBe(false);
      expect(set.isPlatformMaintained).toBe(true);
      // The whole point of the seeded ISO lists: read-only AND fully bindable. A single "editable"
      // flag covering both would make an uneditable country list unusable.
      expect(set.isBindable).toBe(true);
    });

    it("falls back to the English label when Arabic was never filled in", async () => {
      const service = makeService({
        getAll: vi.fn().mockResolvedValue([makeSetModel({ labelAr: null })]),
      });

      const [set] = await new OptionSetRepository(service).getAll();

      expect(set.displayLabel("ar")).toBe("Age groups");
    });

    it("reports a set with no published version as unbindable rather than broken", async () => {
      const service = makeService({
        getAll: vi.fn().mockResolvedValue([
          makeSetModel({ publishedVersionId: null, publishedVersionNumber: null, versionCount: 1 }),
        ]),
      });

      const [set] = await new OptionSetRepository(service).getAll();

      expect(set.hasPublishedVersion).toBe(false);
      expect(set.isBindable).toBe(false);
      expect(set.hasNoVersions).toBe(false);
    });

    it("maps detail versions as SUMMARY rows whose items are NOT LOADED", async () => {
      const service = makeService({
        getById: vi.fn().mockResolvedValue(
          new OptionSetDetailModel({
            set: makeSetModel(),
            versions: [
              new OptionSetVersionSummaryModel({
                id: "enc-ver-2",
                versionNumber: 2,
                status: "Draft",
                publishedAtUtc: null,
                itemCount: 6,
              }),
            ],
          })
        ),
      });

      const detail = await new OptionSetRepository(service).getById("enc-set-1");

      const [version] = detail.versions;
      // The distinction that stops a draft editor from saving an empty replace: unloaded, not empty.
      expect(version.hasLoadedItems).toBe(false);
      expect(version.items).toEqual([]);
      expect(version.itemCount).toBe(6);
      // Absent from the summary wire shape, so null rather than a guessed parent id.
      expect(version.optionSetId).toBeNull();
      expect(version.isEditable).toBe(true);
      expect(version.canPublish).toBe(true);
      expect(version.isBindable).toBe(false);
    });

    it("maps a full version with items loaded, deriving itemCount from the list", async () => {
      const service = makeService({
        getVersion: vi.fn().mockResolvedValue(
          new OptionSetVersionModel({
            id: "enc-ver-1",
            optionSetId: "enc-set-1",
            versionNumber: 1,
            status: "Published",
            publishedAtUtc: "2026-08-01T09:00:00Z",
            items: [
              new OptionSetItemModel({
                id: "enc-item-1",
                key: "u18",
                labelEn: "Under 18",
                labelAr: "تحت 18",
                color: "#0af",
                iconKey: "shield",
                sortOrder: 0,
                status: "Active",
              }),
              new OptionSetItemModel({
                id: "enc-item-2",
                key: "u21",
                labelEn: "Under 21",
                labelAr: null,
                color: null,
                iconKey: null,
                sortOrder: 1,
                status: "Deactivated",
              }),
            ],
          })
        ),
      });

      const version = await new OptionSetRepository(service).getVersion("enc-ver-1");

      expect(version.hasLoadedItems).toBe(true);
      expect(version.itemCount).toBe(2);
      expect(version.optionSetId).toBe("enc-set-1");
      // Published: bindable, and NOT editable — editing it would retroactively change what stored
      // values mean.
      expect(version.isBindable).toBe(true);
      expect(version.isEditable).toBe(false);
      expect(version.canPublish).toBe(false);
      // A withdrawn option still exists on the version; it is only absent from what a picker offers.
      expect(version.items).toHaveLength(2);
      expect(version.offeredItems.map((item) => item.key)).toEqual(["u18"]);
      expect(version.items[1].isWithdrawn).toBe(true);
      expect(version.items[0].displayLabel("ar")).toBe("تحت 18");
      expect(version.items[1].displayLabel("ar")).toBe("Under 21");
    });
  });

  describe("set writes", () => {
    it("forwards ONLY labelEn/labelAr/description on update, dropping anything else it is handed", async () => {
      const service = makeService();
      // The cast is the point: it simulates a future widening of the input type (or a caller reusing a
      // fuller object) and proves the repository still narrows to the three properties
      // UpdateOptionSetRequest declares.
      const contaminated = {
        labelEn: "Renamed",
        labelAr: null,
        description: "Note",
        stableKey: "renamed_key",
        isGlobal: true,
        id: "enc-set-1",
      } as unknown as UpdateOptionSetInput;

      await new OptionSetRepository(service).update("enc-set-1", contaminated);

      expect(service.update).toHaveBeenCalledWith("enc-set-1", {
        labelEn: "Renamed",
        labelAr: null,
        description: "Note",
      });
    });

    it("normalizes absent optional strings to explicit nulls on create and update", async () => {
      const service = makeService();
      const repository = new OptionSetRepository(service);

      await repository.create({ stableKey: "age_groups", labelEn: "Age groups", isGlobal: false });
      await repository.update("enc-set-1", { labelEn: "Age groups" });

      const created = (service.create as ReturnType<typeof vi.fn>).mock.calls[0][0] as Record<
        string,
        unknown
      >;
      expect(created.labelAr).toBeNull();
      expect(created.description).toBeNull();
      const updated = (service.update as ReturnType<typeof vi.fn>).mock.calls[0][1] as Record<
        string,
        unknown
      >;
      expect(updated.labelAr).toBeNull();
      expect(updated.description).toBeNull();
    });

    it("returns the created set's id rather than the whole response envelope", async () => {
      const service = makeService();

      const id = await new OptionSetRepository(service).create({
        stableKey: "age_groups",
        labelEn: "Age groups",
        isGlobal: false,
      });

      expect(id).toBe("enc-new");
    });
  });

  describe("version writes", () => {
    it("wraps the item list in the { items } envelope on both version write paths", async () => {
      const service = makeService();
      const repository = new OptionSetRepository(service);

      await repository.createVersion("enc-set-1", [ITEM]);
      await repository.updateVersion("enc-ver-2", [ITEM]);

      expect(service.createVersion).toHaveBeenCalledWith("enc-set-1", {
        items: [
          {
            key: "u18",
            labelEn: "Under 18",
            labelAr: null,
            color: null,
            iconKey: null,
            sortOrder: 0,
            status: "Active",
          },
        ],
      });
      expect(service.updateVersion).toHaveBeenCalledWith("enc-ver-2", {
        items: [
          {
            key: "u18",
            labelEn: "Under 18",
            labelAr: null,
            color: null,
            iconKey: null,
            sortOrder: 0,
            status: "Active",
          },
        ],
      });
    });

    it("returns the created version's id", async () => {
      const service = makeService();

      const id = await new OptionSetRepository(service).createVersion("enc-set-1", [ITEM]);

      expect(id).toBe("enc-new-ver");
    });

    it("sends a Deactivated status through untouched — withdrawal is a legitimate write", async () => {
      const service = makeService();

      await new OptionSetRepository(service).updateVersion("enc-ver-2", [
        { ...ITEM, status: "Deactivated" },
      ]);

      const body = (service.updateVersion as ReturnType<typeof vi.fn>).mock.calls[0][1] as {
        items: { status: string }[];
      };
      expect(body.items[0].status).toBe("Deactivated");
    });

    it("REFUSES a Deleted item status on create-version, naming the offending key", async () => {
      const service = makeService();
      // Cast required, because OptionSetItemInput excludes "Deleted" at the type level. This is the
      // runtime half of the guard — the case that arrives through a cast or from parsed JSON.
      const deleted = { ...ITEM, status: "Deleted" } as unknown as OptionSetItemInput;

      await expect(
        new OptionSetRepository(service).createVersion("enc-set-1", [deleted])
      ).rejects.toThrow(/u18/);
      // Nothing was sent: the refusal must happen BEFORE the request, or the option row is already
      // soft-deleted with no remap decision taken.
      expect(service.createVersion).not.toHaveBeenCalled();
    });

    it("REFUSES a Deleted item status on update-version too", async () => {
      const service = makeService();
      const deleted = { ...ITEM, status: "Deleted" } as unknown as OptionSetItemInput;

      await expect(
        new OptionSetRepository(service).updateVersion("enc-ver-2", [ITEM, deleted])
      ).rejects.toThrow(/Deleted/);
      expect(service.updateVersion).not.toHaveBeenCalled();
    });

    it("passes a publish straight through — there is nothing to shape about it", async () => {
      const service = makeService();

      await new OptionSetRepository(service).publishVersion("enc-ver-2");

      expect(service.publishVersion).toHaveBeenCalledWith("enc-ver-2");
    });
  });

  describe("bindings", () => {
    it("puts the option-set version id in the BODY and the field version id in the path argument", async () => {
      const service = makeService();

      await new OptionSetRepository(service).bind("enc-fv-1", "enc-ver-1");

      expect(service.bind).toHaveBeenCalledWith("enc-fv-1", { optionSetVersionId: "enc-ver-1" });
    });

    it("maps the bind receipt to a plain outcome, not the DTO class", async () => {
      const service = makeService();

      const outcome = await new OptionSetRepository(service).bind("enc-fv-1", "enc-ver-1");

      // Distinct values per field, so a transposed mapping fails rather than matching by luck.
      expect(outcome).toEqual({
        inserted: 1,
        updated: 2,
        deactivated: 3,
        untouched: 4,
        preservedLocalOptions: 5,
      });
      expect(outcome).not.toBeInstanceOf(OptionSetBindingResultModel);
    });

    it("routes a rebind to rebind, never to bind — the two refuse each other's preconditions", async () => {
      const service = makeService();

      const outcome = await new OptionSetRepository(service).rebind("enc-fv-1", "enc-ver-2");

      expect(service.rebind).toHaveBeenCalledWith("enc-fv-1", { optionSetVersionId: "enc-ver-2" });
      expect(service.bind).not.toHaveBeenCalled();
      // The count that matters on a rebind: options a tenant was offering a moment ago.
      expect(outcome.deactivated).toBe(2);
    });

    it("maps an unbind receipt, which reports what it LEFT rather than what it changed", async () => {
      const service = makeService();

      const outcome = await new OptionSetRepository(service).unbind("enc-fv-1");

      expect(service.unbind).toHaveBeenCalledWith("enc-fv-1");
      expect(outcome.deactivated).toBe(0);
      expect(outcome.untouched).toBe(7);
      expect(outcome.preservedLocalOptions).toBe(2);
    });
  });
});
