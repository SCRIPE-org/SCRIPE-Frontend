/**
 * Definition Export DI Container (Wave 6 row 6.4)
 *
 * Same Clean Architecture wiring as the module container in `../di.ts`:
 * - Service wraps IApiService (API calls only)
 * - Repository uses the Service and maps Models -> Entities
 * - ViewModel uses the Repository
 *
 * WHY THIS IS A THIRD CONTAINER AND NOT A PAIR OF ENTRIES IN `../di.ts`
 * --------------------------------------------------------------------
 * `../di.ts` is shared by every CustomFields submodule and is outside this change's file ownership —
 * the same constraint the schema submodule hit, and it made the same call. A submodule-local
 * container is the smaller of the two available deviations: it reuses the SAME
 * `getModuleApiService("CUSTOMFIELDS")` instance (that factory caches per module key, so no second
 * HTTP client and no second auth/tenant context is created), keeps the same lazy-singleton shape, and
 * can be folded into `CustomFieldsContainer` verbatim when a change that owns that file comes along.
 *
 * There are now two of these local containers under `custom-fields/`. That is the signal to merge
 * both upward, not to add a third.
 */
import { getModuleApiService } from "@/core/services/api-factory";

import { DefinitionExportService } from "./src/data/services/DefinitionExportService";
import { DefinitionExportRepository } from "./src/data/repositories/DefinitionExportRepository";
import type { IDefinitionExportService } from "./src/domain/interfaces/IDefinitionExportService";
import type { IDefinitionExportRepository } from "./src/domain/interfaces/IDefinitionExportRepository";

export interface DefinitionExportContainer {
  definitionExportService: IDefinitionExportService;
  definitionExportRepository: IDefinitionExportRepository;
}

let _container: DefinitionExportContainer | null = null;

/**
 * Get the definition-export container (lazy initialization).
 */
export function getDefinitionExportContainer(): DefinitionExportContainer {
  if (!_container) {
    // Same module key the CustomFields container uses, so both resolve to one cached ApiService --
    // which matters more here than elsewhere: the export must carry the current `X-Tenant-Context`
    // header, and a second client could hold a stale one after a drill-down.
    const definitionExportService = new DefinitionExportService(
      getModuleApiService("CUSTOMFIELDS")
    );

    _container = {
      definitionExportService,
      definitionExportRepository: new DefinitionExportRepository(definitionExportService),
    };
  }

  return _container;
}

/**
 * Definition-export container accessor (for use in components).
 */
export const definitionExportContainer = {
  get definitionExportRepository() {
    return getDefinitionExportContainer().definitionExportRepository;
  },
};
