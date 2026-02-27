/**
 * Override Repository — uses Service + Mapper
 *
 * Implements IOverrideRepository using OverrideService for API calls
 * and OverrideMapper for DTO → Entity conversion.
 */
import type { IOverrideRepository } from "../../domain/interfaces/IOverrideRepository";
import type { FeatureOverride, ResolvedFeature } from "../../domain/entities/Override";
import { OverrideService } from "../services/OverrideService";
import { OverrideMapper } from "../mappers/OverrideMapper";

export class OverrideRepository implements IOverrideRepository {
      constructor(private readonly service: OverrideService) { }

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
}
