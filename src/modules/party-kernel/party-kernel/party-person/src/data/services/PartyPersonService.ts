/**
 * PartyPerson Service
 *
 * Handles all API calls for PartyPerson.
 * Returns Models (DTOs) - Repository uses Mapper to convert to Entities.
 */
import type { IApiService } from "@core/interfaces/api.interface";
import { buildUrl } from "@/core/config/api-endpoints/_shared";
import { PARTYKERNEL_ENDPOINTS } from "@modules/party-kernel/core/src/data/services/party-kernel.endpoints";
import {
  PartyPersonModel,
  type PartyPersonJson,
  type PartyPersonListResponseJson,
} from "../models/PartyPersonModel";
import type {
  IPartyPersonService,
  PartyPersonListResult,
} from "../../domain/interfaces/IPartyPersonService";

const BASE_URL = PARTYKERNEL_ENDPOINTS.PARTY_PEOPLE.LIST;

export class PartyPersonService implements IPartyPersonService {
  constructor(private readonly api: IApiService) {}

  async getAll(params: {
    page: number;
    pageSize: number;
    search?: string;
  }): Promise<PartyPersonListResult> {
    const url = buildUrl(BASE_URL, {
      page: params.page,
      pageSize: params.pageSize,
      search: params.search,
    });

    const response = await this.api.get<PartyPersonListResponseJson>(url);

    return {
      items: response.items.map((json) => PartyPersonModel.fromJson(json)),
      totalCount: response.totalCount,
      page: response.page,
      pageSize: response.pageSize,
      totalPages: response.totalPages,
      hasNextPage: response.hasNextPage,
      hasPreviousPage: response.hasPreviousPage,
    };
  }

  async getById(id: string): Promise<PartyPersonModel> {
    const json = await this.api.get<PartyPersonJson>(`${BASE_URL}/${id}`);
    return PartyPersonModel.fromJson(json);
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
