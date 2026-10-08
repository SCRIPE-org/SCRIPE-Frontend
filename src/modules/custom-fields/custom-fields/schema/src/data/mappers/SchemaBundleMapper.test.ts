/**
 * SchemaBundleMapper — the full round trip (Wave 6 row 6.5)
 *
 * WHY THIS FILE IS THE MOST IMPORTANT TEST IN THE SUBMODULE
 * --------------------------------------------------------
 * The downloaded file IS `toModel(entity).toJson()` — see `downloadSchemaBundle`. So a property this
 * mapper drops is not a blank in the UI, it is a field MISSING FROM AN EXPORTED SCHEMA, and the loss
 * surfaces only when someone re-imports the bundle into another environment and finds their
 * validators, their Arabic labels or their grouping gone.
 *
 * That is not hypothetical: `CustomFieldMapper` shipped exactly this defect with `optionsAr` —
 * present on the model, the JSON shape and the entity, never mapped, so it came back undefined after
 * every round trip and the edit form then cleared the Arabic option labels on the next save.
 *
 * The fixture below therefore populates EVERY nullable field with a distinct non-null value. A
 * fixture full of nulls is the failure mode these tests exist to prevent: a dropped nullable property
 * reads as `null` on the way out and matches a `null` fixture exactly, so the test passes while the
 * export truncates. `everyFieldPopulated` also asserts the fixture's own completeness against the
 * key set, so adding a member to the contract without extending the fixture fails here rather than
 * silently going uncovered.
 */
import { describe, it, expect } from "vitest";
import { SchemaBundleMapper } from "./SchemaBundleMapper";
import {
  SchemaBundleModel,
  SUPPORTED_SCHEMA_FORMAT_VERSION,
  type SchemaBundleJson,
  type SchemaDefinitionJson,
  type SchemaGroupJson,
} from "../models/SchemaBundleModel";

/** A group with no null anywhere. */
const GROUP: SchemaGroupJson = {
  entityTypeKey: "party.person",
  stableKey: "contact_details",
  labelEn: "Contact details",
  labelAr: "بيانات الاتصال",
  sortOrder: 3,
  isGlobal: true,
};

/**
 * A definition with no null anywhere — every one of the nine nullable members carries a distinct
 * value, so a mapper that drops one produces `null` and fails rather than matching a null fixture.
 */
const DEFINITION: SchemaDefinitionJson = {
  entityTypeKey: "party.person",
  key: "jersey_size",
  labelEn: "Jersey size",
  labelAr: "مقاس القميص",
  placeholderEn: "e.g. Medium",
  placeholderAr: "مثال: وسط",
  valueType: "Select",
  isRequired: true,
  isActive: false,
  sortOrder: 7,
  options: "Small\nMedium\nLarge",
  optionsAr: "صغير\nوسط\nكبير",
  validatorKind: "OneOfList",
  validatorParam: "Small|Medium|Large",
  sensitivity: "Confidential",
  isExportable: false,
  groupStableKey: "contact_details",
  isGlobal: true,
  referenceTargetEntityTypeKey: "party.organization",
};

const BUNDLE: SchemaBundleJson = {
  formatVersion: SUPPORTED_SCHEMA_FORMAT_VERSION,
  entityTypeKey: "party.person",
  groups: [GROUP],
  definitions: [DEFINITION],
};

/** Every key of the object, so a fixture that forgets one is caught here and not by a reviewer. */
function keysOf(value: object): string[] {
  return Object.keys(value).sort();
}

describe("SchemaBundleMapper round trip", () => {
  it("returns byte-identical JSON after json -> entity -> json", () => {
    const roundTripped = SchemaBundleMapper.toModel(
      SchemaBundleMapper.fromJsonToEntity(BUNDLE)
    ).toJson();

    expect(roundTripped).toEqual(BUNDLE);
    // Not just deep-equal: key ORDER survives too. The bundle's selling point is that two exports of
    // the same schema are diffable, and `JSON.stringify` emits insertion order -- a mapper that
    // rebuilt the object with re-sorted keys would pass `toEqual` and make every file diff as
    // "everything changed".
    expect(JSON.stringify(roundTripped)).toBe(JSON.stringify(BUNDLE));
  });

  it("carries every definition field through, one assertion per field", () => {
    const [definition] = SchemaBundleMapper.fromJsonToEntity(BUNDLE).definitions;

    expect(definition.entityTypeKey).toBe("party.person");
    expect(definition.key).toBe("jersey_size");
    expect(definition.labelEn).toBe("Jersey size");
    expect(definition.labelAr).toBe("مقاس القميص");
    expect(definition.placeholderEn).toBe("e.g. Medium");
    expect(definition.placeholderAr).toBe("مثال: وسط");
    expect(definition.valueType).toBe("Select");
    expect(definition.isRequired).toBe(true);
    // Deliberately false in the fixture: a mapper that dropped it would leave `undefined`, and
    // `expect(undefined).toBe(false)` fails -- whereas a `true` fixture would pass against a
    // truthiness bug.
    expect(definition.isActive).toBe(false);
    expect(definition.sortOrder).toBe(7);
    expect(definition.options).toBe("Small\nMedium\nLarge");
    expect(definition.optionsAr).toBe("صغير\nوسط\nكبير");
    expect(definition.validatorKind).toBe("OneOfList");
    expect(definition.validatorParam).toBe("Small|Medium|Large");
    expect(definition.sensitivity).toBe("Confidential");
    expect(definition.isExportable).toBe(false);
    expect(definition.groupStableKey).toBe("contact_details");
    expect(definition.isGlobal).toBe(true);
    expect(definition.referenceTargetEntityTypeKey).toBe("party.organization");
  });

  it("carries every group field through, one assertion per field", () => {
    const [group] = SchemaBundleMapper.fromJsonToEntity(BUNDLE).groups;

    expect(group.entityTypeKey).toBe("party.person");
    expect(group.stableKey).toBe("contact_details");
    expect(group.labelEn).toBe("Contact details");
    expect(group.labelAr).toBe("بيانات الاتصال");
    expect(group.sortOrder).toBe(3);
    expect(group.isGlobal).toBe(true);
  });

  it("maps the same key set the wire shape declares, in both directions", () => {
    const entity = SchemaBundleMapper.fromJsonToEntity(BUNDLE);
    const emitted = SchemaBundleMapper.toModel(entity).toJson();

    expect(keysOf(emitted)).toEqual(keysOf(BUNDLE));
    expect(keysOf(emitted.definitions[0])).toEqual(keysOf(DEFINITION));
    expect(keysOf(emitted.groups[0])).toEqual(keysOf(GROUP));
    // The entity's data object must not be a lossy subset either -- it is what the export is
    // rebuilt FROM.
    expect(keysOf(entity.definitions[0])).toEqual(keysOf(DEFINITION));
    expect(keysOf(entity.groups[0])).toEqual(keysOf(GROUP));
  });

  it("keeps the fixture honest: no nullable field is left unexercised", () => {
    // Every value in the fixture is non-null, so a dropped property cannot masquerade as a null the
    // server never sent. If this fails, a member was added to the contract and the fixture above
    // needs a real value for it.
    for (const [key, value] of Object.entries(DEFINITION)) {
      expect(value, `definition.${key}`).not.toBeNull();
      expect(value, `definition.${key}`).not.toBeUndefined();
    }
    for (const [key, value] of Object.entries(GROUP)) {
      expect(value, `group.${key}`).not.toBeNull();
      expect(value, `group.${key}`).not.toBeUndefined();
    }
  });
});

describe("SchemaBundleMapper null and absence handling", () => {
  it("normalises an omitted nullable to an explicit null, so two environments' files match", () => {
    // The MVC pipeline writes nulls; the source-generated context skips them. Both spellings mean
    // the same thing, and collapsing them here is what stops one environment's export differing
    // from another's by whitespace alone.
    const withOmissions = {
      formatVersion: SUPPORTED_SCHEMA_FORMAT_VERSION,
      entityTypeKey: null,
      groups: [{ ...GROUP, labelAr: undefined }],
      definitions: [
        {
          ...DEFINITION,
          labelAr: undefined,
          placeholderEn: undefined,
          placeholderAr: undefined,
          options: undefined,
          optionsAr: undefined,
          validatorKind: undefined,
          validatorParam: undefined,
          groupStableKey: undefined,
          referenceTargetEntityTypeKey: undefined,
        },
      ],
    } as unknown as SchemaBundleJson;

    const emitted = SchemaBundleMapper.toModel(
      SchemaBundleMapper.fromJsonToEntity(withOmissions)
    ).toJson();

    expect(emitted.groups[0].labelAr).toBeNull();
    expect(emitted.definitions[0].labelAr).toBeNull();
    expect(emitted.definitions[0].placeholderEn).toBeNull();
    expect(emitted.definitions[0].placeholderAr).toBeNull();
    expect(emitted.definitions[0].options).toBeNull();
    expect(emitted.definitions[0].optionsAr).toBeNull();
    expect(emitted.definitions[0].validatorKind).toBeNull();
    expect(emitted.definitions[0].validatorParam).toBeNull();
    expect(emitted.definitions[0].groupStableKey).toBeNull();
    expect(emitted.definitions[0].referenceTargetEntityTypeKey).toBeNull();
    // Still serialisable with the nulls present, not dropped as undefined -- `JSON.stringify` omits
    // undefined properties entirely, which would silently shorten the file.
    expect(JSON.parse(JSON.stringify(emitted)).definitions[0]).toHaveProperty(
      "validatorKind",
      null
    );
  });

  it("survives a body with no groups and no definitions at all", () => {
    const bundle = SchemaBundleMapper.fromJsonToEntity({
      formatVersion: SUPPORTED_SCHEMA_FORMAT_VERSION,
      entityTypeKey: "party.person",
    } as unknown as SchemaBundleJson);

    expect(bundle.groups).toEqual([]);
    expect(bundle.definitions).toEqual([]);
    expect(bundle.isEmpty).toBe(true);
  });
});

describe("SchemaBundle entity behaviour", () => {
  it("names an unscoped file 'all' and a scoped file by its entity type, with no timestamp", () => {
    const scoped = SchemaBundleMapper.fromJsonToEntity(BUNDLE);
    const unscoped = SchemaBundleMapper.fromJsonToEntity({ ...BUNDLE, entityTypeKey: null });

    expect(scoped.suggestedFileName()).toBe("custom-field-schema.party.person.v1.json");
    expect(unscoped.suggestedFileName()).toBe("custom-field-schema.all.v1.json");
    // Deterministic: the bundle exists to be diffed, so the same schema must produce the same
    // filename on every export rather than piling up clock-stamped copies.
    expect(scoped.suggestedFileName()).toBe(
      SchemaBundleMapper.fromJsonToEntity(BUNDLE).suggestedFileName()
    );
    expect(scoped.isScoped).toBe(true);
    expect(unscoped.isScoped).toBe(false);
  });

  it("flags a format version this client does not know, without refusing the bundle", () => {
    const future = SchemaBundleMapper.fromJsonToEntity({ ...BUNDLE, formatVersion: 99 });

    expect(future.isFormatSupported).toBe(false);
    // Still fully readable and still exportable -- an exporter only moves bytes. Refusing here would
    // withhold a perfectly good file.
    expect(future.definitionCount).toBe(1);
    expect(future.suggestedFileName()).toBe("custom-field-schema.party.person.v99.json");
    expect(SchemaBundleMapper.fromJsonToEntity(BUNDLE).isFormatSupported).toBe(true);
  });

  it("counts what is in the bundle", () => {
    const bundle = SchemaBundleMapper.toEntity(
      SchemaBundleModel.fromJson({ ...BUNDLE, definitions: [DEFINITION, DEFINITION] })
    );

    expect(bundle.definitionCount).toBe(2);
    expect(bundle.groupCount).toBe(1);
    expect(bundle.isEmpty).toBe(false);
  });
});
