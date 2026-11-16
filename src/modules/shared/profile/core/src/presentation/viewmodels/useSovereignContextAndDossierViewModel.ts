/**
 * useSovereignContextAndDossierViewModel
 *
 * ViewModel hooks for Sovereign Account identity context and dossier operations.
 */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { container } from "@modules/profile/di";
import { sovereignAccountKeys } from "../utils/sovereignAccountKeys";

/** Queries and exposes dossier mutations for email verification, export, and deactivation. */
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

/** Queries the shared telemetry HUD and principal context slice. */
export function useSovereignAccountContextSlice() {
  return useQuery({
    queryKey: sovereignAccountKeys.context(),
    queryFn: () => container.sovereignAccountRepository.getContext(),
  });
}

/** Presentation ViewModel wrapping shared account and principal context state. */
export function useAccountContextSliceViewModel() {
  const query = useSovereignAccountContextSlice();
  return {
    accountContext: query.data,
    principalContext: query.data?.principalContext,
    featureFlags: query.data?.featureFlags,
    isLoadingContext: query.isLoading,
    isFetchingContext: query.isFetching,
    refetchContext: query.refetch,
  };
}

/** Presentation ViewModel for the identity dossier view and lifecycle actions. */
export function useAccountDossierSliceViewModel() {
  const { data, isLoading, sendVerificationMutation, exportDataMutation, deactivateMutation } =
    useSovereignDossierSlice();
  return {
    dossier: data
      ? {
          isEmailVerified: data.isEmailVerified,
          principalContext: data.principalContext,
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
    isLoadingDossier: isLoading,
    sendEmailVerification: () => sendVerificationMutation.mutateAsync(),
    isSendingVerification: sendVerificationMutation.isPending,
    verificationSent: sendVerificationMutation.isSuccess,
    exportAccountData: () => exportDataMutation.mutateAsync(),
    isExportingData: exportDataMutation.isPending,
    deactivateAccount: () => deactivateMutation.mutateAsync(),
    isDeactivatingAccount: deactivateMutation.isPending,
  };
}
