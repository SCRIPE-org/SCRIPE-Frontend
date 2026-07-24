"use client";

import React, { useState } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@core/ui/card";
import { Button } from "@core/ui/button";
import { ConfirmationDialog } from "@core/ui/confirmation-dialog";
import { EmptyState } from "@core/ui/empty-state";
import { ShieldAlert, Monitor } from "lucide-react";
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
  const [confirmRevokeId, setConfirmRevokeId] = useState<string | null>(null);
  const [confirmRevokeAll, setConfirmRevokeAll] = useState(false);

  const hasEntries = !!sessionsVm.sessions && sessionsVm.sessions.length > 0;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex-row flex-wrap items-start justify-between gap-4 space-y-0">
          <div>
            <CardTitle>{t("profile.sessions.sectionTitle")}</CardTitle>
            <CardDescription>{t("profile.sessions.sectionDesc")}</CardDescription>
          </div>
          {sessionsVm.otherSessions.length > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setConfirmRevokeAll(true)}
            >
              {t("profile.sessions.revokeAll")}
            </Button>
          )}
        </CardHeader>

        <CardContent className="space-y-3">
          {sessionsVm.otherSessions.length > 0 && (
            <div className="flex items-start gap-2.5 rounded-nx-control border border-warning/15 bg-warning/5 p-3 text-xs text-warning">
              <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
              <p>{t("profile.sessions.securityTip")}</p>
            </div>
          )}

          {sessionsVm.currentSession && <SessionCard session={sessionsVm.currentSession} />}

          {sessionsVm.otherSessions.map((session) => (
            <SessionCard
              key={session.tokenId}
              session={session}
              onRevoke={async (tokenId) => {
                setConfirmRevokeId(tokenId);
              }}
              isRevoking={sessionsVm.isRevoking}
            />
          ))}

          {!hasEntries && (
            <EmptyState
              bare
              icon={Monitor}
              title={t("profile.sessions.noEntries")}
              size="sm"
            />
          )}
        </CardContent>
      </Card>

      {/* ── Revoke Single Session Confirmation ── */}
      <ConfirmationDialog
        open={!!confirmRevokeId}
        onOpenChange={(open) => {
          if (!open) setConfirmRevokeId(null);
        }}
        variant="destructive"
        title={t("profile.sessions.revokeConfirmTitle")}
        description={t("profile.sessions.revokeConfirmDesc")}
        confirmText={t("profile.sessions.revoke")}
        cancelText={t("common.cancel")}
        isLoading={sessionsVm.isRevoking}
        onConfirm={async () => {
          if (confirmRevokeId) await sessionsVm.revokeSession(confirmRevokeId);
          setConfirmRevokeId(null);
        }}
      />

      {/* ── Revoke All Other Sessions Confirmation ── */}
      <ConfirmationDialog
        open={confirmRevokeAll}
        onOpenChange={setConfirmRevokeAll}
        variant="destructive"
        title={t("profile.sessions.revokeAllConfirmTitle")}
        description={t("profile.sessions.revokeAllConfirmDesc")}
        confirmText={t("profile.sessions.revokeAll")}
        cancelText={t("common.cancel")}
        isLoading={sessionsVm.isRevokingAll}
        onConfirm={async () => {
          await sessionsVm.revokeAllSessions();
          setConfirmRevokeAll(false);
        }}
      />
    </div>
  );
}
