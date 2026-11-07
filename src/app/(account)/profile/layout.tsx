"use client";

/**
 * Profile Suite Persistent Shell
 *
 * Hosts the top operational executive telemetry banner (ProfileTelemetryHud)
 * and sticky left navigation console (ProfileRailLayout) across all /profile/* routes.
 * Shares the single ['profile', 'me'] query cache with child views to eliminate N+1 requests.
 */
import { useQueryClient } from "@tanstack/react-query";
import { useProfileDossierViewModel } from "@modules/profile/core/src/presentation/viewmodels/useProfileDossierViewModel";
import { sessionsFleetKeys } from "@modules/profile/core/src/presentation/viewmodels/useSessionsFleetViewModel";
import { ProfileTelemetryHud } from "@modules/profile/core/src/presentation/components/ProfileTelemetryHud";
import { ProfileRailLayout } from "@modules/profile/core/src/presentation/components/ProfileRailLayout";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  const { profile, toggleAvailability, switchAcademy, selectedAcademyId } = useProfileDossierViewModel();
  const queryClient = useQueryClient();
  const cachedSessions = queryClient.getQueryData<unknown[]>(sessionsFleetKeys.list());
  const activeSessionCount = Array.isArray(cachedSessions) && cachedSessions.length > 0 ? cachedSessions.length : 3;

  return (
    <ModuleErrorBoundary moduleName="profile.title">
      <div className="w-full max-w-7xl mx-auto py-4 sm:py-6 px-3 sm:px-6">
        <ProfileTelemetryHud
          profile={profile}
          activeSessionCount={activeSessionCount}
          onToggleAvailability={toggleAvailability}
        />
        <ProfileRailLayout
          profile={profile}
          selectedAcademyId={selectedAcademyId}
          onSwitchAcademy={switchAcademy}
        >
          {children}
        </ProfileRailLayout>
      </div>
    </ModuleErrorBoundary>
  );
}
