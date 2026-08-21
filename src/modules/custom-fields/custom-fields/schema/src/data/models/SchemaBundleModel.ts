/**
 * Schema Bundle Model (DTO)
 *
 * Wire shapes for `GET /v1/custom-fields/schema` (Wave 6 row 6.5), mirroring
 * `CustomFields.Application.DTOs.SchemaBundle` / `SchemaGroup` / `SchemaDefinition`
 * one-for-one. The service speaks these; the mapper converts to/from the
 * `SchemaBundle` entity.
 *
 * THERE ARE NO IDS ON THIS CONTRACT, AND THAT IS THE POINT
 * -------------------------------------------------------
 * Every identifier here is a NATURAL key: a definition is `(entityTypeKey, key)` and a group is
 * `(entityTypeKey, stableKey)`. The bundle exists to move a schema between environments, where a
 * Guid is per-environment and an encrypted id is per-environment AND unstable (AES-GCM takes a
 * fresh nonce per call, so the same id encrypts differently every time). Do not add an `id` field
 * here to "match" `CustomFieldJson` — a bundle carrying one would import as a pile of unrelated
 * new rows.
 *
 * KEY ORDER IN `toJson` IS LOAD-BEARING, NOT COSMETIC
 * --------------------------------------------------
 * The downloaded file is produced by `toJson` (see `useSchemaExportViewModel`), and the whole
 * selling point of the bundle is that two exports of the same schema are byte-identical and can be
 * diffed. `JSON.stringify` emits keys in insertion order, so each `toJson` below builds its literal
 * in the C# record's own declaration order. Re-sorting these object literals alphabetically would
 * produce a file that diffs as "everything changed" against one taken from another environment.
 *
 * WHY THESE MODEL CLASSES TAKE AN OBJECT AND NOT A POSITIONAL ARGUMENT LIST
 * ------------------------------------------------------------------------
 * `FieldGroupModel` and `CustomFieldModel` take positional constructors, and `FieldGroupModel`'s
 * own comment names the hazard that convention carries: a silent argument shift. It gets away with
 * it because every parameter up to `labelAr` is required, so TypeScript rejects a short call.
 * `SchemaDefinition` has nineteen members of which nine are nullable and adjacent — a positional
 * constructor there is nine same-typed `string | null` slots in a row, where transposing two
 * compiles clean and mislabels every exported field. So these constructors take one object, and
 * the property names carry the meaning.
 */
import type { CustomFieldValueTypeName } from "../../../../custom-field-value/src/data/models/CustomFieldValueModel";
import type { ValidatorKindName } from "../../../../custom-field/src/data/models/CustomFieldModel";

/** The only `FormatVersion` this client writes files for — `SchemaBundle.CurrentFormatVersion`. */
export const SUPPORTED_SCHEMA_FORMAT_VERSION = 1;

/**
 * `SchemaGroup` — a field group identified by `(EntityTypeKey, StableKey)`.
 *
 * Carries no `id`: see this file's header. `StableKey` is the reason
 * `FieldGroup.StableKey` had to exist before row 6.5 could ship at all.
 */
export interface SchemaGroupJson {
  entityTypeKey: string;
  stableKey: string;
  labelEn: string;
  labelAr: string | null;
  sortOrder: number;
  /**
   * True for a platform-owned group. Carried so an import into a platform context can recreate the
   * ownership, and so an import into a TENANT context can refuse rather than silently converting a
   * platform group into a tenant-owned one.
   */
  isGlobal: boolean;
}

/**
 * `SchemaDefinition` — a field definition identified by `(EntityTypeKey, Key)`.
 *
 * A superset of the schema-shaped half of `CustomFieldJson` and a subset of the rest: no id, no
 * timestamps, no tenant identifier, no stored values. The bundle describes SHAPE, and a tenant id
 * would make the file tenant-specific — the opposite of portable.
 */
export interface SchemaDefinitionJson {
  entityTypeKey: string;
  key: string;
  labelEn: string;
  labelAr: string | null;
  placeholderEn: string | null;
  placeholderAr: string | null;
  /** C# enum member name, e.g. `"Text"` — the API registers `JsonStringEnumConverter` globally. */
  valueType: CustomFieldValueTypeName;
  isRequired: boolean;
  isActive: boolean;
  sortOrder: number;
  /** Newline-separated, as stored. Positionally aligned with `optionsAr`. */
  options: string | null;
  optionsAr: string | null;
  validatorKind: ValidatorKindName | null;
  validatorParam: string | null;
  /**
   * `FieldSensitivity`'s member name: `"None" | "Internal" | "Confidential" | "Restricted"`.
   *
   * Typed as a plain `string` for the same reason `CustomFieldJson.sensitivity` is: an unrecognised
   * member from a newer backend must pass STRAIGHT THROUGH into the exported file. Narrowing this
   * to a union would not stop that at runtime, but it would invite a future `switch` that maps the
   * unknown value to a default and silently downgrades a Restricted field's classification on the
   * way out.
   */
  sensitivity: string;
  isExportable: boolean;
  /**
   * The group's `stableKey`, or null when ungrouped. A KEY, not an id.
   *
   * Null is also what a definition whose group has been SOFT-DELETED exports as — the `SetNull` FK
   * never fired, so the handler resolves the dangling id to null rather than failing the export.
   * A consumer therefore cannot read null as "the admin chose ungrouped".
   */
  groupStableKey: string | null;
  /** True for a platform-owned definition. Same reasoning as `SchemaGroupJson.isGlobal`. */
  isGlobal: boolean;
}

/** `SchemaBundle` — the whole response body. */
export interface SchemaBundleJson {
  /**
   * Bumped when the shape changes incompatibly. An importer that does not recognise the value must
   * REFUSE rather than guess. This client is an EXPORTER, so it passes an unfamiliar version
   * through verbatim and warns — see `SchemaBundle.isFormatSupported`.
   */
  formatVersion: number;
  /**
   * Present when the export was scoped to one entity type, null when it covers all of them.
   * Recorded so an importer can tell a partial bundle from a complete one and not read absent
   * entity types as deletions.
   */
  entityTypeKey: string | null;
  groups: SchemaGroupJson[];
  definitions: SchemaDefinitionJson[];
}

/**
 * A group inside a bundle, with `fromJson`/`toJson`.
 */
export class SchemaGroupModel {
  readonly entityTypeKey: string;
  readonly stableKey: string;
  readonly labelEn: string;
  readonly labelAr: string | null;
  readonly sortOrder: number;
  readonly isGlobal: boolean;

  constructor(fields: SchemaGroupJson) {
    this.entityTypeKey = fields.entityTypeKey;
    this.stableKey = fields.stableKey;
    this.labelEn = fields.labelEn;
    // `?? null` normalises an OMITTED key to an explicit null. Both spellings reach us -- the MVC
    // pipeline writes nulls, the source-generated context skips them -- and collapsing them here is
    // what stops one environment's export differing from another's by whitespace alone.
    this.labelAr = fields.labelAr ?? null;
    this.sortOrder = fields.sortOrder;
    this.isGlobal = fields.isGlobal;
  }

  /** Create a SchemaGroupModel from API JSON. */
  static fromJson(json: SchemaGroupJson): SchemaGroupModel {
    return new SchemaGroupModel(json);
  }

  /** Convert back to the API JSON shape, in `SchemaGroup`'s declaration order. */
  toJson(): SchemaGroupJson {
    return {
      entityTypeKey: this.entityTypeKey,
      stableKey: this.stableKey,
      labelEn: this.labelEn,
      labelAr: this.labelAr,
      sortOrder: this.sortOrder,
      isGlobal: this.isGlobal,
    };
  }
}

/**
 * A definition inside a bundle, with `fromJson`/`toJson`.
 */
export class SchemaDefinitionModel {
  readonly entityTypeKey: string;
  readonly key: string;
  readonly labelEn: string;
  readonly labelAr: string | null;
  readonly placeholderEn: string | null;
  readonly placeholderAr: string | null;
  readonly valueType: CustomFieldValueTypeName;
  readonly isRequired: boolean;
  readonly isActive: boolean;
  readonly sortOrder: number;
  readonly options: string | null;
  readonly optionsAr: string | null;
  readonly validatorKind: ValidatorKindName | null;
  readonly validatorParam: string | null;
  readonly sensitivity: string;
  readonly isExportable: boolean;
  readonly groupStableKey: string | null;
  readonly isGlobal: boolean;

  constructor(fields: SchemaDefinitionJson) {
    this.entityTypeKey = fields.entityTypeKey;
    this.key = fields.key;
    this.labelEn = fields.labelEn;
    this.labelAr = fields.labelAr ?? null;
    this.placeholderEn = fields.placeholderEn ?? null;
    this.placeholderAr = fields.placeholderAr ?? null;
    this.valueType = fields.valueType;
    this.isRequired = fields.isRequired;
    this.isActive = fields.isActive;
    this.sortOrder = fields.sortOrder;
    this.options = fields.options ?? null;
    this.optionsAr = fields.optionsAr ?? null;
    this.validatorKind = fields.validatorKind ?? null;
    this.validatorParam = fields.validatorParam ?? null;
    this.sensitivity = fields.sensitivity;
    this.isExportable = fields.isExportable;
    this.groupStableKey = fields.groupStableKey ?? null;
    this.isGlobal = fields.isGlobal;
  }

  /** Create a SchemaDefinitionModel from API JSON. */
  static fromJson(json: SchemaDefinitionJson): SchemaDefinitionModel {
    return new SchemaDefinitionModel(json);
  }

  /** Convert back to the API JSON shape, in `SchemaDefinition`'s declaration order. */
  toJson(): SchemaDefinitionJson {
    return {
      entityTypeKey: this.entityTypeKey,
      key: this.key,
      labelEn: this.labelEn,
      labelAr: this.labelAr,
      placeholderEn: this.placeholderEn,
      placeholderAr: this.placeholderAr,
      valueType: this.valueType,
      isRequired: this.isRequired,
      isActive: this.isActive,
      sortOrder: this.sortOrder,
      options: this.options,
      optionsAr: this.optionsAr,
      validatorKind: this.validatorKind,
      validatorParam: this.validatorParam,
      sensitivity: this.sensitivity,
      isExportable: this.isExportable,
      groupStableKey: this.groupStableKey,
      isGlobal: this.isGlobal,
    };
  }
}

/**
 * Schema Bundle Model class — wraps the response JSON with `fromJson`/`toJson`.
 */
export class SchemaBundleModel {
  readonly formatVersion: number;
  readonly entityTypeKey: string | null;
  readonly groups: SchemaGroupModel[];
  readonly definitions: SchemaDefinitionModel[];

  constructor(fields: {
    formatVersion: number;
    entityTypeKey: string | null;
    groups: SchemaGroupModel[];
    definitions: SchemaDefinitionModel[];
  }) {
    this.formatVersion = fields.formatVersion;
    this.entityTypeKey = fields.entityTypeKey;
    this.groups = fields.groups;
    this.definitions = fields.definitions;
  }

  /**
   * Create a SchemaBundleModel from API JSON.
   *
   * `?? []` on both collections guards a 204 or an otherwise empty body rather than letting `.map`
   * throw on undefined — the same guard `FieldGroupService` applies to its bare-array read. An
   * entity type with no groups and no fields is a legal answer, not a failure.
   */
  static fromJson(json: SchemaBundleJson): SchemaBundleModel {
    return new SchemaBundleModel({
      formatVersion: json.formatVersion,
      entityTypeKey: json.entityTypeKey ?? null,
      groups: (json.groups ?? []).map((group) => SchemaGroupModel.fromJson(group)),
      definitions: (json.definitions ?? []).map((definition) =>
        SchemaDefinitionModel.fromJson(definition)
      ),
    });
  }

  /** Convert back to the API JSON shape, in `SchemaBundle`'s declaration order. */
  toJson(): SchemaBundleJson {
    return {
      formatVersion: this.formatVersion,
      entityTypeKey: this.entityTypeKey,
      groups: this.groups.map((group) => group.toJson()),
      definitions: this.definitions.map((definition) => definition.toJson()),
    };
  }
}
