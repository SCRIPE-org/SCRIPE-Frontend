import { NotificationService } from "./services/notification.service";
import type { IApiService } from "./interfaces/api.interface";
import { getBaseApiService } from "./services/api-factory";

/**
 * Core Dependency Injection Container
 *
 * This is the SINGLE source of truth for core service instantiation.
 *
 * Clean Architecture:
 * - Core only owns ApiService + NotificationService
 * - Auth module owns its own AuthService + AuthRepository (see auth/di.ts)
 * - ServiceProvider wraps this for React access
 */
export interface CoreContainer {
  apiService: IApiService;
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

  return {
    apiService,
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
