"use client";

import { useCallback, useEffect, useState } from "react";
import { getVenueContainer } from "@modules/venue/di";

export interface BookingFinancePaymentItem {
  id: string;
  paymentNumber: string;
  amount: number;
  allocatedAmount: number;
  unallocatedAmount: number;
  method: string;
  status: string;
  recordedAtUtc: string;
  externalReference?: string | null;
}

export type BookingAllocationState = "Synchronized" | "PendingAllocation" | "PendingSynchronization";

export interface BookingFinanceSummary {
  invoiceId: string;
  invoiceNumber: string;
  currencyCode: string;
  effectiveTotalAmount: number;
  paidAmount: number;
  outstandingAmount: number;
  creditAmount: number;
  status: string;
  unallocatedPaymentAmount: number;
  refundedAmount: number;
  allocationState: BookingAllocationState;
  payments: BookingFinancePaymentItem[];
}

export function useBookingFinanceSummary(reservationId: string, canViewReceivables: boolean) {
  const { moneyRepository } = getVenueContainer();
  const [summary, setSummary] = useState<BookingFinanceSummary | null>(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(canViewReceivables && Boolean(reservationId));

  const load = useCallback(async () => {
    if (!canViewReceivables || !reservationId) {
      setLoading(false);
      setSummary(null);
      return;
    }
    setLoading(true);
    setError(false);
    try {
      const fetchInvoices = async () => {
        let page = await moneyRepository.getInvoices(1, 50, { reservationId });
        if ((!page?.items || page.items.length === 0) && typeof window !== "undefined") {
          await new Promise((resolve) => setTimeout(resolve, 300));
          page = await moneyRepository.getInvoices(1, 50, { reservationId });
        }
        if ((!page?.items || page.items.length === 0) && typeof window !== "undefined") {
          await new Promise((resolve) => setTimeout(resolve, 600));
          page = await moneyRepository.getInvoices(1, 50, { reservationId });
        }
        return page;
      };

      const fetchPayments = async () => {
        if (typeof moneyRepository.getPayments === "function") {
          try {
            return await moneyRepository.getPayments(1, 50, { reservationId });
          } catch {
            return { items: [], totalCount: 0 };
          }
        }
        return { items: [], totalCount: 0 };
      };

      const [invoicesPage, paymentsPage] = await Promise.all([
        fetchInvoices(),
        fetchPayments(),
      ]);

      const invoice = invoicesPage.items[0];
      const rawPayments = paymentsPage.items || [];
      const payments: BookingFinancePaymentItem[] = rawPayments.map((p) => {
        const amount = Number(p.amount) || 0;
        const allocatedAmount = typeof p.allocatedAmount === "number" ? p.allocatedAmount : 0;
        const unallocatedAmount = typeof p.unallocatedAmount === "number"
          ? p.unallocatedAmount
          : Math.max(0, amount - allocatedAmount);
        return {
          id: p.id,
          paymentNumber: p.paymentNumber,
          amount,
          allocatedAmount,
          unallocatedAmount,
          method: p.method,
          status: p.status,
          recordedAtUtc: p.recordedAtUtc,
          externalReference: p.externalReference ?? null,
        };
      });

      const activePayments = payments.filter((p) => p.status !== "Refunded" && p.status !== "Reversed");
      const unallocatedPaymentAmount = activePayments.reduce((sum, p) => sum + p.unallocatedAmount, 0);
      const refundedAmount = payments
        .filter((p) => p.status === "Refunded")
        .reduce((sum, p) => sum + p.amount, 0);

      if (invoice) {
        // Authoritative invoice truth:
        // paidAmount is strictly the authoritative paid amount on the invoice.
        // It must NOT artificially include unallocated recorded payments.
        const paidAmount = typeof invoice.paidAmount === "number"
          ? invoice.paidAmount
          : Math.max(0, invoice.effectiveTotalAmount - invoice.outstandingAmount);
        const outstandingAmount = typeof invoice.outstandingAmount === "number"
          ? invoice.outstandingAmount
          : Math.max(0, invoice.effectiveTotalAmount - paidAmount);
        const status = invoice.status;

        const allocationState: BookingAllocationState =
          unallocatedPaymentAmount > 0 && outstandingAmount > 0
            ? "PendingAllocation"
            : "Synchronized";

        setSummary({
          invoiceId: invoice.id,
          invoiceNumber: invoice.invoiceNumber,
          currencyCode: invoice.currencyCode || "EGP",
          effectiveTotalAmount: invoice.effectiveTotalAmount,
          paidAmount,
          outstandingAmount,
          creditAmount: invoice.creditAmount ?? 0,
          status,
          unallocatedPaymentAmount,
          refundedAmount,
          allocationState,
          payments,
        });
      } else if (payments.length > 0) {
        setSummary({
          invoiceId: "",
          invoiceNumber: "PENDING_SYNC",
          currencyCode: "EGP",
          effectiveTotalAmount: 0,
          paidAmount: 0,
          outstandingAmount: 0,
          creditAmount: 0,
          status: "PendingSync",
          unallocatedPaymentAmount,
          refundedAmount,
          allocationState: "PendingSynchronization",
          payments,
        });
      } else {
        setSummary(null);
      }
    } catch {
      setError(true);
      setSummary(null);
    } finally {
      setLoading(false);
    }
  }, [canViewReceivables, moneyRepository, reservationId]);

  useEffect(() => { void load(); }, [load]);
  return { summary, error, loading, refresh: load };
}
