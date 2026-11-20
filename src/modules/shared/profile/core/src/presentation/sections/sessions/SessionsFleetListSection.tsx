"use client";

import { Card } from "@core/ui/card";
import { ShieldCheck } from "lucide-react";
import { SessionCard } from "../../components/SessionCard";
import type { WorkstationSession } from "../../../domain/entities/WorkstationSession";

/**
 * Props for SessionsFleetListSection.
 */
export interface SessionsFleetListSectionProps {
  t: (key: string, params?: Record<string, string | number>) => string;
  currentSession: WorkstationSession | null | undefined;
  otherSessions: WorkstationSession[];
  otherCount: number;
  isRevoking: boolean;
  onRevoke: (sessionId: string) => Promise<unknown>;
}

/**
 * Renders the pinned current session and fleet of other active workstation sessions.
 */
export function SessionsFleetListSection({
  t,
  currentSession,
  otherSessions,
  otherCount,
  isRevoking,
  onRevoke,
}: SessionsFleetListSectionProps) {
  return (
    <>
      {currentSession && (
        <div className="space-y-2">
          <h3 className="text-xs font-semibold text-nx-ink-3 uppercase tracking-wider">
            {t("profile.sessions.currentSectionTitle")}
          </h3>
          <SessionCard session={currentSession} onRevoke={onRevoke} isRevoking={false} />
        </div>
      )}

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold text-nx-ink-3 uppercase tracking-wider">
            {t("profile.sessions.otherSectionTitle")} ({otherCount})
          </h3>
        </div>

        {otherSessions.length === 0 ? (
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
                onRevoke={onRevoke}
                isRevoking={isRevoking}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
