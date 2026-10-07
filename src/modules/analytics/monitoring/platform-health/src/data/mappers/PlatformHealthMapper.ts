import { PlatformHealth } from "../../domain/entities/PlatformHealth";
import type { PlatformHealthResponseDto } from "../models/platform-health.dto";

export class PlatformHealthMapper {
  static toEntity(dto: Partial<PlatformHealthResponseDto>): PlatformHealth {
    return new PlatformHealth({
      status: dto.status ?? "Healthy",
      timestamp: dto.timestamp ?? new Date().toISOString(),
      runtime: {
        processStartTime: dto.runtime?.processStartTime ?? "",
        uptime: dto.runtime?.uptime ?? "",
        uptimeSeconds: dto.runtime?.uptimeSeconds ?? 0,
        managedHeapBytes: dto.runtime?.managedHeapBytes ?? 0,
        managedHeapFormatted: dto.runtime?.managedHeapFormatted ?? "0 B",
        workingSetBytes: dto.runtime?.workingSetBytes ?? 0,
        workingSetFormatted: dto.runtime?.workingSetFormatted ?? "0 B",
        gcGen0Collections: dto.runtime?.gcGen0Collections ?? 0,
        gcGen1Collections: dto.runtime?.gcGen1Collections ?? 0,
        gcGen2Collections: dto.runtime?.gcGen2Collections ?? 0,
        threadPoolAvailableWorkers: dto.runtime?.threadPoolAvailableWorkers ?? 0,
        threadPoolMaxWorkers: dto.runtime?.threadPoolMaxWorkers ?? 0,
        threadPoolActiveWorkers: dto.runtime?.threadPoolActiveWorkers ?? 0,
        threadPoolAvailableIo: dto.runtime?.threadPoolAvailableIo ?? 0,
        threadPoolMaxIo: dto.runtime?.threadPoolMaxIo ?? 0,
        clrVersion: dto.runtime?.clrVersion ?? "",
      },
      infrastructure: {
        database: {
          status: dto.infrastructure?.database?.status ?? "Healthy",
          latencyMs: dto.infrastructure?.database?.latencyMs ?? 0,
          provider: dto.infrastructure?.database?.provider ?? "Relational",
          isConnected: dto.infrastructure?.database?.isConnected ?? true,
        },
        redis: {
          status: dto.infrastructure?.redis?.status ?? "Healthy",
          latencyMs: dto.infrastructure?.redis?.latencyMs ?? 0,
          isConnected: dto.infrastructure?.redis?.isConnected ?? false,
          isConfigured: dto.infrastructure?.redis?.isConfigured ?? false,
          mode: dto.infrastructure?.redis?.mode ?? "InMemory",
        },
      },
      healthScore: dto.healthScore,
      totalChecks: dto.totalChecks,
      healthyChecks: dto.healthyChecks,
      modules: (dto.modules ?? []).map((m) => ({
        name: m.name ?? "",
        routePrefix: m.routePrefix ?? "",
        version: m.version ?? "",
        status: m.status ?? "Active",
        isActive: m.isActive ?? true,
      })),
      checks: (dto.checks ?? []).map((c) => ({
        name: c.name ?? "",
        status: c.status ?? "Healthy",
        description: c.description ?? "",
        durationMs: c.durationMs ?? 0,
        tags: c.tags ?? [],
        data: c.data,
      })),
      externalDependencies: (dto.externalDependencies ?? []).map((d) => ({
        name: d.name ?? "",
        category: d.category ?? "",
        status: d.status ?? "Healthy",
        latencyMs: d.latencyMs ?? 0,
        description: d.description ?? "",
        lastCheckedAt: d.lastCheckedAt ?? new Date().toISOString(),
      })),
      incidents: (dto.incidents ?? []).map((inc) => ({
        id: inc.id ?? "",
        title: inc.title ?? "",
        affectedService: inc.affectedService ?? "",
        severity: inc.severity ?? "Warning",
        status: inc.status ?? "Investigating",
        description: inc.description ?? "",
        impact: inc.impact ?? "",
        detectedAt: inc.detectedAt ?? new Date().toISOString(),
        resolvedAt: inc.resolvedAt,
      })),
    });
  }
}
