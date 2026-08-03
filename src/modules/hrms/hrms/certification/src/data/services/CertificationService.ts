/**
 * Certification Service
 *
 * Handles all API calls for Certification.
 * Returns Models (DTOs) - Repository uses Mapper to convert to Entities.
 */
import type { IApiService } from "@core/interfaces/api.interface";
import { buildUrl } from "@/core/config/api-endpoints/_shared";
import { CERTIFICATION_ENDPOINTS } from "./certification.endpoints";
import {
  CertificationModel,
  type CertificationJson,
  type CertificationListResponseJson,
} from "../models/CertificationModel";
import type {
  ICertificationService,
  CertificationListResult,
} from "../../domain/interfaces/ICertificationService";

const BASE_URL = CERTIFICATION_ENDPOINTS.LIST;

export class CertificationService implements ICertificationService {
  constructor(private readonly api: IApiService) {}

  async getAll(params: {
    page: number;
    pageSize: number;
    search?: string;
    sortBy?: string;
    sortDirection?: "asc" | "desc";
  }): Promise<CertificationListResult> {
    const url = buildUrl(BASE_URL, {
      page: params.page,
      pageSize: params.pageSize,
      search: params.search,
      sortBy: params.sortBy,
      sortDirection: params.sortDirection,
    });

    const response = await this.api.get<CertificationListResponseJson>(url);

    return {
      items: response.items.map((json) => CertificationModel.fromJson(json)),
      totalCount: response.totalCount,
      page: response.pageNumber,
      pageSize: response.pageSize,
      totalPages: response.totalPages,
      hasNextPage: response.hasNextPage,
      hasPreviousPage: response.hasPreviousPage,
    };
  }

  async getById(id: string): Promise<CertificationModel> {
    const json = await this.api.get<CertificationJson>(`${BASE_URL}/${id}`);
    return CertificationModel.fromJson(json);
  }

  async create(data: Record<string, unknown>): Promise<{ id: string }> {
    return this.api.post<{ id: string }>(BASE_URL, data);
  }

  async update(id: string, data: Record<string, unknown>): Promise<void> {
    await this.api.put(`${BASE_URL}/${id}`, data);
  }

  async delete(id: string): Promise<void> {
    await this.api.delete(`${BASE_URL}/${id}`);
  }
}
