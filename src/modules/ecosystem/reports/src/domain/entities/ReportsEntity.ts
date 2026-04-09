export interface ReportsEntityData {
  id: string;
  name: string;
  dataSource: string;
  status: string;
  format: string;
  generatedAt: string;
  downloadUrl: string;
}

export class ReportsEntity {
  constructor(private readonly data: ReportsEntityData) {}

  get id() { return this.data.id; }
  get name() { return this.data.name; }
  get dataSource() { return this.data.dataSource; }
  get status() { return this.data.status; }
  get format() { return this.data.format; }
  get generatedAt() { return this.data.generatedAt; }
  get downloadUrl() { return this.data.downloadUrl; }

  copyWith(updates: Partial<ReportsEntityData>): ReportsEntity {
    return new ReportsEntity({ ...this.data, ...updates });
  }
}
