import type { DashboardSummary, RecentChange } from "../../domain/entities/DashboardEntities";

/**
 * Bidirectional data mapper orchestrating conversion between database DTO formats and frontend domain entities, enforcing null-safe defaults.
 */
export class DashboardMapper {
  static toSummaryEntity(dto: Partial<DashboardSummary>): DashboardSummary {
    return {
      totalAdmins: dto.totalAdmins ?? 0,
      activeAdmins: dto.activeAdmins ?? 0,
      totalUsers: dto.totalUsers ?? 0,
      activeUsers: dto.activeUsers ?? 0,
      totalTenants: dto.totalTenants ?? 0,
      activeTenants: dto.activeTenants ?? 0,
      totalRoles: dto.totalRoles ?? 0,
      loginsToday: dto.loginsToday ?? 0,
      failedLogins24h: dto.failedLogins24h ?? 0,
      totalMrrUsd: dto.totalMrrUsd ?? 0,
      totalActiveSubscriptions: dto.totalActiveSubscriptions ?? 0,
      trialSubscriptions: dto.trialSubscriptions ?? 0,
    };
  }

  static toRecentChangeEntity(dto: Partial<RecentChange>): RecentChange {
    return {
      id: dto.id ?? "",
      eventType: dto.eventType ?? "",
      httpMethod: dto.httpMethod ?? null,
      endpoint: dto.endpoint ?? null,
      entityType: dto.entityType ?? null,
      entityId: dto.entityId ?? null,
      username: dto.username ?? null,
      isAdmin: dto.isAdmin ?? false,
      ipAddress: dto.ipAddress ?? null,
      isSuccess: dto.isSuccess ?? false,
      errorMessage: dto.errorMessage ?? null,
      timestamp: dto.timestamp ?? "",
      tenantId: dto.tenantId ?? null,
    };
  }
}
