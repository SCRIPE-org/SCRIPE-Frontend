import { NotificationService } from "./services/notification.service";
import { PublicApiService } from "./services/public-api.service";
import type { IApiService } from "./interfaces/api.interface";
import type { IPublicApiService } from "./interfaces/public-api.interface";
import { getBaseApiService } from "./services/api-factory";

/**
 * Core Dependency Injection Container
 *
 * This is the SINGLE source of truth for core service instantiation.
 *
 * Clean Architecture:
 * - Core owns ApiService, PublicApiService + NotificationService
 * - Auth module owns its own AuthService + AuthRepository (see auth/di.ts)
 * - ServiceProvider wraps this for React access
 */
export interface CoreContainer {
  apiService: IApiService;
  publicApiService: IPublicApiService;
  notificationService: NotificationService;
}

// Singleton instance
let container: CoreContainer | null = null;

/**
 * Initialize core container (called once at app startup)
 */
function initContainer(): CoreContainer {
  const apiService = getBaseApiService();
  const notificationService = new NotificationService();
  const publicApiService = new PublicApiService(apiService);

  return {
    apiService,
    publicApiService,
    notificationService,
  };
}

/**
 * Get the core container singleton
 */
export function getCoreContainer(): CoreContainer {
  if (!container) {
    container = initContainer();
  }
  return container;
}
