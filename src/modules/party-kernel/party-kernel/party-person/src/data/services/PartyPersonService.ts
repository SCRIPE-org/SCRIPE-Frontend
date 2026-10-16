/**
 * PartyPerson Service
 *
 * Handles all API calls for PartyPerson.
 * Returns Models (DTOs) - Repository uses Mapper to convert to Entities.
 */
import type { IApiService } from "@core/interfaces/api.interface";
import { buildUrl } from "@/core/config/api-endpoints/_shared";
import { PARTY_PERSON_ENDPOINTS } from "./party-person.endpoints";
import {
  PartyPersonModel,
  type PartyPersonJson,
  type PartyPersonListResponseJson,
} from "../models/PartyPersonModel";
import type {
  IPartyPersonService,
  PartyPersonListResult,
} from "../../domain/interfaces/IPartyPersonService";

/**
 * Service implementation for PartyPerson operations
 */
export class PartyPersonService implements IPartyPersonService {
  constructor(private readonly api: IApiService) {}

  async getAll(params: {
    page: number;
    pageSize: number;
    search?: string;
  }): Promise<PartyPersonListResult> {
    const url = buildUrl(PARTY_PERSON_ENDPOINTS.LIST, {
      page: params.page,
      pageSize: params.pageSize,
      search: params.search,
    });

    const response = await this.api.get<PartyPersonListResponseJson>(url);

    return {
      items: response.items.map((json) => PartyPersonModel.fromJson(json)),
      totalCount: response.totalCount,
      page: response.pageNumber,
      pageSize: response.pageSize,
      totalPages: response.totalPages,
      hasNextPage: response.hasNextPage,
      hasPreviousPage: response.hasPreviousPage,
    };
  }

  async getById(id: string): Promise<PartyPersonModel> {
    const json = await this.api.get<PartyPersonJson>(PARTY_PERSON_ENDPOINTS.BY_ID(id));
    return PartyPersonModel.fromJson(json);
  }

  async create(data: Record<string, unknown>): Promise<{ id: string }> {
    return this.api.post<{ id: string }>(PARTY_PERSON_ENDPOINTS.CREATE, data);
  }

  async update(id: string, data: Record<string, unknown>): Promise<void> {
    await this.api.put(PARTY_PERSON_ENDPOINTS.UPDATE(id), data);
  }

  async delete(id: string): Promise<void> {
    await this.api.delete(PARTY_PERSON_ENDPOINTS.DELETE(id));
  }
}
