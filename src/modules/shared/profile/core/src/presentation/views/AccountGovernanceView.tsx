"use client";

import { useState, useEffect } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { toast } from "@core/ui/sileo-toast";
import {
  useAccountContextSliceViewModel,
  useAccountGovernanceSliceViewModel,
  useColleaguesSearchViewModel,
} from "../viewmodels/useSovereignAccountSlicesViewModel";
import { PermissionProvenanceGraph } from "../components/PermissionProvenanceGraph";
import { GovernancePageSkeleton } from "../components/AccountSkeletons";
import { AccountSliceErrorState } from "../components/AccountSliceErrorState";
import type { PermissionProvenanceNode } from "../../domain/entities/SovereignAccountEntities";
import { GovernanceSummaryCardsSection } from "../sections/governance/GovernanceSummaryCardsSection";
import { GovernanceRolesScopeSection } from "../sections/governance/GovernanceRolesScopeSection";
import {
  GovernanceDelegationsSection,
  type GovernanceDelegationItem,
} from "../sections/governance/GovernanceDelegationsSection";
import { GovernanceBreakGlassSection } from "../sections/governance/GovernanceBreakGlassSection";
import { GrantDelegationModal } from "../sections/governance/GrantDelegationModal";
import { RevokeDelegationModal } from "../sections/governance/RevokeDelegationModal";
import { isSudoCancelledError } from "../utils/sudoElevation";

/**
 * Access governance, role/branch scope coverage, PBAC provenance matrix,
 * time-bounded delegations, and break-glass policy view (/account/governance).
 */
export function AccountGovernanceView() {
  const { t } = useI18n();
  const { principalContext, featureFlags } = useAccountContextSliceViewModel();
  const {
    governance,
    isLoadingGovernance,
    isGovernanceError,
    governanceError,
    refetchGovernance,
    createDelegation,
    isCreatingDelegation,
    requestBreakGlass,
    isRequestingBreakGlass,
    revokeDelegation,
    isRevokingDelegation,
  } = useAccountGovernanceSliceViewModel();

  const [grantModalOpen, setGrantModalOpen] = useState(false);
  const [colleagueQuery, setColleagueQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [pendingRevoke, setPendingRevoke] = useState<GovernanceDelegationItem | null>(null);
  const [revokeError, setRevokeError] = useState<string | null>(null);
  const [incidentTicketId, setIncidentTicketId] = useState("");
  const [breakGlassReason, setBreakGlassReason] = useState("");
  const [breakGlassDurationHours, setBreakGlassDurationHours] = useState(2);
  const [breakGlassScopesDraft, setBreakGlassScopesDraft] = useState<string[] | null>(null);
  const [customBreakGlassScope, setCustomBreakGlassScope] = useState("");
  const [breakGlassError, setBreakGlassError] = useState<string | null>(null);
  const [breakGlassSubmitted, setBreakGlassSubmitted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(colleagueQuery.trim()), 250);
    return () => clearTimeout(timer);
  }, [colleagueQuery]);

  const { colleagues, isSearchingColleagues } = useColleaguesSearchViewModel(
    debouncedQuery,
    grantModalOpen
  );

  if (isLoadingGovernance && !governance && !isGovernanceError) {
    return <GovernancePageSkeleton />;
  }

  if (isGovernanceError && !governance) {
    return (
      <AccountSliceErrorState
        title={t("profile.governance.title")}
        description={t("profile.governance.subtitle")}
        message={governanceError}
        onRetry={() => void refetchGovernance?.()}
      />
    );
  }

  const isPlatformAdmin = principalContext?.principalKind === "PlatformAdmin";
  const hasStandingRoot = Boolean(principalContext?.hasStandingRootAuthority);
  const assignedRoleNames = (governance?.assignedRoles ?? []).map((r) => r.name).filter(Boolean);
  const allowedBranches = governance?.allowedBranches ?? [];
  const effectivePermissions = governance?.effectivePermissions ?? [];
  const provenanceNodes: PermissionProvenanceNode[] = effectivePermissions.map((p) => ({
    permissionCode: p.permission,
    domain: p.domain,
    editionSource: p.sourceEdition,
    branchScope: p.sourceBranch,
    grantingRole: p.sourceRole,
    delegationSource: p.sourceDelegation ?? null,
    isFieldRestricted: false,
  }));
  const delegations: GovernanceDelegationItem[] = governance?.delegations ?? [];
  const delegationAllowed =
    isPlatformAdmin ||
    (governance?.isDelegationFeatureEnabled !== false &&
      featureFlags?.vacationDelegationEnabled !== false);
  const availableScopeCodes = Array.from(
    new Set(effectivePermissions.map((p) => p.permission).filter(Boolean))
  );
  const nonWildcardScopes = availableScopeCodes.filter(
    (code) => code !== "*" && !code.endsWith(".*")
  );
  const selectedBreakGlassScopes =
    breakGlassScopesDraft ?? (nonWildcardScopes[0] ? [nonWildcardScopes[0]] : []);

  const handleConfirmRevoke = async () => {
    if (!pendingRevoke) return;
    setRevokeError(null);
    try {
      await revokeDelegation(pendingRevoke.id);
      setPendingRevoke(null);
    } catch (err: unknown) {
      if (isSudoCancelledError(err)) return;
      setRevokeError(err instanceof Error ? err.message : t("profile.common.error"));
    }
  };

  const handleSubmitBreakGlass = async () => {
    const trimmedReason = breakGlassReason.trim();
    if (!trimmedReason) return;
    setBreakGlassError(null);
    setBreakGlassSubmitted(false);

    const rawTicket = incidentTicketId.trim();
    if (rawTicket.length > 0 && rawTicket.length < 4) return setBreakGlassError(t("profile.governance.breakGlassTicketError"));
    if (trimmedReason.length < 10) return setBreakGlassError(t("profile.governance.breakGlassReasonMinError"));

    const resolvedTicket = rawTicket.length >= 4 ? rawTicket : "INC-JIT";
    const resolvedScopes =
      selectedBreakGlassScopes.length > 0
        ? selectedBreakGlassScopes
        : customBreakGlassScope.trim()
          ? customBreakGlassScope.split(",").map((s) => s.trim()).filter(Boolean)
          : ["account.break_glass"];

    try {
      if (requestBreakGlass) {
        await requestBreakGlass({
          incidentTicketId: resolvedTicket,
          justification: trimmedReason,
          permissions: resolvedScopes,
          durationHours: breakGlassDurationHours,
        });
      }
      setBreakGlassSubmitted(true);
      setIncidentTicketId("");
      setBreakGlassReason("");
      setCustomBreakGlassScope("");
      toast.success(t("profile.governance.breakGlassLoggedNotice"));
    } catch (err: unknown) {
      if (isSudoCancelledError(err)) return;
      const msg = err instanceof Error && err.message ? err.message : t("profile.common.error");
      setBreakGlassError(msg);
      toast.error(msg);
    }
  };

  return (
    <div className="space-y-6 min-w-0">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-nx-ink">
          {t("profile.governance.title")}
        </h1>
        <p className="text-xs text-nx-ink-3 mt-1">{t("profile.governance.subtitle")}</p>
      </div>

      <GovernanceSummaryCardsSection
        t={t}
        assignedRoleNames={assignedRoleNames}
        isPlatformAdmin={isPlatformAdmin}
        allowedBranches={allowedBranches}
        activeBranchName={governance?.activeBranchName}
        activeTenantName={governance?.activeTenantName}
        controlPlaneLabel={principalContext?.controlPlaneLabel}
        effectivePermissionsCount={effectivePermissions.length}
      />

      <GovernanceRolesScopeSection
        t={t}
        assignedRoleNames={assignedRoleNames}
        isPlatformAdmin={isPlatformAdmin}
        allowedBranches={allowedBranches}
        controlPlaneLabel={principalContext?.controlPlaneLabel}
      />

      <PermissionProvenanceGraph
        provenanceGraph={provenanceNodes}
        effectivePermissions={availableScopeCodes}
        roles={assignedRoleNames}
        activeBranch={governance?.activeBranchName || principalContext?.activeBranchName || ""}
        editionName={governance?.activeTenantName || principalContext?.activeTenantName || ""}
        isPlatformAdmin={isPlatformAdmin}
      />

      {delegationAllowed && (
        <GovernanceDelegationsSection
          t={t}
          delegations={delegations}
          delegationAllowed={delegationAllowed}
          isRevokingDelegation={isRevokingDelegation}
          onOpenGrantModal={() => {
            setColleagueQuery("");
            setDebouncedQuery("");
            setGrantModalOpen(true);
          }}
          onRequestRevoke={(item) => {
            setRevokeError(null);
            setPendingRevoke(item);
          }}
        />
      )}

      <GovernanceBreakGlassSection
        t={t}
        hasStandingRoot={hasStandingRoot}
        incidentTicketId={incidentTicketId}
        breakGlassReason={breakGlassReason}
        durationHours={breakGlassDurationHours}
        availableScopeCodes={nonWildcardScopes}
        selectedScopes={selectedBreakGlassScopes}
        customScopeInput={customBreakGlassScope}
        isSubmittingBreakGlass={Boolean(isRequestingBreakGlass)}
        breakGlassError={breakGlassError}
        breakGlassSubmitted={breakGlassSubmitted}
        onTicketChange={(val) => {
          setIncidentTicketId(val);
          if (breakGlassError) setBreakGlassError(null);
        }}
        onReasonChange={(val) => {
          setBreakGlassReason(val);
          if (breakGlassError) setBreakGlassError(null);
        }}
        onDurationChange={setBreakGlassDurationHours}
        onToggleScope={(code) => {
          setBreakGlassError(null);
          setBreakGlassScopesDraft(
            selectedBreakGlassScopes.includes(code)
              ? selectedBreakGlassScopes.filter((item) => item !== code)
              : [...selectedBreakGlassScopes, code].slice(0, 15)
          );
        }}
        onCustomScopeChange={(val) => {
          setCustomBreakGlassScope(val);
          if (breakGlassError) setBreakGlassError(null);
        }}
        onSubmitBreakGlass={() => void handleSubmitBreakGlass()}
      />

      {delegationAllowed && (
        <>
          <GrantDelegationModal
            t={t}
            open={grantModalOpen}
            colleagueQuery={colleagueQuery}
            colleagues={colleagues}
            isSearchingColleagues={isSearchingColleagues}
            availableScopeCodes={availableScopeCodes}
            isCreatingDelegation={isCreatingDelegation}
            onOpenChange={(open) => {
              setGrantModalOpen(open);
              if (!open) {
                setColleagueQuery("");
                setDebouncedQuery("");
              }
            }}
            onColleagueQueryChange={setColleagueQuery}
            onCreateDelegation={createDelegation}
          />
          <RevokeDelegationModal
            t={t}
            pendingRevoke={pendingRevoke}
            revokeError={revokeError}
            isRevokingDelegation={isRevokingDelegation}
            onClose={() => {
              setPendingRevoke(null);
              setRevokeError(null);
            }}
            onConfirm={() => void handleConfirmRevoke()}
          />
        </>
      )}
    </div>
  );
}
