export interface WorkspaceInfoData {
  tenantCode: string;
  tenantName: string;
  logoUrl: string | null;
  isPlatformAdmin: boolean;
  isActivated: boolean;
  loginUrl: string;
}

export class WorkspaceInfo {
  constructor(private readonly data: WorkspaceInfoData) {}

  get tenantCode() { return this.data.tenantCode; }
  get tenantName() { return this.data.tenantName; }
  get logoUrl() { return this.data.logoUrl; }
  get isPlatformAdmin() { return this.data.isPlatformAdmin; }
  get isActivated() { return this.data.isActivated; }
  get loginUrl() { return this.data.loginUrl; }

  get displayName() {
    return this.isPlatformAdmin ? "Platform Admin" : this.tenantName;
  }

  copyWith(updates: Partial<WorkspaceInfoData>): WorkspaceInfo {
    return new WorkspaceInfo({ ...this.data, ...updates });
  }
}
