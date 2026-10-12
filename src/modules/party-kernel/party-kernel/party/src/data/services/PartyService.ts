/**
 * Party Service
 *
 * Handles all API calls for Party.
 * Returns Models (DTOs) - Repository uses Mapper to convert to Entities.
 */
import type { IApiService } from "@core/interfaces/api.interface";
import { buildUrl } from "@/core/config/api-endpoints/_shared";
import { PARTY_ENDPOINTS } from "./party.endpoints";
import {
  PartyModel,
  type PartyJson,
  type PartyListResponseJson,
  type PartyProfileResponseJson,
  type PartyContactLookupPagedResponseJson,
} from "../models/PartyModel";
import type { IPartyService, PartyListResult } from "../../domain/interfaces/IPartyService";

/**
 * Service implementation for Party operations
 */
export class PartyService implements IPartyService {
  constructor(private readonly api: IApiService) {}

  async getAll(params: {
    page: number;
    pageSize: number;
    search?: string;
  }): Promise<PartyListResult> {
    const url = buildUrl(PARTY_ENDPOINTS.LIST, {
      page: params.page,
      pageSize: params.pageSize,
      search: params.search,
    });

    const response = await this.api.get<PartyListResponseJson>(url);

    return {
      items: response.items.map((json) => PartyModel.fromJson(json)),
      totalCount: response.totalCount,
      page: response.pageNumber,
      pageSize: response.pageSize,
      totalPages: response.totalPages,
      hasNextPage: response.hasNextPage,
      hasPreviousPage: response.hasPreviousPage,
    };
  }

  async getById(id: string): Promise<PartyModel> {
    const json = await this.api.get<PartyJson>(PARTY_ENDPOINTS.BY_ID(id));
    return PartyModel.fromJson(json);
  }

  async getProfile(id: string): Promise<PartyProfileResponseJson | null> {
    try {
      return await this.api.get<PartyProfileResponseJson>(PARTY_ENDPOINTS.PROFILE(id));
    } catch {
      return null;
    }
  }

  async create(data: Record<string, unknown>): Promise<{ id: string }> {
    return this.api.post<{ id: string }>(PARTY_ENDPOINTS.CREATE, data);
  }

  async createPerson(
    data: {
      fullName: string;
      displayName?: string | null;
      givenName?: string | null;
      middleNames?: string | null;
      familyName?: string | null;
    },
    idempotencyKey?: string
  ): Promise<{ id: string }> {
    const headers: Record<string, string> = {};
    if (idempotencyKey) {
      headers["Idempotency-Key"] = idempotencyKey;
    }
    return this.api.post<{ id: string }>(
      PARTY_ENDPOINTS.PEOPLE,
      data,
      undefined,
      Object.keys(headers).length > 0 ? { headers } : undefined
    );
  }

  async createOrganization(
    data: { legalName: string; displayName?: string },
    idempotencyKey?: string
  ): Promise<{ id: string }> {
    const headers: Record<string, string> = {};
    if (idempotencyKey) {
      headers["Idempotency-Key"] = idempotencyKey;
    }
    return this.api.post<{ id: string }>(
      PARTY_ENDPOINTS.ORGANIZATIONS,
      data,
      undefined,
      Object.keys(headers).length > 0 ? { headers } : undefined
    );
  }

  async lookupPeople(params: {
    page: number;
    pageSize: number;
    search?: string;
  }): Promise<PartyContactLookupPagedResponseJson> {
    const url = buildUrl(PARTY_ENDPOINTS.PEOPLE_LOOKUP, {
      page: params.page,
      pageSize: Math.min(params.pageSize, 100),
      search: params.search?.slice(0, 300),
    });
    return this.api.get<PartyContactLookupPagedResponseJson>(url);
  }

  async lookupOrganizations(params: {
    page: number;
    pageSize: number;
    search?: string;
  }): Promise<PartyContactLookupPagedResponseJson> {
    const url = buildUrl(PARTY_ENDPOINTS.ORGANIZATIONS_LOOKUP, {
      page: params.page,
      pageSize: Math.min(params.pageSize, 100),
      search: params.search?.slice(0, 300),
    });
    return this.api.get<PartyContactLookupPagedResponseJson>(url);
  }

  async update(id: string, data: Record<string, unknown>): Promise<void> {
    await this.api.put(PARTY_ENDPOINTS.UPDATE(id), data);
  }

  async delete(id: string): Promise<void> {
    await this.api.delete(PARTY_ENDPOINTS.DELETE(id));
  }
}
