/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Compliance Module DI Container
 *
 * Central dependency injection for all compliance sub-modules.
 * Follows the entitlements/di.ts pattern exactly.
 *
 * Architecture:
 * - Services implement IService interfaces (API calls only)
 * - Repositories use IService interfaces and map Models → Entities
 * - ViewModels use IRepository interfaces (never Services directly)
 */
import { getModuleApiService } from "@core/services/api-factory";

// ── Service Implementations ──────────────────────────────────────────────────
import { DashboardService } from "./dashboard/src/data/services/DashboardService";
import { DsrService } from "./dsr/src/data/services/DsrService";
import { ConsentService } from "./consent/src/data/services/ConsentService";
import { RetentionService } from "./retention/src/data/services/RetentionService";
import { InventoryService } from "./inventory/src/data/services/InventoryService";
import { ReportService } from "./reports/src/data/services/ReportService";
import { RegulationService } from "./regulations/src/data/services/RegulationService";

// ── Repository Implementations ───────────────────────────────────────────────
import { DashboardRepository } from "./dashboard/src/data/repositories/DashboardRepository";
import { DsrRepository } from "./dsr/src/data/repositories/DsrRepository";
import { ConsentRepository } from "./consent/src/data/repositories/ConsentRepository";
import { RetentionRepository } from "./retention/src/data/repositories/RetentionRepository";
import { InventoryRepository } from "./inventory/src/data/repositories/InventoryRepository";
import { ReportRepository } from "./reports/src/data/repositories/ReportRepository";
import { RegulationRepository } from "./regulations/src/data/repositories/RegulationRepository";

// ── Repository Interfaces (exposed to consumers) ─────────────────────────────
import type { IDashboardRepository } from "./dashboard/src/domain/interfaces/IDashboardRepository";
import type { IDsrRepository } from "./dsr/src/domain/interfaces/IDsrRepository";
import type { IConsentRepository } from "./consent/src/domain/interfaces/IConsentRepository";
import type { IRetentionRepository } from "./retention/src/domain/interfaces/IRetentionRepository";
import type { IInventoryRepository } from "./inventory/src/domain/interfaces/IInventoryRepository";
import type { IReportRepository } from "./reports/src/domain/interfaces/IReportRepository";
import type { IRegulationRepository } from "./regulations/src/domain/interfaces/IRegulationRepository";

// ── Service Interfaces (used internally for DI wiring) ───────────────────────
import type { IDashboardService } from "./dashboard/src/domain/interfaces/IDashboardService";
import type { IDsrService } from "./dsr/src/domain/interfaces/IDsrService";
import type { IConsentService } from "./consent/src/domain/interfaces/IConsentService";
import type { IRetentionService } from "./retention/src/domain/interfaces/IRetentionService";
import type { IInventoryService } from "./inventory/src/domain/interfaces/IInventoryService";
import type { IReportService } from "./reports/src/domain/interfaces/IReportService";
import type { IRegulationService } from "./regulations/src/domain/interfaces/IRegulationService";

// ── Container Interface ───────────────────────────────────────────────────────

export interface ComplianceContainer {
  dashboardRepository: IDashboardRepository;
  dsrRepository: IDsrRepository;
  consentRepository: IConsentRepository;
  retentionRepository: IRetentionRepository;
  inventoryRepository: IInventoryRepository;
  reportRepository: IReportRepository;
  regulationRepository: IRegulationRepository;
}

let _container: ComplianceContainer | null = null;

/**
 * Get the compliance container (lazy initialization)
 */
export function getComplianceContainer(): ComplianceContainer {
  if (typeof window === "undefined") {
    const dummyProxy = new Proxy({} as any, {
      get() {
        return () => Promise.resolve({});
      },
    });
    return {
      dashboardRepository: dummyProxy,
      dsrRepository: dummyProxy,
      consentRepository: dummyProxy,
      retentionRepository: dummyProxy,
      inventoryRepository: dummyProxy,
      reportRepository: dummyProxy,
      regulationRepository: dummyProxy,
    };
  }

  if (!_container) {
    const apiService = getModuleApiService("COMPLIANCE");

    // ── Create Services (typed as interfaces) ──
    const dashboardService: IDashboardService = new DashboardService(apiService);
    const dsrService: IDsrService = new DsrService(apiService);
    const consentService: IConsentService = new ConsentService(apiService);
    const retentionService: IRetentionService = new RetentionService(apiService);
    const inventoryService: IInventoryService = new InventoryService(apiService);
    const reportService: IReportService = new ReportService(apiService);
    const regulationService: IRegulationService = new RegulationService(apiService);

    // ── Create Repositories (IService → IRepository mapping) ──
    _container = {
      dashboardRepository: new DashboardRepository(dashboardService),
      dsrRepository: new DsrRepository(dsrService),
      consentRepository: new ConsentRepository(consentService),
      retentionRepository: new RetentionRepository(retentionService),
      inventoryRepository: new InventoryRepository(inventoryService),
      reportRepository: new ReportRepository(reportService),
      regulationRepository: new RegulationRepository(regulationService),
    };
  }

  return _container;
}

/**
 * Compliance container accessor (for use in components and viewmodels)
 */
export const complianceContainer = {
  get dashboardRepository() {
    return getComplianceContainer().dashboardRepository;
  },
  get dsrRepository() {
    return getComplianceContainer().dsrRepository;
  },
  get consentRepository() {
    return getComplianceContainer().consentRepository;
  },
  get retentionRepository() {
    return getComplianceContainer().retentionRepository;
  },
  get inventoryRepository() {
    return getComplianceContainer().inventoryRepository;
  },
  get reportRepository() {
    return getComplianceContainer().reportRepository;
  },
  get regulationRepository() {
    return getComplianceContainer().regulationRepository;
  },
};
