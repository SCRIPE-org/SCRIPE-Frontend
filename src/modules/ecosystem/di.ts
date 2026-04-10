/**
 * Ecosystem Module DI Container
 *
 * Provides dependency injection for cross-cutting ecosystem submodules:
 * Plugins, Marketplace, Integrations, Workflows, Reports, BulkOperations, Templates, Developer, RecycleBin
 *
 * These modules are served by the Identity backend API but are logically
 * separate from identity/access concerns.
 *
 * Clean Architecture Pattern:
 * - Services wrap IApiService (API calls only)
 * - Repositories use Services and map Models → Entities
 * - ViewModels use Repositories (never Services directly)
 */
import { getModuleApiService } from "@core/services/api-factory";

// Services
import { PluginsService } from "./plugins/src/data/services/PluginsService";
import { MarketplaceService } from "./marketplace/src/data/services/MarketplaceService";
import { IntegrationsService } from "./integrations/src/data/services/IntegrationsService";
import { WorkflowsService } from "./workflows/src/data/services/WorkflowsService";
import { ReportsService } from "./reports/src/data/services/ReportsService";
import { BulkOperationsService } from "./bulk-operations/src/data/services/BulkOperationsService";
import { TemplatesService } from "./templates/src/data/services/TemplatesService";
import { DeveloperService } from "./developer/src/data/services/DeveloperService";
import { RecycleBinService } from "./recycle-bin/src/data/services/RecycleBinService";
import { GraphQLService } from "./graphql/src/data/services/GraphQLService";

// Repositories
import { PluginsRepository } from "./plugins/src/data/repositories/PluginsRepository";
import { MarketplaceRepository } from "./marketplace/src/data/repositories/MarketplaceRepository";
import { IntegrationsRepository } from "./integrations/src/data/repositories/IntegrationsRepository";
import { WorkflowsRepository } from "./workflows/src/data/repositories/WorkflowsRepository";
import { ReportsRepository } from "./reports/src/data/repositories/ReportsRepository";
import { BulkOperationsRepository } from "./bulk-operations/src/data/repositories/BulkOperationsRepository";
import { TemplatesRepository } from "./templates/src/data/repositories/TemplatesRepository";
import { DeveloperRepository } from "./developer/src/data/repositories/DeveloperRepository";
import { RecycleBinRepository } from "./recycle-bin/src/data/repositories/RecycleBinRepository";
import { GraphQLRepository } from "./graphql/src/data/repositories/GraphQLRepository";

// Interfaces
import type { IPluginsRepository } from "./plugins/src/domain/interfaces/IPluginsRepository";
import type { IMarketplaceRepository } from "./marketplace/src/domain/interfaces/IMarketplaceRepository";
import type { IIntegrationsRepository } from "./integrations/src/domain/interfaces/IIntegrationsRepository";
import type { IWorkflowsRepository } from "./workflows/src/domain/interfaces/IWorkflowsRepository";
import type { IReportsRepository } from "./reports/src/domain/interfaces/IReportsRepository";
import type { IBulkOperationsRepository } from "./bulk-operations/src/domain/interfaces/IBulkOperationsRepository";
import type { ITemplatesRepository } from "./templates/src/domain/interfaces/ITemplatesRepository";
import type { IDeveloperRepository } from "./developer/src/domain/interfaces/IDeveloperRepository";
import type { IRecycleBinRepository } from "./recycle-bin/src/domain/interfaces/IRecycleBinRepository";
import type { IRecycleBinService } from "./recycle-bin/src/domain/interfaces/IRecycleBinService";
import type { IGraphQLRepository } from "./graphql/src/domain/interfaces/IGraphQLRepository";

export interface EcosystemContainer {
  pluginsRepository: IPluginsRepository;
  marketplaceRepository: IMarketplaceRepository;
  integrationsRepository: IIntegrationsRepository;
  workflowsRepository: IWorkflowsRepository;
  reportsRepository: IReportsRepository;
  bulkOperationsRepository: IBulkOperationsRepository;
  templatesRepository: ITemplatesRepository;
  developerRepository: IDeveloperRepository;
  recycleBinService: IRecycleBinService;
  recycleBinRepository: IRecycleBinRepository;
  graphqlRepository: IGraphQLRepository;
}

let _container: EcosystemContainer | null = null;

/**
 * Get the ecosystem container (lazy initialization)
 * Uses IDENTITY API service — these controllers live in the Identity backend module
 */
export function getEcosystemContainer(): EcosystemContainer {
  if (!_container) {
    const apiService = getModuleApiService("IDENTITY");

    // Create Repositories (Service → Repository mapping)
    const recycleBinService = new RecycleBinService(apiService);

    _container = {
      pluginsRepository: new PluginsRepository(new PluginsService(apiService)),
      marketplaceRepository: new MarketplaceRepository(new MarketplaceService(apiService)),
      integrationsRepository: new IntegrationsRepository(new IntegrationsService(apiService)),
      workflowsRepository: new WorkflowsRepository(new WorkflowsService(apiService)),
      reportsRepository: new ReportsRepository(new ReportsService(apiService)),
      bulkOperationsRepository: new BulkOperationsRepository(new BulkOperationsService(apiService)),
      templatesRepository: new TemplatesRepository(new TemplatesService(apiService)),
      developerRepository: new DeveloperRepository(new DeveloperService(apiService)),
      recycleBinService,
      recycleBinRepository: new RecycleBinRepository(recycleBinService),
      graphqlRepository: new GraphQLRepository(new GraphQLService(apiService)),
    };
  }

  return _container;
}

/**
 * Ecosystem container accessor (for use in components)
 */
export const ecosystemContainer = {
  get pluginsRepository() {
    return getEcosystemContainer().pluginsRepository;
  },
  get marketplaceRepository() {
    return getEcosystemContainer().marketplaceRepository;
  },
  get integrationsRepository() {
    return getEcosystemContainer().integrationsRepository;
  },
  get workflowsRepository() {
    return getEcosystemContainer().workflowsRepository;
  },
  get reportsRepository() {
    return getEcosystemContainer().reportsRepository;
  },
  get bulkOperationsRepository() {
    return getEcosystemContainer().bulkOperationsRepository;
  },
  get templatesRepository() {
    return getEcosystemContainer().templatesRepository;
  },
  get developerRepository() {
    return getEcosystemContainer().developerRepository;
  },
  get recycleBinService() {
    return getEcosystemContainer().recycleBinService;
  },
  get recycleBinRepository() {
    return getEcosystemContainer().recycleBinRepository;
  },
  get graphqlRepository() {
    return getEcosystemContainer().graphqlRepository;
  },
};
