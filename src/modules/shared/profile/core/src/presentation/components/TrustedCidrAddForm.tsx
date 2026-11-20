"use client";

import { useI18n } from "@core/providers/i18n-provider";
import { Button } from "@core/ui/button";
import { Card } from "@core/ui/card";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { Alert, AlertDescription } from "@core/ui/alert";
import { resolveProfileSaveErrorMessage } from "../utils/concurrency";
import { Plus, Laptop, AlertCircle } from "lucide-react";

/**
 * Props for {@link TrustedCidrAddForm}.
 */
export interface TrustedCidrAddFormProps {
  /** Controlled CIDR input value. */
  newCidr: string;
  /** Controlled friendly label input value. */
  newLabel: string;
  /** Normalized current workstation `/32` or `/128` CIDR when telemetry detected an IP. */
  detectedIpCidr?: string | null;
  /** Current client or save validation error string, if any. */
  validationError: string | null;
  /** Optional server-side policy update error object. */
  policyError?: unknown;
  /** Handler to update the CIDR input and clear validation errors. */
  onCidrChange: (value: string) => void;
  /** Handler to update the optional subnet label. */
  onLabelChange: (value: string) => void;
  /** Quick-add callback that appends the caller's current workstation IP CIDR. */
  onUseCurrentIp: () => void;
  /** Callback to validate and append the new subnet to the pending list. */
  onAddSubnet: () => void;
}

/**
 * Interactive subnet entry form with 1-click current IP (`/32`) quick-add and live backend/anti-lockout error reporting.
 */
export function TrustedCidrAddForm({
  newCidr,
  newLabel,
  detectedIpCidr,
  validationError,
  policyError,
  onCidrChange,
  onLabelChange,
  onUseCurrentIp,
  onAddSubnet,
}: TrustedCidrAddFormProps) {
  const { t } = useI18n();
  const displayError =
    validationError ?? (policyError ? resolveProfileSaveErrorMessage(policyError, t) : null);

  return (
    <Card className="p-4 border border-nx-line bg-nx-raised space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs font-bold text-nx-ink flex items-center gap-1.5">
          <Plus className="h-3.5 w-3.5 text-nx-accent" />
          {t("profile.security.addCidrSubnetTitle")}
        </span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          data-testid="use-current-ip-btn"
          onClick={onUseCurrentIp}
          className="h-7 text-[10px] font-semibold border-nx-line text-nx-ink-2 hover:text-nx-ink gap-1.5"
        >
          <Laptop className="h-3 w-3 text-nx-accent" />
          <span>
            {detectedIpCidr
              ? t("profile.security.addCurrentIpBtn", { cidr: detectedIpCidr })
              : t("profile.security.useCurrentIpBtn")}
          </span>
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label htmlFor="subnet-cidr" className="text-[11px] font-semibold text-nx-ink">
            {t("profile.security.cidrBlockLabel")} *
          </Label>
          <Input
            id="subnet-cidr"
            data-testid="subnet-cidr-input"
            value={newCidr}
            onChange={(e) => onCidrChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                onAddSubnet();
              }
            }}
            dir="ltr"
            placeholder={t("profile.passkeys.cidrPlaceholder")}
            className="h-8 text-xs font-mono bg-nx-surface border-nx-line text-nx-ink"
          />
          <p className="text-[11px] text-nx-ink-3">
            {t("profile.passkeys.cidrFormatHelper")}
          </p>
        </div>

        <div className="space-y-1">
          <Label htmlFor="subnet-label" className="text-[11px] font-semibold text-nx-ink">
            {t("profile.security.friendlyLabelOptional")}
          </Label>
          <Input
            id="subnet-label"
            data-testid="subnet-label-input"
            value={newLabel}
            onChange={(e) => onLabelChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                onAddSubnet();
              }
            }}
            placeholder={t("profile.security.friendlyLabelPlaceholder")}
            className="h-8 text-xs bg-nx-surface border-nx-line text-nx-ink"
          />
        </div>
      </div>

      {displayError && (
        <Alert
          variant="destructive"
          data-testid="cidr-validation-error-banner"
          className="border-destructive/40 bg-destructive/10 text-destructive py-2.5"
        >
          <AlertCircle className="h-4 w-4 shrink-0" />
          <AlertDescription className="text-xs">{displayError}</AlertDescription>
        </Alert>
      )}

      <Button
        type="button"
        size="sm"
        data-testid="append-subnet-btn"
        onClick={onAddSubnet}
        className="text-xs font-semibold gap-1.5 bg-nx-accent-fill text-nx-on-fill w-full sm:w-auto"
      >
        <Plus className="h-3.5 w-3.5" />
        <span>{t("profile.security.appendSubnetBtn")}</span>
      </Button>
    </Card>
  );
}
