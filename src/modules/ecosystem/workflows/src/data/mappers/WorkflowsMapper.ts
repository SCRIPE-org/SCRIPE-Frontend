import { WorkflowsEntity } from "../../domain/entities/WorkflowsEntity";
import type { WorkflowsModel } from "../models/WorkflowsModel";

export class WorkflowsMapper {
  static toEntity(dto: WorkflowsModel): WorkflowsEntity {
    return new WorkflowsEntity({
      id: dto.id ?? "",
      definitionKey: dto.definitionKey ?? "",
      status: dto.status ?? "",
      currentStep: dto.currentStep ?? "",
      startedAt: dto.startedAt ?? "",
      completedAt: dto.completedAt ?? "",
      initiator: dto.initiator ?? "",
    });
  }
}
