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
} from "../models/SecurityModels";
import type {
  SecurityEvent,
  BlockedIP,
  LoginActivityPoint,
  SecurityChange,
} from "../../domain/entities/SecurityEntities";

/**
 * Data mapper class responsible for converting data structures between DTO models and domain entities.
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
      id: dto.id,
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
}
