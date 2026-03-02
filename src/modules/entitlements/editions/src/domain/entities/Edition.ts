/**
 * Edition Entity
 */
import type { BaseEntity } from "@modules/system/core/domain/types";

export interface EditionFeatureDto {
      featureId: string;
      featureName: string;
      value: string;
      valueType: string;
}

export interface EditionData extends BaseEntity {
      name: string;
      displayNameEn: string;
      displayNameAr: string;
      description?: string;
      isSystem: boolean;
      isRetired: boolean;
      createdByTenantId?: string;
      featureCount?: number;
      features?: EditionFeatureDto[];
      fallbackEditionId?: string;
      fallbackEditionName?: string;
      overflowPolicy?: string;
}

export class Edition {
      constructor(public readonly data: EditionData) { }

      get id(): string { return this.data.id; }
      get name(): string { return this.data.name; }
      get displayNameEn(): string { return this.data.displayNameEn; }
      get displayNameAr(): string { return this.data.displayNameAr; }
      get description(): string | undefined { return this.data.description; }
      get isSystem(): boolean { return this.data.isSystem; }
      get isRetired(): boolean { return this.data.isRetired; }
      get createdAt(): string { return this.data.createdAt; }
      get features(): EditionFeatureDto[] { return this.data.features ?? []; }
      get featureCount(): number { return this.data.featureCount ?? this.features.length; }
      get fallbackEditionId(): string | undefined { return this.data.fallbackEditionId; }
      get fallbackEditionName(): string | undefined { return this.data.fallbackEditionName; }
      get overflowPolicy(): string { return this.data.overflowPolicy ?? 'Block'; }

      getDisplayName(lang: string): string {
            return lang === "ar" ? this.displayNameAr : this.displayNameEn;
      }
}
