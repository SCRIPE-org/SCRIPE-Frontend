export interface ComplianceEntityData {
  id: string;
  type: string;
  status: string;
  entityType: string;
  retentionDays: string;
  createdAt: string;
}

export class ComplianceEntity {
  constructor(private readonly data: ComplianceEntityData) {}

  get id() { return this.data.id; }
  get type() { return this.data.type; }
  get status() { return this.data.status; }
  get entityType() { return this.data.entityType; }
  get retentionDays() { return this.data.retentionDays; }
  get createdAt() { return this.data.createdAt; }

  copyWith(updates: Partial<ComplianceEntityData>): ComplianceEntity {
    return new ComplianceEntity({ ...this.data, ...updates });
  }
}
