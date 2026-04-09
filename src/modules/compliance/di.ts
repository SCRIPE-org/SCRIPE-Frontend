/**
 * Compliance Module DI Container
 *
 * Provides dependency injection for compliance submodules:
 * Compliance (GDPR/DSR/Consent/Evidence), Security Policies
 *
 * Backend API: Identity
 */
import { getModuleApiService } from "@core/services/api-factory";

// Services
import { ComplianceService } from "./compliance/src/data/services/ComplianceService";
import { SecurityPoliciesService } from "./security-policies/src/data/services/SecurityPoliciesService";

// Repositories
import { ComplianceRepository } from "./compliance/src/data/repositories/ComplianceRepository";
import { SecurityPoliciesRepository } from "./security-policies/src/data/repositories/SecurityPoliciesRepository";

// Interfaces
import type { IComplianceRepository } from "./compliance/src/domain/interfaces/IComplianceRepository";
import type { ISecurityPoliciesRepository } from "./security-policies/src/domain/interfaces/ISecurityPoliciesRepository";

export interface ComplianceContainer {
  complianceRepository: IComplianceRepository;
  securityPoliciesRepository: ISecurityPoliciesRepository;
}

let _container: ComplianceContainer | null = null;

/**
 * Get the compliance container (lazy initialization)
 * Uses IDENTITY API service — compliance controllers live in the Identity backend
 */
export function getComplianceContainer(): ComplianceContainer {
  if (!_container) {
    const apiService = getModuleApiService("IDENTITY");

    _container = {
      complianceRepository: new ComplianceRepository(new ComplianceService(apiService)),
      securityPoliciesRepository: new SecurityPoliciesRepository(new SecurityPoliciesService(apiService)),
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
  get securityPoliciesRepository() {
    return getComplianceContainer().securityPoliciesRepository;
  },
};
