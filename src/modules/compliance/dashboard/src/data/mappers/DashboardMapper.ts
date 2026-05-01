/**
 * Dashboard Mapper — Model ↔ Entity conversion.
 * Repositories MUST use this mapper. Never construct entities directly.
 */
import { ComplianceDashboard } from "../../domain/entities/DashboardData";
import type { DashboardData, RegulationCoverageData } from "../../domain/entities/DashboardData";
import type { DashboardModel, RegulationCoverageModel } from "../models/DashboardModels";

export class DashboardMapper {
  static toEntity(model: DashboardModel): ComplianceDashboard {
    const coverage: RegulationCoverageData[] = (model.regulationCoverage ?? []).map(
      (r: RegulationCoverageModel): RegulationCoverageData => ({
        code: r.code ?? "",
        name: r.name ?? "",
        isActive: r.isActive ?? false,
        tenantsUsingCount: r.tenantsUsingCount ?? 0,
      })
    );

    const data: DashboardData = {
      openDsrCount: model.openDsrCount ?? 0,
      pendingDsrCount: model.pendingDsrCount ?? 0,
      overdueDsrCount: model.overdueDsrCount ?? 0,
      slaCompliancePercent: model.slaCompliancePercent ?? 0,
      consentOptInRate: model.consentOptInRate ?? 0,
      subjectsRequiringReConsent: model.subjectsRequiringReConsent ?? 0,
      regulationCoverage: coverage,
    };
    return new ComplianceDashboard(data);
  }
}
