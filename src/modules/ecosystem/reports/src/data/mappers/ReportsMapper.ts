import { ReportsEntity } from "../../domain/entities/ReportsEntity";
import type { ReportsModel } from "../models/ReportsModel";

export class ReportsMapper {
  static toEntity(dto: ReportsModel): ReportsEntity {
    return new ReportsEntity({
      id: dto.id ?? "",
      name: dto.name ?? "",
      dataSource: dto.dataSource ?? "",
      status: dto.status ?? "",
      format: dto.format ?? "",
      generatedAt: dto.generatedAt ?? "",
      downloadUrl: dto.downloadUrl ?? "",
    });
  }
}
