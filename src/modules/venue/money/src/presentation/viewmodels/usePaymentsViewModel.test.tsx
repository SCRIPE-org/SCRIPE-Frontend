import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { getVenueContainer } from "@modules/venue/di";
import type { MoneyPayment } from "../../domain/entities/Money";
import { usePaymentsViewModel } from "./usePaymentsViewModel";

vi.mock("@modules/venue/di", () => ({ getVenueContainer: vi.fn() }));

const invoice = {
  id: "invoice-1",
  invoiceNumber: "INV-1",
  status: "Issued",
  payerPartyId: "payer-1",
  reservationId: "reservation-1",
  schedulableResourceId: "resource-1",
  currencyCode: "EGP",
  totalAmount: 100,
  adjustmentAmount: 0,
  effectiveTotalAmount: 100,
  paidAmount: 0,
  outstandingAmount: 100,
  creditAmount: 0,
  issuedAtUtc: "2026-09-19T08:00:00Z",
  dueAtUtc: null,
};
const payment: MoneyPayment = {
  id: "payment-1",
  paymentNumber: "PAY-1",
  status: "Recorded",
  method: "Cash",
  currencyCode: "EGP",
  amount: 100,
  allocatedAmount: 100,
  unallocatedAmount: 0,
  payerPartyId: "payer-1",
  reservationId: "reservation-1",
  schedulableResourceId: "resource-1",
  facilityResourceProfileId: null,
  recordedAtUtc: "2026-09-19T08:00:00Z",
  externalReference: null,
  reason: "desk",
};

function container(overrides: Record<string, unknown> = {}) {
  return {
    moneyRepository: {
      getInvoices: vi.fn().mockResolvedValue({ items: [invoice], totalCount: 1 }),
      getPayments: vi.fn().mockResolvedValue({ items: [payment], totalCount: 1 }),
      recordPayment: vi.fn().mockResolvedValue({ id: "payment-1", paymentNumber: "PAY-1" }),
      allocatePayment: vi.fn().mockResolvedValue(undefined),
      issueReceipt: vi.fn().mockResolvedValue(undefined),
      refundPayment: vi.fn().mockResolvedValue(undefined),
      getPaymentTimeline: vi
        .fn()
        .mockResolvedValue({ payment, allocations: [], receipts: [], refunds: [] }),
    },
    ...overrides,
  };
}

describe("usePaymentsViewModel", () => {
  beforeEach(() => vi.clearAllMocks());

  it("loads Finance truth and preselects the receivable passed by the operator journey", async () => {
    const value = container();
    vi.mocked(getVenueContainer).mockReturnValue(value as never);
    const { result } = renderHook(() =>
      usePaymentsViewModel({
        canView: true,
        canRecord: true,
        canIssueReceipt: true,
        canRefund: true,
        initialInvoiceId: "invoice-1",
        messages: {
          fallbackError: "unavailable",
          validation: "invalid",
          allocationPending: (number) => `allocate ${number}`,
          receiptPending: (number) => `receipt ${number}`,
        },
      })
    );

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.selectedInvoiceId).toBe("invoice-1");
    expect(result.current.amount).toBe("100");
    expect(value.moneyRepository.getInvoices).toHaveBeenCalledOnce();
  });

  it("records, allocates, and receipts exactly one manual external payment", async () => {
    const value = container();
    vi.mocked(getVenueContainer).mockReturnValue(value as never);
    const { result } = renderHook(() =>
      usePaymentsViewModel({
        canView: true,
        canRecord: true,
        canIssueReceipt: true,
        canRefund: true,
        initialInvoiceId: "invoice-1",
        messages: {
          fallbackError: "unavailable",
          validation: "invalid",
          allocationPending: (number) => `allocate ${number}`,
          receiptPending: (number) => `receipt ${number}`,
        },
      })
    );
    await waitFor(() => expect(result.current.selectedInvoiceId).toBe("invoice-1"));

    act(() => result.current.setReason("desk payment"));
    await act(async () => {
      await result.current.submit();
    });

    expect(value.moneyRepository.recordPayment).toHaveBeenCalledWith(
      expect.objectContaining({
        payerPartyId: "payer-1",
        reservationId: "reservation-1",
        amount: 100,
        reason: "desk payment",
      })
    );
    expect(value.moneyRepository.allocatePayment).toHaveBeenCalledWith(
      "payment-1",
      "invoice-1",
      100,
      expect.any(String)
    );
    expect(value.moneyRepository.issueReceipt).toHaveBeenCalledWith(
      "payment-1",
      expect.any(String)
    );
  });

  it("reuses the payment key when the first response is lost", async () => {
    const value = container();
    value.moneyRepository.recordPayment
      .mockRejectedValueOnce(new Error("response lost after commit"))
      .mockResolvedValueOnce({ id: "payment-1", paymentNumber: "PAY-1" });
    vi.mocked(getVenueContainer).mockReturnValue(value as never);
    const { result } = renderHook(() =>
      usePaymentsViewModel({
        canView: true,
        canRecord: true,
        canIssueReceipt: true,
        canRefund: true,
        initialInvoiceId: "invoice-1",
        messages: {
          fallbackError: "unavailable",
          validation: "invalid",
          allocationPending: (number) => `allocate ${number}`,
          receiptPending: (number) => `receipt ${number}`,
        },
      })
    );
    await waitFor(() => expect(result.current.selectedInvoiceId).toBe("invoice-1"));
    act(() => result.current.setReason("desk payment"));

    await act(async () => result.current.submit());
    await act(async () => result.current.submit());

    const keys = value.moneyRepository.recordPayment.mock.calls.map(
      ([request]) => request.idempotencyKey
    );
    expect(keys).toHaveLength(2);
    expect(keys[0]).toBeTruthy();
    expect(keys[1]).toBe(keys[0]);
    expect(value.moneyRepository.allocatePayment).toHaveBeenCalledOnce();
    expect(result.current.notice).toBe("saved");
  });

  it("reuses payment and allocation keys when allocation needs retry", async () => {
    const value = container();
    value.moneyRepository.allocatePayment
      .mockRejectedValueOnce(new Error("response lost after allocation"))
      .mockResolvedValueOnce(undefined);
    vi.mocked(getVenueContainer).mockReturnValue(value as never);
    const { result } = renderHook(() =>
      usePaymentsViewModel({
        canView: true,
        canRecord: true,
        canIssueReceipt: true,
        canRefund: true,
        initialInvoiceId: "invoice-1",
        messages: {
          fallbackError: "unavailable",
          validation: "invalid",
          allocationPending: (number) => `allocate ${number}`,
          receiptPending: (number) => `receipt ${number}`,
        },
      })
    );
    await waitFor(() => expect(result.current.selectedInvoiceId).toBe("invoice-1"));
    act(() => result.current.setReason("desk payment"));

    await act(async () => result.current.submit());
    expect(result.current.error).toBe("allocate PAY-1");
    await act(async () => result.current.submit());

    const paymentKeys = value.moneyRepository.recordPayment.mock.calls.map(
      ([request]) => request.idempotencyKey
    );
    const allocationKeys = value.moneyRepository.allocatePayment.mock.calls.map(([, , , key]) => key);
    expect(paymentKeys[1]).toBe(paymentKeys[0]);
    expect(allocationKeys).toHaveLength(2);
    expect(allocationKeys[1]).toBe(allocationKeys[0]);
    expect(value.moneyRepository.issueReceipt).toHaveBeenCalledOnce();
    expect(result.current.notice).toBe("saved");
  });

  it("keeps payment, allocation, and receipt keys stable while receipt issuance retries", async () => {
    const value = container();
    value.moneyRepository.issueReceipt
      .mockRejectedValueOnce(new Error("receipt response lost"))
      .mockResolvedValueOnce(undefined);
    vi.mocked(getVenueContainer).mockReturnValue(value as never);
    const { result } = renderHook(() =>
      usePaymentsViewModel({
        canView: true,
        canRecord: true,
        canIssueReceipt: true,
        canRefund: true,
        initialInvoiceId: "invoice-1",
        messages: {
          fallbackError: "unavailable",
          validation: "invalid",
          allocationPending: (number) => `allocate ${number}`,
          receiptPending: (number) => `receipt ${number}`,
        },
      })
    );
    await waitFor(() => expect(result.current.selectedInvoiceId).toBe("invoice-1"));
    act(() => result.current.setReason("desk payment"));

    await act(async () => result.current.submit());
    expect(result.current.error).toBe("receipt PAY-1");
    await act(async () => result.current.submit());

    const paymentKeys = value.moneyRepository.recordPayment.mock.calls.map(
      ([request]) => request.idempotencyKey
    );
    const allocationKeys = value.moneyRepository.allocatePayment.mock.calls.map(([, , , key]) => key);
    const receiptKeys = value.moneyRepository.issueReceipt.mock.calls.map(([, key]) => key);
    expect(paymentKeys[1]).toBe(paymentKeys[0]);
    expect(allocationKeys[1]).toBe(allocationKeys[0]);
    expect(receiptKeys).toHaveLength(2);
    expect(receiptKeys[1]).toBe(receiptKeys[0]);
    expect(result.current.notice).toBe("saved");
  });

  it("does not re-record a payment when allocation needs operational recovery", async () => {
    const value = container();
    value.moneyRepository.allocatePayment.mockRejectedValue(new Error("allocation conflict"));
    vi.mocked(getVenueContainer).mockReturnValue(value as never);
    const { result } = renderHook(() =>
      usePaymentsViewModel({
        canView: true,
        canRecord: true,
        canIssueReceipt: true,
        canRefund: true,
        initialInvoiceId: "invoice-1",
        messages: {
          fallbackError: "unavailable",
          validation: "invalid",
          allocationPending: (number) => `allocate ${number}`,
          receiptPending: (number) => `receipt ${number}`,
        },
      })
    );
    await waitFor(() => expect(result.current.selectedInvoiceId).toBe("invoice-1"));
    act(() => result.current.setReason("desk payment"));

    await act(async () => {
      await result.current.submit();
    });

    expect(value.moneyRepository.recordPayment).toHaveBeenCalledOnce();
    expect(result.current.error).toBe("allocate PAY-1");
  });

  it("records an explicit Finance refund against an operator-selected invoice", async () => {
    const value = container();
    vi.mocked(getVenueContainer).mockReturnValue(value as never);
    const { result } = renderHook(() =>
      usePaymentsViewModel({
        canView: true,
        canRecord: true,
        canIssueReceipt: true,
        canRefund: true,
        initialInvoiceId: null,
        messages: {
          fallbackError: "unavailable",
          validation: "invalid",
          allocationPending: (number) => `allocate ${number}`,
          receiptPending: (number) => `receipt ${number}`,
        },
      })
    );
    await waitFor(() => expect(result.current.payments?.length).toBe(1));

    act(() => result.current.beginRefund(payment));
    act(() => {
      result.current.setRefundAmount("25");
      result.current.setRefundReason("duplicate desk entry");
    });
    await act(async () => {
      await result.current.submitRefund();
    });

    expect(value.moneyRepository.refundPayment).toHaveBeenCalledWith(
      "payment-1",
      expect.objectContaining({
        invoiceId: "invoice-1",
        amount: 25,
        reason: "duplicate desk entry",
      })
    );
  });

  it("reuses a refund key when its response is lost", async () => {
    const value = container();
    value.moneyRepository.refundPayment
      .mockRejectedValueOnce(new Error("response lost after commit"))
      .mockResolvedValueOnce(undefined);
    vi.mocked(getVenueContainer).mockReturnValue(value as never);
    const { result } = renderHook(() =>
      usePaymentsViewModel({
        canView: true,
        canRecord: true,
        canIssueReceipt: true,
        canRefund: true,
        initialInvoiceId: null,
        messages: {
          fallbackError: "unavailable",
          validation: "invalid",
          allocationPending: (number) => `allocate ${number}`,
          receiptPending: (number) => `receipt ${number}`,
        },
      })
    );
    await waitFor(() => expect(result.current.payments?.length).toBe(1));
    act(() => result.current.beginRefund(payment));
    act(() => {
      result.current.setRefundAmount("25");
      result.current.setRefundReason("duplicate desk entry");
    });

    await act(async () => result.current.submitRefund());
    await act(async () => result.current.submitRefund());

    const keys = value.moneyRepository.refundPayment.mock.calls.map(
      ([, request]) => request.idempotencyKey
    );
    expect(keys).toHaveLength(2);
    expect(keys[1]).toBe(keys[0]);
    expect(result.current.notice).toBe("refunded");
  });

  it("loads append-only Finance payment history without deriving it in the operator view", async () => {
    const value = container();
    vi.mocked(getVenueContainer).mockReturnValue(value as never);
    const { result } = renderHook(() =>
      usePaymentsViewModel({
        canView: true,
        canRecord: true,
        canIssueReceipt: true,
        canRefund: true,
        initialInvoiceId: null,
        messages: {
          fallbackError: "unavailable",
          validation: "invalid",
          allocationPending: (number) => `allocate ${number}`,
          receiptPending: (number) => `receipt ${number}`,
        },
      })
    );
    await waitFor(() => expect(result.current.payments?.length).toBe(1));

    await act(async () => {
      await result.current.openTimeline("payment-1");
    });

    expect(value.moneyRepository.getPaymentTimeline).toHaveBeenCalledWith("payment-1");
    expect(result.current.timeline?.payment.id).toBe("payment-1");
  });

  it("recovers an unallocated payment by allocating to an outstanding invoice without duplicate payment creation", async () => {
    const unallocatedPayment = {
      ...payment,
      id: "payment-unallocated",
      paymentNumber: "PAY-2",
      allocatedAmount: 0,
      unallocatedAmount: 100,
    };
    const value = container({
      moneyRepository: {
        getInvoices: vi.fn().mockResolvedValue({ items: [invoice], totalCount: 1 }),
        getPayments: vi.fn().mockResolvedValue({ items: [unallocatedPayment], totalCount: 1 }),
        recordPayment: vi.fn(),
        allocatePayment: vi
          .fn()
          .mockRejectedValueOnce(new Error("response lost after allocation"))
          .mockResolvedValueOnce(undefined),
        issueReceipt: vi.fn().mockResolvedValue(undefined),
        refundPayment: vi.fn().mockResolvedValue(undefined),
        getPaymentTimeline: vi.fn().mockResolvedValue({
          payment: unallocatedPayment,
          allocations: [],
          receipts: [],
          refunds: [],
        }),
      },
    });
    vi.mocked(getVenueContainer).mockReturnValue(value as never);
    const { result } = renderHook(() =>
      usePaymentsViewModel({
        canView: true,
        canRecord: true,
        canIssueReceipt: true,
        canRefund: true,
        initialInvoiceId: null,
        messages: {
          fallbackError: "unavailable",
          validation: "invalid",
          allocationPending: (number) => `allocate ${number}`,
          receiptPending: (number) => `receipt ${number}`,
        },
      })
    );
    await waitFor(() => expect(result.current.payments?.length).toBe(1));

    act(() => result.current.beginAllocate(unallocatedPayment));
    expect(result.current.allocatingPayment?.id).toBe("payment-unallocated");
    expect(result.current.allocationInvoiceId).toBe("invoice-1");
    expect(result.current.allocationAmount).toBe("100");

    await act(async () => result.current.submitAllocation());
    expect(result.current.error).toBe("response lost after allocation");
    await act(async () => result.current.submitAllocation());

    // Verifies NO duplicate payment was created, and allocation was invoked directly
    expect(value.moneyRepository.recordPayment).not.toHaveBeenCalled();
    const allocationCalls = value.moneyRepository.allocatePayment.mock.calls;
    expect(allocationCalls).toHaveLength(2);
    expect(allocationCalls[0]).toEqual([
      "payment-unallocated",
      "invoice-1",
      100,
      expect.any(String),
    ]);
    expect(allocationCalls[1][3]).toBe(allocationCalls[0][3]);
    expect(result.current.notice).toBe("allocated");
  });
});
