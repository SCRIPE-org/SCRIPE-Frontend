export interface KeyDistributionItemDto {
  platformKeyId: number;
  tenantKeyVersion: number;
  recordCount: number;
  percentage: number;
}

export interface TenantEncryptionStatusDto {
  tenantCode: string;
  isInitialized: boolean;
  status: string;
  activeVersion: number;
  currentPlatformKeyId: number;
  providerType: string;
  lastRotatedAt?: string;
  lastRotatedBy?: string;
  totalEncryptedRecords: number;
  distribution: KeyDistributionItemDto[];
  hasPendingMigration: boolean;
  activeSessionId?: string;
}

export interface MigrationSessionDto {
  id: string;
  tenantCode: string;
  fromPlatformKeyId: number;
  toPlatformKeyId: number;
  fromTenantVersion: number;
  toTenantVersion: number;
  status: "Pending" | "InProgress" | "Completed" | "Failed" | "Cancelled";
  totalRecords: number;
  migratedRecords: number;
  failedRecords: number;
  startedAt?: string;
  completedAt?: string;
  errorMessage?: string;
}

export interface EncryptionAuditLogDto {
  id: string;
  action: string;
  fieldDefinitionId: string;
  fieldKey?: string;
  entityId: string;
  platformKeyId: number;
  tenantKeyVersion: number;
  actorId: string;
  ipAddress: string;
  userAgent: string;
  timestamp: string;
}

export interface InitializeTenantKeyRequest {
  providerType?: string;
  keyVaultKeyUri?: string;
}

export interface RotateTenantKeyRequest {
  reason: string;
  autoMigrate?: boolean;
}

export interface RevokeTenantKeyRequest {
  reason: string;
  confirmationCode: string;
}

export interface StartRewrapRequest {
  targetPlatformKeyId?: number;
  targetTenantVersion?: number;
  batchSize?: number;
}
