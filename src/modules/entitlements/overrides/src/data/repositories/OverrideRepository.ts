/**
 * Override Repository — uses Service + Mapper
 *
 * Implements IOverrideRepository using OverrideService for API calls
 * and OverrideMapper for DTO → Entity conversion.
 */
import type { IOverrideRepository } from "../../domain/interfaces/IOverrideRepository";
import type { FeatureOverride, ResolvedFeature } from "../../domain/entities/Override";
import type { IOverrideService } from "../../domain/interfaces/IOverrideService";
import { OverrideMapper } from "../mappers/OverrideMapper";

/**
 * Repository implementation for managing database operations on Override resources.
 */
export class OverrideRepository implements IOverrideRepository {
  constructor(private readonly service: IOverrideService) {}

  async getOverrides(tenantId: string): Promise<FeatureOverride[]> {
    const models = await this.service.getOverrides(tenantId);
    return models.map(OverrideMapper.toOverrideEntity);
  }

  async getResolved(tenantId: string): Promise<ResolvedFeature[]> {
    const models = await this.service.getResolved(tenantId);
    return models.map(OverrideMapper.toResolvedEntity);
  }

  async setOverride(
    tenantId: string,
    featureId: string,
    data: { value: string; reason?: string }
  ): Promise<string> {
    const result = await this.service.setOverride(tenantId, featureId, data);
    return result.id;
  }

  async removeOverride(tenantId: string, featureId: string): Promise<void> {
    await this.service.removeOverride(tenantId, featureId);
  }

  async setOverrideCost(overrideId: string, amountUsd: number, reason?: string): Promise<void> {
    await this.service.setOverrideCost(overrideId, amountUsd, reason);
  }

  async removeOverrideCost(overrideId: string): Promise<void> {
    await this.service.removeOverrideCost(overrideId);
  }
}
