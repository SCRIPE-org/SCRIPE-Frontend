"use client";

/**
 * SudoVerificationModal
 *
 * Canonical policy-aware Step-Up Sudo Verification modal that respects
 * `mandatoryFactorPolicy` & `availableMethods` and resolves queued
 * `403 Identity.SudoRequired` retries on verification.
 */
import { useEffect, useState } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { useSudoStore, type SudoFactorMethod } from "@core/store/useSudoStore";
import { useSudoViewModel } from "../viewmodels/useSovereignAccountSlicesViewModel";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@core/ui/dialog";
import { Button } from "@core/ui/button";
import { Badge } from "@core/ui/badge";
import { Alert, AlertDescription } from "@core/ui/alert";
import { Skeleton } from "@core/ui/skeleton";
import { SectionInfoPopover } from "./SectionInfoPopover";
import { SudoFactorPanels } from "./SudoFactorPanels";
import { computeAllowedFactors, resolveSudoErrorMessage } from "../utils/sudo-factors.utils";
import { Loader2, ShieldCheck, ShieldAlert } from "lucide-react";

export { computeAllowedFactors };

/**
 * Policy-aware modal orchestrating step-up sudo re-authentication via Passkey, TOTP, or Password.
 */
export function SudoVerificationModal() {
  const { t } = useI18n();
  const modalOpen = useSudoStore((s) => s.modalOpen);
  const availableMethods = useSudoStore((s) => s.availableMethods);
  const mandatoryFactorPolicy = useSudoStore((s) => s.mandatoryFactorPolicy);
  const allowsPasswordFallback = useSudoStore((s) => s.allowsPasswordFallback);
  const isOnDemandChallenge = useSudoStore((s) => s.isOnDemandChallenge);
  const storeError = useSudoStore((s) => s.error);
  const closeModal = useSudoStore((s) => s.closeModal);
  const setError = useSudoStore((s) => s.setError);
  const { refreshStatus, verifyWithPasskey, verifyWithTotp, verifyWithPassword } =
    useSudoViewModel();

  const [isLoadingStatus, setIsLoadingStatus] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFactor, setSelectedFactor] = useState<SudoFactorMethod>("passkey");
  const [totpCode, setTotpCode] = useState("");
  const [password, setPassword] = useState("");

  const [prevModalOpen, setPrevModalOpen] = useState(false);
  if (modalOpen !== prevModalOpen) {
    setPrevModalOpen(modalOpen);
    if (modalOpen) {
      setIsLoadingStatus(true);
      setTotpCode("");
      setPassword("");
    }
  }

  useEffect(() => {
    if (!modalOpen) return;
    let active = true;
    setError(null);

    refreshStatus().finally(() => {
      if (active) {
        setIsLoadingStatus(false);
      }
    });

    return () => {
      active = false;
    };
  }, [modalOpen, refreshStatus, setError]);

  const allowedFactors = computeAllowedFactors(
    mandatoryFactorPolicy,
    availableMethods,
    allowsPasswordFallback
  );

  const effectiveFactor = allowedFactors.includes(selectedFactor)
    ? selectedFactor
    : (allowedFactors[0] ?? selectedFactor);

  const policyLabel =
    mandatoryFactorPolicy === "PasskeyRequired"
      ? t("profile.sudo.policyPasskeyRequired")
      : mandatoryFactorPolicy === "TwoFactorRequired"
      ? t("profile.sudo.policyTwoFactorRequired")
      : t("profile.sudo.policyStandard");

  const handleVerify = async (action: () => Promise<unknown>, onSuccessReset?: () => void) => {
    setError(null);
    setIsSubmitting(true);
    try {
      await action();
      onSuccessReset?.();
    } catch (err) {
      setError(resolveSudoErrorMessage(err, t));
    } finally {
      setIsSubmitting(false);
    }
  };

  const canSubmit =
    !isSubmitting &&
    !isLoadingStatus &&
    allowedFactors.length > 0 &&
    (effectiveFactor === "passkey" ||
      (effectiveFactor === "totp" && totpCode.trim().length >= 6) ||
      (effectiveFactor === "password" && password.length > 0));

  const executeActiveFactor = () => {
    if (effectiveFactor === "passkey") {
      return void handleVerify(() => verifyWithPasskey());
    }
    if (effectiveFactor === "totp") {
      const cleaned = totpCode.trim();
      if (!cleaned) return;
      return void handleVerify(() => verifyWithTotp(cleaned), () => setTotpCode(""));
    }
    if (!password) return;
    return void handleVerify(() => verifyWithPassword(password), () => setPassword(""));
  };

  return (
    <Dialog open={modalOpen} onOpenChange={(nextOpen) => (!nextOpen ? closeModal() : undefined)}>
      <DialogContent
        data-testid="sudo-verification-modal"
        className="sm:max-w-[460px] border-nx-line bg-nx-surface text-nx-ink p-6"
      >
        <DialogHeader className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="h-9 w-9 rounded-nx-lg bg-nx-accent-wash border border-nx-accent/30 text-nx-accent flex items-center justify-center shrink-0">
                <ShieldCheck className="h-4 w-4" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <DialogTitle className="text-base font-bold text-nx-ink truncate">
                    {t("profile.sudo.modalTitle")}
                  </DialogTitle>
                  <SectionInfoPopover i18nPrefix="profile.infoPopover.biometricSudo" />
                </div>
                <Badge
                  variant="outline"
                  data-testid="sudo-policy-badge"
                  className="text-[10px] border-nx-line text-nx-ink-2 mt-1"
                >
                  {policyLabel}
                </Badge>
              </div>
            </div>
          </div>

          <DialogDescription className="text-xs text-nx-ink-2 leading-relaxed">
            {isOnDemandChallenge
              ? t("profile.sudo.onDemandBanner")
              : t("profile.sudo.modalDescription")}
          </DialogDescription>
        </DialogHeader>

        {isLoadingStatus ? (
          <div className="space-y-3 py-4" data-testid="sudo-modal-loading">
            <Skeleton className="h-9 w-full rounded-nx-md" />
            <Skeleton className="h-28 w-full rounded-nx-lg" />
          </div>
        ) : allowedFactors.length === 0 ? (
          <Alert variant="warning" className="my-3">
            <ShieldAlert className="h-4 w-4 shrink-0" aria-hidden="true" />
            <AlertDescription className="text-xs">
              {t(
                mandatoryFactorPolicy === "TwoFactorRequired"
                  ? "profile.sudo.noTwoFactorEnrolledHint"
                  : "profile.sudo.noPasskeyEnrolledHint"
              )}
            </AlertDescription>
          </Alert>
        ) : (
          <SudoFactorPanels
            allowedFactors={allowedFactors}
            selectedFactor={effectiveFactor}
            totpCode={totpCode}
            password={password}
            isSubmitting={isSubmitting}
            canSubmit={canSubmit}
            storeError={storeError}
            onSelectFactor={(factor) => {
              setSelectedFactor(factor);
              setError(null);
            }}
            onTotpChange={setTotpCode}
            onPasswordChange={setPassword}
            onSubmitActiveFactor={executeActiveFactor}
          />
        )}

        <DialogFooter className="gap-2 sm:gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={closeModal}
            disabled={isSubmitting}
            className="text-xs border-nx-line"
          >
            {t("profile.common.cancel")}
          </Button>
          <Button
            type="button"
            size="sm"
            data-testid="sudo-verify-submit-btn"
            onClick={executeActiveFactor}
            disabled={!canSubmit}
            className="text-xs font-semibold gap-1.5 bg-nx-accent-fill text-nx-on-fill"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                <span>{t("profile.sudo.verifying")}</span>
              </>
            ) : (
              <span>{t("profile.sudo.verifyNow")}</span>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
