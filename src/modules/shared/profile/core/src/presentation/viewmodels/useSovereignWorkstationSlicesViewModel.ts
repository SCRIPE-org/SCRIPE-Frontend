/**
 * useSovereignWorkstationSlicesViewModel
 *
 * ViewModel hooks for workstation preferences, alert routing notifications,
 * edition entitlements/quotas, and SSO/PAT integrations.
 */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { container } from "@modules/profile/di";
import { useAppStore } from "@core/store/useAppStore";
import type {
  SovereignNotificationsSlice,
  SovereignPreferencesSlice,
} from "../../domain/entities/SovereignAccountEntities";
import { invalidateOnConcurrencyConflict } from "../utils/concurrency";
import { sovereignAccountKeys } from "../utils/sovereignAccountKeys";

/** Queries and updates workstation visual and ergonomics preferences. */
export function useSovereignPreferencesSlice() {
  const qc = useQueryClient();
  const requireMfaEnrollment = useAppStore((s) => s.requireMfaEnrollment);
  const query = useQuery({
    queryKey: sovereignAccountKeys.preferences(),
    queryFn: () => container.sovereignAccountRepository.getPreferences(),
    enabled: !requireMfaEnrollment,
  });
  const updateMutation = useMutation({
    mutationFn: (data: Partial<SovereignPreferencesSlice>) =>
      container.sovereignAccountRepository.updatePreferences(data),
    onSuccess: (updated) => {
      qc.setQueryData(sovereignAccountKeys.preferences(), updated);
    },
    onError: (err) => {
      invalidateOnConcurrencyConflict(qc, sovereignAccountKeys.preferences(), err);
    },
  });
  return { ...query, updateMutation };
}

/** Presentation ViewModel wrapping workstation preferences queries and patches. */
export function useAccountPreferencesSliceViewModel() {
  const { data, isLoading, isError, error, refetch, updateMutation } =
    useSovereignPreferencesSlice();
  return {
    preferences: data,
    isLoadingPreferences: isLoading,
    isPreferencesError: isError,
    preferencesError: error instanceof Error ? error.message : null,
    refetchPreferences: refetch,
    updatePreferences: (patch: Partial<SovereignPreferencesSlice>) =>
      updateMutation.mutateAsync({
        ...patch,
        rowVersion: patch.rowVersion ?? data?.rowVersion,
      }),
    isUpdatingPreferences: updateMutation.isPending,
    updatePreferencesError: updateMutation.error,
  };
}

/** Queries notification routing rules and exposes read/test/delete alert mutations. */
export function useSovereignNotificationsSlice() {
  const qc = useQueryClient();
  const requireMfaEnrollment = useAppStore((s) => s.requireMfaEnrollment);
  const query = useQuery({
    queryKey: sovereignAccountKeys.notifications(),
    queryFn: () => container.sovereignAccountRepository.getNotifications(),
    enabled: !requireMfaEnrollment,
  });
  const updateMutation = useMutation({
    mutationFn: (data: Partial<SovereignNotificationsSlice>) =>
      container.sovereignAccountRepository.updateNotifications(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: sovereignAccountKeys.notifications() }),
    onError: (err) => {
      invalidateOnConcurrencyConflict(qc, sovereignAccountKeys.notifications(), err);
    },
  });
  const sendTestMutation = useMutation({
    mutationFn: (category?: string) =>
      container.sovereignAccountRepository.sendTestNotification(category),
    onSuccess: () => qc.invalidateQueries({ queryKey: sovereignAccountKeys.notifications() }),
  });
  const markReadMutation = useMutation({
    mutationFn: (id: string) =>
      container.sovereignAccountRepository.markNotificationAsRead(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: sovereignAccountKeys.notifications() }),
  });
  const markAllReadMutation = useMutation({
    mutationFn: () => container.sovereignAccountRepository.markAllNotificationsAsRead(),
    onSuccess: () => qc.invalidateQueries({ queryKey: sovereignAccountKeys.notifications() }),
  });
  const deleteMutation = useMutation({
    mutationFn: (id: string) => container.sovereignAccountRepository.deleteNotification(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: sovereignAccountKeys.notifications() }),
  });
  return {
    ...query,
    updateMutation,
    sendTestMutation,
    markReadMutation,
    markAllReadMutation,
    deleteMutation,
  };
}

/** Presentation ViewModel for account notification channels, quiet hours, and alert actions. */
export function useAccountNotificationsSliceViewModel() {
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    updateMutation,
    sendTestMutation,
    markReadMutation,
    markAllReadMutation,
    deleteMutation,
  } = useSovereignNotificationsSlice();
  return {
    notifications: data,
    isLoadingNotifications: isLoading,
    isNotificationsError: isError,
    notificationsError: error instanceof Error ? error.message : null,
    refetchNotifications: refetch,
    updateNotifications: (patch: Partial<SovereignNotificationsSlice>) =>
      updateMutation.mutateAsync({
        ...patch,
        rowVersion: patch.rowVersion ?? data?.rowVersion,
      }),
    isUpdatingNotifications: updateMutation.isPending,
    updateNotificationsError: updateMutation.error,
    sendTestNotification: (category?: string) => sendTestMutation.mutateAsync(category),
    isSendingTestNotification: sendTestMutation.isPending,
    testNotificationSent: sendTestMutation.isSuccess,
    markNotificationAsRead: (id: string) => markReadMutation.mutateAsync(id),
    markAllNotificationsAsRead: () => markAllReadMutation.mutateAsync(),
    deleteNotification: (id: string) => deleteMutation.mutateAsync(id),
  };
}

/** Queries tenant edition entitlements and submits upgrade or role-access requests. */
export function useSovereignPlanSlice(options?: { enabled?: boolean }) {
  const qc = useQueryClient();
  const requireMfaEnrollment = useAppStore((s) => s.requireMfaEnrollment);
  const query = useQuery({
    queryKey: sovereignAccountKeys.plan(),
    queryFn: () => container.sovereignAccountRepository.getPlan(),
    enabled: !requireMfaEnrollment && (options?.enabled ?? true),
  });
  const requestMutation = useMutation({
    mutationFn: ({ type, code, notes }: { type: string; code: string; notes?: string }) =>
      container.sovereignAccountRepository.submitPlanRequest(type, code, notes),
    onSuccess: () => qc.invalidateQueries({ queryKey: sovereignAccountKeys.plan() }),
  });
  return { ...query, requestMutation };
}

/** Presentation ViewModel exposing active plan quotas and feature upgrade requests. */
export function useAccountPlanSliceViewModel(options?: { enabled?: boolean }) {
  const { data, isLoading, isError, error, refetch, requestMutation } =
    useSovereignPlanSlice(options);
  return {
    plan: data,
    isLoadingPlan: isLoading,
    isPlanError: isError,
    planError: error instanceof Error ? error.message : null,
    refetchPlan: refetch,
    submitPlanRequest: (payload: { type: string; code: string; notes?: string }) =>
      requestMutation.mutateAsync(payload),
    isSubmittingRequest: requestMutation.isPending,
  };
}

/** Queries linked SSO providers and personal access tokens with CRUD mutations. */
export function useSovereignIntegrationsSlice() {
  const qc = useQueryClient();
  const requireMfaEnrollment = useAppStore((s) => s.requireMfaEnrollment);
  const query = useQuery({
    queryKey: sovereignAccountKeys.integrations(),
    queryFn: () => container.sovereignAccountRepository.getIntegrations(),
    enabled: !requireMfaEnrollment,
  });
  const createMutation = useMutation({
    mutationFn: (
      data: Parameters<typeof container.sovereignAccountRepository.createIntegrationItem>[0]
    ) => container.sovereignAccountRepository.createIntegrationItem(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: sovereignAccountKeys.integrations() }),
  });
  const rollPatMutation = useMutation({
    mutationFn: (id: string) => container.sovereignAccountRepository.rollPersonalAccessToken(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: sovereignAccountKeys.integrations() }),
  });
  const updatePatMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: Parameters<
        typeof container.sovereignAccountRepository.updatePersonalAccessToken
      >[1];
    }) => container.sovereignAccountRepository.updatePersonalAccessToken(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: sovereignAccountKeys.integrations() }),
  });
  const deleteMutation = useMutation({
    mutationFn: ({ kind, id }: { kind: string; id: string }) =>
      container.sovereignAccountRepository.deleteIntegrationItem(kind, id),
    onSuccess: () => qc.invalidateQueries({ queryKey: sovereignAccountKeys.integrations() }),
  });
  return { ...query, createMutation, updatePatMutation, rollPatMutation, deleteMutation };
}

/** Presentation ViewModel for SSO federations and personal access token lifecycle. */
export function useAccountIntegrationsSliceViewModel() {
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    createMutation,
    updatePatMutation,
    rollPatMutation,
    deleteMutation,
  } = useSovereignIntegrationsSlice();
  return {
    integrations: data,
    isLoadingIntegrations: isLoading,
    isIntegrationsError: isError,
    integrationsError: error instanceof Error ? error.message : null,
    refetchIntegrations: refetch,
    createIntegrationItem: (
      payload: Parameters<typeof container.sovereignAccountRepository.createIntegrationItem>[0]
    ) => createMutation.mutateAsync(payload),
    isCreatingItem: createMutation.isPending,
    updatePersonalAccessToken: (
      id: string,
      payload: Parameters<
        typeof container.sovereignAccountRepository.updatePersonalAccessToken
      >[1]
    ) => updatePatMutation.mutateAsync({ id, payload }),
    isUpdatingPat: updatePatMutation.isPending,
    rollPersonalAccessToken: (id: string) => rollPatMutation.mutateAsync(id),
    isRollingPat: rollPatMutation.isPending,
    deleteIntegrationItem: (payload: { kind: string; id: string }) =>
      deleteMutation.mutateAsync(payload),
    isDeletingItem: deleteMutation.isPending,
  };
}
