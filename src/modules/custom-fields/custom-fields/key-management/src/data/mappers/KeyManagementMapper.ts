import { TenantKeyStatus } from "../../domain/entities/TenantKeyStatus";
import { MigrationSession } from "../../domain/entities/MigrationSession";
import { EncryptionAuditLog } from "../../domain/entities/EncryptionAuditLog";
import type {
  TenantEncryptionStatusDto,
  MigrationSessionDto,
  EncryptionAuditLogDto
} from "../models/key-management.dto";

/**
 * Documentation for module export
 */
export class KeyManagementMapper {
  static toStatusEntity(dto: TenantEncryptionStatusDto): TenantKeyStatus {
    const totalRecords = dto.totalEncryptedValues ?? dto.totalEncryptedRecords ?? 0;
    const activeSession = dto.activeSession ? KeyManagementMapper.toSessionEntity(dto.activeSession) : undefined;
    const activeSessionId = dto.activeSession?.id ?? dto.activeSessionId;

    return new TenantKeyStatus({
      tenantCode: dto.tenantCode ?? "",
      isInitialized: dto.isInitialized ?? (dto.status === "Active" || (dto.activeVersion ?? 0) > 0),
      status: dto.status ?? "Uninitialized",
      activeVersion: dto.activeVersion ?? 0,
      currentPlatformKeyId: dto.currentPlatformKeyId ?? 0,
      providerType: dto.providerType ?? "LocalKeyring",
      lastRotatedAt: dto.lastRotatedAt,
      lastRotatedBy: dto.lastRotatedBy,
      totalEncryptedRecords: totalRecords,
      upToDateValues: dto.upToDateValues,
      outdatedValues: dto.outdatedValues,
      distribution: (dto.distribution ?? []).map(d => {
        const count = d.count ?? d.recordCount ?? 0;
        const percentage = d.percentage ?? (totalRecords > 0 ? Math.round((count / totalRecords) * 1000) / 10 : 0);
        return {
          platformKeyId: d.platformKeyId ?? 0,
          tenantKeyVersion: d.tenantKeyVersion ?? 0,
          recordCount: count,
          percentage,
        };
      }),
      hasPendingMigration: Boolean(dto.hasPendingMigration || activeSession?.isRunning),
      activeSessionId,
      activeSession,
      isPlatformKeyring: Boolean(dto.isPlatformKeyring),
      algorithm: dto.algorithm,
      minDecryptionVersion: dto.minDecryptionVersion,
    });
  }

  static toSessionEntity(dto: MigrationSessionDto): MigrationSession {
    const migrated = dto.processedRecords ?? dto.migratedRecords ?? 0;
    return new MigrationSession({
      id: dto.id ?? "",
      tenantCode: dto.tenantCode ?? "",
      fromPlatformKeyId: dto.fromPlatformKeyId ?? 0,
      toPlatformKeyId: dto.toPlatformKeyId ?? 0,
      fromTenantVersion: dto.fromTenantVersion ?? 0,
      toTenantVersion: dto.toTenantVersion ?? 0,
      status: dto.status ?? "Pending",
      totalRecords: dto.totalRecords ?? 0,
      migratedRecords: migrated,
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
