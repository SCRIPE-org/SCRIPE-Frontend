/**
 * Interface structure detailing the properties and attributes of Edition Category Model.
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
