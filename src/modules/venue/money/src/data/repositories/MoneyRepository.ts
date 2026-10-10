import type {
  MoneyInvoice,
  MoneyListFilter,
  MoneyPage,
  MoneyPayment,
  MoneyPaymentTimeline,
  RecordManualPaymentInput,
  RefundPaymentInput,
  MoneyAnalyticsFilter,
  MoneySummaryResponse,
  MoneyTrendResponse,
  MoneyResourcePerformance,
  MoneyTimeOfDayBucket,
  MoneyPaymentMethodItem,
} from "../../domain/entities/Money";
import type { IMoneyRepository } from "../../domain/interfaces/IMoneyRepository";
import type { IMoneyService } from "../../domain/interfaces/IMoneyService";

export class MoneyRepository implements IMoneyRepository {
  constructor(private readonly service: IMoneyService) {}
  getInvoices(page?: number, pageSize?: number, filter?: MoneyListFilter): Promise<MoneyPage<MoneyInvoice>> { return this.service.getInvoices(page, pageSize, filter); }
  getPayments(page?: number, pageSize?: number, filter?: MoneyListFilter): Promise<MoneyPage<MoneyPayment>> { return this.service.getPayments(page, pageSize, filter); }
  recordPayment(input: RecordManualPaymentInput): Promise<MoneyPayment> { return this.service.recordPayment(input); }
  allocatePayment(paymentId: string, invoiceId: string, amount: number, idempotencyKey: string): Promise<void> { return this.service.allocatePayment(paymentId, invoiceId, amount, idempotencyKey); }
  issueReceipt(paymentId: string, idempotencyKey: string): Promise<void> { return this.service.issueReceipt(paymentId, idempotencyKey); }
  refundPayment(paymentId: string, input: RefundPaymentInput): Promise<void> { return this.service.refundPayment(paymentId, input); }
  getPaymentTimeline(paymentId: string): Promise<MoneyPaymentTimeline> { return this.service.getPaymentTimeline(paymentId); }
  getSummary(filter?: MoneyAnalyticsFilter): Promise<MoneySummaryResponse> { return this.service.getSummary(filter); }
  getTrend(filter?: MoneyAnalyticsFilter): Promise<MoneyTrendResponse> { return this.service.getTrend(filter); }
  getByResource(filter?: MoneyAnalyticsFilter): Promise<MoneyResourcePerformance[]> { return this.service.getByResource(filter); }
  getByTimeOfDay(filter?: MoneyAnalyticsFilter): Promise<MoneyTimeOfDayBucket[]> { return this.service.getByTimeOfDay(filter); }
  getPaymentMethods(filter?: MoneyAnalyticsFilter): Promise<MoneyPaymentMethodItem[]> { return this.service.getPaymentMethods(filter); }
}

