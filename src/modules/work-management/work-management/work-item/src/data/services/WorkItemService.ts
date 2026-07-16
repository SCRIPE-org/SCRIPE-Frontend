/**
 * WorkItem Service — handles all API calls for the WorkManagement module.
 */
import type { IApiService } from "@core/interfaces/api.interface";
import { buildUrl, WORKMANAGEMENT_ENDPOINTS } from "@core/config/api-endpoints";
import {
  WorkItemModel,
  type WorkItemJson,
  type WorkItemListResponseJson,
} from "../models/WorkItemModel";
import type {
  IWorkItemService,
  WorkItemListResult,
} from "../../domain/interfaces/IWorkItemService";

const BASE_URL = WORKMANAGEMENT_ENDPOINTS.WORK_ITEMS.LIST;

export class WorkItemService implements IWorkItemService {
  constructor(private readonly api: IApiService) {}

  async getAll(params: {
    page: number;
    pageSize: number;
    search?: string;
    ownerEntityTypeKey?: string;
  }): Promise<WorkItemListResult> {
    const url = buildUrl(BASE_URL, {
      page: params.page,
      pageSize: params.pageSize,
      search: params.search,
      ownerEntityTypeKey: params.ownerEntityTypeKey,
    });

    const response = await this.api.get<WorkItemListResponseJson>(url);

    return {
      items: response.items.map((json) => WorkItemModel.fromListJson(json)),
      totalCount: response.totalCount,
      page: response.page,
      pageSize: response.pageSize,
      totalPages: response.totalPages,
      hasNextPage: response.hasNextPage,
      hasPreviousPage: response.hasPreviousPage,
    };
  }

  async getById(id: string): Promise<WorkItemModel> {
    const json = await this.api.get<WorkItemJson>(`${BASE_URL}/${id}`);
    return WorkItemModel.fromJson(json);
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
