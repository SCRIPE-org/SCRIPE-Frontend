export interface PricingSnapshotItem {
  currency: string;
  billingCycle: string;
  amount: number;
}

export interface EditionVersionModel {
  id: string;
  versionNumber: number;
  changeNotes?: string;
  rolloutStrategy: string;
  status: string;
  scheduledAt?: string;
  completedAt?: string;
  canaryPercentage?: number;
  pricingSnapshotJson?: string;
  createdAt: string;
}

export class EditionVersion {
  constructor(public readonly data: EditionVersionModel) {}

  get id(): string {
    return this.data.id;
  }
  get versionNumber(): number {
    return this.data.versionNumber;
  }
  get changeNotes(): string | undefined {
    return this.data.changeNotes;
  }
  get rolloutStrategy(): string {
    return this.data.rolloutStrategy;
  }
  get status(): string {
    return this.data.status;
  }
  get scheduledAt(): string | undefined {
    return this.data.scheduledAt;
  }
  get completedAt(): string | undefined {
    return this.data.completedAt;
  }
  get canaryPercentage(): number | undefined {
    return this.data.canaryPercentage;
  }
  get createdAt(): string {
    return this.data.createdAt;
  }

  get pricingSnapshot(): PricingSnapshotItem[] | null {
    if (!this.data.pricingSnapshotJson) return null;
    try {
      return JSON.parse(this.data.pricingSnapshotJson);
    } catch {
      return null;
    }
  }
  get hasPricingChanges(): boolean {
    return !!this.data.pricingSnapshotJson;
  }

  copyWith(updates: Partial<EditionVersionModel>): EditionVersion {
    return new EditionVersion({
      ...this.data,
      ...updates,
    } as EditionVersionModel);
  }
}
