/**
 * WorkItem Mapper — converts WorkItemModel (DTO) <-> WorkItem (Entity).
 */
import { WorkItem, type WorkItemData } from "../../domain/entities/WorkItem";
import { WorkItemModel, type AssignableAdminResponseModel } from "../models/WorkItemModel";
import type { AssignableAdmin } from "../../domain/interfaces/IWorkItemRepository";

export class WorkItemMapper {
  static toEntity(model: WorkItemModel): WorkItem {
    const data: WorkItemData = {
      id: model.id,
      title: model.title,
      description: model.description,
      status: model.status,
      priority: model.priority,
      dueAt: model.dueAt,
      ownerEntityTypeKey: model.ownerEntityTypeKey,
      ownerEntityId: model.ownerEntityId,
      assignedToId: model.assignedToId,
      completedAt: model.completedAt,
      isActive: model.isActive,
      createdAt: model.createdAt,
      modifiedAt: model.modifiedAt,
    };
    return new WorkItem(data);
  }

  // Mirrors LeadsMapper.toAssignableAdmin.
  static toAssignableAdmin(dto: AssignableAdminResponseModel): AssignableAdmin {
    const displayName = `${dto.firstName ?? ""} ${dto.lastName ?? ""}`.trim() || dto.username;

    return {
      id: dto.id,
      username: dto.username ?? "",
      displayName,
      email: dto.email,
      tenantName: dto.tenantName,
      isPlatformAdmin: Boolean(dto.isSuperAdmin || !dto.tenantId),
    };
  }
}
