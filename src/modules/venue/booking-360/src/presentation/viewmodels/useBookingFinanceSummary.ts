"use client";

import { useCallback, useEffect, useState } from "react";
import { getVenueContainer } from "@modules/venue/di";

/**
 * Documentation for module export
 */
export interface BookingFinanceSummary {
  invoiceId: string;
  invoiceNumber: string;
  currencyCode: string;
  effectiveTotalAmount: number;
  outstandingAmount: number;
  status: string;
}

/**
 * Documentation for module export
 */
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
      const page = await moneyRepository.getInvoices(1, 50, { reservationId });
      const invoice = page.items[0];
      setSummary(
        invoice
          ? {
              invoiceId: invoice.id,
              invoiceNumber: invoice.invoiceNumber,
              currencyCode: invoice.currencyCode,
              effectiveTotalAmount: invoice.effectiveTotalAmount,
              outstandingAmount: invoice.outstandingAmount,
              status: invoice.status,
            }
          : null
      );
    } catch {
      setError(true);
      setSummary(null);
    } finally {
      setLoading(false);
    }
  }, [canViewReceivables, moneyRepository, reservationId]);

  useEffect(() => {
    void Promise.resolve().then(() => {
      void load();
    });
  }, [load]);
  return { summary, error, loading, refresh: load };
}
