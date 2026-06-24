// FILE-EXCEPTION: file length
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useCallback } from "react";
import { entitlementsContainer } from "@modules/entitlements/di";
import type { ContentMode, TrustMark, CustomerLogo } from "../../domain/entities/SignupContent";
import type {
  UpdateWelcomeParams,
  CreateTrustMarkParams,
  UpdateTrustMarkParams,
  CreateCustomerLogoParams,
  UpdateCustomerLogoParams,
} from "../../domain/interfaces/ISignupContentRepository";
import { useI18n } from "@core/providers/i18n-provider";
import { useEnhancedToast } from "@core/hooks/use-enhanced-toast";

const QUERY_KEY = ["entitlements", "signup-content"] as const;

export function useSignupContentViewModel() {
  const { signupContentRepository } = entitlementsContainer;
  const queryClient = useQueryClient();
  const { t } = useI18n();
  const { toast } = useEnhancedToast();

  // ── Dialog / form state ──────────────────────────────────────────────────────
  const [trustMarkDialogOpen, setTrustMarkDialogOpen] = useState(false);
  const [editingTrustMark, setEditingTrustMark] = useState<TrustMark | null>(null);
  const [logoDialogOpen, setLogoDialogOpen] = useState(false);
  const [editingLogo, setEditingLogo] = useState<CustomerLogo | null>(null);

  // ── Query ────────────────────────────────────────────────────────────────────
  const contentQuery = useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => signupContentRepository.getAdminContent(),
    staleTime: 60 * 1000,
  });

  const invalidate = useCallback(
    () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
    [queryClient]
  );

  // ── Set Mode ─────────────────────────────────────────────────────────────────
  const setModeMutation = useMutation({
    mutationFn: (mode: ContentMode) => signupContentRepository.setMode(mode),
    onSuccess: () => {
      invalidate();
      toast({ title: t("signupContent.mode.saved"), variant: "success" });
    },
    onError: () => {
      toast({ title: t("signupContent.error.save"), variant: "destructive" });
    },
  });

  // ── Update Welcome ────────────────────────────────────────────────────────────
  const updateWelcomeMutation = useMutation({
    mutationFn: (data: UpdateWelcomeParams) => signupContentRepository.updateWelcome(data),
    onSuccess: () => {
      invalidate();
      toast({ title: t("signupContent.welcome.saved"), variant: "success" });
    },
    onError: () => {
      toast({ title: t("signupContent.error.save"), variant: "destructive" });
    },
  });

  // ── Trust Marks ───────────────────────────────────────────────────────────────
  const createTrustMarkMutation = useMutation({
    mutationFn: (data: CreateTrustMarkParams) => signupContentRepository.createTrustMark(data),
    onSuccess: () => {
      invalidate();
      setTrustMarkDialogOpen(false);
      setEditingTrustMark(null);
      toast({ title: t("signupContent.trustMarks.save"), variant: "success" });
    },
    onError: () => {
      toast({ title: t("signupContent.error.save"), variant: "destructive" });
    },
  });

  const updateTrustMarkMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTrustMarkParams }) =>
      signupContentRepository.updateTrustMark(id, data),
    onSuccess: () => {
      invalidate();
      setTrustMarkDialogOpen(false);
      setEditingTrustMark(null);
      toast({ title: t("signupContent.trustMarks.save"), variant: "success" });
    },
    onError: () => {
      toast({ title: t("signupContent.error.save"), variant: "destructive" });
    },
  });

  const deleteTrustMarkMutation = useMutation({
    mutationFn: (id: string) => signupContentRepository.deleteTrustMark(id),
    onSuccess: () => {
      invalidate();
      toast({ title: t("signupContent.trustMarks.delete"), variant: "success" });
    },
    onError: () => {
      toast({ title: t("signupContent.error.save"), variant: "destructive" });
    },
  });

  const reorderTrustMarksMutation = useMutation({
    mutationFn: (orderedIds: string[]) => signupContentRepository.reorderTrustMarks(orderedIds),
    onSuccess: () => {
      invalidate();
    },
    onError: () => {
      toast({ title: t("signupContent.error.save"), variant: "destructive" });
    },
  });

  // ── Customer Logos ────────────────────────────────────────────────────────────
  const createCustomerLogoMutation = useMutation({
    mutationFn: (data: CreateCustomerLogoParams) =>
      signupContentRepository.createCustomerLogo(data),
    onSuccess: () => {
      invalidate();
      setLogoDialogOpen(false);
      setEditingLogo(null);
      toast({ title: t("signupContent.customerLogos.save"), variant: "success" });
    },
    onError: () => {
      toast({ title: t("signupContent.error.save"), variant: "destructive" });
    },
  });

  const updateCustomerLogoMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCustomerLogoParams }) =>
      signupContentRepository.updateCustomerLogo(id, data),
    onSuccess: () => {
      invalidate();
      setLogoDialogOpen(false);
      setEditingLogo(null);
      toast({ title: t("signupContent.customerLogos.save"), variant: "success" });
    },
    onError: () => {
      toast({ title: t("signupContent.error.save"), variant: "destructive" });
    },
  });

  const deleteCustomerLogoMutation = useMutation({
    mutationFn: (id: string) => signupContentRepository.deleteCustomerLogo(id),
    onSuccess: () => {
      invalidate();
      toast({ title: t("signupContent.customerLogos.delete"), variant: "success" });
    },
    onError: () => {
      toast({ title: t("signupContent.error.save"), variant: "destructive" });
    },
  });

  const reorderCustomerLogosMutation = useMutation({
    mutationFn: (orderedIds: string[]) => signupContentRepository.reorderCustomerLogos(orderedIds),
    onSuccess: () => {
      invalidate();
    },
    onError: () => {
      toast({ title: t("signupContent.error.save"), variant: "destructive" });
    },
  });

  // ── Handlers ──────────────────────────────────────────────────────────────────
  const handleSetMode = useCallback(
    (mode: ContentMode) => setModeMutation.mutate(mode),
    [setModeMutation]
  );

  const handleUpdateWelcome = useCallback(
    (data: UpdateWelcomeParams) => updateWelcomeMutation.mutate(data),
    [updateWelcomeMutation]
  );

  const handleOpenAddTrustMark = useCallback(() => {
    setEditingTrustMark(null);
    setTrustMarkDialogOpen(true);
  }, []);

  const handleOpenEditTrustMark = useCallback((tm: TrustMark) => {
    setEditingTrustMark(tm);
    setTrustMarkDialogOpen(true);
  }, []);

  const handleCloseTrustMarkDialog = useCallback(() => {
    setTrustMarkDialogOpen(false);
    setEditingTrustMark(null);
  }, []);

  const handleSaveTrustMark = useCallback(
    (data: CreateTrustMarkParams) => {
      if (editingTrustMark) {
        updateTrustMarkMutation.mutate({ id: editingTrustMark.id, data });
      } else {
        createTrustMarkMutation.mutate(data);
      }
    },
    [editingTrustMark, createTrustMarkMutation, updateTrustMarkMutation]
  );

  const handleDeleteTrustMark = useCallback(
    (id: string) => deleteTrustMarkMutation.mutate(id),
    [deleteTrustMarkMutation]
  );

  const handleMoveTrustMark = useCallback(
    (id: string, direction: "up" | "down") => {
      const marks = contentQuery.data?.trustMarks ?? [];
      const idx = marks.findIndex((m) => m.id === id);
      if (idx < 0) return;
      const newIdx = direction === "up" ? idx - 1 : idx + 1;
      if (newIdx < 0 || newIdx >= marks.length) return;
      const reordered = [...marks];
      [reordered[idx], reordered[newIdx]] = [reordered[newIdx], reordered[idx]];
      reorderTrustMarksMutation.mutate(reordered.map((m) => m.id));
    },
    [contentQuery.data?.trustMarks, reorderTrustMarksMutation]
  );

  const handleOpenAddLogo = useCallback(() => {
    setEditingLogo(null);
    setLogoDialogOpen(true);
  }, []);

  const handleOpenEditLogo = useCallback((logo: CustomerLogo) => {
    setEditingLogo(logo);
    setLogoDialogOpen(true);
  }, []);

  const handleCloseLogoDialog = useCallback(() => {
    setLogoDialogOpen(false);
    setEditingLogo(null);
  }, []);

  const handleSaveLogo = useCallback(
    (data: CreateCustomerLogoParams) => {
      if (editingLogo) {
        updateCustomerLogoMutation.mutate({ id: editingLogo.id, data });
      } else {
        createCustomerLogoMutation.mutate(data);
      }
    },
    [editingLogo, createCustomerLogoMutation, updateCustomerLogoMutation]
  );

  const handleDeleteLogo = useCallback(
    (id: string) => deleteCustomerLogoMutation.mutate(id),
    [deleteCustomerLogoMutation]
  );

  const handleMoveLogo = useCallback(
    (id: string, direction: "up" | "down") => {
      const logos = contentQuery.data?.customerLogos ?? [];
      const idx = logos.findIndex((l) => l.id === id);
      if (idx < 0) return;
      const newIdx = direction === "up" ? idx - 1 : idx + 1;
      if (newIdx < 0 || newIdx >= logos.length) return;
      const reordered = [...logos];
      [reordered[idx], reordered[newIdx]] = [reordered[newIdx], reordered[idx]];
      reorderCustomerLogosMutation.mutate(reordered.map((l) => l.id));
    },
    [contentQuery.data?.customerLogos, reorderCustomerLogosMutation]
  );

  return {
    // Data
    content: contentQuery.data ?? null,
    isLoading: contentQuery.isLoading,
    error: contentQuery.error,

    // Mode
    isSettingMode: setModeMutation.isPending,
    handleSetMode,

    // Welcome
    isUpdatingWelcome: updateWelcomeMutation.isPending,
    handleUpdateWelcome,

    // Trust Marks
    trustMarkDialogOpen,
    editingTrustMark,
    isSavingTrustMark: createTrustMarkMutation.isPending || updateTrustMarkMutation.isPending,
    isDeletingTrustMark: deleteTrustMarkMutation.isPending,
    isReorderingTrustMarks: reorderTrustMarksMutation.isPending,
    handleOpenAddTrustMark,
    handleOpenEditTrustMark,
    handleCloseTrustMarkDialog,
    handleSaveTrustMark,
    handleDeleteTrustMark,
    handleMoveTrustMark,

    // Customer Logos
    logoDialogOpen,
    editingLogo,
    isSavingLogo: createCustomerLogoMutation.isPending || updateCustomerLogoMutation.isPending,
    isDeletingLogo: deleteCustomerLogoMutation.isPending,
    isReorderingLogos: reorderCustomerLogosMutation.isPending,
    handleOpenAddLogo,
    handleOpenEditLogo,
    handleCloseLogoDialog,
    handleSaveLogo,
    handleDeleteLogo,
    handleMoveLogo,
  };
}
