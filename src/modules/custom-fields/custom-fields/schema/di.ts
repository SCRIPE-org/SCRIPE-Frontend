/**
 * Schema Export DI Container (Wave 6 row 6.5)
 *
 * Same Clean Architecture wiring as the module container in `../di.ts`:
 * - Service wraps IApiService (API calls only)
 * - Repository uses the Service and maps Models -> Entities
 * - ViewModel uses the Repository
 *
 * WHY THIS IS A SECOND CONTAINER AND NOT A PAIR OF ENTRIES IN `../di.ts`
 * ---------------------------------------------------------------------
 * `../di.ts` is shared by every CustomFields submodule and is outside this change's file ownership.
 * A submodule-local container is the smaller of the two available deviations: it reuses the SAME
 * `getModuleApiService("CUSTOMFIELDS")` instance (that factory caches per module key, so no second
 * HTTP client is created), keeps the same lazy-singleton shape, and can be folded into
 * `CustomFieldsContainer` verbatim when a change that owns that file comes along.
 *
 * Do not add unrelated dependencies here. If this file starts growing, that is the signal to merge
 * it upward rather than to let a parallel container establish itself.
 */
import { getModuleApiService } from "@/core/services/api-factory";

import { SchemaExportService } from "./src/data/services/SchemaExportService";
import { SchemaExportRepository } from "./src/data/repositories/SchemaExportRepository";
import type { ISchemaExportService } from "./src/domain/interfaces/ISchemaExportService";
import type { ISchemaExportRepository } from "./src/domain/interfaces/ISchemaExportRepository";

export interface SchemaExportContainer {
  schemaExportService: ISchemaExportService;
  schemaExportRepository: ISchemaExportRepository;
}

let _container: SchemaExportContainer | null = null;

/**
 * Get the schema-export container (lazy initialization).
 */
export function getSchemaExportContainer(): SchemaExportContainer {
  if (!_container) {
    // Same module key the CustomFields container uses, so both resolve to one cached ApiService and
    // one auth/tenant context -- not two clients that could drift apart mid-session.
    const schemaExportService = new SchemaExportService(getModuleApiService("CUSTOMFIELDS"));

    _container = {
      schemaExportService,
      schemaExportRepository: new SchemaExportRepository(schemaExportService),
    };
  }

  return _container;
}

/**
 * Schema-export container accessor (for use in components).
 */
export const schemaExportContainer = {
  get schemaExportRepository() {
    return getSchemaExportContainer().schemaExportRepository;
  },
};
