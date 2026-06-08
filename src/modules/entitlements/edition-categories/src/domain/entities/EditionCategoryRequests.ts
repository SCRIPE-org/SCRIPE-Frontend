export interface CreateEditionCategoryRequest {
  name: string;
  displayNameEn?: string;
  displayNameAr?: string;
  description?: string;
  sortOrder?: number;
}

export interface UpdateEditionCategoryRequest {
  name?: string;
  displayNameEn?: string;
  displayNameAr?: string;
  description?: string;
  sortOrder?: number;
}
