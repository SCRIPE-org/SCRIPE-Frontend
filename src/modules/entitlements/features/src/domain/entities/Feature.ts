/**
 * Feature Entity
 */
import type { BaseEntity } from "@core/interfaces/common.interface";

export type FeatureValueType = "Boolean" | "Numeric" | "String";

/**
 * Domain model representing a Feature Data structure.
 * Bundles read-only attributes, computed properties, and copy builders for safe mutation state transfers.
 */
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
  isMarketingOnly: boolean;
}

/**
 * Domain model representing a Feature structure.
 * Bundles read-only attributes, computed properties, and copy builders for safe mutation state transfers.
 */
export class Feature {
  constructor(public readonly data: FeatureData) {}

  get id(): string {
    return this.data.id;
  }
  get name(): string {
    return this.data.name;
  }
  get displayNameEn(): string | undefined {
    return this.data.displayNameEn;
  }
  get displayNameAr(): string | undefined {
    return this.data.displayNameAr;
  }
  get category(): string | undefined {
    return this.data.category;
  }
  get sortOrder(): number {
    return this.data.sortOrder;
  }
  get isVisibleInUI(): boolean {
    return this.data.isVisibleInUI;
  }
  get valueType(): FeatureValueType {
    return this.data.valueType;
  }
  get defaultValue(): string {
    return this.data.defaultValue;
  }
  get module(): string {
    return this.data.module;
  }
  get description(): string | undefined {
    return this.data.description;
  }
  get isSystem(): boolean {
    return this.data.isSystem;
  }
  get isMarketingOnly(): boolean {
    return this.data.isMarketingOnly;
  }
  get createdAt(): string {
    return this.data.createdAt;
  }

  getDisplayName(lang: string): string {
    if (lang === "ar") return this.displayNameAr || this.displayNameEn || this.name;
    return this.displayNameEn || this.name;
  }

  copyWith(updates: Partial<FeatureData>): Feature {
    return new Feature({ ...this.data, ...updates });
  }
}

/**
 * Feature grouped by category within a module.
 * Backend delivers this shape from GET /features/grouped.
 */
export interface FeatureCategoryGroup {
  category: string;
  features: Feature[];
}

/**
 * Features grouped by Module → Category.
 * Backend delivers this shape — zero client-side groupBy needed.
 * Used by FeaturesTab (Edition Detail) and Features Catalog page.
 */
export interface FeatureModuleGroup {
  module: string;
  categories: FeatureCategoryGroup[];
}
