"use client";

import { useI18n } from "@core/providers/i18n-provider";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
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
  /** Current client validation error string, if any. */
  validationError: string | null;
  /** Optional server-side policy update error object. */
  policyError?: unknown;
  /** Handler to update the CIDR input and clear client validation errors. */
  onCidrChange: (value: string) => void;
  /** Handler to update the optional subnet label. */
  onLabelChange: (value: string) => void;
  /** Quick-fill callback that populates the caller's current workstation IP. */
  onUseCurrentIp: () => void;
  /** Callback to validate and append the new subnet to the pending list. */
  onAddSubnet: () => void;
}

/**
 * Interactive subnet entry form with quick-fill current IP support and live error reporting.
 */
export function TrustedCidrAddForm({
  newCidr,
  newLabel,
  validationError,
  policyError,
  onCidrChange,
  onLabelChange,
  onUseCurrentIp,
  onAddSubnet,
}: TrustedCidrAddFormProps) {
  const { t } = useI18n();

  return (
    <div className="p-4 rounded-xl border border-nx-line bg-nx-raised space-y-3">
      <div className="flex items-center justify-between">
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
          className="h-7 text-[10px] font-semibold border-nx-line text-nx-ink-2 hover:text-nx-ink gap-1"
        >
          <Laptop className="h-3 w-3 text-nx-accent" />
          <span>{t("profile.security.useCurrentIpBtn")}</span>
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

      {(validationError || Boolean(policyError)) && (
        <div
          data-testid="cidr-validation-error-banner"
          className="p-2.5 rounded-lg border border-destructive/40 bg-destructive/10 text-destructive text-xs flex items-center gap-2"
        >
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>
            {validationError ?? resolveProfileSaveErrorMessage(policyError, t)}
          </span>
        </div>
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
    </div>
  );
}
