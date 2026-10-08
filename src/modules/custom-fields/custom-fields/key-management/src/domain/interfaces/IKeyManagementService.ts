import type {
  TenantEncryptionStatusDto,
  MigrationSessionDto,
  EncryptionAuditLogDto,
  InitializeTenantKeyRequest,
  RotateTenantKeyRequest,
  RevokeTenantKeyRequest,
  StartRewrapRequest,
} from "../../data/models/key-management.dto";

/**
 * Documentation for module export
 */
export interface IKeyManagementService {
  getStatus(): Promise<TenantEncryptionStatusDto>;
  initializeKey(request: InitializeTenantKeyRequest): Promise<TenantEncryptionStatusDto>;
  rotateKey(request: RotateTenantKeyRequest): Promise<MigrationSessionDto>;
  revokeKey(request: RevokeTenantKeyRequest): Promise<boolean>;
  startRewrap(request: StartRewrapRequest): Promise<MigrationSessionDto>;
  cancelRewrap(sessionId: string): Promise<boolean>;
  getSessionProgress(sessionId: string): Promise<MigrationSessionDto>;
  getAuditLogs(
    page?: number,
    pageSize?: number
  ): Promise<{ items: EncryptionAuditLogDto[]; totalCount: number }>;
}
