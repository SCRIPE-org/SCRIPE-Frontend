/**
 * SchemaBundle Entity
 *
 * Domain entity for a portable custom-field schema (Wave 6 row 6.5) — the point-in-time snapshot
 * `GET /v1/custom-fields/schema` produces, ready to be written to a file and re-imported somewhere
 * else.
 *
 * READ-ONLY BY NATURE. There is no write path: nothing in this product imports a bundle yet, and
 * the export endpoint is a query. So this entity carries no mutators and the repository exposes no
 * save — see `ISchemaExportRepository`.
 *
 * WHAT IS DELIBERATELY ABSENT, restated here because a future contributor will want to add it:
 * no ids, no timestamps, no actor names, no tenant identifiers, no stored values. Two exports of
 * the same schema must be byte-identical so they can be diffed, and every one of those would break
 * that.
 */
import type { CustomFieldValueTypeName } from "../../../../custom-field-value/src/data/models/CustomFieldValueModel";
import type { ValidatorKindName } from "../../../../custom-field/src/data/models/CustomFieldModel";
import { SUPPORTED_SCHEMA_FORMAT_VERSION } from "../../data/models/SchemaBundleModel";

/**
 * One field group in a bundle, identified by `(entityTypeKey, stableKey)`.
 *
 * See `SchemaGroupJson` for the per-field contract; this mirrors it exactly rather than reshaping
 * it, because the exported file is produced FROM the entity and any divergence here becomes a
 * divergence in the file.
 */
export interface SchemaGroupData {
  entityTypeKey: string;
  stableKey: string;
  labelEn: string;
  labelAr: string | null;
  sortOrder: number;
  isGlobal: boolean;
}

/**
 * One field definition in a bundle, identified by `(entityTypeKey, key)`.
 *
 * See `SchemaDefinitionJson` for the per-field contract.
 */
export interface SchemaDefinitionData {
  entityTypeKey: string;
  key: string;
  labelEn: string;
  labelAr: string | null;
  placeholderEn: string | null;
  placeholderAr: string | null;
  valueType: CustomFieldValueTypeName;
  isRequired: boolean;
  isActive: boolean;
  sortOrder: number;
  options: string | null;
  optionsAr: string | null;
  validatorKind: ValidatorKindName | null;
  validatorParam: string | null;
  sensitivity: string;
  isExportable: boolean;
  groupStableKey: string | null;
  isGlobal: boolean;
}

/** A bundle as the read path produces it. */
export interface SchemaBundleData {
  formatVersion: number;
  /** Null when the export covers every entity type the caller can see. */
  entityTypeKey: string | null;
  groups: SchemaGroupData[];
  definitions: SchemaDefinitionData[];
}

/**
 * SchemaBundle entity class.
 */
export class SchemaBundle {
  constructor(public readonly data: SchemaBundleData) {}

  get formatVersion(): number {
    return this.data.formatVersion;
  }

  get entityTypeKey(): string | null {
    return this.data.entityTypeKey;
  }

  get groups(): SchemaGroupData[] {
    return this.data.groups;
  }

  get definitions(): SchemaDefinitionData[] {
    return this.data.definitions;
  }

  get definitionCount(): number {
    return this.data.definitions.length;
  }

  get groupCount(): number {
    return this.data.groups.length;
  }

  /** True when the export was scoped to one entity type rather than covering all of them. */
  get isScoped(): boolean {
    return this.data.entityTypeKey !== null;
  }

  /**
   * True when there is nothing in the bundle at all.
   *
   * Worth a check of its own before writing a file, because an empty bundle has TWO causes that
   * look identical from here and read very differently to the person who asked: the entity type
   * genuinely has no fields, or every field it has is one this caller is restricted from seeing —
   * the handler filters those out silently, by design, so a schema bundle cannot become a
   * read-around. Handing over an empty file without saying so lets someone conclude the schema is
   * empty when it is only invisible to them.
   */
  get isEmpty(): boolean {
    return this.definitionCount === 0 && this.groupCount === 0;
  }

  /**
   * Whether this client recognises the bundle's format version.
   *
   * False means the SERVER is newer than this app. That is a warning, not a refusal: an exporter
   * only moves bytes, and the file is passed through verbatim, so refusing to save it would
   * withhold a perfectly good bundle. The refuse-rather-than-guess rule in `SchemaBundle`'s backend
   * doc binds an IMPORTER, which is the side that would write half-understood data.
   */
  get isFormatSupported(): boolean {
    return this.data.formatVersion === SUPPORTED_SCHEMA_FORMAT_VERSION;
  }

  /**
   * The download filename.
   *
   * NO TIMESTAMP, on purpose. The bundle's whole selling point is that two exports of the same
   * schema are byte-identical and diffable; a clock in the name would make the two files land side
   * by side in a downloads folder instead of one replacing the other, which is the opposite of what
   * someone comparing two environments wants. The format version IS in the name, because a v1 and a
   * v2 bundle are genuinely different artefacts.
   */
  suggestedFileName(): string {
    const scope = this.data.entityTypeKey ?? "all";
    return `custom-field-schema.${scope}.v${this.data.formatVersion}.json`;
  }
}
