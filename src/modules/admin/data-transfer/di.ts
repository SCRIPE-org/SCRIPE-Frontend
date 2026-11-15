import { getModuleApiService } from "@core/services/api-factory";
import { DataExchangeRepository } from "@core/data-exchange/data/repositories/DataExchangeRepository";
import { DataExchangeService } from "@core/data-exchange/data/services/DataExchangeService";
import type { IDataExchangeRepository } from "@core/data-exchange/domain/interfaces/IDataExchangeRepository";
import type { IEntitiesRepository } from "./entities/src/domain/interfaces/IEntitiesRepository";
import { EntitiesRepository } from "./entities/src/data/repositories/EntitiesRepository";
import { EntitiesService } from "./entities/src/data/services/EntitiesService";
import type { IJobsRepository } from "./jobs/src/domain/interfaces/IJobsRepository";
import { JobsRepository } from "./jobs/src/data/repositories/JobsRepository";
import { JobsService } from "./jobs/src/data/services/JobsService";
import type { IPresetsRepository } from "./presets/src/domain/interfaces/IPresetsRepository";
import { PresetsRepository } from "./presets/src/data/repositories/PresetsRepository";
import { PresetsService } from "./presets/src/data/services/PresetsService";

/**
 * Dependency injection container contract for Admin Data Transfer module.
 */
export interface IDataTransferContainer {
  readonly entitiesRepository: IEntitiesRepository;
  readonly jobsRepository: IJobsRepository;
  readonly presetsRepository: IPresetsRepository;
  readonly dataExchangeRepository?: IDataExchangeRepository;
}

class DataTransferContainer implements IDataTransferContainer {
  private _entitiesRepo?: IEntitiesRepository;
  private _jobsRepo?: IJobsRepository;
  private _presetsRepo?: IPresetsRepository;
  private _dataExchangeRepo?: IDataExchangeRepository;

  get entitiesRepository(): IEntitiesRepository {
    if (!this._entitiesRepo) {
      const api = getModuleApiService();
      const service = new EntitiesService(api);
      this._entitiesRepo = new EntitiesRepository(service);
    }
    return this._entitiesRepo;
  }

  get jobsRepository(): IJobsRepository {
    if (!this._jobsRepo) {
      const api = getModuleApiService();
      const service = new JobsService(api);
      this._jobsRepo = new JobsRepository(service);
    }
    return this._jobsRepo;
  }

  get presetsRepository(): IPresetsRepository {
    if (!this._presetsRepo) {
      const api = getModuleApiService();
      const service = new PresetsService(api);
      this._presetsRepo = new PresetsRepository(service);
    }
    return this._presetsRepo;
  }

  get dataExchangeRepository(): IDataExchangeRepository {
    if (!this._dataExchangeRepo) {
      const api = getModuleApiService();
      const service = new DataExchangeService(api);
      this._dataExchangeRepo = new DataExchangeRepository(service);
    }
    return this._dataExchangeRepo;
  }
}

let containerInstance: IDataTransferContainer | null = null;

/**
 * Retrieves the singleton instance of the Data Transfer dependency container.
 */
export function getDataTransferContainer(): IDataTransferContainer {
  if (!containerInstance) {
    containerInstance = new DataTransferContainer();
  }
  return containerInstance;
}

/**
 * Overrides the container instance (used for test isolation).
 */
export function setDataTransferContainer(container: IDataTransferContainer | null): void {
  containerInstance = container;
}
