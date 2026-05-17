import type { AppCategory } from "../entities/AppCategory";

export interface ICategoriesRepository {
  getAll(): Promise<AppCategory[]>;
  getById(id: string): Promise<AppCategory>;
  create(data: { name: string; nameAr: string; description: string; descriptionAr: string; slug: string; sortOrder?: number }): Promise<string>;
  update(id: string, data: Partial<{ name: string; nameAr: string; description: string; descriptionAr: string; sortOrder: number }>): Promise<void>;
  delete(id: string): Promise<void>;
}
