"use client";

import { Button } from "@core/ui/button";
import { Mail, Send } from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
import type { LeadCommunicationLog } from "../../../domain/entities/PlatformLead";

// ── Props ─────────────────────────────────────────────────────────────────────

interface DrawerTabCommsProps {
  communicationLogs?: LeadCommunicationLog[];
  isLoadingComms?: boolean;
  canSendEmail: boolean;
  onOpenEmailDialog: () => void;
}

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * React presentation component representing the drawer tab comms UI element.
 */
export function DrawerTabComms({
  communicationLogs,
  isLoadingComms,
  canSendEmail,
  onOpenEmailDialog,
}: DrawerTabCommsProps) {
  const { t } = useI18n();

  return (
    <div className="space-y-3 p-4">
      {canSendEmail && (
        <Button
          onClick={onOpenEmailDialog}
          className="h-9 w-full gap-2 bg-violet-600 text-sm font-semibold text-white hover:bg-violet-500"
        >
          <Send className="h-4 w-4" />
          {t("leads.email.send")}
        </Button>
      )}

      <div className="rounded-xl border border-zinc-800/50 bg-zinc-900/40 p-4">
        <p className="mb-3 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
          <Mail className="h-3.5 w-3.5" />
          {t("leads.email.communicationsTitle")}
        </p>
        {isLoadingComms ? (
          <div className="animate-pulse space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="space-y-1">
                <div className="h-3 w-40 rounded bg-zinc-800" />
                <div className="h-2.5 w-24 rounded bg-zinc-800" />
              </div>
            ))}
          </div>
        ) : !communicationLogs || communicationLogs.length === 0 ? (
          <p className="text-xs text-zinc-500">{t("leads.email.noEmailsSent")}</p>
        ) : (
          <ol className="relative space-y-4 border-s border-violet-800/40 ps-4">
            {communicationLogs.map((log) => (
              <li key={log.id}>
                <div className="absolute -start-[5px] mt-1 h-2.5 w-2.5 rounded-full bg-violet-500 ring-2 ring-zinc-950" />
                <p className="truncate text-xs font-semibold text-zinc-300">{log.subject}</p>
                <p className="mt-0.5 text-[10px] text-zinc-500">
                  {t("leads.email.sentBy")} {log.sentByAdminName} ·{" "}
                  {log.sentAt.toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
                {log.isFailed && (
                  <span className="mt-1 inline-flex items-center rounded-full bg-red-500/10 px-2 py-0.5 text-[10px] font-medium text-red-400">
                    {t("leads.email.failed")}
                  </span>
                )}
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}
