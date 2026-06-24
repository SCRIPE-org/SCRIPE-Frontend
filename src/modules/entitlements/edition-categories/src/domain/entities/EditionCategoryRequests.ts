/**
 * Interface structure detailing the properties and attributes of Create Edition Category Request.
 */
export interface CreateEditionCategoryRequest {
  name: string;
  displayNameEn?: string;
  displayNameAr?: string;
  description?: string;
  sortOrder?: number;
}

/**
 * Interface structure detailing the properties and attributes of Update Edition Category Request.
 */
export interface UpdateEditionCategoryRequest {
  name?: string;
  displayNameEn?: string;
  displayNameAr?: string;
  description?: string;
  sortOrder?: number;
}
