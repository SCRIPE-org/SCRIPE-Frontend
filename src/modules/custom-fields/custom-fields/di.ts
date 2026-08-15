/**
 * CustomFields Module DI Container
 *
 * Provides dependency injection for the CustomFields module.
 *
 * Clean Architecture Pattern:
 * - Services wrap IApiService (API calls only)
 * - Repositories use Services and map Models → Entities
 * - ViewModels use Repositories
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

export interface CustomFieldsContainer {
  customFieldService: ICustomFieldService;
  customFieldRepository: ICustomFieldRepository;
  customFieldValueService: ICustomFieldValueService;
  customFieldValueRepository: ICustomFieldValueRepository;
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

    _container = {
      customFieldService,
      customFieldRepository: new CustomFieldRepository(customFieldService),
      customFieldValueService,
      customFieldValueRepository: new CustomFieldValueRepository(customFieldValueService),
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
};
