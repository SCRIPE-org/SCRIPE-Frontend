/**
 * useSovereignContextAndDossierViewModel
 *
 * ViewModel hooks for Sovereign Account identity context and dossier operations.
 */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSudoStore } from "@core/store/useSudoStore";
import { container } from "@modules/profile/di";
import type { SendEmailVerificationPayload } from "../../domain/interfaces/ISovereignAccountRepository";
import { sovereignAccountKeys } from "../utils/sovereignAccountKeys";

/** Queries and exposes dossier mutations for email verification, export, and deactivation. */
export function useSovereignDossierSlice() {
  const qc = useQueryClient();
  const query = useQuery({
    queryKey: sovereignAccountKeys.dossier(),
    queryFn: () => container.sovereignAccountRepository.getDossier(),
  });
  const sendVerificationMutation = useMutation({
    mutationFn: (payload?: SendEmailVerificationPayload) =>
      container.sovereignAccountRepository.sendEmailVerification(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: sovereignAccountKeys.dossier() }),
  });
  const exportDataMutation = useMutation({
    mutationFn: () => container.sovereignAccountRepository.exportAccountData(),
  });
  const deactivateMutation = useMutation({
    mutationFn: async (sudoCode?: string) => {
      const trimmedCode = sudoCode?.trim();
      if (trimmedCode && !useSudoStore.getState().isSessionElevated()) {
        const verified = await container.securityRepository.verifySudoStepUp({
          method: "totp",
          totpCode: trimmedCode,
        });
        useSudoStore.getState().markVerified(verified);
      }
      return container.sovereignAccountRepository.deactivateAccount(
        trimmedCode ? { sudoCode: trimmedCode } : undefined
      );
    },
    onSuccess: () => {
      useSudoStore.getState().markLocked();
      void qc.invalidateQueries({ queryKey: sovereignAccountKeys.dossier() });
    },
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
    isContextError: query.isError,
    contextError: query.error instanceof Error ? query.error.message : null,
    refetchContext: query.refetch,
  };
}

/** Presentation ViewModel for the identity dossier view and lifecycle actions. */
export function useAccountDossierSliceViewModel() {
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    sendVerificationMutation,
    exportDataMutation,
    deactivateMutation,
  } = useSovereignDossierSlice();
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
    isDossierError: isError,
    dossierError: error instanceof Error ? error.message : null,
    refetchDossier: refetch,
    sendEmailVerification: (payload?: SendEmailVerificationPayload) =>
      sendVerificationMutation.mutateAsync(payload),
    isSendingVerification: sendVerificationMutation.isPending,
    verificationSent: sendVerificationMutation.isSuccess,
    exportAccountData: () => exportDataMutation.mutateAsync(),
    isExportingData: exportDataMutation.isPending,
    deactivateAccount: (sudoCode?: string) => deactivateMutation.mutateAsync(sudoCode),
    isDeactivatingAccount: deactivateMutation.isPending,
  };
}
