/**
 * IValueExportService Interface
 *
 * Contract for the value-export API operation (Wave 6 row 6.4's completion). Implemented by
 * `ValueExportService` in the data layer; speaks Models, not Entities.
 */
import type { ValueExportFileModel } from "../../data/models/ValueExportModel";

export interface IValueExportService {
  /**
   * `GET /v1/custom-fields/values/{entityTypeKey}/export`
   *
   * Returns a FILE, not a JSON body — the same `FileContentResult` shape the definitions export
   * returns, so this goes through `api.getBlob` and the resolved value is an `.xlsx` byte stream
   * wrapped in a descriptor.
   *
   * `entityTypeKey` is a REQUIRED route segment, unlike the definitions export's optional query
   * parameter: a values export enumerates actual records through the entity-lookup registry, which
   * has no "every type at once" shape to ask for.
   *
   * Gated on `{PermissionResource}.view` for the requested entity type — NOT `custom-fields.export`,
   * the definitions/schema exports' own admin permission. A caller who can view one entity type's
   * records and not another's will be refused for the second without anything being misconfigured.
   * Restricted (FLS-Tier-1) fields are filtered SERVER-side and are simply absent from every row.
   *
   * @throws `ValueExportFailure` for every failed call, carrying the parsed `ErrorResponse` so the
   *   repository can tell a row-cap REFUSAL, an unknown entity type, or a forbidden view permission
   *   from a genuine fault.
   * @throws `DownloadInterceptedError` when an external download manager took the stream — which
   *   means the file WAS captured, and is passed through rather than translated.
   */
  exportValues(entityTypeKey: string): Promise<ValueExportFileModel>;
}
