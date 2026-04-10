/**
 * Override Service Interface (API contract)
 *
 * Defines the contract for feature override API operations.
 * Implemented by OverrideService in the data layer.
 */
import type { FeatureOverrideModel, ResolvedFeatureModel } from "../../data/models/OverrideModels";

export interface IOverrideService {
      getOverrides(tenantId: string): Promise<FeatureOverrideModel[]>;
      getResolved(tenantId: string): Promise<ResolvedFeatureModel[]>;
      setOverride(
            tenantId: string,
            featureId: string,
            data: { value: string; reason?: string }
      ): Promise<{ id: string }>;
      removeOverride(tenantId: string, featureId: string): Promise<void>;
      setOverrideCost(overrideId: string, amountUsd: number, reason?: string): Promise<void>;
      removeOverrideCost(overrideId: string): Promise<void>;
}
