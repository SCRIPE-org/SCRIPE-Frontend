/**
 * PartyRole Service
 *
 * Handles all API calls for PartyRole.
 * Returns Models (DTOs) - Repository uses Mapper to convert to Entities.
 */
import type { IApiService } from "@core/interfaces/api.interface";
import { buildUrl } from "@/core/config/api-endpoints/_shared";
import { PARTYKERNEL_ENDPOINTS } from "@modules/party-kernel/core/src/data/services/party-kernel.endpoints";
import {
  PartyRoleModel,
  type PartyRoleJson,
  type PartyRoleListResponseJson,
} from "../models/PartyRoleModel";
import type {
  IPartyRoleService,
  PartyRoleListResult,
} from "../../domain/interfaces/IPartyRoleService";

const BASE_URL = PARTYKERNEL_ENDPOINTS.PARTY_ROLES.LIST;

export class PartyRoleService implements IPartyRoleService {
  constructor(private readonly api: IApiService) {}

  async getAll(params: {
    page: number;
    pageSize: number;
    search?: string;
  }): Promise<PartyRoleListResult> {
    const url = buildUrl(BASE_URL, {
      page: params.page,
      pageSize: params.pageSize,
      search: params.search,
    });

    const response = await this.api.get<PartyRoleListResponseJson>(url);

    return {
      items: response.items.map((json) => PartyRoleModel.fromJson(json)),
      totalCount: response.totalCount,
      page: response.pageNumber,
      pageSize: response.pageSize,
      totalPages: response.totalPages,
      hasNextPage: response.hasNextPage,
      hasPreviousPage: response.hasPreviousPage,
    };
  }

  async getById(id: string): Promise<PartyRoleModel> {
    const json = await this.api.get<PartyRoleJson>(`${BASE_URL}/${id}`);
    return PartyRoleModel.fromJson(json);
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
