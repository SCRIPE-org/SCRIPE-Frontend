/**
 * IValueExportRepository Interface
 *
 * Contract for value-export data access (Wave 6 row 6.4's completion). Works with domain entities,
 * not DTOs.
 *
 * ONE METHOD, AND NO WRITE PATH. Nothing in this product imports a values workbook — the backend
 * exposes a query and nothing else — so this interface deliberately has no `import`, `validate` or
 * `save`. Same reasoning as `IDefinitionExportRepository`.
 */
import type { ValueExport } from "../entities/ValueExport";

export interface IValueExportRepository {
  /**
   * Fetches the values workbook for one entity type.
   *
   * @param entityTypeKey - The entity type to export. Required — see `IValueExportService` for why
   *   there is no "every type at once" shape here.
   * @throws `ValueExportError` for every structured failure, carrying the server's error code so a
   *   caller can tell the row-cap REFUSAL, an unknown entity type, and a forbidden view permission
   *   apart from a fault. See that class for why none of the three should collapse into the others.
   * @throws `DownloadInterceptedError` when an external download manager captured the stream.
   */
  exportValues(entityTypeKey: string): Promise<ValueExport>;
}
