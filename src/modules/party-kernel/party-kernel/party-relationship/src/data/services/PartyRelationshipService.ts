/**
 * PartyRelationship Service
 *
 * Handles all API calls for PartyRelationship.
 * Returns Models (DTOs) - Repository uses Mapper to convert to Entities.
 */
import type { IApiService } from "@core/interfaces/api.interface";
import { buildUrl } from "@/core/config/api-endpoints/_shared";
import { PARTYKERNEL_ENDPOINTS } from "@modules/party-kernel/core/src/data/services/party-kernel.endpoints";
import {
  PartyRelationshipModel,
  type PartyRelationshipJson,
  type PartyRelationshipListResponseJson,
} from "../models/PartyRelationshipModel";
import type {
  IPartyRelationshipService,
  PartyRelationshipListResult,
} from "../../domain/interfaces/IPartyRelationshipService";

const BASE_URL = PARTYKERNEL_ENDPOINTS.PARTY_RELATIONSHIPS.LIST;

export class PartyRelationshipService implements IPartyRelationshipService {
  constructor(private readonly api: IApiService) {}

  async getAll(params: {
    page: number;
    pageSize: number;
    search?: string;
  }): Promise<PartyRelationshipListResult> {
    const url = buildUrl(BASE_URL, {
      page: params.page,
      pageSize: params.pageSize,
      search: params.search,
    });

    const response = await this.api.get<PartyRelationshipListResponseJson>(url);

    return {
      items: response.items.map((json) => PartyRelationshipModel.fromJson(json)),
      totalCount: response.totalCount,
      page: response.pageNumber,
      pageSize: response.pageSize,
      totalPages: response.totalPages,
      hasNextPage: response.hasNextPage,
      hasPreviousPage: response.hasPreviousPage,
    };
  }

  async getById(id: string): Promise<PartyRelationshipModel> {
    const json = await this.api.get<PartyRelationshipJson>(`${BASE_URL}/${id}`);
    return PartyRelationshipModel.fromJson(json);
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
