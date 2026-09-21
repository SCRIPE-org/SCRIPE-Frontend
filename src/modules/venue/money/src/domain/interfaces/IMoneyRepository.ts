import type { MoneyInvoice, MoneyListFilter, MoneyPage, MoneyPayment, MoneyPaymentTimeline, RecordManualPaymentInput, RefundPaymentInput } from "../entities/Money";

export interface IMoneyRepository {
  getInvoices(page?: number, pageSize?: number, filter?: MoneyListFilter): Promise<MoneyPage<MoneyInvoice>>;
  getPayments(page?: number, pageSize?: number, filter?: MoneyListFilter): Promise<MoneyPage<MoneyPayment>>;
  recordPayment(input: RecordManualPaymentInput): Promise<MoneyPayment>;
  allocatePayment(paymentId: string, invoiceId: string, amount: number, idempotencyKey: string): Promise<void>;
  issueReceipt(paymentId: string, idempotencyKey: string): Promise<void>;
  refundPayment(paymentId: string, input: RefundPaymentInput): Promise<void>;
  getPaymentTimeline(paymentId: string): Promise<MoneyPaymentTimeline>;
}
