import type { BaseEntity } from "@core/interfaces/common.interface";

/**
 * Interface structure detailing the properties and attributes of Edition Category Data.
 */
export interface EditionCategoryData extends BaseEntity {
  name: string;
  displayNameEn?: string;
  displayNameAr?: string;
  description?: string;
  sortOrder: number;
}

/**
 * Domain entity class representing a Edition Category.
 */
export class EditionCategory {
  constructor(public readonly data: EditionCategoryData) {}

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
  get description(): string | undefined {
    return this.data.description;
  }
  get sortOrder(): number {
    return this.data.sortOrder;
  }

  getDisplayName(lang: string): string {
    if (lang === "ar") return this.data.displayNameAr || this.data.displayNameEn || this.data.name;
    return this.data.displayNameEn || this.data.name;
  }

  copyWith(updates: Partial<EditionCategoryData>): EditionCategory {
    return new EditionCategory({
      ...this.data,
      ...updates,
    } as EditionCategoryData);
  }
}
