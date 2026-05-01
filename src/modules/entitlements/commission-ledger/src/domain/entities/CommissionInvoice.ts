export interface CommissionInvoiceData {
  id: string;
  tenantId: string;
  invoiceNumber: string;
  periodStart: string;
  periodEnd: string;
  totalCommission: number;
  currency: string;
  status: string;
  dueDate: string | null;
  trigger: string;
  createdAt: string;
  notes: string | null;
}

export class CommissionInvoice {
  constructor(private readonly data: CommissionInvoiceData) {}

  get id() {
    return this.data.id;
  }
  get tenantId() {
    return this.data.tenantId;
  }
  get invoiceNumber() {
    return this.data.invoiceNumber;
  }
  get periodStart() {
    return this.data.periodStart;
  }
  get periodEnd() {
    return this.data.periodEnd;
  }
  get totalCommission() {
    return this.data.totalCommission;
  }
  get currency() {
    return this.data.currency;
  }
  get status() {
    return this.data.status;
  }
  get dueDate() {
    return this.data.dueDate;
  }
  get trigger() {
    return this.data.trigger;
  }
  get createdAt() {
    return this.data.createdAt;
  }
  get notes() {
    return this.data.notes;
  }
}
