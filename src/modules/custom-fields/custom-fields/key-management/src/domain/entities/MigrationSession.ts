export interface MigrationSessionData {
  id: string;
  tenantCode: string;
  fromPlatformKeyId: number;
  toPlatformKeyId: number;
  fromTenantVersion: number;
  toTenantVersion: number;
  status: "Pending" | "Running" | "InProgress" | "Completed" | "Failed" | "Cancelled";
  totalRecords: number;
  migratedRecords: number;
  failedRecords: number;
  startedAt?: string;
  completedAt?: string;
  errorMessage?: string;
}

export class MigrationSession {
  constructor(private readonly data: MigrationSessionData) {}

  get id(): string { return this.data.id; }
  get tenantCode(): string { return this.data.tenantCode; }
  get fromPlatformKeyId(): number { return this.data.fromPlatformKeyId; }
  get toPlatformKeyId(): number { return this.data.toPlatformKeyId; }
  get fromTenantVersion(): number { return this.data.fromTenantVersion; }
  get toTenantVersion(): number { return this.data.toTenantVersion; }
  get status(): "Pending" | "Running" | "InProgress" | "Completed" | "Failed" | "Cancelled" { return this.data.status; }
  get totalRecords(): number { return this.data.totalRecords; }
  get migratedRecords(): number { return this.data.migratedRecords; }
  get failedRecords(): number { return this.data.failedRecords; }
  get startedAt(): string | undefined { return this.data.startedAt; }
  get completedAt(): string | undefined { return this.data.completedAt; }
  get errorMessage(): string | undefined { return this.data.errorMessage; }

  get progressPercentage(): number {
    if (this.totalRecords <= 0) return this.status === "Completed" ? 100 : 0;
    return Math.min(100, Math.round((this.migratedRecords / this.totalRecords) * 100));
  }

  get isRunning(): boolean {
    return this.status === "Pending" || this.status === "Running" || this.status === "InProgress";
  }

  get isTerminal(): boolean {
    return this.status === "Completed" || this.status === "Failed" || this.status === "Cancelled";
  }
}
