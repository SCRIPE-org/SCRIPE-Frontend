import { IntegrationsEntity } from "../../domain/entities/IntegrationsEntity";
import type { IntegrationsModel } from "../models/IntegrationsModel";

export class IntegrationsMapper {
  static toEntity(dto: IntegrationsModel): IntegrationsEntity {
    return new IntegrationsEntity({
      id: dto.id ?? "",
      name: dto.name ?? "",
      type: dto.type ?? "",
      provider: dto.provider ?? "",
      status: dto.status ?? "",
      lastSyncAt: dto.lastSyncAt ?? "",
      config: dto.config ?? "",
      createdAt: dto.createdAt ?? "",
    });
  }
}
