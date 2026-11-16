/**
 * useSovereignGovAndActivityViewModel
 *
 * ViewModel hooks for governance authority, delegations, colleague search,
 * and forensic account activity queries.
 */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { container } from "@modules/profile/di";
import type { SovereignActivityQuery } from "../../domain/entities/SovereignAccountEntities";
import { sovereignAccountKeys } from "../utils/sovereignAccountKeys";

/** Queries governance state and mutates time-bounded authority delegations. */
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
    mutationFn: (id: string) => container.sovereignAccountRepository.revokeDelegation(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: sovereignAccountKeys.governance() }),
  });
  return { ...query, createDelegationMutation, revokeDelegationMutation };
}

/** Presentation ViewModel formatting role provenance and delegation actions. */
export function useAccountGovernanceSliceViewModel() {
  const { data, isLoading, createDelegationMutation, revokeDelegationMutation } =
    useSovereignGovernanceSlice();
  return {
    governance: data
      ? {
          isSuperAdmin: Boolean(data.isSuperAdmin),
          isProtected: Boolean(data.isProtected),
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
    isLoadingGovernance: isLoading,
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
        delegateAdminId: payload.delegateAdminId ?? "00000000-0000-0000-0000-000000000000",
        delegateDisplayName: payload.delegateDisplayName ?? payload.delegateEmail ?? "",
        delegationType: payload.delegationType ?? "ACTING_AS",
        grantedScopes: payload.grantedScopes ?? payload.delegatedPermissions ?? [],
        justification: payload.justification ?? payload.reason ?? "",
        startsAtUtc: payload.startsAtUtc,
        expiresAtUtc: payload.expiresAtUtc,
      }),
    isCreatingDelegation: createDelegationMutation.isPending,
    revokeDelegation: (id: string) => revokeDelegationMutation.mutateAsync(id),
    isRevokingDelegation: revokeDelegationMutation.isPending,
  };
}

/** Queries the paginated sovereign forensic audit activity feed. */
export function useSovereignActivitySlice(query?: SovereignActivityQuery) {
  return useQuery({
    queryKey: sovereignAccountKeys.activity(query),
    queryFn: () => container.sovereignAccountRepository.getActivity(query ?? 50),
  });
}

/** Presentation ViewModel wrapping the forensic activity query slice. */
export function useAccountActivitySliceViewModel(query?: SovereignActivityQuery) {
  const result = useSovereignActivitySlice(query);
  return {
    activity: result.data,
    isLoadingActivity: result.isLoading,
    isFetchingActivity: result.isFetching,
    refetchActivity: result.refetch,
  };
}

/** Searches administrator colleagues eligible for authority delegation. */
export function useColleaguesSearchViewModel(query: string, enabled: boolean = true) {
  const result = useQuery({
    queryKey: sovereignAccountKeys.colleagues(query.trim()),
    queryFn: () => container.sovereignAccountRepository.searchColleagues(query),
    enabled,
  });
  return {
    colleagues: result.data ?? [],
    isSearchingColleagues: result.isLoading || result.isFetching,
  };
}
