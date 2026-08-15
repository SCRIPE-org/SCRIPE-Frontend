/**
 * WorkItem Service — handles all API calls for the WorkManagement module.
 */
import { buildUrl } from "@/core/config/api-endpoints/_shared";
import type { IApiService } from "@core/interfaces/api.interface";
import {
  WorkItemModel,
  type WorkItemJson,
  type WorkItemListResponseJson,
  type PagedAssignableAdminsModel,
} from "../models/WorkItemModel";
import type {
  IWorkItemService,
  WorkItemListResult,
} from "../../domain/interfaces/IWorkItemService";
import { WORK_ITEM_ENDPOINTS } from "./work-item.endpoints";

export class WorkItemService implements IWorkItemService {
  constructor(private readonly api: IApiService) {}

  async getAll(params: {
    page: number;
    pageSize: number;
    search?: string;
    ownerEntityTypeKey?: string;
  }): Promise<WorkItemListResult> {
    const url = buildUrl(WORK_ITEM_ENDPOINTS.LIST, {
      page: params.page,
      pageSize: params.pageSize,
      search: params.search,
      ownerEntityTypeKey: params.ownerEntityTypeKey,
    });

    const response = await this.api.get<WorkItemListResponseJson>(url);

    return {
      items: response.items.map((json) => WorkItemModel.fromListJson(json)),
      totalCount: response.totalCount,
      page: response.pageNumber,
      pageSize: response.pageSize,
      totalPages: response.totalPages,
      hasNextPage: response.hasNextPage,
      hasPreviousPage: response.hasPreviousPage,
    };
  }

  async getById(id: string): Promise<WorkItemModel> {
    const json = await this.api.get<WorkItemJson>(WORK_ITEM_ENDPOINTS.BY_ID(id));
    return WorkItemModel.fromJson(json);
  }

  async create(data: Record<string, unknown>): Promise<{ id: string }> {
    return this.api.post<{ id: string }>(WORK_ITEM_ENDPOINTS.CREATE, data);
  }

  async update(id: string, data: Record<string, unknown>): Promise<void> {
    await this.api.put(WORK_ITEM_ENDPOINTS.UPDATE(id), data);
  }

  async delete(id: string): Promise<void> {
    await this.api.delete(WORK_ITEM_ENDPOINTS.DELETE(id));
  }

  async searchAssignableAdmins(search: string): Promise<PagedAssignableAdminsModel> {
    // Mirrors LeadsService.searchAssignableAdmins -- same endpoint, same
    // query shape (small page, active admins only).
    const url = buildUrl(WORK_ITEM_ENDPOINTS.ADMINS_LIST, {
      page: 1,
      pageSize: 10,
      search: search.trim() || undefined,
      isActive: true,
    });
    return this.api.get<PagedAssignableAdminsModel>(url);
  }
}
