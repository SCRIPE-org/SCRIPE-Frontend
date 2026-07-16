/**
 * CategoriesService
 *
 * HTTP service implementation for the App Categories sub-module.
 * Responsible ONLY for making API calls and returning raw DTOs.
 * All domain mapping happens in CategoriesRepository.
 */
import type { IApiService } from "@core/interfaces/api.interface";
import { MARKETPLACE_ENDPOINTS } from "@core/config/api-endpoints";
import type {
  ICategoriesService,
  CategoryDto,
  CreateCategoryPayload,
  UpdateCategoryPayload,
} from "../../domain/interfaces/ICategoriesService";

/**
 * Http API network service for categories.
 * Maps request properties to core endpoint paths and delegates HTTP client fetching calls.
 */
export class CategoriesService implements ICategoriesService {
  constructor(private readonly api: IApiService) {}

  /** Fetch all marketplace categories. */
  async getAll(): Promise<CategoryDto[]> {
    return this.api.get<CategoryDto[]>(MARKETPLACE_ENDPOINTS.MARKETPLACE.CATEGORIES);
  }

  /** Fetch a single category by ID. */
  async getById(id: string): Promise<CategoryDto> {
    return this.api.get<CategoryDto>(MARKETPLACE_ENDPOINTS.MARKETPLACE.CATEGORY_BY_ID(id));
  }

  /** Create a new category. */
  async create(payload: CreateCategoryPayload): Promise<{ id: string }> {
    return this.api.post<{ id: string }>(MARKETPLACE_ENDPOINTS.MARKETPLACE.CATEGORIES, payload);
  }

  /** Update an existing category. */
  async update(id: string, payload: UpdateCategoryPayload): Promise<void> {
    await this.api.put(MARKETPLACE_ENDPOINTS.MARKETPLACE.CATEGORY_BY_ID(id), payload);
  }

  /** Delete a category. */
  async delete(id: string): Promise<void> {
    await this.api.delete(MARKETPLACE_ENDPOINTS.MARKETPLACE.CATEGORY_BY_ID(id));
  }
}
