import { TenantKeyStatus } from "../../domain/entities/TenantKeyStatus";
import { MigrationSession } from "../../domain/entities/MigrationSession";
import { EncryptionAuditLog } from "../../domain/entities/EncryptionAuditLog";
import type {
  TenantEncryptionStatusDto,
  MigrationSessionDto,
  EncryptionAuditLogDto
} from "../models/key-management.dto";

export class KeyManagementMapper {
  static toStatusEntity(dto: TenantEncryptionStatusDto): TenantKeyStatus {
    return new TenantKeyStatus({
      tenantCode: dto.tenantCode ?? "",
      isInitialized: Boolean(dto.isInitialized),
      status: dto.status ?? "Uninitialized",
      activeVersion: dto.activeVersion ?? 0,
      currentPlatformKeyId: dto.currentPlatformKeyId ?? 0,
      providerType: dto.providerType ?? "LocalKeyring",
      lastRotatedAt: dto.lastRotatedAt,
      lastRotatedBy: dto.lastRotatedBy,
      totalEncryptedRecords: dto.totalEncryptedRecords ?? 0,
      distribution: (dto.distribution ?? []).map(d => ({
        platformKeyId: d.platformKeyId ?? 0,
        tenantKeyVersion: d.tenantKeyVersion ?? 0,
        recordCount: d.recordCount ?? 0,
        percentage: d.percentage ?? 0,
      })),
      hasPendingMigration: Boolean(dto.hasPendingMigration),
      activeSessionId: dto.activeSessionId,
    });
  }

  static toSessionEntity(dto: MigrationSessionDto): MigrationSession {
    return new MigrationSession({
      id: dto.id ?? "",
      tenantCode: dto.tenantCode ?? "",
      fromPlatformKeyId: dto.fromPlatformKeyId ?? 0,
      toPlatformKeyId: dto.toPlatformKeyId ?? 0,
      fromTenantVersion: dto.fromTenantVersion ?? 0,
      toTenantVersion: dto.toTenantVersion ?? 0,
      status: dto.status ?? "Pending",
      totalRecords: dto.totalRecords ?? 0,
      migratedRecords: dto.migratedRecords ?? 0,
      failedRecords: dto.failedRecords ?? 0,
      startedAt: dto.startedAt,
      completedAt: dto.completedAt,
      errorMessage: dto.errorMessage,
    });
  }

  static toAuditLogEntity(dto: EncryptionAuditLogDto): EncryptionAuditLog {
    return new EncryptionAuditLog({
      id: dto.id ?? "",
      action: dto.action ?? "",
      fieldDefinitionId: dto.fieldDefinitionId ?? "",
      fieldKey: dto.fieldKey,
      entityId: dto.entityId ?? "",
      platformKeyId: dto.platformKeyId ?? 0,
      tenantKeyVersion: dto.tenantKeyVersion ?? 0,
      actorId: dto.actorId ?? "",
      ipAddress: dto.ipAddress ?? "",
      userAgent: dto.userAgent ?? "",
      timestamp: dto.timestamp ?? "",
    });
  }
}
