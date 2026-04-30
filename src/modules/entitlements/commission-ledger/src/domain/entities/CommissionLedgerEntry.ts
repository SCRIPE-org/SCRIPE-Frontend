export interface CommissionLedgerEntryData {
  id: string;
  tenantId: string;
  userSubscriptionId: string;
  gateway: string;
  grossAmount: number;
  commissionRate: number;
  commissionAmount: number;
  currency: string;
  status: string;
  createdAt: string;
  notes: string | null;
}

export class CommissionLedgerEntry {
  constructor(private readonly data: CommissionLedgerEntryData) {}

  get id() { return this.data.id; }
  get tenantId() { return this.data.tenantId; }
  get userSubscriptionId() { return this.data.userSubscriptionId; }
  get gateway() { return this.data.gateway; }
  get grossAmount() { return this.data.grossAmount; }
  get commissionRate() { return this.data.commissionRate; }
  get commissionAmount() { return this.data.commissionAmount; }
  get currency() { return this.data.currency; }
  get status() { return this.data.status; }
  get createdAt() { return this.data.createdAt; }
  get notes() { return this.data.notes; }
}
