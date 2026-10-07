import { describe, it, expect } from "vitest";
import { PlatformHealthMapper } from "../PlatformHealthMapper";
import type { PlatformHealthResponseDto } from "../../models/platform-health.dto";

describe("PlatformHealthMapper", () => {
  it("maps complete DTO to PlatformHealth entity correctly", () => {
    const dto: PlatformHealthResponseDto = {
      status: "Healthy",
      timestamp: "2026-09-17T20:00:00.000Z",
      runtime: {
        processStartTime: "2026-09-17T18:00:00.000Z",
        uptime: "02:00:00",
        uptimeSeconds: 7200,
        managedHeapBytes: 15728640,
        managedHeapFormatted: "15.00 MB",
        workingSetBytes: 41943040,
        workingSetFormatted: "40.00 MB",
        gcGen0Collections: 12,
        gcGen1Collections: 4,
        gcGen2Collections: 1,
        threadPoolAvailableWorkers: 32760,
        threadPoolMaxWorkers: 32767,
        threadPoolActiveWorkers: 7,
        threadPoolAvailableIo: 1000,
        threadPoolMaxIo: 1000,
        clrVersion: "10.0.0",
      },
      infrastructure: {
        database: {
          status: "Healthy",
          latencyMs: 1.45,
          provider: "SqlServer",
          isConnected: true,
        },
        redis: {
          status: "Healthy",
          latencyMs: 0.82,
          isConnected: true,
          isConfigured: true,
          mode: "Distributed",
        },
      },
      modules: [
        {
          name: "Identity",
          routePrefix: "/api/v1/identity",
          version: "1.0.0",
          status: "Active",
          isActive: true,
        },
        {
          name: "Entitlements",
          routePrefix: "/api/v1/entitlements",
          version: "1.0.0",
          status: "Active",
          isActive: true,
        },
      ],
    };

    const entity = PlatformHealthMapper.toEntity(dto);

    expect(entity.status).toBe("Healthy");
    expect(entity.isHealthy).toBe(true);
    expect(entity.runtime.uptime).toBe("02:00:00");
    expect(entity.runtime.managedHeapFormatted).toBe("15.00 MB");
    expect(entity.runtime.workingSetFormatted).toBe("40.00 MB");
    expect(entity.runtime.threadPoolActiveWorkers).toBe(7);
    expect(entity.infrastructure.database.latencyMs).toBe(1.45);
    expect(entity.infrastructure.database.provider).toBe("SqlServer");
    expect(entity.infrastructure.redis.isConnected).toBe(true);
    expect(entity.modules).toHaveLength(2);
    expect(entity.modules[0].name).toBe("Identity");
  });

  it("handles empty / partial DTO gracefully with safe defaults", () => {
    const partialDto: Partial<PlatformHealthResponseDto> = {
      status: "Degraded",
    };

    const entity = PlatformHealthMapper.toEntity(partialDto);

    expect(entity.status).toBe("Degraded");
    expect(entity.isHealthy).toBe(false);
    expect(entity.runtime.managedHeapBytes).toBe(0);
    expect(entity.runtime.managedHeapFormatted).toBe("0 B");
    expect(entity.infrastructure.database.status).toBe("Healthy");
    expect(entity.infrastructure.redis.mode).toBe("InMemory");
    expect(entity.modules).toEqual([]);
    expect(entity.checks).toEqual([]);
    expect(entity.externalDependencies).toEqual([]);
    expect(entity.incidents).toEqual([]);
    expect(entity.healthScore).toBe(100);
  });

  it("maps checks, external dependencies, and incidents correctly", () => {
    const dto: Partial<PlatformHealthResponseDto> = {
      healthScore: 95,
      totalChecks: 20,
      healthyChecks: 19,
      checks: [
        {
          name: "database",
          status: "Healthy",
          description: "Database ping",
          durationMs: 3.5,
          tags: ["db"],
        },
      ],
      externalDependencies: [
        {
          name: "Email Delivery (SMTP)",
          category: "Messaging",
          status: "Healthy",
          latencyMs: 45,
          description: "SMTP provider",
          lastCheckedAt: "2026-09-17T20:00:00.000Z",
        },
      ],
      incidents: [
        {
          id: "inc-1",
          title: "Test incident",
          affectedService: "TestService",
          severity: "Warning",
          status: "Investigating",
          description: "Test description",
          impact: "None",
          detectedAt: "2026-09-17T19:50:00.000Z",
        },
      ],
    };

    const entity = PlatformHealthMapper.toEntity(dto);

    expect(entity.healthScore).toBe(95);
    expect(entity.totalChecks).toBe(20);
    expect(entity.healthyChecks).toBe(19);
    expect(entity.checks).toHaveLength(1);
    expect(entity.checks[0].name).toBe("database");
    expect(entity.externalDependencies).toHaveLength(1);
    expect(entity.externalDependencies[0].name).toBe("Email Delivery (SMTP)");
    expect(entity.incidents).toHaveLength(1);
    expect(entity.activeIncidents).toHaveLength(1);
    expect(entity.incidents[0].id).toBe("inc-1");
  });
});

