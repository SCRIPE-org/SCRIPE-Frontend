/**
 * CustomFields Module DI Container
 *
 * Provides dependency injection for the CustomFields module.
 *
 * Clean Architecture Pattern:
 * - Services wrap IApiService (API calls only)
 * - Repositories use Services and map Models → Entities
 * - ViewModels use Repositories
 *
 * The submodule imports below deliberately reach past each submodule's own barrel and
 * into its `src/data/` layer. This container is the composition root, not a consumer:
 * it is the one place allowed to name a concrete Service/Repository, and no submodule
 * barrel exports them precisely so nothing else can. Routing these through a barrel
 * would also be a real import cycle -- `custom-field/index.ts` eagerly loads
 * `CustomFieldListView`, which imports this file.
 */
import { getModuleApiService } from "@/core/services/api-factory";

// CustomField
import { CustomFieldService } from "./custom-field/src/data/services/CustomFieldService";
import { CustomFieldRepository } from "./custom-field/src/data/repositories/CustomFieldRepository";
import type { ICustomFieldService } from "./custom-field/src/domain/interfaces/ICustomFieldService";
import type { ICustomFieldRepository } from "./custom-field/src/domain/interfaces/ICustomFieldRepository";

// CustomFieldValue
import { CustomFieldValueService } from "./custom-field-value/src/data/services/CustomFieldValueService";
import { CustomFieldValueRepository } from "./custom-field-value/src/data/repositories/CustomFieldValueRepository";
import type { ICustomFieldValueService } from "./custom-field-value/src/domain/interfaces/ICustomFieldValueService";
import type { ICustomFieldValueRepository } from "./custom-field-value/src/domain/interfaces/ICustomFieldValueRepository";

// FieldGroup (Wave 5 row 5.2)
import { FieldGroupService } from "./field-group/src/data/services/FieldGroupService";
import { FieldGroupRepository } from "./field-group/src/data/repositories/FieldGroupRepository";
import type { IFieldGroupService } from "./field-group/src/domain/interfaces/IFieldGroupService";
import type { IFieldGroupRepository } from "./field-group/src/domain/interfaces/IFieldGroupRepository";

// OptionSet (P-4 — shared, versioned option sets)
import { OptionSetService } from "./option-set/src/data/services/OptionSetService";
import { OptionSetRepository } from "./option-set/src/data/repositories/OptionSetRepository";
import type { IOptionSetService } from "./option-set/src/domain/interfaces/IOptionSetService";
import type { IOptionSetRepository } from "./option-set/src/domain/interfaces/IOptionSetRepository";

// EntityLookup (Wave 4 — EntityReference / UserReference)
import { EntityLookupService } from "./entity-lookup/src/data/services/EntityLookupService";
import { EntityLookupRepository } from "./entity-lookup/src/data/repositories/EntityLookupRepository";
import type { IEntityLookupService } from "./entity-lookup/src/domain/interfaces/IEntityLookupService";
import type { IEntityLookupRepository } from "./entity-lookup/src/domain/interfaces/IEntityLookupRepository";

// KeyManagement (Enterprise Cryptography & Rewrap)
import { KeyManagementService } from "./key-management/src/data/services/KeyManagementService";
import { KeyManagementRepository } from "./key-management/src/data/repositories/KeyManagementRepository";
import type { IKeyManagementService } from "./key-management/src/domain/interfaces/IKeyManagementService";
import type { IKeyManagementRepository } from "./key-management/src/domain/interfaces/IKeyManagementRepository";

export interface CustomFieldsContainer {
  customFieldService: ICustomFieldService;
  customFieldRepository: ICustomFieldRepository;
  customFieldValueService: ICustomFieldValueService;
  customFieldValueRepository: ICustomFieldValueRepository;
  fieldGroupService: IFieldGroupService;
  fieldGroupRepository: IFieldGroupRepository;
  optionSetService: IOptionSetService;
  optionSetRepository: IOptionSetRepository;
  entityLookupService: IEntityLookupService;
  entityLookupRepository: IEntityLookupRepository;
  keyManagementService: IKeyManagementService;
  keyManagementRepository: IKeyManagementRepository;
}

let _container: CustomFieldsContainer | null = null;

/**
 * Get the CustomFields container (lazy initialization)
 */
export function getCustomFieldsContainer(): CustomFieldsContainer {
  if (!_container) {
    const apiService = getModuleApiService("CUSTOMFIELDS");

    const customFieldService = new CustomFieldService(apiService);
    const customFieldValueService = new CustomFieldValueService(apiService);
    const fieldGroupService = new FieldGroupService(apiService);
    const optionSetService = new OptionSetService(apiService);
    const entityLookupService = new EntityLookupService(apiService);

    const keyManagementService = new KeyManagementService(apiService);

    _container = {
      customFieldService,
      customFieldRepository: new CustomFieldRepository(customFieldService),
      customFieldValueService,
      customFieldValueRepository: new CustomFieldValueRepository(customFieldValueService),
      fieldGroupService,
      fieldGroupRepository: new FieldGroupRepository(fieldGroupService),
      optionSetService,
      optionSetRepository: new OptionSetRepository(optionSetService),
      entityLookupService,
      entityLookupRepository: new EntityLookupRepository(entityLookupService),
      keyManagementService,
      keyManagementRepository: new KeyManagementRepository(keyManagementService),
    };
  }

  return _container;
}

/**
 * CustomFields container accessor (for use in components)
 */
export const customFieldsContainer = {
  get customFieldRepository() {
    return getCustomFieldsContainer().customFieldRepository;
  },
  get customFieldValueRepository() {
    return getCustomFieldsContainer().customFieldValueRepository;
  },
  get fieldGroupRepository() {
    return getCustomFieldsContainer().fieldGroupRepository;
  },
  get optionSetRepository() {
    return getCustomFieldsContainer().optionSetRepository;
  },
  get entityLookupRepository() {
    return getCustomFieldsContainer().entityLookupRepository;
  },
  get keyManagementRepository() {
    return getCustomFieldsContainer().keyManagementRepository;
  },
};
