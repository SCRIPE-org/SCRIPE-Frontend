import type { PlatformHealthResponseDto } from "../../data/models/platform-health.dto";

/**
 * Interface for platform health data service.
 */
export interface IPlatformHealthService {
  getHealth(signal?: AbortSignal): Promise<PlatformHealthResponseDto>;
}
