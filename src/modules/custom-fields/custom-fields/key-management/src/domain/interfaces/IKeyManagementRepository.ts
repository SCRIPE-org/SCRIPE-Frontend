import type { TenantKeyStatus } from "../entities/TenantKeyStatus";
import type { MigrationSession } from "../entities/MigrationSession";
import type { EncryptionAuditLog } from "../entities/EncryptionAuditLog";
import type {
  InitializeTenantKeyRequest,
  RotateTenantKeyRequest,
  RevokeTenantKeyRequest,
  StartRewrapRequest
} from "../../data/models/key-management.dto";

export interface IKeyManagementRepository {
  getStatus(): Promise<TenantKeyStatus>;
  initializeKey(request: InitializeTenantKeyRequest): Promise<TenantKeyStatus>;
  rotateKey(request: RotateTenantKeyRequest): Promise<MigrationSession>;
  revokeKey(request: RevokeTenantKeyRequest): Promise<boolean>;
  startRewrap(request: StartRewrapRequest): Promise<MigrationSession>;
  cancelRewrap(sessionId: string): Promise<boolean>;
  getSessionProgress(sessionId: string): Promise<MigrationSession>;
  getAuditLogs(page?: number, pageSize?: number): Promise<{ items: EncryptionAuditLog[]; totalCount: number }>;
}
