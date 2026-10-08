import type { PlatformHealth } from "../entities/PlatformHealth";

/**
 * IPlatformHealthRepository
 */
export interface IPlatformHealthRepository {
  getHealth(signal?: AbortSignal): Promise<PlatformHealth>;
}
