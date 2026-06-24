/**
 * CategoriesRepository
 *
 * Bridges the service and domain layers:
 * 1. Delegates HTTP calls to CategoriesService (injected via ICategoriesService)
 * 2. Maps DTOs → AppCategory domain entities
 * 3. Returns typed domain entities to the presentation layer
 *
 * Architecture (H-02 refactor):
 *   ViewModel → CategoriesRepository (this) → ICategoriesService → IApiService → HTTP
 */
import type { ICategoriesService } from "../../domain/interfaces/ICategoriesService";
import { AppCategory } from "../../domain/entities/AppCategory";
import type { AppCategoryData } from "../../domain/entities/AppCategory";
import type { ICategoriesRepository } from "../../domain/interfaces/ICategoriesRepository";
import type { CategoryDto } from "../../domain/interfaces/ICategoriesService";

/**
 * Repository layer implementing client request queries for categories.
 * Calls base API service routines and resolves DTO objects mapping to domain entities.
 */
export class CategoriesRepository implements ICategoriesRepository {
  constructor(private readonly service: ICategoriesService) {}

  async getAll(): Promise<AppCategory[]> {
    const data = await this.service.getAll();
    return data.map((d) => this.map(d));
  }

  async getById(id: string): Promise<AppCategory> {
    return this.map(await this.service.getById(id));
  }

  async create(payload: Parameters<ICategoriesRepository["create"]>[0]): Promise<string> {
    const r = await this.service.create({
      nameEn: payload.nameEn ?? "",
      nameAr: payload.nameAr ?? "",
      slug: payload.slug ?? "",
      icon: payload.icon ?? "",
      description: payload.description ?? "",
      sortOrder: payload.sortOrder ?? 0,
    });
    return r.id;
  }

  async update(id: string, payload: Parameters<ICategoriesRepository["update"]>[1]): Promise<void> {
    await this.service.update(id, {
      nameEn: payload.nameEn ?? "",
      nameAr: payload.nameAr ?? "",
      slug: payload.slug ?? "",
      icon: payload.icon ?? "",
      description: payload.description ?? "",
      sortOrder: payload.sortOrder ?? 0,
    });
  }

  async delete(id: string): Promise<void> {
    await this.service.delete(id);
  }

  /** M-14 fix: Map d.icon (backend field) not d.iconUrl (non-existent). */
  private map(d: CategoryDto): AppCategory {
    return new AppCategory({
      id: d.id ?? "",
      name: d.nameEn ?? "",
      nameAr: d.nameAr ?? "",
      slug: d.slug ?? "",
      iconUrl: d.icon ?? null,
      description: d.description ?? "",
      descriptionAr: "",
      appCount: d.appCount ?? 0,
      sortOrder: d.sortOrder ?? 0,
      isActive: d.isActive ?? true,
      createdAt: d.createdAt ?? new Date().toISOString(),
    } satisfies AppCategoryData);
  }
}
