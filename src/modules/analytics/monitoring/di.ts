/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Monitoring Module DI Container
 *
 * Provides dependency injection for monitoring submodules:
 * Dashboard, Analytics, Audit, Security Monitor
 *
 * These modules aggregate and display platform health data.
 * Backend API: Identity
 */
import { getModuleApiService } from "@core/services/api-factory";

// Services
import { DashboardService } from "./dashboard/src/data/services/DashboardService";
import { AuditService } from "./audit/src/data/services/AuditService";
import { SecurityService } from "./security/src/data/services/SecurityService";
import { AnalyticsService } from "./analytics/src/data/services/AnalyticsService";

// Repositories
import { DashboardRepository } from "./dashboard/src/data/repositories/DashboardRepository";
import { AuditRepository } from "./audit/src/data/repositories/AuditRepository";
import { SecurityRepository } from "./security/src/data/repositories/SecurityRepository";
import { AnalyticsRepository } from "./analytics/src/data/repositories/AnalyticsRepository";
import { PlatformHealthService } from "./platform-health/src/data/services/PlatformHealthService";
import { PlatformHealthRepository } from "./platform-health/src/data/repositories/PlatformHealthRepository";

// Interfaces
import type { IDashboardRepository } from "./dashboard/src/domain/interfaces/IDashboardRepository";
import type { IAuditRepository } from "./audit/src/domain/interfaces/IAuditRepository";
import type { ISecurityRepository } from "./security/src/domain/interfaces/ISecurityRepository";
import type { IAnalyticsRepository } from "./analytics/src/domain/interfaces/IAnalyticsRepository";
import type { IPlatformHealthRepository } from "./platform-health/src/domain/interfaces/IPlatformHealthRepository";

export interface MonitoringContainer {
  dashboardRepository: IDashboardRepository;
  auditRepository: IAuditRepository;
  securityRepository: ISecurityRepository;
  analyticsRepository: IAnalyticsRepository;
  platformHealthRepository: IPlatformHealthRepository;
}

let _container: MonitoringContainer | null = null;

/**
 * Get the monitoring container (lazy initialization)
 * Uses IDENTITY API service — monitoring controllers live in the Identity backend
 */
export function getMonitoringContainer(): MonitoringContainer {
  if (typeof window === "undefined") {
    const dummyProxy = new Proxy({} as any, {
      get() {
        return () => Promise.resolve({});
      },
    });
    return {
      dashboardRepository: dummyProxy,
      auditRepository: dummyProxy,
      securityRepository: dummyProxy,
      analyticsRepository: dummyProxy,
      platformHealthRepository: dummyProxy,
    };
  }

  if (!_container) {
    const apiService = getModuleApiService("IDENTITY");

    _container = {
      dashboardRepository: new DashboardRepository(new DashboardService(apiService)),
      auditRepository: new AuditRepository(new AuditService(apiService)),
      securityRepository: new SecurityRepository(new SecurityService(apiService)),
      analyticsRepository: new AnalyticsRepository(new AnalyticsService(apiService)),
      platformHealthRepository: new PlatformHealthRepository(new PlatformHealthService(apiService)),
    };
  }

  return _container;
}

/**
 * Monitoring container accessor (for use in components)
 */
export const monitoringContainer = {
  get dashboardRepository() {
    return getMonitoringContainer().dashboardRepository;
  },
  get auditRepository() {
    return getMonitoringContainer().auditRepository;
  },
  get securityRepository() {
    return getMonitoringContainer().securityRepository;
  },
  get analyticsRepository() {
    return getMonitoringContainer().analyticsRepository;
  },
  get platformHealthRepository() {
    return getMonitoringContainer().platformHealthRepository;
  },
};
