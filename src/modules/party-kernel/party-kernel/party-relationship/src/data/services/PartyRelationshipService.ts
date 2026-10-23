/**
 * PartyRelationship Service
 *
 * Handles all API calls for PartyRelationship.
 * Returns Models (DTOs) - Repository uses Mapper to convert to Entities.
 */
import type { IApiService } from "@core/interfaces/api.interface";
import { buildUrl } from "@/core/config/api-endpoints/_shared";
import { PARTY_RELATIONSHIP_ENDPOINTS } from "./party-relationship.endpoints";
import {
  PartyRelationshipModel,
  type PartyRelationshipJson,
  type PartyRelationshipListResponseJson,
} from "../models/PartyRelationshipModel";
import type {
  IPartyRelationshipService,
  PartyRelationshipListResult,
} from "../../domain/interfaces/IPartyRelationshipService";

/**
 * Service implementation for PartyRelationship operations
 */
export class PartyRelationshipService implements IPartyRelationshipService {
  constructor(private readonly api: IApiService) {}

  async getAll(params: {
    page: number;
    pageSize: number;
    search?: string;
    partyId?: string;
  }): Promise<PartyRelationshipListResult> {
    const url = buildUrl(PARTY_RELATIONSHIP_ENDPOINTS.LIST, {
      page: params.page,
      pageSize: params.pageSize,
      search: params.search,
      partyId: params.partyId,
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
    const json = await this.api.get<PartyRelationshipJson>(PARTY_RELATIONSHIP_ENDPOINTS.BY_ID(id));
    return PartyRelationshipModel.fromJson(json);
  }

  async create(data: Record<string, unknown>): Promise<{ id: string }> {
    return this.api.post<{ id: string }>(PARTY_RELATIONSHIP_ENDPOINTS.CREATE, data);
  }

  async update(id: string, data: Record<string, unknown>): Promise<void> {
    await this.api.put(PARTY_RELATIONSHIP_ENDPOINTS.UPDATE(id), data);
  }

  async delete(id: string): Promise<void> {
    await this.api.delete(PARTY_RELATIONSHIP_ENDPOINTS.DELETE(id));
  }
}
