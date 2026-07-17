/**
 * Feature Override Service — API calls only
 *
 * Implements IOverrideService. Uses local OVERRIDES_ENDPOINTS.
 */
import type { IApiService } from "@core/interfaces/api.interface";
import type { IOverrideService } from "../../domain/interfaces/IOverrideService";
import type { FeatureOverrideModel, ResolvedFeatureModel } from "../models/OverrideModels";
import { OVERRIDES_ENDPOINTS } from "./overrides.endpoints";

/**
 * Http API network service for override.
 * Maps request properties to core endpoint paths and delegates HTTP client fetching calls.
 */
export class OverrideService implements IOverrideService {
  constructor(private readonly api: IApiService) {}

  async getOverrides(tenantId: string): Promise<FeatureOverrideModel[]> {
    return this.api.get<FeatureOverrideModel[]>(
      OVERRIDES_ENDPOINTS.OVERRIDES(tenantId)
    );
  }

  async getResolved(tenantId: string): Promise<ResolvedFeatureModel[]> {
    return this.api.get<ResolvedFeatureModel[]>(
      OVERRIDES_ENDPOINTS.RESOLVED(tenantId)
    );
  }

  async setOverride(
    tenantId: string,
    featureId: string,
    data: { value: string; reason?: string }
  ): Promise<{ id: string }> {
    return this.api.put<{ id: string }>(
      OVERRIDES_ENDPOINTS.SET_OVERRIDE(tenantId, featureId),
      data
    );
  }

  async removeOverride(tenantId: string, featureId: string): Promise<void> {
    await this.api.delete(
      OVERRIDES_ENDPOINTS.REMOVE_OVERRIDE(tenantId, featureId)
    );
  }

  async setOverrideCost(overrideId: string, amountUsd: number, reason?: string): Promise<void> {
    await this.api.put(OVERRIDES_ENDPOINTS.OVERRIDE_COST_SET(overrideId), {
      amountUsd,
      reason,
    });
  }

  async removeOverrideCost(overrideId: string): Promise<void> {
    await this.api.delete(OVERRIDES_ENDPOINTS.OVERRIDE_COST_REMOVE(overrideId));
  }
}
