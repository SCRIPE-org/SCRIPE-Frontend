"use client";

import { useI18n } from "@core/providers/i18n-provider";
import type { SudoFactorMethod } from "@core/store/useSudoStore";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { cn } from "@core/common/utils";
import { Fingerprint, Smartphone, KeyRound, AlertCircle, Loader2 } from "lucide-react";

/**
 * Props for {@link SudoFactorPanels}.
 */
export interface SudoFactorPanelsProps {
  /** Ordered list of verification factors permitted by active sudo policy. */
  allowedFactors: SudoFactorMethod[];
  /** Currently active verification tab factor. */
  selectedFactor: SudoFactorMethod;
  /** Controlled TOTP code value. */
  totpCode: string;
  /** Controlled current password value. */
  password: string;
  /** True while verification request is executing. */
  isSubmitting: boolean;
  /** True when the active input satisfies submission requirements. */
  canSubmit: boolean;
  /** Latest error message stored in the sudo verification store, if any. */
  storeError: string | null;
  /** Switches active verification factor and clears prior errors. */
  onSelectFactor: (factor: SudoFactorMethod) => void;
  /** Updates the TOTP input value. */
  onTotpChange: (value: string) => void;
  /** Updates the password input value. */
  onPasswordChange: (value: string) => void;
  /** Executes verification for the currently selected factor. */
  onSubmitActiveFactor: () => void;
}

/**
 * Renders policy-constrained factor selector tabs, active factor challenge panel,
 * and sudo verification error alert inside {@link SudoVerificationModal}.
 */
export function SudoFactorPanels({
  allowedFactors,
  selectedFactor,
  totpCode,
  password,
  isSubmitting,
  canSubmit,
  storeError,
  onSelectFactor,
  onTotpChange,
  onPasswordChange,
  onSubmitActiveFactor,
}: SudoFactorPanelsProps) {
  const { t } = useI18n();

  return (
    <div className="space-y-4 py-2">
      {allowedFactors.length > 1 && (
        <div
          role="tablist"
          aria-label={t("profile.sudo.modalTitle")}
          className="grid gap-1.5 p-1 rounded-nx-lg border border-nx-line bg-nx-raised"
          style={{ gridTemplateColumns: `repeat(${allowedFactors.length}, minmax(0, 1fr))` }}
        >
          {allowedFactors.map((factor) => {
            const active = selectedFactor === factor;
            return (
              <Button
                key={factor}
                type="button"
                role="tab"
                aria-selected={active}
                data-testid={`sudo-tab-${factor}`}
                variant={active ? "default" : "ghost"}
                size="sm"
                disabled={isSubmitting}
                onClick={() => onSelectFactor(factor)}
                className={cn(
                  "h-8 text-xs font-medium gap-1.5",
                  active
                    ? "bg-nx-accent-fill text-nx-on-fill"
                    : "text-nx-ink-2 hover:text-nx-ink"
                )}
              >
                {factor === "passkey" && (
                  <Fingerprint className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                )}
                {factor === "totp" && (
                  <Smartphone className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                )}
                {factor === "password" && (
                  <KeyRound className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                )}
                <span className="truncate">
                  {factor === "passkey"
                    ? t("profile.sudo.methodPasskey")
                    : factor === "totp"
                    ? t("profile.sudo.methodTotp")
                    : t("profile.sudo.methodPassword")}
                </span>
              </Button>
            );
          })}
        </div>
      )}

      {selectedFactor === "passkey" && (
        <div
          data-testid="sudo-panel-passkey"
          className="py-5 px-4 rounded-nx-lg border border-nx-line bg-nx-raised flex flex-col items-center text-center space-y-3"
        >
          <div className="h-14 w-14 rounded-2xl bg-nx-accent-wash border border-nx-accent/30 flex items-center justify-center text-nx-accent">
            {isSubmitting ? (
              <Loader2 className="h-7 w-7 animate-spin" aria-hidden="true" />
            ) : (
              <Fingerprint className="h-7 w-7" aria-hidden="true" />
            )}
          </div>
          <p className="text-xs text-nx-ink-2 max-w-xs leading-relaxed">
            {isSubmitting
              ? t("profile.sudo.promptSensor")
              : t("profile.sudo.clickToAuthenticate")}
          </p>
        </div>
      )}

      {selectedFactor === "totp" && (
        <div data-testid="sudo-panel-totp" className="space-y-2">
          <Label htmlFor="sudo-totp-input" className="text-xs font-semibold text-nx-ink">
            {t("profile.sudo.totpCodeLabel")}
          </Label>
          <Input
            id="sudo-totp-input"
            data-testid="sudo-totp-input"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={8}
            value={totpCode}
            onChange={(e) => onTotpChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && canSubmit) {
                e.preventDefault();
                onSubmitActiveFactor();
              }
            }}
            placeholder={t("profile.sudo.totpCodePlaceholder")}
            disabled={isSubmitting}
            className="bg-nx-raised border-nx-line text-nx-ink font-mono tracking-widest text-center text-base"
          />
        </div>
      )}

      {selectedFactor === "password" && (
        <div data-testid="sudo-panel-password" className="space-y-2">
          <Label htmlFor="sudo-password-input" className="text-xs font-semibold text-nx-ink">
            {t("profile.sudo.passwordLabel")}
          </Label>
          <Input
            id="sudo-password-input"
            data-testid="sudo-password-input"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => onPasswordChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && canSubmit) {
                e.preventDefault();
                onSubmitActiveFactor();
              }
            }}
            placeholder={t("profile.sudo.passwordPlaceholder")}
            disabled={isSubmitting}
            className="bg-nx-raised border-nx-line text-nx-ink text-sm"
          />
        </div>
      )}

      {storeError && (
        <div
          role="alert"
          data-testid="sudo-error-alert"
          className="p-3 rounded-nx-lg border border-destructive/40 bg-destructive/10 text-destructive text-xs flex items-start gap-2"
        >
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" aria-hidden="true" />
          <span>{storeError}</span>
        </div>
      )}
    </div>
  );
}
