"use client";

/**
 * Sovereign Account World v3.0 Persistent Shell (/account/*)
 *
 * Hosts the top operational executive telemetry banner (ProfileTelemetryHud),
 * the 6-category sticky left navigation console (ProfileRailLayout), and the
 * unified policy-aware SudoVerificationModal across all /account/* routes.
 */
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useProfileDossierViewModel } from "@modules/profile/core/src/presentation/viewmodels/useProfileDossierViewModel";
import {
  useAccountContextSliceViewModel,
  useSudoViewModel,
} from "@modules/profile/core/src/presentation/viewmodels/useSovereignAccountSlicesViewModel";
import { sessionsFleetKeys } from "@modules/profile/core/src/presentation/viewmodels/useSessionsFleetViewModel";
import { ProfileTelemetryHud } from "@modules/profile/core/src/presentation/components/ProfileTelemetryHud";
import { ProfileRailLayout } from "@modules/profile/core/src/presentation/components/ProfileRailLayout";
import { SudoVerificationModal } from "@modules/profile/core/src/presentation/components/SudoVerificationModal";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";

export default function SovereignAccountSectionLayout({ children }: { children: React.ReactNode }) {
  const { profile, toggleAvailability, switchAcademy, selectedAcademyId } =
    useProfileDossierViewModel();
  const { accountContext, isLoadingContext } = useAccountContextSliceViewModel();
  const { sudoActive, openSudoModal, refreshStatus, lockSudo } = useSudoViewModel();
  const queryClient = useQueryClient();
  const cachedSessions = queryClient.getQueryData<unknown[]>(sessionsFleetKeys.list());
  const activeSessionCount = Array.isArray(cachedSessions)
    ? cachedSessions.length
    : accountContext?.activeSessionsCount;

  useEffect(() => {
    void refreshStatus();
  }, [refreshStatus]);

  return (
    <ModuleErrorBoundary moduleName="profile.title">
      <div className="w-full min-w-0 max-w-7xl mx-auto py-2 sm:py-4 overflow-x-clip">
        <ProfileTelemetryHud
          profile={profile}
          accountContext={accountContext}
          activeSessionCount={activeSessionCount}
          onToggleAvailability={toggleAvailability}
          onOpenSudoGate={openSudoModal}
          onLockSudo={lockSudo}
          sudoActive={sudoActive}
          isLoading={isLoadingContext && !profile}
        />
        <ProfileRailLayout
          profile={profile}
          principalContext={accountContext?.principalContext}
          featureFlags={accountContext?.featureFlags}
          selectedAcademyId={selectedAcademyId}
          onSwitchAcademy={switchAcademy}
          isLoading={isLoadingContext && !profile}
        >
          {children}
        </ProfileRailLayout>
        <SudoVerificationModal />
      </div>
    </ModuleErrorBoundary>
  );
}
