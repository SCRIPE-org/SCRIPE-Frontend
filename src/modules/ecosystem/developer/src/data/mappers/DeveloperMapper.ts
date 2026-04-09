import { DeveloperEntity } from "../../domain/entities/DeveloperEntity";
import type { DeveloperModel } from "../models/DeveloperModel";

export class DeveloperMapper {
  static toEntity(dto: DeveloperModel): DeveloperEntity {
    return new DeveloperEntity({
      apiVersion: dto.apiVersion ?? "",
      totalEndpoints: dto.totalEndpoints ?? "",
      activeWebhooks: dto.activeWebhooks ?? "",
      sdkLanguages: dto.sdkLanguages ?? "",
      healthStatus: dto.healthStatus ?? "",
    });
  }
}
