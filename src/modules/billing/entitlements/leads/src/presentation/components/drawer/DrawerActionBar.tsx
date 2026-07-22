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

/**
 * Presentation UI component rendering the drawer action bar.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
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
    <div className="shrink-0 border-t border-border/60 bg-background/95 px-4 py-3 backdrop-blur-sm">
      <div className="flex flex-wrap gap-2">
        {onConvert && (
          <Button
            id="drawer-convert-btn"
            size="sm"
            onClick={() => onConvert(lead.id)}
            className="h-8 min-w-[100px] flex-1 gap-1.5 bg-success/80 text-xs font-semibold text-success hover:bg-success"
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
            className="h-8 min-w-[80px] flex-1 gap-1.5 border-info text-xs text-info hover:bg-info/20"
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
            className="h-8 min-w-[80px] flex-1 gap-1.5 border-primary text-xs text-primary hover:bg-primary/20"
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
            className="h-8 gap-1.5 border-border text-xs text-muted-foreground hover:border-destructive hover:bg-destructive/10 hover:text-destructive"
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
