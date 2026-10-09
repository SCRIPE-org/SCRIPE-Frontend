/**
 * PartyOrganization Service
 *
 * Handles all API calls for PartyOrganization.
 * Returns Models (DTOs) - Repository uses Mapper to convert to Entities.
 */
import type { IApiService } from "@core/interfaces/api.interface";
import { buildUrl } from "@/core/config/api-endpoints/_shared";
import { PARTY_ORGANIZATION_ENDPOINTS } from "./party-organization.endpoints";
import {
  PartyOrganizationModel,
  type PartyOrganizationJson,
  type PartyOrganizationListResponseJson,
} from "../models/PartyOrganizationModel";
import type {
  IPartyOrganizationService,
  PartyOrganizationListResult,
} from "../../domain/interfaces/IPartyOrganizationService";

/**
 * Service implementation for PartyOrganization operations
 */
export class PartyOrganizationService implements IPartyOrganizationService {
  constructor(private readonly api: IApiService) {}

  async getAll(params: {
    page: number;
    pageSize: number;
    search?: string;
  }): Promise<PartyOrganizationListResult> {
    const url = buildUrl(PARTY_ORGANIZATION_ENDPOINTS.LIST, {
      page: params.page,
      pageSize: params.pageSize,
      search: params.search,
    });

    const response = await this.api.get<PartyOrganizationListResponseJson>(url);

    return {
      items: response.items.map((json) => PartyOrganizationModel.fromJson(json)),
      totalCount: response.totalCount,
      page: response.pageNumber,
      pageSize: response.pageSize,
      totalPages: response.totalPages,
      hasNextPage: response.hasNextPage,
      hasPreviousPage: response.hasPreviousPage,
    };
  }

  async getById(id: string): Promise<PartyOrganizationModel> {
    const json = await this.api.get<PartyOrganizationJson>(PARTY_ORGANIZATION_ENDPOINTS.BY_ID(id));
    return PartyOrganizationModel.fromJson(json);
  }

  async create(data: Record<string, unknown>): Promise<{ id: string }> {
    return this.api.post<{ id: string }>(PARTY_ORGANIZATION_ENDPOINTS.CREATE, data);
  }

  async update(id: string, data: Record<string, unknown>): Promise<void> {
    await this.api.put(PARTY_ORGANIZATION_ENDPOINTS.UPDATE(id), data);
  }

  async delete(id: string): Promise<void> {
    await this.api.delete(PARTY_ORGANIZATION_ENDPOINTS.DELETE(id));
  }
}
