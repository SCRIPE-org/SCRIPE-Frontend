/**
 * Value Export DI Container (Wave 6 row 6.4's completion)
 *
 * Same Clean Architecture wiring as `definition-export/di.ts` and `schema/di.ts`:
 * - Service wraps IApiService (API calls only)
 * - Repository uses the Service and maps Models -> Entities
 * - ViewModel uses the Repository
 *
 * A THIRD SUBMODULE-LOCAL CONTAINER, FOR THE SAME REASON AS THE OTHER TWO
 * -------------------------------------------------------------------------
 * `../di.ts` is shared by every CustomFields submodule and is outside this change's file ownership.
 * A submodule-local container reuses the SAME `getModuleApiService("CUSTOMFIELDS")` instance (that
 * factory caches per module key, so no second HTTP client and no second auth/tenant context is
 * created), keeps the same lazy-singleton shape, and can be folded into `CustomFieldsContainer`
 * verbatim when a change that owns that file comes along.
 *
 * There are now three of these local containers under `custom-fields/`. That is the signal to merge
 * all three upward, not to add a fourth.
 */
import { getModuleApiService } from "@/core/services/api-factory";

import { ValueExportService } from "./src/data/services/ValueExportService";
import { ValueExportRepository } from "./src/data/repositories/ValueExportRepository";
import type { IValueExportService } from "./src/domain/interfaces/IValueExportService";
import type { IValueExportRepository } from "./src/domain/interfaces/IValueExportRepository";

export interface ValueExportContainer {
  valueExportService: IValueExportService;
  valueExportRepository: IValueExportRepository;
}

let _container: ValueExportContainer | null = null;

/**
 * Get the value-export container (lazy initialization).
 */
export function getValueExportContainer(): ValueExportContainer {
  if (!_container) {
    // Same module key the CustomFields container uses, so both resolve to one cached ApiService --
    // which matters more here than elsewhere: the export must carry the current `X-Tenant-Context`
    // header, and a second client could hold a stale one after a drill-down.
    const valueExportService = new ValueExportService(getModuleApiService("CUSTOMFIELDS"));

    _container = {
      valueExportService,
      valueExportRepository: new ValueExportRepository(valueExportService),
    };
  }

  return _container;
}

/**
 * Value-export container accessor (for use in components).
 */
export const valueExportContainer = {
  get valueExportRepository() {
    return getValueExportContainer().valueExportRepository;
  },
};
