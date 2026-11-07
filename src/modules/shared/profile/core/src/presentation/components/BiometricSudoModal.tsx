"use client";

/**
 * BiometricSudoModal
 *
 * Step-up Biometric Sudo Mode verification modal.
 * Challenges the user to verify their biometric passkey before executing
 * sensitive operations (emergency lockdown, API token generation, global revocation).
 */
import { useI18n } from "@core/providers/i18n-provider";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@core/ui/dialog";
import { Button } from "@core/ui/button";
import { Fingerprint, AlertCircle, Loader2, ShieldCheck } from "lucide-react";

interface BiometricSudoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerify: () => Promise<unknown>;
  isVerifying: boolean;
  error: string | null;
}

export function BiometricSudoModal({
  isOpen,
  onClose,
  onVerify,
  isVerifying,
  error,
}: BiometricSudoModalProps) {
  const { t } = useI18n();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[420px] bg-nx-surface border-nx-line p-6">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <div className="h-8 w-8 rounded-lg bg-nx-accent-wash text-nx-accent flex items-center justify-center">
              <ShieldCheck className="h-4 w-4" style={{ minWidth: 16, minHeight: 16 }} />
            </div>
            <DialogTitle className="text-base font-bold text-nx-ink">
              {t("profile.sudo.modalTitle")}
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-nx-ink-3">
            {t("profile.sudo.modalDescription")}
          </DialogDescription>
        </DialogHeader>

        <div className="py-6 flex flex-col items-center text-center space-y-4">
          <div className="h-16 w-16 rounded-2xl bg-nx-accent-wash border border-nx-accent/20 flex items-center justify-center text-nx-accent">
            {isVerifying ? (
              <Loader2 className="h-8 w-8 animate-spin" />
            ) : (
              <Fingerprint className="h-8 w-8" style={{ minWidth: 32, minHeight: 32 }} />
            )}
          </div>

          <p className="text-xs text-nx-ink-2 max-w-xs">
            {isVerifying
              ? t("profile.sudo.promptSensor")
              : t("profile.sudo.clickToAuthenticate")}
          </p>

          {error && (
            <div className="p-3 rounded-lg border border-destructive/40 bg-destructive/10 text-destructive text-xs flex items-center gap-2 w-full text-start">
              <AlertCircle className="h-4 w-4 shrink-0" style={{ minWidth: 16, minHeight: 16 }} />
              <span>{error}</span>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" size="sm" onClick={onClose} disabled={isVerifying} className="text-xs">
            {t("profile.common.cancel")}
          </Button>
          <Button
            size="sm"
            onClick={onVerify}
            disabled={isVerifying}
            className="text-xs font-semibold gap-1.5"
          >
            {isVerifying && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {t("profile.sudo.authenticateBtn")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
