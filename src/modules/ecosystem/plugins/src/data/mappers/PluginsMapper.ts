import { PluginsEntity } from "../../domain/entities/PluginsEntity";
import type { PluginsModel } from "../models/PluginsModel";

export class PluginsMapper {
  static toEntity(dto: PluginsModel): PluginsEntity {
    return new PluginsEntity({
      id: dto.id ?? "",
      name: dto.name ?? "",
      version: dto.version ?? "",
      author: dto.author ?? "",
      description: dto.description ?? "",
      isEnabled: dto.isEnabled ?? "",
      isInstalled: dto.isInstalled ?? "",
      icon: dto.icon ?? "",
      createdAt: dto.createdAt ?? "",
    });
  }
}
