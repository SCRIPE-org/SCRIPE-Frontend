export interface BulkOperationsEntityData {
  id: string;
  type: string;
  status: string;
  totalRecords: string;
  processedRecords: string;
  failedRecords: string;
  startedAt: string;
  completedAt: string;
}

export class BulkOperationsEntity {
  constructor(private readonly data: BulkOperationsEntityData) {}

  get id() { return this.data.id; }
  get type() { return this.data.type; }
  get status() { return this.data.status; }
  get totalRecords() { return this.data.totalRecords; }
  get processedRecords() { return this.data.processedRecords; }
  get failedRecords() { return this.data.failedRecords; }
  get startedAt() { return this.data.startedAt; }
  get completedAt() { return this.data.completedAt; }

  copyWith(updates: Partial<BulkOperationsEntityData>): BulkOperationsEntity {
    return new BulkOperationsEntity({ ...this.data, ...updates });
  }
}
