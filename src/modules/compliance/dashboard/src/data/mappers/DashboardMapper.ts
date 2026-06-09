/**
 * Dashboard Mapper — Model ↔ Entity conversion.
 * Repositories MUST use this mapper. Never construct entities directly.
 */
import { ComplianceDashboard } from "../../domain/entities/DashboardData";
import type { DashboardData, RegulationCoverageData } from "../../domain/entities/DashboardData";
import type { DashboardModel } from "../models/DashboardModels";
import { z } from "zod";
import { safeParseApiResponse, optionalString } from "@core/common/zod-utils";

// ─── Zod Schemas ─────────────────────────────────────────────────────────────

const RegulationCoverageSchema = z.object({
  code: optionalString(),
  name: optionalString(),
  isActive: z.boolean().optional().default(false),
  tenantsUsingCount: z.number().int().optional().default(0),
});

const DashboardModelSchema = z.object({
  openDsrCount: z.number().int().optional().default(0),
  pendingDsrCount: z.number().int().optional().default(0),
  overdueDsrCount: z.number().int().optional().default(0),
  slaCompliancePercent: z.number().optional().default(0),
  consentOptInRate: z.number().optional().default(0),
  subjectsRequiringReConsent: z.number().int().optional().default(0),
  regulationCoverage: z.array(RegulationCoverageSchema).optional().default([]),
});

export class DashboardMapper {
  static toEntity(model: DashboardModel): ComplianceDashboard {
    const validated = safeParseApiResponse(DashboardModelSchema, model, "ComplianceDashboard");

    const coverage: RegulationCoverageData[] = (validated.regulationCoverage ?? []).map(
      (r): RegulationCoverageData => ({
        code: r.code ?? "",
        name: r.name ?? "",
        isActive: r.isActive ?? false,
        tenantsUsingCount: r.tenantsUsingCount ?? 0,
      })
    );

    const data: DashboardData = {
      openDsrCount: validated.openDsrCount ?? 0,
      pendingDsrCount: validated.pendingDsrCount ?? 0,
      overdueDsrCount: validated.overdueDsrCount ?? 0,
      slaCompliancePercent: validated.slaCompliancePercent ?? 0,
      consentOptInRate: validated.consentOptInRate ?? 0,
      subjectsRequiringReConsent: validated.subjectsRequiringReConsent ?? 0,
      regulationCoverage: coverage,
    };
    return new ComplianceDashboard(data);
  }
}
