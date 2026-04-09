export interface IntegrationsEntityData {
  id: string;
  name: string;
  type: string;
  provider: string;
  status: string;
  lastSyncAt: string;
  config: string;
  createdAt: string;
}

export class IntegrationsEntity {
  constructor(private readonly data: IntegrationsEntityData) {}

  get id() { return this.data.id; }
  get name() { return this.data.name; }
  get type() { return this.data.type; }
  get provider() { return this.data.provider; }
  get status() { return this.data.status; }
  get lastSyncAt() { return this.data.lastSyncAt; }
  get config() { return this.data.config; }
  get createdAt() { return this.data.createdAt; }

  copyWith(updates: Partial<IntegrationsEntityData>): IntegrationsEntity {
    return new IntegrationsEntity({ ...this.data, ...updates });
  }
}
