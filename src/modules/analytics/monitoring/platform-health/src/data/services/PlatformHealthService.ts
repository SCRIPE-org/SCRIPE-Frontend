import type { IApiService } from "@core/interfaces/api.interface";
import { PLATFORM_HEALTH_ENDPOINTS } from "./platform-health.endpoints";
import type { PlatformHealthResponseDto } from "../models/platform-health.dto";

import type { IPlatformHealthService } from "../../domain/interfaces/IPlatformHealthService";

export type { IPlatformHealthService };

export class PlatformHealthService implements IPlatformHealthService {
  constructor(private readonly api: IApiService) {}

  async getHealth(signal?: AbortSignal): Promise<PlatformHealthResponseDto> {
    return this.api.get<PlatformHealthResponseDto>(PLATFORM_HEALTH_ENDPOINTS.HEALTH, undefined, signal);
  }
}
