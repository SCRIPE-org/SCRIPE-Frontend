"use client";

/**
 * Sovereign Account World v3.0 Persistent Shell (/account/*)
 *
 * Hosts the top operational executive telemetry banner (ProfileTelemetryHud),
 * the 6-category sticky left navigation console (ProfileRailLayout), and the
 * Biometric Sudo Gate across all 15 /account/* routes.
 */
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useProfileDossierViewModel } from "@modules/profile/core/src/presentation/viewmodels/useProfileDossierViewModel";
import { sessionsFleetKeys } from "@modules/profile/core/src/presentation/viewmodels/useSessionsFleetViewModel";
import { ProfileTelemetryHud } from "@modules/profile/core/src/presentation/components/ProfileTelemetryHud";
import { ProfileRailLayout } from "@modules/profile/core/src/presentation/components/ProfileRailLayout";
import { SovereignSudoGate } from "@modules/profile/core/src/presentation/components/SovereignSudoGate";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";

export default function SovereignAccountSectionLayout({ children }: { children: React.ReactNode }) {
  const { profile, toggleAvailability, switchAcademy, selectedAcademyId } = useProfileDossierViewModel();
  const queryClient = useQueryClient();
  const cachedSessions = queryClient.getQueryData<unknown[]>(sessionsFleetKeys.list());
  const activeSessionCount = Array.isArray(cachedSessions) ? cachedSessions.length : 1;
  const [sudoGateOpen, setSudoGateOpen] = useState(false);
  const [sudoActive, setSudoActive] = useState(true);

  return (
    <ModuleErrorBoundary moduleName="profile.title">
      <div className="w-full min-w-0 max-w-7xl mx-auto py-2 sm:py-4 overflow-x-clip">
        <ProfileTelemetryHud
          profile={profile}
          activeSessionCount={activeSessionCount}
          onToggleAvailability={toggleAvailability}
          onOpenSudoGate={() => setSudoGateOpen(true)}
          sudoActive={sudoActive}
        />
        <ProfileRailLayout
          profile={profile}
          selectedAcademyId={selectedAcademyId}
          onSwitchAcademy={switchAcademy}
        >
          {children}
        </ProfileRailLayout>
        <SovereignSudoGate
          open={sudoGateOpen}
          onOpenChange={setSudoGateOpen}
          onVerified={() => setSudoActive(true)}
        />
      </div>
    </ModuleErrorBoundary>
  );
}
