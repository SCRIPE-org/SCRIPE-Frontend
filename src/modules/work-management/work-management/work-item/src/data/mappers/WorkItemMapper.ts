/**
 * WorkItem Mapper — converts WorkItemModel (DTO) <-> WorkItem (Entity).
 */
import { WorkItem, type WorkItemData } from "../../domain/entities/WorkItem";
import { WorkItemModel } from "../models/WorkItemModel";

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
}
