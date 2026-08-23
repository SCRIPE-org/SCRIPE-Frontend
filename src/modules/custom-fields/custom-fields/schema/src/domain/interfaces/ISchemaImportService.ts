/**
 * ISchemaImportService Interface
 *
 * Contract for the schema-import API operation (Wave 6 row 6.5's import half). Implemented by
 * `SchemaImportService` in the data layer; speaks Models, not Entities.
 */
import type {
  ImportSchemaBundleResultModel,
  SchemaImportBundlePayload,
} from "../../data/models/SchemaImportModel";

export interface ISchemaImportService {
  /**
   * `POST /v1/custom-fields/schema/import`
   *
   * The body IS the bundle -- the exact JSON shape `GET /custom-fields/schema` produces, posted
   * back unwrapped. Unlike the export siblings this is a plain JSON round trip (`api.post`, not
   * `api.getBlob`): no blob-typed error body to read back, and no `DownloadInterceptedError` to
   * pass through, because nothing here is a file download.
   *
   * Gated on BOTH `custom-field-groups.create` and `custom-fields.create` -- an import is a bulk
   * create of both kinds of row, not a new authorization concept.
   *
   * @throws `ImportSchemaBundleFailure` for a WHOLE-CALL refusal -- the handler's shape validation
   *   rejected the file before touching the database, so nothing in it was imported. A per-group
   *   Skipped/Failed outcome is NOT this: that is a successful response, carried in the resolved
   *   value instead.
   */
  importSchema(bundle: SchemaImportBundlePayload): Promise<ImportSchemaBundleResultModel>;
}
