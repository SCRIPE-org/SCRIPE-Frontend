/**
 * SCRIPE CRM Module Dependency Injection Container
 *
 * Implements strict SOLID Clean Architecture:
 * View -> ViewModel (hook) -> Repository -> Service -> IApiService -> HTTP
 *
 * Direct HTTP/fetch in presentation components is strictly prohibited.
 */

import { getModuleApiService } from "@/core/services/api-factory";
import { CrmOverviewService } from "./overview/src/data/services/CrmOverviewService";
import { CrmOverviewRepository } from "./overview/src/data/repositories/CrmOverviewRepository";
import type { ICrmOverviewService } from "./overview/src/domain/interfaces/ICrmOverviewService";
import type { ICrmOverviewRepository } from "./overview/src/domain/interfaces/ICrmOverviewRepository";

import { CrmLeadService } from "./leads/src/data/services/CrmLeadService";
import { CrmLeadRepository } from "./leads/src/data/repositories/CrmLeadRepository";
import type { ICrmLeadService } from "./leads/src/domain/interfaces/ICrmLeadService";
import type { ICrmLeadRepository } from "./leads/src/domain/interfaces/ICrmLeadRepository";

import { CrmOpportunityService } from "./opportunities/src/data/services/CrmOpportunityService";
import { CrmOpportunityRepository } from "./opportunities/src/data/repositories/CrmOpportunityRepository";
import type { ICrmOpportunityService } from "./opportunities/src/domain/interfaces/ICrmOpportunityService";
import type { ICrmOpportunityRepository } from "./opportunities/src/domain/interfaces/ICrmOpportunityRepository";

export interface CrmContainer {
  readonly overviewService: ICrmOverviewService;
  readonly overviewRepository: ICrmOverviewRepository;
  readonly leadService: ICrmLeadService;
  readonly leadRepository: ICrmLeadRepository;
  readonly opportunityService: ICrmOpportunityService;
  readonly opportunityRepository: ICrmOpportunityRepository;
}

let instance: CrmContainer | null = null;

export function getCrmContainer(): CrmContainer {
  if (!instance) {
    const api = getModuleApiService("CRM");
    const overviewService = new CrmOverviewService(api);
    const overviewRepository = new CrmOverviewRepository(overviewService);
    const leadService = new CrmLeadService(api);
    const leadRepository = new CrmLeadRepository(leadService);
    const opportunityService = new CrmOpportunityService(api);
    const opportunityRepository = new CrmOpportunityRepository(opportunityService);

    instance = {
      overviewService,
      overviewRepository,
      leadService,
      leadRepository,
      opportunityService,
      opportunityRepository,
    };
  }
  return instance;
}

/**
 * Optional override for testing / hermetic test suites
 */
export function setCrmContainer(container: CrmContainer | null): void {
  instance = container;
}
