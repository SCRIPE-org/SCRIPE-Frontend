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

import { CrmAccountService } from "./accounts/src/data/services/CrmAccountService";
import { CrmAccountRepository } from "./accounts/src/data/repositories/CrmAccountRepository";
import type { ICrmAccountService } from "./accounts/src/domain/interfaces/ICrmAccountService";
import type { ICrmAccountRepository } from "./accounts/src/domain/interfaces/ICrmAccountRepository";

import { CrmContactService } from "./contacts/src/data/services/CrmContactService";
import { CrmContactRepository } from "./contacts/src/data/repositories/CrmContactRepository";
import type { ICrmContactService } from "./contacts/src/domain/interfaces/ICrmContactService";
import type { ICrmContactRepository } from "./contacts/src/domain/interfaces/ICrmContactRepository";

import { CrmActivityService } from "./activities/src/data/services/CrmActivityService";
import { CrmActivityRepository } from "./activities/src/data/repositories/CrmActivityRepository";
import type { ICrmActivityService } from "./activities/src/domain/interfaces/ICrmActivityService";
import type { ICrmActivityRepository } from "./activities/src/domain/interfaces/ICrmActivityRepository";

export interface CrmContainer {
  readonly overviewService: ICrmOverviewService;
  readonly overviewRepository: ICrmOverviewRepository;
  readonly leadService: ICrmLeadService;
  readonly leadRepository: ICrmLeadRepository;
  readonly opportunityService: ICrmOpportunityService;
  readonly opportunityRepository: ICrmOpportunityRepository;
  readonly accountService: ICrmAccountService;
  readonly accountRepository: ICrmAccountRepository;
  readonly contactService: ICrmContactService;
  readonly contactRepository: ICrmContactRepository;
  readonly activityService?: ICrmActivityService;
  readonly activityRepository?: ICrmActivityRepository;
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
    const accountService = new CrmAccountService(api);
    const accountRepository = new CrmAccountRepository(accountService);
    const contactService = new CrmContactService(api);
    const contactRepository = new CrmContactRepository(contactService);
    const activityService = new CrmActivityService(api);
    const activityRepository = new CrmActivityRepository(activityService);

    instance = {
      overviewService,
      overviewRepository,
      leadService,
      leadRepository,
      opportunityService,
      opportunityRepository,
      accountService,
      accountRepository,
      contactService,
      contactRepository,
      activityService,
      activityRepository,
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
