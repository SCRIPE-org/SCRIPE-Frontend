import type { IApiService } from "@core/interfaces/api.interface";
import { buildUrl } from "@/core/config/api-endpoints/_shared";
import {
  SchedulableResourceModel,
  type SchedulableResourceJson,
  type SchedulableResourceListResponseJson,
} from "../models/SchedulableResourceModel";
import type {
  ISchedulableResourceService,
  SchedulableResourceListResult,
} from "../../domain/interfaces/ISchedulableResourceService";
import type { PublicationChecklistReport } from "../../domain/entities/SchedulableResource";
import { SCHEDULABLE_RESOURCE_ENDPOINTS } from "./schedulable-resource.endpoints";

/**
 * Documentation for module export
 */
export class SchedulableResourceService implements ISchedulableResourceService {
  constructor(private readonly api: IApiService) {}

  async getAll(params: { page: number; pageSize: number; search?: string; facilityResourceProfileIds?: string[] }): Promise<SchedulableResourceListResult> {
    const url = buildUrl(SCHEDULABLE_RESOURCE_ENDPOINTS.LIST, {
      page: params.page,
      pageSize: params.pageSize,
      search: params.search,
      facilityResourceProfileIds: params.facilityResourceProfileIds?.join(","),
    });
    const response = await this.api.get<SchedulableResourceListResponseJson>(url);
    return {
      items: response.items.map((json) => SchedulableResourceModel.fromJson(json)),
      totalCount: response.totalCount,
      page: response.pageNumber,
      pageSize: response.pageSize,
      totalPages: response.totalPages,
      hasNextPage: response.hasNextPage,
      hasPreviousPage: response.hasPreviousPage,
    };
  }

  async getById(id: string): Promise<SchedulableResourceModel> {
    const json = await this.api.get<SchedulableResourceJson>(SCHEDULABLE_RESOURCE_ENDPOINTS.BY_ID(id));
    return SchedulableResourceModel.fromJson(json);
  }

  async create(data: Record<string, unknown>): Promise<{ id: string }> {
    return this.api.post<{ id: string }>(SCHEDULABLE_RESOURCE_ENDPOINTS.CREATE, data);
  }

  async update(id: string, data: Record<string, unknown>): Promise<void> {
    await this.api.put(SCHEDULABLE_RESOURCE_ENDPOINTS.UPDATE(id), data);
  }

  async delete(id: string): Promise<void> {
    await this.api.delete(SCHEDULABLE_RESOURCE_ENDPOINTS.DELETE(id));
  }

  async getPublicationChecklist(id: string): Promise<PublicationChecklistReport> {
    const json = await this.api.get<{ canPublish: boolean; blockers: { code: string; message: string }[] }>(
      SCHEDULABLE_RESOURCE_ENDPOINTS.PUBLICATION_CHECKLIST(id)
    );
    return { canPublish: json.canPublish, blockers: json.blockers };
  }

  async publish(id: string): Promise<void> {
    await this.api.post(SCHEDULABLE_RESOURCE_ENDPOINTS.PUBLISH(id), {});
  }
}
