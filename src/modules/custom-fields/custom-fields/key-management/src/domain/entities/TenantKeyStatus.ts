import type { MigrationSession } from "./MigrationSession";

/**
 * Documentation for module export
 */
export interface KeyDistributionItem {
  platformKeyId: number;
  tenantKeyVersion: number;
  recordCount: number;
  percentage: number;
}

/**
 * Documentation for module export
 */
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
  upToDateValues?: number;
  outdatedValues?: number;
  distribution: KeyDistributionItem[];
  hasPendingMigration: boolean;
  activeSessionId?: string;
  activeSession?: MigrationSession;
  isPlatformKeyring?: boolean;
  algorithm?: string;
  minDecryptionVersion?: number;
}

/**
 * Documentation for module export
 */
export class TenantKeyStatus {
  constructor(private readonly data: TenantKeyStatusData) {}

  get tenantCode(): string {
    return this.data.tenantCode;
  }
  get isInitialized(): boolean {
    return this.data.isInitialized;
  }
  get status(): string {
    return this.data.status;
  }
  get activeVersion(): number {
    return this.data.activeVersion;
  }
  get currentPlatformKeyId(): number {
    return this.data.currentPlatformKeyId;
  }
  get providerType(): string {
    return this.data.providerType;
  }
  get lastRotatedAt(): string | undefined {
    return this.data.lastRotatedAt;
  }
  get lastRotatedBy(): string | undefined {
    return this.data.lastRotatedBy;
  }
  get totalEncryptedRecords(): number {
    return this.data.totalEncryptedRecords;
  }
  get upToDateValues(): number {
    return this.data.upToDateValues ?? this.data.totalEncryptedRecords;
  }
  get outdatedValues(): number {
    return this.data.outdatedValues ?? 0;
  }
  get distribution(): KeyDistributionItem[] {
    return this.data.distribution;
  }
  get hasPendingMigration(): boolean {
    return this.data.hasPendingMigration;
  }
  get activeSessionId(): string | undefined {
    return this.data.activeSessionId;
  }
  get activeSession(): MigrationSession | undefined {
    return this.data.activeSession;
  }
  get isPlatformKeyring(): boolean {
    return this.data.isPlatformKeyring ?? false;
  }
  get algorithm(): string | undefined {
    return this.data.algorithm;
  }
  get minDecryptionVersion(): number | undefined {
    return this.data.minDecryptionVersion;
  }

  get isFullyMigrated(): boolean {
    if (this.data.outdatedValues !== undefined) {
      return this.data.outdatedValues === 0;
    }
    if (this.distribution.length === 0) return true;
    const currentMatches = this.distribution.filter(
      (d) =>
        d.platformKeyId === this.currentPlatformKeyId && d.tenantKeyVersion === this.activeVersion
    );
    return currentMatches.length === 1 && currentMatches[0].percentage >= 99.9;
  }
}
