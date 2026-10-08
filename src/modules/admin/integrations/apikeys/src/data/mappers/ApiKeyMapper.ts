import { ApiKey } from "../../domain/entities/ApiKey";
import type { ApiKeyDto } from "../models/ApiKeyDto";

/**
 * Documentation for module export
 */
export class ApiKeyMapper {
  static toEntity(dto: ApiKeyDto): ApiKey {
    return new ApiKey({
      id: dto.id,
      name: dto.name ?? "",
      prefix: dto.prefix ?? "",
      scopes: dto.scopes ?? "",
      expiresAt: dto.expiresAt ?? null,
      revokedAt: dto.revokedAt ?? null,
      isActive: dto.isActive ?? false,
      createdAt: dto.createdAt ?? new Date().toISOString(),
    });
  }
}
