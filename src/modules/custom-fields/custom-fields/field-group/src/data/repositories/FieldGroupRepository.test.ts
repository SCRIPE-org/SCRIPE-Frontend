/**
 * FieldGroupRepository — mapping and request narrowing (Wave 5 row 5.2)
 *
 * The update narrowing is defence in depth, and it needs its own guard because
 * the view already happens to build a three-field object: a repository that
 * blindly spread its input would look correct in every view-level test and
 * still forward an immutable property the day someone widens the input type.
 * `EntityTypeKey` and tenant scope are immutable after creation, and
 * `UpdateFieldGroupRequest` declares neither.
 */
import { describe, it, expect, vi } from "vitest";
import { FieldGroupRepository } from "./FieldGroupRepository";
import type { IFieldGroupService } from "../../domain/interfaces/IFieldGroupService";
import type { UpdateFieldGroupInput } from "../../domain/interfaces/IFieldGroupRepository";
import { FieldGroupModel } from "../models/FieldGroupModel";

function makeService(overrides: Partial<IFieldGroupService> = {}) {
  return {
    getByEntityType: vi.fn().mockResolvedValue([]),
    create: vi.fn().mockResolvedValue({ id: "enc-new" }),
    update: vi.fn().mockResolvedValue(undefined),
    delete: vi.fn().mockResolvedValue(undefined),
    reorder: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  } as IFieldGroupService & Record<string, ReturnType<typeof vi.fn>>;
}

describe("FieldGroupRepository", () => {
  it("maps service models into domain entities", async () => {
    const service = makeService({
      getByEntityType: vi
        .fn()
        .mockResolvedValue([
          new FieldGroupModel("enc-1", "party.person", "stable_party.person", "Contact", 2, false, "اتصال"),
        ]),
    });

    const groups = await new FieldGroupRepository(service).getByEntityType("party.person");

    expect(groups).toHaveLength(1);
    expect(groups[0].id).toBe("enc-1");
    // A real entity, not a passthrough of the model — displayLabel only exists
    // on the entity.
    expect(groups[0].displayLabel("ar")).toBe("اتصال");
    expect(groups[0].displayLabel("en")).toBe("Contact");
  });

  it("falls back to the English label when Arabic was never filled in", async () => {
    const service = makeService({
      getByEntityType: vi
        .fn()
        .mockResolvedValue([new FieldGroupModel("enc-1", "party.person", "stable_party.person", "Contact", 0, false, null)]),
    });

    const [group] = await new FieldGroupRepository(service).getByEntityType("party.person");

    expect(group.displayLabel("ar")).toBe("Contact");
  });

  it("forwards ONLY labelEn/labelAr/sortOrder on update, dropping anything else it is handed", async () => {
    const service = makeService();
    // The cast is the point: it simulates a future widening of the input type
    // (or a caller reusing a fuller object) and proves the repository still
    // narrows to the three properties UpdateFieldGroupRequest declares.
    const contaminated = {
      labelEn: "Renamed",
      labelAr: null,
      sortOrder: 1,
      entityTypeKey: "party.person",
      stableKey: "contact",
      isGlobal: true,
      id: "enc-1",
    } as unknown as UpdateFieldGroupInput;

    await new FieldGroupRepository(service).update("enc-1", contaminated);

    expect(service.update).toHaveBeenCalledWith("enc-1", {
      labelEn: "Renamed",
      labelAr: null,
      sortOrder: 1,
    });
  });

  it("normalizes an absent Arabic label to an explicit null on both writes", async () => {
    const service = makeService();
    const repository = new FieldGroupRepository(service);

    await repository.create({
      entityTypeKey: "party.person",
      stableKey: "contact",
      labelEn: "Contact",
      sortOrder: 0,
      isGlobal: false,
    });
    await repository.update("enc-1", { labelEn: "Contact", sortOrder: 0 });

    expect((service.create as ReturnType<typeof vi.fn>).mock.calls[0][0].labelAr).toBeNull();
    expect((service.update as ReturnType<typeof vi.fn>).mock.calls[0][1].labelAr).toBeNull();
  });

  it("wraps the reorder set in the { items } envelope the request declares", async () => {
    const service = makeService();

    await new FieldGroupRepository(service).reorder([{ id: "a", sortOrder: 0 }]);

    expect(service.reorder).toHaveBeenCalledWith({ items: [{ id: "a", sortOrder: 0 }] });
  });
});
