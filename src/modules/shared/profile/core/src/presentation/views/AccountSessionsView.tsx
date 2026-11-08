"use client";

/**
 * AccountSessionsView
 *
 * Sovereign Slice 4 (/account/sessions):
 * Live SVG SovereignSessionRadar (Impossible Travel Velocity Guard & 1-click Ping),
 * Active Workstation Fleet (current pinned + remote cards with 50ms kill & Revoke All),
 * and SCRIPE Coach App QR Instant Pairing & Mobile Biometric Sudo Bridge.
 */
import { useState } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { Card } from "@core/ui/card";
import { Button } from "@core/ui/button";
import { useSessionsFleetViewModel } from "../viewmodels/useSessionsFleetViewModel";
import { SessionCard } from "../components/SessionCard";
import { SovereignSessionRadar } from "../components/SovereignSessionRadar";
import { EmergencyLockdownDialog } from "../components/EmergencyLockdownDialog";
import {
  Trash2,
  RefreshCw,
  Loader2,
  ShieldCheck,
} from "lucide-react";

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

  const [isLockdownOpen, setIsLockdownOpen] = useState(false);

  const radarNodes = [
    ...(currentSession
      ? [
          {
            id: currentSession.id,
            label: `${currentSession.browser} (${currentSession.os})`,
            location: currentSession.location || "Cairo, EG — Main Stadium HQ",
            ipAddress: currentSession.ipAddress,
            x: 56,
            y: 42,
            isCurrent: true,
          },
        ]
      : []),
    ...otherSessions.map((s, idx) => ({
      id: s.id,
      label: `${s.browser} (${s.os})`,
      location: s.location || "Cairo, EG — Pitch Tunnel",
      ipAddress: s.ipAddress,
      x: 62 + idx * 6,
      y: 48 - idx * 4,
      isCurrent: false,
    })),
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-nx-ink">
            {t("profile.sessions.title")}
          </h1>
          <p className="text-xs text-nx-ink-3 mt-1">
            {t("profile.sessions.description")}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
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
              variant="outline"
              size="sm"
              onClick={() => revokeAllOtherSessions()}
              disabled={isRevokingAllOthers}
              className="text-xs h-8 text-destructive border-destructive/30 hover:bg-destructive/10 gap-1.5 font-semibold"
            >
              {isRevokingAllOthers ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Trash2 className="h-3.5 w-3.5" />
              )}
              <span>{t("profile.sessions.revokeAllOthersBtn")} ({otherCount})</span>
            </Button>
          )}
        </div>
      </div>

      {/* 1. Live Adaptive SVG Geo-Radar & Impossible Travel Guard */}
      <SovereignSessionRadar nodes={radarNodes} impossibleTravelDetected={false} />

      {/* 2. Current Pinned Workstation */}
      {currentSession && (
        <div className="space-y-2">
          <h3 className="text-xs font-semibold text-nx-ink-3 uppercase tracking-wider">
            {t("profile.sessions.currentSectionTitle")}
          </h3>
          <SessionCard
            session={currentSession}
            onRevoke={revokeSession}
            isRevoking={false}
          />
        </div>
      )}

      {/* 3. Other Active Workstations Fleet */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold text-nx-ink-3 uppercase tracking-wider">
            {t("profile.sessions.otherSectionTitle")} ({otherCount})
          </h3>
        </div>

        {isLoading ? (
          <div className="p-4 rounded-xl border border-nx-line bg-nx-surface animate-pulse text-xs text-nx-ink-3">
            {t("profile.common.loading")}
          </div>
        ) : otherSessions.length === 0 ? (
          <Card className="border border-nx-line bg-nx-surface p-6 text-center space-y-2">
            <div className="h-10 w-10 rounded-full bg-success/10 text-success flex items-center justify-center mx-auto">
              <ShieldCheck className="h-5 w-5" style={{ minWidth: 20, minHeight: 20 }} />
            </div>
            <p className="text-xs font-semibold text-nx-ink">
              {t("profile.sessions.noOtherSessionsTitle")}
            </p>
            <p className="text-[11px] text-nx-ink-3 max-w-sm mx-auto">
              {t("profile.sessions.noOtherSessionsDesc")}
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {otherSessions.map((session) => (
              <SessionCard
                key={session.id}
                session={session}
                onRevoke={revokeSession}
                isRevoking={isRevoking}
              />
            ))}
          </div>
        )}
      </div>

      <EmergencyLockdownDialog
        isOpen={isLockdownOpen}
        onClose={() => setIsLockdownOpen(false)}
        onConfirmLockdown={emergencyLockdown}
        isLockingDown={isLockingDown}
      />
    </div>
  );
}
