/**
 * SCRIPE Academy Workspace DI Container
 *
 * Provides dependency injection for the sovereign "academy" workspace.
 * Clean Architecture Pattern:
 * - Services wrap IApiService (API calls only)
 * - Repositories use Services and map Models -> Entities
 * - ViewModels use Repositories
 */
import { getModuleApiService } from "@/core/services/api-factory";
import { AcademyOverviewService } from "./academy-overview/src/data/services/AcademyOverviewService";
import { AcademyOverviewRepository } from "./academy-overview/src/data/repositories/AcademyOverviewRepository";
import type { IAcademyOverviewRepository } from "./academy-overview/src/domain/interfaces/IAcademyOverviewRepository";

export interface IAcademyServiceLocator {
  overviewRepository: IAcademyOverviewRepository;
}

class AcademyContainer implements IAcademyServiceLocator {
  private _overviewRepository?: IAcademyOverviewRepository;

  get overviewRepository(): IAcademyOverviewRepository {
    if (!this._overviewRepository) {
      const api = getModuleApiService("ACADEMY");
      const service = new AcademyOverviewService(api);
      this._overviewRepository = new AcademyOverviewRepository(service);
    }
    return this._overviewRepository;
  }
}

const containerInstance = new AcademyContainer();

export function useAcademyServiceLocator(): IAcademyServiceLocator {
  return containerInstance;
}
