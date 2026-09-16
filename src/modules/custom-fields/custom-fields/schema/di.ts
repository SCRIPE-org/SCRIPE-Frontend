/**
 * Schema DI Container (Wave 6 row 6.5, both halves)
 *
 * Same Clean Architecture wiring as the module container in `../di.ts`:
 * - Service wraps IApiService (API calls only)
 * - Repository uses the Service and maps Models -> Entities
 * - ViewModel uses the Repository
 *
 * ONE CONTAINER FOR BOTH EXPORT AND IMPORT, DELIBERATELY
 * -------------------------------------------------------
 * The import half (Wave 6 row 6.5's completion) is added to this SAME file rather than getting a
 * fourth submodule-local container next to it: export and import are two directions of the one
 * `SchemaBundle` concept, share this file's module key and lazy-singleton shape already, and
 * `DefinitionExportContainer`'s own doc comment already flags three of these local containers as
 * the signal to merge upward, not grow a fourth. Folding the import pair in here instead keeps that
 * count at three.
 *
 * WHY THIS IS A CONTAINER SEPARATE FROM `../di.ts` AT ALL
 * ---------------------------------------------------------
 * `../di.ts` is shared by every CustomFields submodule and is outside this change's file ownership.
 * A submodule-local container reuses the SAME `getModuleApiService("CUSTOMFIELDS")` instance (that
 * factory caches per module key, so no second HTTP client is created), keeps the same
 * lazy-singleton shape, and can be folded into `CustomFieldsContainer` verbatim when a change that
 * owns that file comes along.
 */
import { getModuleApiService } from "@/core/services/api-factory";

import { SchemaExportService } from "./src/data/services/SchemaExportService";
import { SchemaExportRepository } from "./src/data/repositories/SchemaExportRepository";
import type { ISchemaExportService } from "./src/domain/interfaces/ISchemaExportService";
import type { ISchemaExportRepository } from "./src/domain/interfaces/ISchemaExportRepository";
import { SchemaImportService } from "./src/data/services/SchemaImportService";
import { SchemaImportRepository } from "./src/data/repositories/SchemaImportRepository";
import type { ISchemaImportService } from "./src/domain/interfaces/ISchemaImportService";
import type { ISchemaImportRepository } from "./src/domain/interfaces/ISchemaImportRepository";

export interface SchemaExportContainer {
  schemaExportService: ISchemaExportService;
  schemaExportRepository: ISchemaExportRepository;
  schemaImportService: ISchemaImportService;
  schemaImportRepository: ISchemaImportRepository;
}

let _container: SchemaExportContainer | null = null;

/**
 * Get the schema container (lazy initialization). Kept under its original export-side name
 * (`getSchemaExportContainer`) rather than renamed, since every existing caller of the export half
 * already imports it that way and this change adds to the container rather than replacing it.
 */
export function getSchemaExportContainer(): SchemaExportContainer {
  if (!_container) {
    // Same module key the CustomFields container uses, so both resolve to one cached ApiService and
    // one auth/tenant context -- not two clients that could drift apart mid-session.
    const api = getModuleApiService("CUSTOMFIELDS");
    const schemaExportService = new SchemaExportService(api);
    const schemaImportService = new SchemaImportService(api);

    _container = {
      schemaExportService,
      schemaExportRepository: new SchemaExportRepository(schemaExportService),
      schemaImportService,
      schemaImportRepository: new SchemaImportRepository(schemaImportService),
    };
  }

  return _container;
}

/**
 * Schema container accessor (for use in components).
 */
export const schemaExportContainer = {
  get schemaExportRepository() {
    return getSchemaExportContainer().schemaExportRepository;
  },
  get schemaImportRepository() {
    return getSchemaExportContainer().schemaImportRepository;
  },
};
