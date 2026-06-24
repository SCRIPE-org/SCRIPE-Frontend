/**
 * Domain model representing a Create Edition Category Request structure.
 * Bundles read-only attributes, computed properties, and copy builders for safe mutation state transfers.
 */
export interface CreateEditionCategoryRequest {
  name: string;
  displayNameEn?: string;
  displayNameAr?: string;
  description?: string;
  sortOrder?: number;
}

/**
 * Domain model representing a Update Edition Category Request structure.
 * Bundles read-only attributes, computed properties, and copy builders for safe mutation state transfers.
 */
export interface UpdateEditionCategoryRequest {
  name?: string;
  displayNameEn?: string;
  displayNameAr?: string;
  description?: string;
  sortOrder?: number;
}
