/**
 * useSovereignAccountSlicesViewModel
 *
 * MVVM ViewModel hooks for the Clean 9-Page B2B Enterprise Account Console (v4.0).
 * Strictly delegates all data access through container.sovereignAccountRepository.
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { container } from "@modules/profile/di";
import type {
  SovereignPreferencesSlice,
  SovereignNotificationsSlice,
} from "../../domain/entities/SovereignAccountEntities";
import { invalidateOnConcurrencyConflict } from "../utils/concurrency";

export const sovereignAccountKeys = {
  all: ["sovereign-account"] as const,
  context: () => [...sovereignAccountKeys.all, "context"] as const,
  dossier: () => [...sovereignAccountKeys.all, "dossier"] as const,
  security: () => [...sovereignAccountKeys.all, "security"] as const,
  sessions: () => [...sovereignAccountKeys.all, "sessions"] as const,
  governance: () => [...sovereignAccountKeys.all, "governance"] as const,
  activity: () => [...sovereignAccountKeys.all, "activity"] as const,
  preferences: () => [...sovereignAccountKeys.all, "preferences"] as const,
  notifications: () => [...sovereignAccountKeys.all, "notifications"] as const,
  plan: () => [...sovereignAccountKeys.all, "plan"] as const,
  integrations: () => [...sovereignAccountKeys.all, "integrations"] as const,
};

export function useSovereignDossierSlice() {
  const qc = useQueryClient();
  const query = useQuery({
    queryKey: sovereignAccountKeys.dossier(),
    queryFn: () => container.sovereignAccountRepository.getDossier(),
  });
  const sendVerificationMutation = useMutation({
    mutationFn: () => container.sovereignAccountRepository.sendEmailVerification(),
    onSuccess: () => qc.invalidateQueries({ queryKey: sovereignAccountKeys.dossier() }),
  });
  const exportDataMutation = useMutation({
    mutationFn: () => container.sovereignAccountRepository.exportAccountData(),
  });
  const deactivateMutation = useMutation({
    mutationFn: () => container.sovereignAccountRepository.deactivateAccount(),
    onSuccess: () => qc.invalidateQueries({ queryKey: sovereignAccountKeys.dossier() }),
  });
  return { ...query, sendVerificationMutation, exportDataMutation, deactivateMutation };
}

export function useAccountDossierSliceViewModel() {
  const { data, sendVerificationMutation, exportDataMutation, deactivateMutation } =
    useSovereignDossierSlice();
  return {
    dossier: data
      ? {
          isEmailVerified: data.isEmailVerified,
          clubMemberships: data.clubMemberships.map((m) => ({
            tenantId: m.tenantId,
            clubName: m.clubName,
            branchName: m.branchName,
            roleName: m.roleTitle,
            status: m.status,
            isPrimary: Boolean(m.isPrimary),
          })),
          customFields: data.customFields,
          rowVersion: data.rowVersion,
        }
      : undefined,
    sendEmailVerification: () => sendVerificationMutation.mutateAsync(),
    isSendingVerification: sendVerificationMutation.isPending,
    verificationSent: sendVerificationMutation.isSuccess,
    exportAccountData: () => exportDataMutation.mutateAsync(),
    isExportingData: exportDataMutation.isPending,
    deactivateAccount: () => deactivateMutation.mutateAsync(),
    isDeactivatingAccount: deactivateMutation.isPending,
  };
}

export function useSovereignSecuritySlice() {
  const qc = useQueryClient();
  const query = useQuery({
    queryKey: sovereignAccountKeys.security(),
    queryFn: () => container.sovereignAccountRepository.getSecurity(),
  });
  const updateMutation = useMutation({
    mutationFn: (
      data: Parameters<typeof container.sovereignAccountRepository.updateSecurityPosture>[0]
    ) => container.sovereignAccountRepository.updateSecurityPosture(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: sovereignAccountKeys.security() }),
    onError: (err) => {
      invalidateOnConcurrencyConflict(qc, sovereignAccountKeys.security(), err);
    },
  });
  return { ...query, updateMutation };
}

export function useAccountSecuritySliceViewModel() {
  const { data, updateMutation } = useSovereignSecuritySlice();
  return {
    security: data
      ? {
          trustedCidrs: data.trustedCidrs,
          currentClientIp: data.currentClientIp,
          isCurrentIpAllowed: data.isCurrentIpAllowed,
          rowVersion: data.rowVersion,
        }
      : undefined,
    updateSecurityPolicy: (payload: { trustedCidrs?: string[]; rowVersion?: string }) =>
      updateMutation.mutateAsync({
        trustedCidrs: payload.trustedCidrs,
        rowVersion: payload.rowVersion ?? data?.rowVersion,
      }),
    isUpdatingPolicy: updateMutation.isPending,
    updatePolicyError: updateMutation.error,
  };
}

export function useSovereignSessionsSlice() {
  const query = useQuery({
    queryKey: sovereignAccountKeys.sessions(),
    queryFn: () => container.sovereignAccountRepository.getSessions(),
  });
  const pingMutation = useMutation({
    mutationFn: (sessionId: string) =>
      container.sovereignAccountRepository.pingSession(sessionId),
  });
  return { ...query, pingMutation };
}

export function useSovereignGovernanceSlice() {
  const qc = useQueryClient();
  const query = useQuery({
    queryKey: sovereignAccountKeys.governance(),
    queryFn: () => container.sovereignAccountRepository.getGovernance(),
  });
  const createDelegationMutation = useMutation({
    mutationFn: (
      data: Parameters<typeof container.sovereignAccountRepository.createDelegation>[0]
    ) => container.sovereignAccountRepository.createDelegation(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: sovereignAccountKeys.governance() }),
  });
  const revokeDelegationMutation = useMutation({
    mutationFn: (id: string) =>
      container.sovereignAccountRepository.revokeDelegation(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: sovereignAccountKeys.governance() }),
  });
  return { ...query, createDelegationMutation, revokeDelegationMutation };
}

export function useAccountGovernanceSliceViewModel() {
  const { data, createDelegationMutation, revokeDelegationMutation } =
    useSovereignGovernanceSlice();
  return {
    governance: data
      ? {
          activeTenantName: data.activeTenantName,
          activeBranchName: data.activeBranchName,
          isDelegationFeatureEnabled: data.isDelegationFeatureEnabled,
          allowedBranches: data.allowedBranches,
          assignedRoles: data.assignedRoles,
          effectivePermissions: data.provenanceGraph.map((p) => ({
            permission: p.permissionCode,
            domain: p.domain,
            sourceEdition: p.editionSource,
            sourceBranch: p.branchScope,
            sourceRole: p.grantingRole,
            sourceDelegation: p.delegationSource ?? undefined,
          })),
          delegations: data.delegations.map((d) => ({
            id: d.id,
            delegateAdminId: d.delegateAdminId,
            delegateDisplayName: d.delegateDisplayName,
            delegateEmail: d.delegateDisplayName,
            delegationType: d.delegationType,
            grantedScopes: d.grantedScopes,
            delegatedPermissions: d.grantedScopes,
            startsAtUtc: d.startsAtUtc,
            expiresAtUtc: d.expiresAtUtc,
            justification: d.justification,
            reason: d.justification,
            status: d.status,
          })),
        }
      : undefined,
    createDelegation: (payload: {
      delegateAdminId?: string;
      delegateDisplayName?: string;
      delegateEmail?: string;
      delegationType?: string;
      grantedScopes?: string[];
      delegatedPermissions?: string[];
      startsAtUtc: string;
      expiresAtUtc: string;
      justification?: string;
      reason?: string;
    }) =>
      createDelegationMutation.mutateAsync({
        delegateAdminId:
          payload.delegateAdminId ?? "00000000-0000-0000-0000-000000000000",
        delegateDisplayName:
          payload.delegateDisplayName ?? payload.delegateEmail ?? "",
        delegationType: payload.delegationType ?? "ACTING_AS",
        grantedScopes:
          payload.grantedScopes ?? payload.delegatedPermissions ?? [],
        justification: payload.justification ?? payload.reason ?? "",
        startsAtUtc: payload.startsAtUtc,
        expiresAtUtc: payload.expiresAtUtc,
      }),
    isCreatingDelegation: createDelegationMutation.isPending,
    revokeDelegation: (id: string) => revokeDelegationMutation.mutateAsync(id),
    isRevokingDelegation: revokeDelegationMutation.isPending,
  };
}

export function useSovereignActivitySlice() {
  return useQuery({
    queryKey: sovereignAccountKeys.activity(),
    queryFn: () => container.sovereignAccountRepository.getActivity(30),
  });
}

export function useSovereignPreferencesSlice() {
  const qc = useQueryClient();
  const query = useQuery({
    queryKey: sovereignAccountKeys.preferences(),
    queryFn: () => container.sovereignAccountRepository.getPreferences(),
  });
  const updateMutation = useMutation({
    mutationFn: (data: Partial<SovereignPreferencesSlice>) =>
      container.sovereignAccountRepository.updatePreferences(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: sovereignAccountKeys.preferences() }),
    onError: (err) => {
      invalidateOnConcurrencyConflict(qc, sovereignAccountKeys.preferences(), err);
    },
  });
  return { ...query, updateMutation };
}

export function useAccountPreferencesSliceViewModel() {
  const { data, updateMutation } = useSovereignPreferencesSlice();
  return {
    preferences: data,
    updatePreferences: (patch: Partial<SovereignPreferencesSlice>) =>
      updateMutation.mutateAsync({
        ...patch,
        rowVersion: patch.rowVersion ?? data?.rowVersion,
      }),
    isUpdatingPreferences: updateMutation.isPending,
    updatePreferencesError: updateMutation.error,
  };
}

export function useSovereignNotificationsSlice() {
  const qc = useQueryClient();
  const query = useQuery({
    queryKey: sovereignAccountKeys.notifications(),
    queryFn: () => container.sovereignAccountRepository.getNotifications(),
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
    mutationFn: () =>
      container.sovereignAccountRepository.markAllNotificationsAsRead(),
    onSuccess: () => qc.invalidateQueries({ queryKey: sovereignAccountKeys.notifications() }),
  });
  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      container.sovereignAccountRepository.deleteNotification(id),
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

export function useAccountNotificationsSliceViewModel() {
  const {
    data,
    updateMutation,
    sendTestMutation,
    markReadMutation,
    markAllReadMutation,
    deleteMutation,
  } = useSovereignNotificationsSlice();
  return {
    notifications: data,
    updateNotifications: (patch: Partial<SovereignNotificationsSlice>) =>
      updateMutation.mutateAsync({
        ...patch,
        rowVersion: patch.rowVersion ?? data?.rowVersion,
      }),
    isUpdatingNotifications: updateMutation.isPending,
    updateNotificationsError: updateMutation.error,
    sendTestNotification: (category?: string) =>
      sendTestMutation.mutateAsync(category),
    isSendingTestNotification: sendTestMutation.isPending,
    testNotificationSent: sendTestMutation.isSuccess,
    markNotificationAsRead: (id: string) => markReadMutation.mutateAsync(id),
    markAllNotificationsAsRead: () => markAllReadMutation.mutateAsync(),
    deleteNotification: (id: string) => deleteMutation.mutateAsync(id),
  };
}

export function useSovereignPlanSlice() {
  const qc = useQueryClient();
  const query = useQuery({
    queryKey: sovereignAccountKeys.plan(),
    queryFn: () => container.sovereignAccountRepository.getPlan(),
  });
  const requestMutation = useMutation({
    mutationFn: ({ type, code, notes }: { type: string; code: string; notes?: string }) =>
      container.sovereignAccountRepository.submitPlanRequest(type, code, notes),
    onSuccess: () => qc.invalidateQueries({ queryKey: sovereignAccountKeys.plan() }),
  });
  return { ...query, requestMutation };
}

export function useAccountPlanSliceViewModel() {
  const { data, requestMutation } = useSovereignPlanSlice();
  return {
    plan: data,
    submitPlanRequest: (payload: { type: string; code: string; notes?: string }) =>
      requestMutation.mutateAsync(payload),
    isSubmittingRequest: requestMutation.isPending,
  };
}

export function useSovereignIntegrationsSlice() {
  const qc = useQueryClient();
  const query = useQuery({
    queryKey: sovereignAccountKeys.integrations(),
    queryFn: () => container.sovereignAccountRepository.getIntegrations(),
  });
  const createMutation = useMutation({
    mutationFn: (
      data: Parameters<typeof container.sovereignAccountRepository.createIntegrationItem>[0]
    ) => container.sovereignAccountRepository.createIntegrationItem(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: sovereignAccountKeys.integrations() }),
  });
  const deleteMutation = useMutation({
    mutationFn: ({ kind, id }: { kind: string; id: string }) =>
      container.sovereignAccountRepository.deleteIntegrationItem(kind, id),
    onSuccess: () => qc.invalidateQueries({ queryKey: sovereignAccountKeys.integrations() }),
  });
  return { ...query, createMutation, deleteMutation };
}

export function useAccountIntegrationsSliceViewModel() {
  const { data, createMutation, deleteMutation } = useSovereignIntegrationsSlice();
  return {
    integrations: data,
    createIntegrationItem: (
      payload: Parameters<typeof container.sovereignAccountRepository.createIntegrationItem>[0]
    ) => createMutation.mutateAsync(payload),
    isCreatingItem: createMutation.isPending,
    deleteIntegrationItem: (payload: { kind: string; id: string }) =>
      deleteMutation.mutateAsync(payload),
    isDeletingItem: deleteMutation.isPending,
  };
}

