/**
 * ICategoriesService
 *
 * Contract for the App Categories HTTP service layer.
 * Returns raw API DTOs — conversion to domain entities happens in the Repository.
 */

/** API response shape matching AppCategoryResponse from backend. */
export interface CategoryDto {
  id: string;
  nameEn?: string;
  nameAr?: string;
  slug?: string;
  icon?: string | null;
  description?: string;
  sortOrder?: number;
  appCount?: number;
  isActive?: boolean;
  createdAt?: string;
}

/** Payload for creating a new category. */
export interface CreateCategoryPayload {
  nameEn: string;
  nameAr: string;
  slug: string;
  icon: string;
  description: string;
  sortOrder: number;
}

/** Payload for updating a category. */
export interface UpdateCategoryPayload {
  nameEn: string;
  nameAr: string;
  slug: string;
  icon: string;
  description: string;
  sortOrder: number;
}

export interface ICategoriesService {
  /** Fetch all categories. */
  getAll(): Promise<CategoryDto[]>;
  /** Fetch a single category by ID. */
  getById(id: string): Promise<CategoryDto>;
  /** Create a new category. Returns the new category ID. */
  create(payload: CreateCategoryPayload): Promise<{ id: string }>;
  /** Update an existing category. */
  update(id: string, payload: UpdateCategoryPayload): Promise<void>;
  /** Delete a category. */
  delete(id: string): Promise<void>;
}
