"use client";

/**
 * Sovereign Account World v3.0 Persistent Shell (/account/*)
 *
 * Hosts the top operational executive telemetry banner (ProfileTelemetryHud),
 * the 6-category sticky left navigation console (ProfileRailLayout), and the
 * unified policy-aware SudoVerificationModal across all /account/* routes.
 */
import { Suspense, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useI18n } from "@core/providers/i18n-provider";
import { Card } from "@core/ui/card";
import { Skeleton } from "@core/ui/skeleton";
import { useProfileDossierViewModel } from "@modules/profile/core/src/presentation/viewmodels/useProfileDossierViewModel";
import {
  useAccountContextSliceViewModel,
  useAccountSecuritySliceViewModel,
  useSudoViewModel,
} from "@modules/profile/core/src/presentation/viewmodels/useSovereignAccountSlicesViewModel";
import { sessionsFleetKeys } from "@modules/profile/core/src/presentation/viewmodels/useSessionsFleetViewModel";
import { ProfileTelemetryHud } from "@modules/profile/core/src/presentation/components/ProfileTelemetryHud";
import { ProfileRailLayout } from "@modules/profile/core/src/presentation/components/ProfileRailLayout";
import { SudoVerificationModal } from "@modules/profile/core/src/presentation/components/SudoVerificationModal";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";

function AccountSectionSuspenseFallback() {
  const { t } = useI18n();
  return (
    <output
      aria-busy="true"
      aria-label={t("profile.common.loadingRegion")}
      data-testid="account-section-skeleton"
      className="block space-y-5"
    >
      <div className="space-y-2">
        <Skeleton shape="title" className="h-6 w-56" />
        <Skeleton shape="text" className="h-3.5 w-80" />
      </div>
      <Card className="border border-nx-line bg-nx-surface p-5 space-y-3">
        <Skeleton shape="title" className="h-5 w-48" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Skeleton shape="block" className="h-16 w-full rounded-xl" />
          <Skeleton shape="block" className="h-16 w-full rounded-xl" />
        </div>
      </Card>
      <Card className="border border-nx-line bg-nx-surface p-5 space-y-2.5">
        <Skeleton shape="block" className="h-14 w-full rounded-xl" />
        <Skeleton shape="block" className="h-14 w-full rounded-xl" />
      </Card>
    </output>
  );
}

export default function SovereignAccountSectionLayout({ children }: { children: React.ReactNode }) {
  const { profile, toggleAvailability, switchAcademy, selectedAcademyId } =
    useProfileDossierViewModel();
  const { accountContext, isLoadingContext } = useAccountContextSliceViewModel();
  const { security } = useAccountSecuritySliceViewModel();
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
          security={security}
          activeSessionCount={activeSessionCount}
          onToggleAvailability={toggleAvailability}
          onOpenSudoGate={openSudoModal}
          onLockSudo={lockSudo}
          sudoActive={sudoActive}
          isLoading={isLoadingContext && !profile && !security}
        />
        <ProfileRailLayout
          profile={profile}
          principalContext={accountContext?.principalContext}
          featureFlags={accountContext?.featureFlags}
          selectedAcademyId={selectedAcademyId}
          onSwitchAcademy={switchAcademy}
          isLoading={isLoadingContext && !profile && !security}
        >
          <Suspense fallback={<AccountSectionSuspenseFallback />}>{children}</Suspense>
        </ProfileRailLayout>
        <SudoVerificationModal />
      </div>
    </ModuleErrorBoundary>
  );
}
