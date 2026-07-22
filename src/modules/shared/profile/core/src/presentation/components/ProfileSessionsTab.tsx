import React from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { Button } from "@core/ui/button";
import { SessionCard } from "./SessionCard";

interface ProfileSessionsTabProps {
  sessionsVm: {
    sessions: any[] | null | undefined;
    currentSession: any;
    otherSessions: any[];
    revokeSession: (tokenId: string) => Promise<unknown>;
    isRevoking: boolean;
    revokeAllSessions: () => Promise<unknown>;
    isRevokingAll: boolean;
  };
}

/**
 * Presentation UI component rendering the profile sessions tab.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*).
 */
export function ProfileSessionsTab({ sessionsVm }: ProfileSessionsTabProps) {
  const { t } = useI18n();

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border/80 bg-card/45 p-5 shadow-sm backdrop-blur-md">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-base font-bold text-foreground">
              {t("profile.sessions.sectionTitle")}
            </h3>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {t("profile.sessions.sectionDesc")}
            </p>
          </div>
          {sessionsVm.otherSessions.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              className="border-destructive/25 bg-destructive/5 text-destructive hover:border-destructive/30 hover:bg-destructive/10"
              onClick={() => sessionsVm.revokeAllSessions()}
              loading={sessionsVm.isRevokingAll}
            >
              {t("profile.sessions.revokeAll")}
            </Button>
          )}
        </div>

        <div className="space-y-3">
          {sessionsVm.currentSession && <SessionCard session={sessionsVm.currentSession} />}

          {sessionsVm.otherSessions.map((session) => (
            <SessionCard
              key={session.tokenId}
              session={session}
              onRevoke={sessionsVm.revokeSession}
              isRevoking={sessionsVm.isRevoking}
            />
          ))}

          {(!sessionsVm.sessions || sessionsVm.sessions.length === 0) && (
            <p className="py-6 text-center text-xs text-muted-foreground">
              {t("profile.sessions.noEntries")}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
