import { TemplatesEntity } from "../../domain/entities/TemplatesEntity";
import type { TemplatesModel } from "../models/TemplatesModel";

export class TemplatesMapper {
  static toEntity(dto: TemplatesModel): TemplatesEntity {
    return new TemplatesEntity({
      id: dto.id ?? "",
      name: dto.name ?? "",
      description: dto.description ?? "",
      category: dto.category ?? "",
      isActive: dto.isActive ?? "",
      createdAt: dto.createdAt ?? "",
      updatedAt: dto.updatedAt ?? "",
    });
  }
}
