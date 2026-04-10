"use client";

import { useCrudViewModel } from "@core/crud/hooks/useCrudViewModel";
import { entitlementsContainer } from "@modules/entitlements/di";
import type { InvoiceListItem } from "../../domain/entities/Invoice";

/**
 * Invoice ViewModel — uses useCrudViewModel for pagination, search, and state.
 * Invoices are read-only (no create/update/delete from the frontend).
 */
export function useInvoiceViewModel() {
  const { billingRepository } = entitlementsContainer;

  const vm = useCrudViewModel<InvoiceListItem, never, never>(
    ["entitlements", "invoices"],
    {
      getAll: async (params) => {
        const res = await billingRepository.getInvoices({
          page: params.page,
          pageSize: params.pageSize,
        });
        return {
          items: res.items ?? [],
          pagination: {
            itemsCount: res.totalCount,
            pageSize: params.pageSize,
            page: params.page,
            pagesCount: Math.max(1, Math.ceil(res.totalCount / params.pageSize)),
          },
        };
      },
      // Read-only — no create, update, delete
    }
  );

  return vm;
}
