import type { DataExchangeImportMode } from "@core/data-exchange/domain/types";

/**
 * Domain entity representing an exchange-capable entity in the catalog.
 */
export class DataExchangeEntity {
  /** Unique entity key, e.g. "crm.lead", "party.person". */
  readonly entityKey: string;
  /** Owning module name, e.g. "CRM", "PartyKernel". */
  readonly owningModule: string;
  /** English display name. */
  readonly displayNameEn: string;
  /** Arabic display name. */
  readonly displayNameAr: string;
  /** English description. */
  readonly descriptionEn: string;
  /** Arabic description. */
  readonly descriptionAr: string;
  /** Whether the entity supports auto-creating referenced lookups. */
  readonly supportsBulkAutoCreateLookup: boolean;
  /** Whether identity onboarding modes are supported. */
  readonly supportsIdentityOnboardingModes: boolean;
  /** Supported import modes (Insert, Update, Upsert). */
  readonly supportedModes: DataExchangeImportMode[];
  /** Keys of parent entities in the dependency hierarchy. */
  readonly parentEntityKeys: string[];
  /** Remaining quota slots for this entity in the active tenant. */
  readonly remainingQuotaSlots?: number | null;
  /** Maximum quota limit allocated for the active tenant. */
  readonly quotaMaxLimit?: number | null;
  /** Whether the import feature flag is active for the edition. */
  readonly isImportFeatureEnabled: boolean;
  /** Whether the export feature flag is active for the edition. */
  readonly isExportFeatureEnabled: boolean;
  /** Whether the current caller holds PBAC permission to import. */
  readonly canImport: boolean;
  /** Whether the current caller holds PBAC permission to export. */
  readonly canExport: boolean;

  constructor(params: {
    entityKey: string;
    owningModule: string;
    displayNameEn: string;
    displayNameAr: string;
    descriptionEn: string;
    descriptionAr: string;
    supportsBulkAutoCreateLookup: boolean;
    supportsIdentityOnboardingModes: boolean;
    supportedModes: DataExchangeImportMode[];
    parentEntityKeys: string[];
    remainingQuotaSlots?: number | null;
    quotaMaxLimit?: number | null;
    isImportFeatureEnabled: boolean;
    isExportFeatureEnabled: boolean;
    canImport: boolean;
    canExport: boolean;
  }) {
    this.entityKey = params.entityKey;
    this.owningModule = params.owningModule;
    this.displayNameEn = params.displayNameEn;
    this.displayNameAr = params.displayNameAr;
    this.descriptionEn = params.descriptionEn;
    this.descriptionAr = params.descriptionAr;
    this.supportsBulkAutoCreateLookup = params.supportsBulkAutoCreateLookup;
    this.supportsIdentityOnboardingModes = params.supportsIdentityOnboardingModes;
    this.supportedModes = params.supportedModes;
    this.parentEntityKeys = params.parentEntityKeys;
    this.remainingQuotaSlots = params.remainingQuotaSlots;
    this.quotaMaxLimit = params.quotaMaxLimit;
    this.isImportFeatureEnabled = params.isImportFeatureEnabled;
    this.isExportFeatureEnabled = params.isExportFeatureEnabled;
    this.canImport = params.canImport;
    this.canExport = params.canExport;
  }

  /** Primary unique identifier required by GenericCrudView. */
  get id(): string {
    return this.entityKey;
  }

  /**
   * Immutably creates a copy of the entity with updated fields.
   */
  copyWith(changes: Partial<ConstructorParameters<typeof DataExchangeEntity>[0]>): DataExchangeEntity {
    return new DataExchangeEntity({
      entityKey: changes.entityKey ?? this.entityKey,
      owningModule: changes.owningModule ?? this.owningModule,
      displayNameEn: changes.displayNameEn ?? this.displayNameEn,
      displayNameAr: changes.displayNameAr ?? this.displayNameAr,
      descriptionEn: changes.descriptionEn ?? this.descriptionEn,
      descriptionAr: changes.descriptionAr ?? this.descriptionAr,
      supportsBulkAutoCreateLookup:
        changes.supportsBulkAutoCreateLookup ?? this.supportsBulkAutoCreateLookup,
      supportsIdentityOnboardingModes:
        changes.supportsIdentityOnboardingModes ?? this.supportsIdentityOnboardingModes,
      supportedModes: changes.supportedModes ?? this.supportedModes,
      parentEntityKeys: changes.parentEntityKeys ?? this.parentEntityKeys,
      remainingQuotaSlots:
        changes.remainingQuotaSlots !== undefined
          ? changes.remainingQuotaSlots
          : this.remainingQuotaSlots,
      quotaMaxLimit:
        changes.quotaMaxLimit !== undefined ? changes.quotaMaxLimit : this.quotaMaxLimit,
      isImportFeatureEnabled:
        changes.isImportFeatureEnabled ?? this.isImportFeatureEnabled,
      isExportFeatureEnabled:
        changes.isExportFeatureEnabled ?? this.isExportFeatureEnabled,
      canImport: changes.canImport ?? this.canImport,
      canExport: changes.canExport ?? this.canExport,
    });
  }
}
