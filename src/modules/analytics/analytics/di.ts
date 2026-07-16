/**
 * Analytics Module DI Container
 *
 * Provides dependency injection for the Analytics Event Foundation.
 */
import { getModuleApiService } from "@/core/services/api-factory";

// Service
import { AnalyticsEventService } from "./events/src/data/services/AnalyticsEventService";

// Repository
import { AnalyticsEventRepository } from "./events/src/data/repositories/AnalyticsEventRepository";

// Interfaces
import type { IAnalyticsEventService } from "./events/src/domain/interfaces/IAnalyticsEventService";
import type { IAnalyticsEventRepository } from "./events/src/domain/interfaces/IAnalyticsEventRepository";

export interface AnalyticsContainer {
  analyticsEventService: IAnalyticsEventService;
  analyticsEventRepository: IAnalyticsEventRepository;
}

let _container: AnalyticsContainer | null = null;

export function getAnalyticsContainer(): AnalyticsContainer {
  if (!_container) {
    const apiService = getModuleApiService("ANALYTICS");
    const analyticsEventService = new AnalyticsEventService(apiService);
    _container = {
      analyticsEventService,
      analyticsEventRepository: new AnalyticsEventRepository(analyticsEventService),
    };
  }
  return _container;
}

export const analyticsContainer = {
  get analyticsEventRepository() {
    return getAnalyticsContainer().analyticsEventRepository;
  },
};
