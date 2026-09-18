export interface PlatformHealthResponseDto {
  status: string;
  timestamp: string;
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
}
