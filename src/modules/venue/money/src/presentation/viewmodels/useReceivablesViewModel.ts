"use client";

import { useCallback, useEffect, useState } from "react";
import { getVenueContainer } from "@modules/venue/di";
import type { MoneyInvoice } from "../../domain/entities/Money";

export function useReceivablesViewModel(canView: boolean, fallbackError: string) {
  const { moneyRepository } = getVenueContainer();
  const [items, setItems] = useState<MoneyInvoice[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      setItems((await moneyRepository.getInvoices()).items);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : fallbackError);
    }
  }, [fallbackError, moneyRepository]);

  useEffect(() => {
    if (canView) void load();
  }, [canView, load]);

  return { items, error, loading: items === null && error === null, load };
}
