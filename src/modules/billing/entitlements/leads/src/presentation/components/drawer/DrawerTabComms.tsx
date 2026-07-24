"use client";

import { Button } from "@core/ui/button";
import { Mail, Send } from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
import { formatDateTimeUtc } from "@core/common/utils";
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
 * Presentation UI component rendering the drawer tab comms.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
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
          className="h-9 w-full gap-2 bg-primary text-sm font-semibold text-primary-foreground hover:bg-primary/90"
        >
          <Send className="h-4 w-4" />
          {t("leads.email.send")}
        </Button>
      )}

      <div className="rounded-xl border border-border/50 bg-card/40 p-4">
        <p className="mb-3 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          <Mail className="h-3.5 w-3.5" />
          {t("leads.email.communicationsTitle")}
        </p>
        {isLoadingComms ? (
          <div className="animate-pulse space-y-3 motion-reduce:animate-none">
            {[1, 2].map((i) => (
              <div key={i} className="space-y-1">
                <div className="h-3 w-40 rounded bg-muted" />
                <div className="h-2.5 w-24 rounded bg-muted" />
              </div>
            ))}
          </div>
        ) : !communicationLogs || communicationLogs.length === 0 ? (
          <p className="text-xs text-muted-foreground">{t("leads.email.noEmailsSent")}</p>
        ) : (
          <ol className="relative space-y-4 border-s border-primary/40 ps-4">
            {communicationLogs.map((log) => (
              <li key={log.id}>
                <div className="absolute -start-[5px] mt-1 h-2.5 w-2.5 rounded-full bg-primary ring-2 ring-background" />
                <p className="truncate text-xs font-semibold text-foreground">{log.subject}</p>
                <p className="mt-0.5 text-[10px] text-muted-foreground">
                  {t("leads.email.sentBy")} {log.sentByAdminName} ·{" "}
                  {formatDateTimeUtc(log.sentAt)}
                </p>
                {log.isFailed && (
                  <span className="mt-1 inline-flex items-center rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] font-medium text-destructive">
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
