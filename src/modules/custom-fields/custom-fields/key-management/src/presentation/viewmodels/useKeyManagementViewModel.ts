"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@core/hooks/use-enhanced-toast";
import { useI18n } from "@core/providers/i18n-provider";
import { getCustomFieldsContainer } from "../../../../di";

/**
 * Documentation for module export
 */
export function useKeyManagementViewModel() {
  const { keyManagementRepository } = getCustomFieldsContainer();
  const { t } = useI18n();
  const queryClient = useQueryClient();

  const [isRotateOpen, setIsRotateOpen] = useState(false);
  const [isRevokeOpen, setIsRevokeOpen] = useState(false);
  const [auditPage, setAuditPage] = useState(1);
  const [pageSize] = useState(15);

  const statusQuery = useQuery({
    queryKey: ["customFields", "encryption", "status"],
    queryFn: () => keyManagementRepository.getStatus(),
  });

  const activeSessionId = statusQuery.data?.activeSessionId;

  const sessionQuery = useQuery({
    queryKey: ["customFields", "encryption", "session", activeSessionId],
    queryFn: () =>
      activeSessionId ? keyManagementRepository.getSessionProgress(activeSessionId) : null,
    enabled: Boolean(activeSessionId),
    initialData: statusQuery.data?.activeSession,
    refetchInterval: (query) => {
      const session = query.state.data;
      if (!session || session.isTerminal) return false;
      return 3000;
    },
  });

  const auditLogsQuery = useQuery({
    queryKey: ["customFields", "encryption", "auditLogs", auditPage, pageSize],
    queryFn: () => keyManagementRepository.getAuditLogs(auditPage, pageSize),
  });

  const initializeMutation = useMutation({
    mutationFn: () => keyManagementRepository.initializeKey({}),
    onSuccess: () => {
      toast.success(t("customFieldsSecurity.activeKey"));
      queryClient.invalidateQueries({ queryKey: ["customFields", "encryption"] });
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  const rotateMutation = useMutation({
    mutationFn: (vars: { reason: string; autoMigrate?: boolean }) =>
      keyManagementRepository.rotateKey(vars),
    onSuccess: () => {
      toast.success(t("customFieldsSecurity.rotateDialogTitle"));
      setIsRotateOpen(false);
      queryClient.invalidateQueries({ queryKey: ["customFields", "encryption"] });
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  const revokeMutation = useMutation({
    mutationFn: (vars: { reason: string; confirmationCode: string }) =>
      keyManagementRepository.revokeKey(vars),
    onSuccess: () => {
      toast.success(t("customFieldsSecurity.statusRevoked"));
      setIsRevokeOpen(false);
      queryClient.invalidateQueries({ queryKey: ["customFields", "encryption"] });
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  const startRewrapMutation = useMutation({
    mutationFn: () => keyManagementRepository.startRewrap({}),
    onSuccess: () => {
      toast.success(t("customFieldsSecurity.migrationInProgress"));
      queryClient.invalidateQueries({ queryKey: ["customFields", "encryption"] });
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  const cancelRewrapMutation = useMutation({
    mutationFn: (sessionId: string) => keyManagementRepository.cancelRewrap(sessionId),
    onSuccess: () => {
      toast.info(t("customFieldsSecurity.cancelMigration"));
      queryClient.invalidateQueries({ queryKey: ["customFields", "encryption"] });
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  return {
    status: statusQuery.data ?? null,
    isLoadingStatus: statusQuery.isLoading,
    activeSession: sessionQuery.data ?? statusQuery.data?.activeSession ?? null,
    isLoadingSession: sessionQuery.isLoading,
    auditLogs: auditLogsQuery.data?.items ?? [],
    auditLogsTotal: auditLogsQuery.data?.totalCount ?? 0,
    isAuditLogsLoading: auditLogsQuery.isLoading,
    auditPage,
    setAuditPage,
    isRotateOpen,
    setIsRotateOpen,
    isRevokeOpen,
    setIsRevokeOpen,
    initializeKey: initializeMutation.mutate,
    isInitializing: initializeMutation.isPending,
    rotateKey: rotateMutation.mutate,
    isRotating: rotateMutation.isPending,
    revokeKey: revokeMutation.mutate,
    isRevoking: revokeMutation.isPending,
    startRewrap: startRewrapMutation.mutate,
    isStartingRewrap: startRewrapMutation.isPending,
    cancelRewrap: cancelRewrapMutation.mutate,
    isCancellingRewrap: cancelRewrapMutation.isPending,
  };
}
