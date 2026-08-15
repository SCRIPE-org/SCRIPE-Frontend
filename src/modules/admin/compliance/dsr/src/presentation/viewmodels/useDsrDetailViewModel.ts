"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { complianceContainer } from "@modules/compliance/di";
import { useI18n } from "@core/providers/i18n-provider";
import { useAppStore } from "@/core/store/useAppStore";
import { toast } from "@core/hooks/use-enhanced-toast";
import type { DataSubjectRequest } from "../../domain/entities/DataSubjectRequest";

/**
 * React hook/ViewModel orchestrating state and data flows for dsr detail view model.
 * Coordinates query synchronization (TanStack Query) with application client store indicators (Zustand) and returns validation fields.
 */
export function useDsrDetailViewModel(id: string) {
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const { tenantCode } = useAppStore();
  const { dsrRepository } = complianceContainer;

  const [isConfirmingErasure, setIsConfirmingErasure] = useState(false);
  const [erasureInput, setErasureInput] = useState("");

  const query = useQuery({
    queryKey: ["compliance", "dsr", id],
    queryFn: () => dsrRepository.getById(id),
    refetchInterval: (q) => {
      const r = q.state.data as DataSubjectRequest | undefined;
      return r && (r.status === "Processing" || r.status === "InReview") ? 5_000 : false;
    },
  });

  const confirmErasureMutation = useMutation({
    mutationFn: () => dsrRepository.confirmErasure(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["compliance", "dsr", id] });
      setIsConfirmingErasure(false);
      setErasureInput("");
      toast({ title: t("compliance.erasureConfirmed"), variant: "default" });
    },
    onError: () => toast({ title: t("common.error"), variant: "destructive" }),
  });

  const downloadMutation = useMutation({
    mutationFn: () => dsrRepository.downloadExport(id),
    onSuccess: (blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `dsr-export-${id}.zip`;
      a.click();
      URL.revokeObjectURL(url);
      toast({ title: t("common.success"), variant: "default" });
    },
    onError: () => toast({ title: t("common.error"), variant: "destructive" }),
  });

  return {
    dsr: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
    isConfirmingErasure,
    setIsConfirmingErasure,
    erasureInput,
    setErasureInput,
    tenantCode,
    isConfirmingPending: confirmErasureMutation.isPending,
    isDownloadingPending: downloadMutation.isPending,
    confirmErasure: () => confirmErasureMutation.mutate(),
    downloadExport: () => downloadMutation.mutate(),
  };
}
