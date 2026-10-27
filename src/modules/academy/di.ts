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

import { AcademyProgramsService } from "./programs/src/data/services/AcademyProgramsService";
import { AcademyProgramsRepository } from "./programs/src/data/repositories/AcademyProgramsRepository";
import type { IAcademyProgramsRepository } from "./programs/src/domain/interfaces/IAcademyProgramsRepository";

import { ProgramOfferingsService } from "./offerings/src/data/services/ProgramOfferingsService";
import { ProgramOfferingsRepository } from "./offerings/src/data/repositories/ProgramOfferingsRepository";
import type { IProgramOfferingsRepository } from "./offerings/src/domain/interfaces/IProgramOfferingsRepository";

import { AcademySeasonsService } from "./seasons/src/data/services/AcademySeasonsService";
import { AcademySeasonsRepository } from "./seasons/src/data/repositories/AcademySeasonsRepository";
import type { IAcademySeasonsRepository } from "./seasons/src/domain/interfaces/IAcademySeasonsRepository";

import { ExternalLocationsService } from "./locations/src/data/services/ExternalLocationsService";
import { ExternalLocationsRepository } from "./locations/src/data/repositories/ExternalLocationsRepository";
import type { IExternalLocationsRepository } from "./locations/src/domain/interfaces/IExternalLocationsRepository";

import { AcademyAthletesService } from "./athletes/src/data/services/AcademyAthletesService";
import { AcademyAthletesRepository } from "./athletes/src/data/repositories/AcademyAthletesRepository";
import type { IAcademyAthletesRepository } from "./athletes/src/domain/interfaces/IAcademyAthletesRepository";

export interface IAcademyServiceLocator {
  overviewRepository: IAcademyOverviewRepository;
  programsRepository: IAcademyProgramsRepository;
  offeringsRepository: IProgramOfferingsRepository;
  seasonsRepository: IAcademySeasonsRepository;
  locationsRepository: IExternalLocationsRepository;
  athletesRepository: IAcademyAthletesRepository;
}

class AcademyContainer implements IAcademyServiceLocator {
  private _overviewRepository?: IAcademyOverviewRepository;
  private _programsRepository?: IAcademyProgramsRepository;
  private _offeringsRepository?: IProgramOfferingsRepository;
  private _seasonsRepository?: IAcademySeasonsRepository;
  private _locationsRepository?: IExternalLocationsRepository;
  private _athletesRepository?: IAcademyAthletesRepository;

  get overviewRepository(): IAcademyOverviewRepository {
    if (!this._overviewRepository) {
      const api = getModuleApiService("ACADEMY");
      const service = new AcademyOverviewService(api);
      this._overviewRepository = new AcademyOverviewRepository(service);
    }
    return this._overviewRepository;
  }

  get programsRepository(): IAcademyProgramsRepository {
    if (!this._programsRepository) {
      const api = getModuleApiService("ACADEMY");
      const service = new AcademyProgramsService(api);
      this._programsRepository = new AcademyProgramsRepository(service);
    }
    return this._programsRepository;
  }

  get offeringsRepository(): IProgramOfferingsRepository {
    if (!this._offeringsRepository) {
      const api = getModuleApiService("ACADEMY");
      const service = new ProgramOfferingsService(api);
      this._offeringsRepository = new ProgramOfferingsRepository(service);
    }
    return this._offeringsRepository;
  }

  get seasonsRepository(): IAcademySeasonsRepository {
    if (!this._seasonsRepository) {
      const api = getModuleApiService("ACADEMY");
      const service = new AcademySeasonsService(api);
      this._seasonsRepository = new AcademySeasonsRepository(service);
    }
    return this._seasonsRepository;
  }

  get locationsRepository(): IExternalLocationsRepository {
    if (!this._locationsRepository) {
      const api = getModuleApiService("ACADEMY");
      const service = new ExternalLocationsService(api);
      this._locationsRepository = new ExternalLocationsRepository(service);
    }
    return this._locationsRepository;
  }

  get athletesRepository(): IAcademyAthletesRepository {
    if (!this._athletesRepository) {
      const api = getModuleApiService("ACADEMY");
      const service = new AcademyAthletesService(api);
      this._athletesRepository = new AcademyAthletesRepository(service);
    }
    return this._athletesRepository;
  }
}

const containerInstance = new AcademyContainer();

export function useAcademyServiceLocator(): IAcademyServiceLocator {
  return containerInstance;
}
