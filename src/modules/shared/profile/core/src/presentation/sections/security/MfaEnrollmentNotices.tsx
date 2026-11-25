"use client";

import { Alert, AlertDescription } from "@core/ui/alert";
import { AlertCircle, Lock } from "lucide-react";

/** Props for mandatory MFA enrollment notice banners. */
export interface MfaEnrollmentNoticeProps {
  t: (key: string) => string;
}

/**
 * Warning banner informing users that workspace policy mandates enrolling 2FA or a passkey
 * before navigating to other protected routes.
 */
export function MfaEnrollmentRequiredBanner({ t }: MfaEnrollmentNoticeProps) {
  return (
    <Alert variant="warning" data-testid="mfa-enrollment-required-banner">
      <AlertCircle className="h-4 w-4" aria-hidden="true" />
      <AlertDescription className="space-y-0.5 text-xs text-nx-ink">
        <p className="font-semibold">{t("profile.security.mfaEnrollRequiredTitle")}</p>
        <p className="text-nx-ink-2">{t("profile.security.mfaEnrollRequiredDesc")}</p>
      </AlertDescription>
    </Alert>
  );
}

/**
 * Informational notice rendered inside the MFA enrollment wall explaining which non-enrollment
 * security controls unlock once MFA setup completes.
 */
export function MfaLockedControlsNotice({ t }: MfaEnrollmentNoticeProps) {
  return (
    <Alert variant="default" data-testid="mfa-enroll-locked-controls-notice">
      <Lock className="h-4 w-4" aria-hidden="true" />
      <AlertDescription className="space-y-1 text-xs">
        <p className="font-semibold text-nx-ink">{t("profile.security.mfaEnrollLockedControlsTitle")}</p>
        <p className="text-nx-ink-2">{t("profile.security.mfaEnrollLockedControlsDesc")}</p>
      </AlertDescription>
    </Alert>
  );
}
