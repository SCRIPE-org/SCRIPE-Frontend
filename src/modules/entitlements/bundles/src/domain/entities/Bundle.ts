/**
 * Bundle Entity
 */
import type { BaseEntity } from "@modules/system/core/domain/types";

export interface BundlePermissionRuleDto {
      id: string;
      permissionCode: string;
      mode: string;
}

export interface BundleFeatureRuleDto {
      id: string;
      featureName: string;
      value: string;
}

export interface BundleData extends BaseEntity {
      name: string;
      displayNameEn?: string;
      displayNameAr?: string;
      description?: string;
      scope: string;
      createdByTenantId?: string;
      isSystem: boolean;
      isRetired: boolean;
      permissionRuleCount?: number;
      featureRuleCount?: number;
      permissionRules?: BundlePermissionRuleDto[];
      featureRules?: BundleFeatureRuleDto[];
}

export class Bundle {
      constructor(public readonly data: BundleData) { }

      get id(): string { return this.data.id; }
      get name(): string { return this.data.name; }
      get displayNameEn(): string | undefined { return this.data.displayNameEn; }
      get displayNameAr(): string | undefined { return this.data.displayNameAr; }
      get description(): string | undefined { return this.data.description; }
      get scope(): string { return this.data.scope; }
      get isSystem(): boolean { return this.data.isSystem; }
      get isRetired(): boolean { return this.data.isRetired; }
      get createdAt(): string { return this.data.createdAt; }
      get permissionRuleCount(): number { return this.data.permissionRuleCount ?? this.data.permissionRules?.length ?? 0; }
      get featureRuleCount(): number { return this.data.featureRuleCount ?? this.data.featureRules?.length ?? 0; }
      get permissionRules(): BundlePermissionRuleDto[] { return this.data.permissionRules ?? []; }
      get featureRules(): BundleFeatureRuleDto[] { return this.data.featureRules ?? []; }

      getDisplayName(lang: string): string {
            return lang === "ar" ? (this.displayNameAr ?? this.name) : (this.displayNameEn ?? this.name);
      }
}
