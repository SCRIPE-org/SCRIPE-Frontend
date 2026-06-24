/**
 * Feature Override Service — API calls only
 *
 * Implements IOverrideService. Uses centralized API_ENDPOINTS.
 */
import type { IApiService } from "@core/interfaces/api.interface";
import type { IOverrideService } from "../../domain/interfaces/IOverrideService";
import type { FeatureOverrideModel, ResolvedFeatureModel } from "../models/OverrideModels";
import { API_ENDPOINTS } from "@core/config/api-endpoints";

/**
 * API service for executing HTTP calls related to Override endpoints.
 */
export class OverrideService implements IOverrideService {
  constructor(private readonly api: IApiService) {}

  async getOverrides(tenantId: string): Promise<FeatureOverrideModel[]> {
    return this.api.get<FeatureOverrideModel[]>(
      API_ENDPOINTS.ENTITLEMENTS.TENANT_FEATURES.OVERRIDES(tenantId)
    );
  }

  async getResolved(tenantId: string): Promise<ResolvedFeatureModel[]> {
    return this.api.get<ResolvedFeatureModel[]>(
      API_ENDPOINTS.ENTITLEMENTS.TENANT_FEATURES.RESOLVED(tenantId)
    );
  }

  async setOverride(
    tenantId: string,
    featureId: string,
    data: { value: string; reason?: string }
  ): Promise<{ id: string }> {
    return this.api.put<{ id: string }>(
      API_ENDPOINTS.ENTITLEMENTS.TENANT_FEATURES.SET_OVERRIDE(tenantId, featureId),
      data
    );
  }

  async removeOverride(tenantId: string, featureId: string): Promise<void> {
    await this.api.delete(
      API_ENDPOINTS.ENTITLEMENTS.TENANT_FEATURES.REMOVE_OVERRIDE(tenantId, featureId)
    );
  }

  async setOverrideCost(overrideId: string, amountUsd: number, reason?: string): Promise<void> {
    await this.api.put(API_ENDPOINTS.ENTITLEMENTS.PRICING.OVERRIDE_COST_SET(overrideId), {
      amountUsd,
      reason,
    });
  }

  async removeOverrideCost(overrideId: string): Promise<void> {
    await this.api.delete(API_ENDPOINTS.ENTITLEMENTS.PRICING.OVERRIDE_COST_REMOVE(overrideId));
  }
}
