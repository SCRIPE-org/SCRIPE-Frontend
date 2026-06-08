import type { BaseEntity } from "@modules/identity/core/domain/types";

export interface EditionCategoryData extends BaseEntity {
  name: string;
  displayNameEn?: string;
  displayNameAr?: string;
  description?: string;
  sortOrder: number;
}

export class EditionCategory {
  constructor(public readonly data: EditionCategoryData) {}

  get id(): string { return this.data.id; }
  get name(): string { return this.data.name; }
  get displayNameEn(): string | undefined { return this.data.displayNameEn; }
  get displayNameAr(): string | undefined { return this.data.displayNameAr; }
  get description(): string | undefined { return this.data.description; }
  get sortOrder(): number { return this.data.sortOrder; }

  getDisplayName(lang: string): string {
    if (lang === "ar") return this.data.displayNameAr || this.data.displayNameEn || this.data.name;
    return this.data.displayNameEn || this.data.name;
  }
}
