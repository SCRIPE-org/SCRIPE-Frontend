import type { IApiService } from "@core/interfaces/api.interface";
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
import type { IMoneyService } from "../../domain/interfaces/IMoneyService";
import { MONEY_ENDPOINTS } from "./money.endpoints";

export class MoneyService implements IMoneyService {
  constructor(private readonly api: IApiService) {}

  getInvoices(page = 1, pageSize = 50, filter?: MoneyListFilter): Promise<MoneyPage<MoneyInvoice>> {
    const query = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
    if (filter?.reservationId) query.set("reservationId", filter.reservationId);
    if (filter?.payerPartyId) query.set("payerPartyId", filter.payerPartyId);
    return this.api.get(`${MONEY_ENDPOINTS.INVOICES}?${query.toString()}`);
  }

  getPayments(page = 1, pageSize = 50, filter?: MoneyListFilter): Promise<MoneyPage<MoneyPayment>> {
    const query = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
    if (filter?.reservationId) query.set("reservationId", filter.reservationId);
    if (filter?.payerPartyId) query.set("payerPartyId", filter.payerPartyId);
    return this.api.get(`${MONEY_ENDPOINTS.PAYMENTS}?${query.toString()}`);
  }

  recordPayment(input: RecordManualPaymentInput): Promise<MoneyPayment> {
    return this.api.post(MONEY_ENDPOINTS.PAYMENTS, input);
  }

  async allocatePayment(paymentId: string, invoiceId: string, amount: number, idempotencyKey: string): Promise<void> {
    await this.api.post(MONEY_ENDPOINTS.ALLOCATIONS(paymentId), { invoiceId, amount, idempotencyKey });
  }

  async issueReceipt(paymentId: string, idempotencyKey: string): Promise<void> {
    await this.api.post(MONEY_ENDPOINTS.RECEIPTS(paymentId), { idempotencyKey, notes: null });
  }

  async refundPayment(paymentId: string, input: RefundPaymentInput): Promise<void> {
    await this.api.post(MONEY_ENDPOINTS.REFUNDS(paymentId), input);
  }

  getPaymentTimeline(paymentId: string): Promise<MoneyPaymentTimeline> {
    return this.api.get(MONEY_ENDPOINTS.TIMELINE(paymentId));
  }

  getSummary(filter?: MoneyAnalyticsFilter): Promise<MoneySummaryResponse> {
    const query = new URLSearchParams();
    if (filter?.dateFromUtc) query.set("dateFromUtc", filter.dateFromUtc);
    if (filter?.dateToUtc) query.set("dateToUtc", filter.dateToUtc);
    if (filter?.currencyCode) query.set("currencyCode", filter.currencyCode);
    if (filter?.resourceId) query.set("resourceId", filter.resourceId);
    if (filter?.facilityResourceProfileId) query.set("facilityResourceProfileId", filter.facilityResourceProfileId);
    const qs = query.toString();
    return this.api.get(`${MONEY_ENDPOINTS.ANALYTICS_SUMMARY}${qs ? `?${qs}` : ""}`);
  }

  getTrend(filter?: MoneyAnalyticsFilter): Promise<MoneyTrendResponse> {
    const query = new URLSearchParams();
    if (filter?.dateFromUtc) query.set("dateFromUtc", filter.dateFromUtc);
    if (filter?.dateToUtc) query.set("dateToUtc", filter.dateToUtc);
    if (filter?.interval) query.set("interval", filter.interval);
    if (filter?.currencyCode) query.set("currencyCode", filter.currencyCode);
    if (filter?.resourceId) query.set("resourceId", filter.resourceId);
    if (filter?.facilityResourceProfileId) query.set("facilityResourceProfileId", filter.facilityResourceProfileId);
    const qs = query.toString();
    return this.api.get(`${MONEY_ENDPOINTS.ANALYTICS_TREND}${qs ? `?${qs}` : ""}`);
  }

  getByResource(filter?: MoneyAnalyticsFilter): Promise<MoneyResourcePerformance[]> {
    const query = new URLSearchParams();
    if (filter?.dateFromUtc) query.set("dateFromUtc", filter.dateFromUtc);
    if (filter?.dateToUtc) query.set("dateToUtc", filter.dateToUtc);
    if (filter?.currencyCode) query.set("currencyCode", filter.currencyCode);
    if (filter?.facilityResourceProfileId) query.set("facilityResourceProfileId", filter.facilityResourceProfileId);
    const qs = query.toString();
    return this.api.get<{ items: MoneyResourcePerformance[] }>(`${MONEY_ENDPOINTS.ANALYTICS_BY_RESOURCE}${qs ? `?${qs}` : ""}`)
      .then(res => res.items || []);
  }

  getByTimeOfDay(filter?: MoneyAnalyticsFilter): Promise<MoneyTimeOfDayBucket[]> {
    const query = new URLSearchParams();
    if (filter?.dateFromUtc) query.set("dateFromUtc", filter.dateFromUtc);
    if (filter?.dateToUtc) query.set("dateToUtc", filter.dateToUtc);
    if (filter?.currencyCode) query.set("currencyCode", filter.currencyCode);
    if (filter?.resourceId) query.set("resourceId", filter.resourceId);
    if (filter?.facilityResourceProfileId) query.set("facilityResourceProfileId", filter.facilityResourceProfileId);
    const qs = query.toString();
    return this.api.get<{ items: MoneyTimeOfDayBucket[] }>(`${MONEY_ENDPOINTS.ANALYTICS_BY_TIME}${qs ? `?${qs}` : ""}`)
      .then(res => res.items || []);
  }

  getPaymentMethods(filter?: MoneyAnalyticsFilter): Promise<MoneyPaymentMethodItem[]> {
    const query = new URLSearchParams();
    if (filter?.dateFromUtc) query.set("dateFromUtc", filter.dateFromUtc);
    if (filter?.dateToUtc) query.set("dateToUtc", filter.dateToUtc);
    if (filter?.currencyCode) query.set("currencyCode", filter.currencyCode);
    if (filter?.resourceId) query.set("resourceId", filter.resourceId);
    if (filter?.facilityResourceProfileId) query.set("facilityResourceProfileId", filter.facilityResourceProfileId);
    const qs = query.toString();
    return this.api.get<{ items: MoneyPaymentMethodItem[] }>(`${MONEY_ENDPOINTS.ANALYTICS_PAYMENT_METHODS}${qs ? `?${qs}` : ""}`)
      .then(res => res.items || []);
  }
}

