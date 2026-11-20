import { DataExchangeEntity } from "../../domain/entities/DataExchangeEntity";
import type { DataExchangeEntityModel } from "../models/DataExchangeEntityModel";

/**
 * Pure mapper transforming between DataExchangeEntityModel and DataExchangeEntity.
 */
export class DataExchangeEntityMapper {
  /**
   * Maps an API model to a domain entity.
   */
  static toDomain(model: DataExchangeEntityModel): DataExchangeEntity {
    return new DataExchangeEntity({
      entityKey: model.entityKey,
      owningModule: model.owningModule,
      displayNameEn: model.displayNameEn,
      displayNameAr: model.displayNameAr,
      descriptionEn: model.descriptionEn,
      descriptionAr: model.descriptionAr,
      supportsBulkAutoCreateLookup: model.supportsBulkAutoCreateLookup,
      supportsIdentityOnboardingModes: model.supportsIdentityOnboardingModes,
      supportedModes: model.supportedModes ?? [],
      parentEntityKeys: model.parentEntityKeys ?? [],
      remainingQuotaSlots: model.remainingQuotaSlots,
      quotaMaxLimit: model.quotaMaxLimit,
      isImportFeatureEnabled: model.isImportFeatureEnabled,
      isExportFeatureEnabled: model.isExportFeatureEnabled,
      canImport: model.canImport,
      canExport: model.canExport,
      relatedMultiSheetEntityKeys: model.relatedMultiSheetEntityKeys ?? [],
    });
  }

  /**
   * Maps a domain entity to an API model.
   */
  static toModel(entity: DataExchangeEntity): DataExchangeEntityModel {
    return {
      entityKey: entity.entityKey,
      owningModule: entity.owningModule,
      displayNameEn: entity.displayNameEn,
      displayNameAr: entity.displayNameAr,
      descriptionEn: entity.descriptionEn,
      descriptionAr: entity.descriptionAr,
      supportsBulkAutoCreateLookup: entity.supportsBulkAutoCreateLookup,
      supportsIdentityOnboardingModes: entity.supportsIdentityOnboardingModes,
      supportedModes: entity.supportedModes,
      parentEntityKeys: entity.parentEntityKeys,
      remainingQuotaSlots: entity.remainingQuotaSlots,
      quotaMaxLimit: entity.quotaMaxLimit,
      isImportFeatureEnabled: entity.isImportFeatureEnabled,
      isExportFeatureEnabled: entity.isExportFeatureEnabled,
      canImport: entity.canImport,
      canExport: entity.canExport,
      relatedMultiSheetEntityKeys: entity.relatedMultiSheetEntityKeys,
    };
  }
}
