/**
 * IDefinitionExportRepository Interface
 *
 * Contract for definition-export data access (Wave 6 row 6.4). Works with domain entities, not DTOs.
 *
 * ONE METHOD, AND NO WRITE PATH. Nothing in this product imports a workbook — the backend exposes a
 * query and nothing else — so this interface deliberately has no `import`, `validate` or `save`.
 * Adding a speculative one would imply a route that does not exist.
 */
import type { DefinitionExport } from "../entities/DefinitionExport";

export interface IDefinitionExportRepository {
  /**
   * Fetches the definition workbook.
   *
   * @param entityTypeKey - One entity type, or null/undefined for every one the caller can see.
   * @throws `DefinitionExportError` for every structured failure, carrying the server's error code
   *   so a caller can tell the row-cap REFUSAL from a fault. See that class for why the distinction
   *   is not cosmetic.
   * @throws `DownloadInterceptedError` when an external download manager captured the stream.
   */
  exportDefinitions(entityTypeKey?: string | null): Promise<DefinitionExport>;
}
