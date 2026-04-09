export interface DeveloperEntityData {
  apiVersion: string;
  totalEndpoints: string;
  activeWebhooks: string;
  sdkLanguages: string;
  healthStatus: string;
}

export class DeveloperEntity {
  constructor(private readonly data: DeveloperEntityData) {}

  get apiVersion() { return this.data.apiVersion; }
  get totalEndpoints() { return this.data.totalEndpoints; }
  get activeWebhooks() { return this.data.activeWebhooks; }
  get sdkLanguages() { return this.data.sdkLanguages; }
  get healthStatus() { return this.data.healthStatus; }

  copyWith(updates: Partial<DeveloperEntityData>): DeveloperEntity {
    return new DeveloperEntity({ ...this.data, ...updates });
  }
}
