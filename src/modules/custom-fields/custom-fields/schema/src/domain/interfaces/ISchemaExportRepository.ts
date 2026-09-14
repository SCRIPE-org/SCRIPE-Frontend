/**
 * ISchemaExportRepository Interface
 *
 * Contract for schema-export data access (Wave 6 row 6.5). Works with domain entities, not DTOs.
 *
 * ONE METHOD, AND NO WRITE PATH. There is no schema IMPORT in this product yet — the backend
 * exposes a query and nothing else — so this interface deliberately has no `import`, `validate` or
 * `save`. Adding a speculative one here would imply a route that does not exist.
 */
import type { SchemaBundle } from "../entities/SchemaBundle";

export interface ISchemaExportRepository {
  /**
   * Fetches a portable schema bundle.
   *
   * @param entityTypeKey - One entity type, or null/undefined for every one the caller can see.
   *   An unregistered key is rejected by the server with a 422, not silently ignored.
   */
  exportSchema(entityTypeKey?: string | null): Promise<SchemaBundle>;
}
