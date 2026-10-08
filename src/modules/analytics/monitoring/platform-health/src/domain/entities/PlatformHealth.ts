/**
 * RuntimeVitals
 */
export interface RuntimeVitals {
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
}

/**
 * DatabaseHealth
 */
export interface DatabaseHealth {
  status: string;
  latencyMs: number;
  provider: string;
  isConnected: boolean;
}

/**
 * RedisHealth
 */
export interface RedisHealth {
  status: string;
  latencyMs: number;
  isConnected: boolean;
  isConfigured: boolean;
  mode: string;
}

/**
 * InfrastructureHealth
 */
export interface InfrastructureHealth {
  database: DatabaseHealth;
  redis: RedisHealth;
}

/**
 * ModuleHealth
 */
export interface ModuleHealth {
  name: string;
  routePrefix: string;
  version: string;
  status: string;
  isActive: boolean;
}

/**
 * HealthCheckItem
 */
export interface HealthCheckItem {
  name: string;
  status: string;
  description: string;
  durationMs: number;
  tags: string[];
  data?: Record<string, string>;
}

/**
 * ExternalDependency
 */
export interface ExternalDependency {
  name: string;
  category: string;
  status: string;
  latencyMs: number;
  description: string;
  lastCheckedAt: string;
}

/**
 * HealthIncident
 */
export interface HealthIncident {
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

/**
 * PlatformHealthData
 */
export interface PlatformHealthData {
  status: string;
  timestamp: string;
  healthScore?: number;
  totalChecks?: number;
  healthyChecks?: number;
  runtime: RuntimeVitals;
  infrastructure: InfrastructureHealth;
  modules: ModuleHealth[];
  checks?: HealthCheckItem[];
  externalDependencies?: ExternalDependency[];
  incidents?: HealthIncident[];
}

/**
 * PlatformHealth
 */
export class PlatformHealth {
  constructor(private readonly data: PlatformHealthData) {}

  get status() {
    return this.data.status;
  }
  get timestamp() {
    return this.data.timestamp;
  }
  get healthScore(): number {
    if (typeof this.data.healthScore === "number") return this.data.healthScore;
    const total = this.totalChecks;
    if (total === 0) return 100;
    return Math.round((this.healthyChecks / total) * 100);
  }
  get totalChecks(): number {
    return this.data.totalChecks ?? this.checks.length;
  }
  get healthyChecks(): number {
    return this.data.healthyChecks ?? this.checks.filter(c => c.status.toLowerCase() === "healthy").length;
  }
  get runtime() {
    return this.data.runtime;
  }
  get infrastructure() {
    return this.data.infrastructure;
  }
  get modules() {
    return this.data.modules;
  }
  get checks(): HealthCheckItem[] {
    return this.data.checks ?? [];
  }
  get externalDependencies(): ExternalDependency[] {
    return this.data.externalDependencies ?? [];
  }
  get incidents(): HealthIncident[] {
    return this.data.incidents ?? [];
  }
  get activeIncidents(): HealthIncident[] {
    return this.incidents.filter(inc => inc.status.toLowerCase() !== "resolved" && inc.status.toLowerCase() !== "completed");
  }
  get isHealthy() {
    return this.data.status === "Healthy";
  }
  get isDegraded() {
    return this.data.status === "Degraded";
  }
  get isUnhealthy() {
    return this.data.status === "Unhealthy";
  }
}
