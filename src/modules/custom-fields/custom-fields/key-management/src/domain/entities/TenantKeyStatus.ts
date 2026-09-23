export interface KeyDistributionItem {
  platformKeyId: number;
  tenantKeyVersion: number;
  recordCount: number;
  percentage: number;
}

export interface TenantKeyStatusData {
  tenantCode: string;
  isInitialized: boolean;
  status: string;
  activeVersion: number;
  currentPlatformKeyId: number;
  providerType: string;
  lastRotatedAt?: string;
  lastRotatedBy?: string;
  totalEncryptedRecords: number;
  distribution: KeyDistributionItem[];
  hasPendingMigration: boolean;
  activeSessionId?: string;
}

export class TenantKeyStatus {
  constructor(private readonly data: TenantKeyStatusData) {}

  get tenantCode(): string { return this.data.tenantCode; }
  get isInitialized(): boolean { return this.data.isInitialized; }
  get status(): string { return this.data.status; }
  get activeVersion(): number { return this.data.activeVersion; }
  get currentPlatformKeyId(): number { return this.data.currentPlatformKeyId; }
  get providerType(): string { return this.data.providerType; }
  get lastRotatedAt(): string | undefined { return this.data.lastRotatedAt; }
  get lastRotatedBy(): string | undefined { return this.data.lastRotatedBy; }
  get totalEncryptedRecords(): number { return this.data.totalEncryptedRecords; }
  get distribution(): KeyDistributionItem[] { return this.data.distribution; }
  get hasPendingMigration(): boolean { return this.data.hasPendingMigration; }
  get activeSessionId(): string | undefined { return this.data.activeSessionId; }

  get isFullyMigrated(): boolean {
    if (this.distribution.length === 0) return true;
    const currentMatches = this.distribution.filter(
      d => d.platformKeyId === this.currentPlatformKeyId && d.tenantKeyVersion === this.activeVersion
    );
    return currentMatches.length === 1 && currentMatches[0].percentage >= 99.9;
  }
}
