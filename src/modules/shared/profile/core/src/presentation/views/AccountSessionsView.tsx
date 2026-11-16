"use client";

import { useState } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { Button } from "@core/ui/button";
import { useSessionsFleetViewModel } from "../viewmodels/useSessionsFleetViewModel";
import { useSovereignSessionsSlice } from "../viewmodels/useSovereignAccountSlicesViewModel";
import { SovereignSessionRadar, type RadarSessionNode } from "../components/SovereignSessionRadar";
import { EmergencyLockdownDialog } from "../components/EmergencyLockdownDialog";
import { SessionsPageSkeleton } from "../components/AccountSkeletons";
import { SessionsFleetListSection } from "../sections/sessions/SessionsFleetListSection";
import { RevokeOtherSessionsDialog } from "../sections/sessions/RevokeOtherSessionsDialog";
import { Trash2, RefreshCw, Loader2, ShieldAlert } from "lucide-react";

/**
 * Active workstation fleet and session telemetry view (/account/sessions),
 * exposing emergency lockdown and Sudo-gated mass session revocation.
 */
export function AccountSessionsView() {
  const { t } = useI18n();
  const {
    currentSession,
    otherSessions,
    otherCount,
    isLoading,
    refetch,
    revokeSession,
    isRevoking,
    revokeAllOtherSessions,
    isRevokingAllOthers,
    emergencyLockdown,
    isLockingDown,
  } = useSessionsFleetViewModel();

  const { data: sliceSessionsData } = useSovereignSessionsSlice();

  const [isLockdownOpen, setIsLockdownOpen] = useState(false);
  const [confirmRevokeAllOpen, setConfirmRevokeAllOpen] = useState(false);
  const [revokeAllError, setRevokeAllError] = useState<string | null>(null);

  if (isLoading && !currentSession && otherSessions.length === 0) {
    return <SessionsPageSkeleton />;
  }

  const sliceSessions = sliceSessionsData?.sessions ?? [];
  const geoBySessionId = new Map(sliceSessions.map((item) => [item.sessionId, item]));

  const toRadarNode = (session: NonNullable<typeof currentSession>): RadarSessionNode => {
    const geo = geoBySessionId.get(session.id);
    const hasNonZeroGeo =
      geo != null && (Math.abs(geo.latitude) > 0.0001 || Math.abs(geo.longitude) > 0.0001);
    const fallbackLocation = [session.city, session.country].filter(Boolean).join(", ");
    return {
      id: session.id,
      label: `${session.browser} (${session.os})`,
      location: geo?.geoLocation || fallbackLocation,
      ipAddress: session.ipAddress,
      lat: hasNonZeroGeo ? geo.latitude : undefined,
      lon: hasNonZeroGeo ? geo.longitude : undefined,
      isCurrent: session.isCurrent,
    };
  };

  const radarNodes: RadarSessionNode[] = [
    ...(currentSession ? [toRadarNode(currentSession)] : []),
    ...otherSessions.map(toRadarNode),
  ];

  const handleConfirmRevokeAll = async () => {
    setRevokeAllError(null);
    try {
      await revokeAllOtherSessions();
      setConfirmRevokeAllOpen(false);
    } catch (err: unknown) {
      setRevokeAllError(err instanceof Error ? err.message : t("profile.common.error"));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-nx-ink">
            {t("profile.sessions.title")}
          </h1>
          <p className="text-xs text-nx-ink-3 mt-1">{t("profile.sessions.description")}</p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isLoading}
            className="text-xs h-8 gap-1.5"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
            <span>{t("profile.common.refresh")}</span>
          </Button>

          {otherCount > 0 && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              data-testid="revoke-all-other-sessions-btn"
              onClick={() => {
                setRevokeAllError(null);
                setConfirmRevokeAllOpen(true);
              }}
              disabled={isRevokingAllOthers}
              className="text-xs h-8 text-destructive border-destructive/30 hover:bg-destructive/10 gap-1.5 font-semibold"
            >
              {isRevokingAllOthers ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Trash2 className="h-3.5 w-3.5" />
              )}
              <span>
                {t("profile.sessions.revokeAllOthersBtn")} ({otherCount})
              </span>
            </Button>
          )}

          <Button
            type="button"
            variant="destructive"
            size="sm"
            data-testid="emergency-lockdown-btn"
            onClick={() => setIsLockdownOpen(true)}
            className="text-xs h-8 gap-1.5 font-semibold"
          >
            <ShieldAlert className="h-3.5 w-3.5" style={{ minWidth: 14, minHeight: 14 }} />
            <span>{t("profile.lockdown.triggerBtn")}</span>
          </Button>
        </div>
      </div>

      <SovereignSessionRadar
        nodes={radarNodes}
        impossibleTravelDetected={Boolean(sliceSessionsData?.impossibleTravelDetected)}
        onRevokeAllOther={
          otherCount > 0
            ? () => {
                setRevokeAllError(null);
                setConfirmRevokeAllOpen(true);
              }
            : undefined
        }
        onKillNode={(nodeId) => void revokeSession(nodeId)}
      />

      <SessionsFleetListSection
        t={t}
        currentSession={currentSession}
        otherSessions={otherSessions}
        otherCount={otherCount}
        isRevoking={isRevoking}
        onRevoke={revokeSession}
      />

      <RevokeOtherSessionsDialog
        t={t}
        open={confirmRevokeAllOpen}
        otherCount={otherCount}
        isRevokingAllOthers={isRevokingAllOthers}
        error={revokeAllError}
        onOpenChange={(open) => {
          setConfirmRevokeAllOpen(open);
          if (!open) setRevokeAllError(null);
        }}
        onConfirm={() => void handleConfirmRevokeAll()}
      />

      <EmergencyLockdownDialog
        isOpen={isLockdownOpen}
        onClose={() => setIsLockdownOpen(false)}
        onConfirmLockdown={emergencyLockdown}
        isLockingDown={isLockingDown}
      />
    </div>
  );
}
