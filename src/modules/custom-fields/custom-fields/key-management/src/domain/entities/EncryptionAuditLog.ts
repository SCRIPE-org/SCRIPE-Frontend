/**
 * Documentation for module export
 */
export interface EncryptionAuditLogData {
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

/**
 * Documentation for module export
 */
export class EncryptionAuditLog {
  constructor(private readonly data: EncryptionAuditLogData) {}

  get id(): string {
    return this.data.id;
  }
  get action(): string {
    return this.data.action;
  }
  get fieldDefinitionId(): string {
    return this.data.fieldDefinitionId;
  }
  get fieldKey(): string | undefined {
    return this.data.fieldKey;
  }
  get entityId(): string {
    return this.data.entityId;
  }
  get platformKeyId(): number {
    return this.data.platformKeyId;
  }
  get tenantKeyVersion(): number {
    return this.data.tenantKeyVersion;
  }
  get actorId(): string {
    return this.data.actorId;
  }
  get ipAddress(): string {
    return this.data.ipAddress;
  }
  get userAgent(): string {
    return this.data.userAgent;
  }
  get timestamp(): string {
    return this.data.timestamp;
  }

  get formattedTimestamp(): string {
    try {
      return new Date(this.data.timestamp).toLocaleString();
    } catch {
      return this.data.timestamp;
    }
  }
}
