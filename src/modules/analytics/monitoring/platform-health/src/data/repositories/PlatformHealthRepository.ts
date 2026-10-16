import type { IPlatformHealthRepository } from "../../domain/interfaces/IPlatformHealthRepository";
import type { PlatformHealth } from "../../domain/entities/PlatformHealth";
import type { IPlatformHealthService } from "../services/PlatformHealthService";
import { PlatformHealthMapper } from "../mappers/PlatformHealthMapper";

/**
 * PlatformHealthRepository
 */
export class PlatformHealthRepository implements IPlatformHealthRepository {
  constructor(private readonly service: IPlatformHealthService) {}

  async getHealth(signal?: AbortSignal): Promise<PlatformHealth> {
    const dto = await this.service.getHealth(signal);
    return PlatformHealthMapper.toEntity(dto);
  }
}
