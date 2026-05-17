"use client";

import type { IApiService } from "@core/interfaces/api.interface";
import { MARKETPLACE_ENDPOINTS } from "@core/config/api-endpoints";
import { AppCategory } from "../../domain/entities/AppCategory";
import type { AppCategoryData } from "../../domain/entities/AppCategory";
import type { ICategoriesRepository } from "../../domain/interfaces/ICategoriesRepository";

export class CategoriesRepository implements ICategoriesRepository {
  constructor(private readonly api: IApiService) {}

  async getAll(): Promise<AppCategory[]> {
    const data = await this.api.get<any[]>(MARKETPLACE_ENDPOINTS.MARKETPLACE.CATEGORIES);
    return data.map((d) => this.map(d));
  }

  async getById(id: string): Promise<AppCategory> {
    const data = await this.api.get<any>(MARKETPLACE_ENDPOINTS.MARKETPLACE.CATEGORY_BY_ID(id));
    return this.map(data);
  }

  async create(payload: any): Promise<string> {
    const r = await this.api.post<{ id: string }>(MARKETPLACE_ENDPOINTS.MARKETPLACE.CATEGORIES, payload);
    return r.id;
  }

  async update(id: string, payload: any): Promise<void> {
    await this.api.put(MARKETPLACE_ENDPOINTS.MARKETPLACE.CATEGORY_BY_ID(id), payload);
  }

  async delete(id: string): Promise<void> {
    await this.api.delete(MARKETPLACE_ENDPOINTS.MARKETPLACE.CATEGORY_BY_ID(id));
  }

  private map(d: any): AppCategory {
    return new AppCategory({
      id: d.id ?? "",
      name: d.name ?? "",
      nameAr: d.nameAr ?? "",
      slug: d.slug ?? "",
      iconUrl: d.iconUrl ?? null,
      description: d.description ?? "",
      descriptionAr: d.descriptionAr ?? "",
      appCount: d.appCount ?? 0,
      sortOrder: d.sortOrder ?? 0,
      isActive: d.isActive ?? true,
      createdAt: d.createdAt ?? new Date().toISOString(),
    } satisfies AppCategoryData);
  }
}
