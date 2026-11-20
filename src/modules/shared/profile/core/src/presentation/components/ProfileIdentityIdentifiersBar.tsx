"use client";

import { useI18n } from "@core/providers/i18n-provider";
import { Button } from "@core/ui/button";
import { Badge } from "@core/ui/badge";
import { Send, Mail, AtSign } from "lucide-react";
import type { AdminProfile } from "../../domain/entities/AdminProfile";

/**
 * Props for {@link ProfileIdentityIdentifiersBar}.
 */
export interface ProfileIdentityIdentifiersBarProps {
  /** Current administrator profile containing email, username, and verification status. */
  profile: AdminProfile;
  /** Optional handler to resend email verification link. */
  onSendEmailVerification?: () => Promise<unknown>;
  /** Indicates whether an email verification request is in flight. */
  isSendingVerification?: boolean;
  /** True after an email verification email has been dispatched. */
  verificationSent?: boolean;
  /** Opens the step-up identity change modal for email or username. */
  onOpenIdentityModal?: (mode: "email" | "username") => void;
}

/**
 * Verified identity bar displaying primary email and username with verification
 * badges and step-up change modal triggers.
 */
export function ProfileIdentityIdentifiersBar({
  profile,
  onSendEmailVerification,
  isSendingVerification,
  verificationSent,
  onOpenIdentityModal,
}: ProfileIdentityIdentifiersBarProps) {
  const { t } = useI18n();

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-3.5 min-w-0">
      <div className="rounded-xl border border-nx-line bg-nx-ground p-3.5 flex flex-wrap items-center justify-between gap-3 min-w-0">
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <Mail className="h-3.5 w-3.5 text-nx-accent shrink-0" style={{ minWidth: 14, minHeight: 14 }} />
            <span className="text-xs font-medium text-nx-ink-2">{t("profile.email")}</span>
            {profile.isEmailVerified ? (
              <Badge variant="outline" className="border-success/30 text-success text-[10px] py-0 px-1.5">
                {t("profile.verified")}
              </Badge>
            ) : (
              <Badge variant="outline" className="border-warning/30 text-warning text-[10px] py-0 px-1.5">
                {t("profile.unverified")}
              </Badge>
            )}
          </div>
          <p className="text-sm font-mono font-semibold text-nx-ink truncate" data-testid="dossier-email-value">
            <bdi dir="ltr">{profile.email}</bdi>
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-1.5 shrink-0 max-w-full">
          {!profile.isEmailVerified && onSendEmailVerification && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => void onSendEmailVerification()}
              loading={isSendingVerification}
              disabled={verificationSent}
              className="h-7 text-xs"
            >
              <Send className="me-1 h-3 w-3" />
              {verificationSent ? t("profile.verificationSent") : t("profile.verifyEmail")}
            </Button>
          )}
          <Button
            type="button"
            variant="outline"
            size="sm"
            data-testid="open-change-email-btn"
            onClick={() => onOpenIdentityModal?.("email")}
            className="h-7 text-xs font-semibold"
          >
            {t("profile.changeEmailBtn")}
          </Button>
        </div>
      </div>

      <div className="rounded-xl border border-nx-line bg-nx-ground p-3.5 flex flex-wrap items-center justify-between gap-3 min-w-0">
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <AtSign className="h-3.5 w-3.5 text-nx-accent shrink-0" style={{ minWidth: 14, minHeight: 14 }} />
            <span className="text-xs font-medium text-nx-ink-2">{t("profile.username")}</span>
            <Badge variant="outline" className="border-nx-line text-nx-ink-3 text-[10px] py-0 px-1.5">
              {t("profile.stepUpProtectedBadge")}
            </Badge>
          </div>
          <p className="text-sm font-mono font-semibold text-nx-ink truncate" data-testid="dossier-username-value">
            <bdi dir="ltr">@{profile.username}</bdi>
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          data-testid="open-change-username-btn"
          onClick={() => onOpenIdentityModal?.("username")}
          className="h-7 text-xs font-semibold shrink-0"
        >
          {t("profile.changeUsernameBtn")}
        </Button>
      </div>
    </div>
  );
}
