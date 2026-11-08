// FILE-EXCEPTION: file length
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

export function useAccountDossierSliceViewModel() {
  const { data } = useSovereignDossierSlice();
  let tacticalPhilosophy:
    | {
        preferredFormation: string;
        pressingIntensity: string;
        buildUpStyle: string;
        manifesto: string;
        assignedAgeGroups: string[];
      }
    | undefined;
  if (data?.tacticalIdentityJson) {
    try {
      const p = JSON.parse(data.tacticalIdentityJson);
      tacticalPhilosophy = {
        preferredFormation: p.preferredFormation ?? "4-3-3",
        pressingIntensity: p.pressingIntensity ?? "",
        buildUpStyle: p.buildUpStyle ?? "",
        manifesto: p.manifesto ?? "",
        assignedAgeGroups: p.assignedAgeGroups ?? [],
      };
    } catch {
      tacticalPhilosophy = undefined;
    }
  }
  return {
    dossier: data
      ? {
          tacticalPhilosophy,
          clubMemberships: data.clubMemberships.map((m) => ({
            tenantId: m.tenantId,
            clubName: m.clubName,
            branchName: m.branchName,
            roleName: m.roleTitle,
            status: m.status,
          })),
          linkedAthleteProfiles: data.linkedAthletes.map((a) => ({
            athleteId: a.athleteId,
            fullName: a.fullName,
            ageGroup: a.squadName,
            position: a.shirtNumber,
            medicalClearance: a.medicalClearanceStatus,
          })),
        }
      : undefined,
  };
}

export function useSovereignCredentialsSlice() {
  const qc = useQueryClient();
  const query = useQuery({
    queryKey: sovereignAccountKeys.credentials(),
    queryFn: () => container.sovereignAccountRepository.getCredentials(),
  });
  const upsertMutation = useMutation({
    mutationFn: (
      data: Parameters<typeof container.sovereignAccountRepository.upsertCredential>[0]
    ) => container.sovereignAccountRepository.upsertCredential(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: sovereignAccountKeys.credentials() }),
  });
  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      container.sovereignAccountRepository.deleteCredential(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: sovereignAccountKeys.credentials() }),
  });
  return { ...query, upsertMutation, deleteMutation };
}

export function useAccountCredentialsSliceViewModel() {
  const { data, upsertMutation, deleteMutation } = useSovereignCredentialsSlice();
  return {
    credentials: data
      ? {
          nfcPassTokenId: data.passSerialNumber || data.federationBadgeCode,
          credentials: data.credentials.map((c) => ({
            id: c.id,
            credentialType: c.category,
            issuingBody: c.governingBody,
            licenseTitle: c.title,
            licenseNumber: c.licenseNumber,
            issuedAtUtc: c.issuedAtUtc,
            expiresAtUtc: c.expiresAtUtc ?? "",
            verificationStatus: c.verificationStatus,
            stadiumZones: data.stadiumZoneClearances,
          })),
        }
      : undefined,
    addCredential: (payload: {
      credentialType: string;
      issuingBody: string;
      licenseTitle: string;
      licenseNumber: string;
      issuedAtUtc: string;
      expiresAtUtc: string;
      stadiumZones: string[];
    }) =>
      upsertMutation.mutateAsync({
        category: payload.credentialType,
        governingBody: payload.issuingBody,
        title: payload.licenseTitle,
        licenseNumber: payload.licenseNumber,
        issuedAtUtc: payload.issuedAtUtc,
        expiresAtUtc: payload.expiresAtUtc,
        stadiumZoneClearances: payload.stadiumZones,
      }),
    isAddingCredential: upsertMutation.isPending,
    removeCredential: (id: string) => deleteMutation.mutateAsync(id),
    isRemovingCredential: deleteMutation.isPending,
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
  });
  return { ...query, updateMutation };
}

export function useAccountSecuritySliceViewModel() {
  const { data, updateMutation } = useSovereignSecuritySlice();
  return {
    security: data
      ? {
          awayMatchTravelShieldEnabled: data.travelShieldEnabled,
          trustedCidrs: data.trustedCidrs,
          hasDuressPinConfigured: data.hasDuressPin,
        }
      : undefined,
    updateSecurityPolicy: (payload: {
      awayMatchTravelShieldEnabled?: boolean;
      trustedCidrs?: string[];
      duressPin?: string;
    }) =>
      updateMutation.mutateAsync({
        travelShieldEnabled: payload.awayMatchTravelShieldEnabled,
        trustedCidrs: payload.trustedCidrs,
        duressPin: payload.duressPin,
      }),
    isUpdatingPolicy: updateMutation.isPending,
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

export function useSovereignDevicesSlice() {
  const qc = useQueryClient();
  const query = useQuery({
    queryKey: sovereignAccountKeys.devices(),
    queryFn: () => container.sovereignAccountRepository.getDevices(),
  });
  const upsertMutation = useMutation({
    mutationFn: (
      data: Parameters<typeof container.sovereignAccountRepository.upsertDevice>[0]
    ) => container.sovereignAccountRepository.upsertDevice(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: sovereignAccountKeys.devices() }),
  });
  const revokeMutation = useMutation({
    mutationFn: (id: string) =>
      container.sovereignAccountRepository.revokeDevice(id, true),
    onSuccess: () => qc.invalidateQueries({ queryKey: sovereignAccountKeys.devices() }),
  });
  return { ...query, upsertMutation, revokeMutation };
}

export function useAccountDevicesSliceViewModel() {
  const { data, upsertMutation, revokeMutation } = useSovereignDevicesSlice();
  return {
    devices: data
      ? {
          devices: data.devices.map((d) => ({
            id: d.id,
            deviceName: d.deviceName,
            deviceCategory: d.deviceCategory,
            osPlatform: d.platformOs,
            postureScore: d.postureScore,
            isCompliant: d.isTrusted,
            offlineVaultSyncedAtUtc: d.lastActiveAtUtc,
            telemetryBridgeType: d.telemetryBridgeProvider ?? "",
          })),
          wearableBridges: data.devices
            .filter((d) => d.deviceCategory === "WEARABLE_BRIDGE" || d.telemetryBridgeProvider)
            .map((d) => ({
              bridgeType: d.telemetryBridgeProvider || d.deviceName,
              lastSyncedAtUtc: d.lastActiveAtUtc,
              status: d.isTrusted ? "PAIRED" : "STANDBY",
            })),
        }
      : undefined,
    registerDevice: (payload: {
      deviceName: string;
      deviceCategory: string;
      osPlatform: string;
      telemetryBridgeType: string;
    }) =>
      upsertMutation.mutateAsync({
        deviceId: payload.telemetryBridgeType || payload.deviceName,
        deviceName: payload.deviceName,
        deviceCategory: payload.deviceCategory,
        platformOs: payload.osPlatform,
        appVersion: "4.8.0",
        isTrusted: true,
        isBiometricEnrolled: true,
        offlineVaultQuotaMb: 2048,
        telemetryBridgeProvider: payload.telemetryBridgeType,
      }),
    isRegisteringDevice: upsertMutation.isPending,
    revokeDevice: (id: string) => revokeMutation.mutateAsync(id),
    isRevokingDevice: revokeMutation.isPending,
  };
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
          effectivePermissions: data.provenanceGraph.map((p) => ({
            permission: p.permissionCode,
            sourceEdition: p.editionSource,
            sourceBranch: p.branchScope,
            sourceRole: p.grantingRole,
            sourceDelegation: p.delegationSource ?? undefined,
          })),
          delegations: data.delegations.map((d) => ({
            id: d.id,
            delegateEmail: d.delegateDisplayName,
            delegatedPermissions: d.grantedScopes,
            startsAtUtc: d.startsAtUtc,
            expiresAtUtc: d.expiresAtUtc,
            reason: d.justification,
            status: d.status,
          })),
        }
      : undefined,
    createDelegation: (payload: {
      delegateEmail: string;
      delegatedPermissions: string[];
      startsAtUtc: string;
      expiresAtUtc: string;
      reason: string;
    }) =>
      createDelegationMutation.mutateAsync({
        delegateAdminId: "00000000-0000-0000-0000-000000000000",
        delegateDisplayName: payload.delegateEmail,
        delegationType: "ACTING_AS",
        grantedScopes: payload.delegatedPermissions,
        justification: payload.reason,
        startsAtUtc: payload.startsAtUtc,
        expiresAtUtc: payload.expiresAtUtc,
      }),
    isCreatingDelegation: createDelegationMutation.isPending,
    revokeDelegation: (id: string) => revokeDelegationMutation.mutateAsync(id),
    isRevokingDelegation: revokeDelegationMutation.isPending,
  };
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
    mutationFn: (
      data: Parameters<typeof container.sovereignAccountRepository.updatePrivacy>[0]
    ) => container.sovereignAccountRepository.updatePrivacy(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: sovereignAccountKeys.privacy() }),
  });
  const exportMutation = useMutation({
    mutationFn: () => container.sovereignAccountRepository.requestPrivacyExport(),
  });
  return { ...query, updateMutation, exportMutation };
}

export function useAccountPrivacySliceViewModel() {
  const { data, updateMutation, exportMutation } = useSovereignPrivacySlice();
  return {
    privacy: data,
    saveScratchpad: (payload: { ciphertextBase64: string; ivBase64: string }) =>
      updateMutation.mutateAsync({
        encryptedScratchpadCiphertext: `${payload.ivBase64}:${payload.ciphertextBase64}`,
      }),
    isSavingScratchpad: updateMutation.isPending,
    exportDataArchive: () => exportMutation.mutateAsync(),
    isExportingArchive: exportMutation.isPending,
  };
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

export function useAccountPreferencesSliceViewModel() {
  const { data, updateMutation } = useSovereignPreferencesSlice();
  return {
    preferences: data,
    updatePreferences: (data: Partial<SovereignPreferencesSlice>) =>
      updateMutation.mutateAsync(data),
    isUpdatingPreferences: updateMutation.isPending,
  };
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

export function useAccountAccessibilitySliceViewModel() {
  const { data, updateMutation } = useSovereignAccessibilitySlice();
  return {
    accessibility: data,
    updateAccessibility: (data: Partial<SovereignAccessibilitySlice>) =>
      updateMutation.mutateAsync(data),
    isUpdatingAccessibility: updateMutation.isPending,
  };
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

export function useAccountAiCopilotSliceViewModel() {
  const { data, updateMutation } = useSovereignAiCopilotSlice();
  return {
    aiCopilot: data,
    updateAiCopilot: (data: Partial<SovereignAiCopilotSlice>) =>
      updateMutation.mutateAsync(data),
    isUpdatingAiCopilot: updateMutation.isPending,
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
  });
  return { ...query, updateMutation };
}

export function useAccountNotificationsSliceViewModel() {
  const { data, updateMutation } = useSovereignNotificationsSlice();
  return {
    notifications: data,
    updateNotifications: (data: Partial<SovereignNotificationsSlice>) =>
      updateMutation.mutateAsync(data),
    isUpdatingNotifications: updateMutation.isPending,
  };
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

export function useAccountPlanSliceViewModel() {
  const { data, requestMutation } = useSovereignPlanSlice();
  return {
    plan: data,
    submitPlanRequest: (payload: { type: string; code: string; notes?: string }) =>
      requestMutation.mutateAsync(payload),
    isSubmittingRequest: requestMutation.isPending,
  };
}

export function useSovereignBillingSlice() {
  const qc = useQueryClient();
  const query = useQuery({
    queryKey: sovereignAccountKeys.billing(),
    queryFn: () => container.sovereignAccountRepository.getBilling(),
  });
  const submitExpenseMutation = useMutation({
    mutationFn: (
      data: Parameters<typeof container.sovereignAccountRepository.submitExpenseClaim>[0]
    ) => container.sovereignAccountRepository.submitExpenseClaim(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: sovereignAccountKeys.billing() }),
  });
  return { ...query, submitExpenseMutation };
}

export function useAccountBillingSliceViewModel() {
  const { data, submitExpenseMutation } = useSovereignBillingSlice();
  return {
    billing: data,
    submitExpenseClaim: (
      payload: Parameters<typeof container.sovereignAccountRepository.submitExpenseClaim>[0]
    ) => submitExpenseMutation.mutateAsync(payload),
    isSubmittingExpense: submitExpenseMutation.isPending,
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
