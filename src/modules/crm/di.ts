/**
 * SCRIPE CRM Module Dependency Injection Container
 *
 * Implements strict SOLID Clean Architecture:
 * View -> ViewModel (hook) -> Repository -> Service -> IApiService -> HTTP
 */

import { getModuleApiService } from "@/core/services/api-factory";
import { getAuthContainer } from "@modules/auth/di";
import { useAppStore } from "@core/store/useAppStore";
import { queryClient } from "@core/query-client";
import type { IApiService } from "@core/interfaces/api.interface";

import {
  useCrmClientPrefsStore,
  type ICrmEntityLookupProvider,
  type ICrmSettingsRepository,
} from "./shared";
import { buildCrmEntityLookupProvider } from "./shared/src/utils/crmEntityLookupFactory";

import { CrmOverviewService } from "./overview/src/data/services/CrmOverviewService";
import { CrmOverviewRepository } from "./overview/src/data/repositories/CrmOverviewRepository";
import type { ICrmOverviewService } from "./overview/src/domain/interfaces/ICrmOverviewService";
import type { ICrmOverviewRepository } from "./overview/src/domain/interfaces/ICrmOverviewRepository";

import { CrmWorkflowService } from "./workflows/src/data/services/CrmWorkflowService";
import { CrmWorkflowRepository } from "./workflows/src/data/repositories/CrmWorkflowRepository";
import type { ICrmWorkflowService } from "./workflows/src/domain/interfaces/ICrmWorkflowService";
import type { ICrmWorkflowRepository } from "./workflows/src/domain/interfaces/ICrmWorkflowRepository";

import { CrmReportsService } from "./reports/src/data/services/CrmReportsService";
import { CrmReportsRepository } from "./reports/src/data/repositories/CrmReportsRepository";
import type { ICrmReportsService } from "./reports/src/domain/interfaces/ICrmReportsService";
import type { ICrmReportsRepository } from "./reports/src/domain/interfaces/ICrmReportsRepository";

import { CrmSettingsService } from "./settings/src/data/services/CrmSettingsService";
import { CrmSettingsRepository } from "./settings/src/data/repositories/CrmSettingsRepository";
import type { ICrmSettingsService } from "./settings/src/domain/interfaces/ICrmSettingsService";

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

let isLifecycleWired = false;

function wireModuleApiLifecycle(api: IApiService): void {
  if (isLifecycleWired) return;
  isLifecycleWired = true;
  if (typeof api.setRefreshHandler === "function") {
    api.setRefreshHandler(async () => {
      const { authRepository } = getAuthContainer();
      const result = await authRepository.refreshToken();
      if (result.kind === "err") {
        authRepository.clearTokens();
        return null;
      }
      return result.value.accessToken;
    });
  }
  if (typeof api.setLogoutHandler === "function") {
    api.setLogoutHandler(() => {
      useAppStore.getState().logout();
      useCrmClientPrefsStore.getState().resetClientPrefs();
      queryClient.clear();
    });
  }
}

/**
 * Dependency injection container contract for the SCRIPE CRM module.
 * Provides singleton resolution for all sub-module repositories and services.
 */
export interface CrmContainer {
  readonly overviewService: ICrmOverviewService;
  readonly overviewRepository: ICrmOverviewRepository;
  readonly workflowService: ICrmWorkflowService;
  readonly workflowRepository: ICrmWorkflowRepository;
  readonly reportsService: ICrmReportsService;
  readonly reportsRepository: ICrmReportsRepository;
  readonly settingsService: ICrmSettingsService;
  readonly settingsRepository: ICrmSettingsRepository;
  readonly leadService: ICrmLeadService;
  readonly leadRepository: ICrmLeadRepository;
  readonly opportunityService: ICrmOpportunityService;
  readonly opportunityRepository: ICrmOpportunityRepository;
  readonly accountService: ICrmAccountService;
  readonly accountRepository: ICrmAccountRepository;
  readonly contactService: ICrmContactService;
  readonly contactRepository: ICrmContactRepository;
  readonly activityService: ICrmActivityService;
  readonly activityRepository: ICrmActivityRepository;
  readonly entityLookup: ICrmEntityLookupProvider;
}

let instance: CrmContainer | null = null;

/**
 * Resolves the singleton CRM dependency injection container.
 * Auto-wires domain services and repositories to the module-isolated HTTP API client.
 * @returns Initialized CrmContainer instance.
 */
export function getCrmContainer(): CrmContainer {
  if (!instance) {
    const api = getModuleApiService("CRM");
    wireModuleApiLifecycle(api);

    const overviewService = new CrmOverviewService(api);
    const overviewRepository = new CrmOverviewRepository(overviewService);
    const workflowService = new CrmWorkflowService(api);
    const workflowRepository = new CrmWorkflowRepository(workflowService);
    const reportsService = new CrmReportsService(api);
    const reportsRepository = new CrmReportsRepository(reportsService);
    const settingsService = new CrmSettingsService(api);
    const settingsRepository = new CrmSettingsRepository(settingsService);
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
    const entityLookup = buildCrmEntityLookupProvider(
      accountRepository,
      contactRepository,
      settingsRepository
    );

    instance = {
      overviewService,
      overviewRepository,
      workflowService,
      workflowRepository,
      reportsService,
      reportsRepository,
      settingsService,
      settingsRepository,
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
      entityLookup,
    };
  }
  return instance;
}

/**
 * Optional override for testing / hermetic test suites.
 */
export function setCrmContainer(container: CrmContainer | null): void {
  instance = container;
}
