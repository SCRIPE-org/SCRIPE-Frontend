"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { marketplaceContainer } from "@modules/marketplace/di";

/**
 * React hook/ViewModel orchestrating state and data flows for financials view model.
 * Manages TanStack Query hooks, query cache keys, and repository fetch requests.
 */
export function useFinancialsViewModel() {
  const queryClient = useQueryClient();
  const { financialsRepository, developersRepository } = marketplaceContainer;
  const [purchasesPage, setPurchasesPage] = useState(1);
  const [payoutsPage, setPayoutsPage] = useState(1);
  const [developerProfileId, setDeveloperProfileId] = useState<string>("");

  const invalidatePayouts = () =>
    queryClient.invalidateQueries({ queryKey: ["marketplace", "payouts"] });

  const purchasesQuery = useQuery({
    queryKey: ["marketplace", "purchases", purchasesPage],
    queryFn: () => financialsRepository.getPurchases({ page: purchasesPage, pageSize: 20 }),
  });

  // Payouts are scoped to a single developer profile (backend requires it —
  // GetDeveloperPayoutsQuery has no "all developers" mode). The developers
  // list below feeds the developer-picker so admins can select which
  // developer's payouts to view; without a selection the query stays disabled.
  const developersQuery = useQuery({
    queryKey: ["marketplace", "payouts-developer-options"],
    queryFn: () => developersRepository.getAll({ page: 1, pageSize: 100 }),
  });

  const payoutsQuery = useQuery({
    queryKey: ["marketplace", "payouts", developerProfileId, payoutsPage],
    queryFn: () =>
      financialsRepository.getPayouts({ developerProfileId, page: payoutsPage, pageSize: 20 }),
    enabled: !!developerProfileId,
  });

  const processPayoutMutation = useMutation({
    mutationFn: ({ id, externalReference }: { id: string; externalReference?: string }) =>
      financialsRepository.processPayout(id, externalReference),
    onSuccess: invalidatePayouts,
  });

  return {
    purchases: purchasesQuery.data?.items ?? [],
    purchasesPagination: {
      page: purchasesPage,
      totalPages: purchasesQuery.data?.totalPages ?? 1,
      totalCount: purchasesQuery.data?.totalCount ?? 0,
    },
    payouts: payoutsQuery.data?.items ?? [],
    payoutsPagination: {
      page: payoutsPage,
      totalPages: payoutsQuery.data?.totalPages ?? 1,
      totalCount: payoutsQuery.data?.totalCount ?? 0,
    },
    developerOptions: developersQuery.data?.items ?? [],
    isLoadingDeveloperOptions: developersQuery.isLoading,
    developerProfileId,
    isLoadingPurchases: purchasesQuery.isLoading,
    isLoadingPayouts: payoutsQuery.isLoading,
    setPurchasesPage,
    setPayoutsPage,
    setDeveloperProfileId,
    processPayout: processPayoutMutation.mutate,
    isProcessingPayout: processPayoutMutation.isPending,
  };
}
