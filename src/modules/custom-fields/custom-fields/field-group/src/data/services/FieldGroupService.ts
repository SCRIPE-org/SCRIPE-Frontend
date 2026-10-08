/**
 * FieldGroup Service
 *
 * All HTTP calls for the field-group endpoints (Wave 5 row 5.2).
 * Returns Models (DTOs); the repository maps them to entities.
 */
import { buildUrl } from "@/core/config/api-endpoints/_shared";
import type { IApiService } from "@core/interfaces/api.interface";
import {
  FieldGroupModel,
  type FieldGroupJson,
  type CreateFieldGroupRequestJson,
  type UpdateFieldGroupRequestJson,
  type ReorderFieldGroupsRequestJson,
} from "../models/FieldGroupModel";
import type { IFieldGroupService } from "../../domain/interfaces/IFieldGroupService";
import { FIELD_GROUP_ENDPOINTS } from "./field-group.endpoints";

/**
 * Documentation for module export
 */
export class FieldGroupService implements IFieldGroupService {
  constructor(private readonly api: IApiService) {}

  async getByEntityType(entityTypeKey: string): Promise<FieldGroupModel[]> {
    const url = buildUrl(FIELD_GROUP_ENDPOINTS.LIST, { entityTypeKey });
    // The endpoint returns a bare array, NOT a PagedResult envelope -- there
    // is no pagination on this read. `?? []` guards a 204/empty body rather
    // than letting `.map` throw on undefined.
    const response = await this.api.get<FieldGroupJson[]>(url);
    return (response ?? []).map((json) => FieldGroupModel.fromJson(json));
  }

  async create(data: CreateFieldGroupRequestJson): Promise<{ id: string }> {
    return this.api.post<{ id: string }>(FIELD_GROUP_ENDPOINTS.CREATE, data);
  }

  async update(id: string, data: UpdateFieldGroupRequestJson): Promise<void> {
    await this.api.put(FIELD_GROUP_ENDPOINTS.UPDATE(id), data);
  }

  async delete(id: string): Promise<void> {
    await this.api.delete(FIELD_GROUP_ENDPOINTS.DELETE(id));
  }

  async reorder(data: ReorderFieldGroupsRequestJson): Promise<void> {
    await this.api.put(FIELD_GROUP_ENDPOINTS.REORDER, data);
  }
}
