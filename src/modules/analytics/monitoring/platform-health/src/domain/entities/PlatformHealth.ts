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

export interface DatabaseHealth {
  status: string;
  latencyMs: number;
  provider: string;
  isConnected: boolean;
}

export interface RedisHealth {
  status: string;
  latencyMs: number;
  isConnected: boolean;
  isConfigured: boolean;
  mode: string;
}

export interface InfrastructureHealth {
  database: DatabaseHealth;
  redis: RedisHealth;
}

export interface ModuleHealth {
  name: string;
  routePrefix: string;
  version: string;
  status: string;
  isActive: boolean;
}

export interface PlatformHealthData {
  status: string;
  timestamp: string;
  runtime: RuntimeVitals;
  infrastructure: InfrastructureHealth;
  modules: ModuleHealth[];
}

export class PlatformHealth {
  constructor(private readonly data: PlatformHealthData) {}

  get status() {
    return this.data.status;
  }
  get timestamp() {
    return this.data.timestamp;
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
