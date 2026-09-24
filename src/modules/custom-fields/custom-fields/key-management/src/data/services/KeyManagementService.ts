import type { IApiService } from "@/core/interfaces/api.interface";
import type { IKeyManagementService } from "../../domain/interfaces/IKeyManagementService";
import type {
  TenantEncryptionStatusDto,
  MigrationSessionDto,
  EncryptionAuditLogDto,
  InitializeTenantKeyRequest,
  RotateTenantKeyRequest,
  RevokeTenantKeyRequest,
  StartRewrapRequest
} from "../models/key-management.dto";
import { KEY_MANAGEMENT_ENDPOINTS } from "./key-management.endpoints";

export class KeyManagementService implements IKeyManagementService {
  constructor(private readonly api: IApiService) {}

  async getStatus(): Promise<TenantEncryptionStatusDto> {
    return this.api.get<TenantEncryptionStatusDto>(KEY_MANAGEMENT_ENDPOINTS.STATUS);
  }

  async initializeKey(request: InitializeTenantKeyRequest): Promise<TenantEncryptionStatusDto> {
    return this.api.post<TenantEncryptionStatusDto>(KEY_MANAGEMENT_ENDPOINTS.INITIALIZE, request);
  }

  async rotateKey(request: RotateTenantKeyRequest): Promise<MigrationSessionDto> {
    return this.api.post<MigrationSessionDto>(KEY_MANAGEMENT_ENDPOINTS.ROTATE, request);
  }

  async revokeKey(request: RevokeTenantKeyRequest): Promise<boolean> {
    await this.api.post<boolean>(KEY_MANAGEMENT_ENDPOINTS.REVOKE, request);
    return true;
  }

  async startRewrap(request: StartRewrapRequest): Promise<MigrationSessionDto> {
    return this.api.post<MigrationSessionDto>(KEY_MANAGEMENT_ENDPOINTS.START_REWRAP, request);
  }

  async cancelRewrap(sessionId: string): Promise<boolean> {
    await this.api.post<void>(KEY_MANAGEMENT_ENDPOINTS.CANCEL_REWRAP(sessionId), {});
    return true;
  }

  async getSessionProgress(sessionId: string): Promise<MigrationSessionDto> {
    return this.api.get<MigrationSessionDto>(KEY_MANAGEMENT_ENDPOINTS.SESSION_PROGRESS(sessionId));
  }

  async getAuditLogs(page = 1, pageSize = 20): Promise<{ items: EncryptionAuditLogDto[]; totalCount: number }> {
    return this.api.get<{ items: EncryptionAuditLogDto[]; totalCount: number }>(
      KEY_MANAGEMENT_ENDPOINTS.AUDIT_LOGS(page, pageSize)
    );
  }
}
