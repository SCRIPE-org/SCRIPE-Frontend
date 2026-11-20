/**
 * Data Transfer Administration Module
 *
 * Provides sovereign enterprise data exchange capabilities:
 * - Entities Sub-Module: Multi-tenant entity catalog, dynamic descriptors, bilingual template generation
 * - Jobs Sub-Module: Real-time background job telemetry, progress tracking, rejection workbook downloads
 * - Presets Sub-Module: Persisted column mapping templates with default lifecycle management
 */

export {
  DATA_TRANSFER_PERMISSIONS,
  type DataTransferPermissionCode,
} from "./permission-constants";

export {
  getDataTransferContainer,
  setDataTransferContainer,
  type IDataTransferContainer,
} from "./di";

export {
  EntitiesCatalogView,
  useEntitiesViewModel,
  DataExchangeEntity,
  type IEntitiesRepository,
  type IEntitiesService,
  type DataExchangeEntityModel,
  DataExchangeEntityMapper,
  EntitiesService,
  EntitiesRepository,
  entitiesEn,
  entitiesAr,
} from "./entities";

export {
  JobsExecutionView,
  useJobsViewModel,
  DataTransferJob,
  type IJobsRepository,
  type IJobsService,
  type JobsQueryParams,
  type DataTransferJobModel,
  DataTransferJobMapper,
  JobsService,
  JobsRepository,
  jobsEn,
  jobsAr,
} from "./jobs";

export {
  PresetsView,
  usePresetsViewModel,
  DataExchangePreset,
  type IPresetsRepository,
  type IPresetsService,
  type DataExchangePresetModel,
  DataExchangePresetMapper,
  PresetsService,
  PresetsRepository,
  presetsEn,
  presetsAr,
} from "./presets";
