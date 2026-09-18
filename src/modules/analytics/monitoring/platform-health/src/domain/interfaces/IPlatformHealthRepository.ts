import type { PlatformHealth } from "../entities/PlatformHealth";

export interface IPlatformHealthRepository {
  getHealth(signal?: AbortSignal): Promise<PlatformHealth>;
}
