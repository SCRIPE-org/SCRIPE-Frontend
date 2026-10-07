export interface HealthCheckItemDto {
  name: string;
  status: string;
  description: string;
  durationMs: number;
  tags: string[];
  data?: Record<string, string>;
}

export interface ExternalDependencyDto {
  name: string;
  category: string;
  status: string;
  latencyMs: number;
  description: string;
  lastCheckedAt: string;
}

export interface HealthIncidentDto {
  id: string;
  title: string;
  affectedService: string;
  severity: "Critical" | "Warning" | "Info" | string;
  status: "Investigating" | "Degraded" | "Resolved" | "Completed" | string;
  description: string;
  impact: string;
  detectedAt: string;
  resolvedAt?: string | null;
}

export interface PlatformHealthResponseDto {
  status: string;
  timestamp: string;
  healthScore?: number;
  totalChecks?: number;
  healthyChecks?: number;
  runtime: {
    processStartTime: string;
    uptime: string;
    uptimeSeconds: number;
    managedHeapBytes: number;
    managedHeapFormatted: string;
    workingSetBytes: number;
    workingSetFormatted: string;
    gcGen0Collections: number;
    gcGen1Collections: number;
    gcGen2Collections: number;
    threadPoolAvailableWorkers: number;
    threadPoolMaxWorkers: number;
    threadPoolActiveWorkers: number;
    threadPoolAvailableIo: number;
    threadPoolMaxIo: number;
    clrVersion: string;
  };
  infrastructure: {
    database: {
      status: string;
      latencyMs: number;
      provider: string;
      isConnected: boolean;
    };
    redis: {
      status: string;
      latencyMs: number;
      isConnected: boolean;
      isConfigured: boolean;
      mode: string;
    };
  };
  modules: Array<{
    name: string;
    routePrefix: string;
    version: string;
    status: string;
    isActive: boolean;
  }>;
  checks?: HealthCheckItemDto[];
  externalDependencies?: ExternalDependencyDto[];
  incidents?: HealthIncidentDto[];
}
