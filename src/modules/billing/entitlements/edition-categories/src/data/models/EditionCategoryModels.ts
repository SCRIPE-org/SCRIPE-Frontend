/**
 * Interface defining property specifications, keys types, and structural contract rules for edition category model.
 */
export interface EditionCategoryModel {
  id: string;
  name: string;
  displayNameEn?: string;
  displayNameAr?: string;
  description?: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}
