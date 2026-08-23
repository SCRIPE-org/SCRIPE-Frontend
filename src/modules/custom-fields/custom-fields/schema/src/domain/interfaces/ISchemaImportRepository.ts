/**
 * ISchemaImportRepository Interface
 *
 * Contract for schema-import data access (Wave 6 row 6.5's import half). Works with the domain
 * RESULT entity on the way out; deliberately does NOT work with a domain entity on the way in.
 *
 * WHY THE INPUT IS A DATA-LAYER PAYLOAD, NOT `SchemaBundle`
 * -------------------------------------------------------------
 * Every other repository in this module takes or returns domain entities exclusively. This one
 * does not, because the obvious candidate entity -- `SchemaBundle`, the export side's own -- would
 * still be wrong here even though `SchemaBundleMapper`/`SchemaBundleModel` carry every field this
 * build knows about today (including `referenceTargetEntityTypeKey`, which they do): round-tripping
 * a picked file through that mapper rebuilds the JSON property by property against THIS build's own
 * shape, so any field a future additive, un-versioned backend DTO change adds -- one this build's
 * `SchemaBundleJson` does not yet declare -- would be silently dropped on the way back INTO the
 * system that is supposed to preserve it byte-for-byte. So the picked file's parsed JSON is
 * forwarded to the API exactly as read, never rebuilt through that mapper -- see
 * `SchemaImportModel`'s own header for the full accounting of why.
 */
import type { SchemaImportBundlePayload } from "../../data/models/SchemaImportModel";
import type { SchemaImportResult } from "../entities/SchemaImportResult";

export interface ISchemaImportRepository {
  /**
   * Posts a bundle for import.
   *
   * @param bundle - The picked file's parsed JSON, already shape-checked by
   *   `looksLikeSchemaBundlePayload`.
   * @throws `SchemaImportError` for a whole-call refusal -- shape-invalid JSON, an unsupported
   *   format version, or the item-count ceiling. See that class for why only the ceiling gets its
   *   own flag.
   */
  importSchema(bundle: SchemaImportBundlePayload): Promise<SchemaImportResult>;
}
