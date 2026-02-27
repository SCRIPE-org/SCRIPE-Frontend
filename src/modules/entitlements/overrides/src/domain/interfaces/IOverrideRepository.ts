/**
 * Override Repository Interface
 *
 * Defines the contract for feature override data operations.
 */
import type { FeatureOverride, ResolvedFeature } from "../entities/Override";

export interface IOverrideRepository {
      getOverrides(tenantId: string): Promise<FeatureOverride[]>;
      getResolved(tenantId: string): Promise<ResolvedFeature[]>;
      setOverride(
            tenantId: string,
            featureId: string,
            data: { value: string; reason?: string }
      ): Promise<string>;
      removeOverride(tenantId: string, featureId: string): Promise<void>;
}
