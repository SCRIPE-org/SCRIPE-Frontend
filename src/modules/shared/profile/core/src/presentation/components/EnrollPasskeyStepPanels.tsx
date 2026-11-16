"use client";

import type { ComponentType } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { DialogFooter } from "@core/ui/dialog";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { Badge } from "@core/ui/badge";
import { AlertCircle, Loader2, Fingerprint, Sparkles, QrCode, KeyRound, ArrowRight } from "lucide-react";
import type { AuthenticatorMode, ClientDeviceDetection } from "../../domain/entities/PasskeyCredential";

/** Option descriptor for a WebAuthn passkey authenticator tier. */
export interface PasskeyOptionItem {
  /** Authenticator attachment mode identifier. */
  id: AuthenticatorMode;
  /** Localized option title. */
  title: string;
  /** Short protocol/transport subtitle badge. */
  subtitle: string;
  /** Localized option description. */
  description: string;
  /** Icon component for the tier. */
  icon: ComponentType<{ className?: string; style?: React.CSSProperties }>;
  /** Suggested default friendly credential name. */
  defaultName: string;
  /** Whether client capability detection recommends this tier. */
  isRecommended: boolean;
}

/** Props for {@link EnrollPasskeySelectStep}. */
export interface EnrollPasskeySelectStepProps {
  /** Detected client platform capabilities, if resolved. */
  deviceInfo: ClientDeviceDetection | null;
  /** Available authenticator mode options. */
  options: PasskeyOptionItem[];
  /** Selects an authenticator option and advances to naming step. */
  onSelectOption: (opt: PasskeyOptionItem) => void;
  /** Closes and resets the enrollment dialog. */
  onCancel: () => void;
}

/**
 * Step 1 of passkey enrollment showing station biometrics telemetry and authenticator tiers.
 */
export function EnrollPasskeySelectStep({
  deviceInfo,
  options,
  onSelectOption,
  onCancel,
}: EnrollPasskeySelectStepProps) {
  const { t } = useI18n();

  return (
    <>
      {deviceInfo && (
        <div className="flex items-center justify-between p-3 rounded-xl border border-nx-line bg-nx-raised text-xs">
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-lg bg-nx-surface border border-nx-line flex items-center justify-center text-nx-ink-2">
              <Fingerprint className="h-4 w-4 text-nx-accent" />
            </div>
            <div>
              <span className="text-nx-ink-3 text-[10px] block">
                {t("profile.passkeys.detectedStationLabel")}
              </span>
              <span className="font-semibold text-nx-ink text-xs">{deviceInfo.deviceLabel}</span>
            </div>
          </div>
          {deviceInfo.isPlatformAvailable ? (
            <Badge className="bg-success/15 text-success border border-success/30 text-[10px] font-semibold py-0.5 px-2">
              {t("profile.passkeys.biometricsReadyBadge")}
            </Badge>
          ) : (
            <Badge variant="outline" className="border-nx-line text-nx-ink-3 text-[10px]">
              {t("profile.passkeys.fidoSupportedBadge")}
            </Badge>
          )}
        </div>
      )}

      <div className="space-y-3 py-2">
        {options.map((opt) => {
          const Icon = opt.icon;
          return (
            <Button
              key={opt.id}
              type="button"
              variant="outline"
              data-testid={`passkey-option-${opt.id}`}
              onClick={() => onSelectOption(opt)}
              className="w-full h-auto text-start p-3.5 rounded-xl border border-nx-line hover:border-nx-accent/60 bg-nx-raised hover:bg-nx-raised/80 transition-all flex items-start justify-start gap-3.5 group cursor-pointer whitespace-normal relative"
            >
              <div className="p-2.5 rounded-lg border border-nx-line bg-nx-surface text-nx-ink group-hover:text-nx-accent transition-colors shrink-0">
                <Icon className="h-5 w-5" style={{ minWidth: 20, minHeight: 20 }} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-nx-ink group-hover:text-nx-accent transition-colors">
                      {opt.title}
                    </span>
                    {opt.isRecommended && (
                      <Badge className="bg-nx-accent-wash text-nx-accent border border-nx-accent/40 text-[9px] font-semibold py-0 px-1.5 flex items-center gap-1">
                        <Sparkles className="h-2.5 w-2.5" />
                        <span>{t("profile.passkeys.recommendedBadge")}</span>
                      </Badge>
                    )}
                  </div>
                  <span className="text-[10px] font-mono text-nx-ink-3 px-1.5 py-0.5 rounded bg-nx-surface border border-nx-line shrink-0">
                    {opt.subtitle}
                  </span>
                </div>
                <p className="text-[11px] text-nx-ink-2 mt-1 leading-relaxed font-normal">
                  {opt.description}
                </p>
              </div>
            </Button>
          );
        })}
      </div>

      <DialogFooter>
        <Button variant="outline" size="sm" onClick={onCancel} className="text-xs">
          {t("profile.common.cancel")}
        </Button>
      </DialogFooter>
    </>
  );
}

/** Props for {@link EnrollPasskeyNameStep}. */
export interface EnrollPasskeyNameStepProps {
  /** Selected authenticator attachment mode. */
  selectedMode: AuthenticatorMode;
  /** Controlled friendly credential name input. */
  deviceName: string;
  /** True while WebAuthn enrollment ceremony is active. */
  isEnrolling: boolean;
  /** Enrollment error message returned from backend/WebAuthn API, if any. */
  enrollError: string | null;
  /** Updates the friendly device name. */
  onDeviceNameChange: (value: string) => void;
  /** Returns to the authenticator selection step. */
  onBack: () => void;
  /** Initiates the browser WebAuthn registration ceremony. */
  onActivate: () => void;
}

/**
 * Step 2 of passkey enrollment for naming the credential and triggering WebAuthn registration.
 */
export function EnrollPasskeyNameStep({
  selectedMode,
  deviceName,
  isEnrolling,
  enrollError,
  onDeviceNameChange,
  onBack,
  onActivate,
}: EnrollPasskeyNameStepProps) {
  const { t } = useI18n();

  return (
    <>
      <div className="space-y-4 py-4">
        <div className="space-y-1.5">
          <Label htmlFor="passkey-name" className="text-xs font-semibold text-nx-ink">
            {t("profile.passkeys.deviceNameLabel")}
          </Label>
          <Input
            id="passkey-name"
            data-testid="passkey-name-input"
            value={deviceName}
            onChange={(e) => onDeviceNameChange(e.target.value)}
            placeholder={t("profile.passkeys.namePlaceholder")}
            className="text-xs h-9 bg-nx-raised border-nx-line text-nx-ink"
            disabled={isEnrolling}
            autoFocus
          />
        </div>

        {enrollError && (
          <div
            data-testid="passkey-enroll-error-banner"
            className="p-3 rounded-lg border border-destructive/40 bg-destructive/10 text-destructive text-xs flex items-start gap-2.5"
          >
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" style={{ minWidth: 16, minHeight: 16 }} />
            <div className="space-y-1 flex-1">
              <span className="font-semibold block">{t("profile.passkeys.enrollFailedNotice")}</span>
              <span className="text-[11px] leading-relaxed block opacity-90">{enrollError}</span>
            </div>
          </div>
        )}

        <div className="rounded-xl border border-nx-line bg-nx-raised p-3.5 space-y-2">
          <div className="flex items-center gap-2">
            {isEnrolling ? (
              <Loader2 className="h-4 w-4 animate-spin text-nx-accent" />
            ) : selectedMode === "platform" ? (
              <Fingerprint className="h-4 w-4 text-nx-accent" />
            ) : selectedMode === "hybrid" ? (
              <QrCode className="h-4 w-4 text-nx-accent" />
            ) : (
              <KeyRound className="h-4 w-4 text-nx-accent" />
            )}
            <span className="text-xs font-semibold text-nx-ink">
              {isEnrolling
                ? t("profile.passkeys.waitingForTouchPrompt")
                : t("profile.passkeys.readyToActivateTitle")}
            </span>
          </div>
          <p className="text-[11px] text-nx-ink-2 leading-relaxed">
            {selectedMode === "platform"
              ? t("profile.passkeys.touchPromptNotice")
              : selectedMode === "hybrid"
              ? t("profile.passkeys.hybridPromptNotice")
              : t("profile.passkeys.hardwareKeyPromptNotice")}
          </p>
        </div>
      </div>

      <DialogFooter className="gap-2 sm:gap-0">
        <Button variant="outline" size="sm" onClick={onBack} disabled={isEnrolling} className="text-xs">
          {t("profile.common.back")}
        </Button>
        <Button
          size="sm"
          data-testid="passkey-activate-btn"
          onClick={onActivate}
          disabled={isEnrolling || !deviceName.trim()}
          className="text-xs font-semibold gap-1.5 bg-nx-accent-fill text-nx-on-fill"
        >
          {isEnrolling ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              <span>{t("profile.passkeys.enrollingProgress")}</span>
            </>
          ) : (
            <>
              <span>{t("profile.passkeys.activatePasskeyBtn")}</span>
              <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" />
            </>
          )}
        </Button>
      </DialogFooter>
    </>
  );
}
