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
} from "../entities/Money";

export interface IMoneyService {
  getInvoices(page?: number, pageSize?: number, filter?: MoneyListFilter): Promise<MoneyPage<MoneyInvoice>>;
  getPayments(page?: number, pageSize?: number, filter?: MoneyListFilter): Promise<MoneyPage<MoneyPayment>>;
  recordPayment(input: RecordManualPaymentInput): Promise<MoneyPayment>;
  allocatePayment(paymentId: string, invoiceId: string, amount: number, idempotencyKey: string): Promise<void>;
  issueReceipt(paymentId: string, idempotencyKey: string): Promise<void>;
  refundPayment(paymentId: string, input: RefundPaymentInput): Promise<void>;
  getPaymentTimeline(paymentId: string): Promise<MoneyPaymentTimeline>;
  getSummary(filter?: MoneyAnalyticsFilter): Promise<MoneySummaryResponse>;
  getTrend(filter?: MoneyAnalyticsFilter): Promise<MoneyTrendResponse>;
  getByResource(filter?: MoneyAnalyticsFilter): Promise<MoneyResourcePerformance[]>;
  getByTimeOfDay(filter?: MoneyAnalyticsFilter): Promise<MoneyTimeOfDayBucket[]>;
  getPaymentMethods(filter?: MoneyAnalyticsFilter): Promise<MoneyPaymentMethodItem[]>;
}

