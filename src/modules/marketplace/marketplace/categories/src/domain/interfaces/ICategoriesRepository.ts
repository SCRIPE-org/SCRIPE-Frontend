import type { AppCategory } from "../entities/AppCategory";

/**
 * Categories Repository Interface
 *
 * Defines the contract for marketplace category CRUD operations.
 * The create/update payloads match the backend CreateAppCategoryRequest / UpdateAppCategoryRequest DTOs.
 */
export interface ICategoriesRepository {
  /** List all marketplace categories. */
  getAll(): Promise<AppCategory[]>;

  /** Get a single category by encrypted ID. */
  getById(id: string): Promise<AppCategory>;

  /**
   * Create a new marketplace category.
   * Payload matches backend CreateAppCategoryRequest (nameEn, nameAr, slug, icon, description, sortOrder).
   */
  create(data: {
    nameEn: string;
    nameAr: string;
    slug: string;
    icon: string;
    description: string;
    sortOrder: number;
  }): Promise<string>;

  /**
   * Update an existing marketplace category.
   * Payload matches backend UpdateAppCategoryRequest.
   */
  update(
    id: string,
    data: Partial<{
      nameEn: string;
      nameAr: string;
      slug: string;
      icon: string;
      description: string;
      sortOrder: number;
    }>
  ): Promise<void>;

  /** Soft-delete a marketplace category by encrypted ID. */
  delete(id: string): Promise<void>;
}
