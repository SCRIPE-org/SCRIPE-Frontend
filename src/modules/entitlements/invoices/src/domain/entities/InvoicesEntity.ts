export interface InvoicesEntityData {
  id: string;
  number: string;
  tenantName: string;
  amount: string;
  currency: string;
  status: string;
  dueDate: string;
  paidAt: string;
  createdAt: string;
}

export class InvoicesEntity {
  constructor(private readonly data: InvoicesEntityData) {}

  get id() { return this.data.id; }
  get number() { return this.data.number; }
  get tenantName() { return this.data.tenantName; }
  get amount() { return this.data.amount; }
  get currency() { return this.data.currency; }
  get status() { return this.data.status; }
  get dueDate() { return this.data.dueDate; }
  get paidAt() { return this.data.paidAt; }
  get createdAt() { return this.data.createdAt; }

  copyWith(updates: Partial<InvoicesEntityData>): InvoicesEntity {
    return new InvoicesEntity({ ...this.data, ...updates });
  }
}
