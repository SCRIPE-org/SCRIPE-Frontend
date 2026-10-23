/**
 * ContactPoint Service
 *
 * Handles all API calls for ContactPoint.
 * Returns Models (DTOs) - Repository uses Mapper to convert to Entities.
 */
import type { IApiService } from "@core/interfaces/api.interface";
import { buildUrl } from "@/core/config/api-endpoints/_shared";
import { CONTACT_POINT_ENDPOINTS } from "./contact-point.endpoints";
import {
  ContactPointModel,
  type ContactPointJson,
  type ContactPointListResponseJson,
} from "../models/ContactPointModel";
import type {
  IContactPointService,
  ContactPointListResult,
} from "../../domain/interfaces/IContactPointService";

/**
 * Service implementation for ContactPoint operations
 */
export class ContactPointService implements IContactPointService {
  constructor(private readonly api: IApiService) {}

  async getAll(params: {
    page: number;
    pageSize: number;
    search?: string;
    partyId?: string;
  }): Promise<ContactPointListResult> {
    const url = buildUrl(CONTACT_POINT_ENDPOINTS.LIST, {
      page: params.page,
      pageSize: params.pageSize,
      search: params.search,
      partyId: params.partyId,
    });

    const response = await this.api.get<ContactPointListResponseJson>(url);

    return {
      items: response.items.map((json) => ContactPointModel.fromJson(json)),
      totalCount: response.totalCount,
      page: response.pageNumber,
      pageSize: response.pageSize,
      totalPages: response.totalPages,
      hasNextPage: response.hasNextPage,
      hasPreviousPage: response.hasPreviousPage,
    };
  }

  async getById(id: string): Promise<ContactPointModel> {
    const json = await this.api.get<ContactPointJson>(CONTACT_POINT_ENDPOINTS.BY_ID(id));
    return ContactPointModel.fromJson(json);
  }

  async create(data: Record<string, unknown>, idempotencyKey?: string): Promise<{ id: string }> {
    const headers: Record<string, string> = {};
    if (idempotencyKey) {
      headers["Idempotency-Key"] = idempotencyKey;
    }
    return this.api.post<{ id: string }>(
      CONTACT_POINT_ENDPOINTS.CREATE,
      data,
      undefined,
      Object.keys(headers).length > 0 ? { headers } : undefined
    );
  }

  async update(id: string, data: Record<string, unknown>): Promise<void> {
    await this.api.put(CONTACT_POINT_ENDPOINTS.UPDATE(id), data);
  }

  async delete(id: string): Promise<void> {
    await this.api.delete(CONTACT_POINT_ENDPOINTS.DELETE(id));
  }
}
