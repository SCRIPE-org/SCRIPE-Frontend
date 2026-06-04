"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { marketplaceContainer } from "../../../../di";

export function useFinancialsViewModel() {
  const queryClient = useQueryClient();
  const { financialsRepository } = marketplaceContainer;
  const [purchasesPage, setPurchasesPage] = useState(1);
  const [payoutsPage, setPayoutsPage] = useState(1);
  const [developerProfileId, setDeveloperProfileId] = useState<string>("");

  const invalidatePayouts = () =>
    queryClient.invalidateQueries({ queryKey: ["marketplace", "payouts"] });

  const purchasesQuery = useQuery({
    queryKey: ["marketplace", "purchases", purchasesPage],
    queryFn: () => financialsRepository.getPurchases({ page: purchasesPage, pageSize: 20 }),
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
    isLoadingPurchases: purchasesQuery.isLoading,
    isLoadingPayouts: payoutsQuery.isLoading,
    setPurchasesPage,
    setPayoutsPage,
    setDeveloperProfileId,
    processPayout: processPayoutMutation.mutate,
    isProcessingPayout: processPayoutMutation.isPending,
  };
}
