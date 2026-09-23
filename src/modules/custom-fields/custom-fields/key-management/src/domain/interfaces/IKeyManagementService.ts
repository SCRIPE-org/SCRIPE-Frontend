import type {
  TenantEncryptionStatusDto,
  MigrationSessionDto,
  EncryptionAuditLogDto,
  InitializeTenantKeyRequest,
  RotateTenantKeyRequest,
  RevokeTenantKeyRequest,
  StartRewrapRequest
} from "../../data/models/key-management.dto";

export interface IKeyManagementService {
  getStatus(): Promise<TenantEncryptionStatusDto>;
  initializeKey(request: InitializeTenantKeyRequest): Promise<TenantEncryptionStatusDto>;
  rotateKey(request: RotateTenantKeyRequest): Promise<TenantEncryptionStatusDto>;
  revokeKey(request: RevokeTenantKeyRequest): Promise<TenantEncryptionStatusDto>;
  startRewrap(request: StartRewrapRequest): Promise<MigrationSessionDto>;
  cancelRewrap(sessionId: string): Promise<boolean>;
  getSessionProgress(sessionId: string): Promise<MigrationSessionDto>;
  getAuditLogs(page?: number, pageSize?: number): Promise<{ items: EncryptionAuditLogDto[]; totalCount: number }>;
}
