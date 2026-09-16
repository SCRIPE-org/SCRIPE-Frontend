/**
 * ISchemaExportService Interface
 *
 * Contract for the schema-export API operation (Wave 6 row 6.5). Implemented by
 * `SchemaExportService` in the data layer; speaks Models, not Entities.
 */
import type { SchemaBundleModel } from "../../data/models/SchemaBundleModel";

export interface ISchemaExportService {
  /**
   * `GET /v1/custom-fields/schema?entityTypeKey=...`
   *
   * `entityTypeKey` is OPTIONAL here, unlike the field-group read: omitting it exports every entity
   * type the caller can see, and the bundle records which of the two happened so an importer can
   * tell a partial bundle from a complete one.
   *
   * Returns a JSON body, NOT a file. The sibling `GET /custom-fields/export` returns a
   * `FileContentResult`; this one returns `Ok(bundle)`, so it goes through `api.get` rather than
   * `api.getBlob` and the client is what turns it into a file.
   *
   * Gated on `custom-fields.export`. Definitions the caller is restricted from seeing are filtered
   * SERVER-side and simply are not in the response — there is nothing for a client to hide, and
   * nothing that tells it filtering occurred.
   */
  getSchema(entityTypeKey?: string | null): Promise<SchemaBundleModel>;
}
