"use client";

import { Button } from "@core/ui/button";
import { ArrowRightCircle, UserPlus, Send, XCircle, Loader2 } from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
import type { PlatformLead, LeadStatus } from "../../../domain/entities/PlatformLead";

// ── Props ─────────────────────────────────────────────────────────────────────

interface DrawerActionBarProps {
  lead: PlatformLead;
  onConvert?: (id: string) => void;
  onAssign?: (id: string) => void;
  onSendEmail?: () => void;
  onCloseConfirm?: () => void;
  isDeletingLead?: boolean;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function DrawerActionBar({
  lead,
  onConvert,
  onAssign,
  onSendEmail,
  onCloseConfirm,
  isDeletingLead,
}: DrawerActionBarProps) {
  const { t } = useI18n();

  if (lead.isConverted) return null;

  return (
    <div className="shrink-0 border-t border-zinc-800/60 bg-zinc-950/95 px-4 py-3 backdrop-blur-sm">
      <div className="flex flex-wrap gap-2">
        {onConvert && (
          <Button
            id="drawer-convert-btn"
            size="sm"
            onClick={() => onConvert(lead.id)}
            className="h-8 min-w-[100px] flex-1 gap-1.5 bg-emerald-700/80 text-xs font-semibold text-emerald-100 hover:bg-emerald-600"
          >
            <ArrowRightCircle className="h-3.5 w-3.5" />
            {t("leads.actions.convert")}
          </Button>
        )}
        {onAssign && (
          <Button
            id="drawer-assign-btn"
            size="sm"
            variant="outline"
            onClick={() => onAssign(lead.id)}
            className="h-8 min-w-[80px] flex-1 gap-1.5 border-indigo-700 text-xs text-indigo-400 hover:bg-indigo-900/20"
          >
            <UserPlus className="h-3.5 w-3.5" />
            {t("leads.actions.assign")}
          </Button>
        )}
        {onSendEmail && (
          <Button
            id="drawer-send-email-btn"
            size="sm"
            variant="outline"
            onClick={onSendEmail}
            className="h-8 min-w-[80px] flex-1 gap-1.5 border-violet-700 text-xs text-violet-400 hover:bg-violet-900/20"
          >
            <Send className="h-3.5 w-3.5" />
            {t("leads.email.send")}
          </Button>
        )}
        {onCloseConfirm && (lead.status as LeadStatus) !== "Closed" && (
          <Button
            id="drawer-close-lead-btn"
            size="sm"
            variant="outline"
            onClick={onCloseConfirm}
            disabled={isDeletingLead}
            className="h-8 gap-1.5 border-zinc-700 text-xs text-zinc-500 hover:border-red-900 hover:bg-red-900/10 hover:text-red-400"
          >
            {isDeletingLead ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <XCircle className="h-3.5 w-3.5" />
            )}
            {t("leads.actions.close")}
          </Button>
        )}
      </div>
    </div>
  );
}
