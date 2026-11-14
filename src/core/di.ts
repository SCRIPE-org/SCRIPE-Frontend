import { NotificationService } from "./services/notification.service";
import { PublicApiService } from "./services/public-api.service";
import { NavigationRepository } from "./navigation";
import { DataExchangeService } from "./data-exchange/data/services/DataExchangeService";
import { DataExchangeRepository } from "./data-exchange/data/repositories/DataExchangeRepository";
import type { IApiService } from "./interfaces/api.interface";
import type { IPublicApiService } from "./interfaces/public-api.interface";
import type { INavigationRepository } from "./navigation";
import type { IDataExchangeRepository } from "./data-exchange/domain/interfaces/IDataExchangeRepository";
import { getBaseApiService } from "./services/api-factory";

/**
 * Core Dependency Injection Container
 *
 * Single source of truth for core service instantiation.
 *
 * Clean Architecture:
 *  - Core owns: ApiService, PublicApiService, NotificationService, NavigationRepository
 *  - Auth module owns its own services/repos (see modules/auth/di.ts)
 *  - ServiceProvider wraps this for React context access
 */
export interface CoreContainer {
  apiService: IApiService;
  publicApiService: IPublicApiService;
  notificationService: NotificationService;
  /** Navigation data access — implements INavigationRepository (JIT caching, access checks) */
  navigationRepository: INavigationRepository;
  /** Universal metadata-driven Data Exchange Studio repository */
  dataExchangeRepository: IDataExchangeRepository;
}

// Singleton instance
let container: CoreContainer | null = null;

/**
 * Initialise core container (called once at app startup via getCoreContainer).
 */
function initContainer(): CoreContainer {
  const apiService = getBaseApiService();
  const notificationService = new NotificationService();
  const publicApiService = new PublicApiService(apiService);
  const navigationRepository = new NavigationRepository(apiService);
  const dataExchangeService = new DataExchangeService(apiService);
  const dataExchangeRepository = new DataExchangeRepository(dataExchangeService);

  return {
    apiService,
    publicApiService,
    notificationService,
    navigationRepository,
    dataExchangeRepository,
  };
}

/**
 * Get the core container singleton.
 */
export function getCoreContainer(): CoreContainer {
  if (!container) {
    container = initContainer();
  }
  return container;
}
