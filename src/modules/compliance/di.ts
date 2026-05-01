/**
* Compliance Module DI Container
*
* Provides dependency injection for the Compliance module.
*
* Clean Architecture Pattern:
* - Services wrap IApiService (API calls only)
* - Repositories use Services and map Models → Entities
* - ViewModels use Repositories
*/
import { getModuleApiService } from "@/core/services/api-factory";

// Service
import { ComplianceService } from "./src/data/services/ComplianceService";

// Repository
import { ComplianceRepository } from "./src/data/repositories/ComplianceRepository";

// Interfaces
import type { IComplianceRepository } from "./src/domain/interfaces/IComplianceRepository";
import type { IComplianceService } from "./src/domain/interfaces/IComplianceService";

export interface ComplianceContainer {
complianceService: IComplianceService;
complianceRepository: IComplianceRepository;
}

let _container: ComplianceContainer | null = null;

/**
* Get the Compliance container (lazy initialization)
*/
export function getComplianceContainer(): ComplianceContainer {
if (!_container) {
const apiService = getModuleApiService("COMPLIANCE");

// Create Service (wraps IApiService)
const complianceService = new ComplianceService(apiService);

// Create Repository (uses Service)
_container = {
complianceService,
complianceRepository: new ComplianceRepository(complianceService),
};
}

return _container;
}

/**
* Compliance container accessor (for use in components)
*/
export const complianceContainer = {
get complianceRepository() {
return getComplianceContainer().complianceRepository;
},
};