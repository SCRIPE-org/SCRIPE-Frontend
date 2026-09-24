import type { IKeyManagementRepository } from "../../domain/interfaces/IKeyManagementRepository";
import type { IKeyManagementService } from "../../domain/interfaces/IKeyManagementService";
import type { TenantKeyStatus } from "../../domain/entities/TenantKeyStatus";
import type { MigrationSession } from "../../domain/entities/MigrationSession";
import type { EncryptionAuditLog } from "../../domain/entities/EncryptionAuditLog";
import type {
  InitializeTenantKeyRequest,
  RotateTenantKeyRequest,
  RevokeTenantKeyRequest,
  StartRewrapRequest
} from "../models/key-management.dto";
import { KeyManagementMapper } from "../mappers/KeyManagementMapper";

export class KeyManagementRepository implements IKeyManagementRepository {
  constructor(private readonly service: IKeyManagementService) {}

  async getStatus(): Promise<TenantKeyStatus> {
    const dto = await this.service.getStatus();
    return KeyManagementMapper.toStatusEntity(dto);
  }

  async initializeKey(request: InitializeTenantKeyRequest): Promise<TenantKeyStatus> {
    const dto = await this.service.initializeKey(request);
    return KeyManagementMapper.toStatusEntity(dto);
  }

  async rotateKey(request: RotateTenantKeyRequest): Promise<MigrationSession> {
    const dto = await this.service.rotateKey(request);
    return KeyManagementMapper.toSessionEntity(dto);
  }

  async revokeKey(request: RevokeTenantKeyRequest): Promise<boolean> {
    return this.service.revokeKey(request);
  }

  async startRewrap(request: StartRewrapRequest): Promise<MigrationSession> {
    const dto = await this.service.startRewrap(request);
    return KeyManagementMapper.toSessionEntity(dto);
  }

  async cancelRewrap(sessionId: string): Promise<boolean> {
    return this.service.cancelRewrap(sessionId);
  }

  async getSessionProgress(sessionId: string): Promise<MigrationSession> {
    const dto = await this.service.getSessionProgress(sessionId);
    return KeyManagementMapper.toSessionEntity(dto);
  }

  async getAuditLogs(page = 1, pageSize = 20): Promise<{ items: EncryptionAuditLog[]; totalCount: number }> {
    const result = await this.service.getAuditLogs(page, pageSize);
    return {
      items: (result.items ?? []).map(KeyManagementMapper.toAuditLogEntity),
      totalCount: result.totalCount ?? 0,
    };
  }
}
