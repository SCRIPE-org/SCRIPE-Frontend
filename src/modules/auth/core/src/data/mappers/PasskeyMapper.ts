import { PasskeyEntity } from "../../domain/entities/PasskeyEntity";
import type { PasskeyResponseDto } from "../../domain/interfaces/IPasskeyService";

/**
 * PasskeyMapper — Converts between API DTOs and domain entities.
 *
 * All DTO fields are null-coalesced to safe defaults per architecture rules.
 */
export class PasskeyMapper {
  static toEntity(dto: PasskeyResponseDto): PasskeyEntity {
    return new PasskeyEntity({
      id: dto.id ?? "",
      deviceName: dto.deviceName ?? "Unknown Device",
      credentialIdMasked: dto.credentialIdMasked ?? "",
      createdAt: dto.createdAt ?? new Date().toISOString(),
      lastUsedAt: dto.lastUsedAt ?? null,
      isDiscoverable: dto.isDiscoverable ?? false,
      signCount: dto.signCount ?? 0,
    });
  }

  static toEntityList(dtos: PasskeyResponseDto[]): PasskeyEntity[] {
    return dtos.map(PasskeyMapper.toEntity);
  }
}
