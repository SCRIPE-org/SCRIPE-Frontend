/**
 * WorkItem Repository — implements IWorkItemRepository using WorkItemService.
 */
import type {
  IWorkItemRepository,
  WorkItemListParams,
  AssignableAdmin,
} from "../../domain/interfaces/IWorkItemRepository";
import type { IWorkItemService } from "../../domain/interfaces/IWorkItemService";
import type { WorkItem } from "../../domain/entities/WorkItem";
import { WorkItemMapper } from "../mappers/WorkItemMapper";

export class WorkItemRepository implements IWorkItemRepository {
  constructor(private readonly service: IWorkItemService) {}

  async getAll(params: WorkItemListParams) {
    const result = await this.service.getAll(params);
    return {
      items: result.items.map((model) => WorkItemMapper.toEntity(model)),
      totalCount: result.totalCount,
      page: result.page,
      pageSize: result.pageSize,
      totalPages: result.totalPages,
      hasNextPage: result.hasNextPage,
      hasPreviousPage: result.hasPreviousPage,
    };
  }

  async getById(id: string): Promise<WorkItem> {
    const model = await this.service.getById(id);
    return WorkItemMapper.toEntity(model);
  }

  async create(data: Record<string, unknown>): Promise<string> {
    const response = await this.service.create(data);
    return response.id;
  }

  async update(id: string, data: Record<string, unknown>): Promise<void> {
    await this.service.update(id, data);
  }

  async delete(id: string): Promise<void> {
    await this.service.delete(id);
  }

  async searchAssignableAdmins(search: string): Promise<AssignableAdmin[]> {
    const model = await this.service.searchAssignableAdmins(search);
    return model.items.map(WorkItemMapper.toAssignableAdmin);
  }
}
