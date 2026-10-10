import { describe, expect, it, vi } from "vitest";
import { MoneyService } from "./MoneyService";

describe("MoneyService", () => {
  it("uses Finance-owned read and explicit manual-payment action routes", async () => {
    const api = { get: vi.fn(), post: vi.fn() } as any;
    const service = new MoneyService(api);
    await service.getInvoices();
    await service.getPayments();
    await service.recordPayment({ payerPartyId: "payer-1", reservationId: "reservation-1", schedulableResourceId: "resource-1", facilityResourceProfileId: null, method: "Cash", currencyCode: "EGP", amount: 100, idempotencyKey: "payment-1", externalReference: null, reason: "desk" });
    await service.allocatePayment("payment-1", "invoice-1", 100, "allocation-1");

    expect(api.get).toHaveBeenCalledWith("/v1/finance/customer-invoices?page=1&pageSize=50");
    expect(api.get).toHaveBeenCalledWith("/v1/finance/recorded-payments?page=1&pageSize=50");
    expect(api.post).toHaveBeenCalledWith("/v1/finance/recorded-payments", expect.objectContaining({ payerPartyId: "payer-1", amount: 100 }));
    expect(api.post).toHaveBeenCalledWith("/v1/finance/recorded-payments/payment-1/allocations", { invoiceId: "invoice-1", amount: 100, idempotencyKey: "allocation-1" });
  });

  it("uses Finance's reservation filter for a booking-level commercial summary", async () => {
    const api = { get: vi.fn(), post: vi.fn() } as any;
    const service = new MoneyService(api);

    await service.getInvoices(1, 50, { reservationId: "reservation-1" });

    expect(api.get).toHaveBeenCalledWith("/v1/finance/customer-invoices?page=1&pageSize=50&reservationId=reservation-1");
  });

  it("uses Finance's explicit refund action and never invents a provider payment operation", async () => {
    const api = { get: vi.fn(), post: vi.fn() } as any;
    const service = new MoneyService(api);

    await service.refundPayment("payment-1", {
      invoiceId: "invoice-1", amount: 25, idempotencyKey: "refund-1", reason: "duplicate desk entry", externalReference: "REF-1",
    });

    expect(api.post).toHaveBeenCalledWith("/v1/finance/recorded-payments/payment-1/refunds", {
      invoiceId: "invoice-1", amount: 25, idempotencyKey: "refund-1", reason: "duplicate desk entry", externalReference: "REF-1",
    });
  });

  it("reads an append-only Finance timeline for payment recovery", async () => {
    const api = { get: vi.fn(), post: vi.fn() } as any;
    await new MoneyService(api).getPaymentTimeline("payment-1");
    expect(api.get).toHaveBeenCalledWith("/v1/finance/recorded-payments/payment-1/timeline");
  });

  it("calls authoritative analytics endpoints with query filters", async () => {
    const api = {
      get: vi.fn().mockImplementation((url: string) => {
        if (url.includes("by-resource")) return Promise.resolve({ items: [] });
        if (url.includes("by-time")) return Promise.resolve({ items: [] });
        if (url.includes("payment-methods")) return Promise.resolve({ items: [] });
        return Promise.resolve({});
      }),
      post: vi.fn(),
    } as any;
    const service = new MoneyService(api);

    await service.getSummary({ currencyCode: "EGP" });
    expect(api.get).toHaveBeenCalledWith("/v1/finance/analytics/summary?currencyCode=EGP");

    await service.getTrend({ interval: "day" });
    expect(api.get).toHaveBeenCalledWith("/v1/finance/analytics/trend?interval=day");

    await service.getByResource({ currencyCode: "EGP" });
    expect(api.get).toHaveBeenCalledWith("/v1/finance/analytics/by-resource?currencyCode=EGP");

    await service.getByTimeOfDay({ currencyCode: "EGP" });
    expect(api.get).toHaveBeenCalledWith("/v1/finance/analytics/by-time?currencyCode=EGP");

    await service.getPaymentMethods({ currencyCode: "EGP" });
    expect(api.get).toHaveBeenCalledWith("/v1/finance/analytics/payment-methods?currencyCode=EGP");
  });
});

