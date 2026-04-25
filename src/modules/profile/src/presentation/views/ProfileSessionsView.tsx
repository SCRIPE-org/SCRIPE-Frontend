"use client";

/**
 * ProfileSessionsView — Active sessions management page
 */
import { useI18n } from "@core/providers/i18n-provider";
import { useSessionsViewModel } from "../viewmodels/useSessionsViewModel";
import { SessionCard } from "../components/SessionCard";
import { Button } from "@core/ui/button";
import { Loader2, AlertTriangle, Info } from "lucide-react";

export function ProfileSessionsView() {
  const { t } = useI18n();
  const vm = useSessionsViewModel();

  if (vm.isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (vm.error) {
    return <div className="py-20 text-center text-destructive">{vm.error}</div>;
  }

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h2 className="text-xl font-semibold">{t("profile.sessions.title")}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{t("profile.sessions.description")}</p>
      </div>

      {/* Current Session */}
      {vm.currentSession && (
        <section className="space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            {t("profile.sessions.currentSession")}
          </h3>
          <SessionCard session={vm.currentSession} />
        </section>
      )}

      {/* Other Sessions */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            {t("profile.sessions.otherSessions")} ({vm.otherSessions.length})
          </h3>
          {vm.otherSessions.length > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => vm.revokeAllSessions()}
              loading={vm.isRevokingAll}
            >
              {t("profile.sessions.revokeAll")}
            </Button>
          )}
        </div>

        {vm.otherSessions.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            {t("profile.sessions.noOther")}
          </div>
        ) : (
          <div className="space-y-3">
            {vm.otherSessions.map((session) => (
              <SessionCard
                key={session.tokenId}
                session={session}
                onRevoke={vm.revokeSession}
                isRevoking={vm.isRevoking}
              />
            ))}
          </div>
        )}
      </section>

      {/* Security tip */}
      <div className="flex items-start gap-3 rounded-xl border border-primary/10 bg-primary/5 p-4 text-sm text-muted-foreground">
        <Info className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
        <span>{t("profile.sessions.securityTip")}</span>
      </div>
    </div>
  );
}
