import { Site } from "../../domain/entities/Site";
import type { SiteDto } from "../models/SiteDto";

export class SiteMapper {
  static toEntity(dto: SiteDto): Site {
    return new Site({
      id: dto.id,
      name: dto.name ?? "",
      branchId: dto.branchId ?? null,
      address: dto.address ?? null,
      timeZone: dto.timeZone ?? null,
      createdAt: dto.createdAt ?? null,
    });
  }
}
