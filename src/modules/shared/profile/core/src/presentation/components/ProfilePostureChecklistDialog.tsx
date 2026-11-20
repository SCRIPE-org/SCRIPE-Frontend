"use client";

/**
 * ProfilePostureChecklistDialog
 *
 * Guided Security Posture hardening checklist dialog and posture builder helper
 * extracted from `ProfileTelemetryHud`.
 */
import { useI18n } from "@core/providers/i18n-provider";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@core/ui/dialog";
import { CheckCircle2, Circle, ShieldCheck } from "lucide-react";
import type { AdminProfile } from "../../domain/entities/AdminProfile";
import type { SovereignAccountContext } from "../../domain/entities/SovereignAccountEntities";

/** Rendered checklist item in the Security Posture dialog. */
export interface PostureChecklistViewItem {
  key: string;
  label: string;
  weight: string;
  done: boolean;
  href: string;
}

/** Formats remaining Sudo countdown seconds into `MM:SS`. */
export function formatSudoRemainingTime(totalSeconds: number): string {
  const clamped = Math.max(0, Math.floor(totalSeconds));
  const mins = Math.floor(clamped / 60);
  const secs = clamped % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

/** Builds localized posture checklist rows from account context or profile state. */
export function buildPostureChecklistItems(
  accountContext: SovereignAccountContext | null | undefined,
  profile: AdminProfile | null | undefined,
  t: (key: string, params?: Record<string, string | number>) => string
): PostureChecklistViewItem[] {
  if (accountContext?.postureChecklist && accountContext.postureChecklist.length > 0) {
    return accountContext.postureChecklist.map((item) => ({
      key: item.key,
      label: item.labelKey.includes(".")
        ? t(item.labelKey, { defaultValue: item.labelKey })
        : item.labelKey,
      weight: item.weight > 0 ? `+${item.weight}%` : "",
      done: item.completed,
      href: item.targetRoute || "/account/security",
    }));
  }
  return [
    {
      key: "totp",
      label: t("profile.posture.totp"),
      weight: "+30%",
      done: Boolean(profile?.isTwoFactorEnabled),
      href: "/account/security",
    },
    {
      key: "email",
      label: t("profile.security.twoFaStep"),
      weight: "+20%",
      done: Boolean(profile?.email),
      href: "/account/dossier",
    },
    {
      key: "recovery",
      label: t("profile.posture.trustedCidr"),
      weight: "+15%",
      done: Boolean(profile?.phoneNumber),
      href: "/account/security",
    },
  ];
}

interface ProfilePostureChecklistDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  securityScore: number;
  items: PostureChecklistViewItem[];
  onNavigate: (href: string) => void;
}

/** Interactive Security Posture Hardening checklist modal dialog. */
export function ProfilePostureChecklistDialog({
  open,
  onOpenChange,
  securityScore,
  items,
  onNavigate,
}: ProfilePostureChecklistDialogProps) {
  const { t } = useI18n();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg border-nx-line bg-nx-surface text-nx-ink">
        <DialogHeader>
          <DialogTitle className="text-sm font-bold text-nx-ink flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-nx-accent" />
            <span>
              {t("profile.posture.dialogTitle")} ({securityScore}%)
            </span>
          </DialogTitle>
          <DialogDescription className="text-xs text-nx-ink-2">
            {t("profile.posture.dialogSubtitle")}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2 py-2">
          {items.map((item) => (
            <div
              key={item.key}
              className="flex items-center justify-between p-2.5 rounded-lg border border-nx-line bg-nx-raised"
            >
              <div className="flex items-center gap-2.5">
                {item.done ? (
                  <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                ) : (
                  <Circle className="h-4 w-4 text-nx-ink-3 shrink-0" />
                )}
                <span className="text-xs font-medium text-nx-ink">{item.label}</span>
              </div>
              <div className="flex items-center gap-2">
                {item.weight && (
                  <Badge
                    variant="outline"
                    className="text-[10px] font-mono border-nx-line text-nx-ink-2"
                  >
                    {item.weight}
                  </Badge>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onNavigate(item.href)}
                  className="h-7 text-xs text-nx-accent"
                >
                  {t("profile.posture.configure")}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
