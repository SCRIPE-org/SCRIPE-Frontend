/**
 * Feature Override Entity
 */
export interface FeatureOverride {
      id: string;
      tenantId: string;
      featureId: string;
      featureName: string;
      value: string;
      valueType: string;
      reason?: string;
      createdAt: string;
      modifiedAt?: string;
}

export interface ResolvedFeature {
      featureId: string;
      key: string;
      nameEn: string;
      nameAr: string;
      valueType: string;
      effectiveValue: string;
      source: "Default" | "Edition" | "Override";
}
