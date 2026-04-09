import { BulkOperationsEntity } from "../../domain/entities/BulkOperationsEntity";
import type { BulkOperationsModel } from "../models/BulkOperationsModel";

export class BulkOperationsMapper {
  static toEntity(dto: BulkOperationsModel): BulkOperationsEntity {
    return new BulkOperationsEntity({
      id: dto.id ?? "",
      type: dto.type ?? "",
      status: dto.status ?? "",
      totalRecords: dto.totalRecords ?? "",
      processedRecords: dto.processedRecords ?? "",
      failedRecords: dto.failedRecords ?? "",
      startedAt: dto.startedAt ?? "",
      completedAt: dto.completedAt ?? "",
    });
  }
}
