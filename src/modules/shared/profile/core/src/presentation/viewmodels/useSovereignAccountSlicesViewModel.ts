/**
 * useSovereignAccountSlicesViewModel
 *
 * MVVM ViewModel hooks for all 15 SCRIPE Sovereign Account World v3.0 slices.
 * Strictly delegates all data access through container.sovereignAccountRepository.
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { container } from "@modules/profile/di";
import type {
  SovereignPreferencesSlice,
  SovereignAccessibilitySlice,
  SovereignAiCopilotSlice,
  SovereignNotificationsSlice,
} from "../../domain/entities/SovereignAccountEntities";

export const sovereignAccountKeys = {
  all: ["sovereign-account"] as const,
  context: () => [...sovereignAccountKeys.all, "context"] as const,
  dossier: () => [...sovereignAccountKeys.all, "dossier"] as const,
  credentials: () => [...sovereignAccountKeys.all, "credentials"] as const,
  security: () => [...sovereignAccountKeys.all, "security"] as const,
  sessions: () => [...sovereignAccountKeys.all, "sessions"] as const,
  devices: () => [...sovereignAccountKeys.all, "devices"] as const,
  governance: () => [...sovereignAccountKeys.all, "governance"] as const,
  activity: () => [...sovereignAccountKeys.all, "activity"] as const,
  privacy: () => [...sovereignAccountKeys.all, "privacy"] as const,
  preferences: () => [...sovereignAccountKeys.all, "preferences"] as const,
  accessibility: () => [...sovereignAccountKeys.all, "accessibility"] as const,
  aiCopilot: () => [...sovereignAccountKeys.all, "ai-copilot"] as const,
  notifications: () => [...sovereignAccountKeys.all, "notifications"] as const,
  plan: () => [...sovereignAccountKeys.all, "plan"] as const,
  billing: () => [...sovereignAccountKeys.all, "billing"] as const,
  integrations: () => [...sovereignAccountKeys.all, "integrations"] as const,
};

export function useSovereignDossierSlice() {
  return useQuery({
    queryKey: sovereignAccountKeys.dossier(),
    queryFn: () => container.sovereignAccountRepository.getDossier(),
  });
}

export function useSovereignCredentialsSlice() {
  const qc = useQueryClient();
  const query = useQuery({
    queryKey: sovereignAccountKeys.credentials(),
    queryFn: () => container.sovereignAccountRepository.getCredentials(),
  });
  const upsertMutation = useMutation({
    mutationFn: (data: Parameters<typeof container.sovereignAccountRepository.upsertCredential>[0]) =>
      container.sovereignAccountRepository.upsertCredential(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: sovereignAccountKeys.credentials() }),
  });
  const deleteMutation = useMutation({
    mutationFn: (id: string) => container.sovereignAccountRepository.deleteCredential(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: sovereignAccountKeys.credentials() }),
  });
  return { ...query, upsertMutation, deleteMutation };
}

export function useSovereignSecuritySlice() {
  const qc = useQueryClient();
  const query = useQuery({
    queryKey: sovereignAccountKeys.security(),
    queryFn: () => container.sovereignAccountRepository.getSecurity(),
  });
  const updateMutation = useMutation({
    mutationFn: (data: Parameters<typeof container.sovereignAccountRepository.updateSecurityPosture>[0]) =>
      container.sovereignAccountRepository.updateSecurityPosture(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: sovereignAccountKeys.security() }),
  });
  return { ...query, updateMutation };
}

export function useSovereignSessionsSlice() {
  const query = useQuery({
    queryKey: sovereignAccountKeys.sessions(),
    queryFn: () => container.sovereignAccountRepository.getSessions(),
  });
  const pingMutation = useMutation({
    mutationFn: (sessionId: string) => container.sovereignAccountRepository.pingSession(sessionId),
  });
  return { ...query, pingMutation };
}

export function useSovereignDevicesSlice() {
  const qc = useQueryClient();
  const query = useQuery({
    queryKey: sovereignAccountKeys.devices(),
    queryFn: () => container.sovereignAccountRepository.getDevices(),
  });
  const upsertMutation = useMutation({
    mutationFn: (data: Parameters<typeof container.sovereignAccountRepository.upsertDevice>[0]) =>
      container.sovereignAccountRepository.upsertDevice(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: sovereignAccountKeys.devices() }),
  });
  const revokeMutation = useMutation({
    mutationFn: (id: string) => container.sovereignAccountRepository.revokeDevice(id, true),
    onSuccess: () => qc.invalidateQueries({ queryKey: sovereignAccountKeys.devices() }),
  });
  return { ...query, upsertMutation, revokeMutation };
}

export function useSovereignGovernanceSlice() {
  const qc = useQueryClient();
  const query = useQuery({
    queryKey: sovereignAccountKeys.governance(),
    queryFn: () => container.sovereignAccountRepository.getGovernance(),
  });
  const createDelegationMutation = useMutation({
    mutationFn: (data: Parameters<typeof container.sovereignAccountRepository.createDelegation>[0]) =>
      container.sovereignAccountRepository.createDelegation(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: sovereignAccountKeys.governance() }),
  });
  const revokeDelegationMutation = useMutation({
    mutationFn: (id: string) => container.sovereignAccountRepository.revokeDelegation(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: sovereignAccountKeys.governance() }),
  });
  return { ...query, createDelegationMutation, revokeDelegationMutation };
}

export function useSovereignActivitySlice() {
  const qc = useQueryClient();
  const query = useQuery({
    queryKey: sovereignAccountKeys.activity(),
    queryFn: () => container.sovereignAccountRepository.getActivity(30),
  });
  const inspectorPassMutation = useMutation({
    mutationFn: ({ org, hours }: { org: string; hours: number }) =>
      container.sovereignAccountRepository.generateInspectorPass(org, hours),
    onSuccess: () => qc.invalidateQueries({ queryKey: sovereignAccountKeys.activity() }),
  });
  return { ...query, inspectorPassMutation };
}

export function useSovereignPrivacySlice() {
  const qc = useQueryClient();
  const query = useQuery({
    queryKey: sovereignAccountKeys.privacy(),
    queryFn: () => container.sovereignAccountRepository.getPrivacy(),
  });
  const updateMutation = useMutation({
    mutationFn: (data: Parameters<typeof container.sovereignAccountRepository.updatePrivacy>[0]) =>
      container.sovereignAccountRepository.updatePrivacy(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: sovereignAccountKeys.privacy() }),
  });
  const exportMutation = useMutation({
    mutationFn: () => container.sovereignAccountRepository.requestPrivacyExport(),
  });
  return { ...query, updateMutation, exportMutation };
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
  });
  return { ...query, updateMutation };
}

export function useSovereignAccessibilitySlice() {
  const qc = useQueryClient();
  const query = useQuery({
    queryKey: sovereignAccountKeys.accessibility(),
    queryFn: () => container.sovereignAccountRepository.getAccessibility(),
  });
  const updateMutation = useMutation({
    mutationFn: (data: Partial<SovereignAccessibilitySlice>) =>
      container.sovereignAccountRepository.updateAccessibility(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: sovereignAccountKeys.accessibility() }),
  });
  return { ...query, updateMutation };
}

export function useSovereignAiCopilotSlice() {
  const qc = useQueryClient();
  const query = useQuery({
    queryKey: sovereignAccountKeys.aiCopilot(),
    queryFn: () => container.sovereignAccountRepository.getAiCopilot(),
  });
  const updateMutation = useMutation({
    mutationFn: (data: Partial<SovereignAiCopilotSlice>) =>
      container.sovereignAccountRepository.updateAiCopilot(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: sovereignAccountKeys.aiCopilot() }),
  });
  return { ...query, updateMutation };
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
  });
  return { ...query, updateMutation };
}

export function useSovereignPlanSlice() {
  const query = useQuery({
    queryKey: sovereignAccountKeys.plan(),
    queryFn: () => container.sovereignAccountRepository.getPlan(),
  });
  const requestMutation = useMutation({
    mutationFn: ({ type, code, notes }: { type: string; code: string; notes?: string }) =>
      container.sovereignAccountRepository.submitPlanRequest(type, code, notes),
  });
  return { ...query, requestMutation };
}

export function useSovereignBillingSlice() {
  const qc = useQueryClient();
  const query = useQuery({
    queryKey: sovereignAccountKeys.billing(),
    queryFn: () => container.sovereignAccountRepository.getBilling(),
  });
  const submitExpenseMutation = useMutation({
    mutationFn: (data: Parameters<typeof container.sovereignAccountRepository.submitExpenseClaim>[0]) =>
      container.sovereignAccountRepository.submitExpenseClaim(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: sovereignAccountKeys.billing() }),
  });
  return { ...query, submitExpenseMutation };
}

export function useSovereignIntegrationsSlice() {
  const qc = useQueryClient();
  const query = useQuery({
    queryKey: sovereignAccountKeys.integrations(),
    queryFn: () => container.sovereignAccountRepository.getIntegrations(),
  });
  const createMutation = useMutation({
    mutationFn: (data: Parameters<typeof container.sovereignAccountRepository.createIntegrationItem>[0]) =>
      container.sovereignAccountRepository.createIntegrationItem(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: sovereignAccountKeys.integrations() }),
  });
  const deleteMutation = useMutation({
    mutationFn: ({ kind, id }: { kind: string; id: string }) =>
      container.sovereignAccountRepository.deleteIntegrationItem(kind, id),
    onSuccess: () => qc.invalidateQueries({ queryKey: sovereignAccountKeys.integrations() }),
  });
  return { ...query, createMutation, deleteMutation };
}
