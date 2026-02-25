/**
 * Feature Entity
 */
import type { BaseEntity } from "@modules/system/core/domain/types";

export type FeatureValueType = "Boolean" | "Numeric" | "String";

export interface FeatureData extends BaseEntity {
      name: string;
      displayNameEn?: string;
      displayNameAr?: string;
      category?: string;
      sortOrder: number;
      isVisibleInUI: boolean;
      valueType: FeatureValueType;
      defaultValue: string;
      module: string;
      description?: string;
      isSystem: boolean;
}

export class Feature {
      constructor(public readonly data: FeatureData) { }

      get id(): string { return this.data.id; }
      get name(): string { return this.data.name; }
      get displayNameEn(): string | undefined { return this.data.displayNameEn; }
      get displayNameAr(): string | undefined { return this.data.displayNameAr; }
      get category(): string | undefined { return this.data.category; }
      get sortOrder(): number { return this.data.sortOrder; }
      get isVisibleInUI(): boolean { return this.data.isVisibleInUI; }
      get valueType(): FeatureValueType { return this.data.valueType; }
      get defaultValue(): string { return this.data.defaultValue; }
      get module(): string { return this.data.module; }
      get description(): string | undefined { return this.data.description; }
      get isSystem(): boolean { return this.data.isSystem; }
      get createdAt(): string { return this.data.createdAt; }

      getDisplayName(lang: string): string {
            return lang === "ar" ? (this.displayNameAr ?? this.name) : (this.displayNameEn ?? this.name);
      }
}
