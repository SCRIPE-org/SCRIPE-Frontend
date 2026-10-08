/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Security Mapper
 *
 * Static DTO ↔ Entity converters with null-coalescing.
 */
import type {
  SecurityEventDto,
  BlockedIPDto,
  LoginActivityPointDto,
  SecurityChangeDto,
  ActiveSessionDto,
} from "../models/SecurityModels";
import type {
  SecurityEvent,
  BlockedIP,
  LoginActivityPoint,
  SecurityChange,
  ActiveSession,
} from "../../domain/entities/SecurityEntities";

/**
 * Bidirectional data mapper orchestrating conversion between database DTO formats and frontend domain entities, enforcing null-safe defaults.
 */
export class SecurityMapper {
  static toSecurityEvent(dto: SecurityEventDto): SecurityEvent {
    return {
      eventType: dto.eventType ?? "",
      count: dto.count ?? 0,
      latestOccurrence: dto.latestOccurrence,
    };
  }

  static toBlockedIP(dto: BlockedIPDto): BlockedIP {
    return {
      ipAddress: dto.ipAddress ?? "",
      failedCount: dto.failedCount ?? 0,
      latestAttempt: dto.latestAttempt ?? "",
      lastUsername: dto.lastUsername,
    };
  }

  static toLoginActivityPoint(dto: LoginActivityPointDto): LoginActivityPoint {
    return {
      date: dto.date ?? "",
      successCount: dto.successCount ?? 0,
      failedCount: dto.failedCount ?? 0,
    };
  }

  static toSecurityChange(dto: SecurityChangeDto): SecurityChange {
    return {
      id: dto.id ?? "",
      eventType: dto.eventType ?? "",
      httpMethod: dto.httpMethod,
      endpoint: dto.endpoint,
      entityType: dto.entityType,
      entityId: dto.entityId,
      username: dto.username,
      isAdmin: dto.isAdmin ?? false,
      ipAddress: dto.ipAddress,
      isSuccess: dto.isSuccess ?? true,
      errorMessage: dto.errorMessage,
      timestamp: dto.timestamp ?? "",
      tenantId: dto.tenantId,
    };
  }

  static toActiveSession(dto: ActiveSessionDto, index: number = 0): ActiveSession {
    const rawId = (dto as any).id || (dto as any).Id || dto.tokenId || "";
    const resolvedTokenId =
      rawId.trim() !== "" ? rawId : `session-${index}-${Date.now()}`;

    return {
      tokenId: resolvedTokenId,
      deviceInfo: dto.deviceInfo || "Unknown Browser / OS",
      ipAddress: dto.ipAddress || "—",
      createdAt: dto.createdAt || "",
      expiresAt: dto.expiresAt || "",
      isCurrent: Boolean(dto.isCurrent),
    };
  }
}
