/**
 * IDefinitionExportService Interface
 *
 * Contract for the definition-export API operation (Wave 6 row 6.4). Implemented by
 * `DefinitionExportService` in the data layer; speaks Models, not Entities.
 */
import type { DefinitionExportFileModel } from "../../data/models/DefinitionExportModel";

export interface IDefinitionExportService {
  /**
   * `GET /v1/custom-fields/export?entityTypeKey=...`
   *
   * Returns a FILE, not a JSON body. The sibling `GET /custom-fields/schema` returns `Ok(bundle)`;
   * this one returns a `FileContentResult`, so it goes through `api.getBlob` and the resolved value
   * is an `.xlsx` byte stream wrapped in a descriptor.
   *
   * `entityTypeKey` is optional: omitting it exports every entity type the caller can see. An
   * unregistered key is rejected by the server with a 422 naming the key, not silently ignored.
   *
   * Gated on `custom-fields.export`. Definitions the caller is restricted from seeing are filtered
   * SERVER-side and are simply absent from the workbook — the field-projection middleware only
   * rewrites JSON bodies, so the handler does that filtering itself. There is nothing here for a
   * client to hide and nothing that tells it filtering occurred.
   *
   * @throws `DefinitionExportFailure` for every failed call, carrying the parsed `ErrorResponse` so
   *   the repository can tell a row-cap REFUSAL from a genuine fault.
   * @throws `DownloadInterceptedError` when an external download manager took the stream — which
   *   means the file WAS captured, and is passed through rather than translated.
   */
  exportDefinitions(entityTypeKey?: string | null): Promise<DefinitionExportFileModel>;
}
