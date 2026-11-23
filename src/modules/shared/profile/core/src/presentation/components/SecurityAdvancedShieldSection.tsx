"use client";

/**
 * SecurityAdvancedShieldSection
 *
 * Sovereign Enterprise Trusted IP CIDR Perimeter Allowlist Manager &
 * Emergency Nuclear Account Lockdown Shield for B2B Administrators.
 */
import { useState } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { SectionInfoPopover } from "./SectionInfoPopover";
import { TrustedCidrAddForm } from "./TrustedCidrAddForm";
import { TrustedCidrSubnetRow } from "./TrustedCidrSubnetRow";
import { EmergencyLockdownShieldCard } from "./EmergencyLockdownShieldCard";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@core/ui/card";
import { Button } from "@core/ui/button";
import { Badge } from "@core/ui/badge";
import { toast } from "@core/ui/sileo-toast";
import {
  isConcurrencyConflictError,
  resolveProfileSaveErrorMessage,
} from "../utils/concurrency";
import { isSudoCancelledError } from "../utils/sudoElevation";
import {
  type SubnetEntry,
  parseInitialCidrs,
  serializeCidrs,
  formatCurrentIpAsCidr,
  normalizeAndValidateCidr,
} from "../utils/cidr-allowlist.utils";
import { Globe, CheckCircle2, Network, Loader2, Info } from "lucide-react";

const SUBNET_ERROR_KEYS = {
  empty: "profile.security.cidrEmptyError",
  format: "profile.security.cidrFormatError",
  duplicate: "profile.security.cidrDuplicateError",
} as const;

/**
 * Props for {@link SecurityAdvancedShieldSection}.
 */
export interface SecurityAdvancedShieldSectionProps {
  /** Persisted CIDR strings (`"CIDR"` or `"CIDR#Label"`). */
  trustedCidrs: string[];
  /** Gateway-reported IP address of the active workstation, if available. */
  currentClientIp?: string | null;
  /** Optimistic concurrency row version token for policy updates. */
  rowVersion?: string;
  /** Mutation handler to persist updated CIDR allowlist entries. */
  onUpdatePolicy: (payload: {
    trustedCidrs?: string[];
    rowVersion?: string;
  }) => Promise<unknown>;
  /** Indicates whether a policy update mutation is currently in flight. */
  isUpdatingPolicy: boolean;
  /** Server-side policy update error, if the last save failed. */
  policyError?: unknown;
  /** Opens the emergency account lockdown confirmation dialog. */
  onOpenLockdown: () => void;
}

/**
 * Renders the enterprise trusted IP CIDR perimeter allowlist manager
 * and emergency nuclear account lockdown trigger card.
 */
export function SecurityAdvancedShieldSection({
  trustedCidrs,
  currentClientIp,
  rowVersion,
  onUpdatePolicy,
  isUpdatingPolicy,
  policyError,
  onOpenLockdown,
}: SecurityAdvancedShieldSectionProps) {
  const { t } = useI18n();

  const [subnets, setSubnets] = useState<SubnetEntry[]>(() =>
    parseInitialCidrs(trustedCidrs)
  );
  const [newCidr, setNewCidr] = useState("");
  const [newLabel, setNewLabel] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [ignoreExternalPolicyError, setIgnoreExternalPolicyError] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [savedNotice, setSavedNotice] = useState(false);

  const [prevTrustedCidrs, setPrevTrustedCidrs] = useState(trustedCidrs);
  if (prevTrustedCidrs !== trustedCidrs) {
    setPrevTrustedCidrs(trustedCidrs);
    setSubnets(parseInitialCidrs(trustedCidrs));
  }

  const [prevPolicyError, setPrevPolicyError] = useState(policyError);
  if (prevPolicyError !== policyError) {
    setPrevPolicyError(policyError);
    setIgnoreExternalPolicyError(false);
  }

  const resolvedClientIp =
    currentClientIp && currentClientIp.trim().toLowerCase() !== "unknown"
      ? currentClientIp.trim()
      : null;
  const detectedIpCidr = resolvedClientIp ? formatCurrentIpAsCidr(resolvedClientIp) : null;

  const hasUnsavedChanges =
    JSON.stringify(serializeCidrs(subnets)) !== JSON.stringify(trustedCidrs);

  const clearErrors = () => {
    setValidationError(null);
    setSaveError(null);
    setIgnoreExternalPolicyError(true);
  };

  const handleAddSubnet = () => {
    clearErrors();
    const result = normalizeAndValidateCidr(newCidr, subnets);
    if (!result.ok) {
      setValidationError(t(SUBNET_ERROR_KEYS[result.reason]));
      return;
    }

    setSubnets((prev) => [
      ...prev,
      { cidr: result.cidr, label: newLabel.trim() || undefined },
    ]);
    setNewCidr("");
    setNewLabel("");
  };

  const handleCopy = async (cidr: string, index: number) => {
    try {
      await navigator.clipboard.writeText(cidr);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 1800);
    } catch {
      // Clipboard fallback
    }
  };

  const handleUseCurrentIp = () => {
    clearErrors();
    if (!detectedIpCidr) {
      setValidationError(t("profile.security.noIpDetectedNotice"));
      return;
    }
    const result = normalizeAndValidateCidr(detectedIpCidr, subnets);
    if (!result.ok) {
      setValidationError(t(SUBNET_ERROR_KEYS[result.reason]));
      return;
    }
    setSubnets((prev) => [
      ...prev,
      { cidr: result.cidr, label: t("profile.security.currentWorkstationLabel") },
    ]);
    toast.success(t("profile.security.currentIpAddedNotice", { cidr: result.cidr }));
  };

  const handleSavePolicy = async () => {
    setValidationError(null);
    setSaveError(null);
    setIgnoreExternalPolicyError(false);
    try {
      await onUpdatePolicy({ trustedCidrs: serializeCidrs(subnets), rowVersion });
      setSavedNotice(true);
      setTimeout(() => setSavedNotice(false), 2500);
    } catch (error: unknown) {
      if (isSudoCancelledError(error)) return;
      const message = resolveProfileSaveErrorMessage(error, t);
      setSaveError(message);
      if (isConcurrencyConflictError(error)) {
        toast.warning(message);
      } else {
        toast.error(message);
      }
    }
  };

  return (
    <div className="space-y-4">
      <Card
        data-testid="trusted-cidr-shield-card"
        className="border border-nx-line bg-nx-surface hover:border-nx-line-hi transition-colors"
      >
        <CardHeader className="pb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-nx-accent" style={{ minWidth: 16, minHeight: 16 }} />
              <CardTitle className="text-base font-bold text-nx-ink">
                {t("profile.security.trustedCidrsLabel")}
              </CardTitle>
              <SectionInfoPopover i18nPrefix="profile.infoPopover.trustedCidr" />
            </div>
            <CardDescription className="text-xs text-nx-ink-2 mt-0.5">
              {t("profile.security.cidrAllowlistDesc")}
            </CardDescription>
          </div>

          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="border-nx-line text-nx-ink-2 text-xs font-mono py-0.5 px-2"
            >
              {subnets.length} {t("profile.security.cidrsConfiguredCount")}
            </Badge>
            {hasUnsavedChanges && (
              <Badge className="bg-warning/15 text-warning border border-warning/30 text-[10px] font-semibold">
                {t("profile.security.unsavedChangesBadge")}
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {subnets.length === 0 ? (
            <Card className="p-6 border border-nx-line bg-nx-raised text-center space-y-2">
              <Network className="h-6 w-6 text-nx-accent mx-auto" />
              <p className="text-xs font-semibold text-nx-ink">
                {t("profile.security.noCidrsTitle")}
              </p>
              <p className="text-[11px] text-nx-ink-3 max-w-sm mx-auto">
                {t("profile.security.noCidrsDesc")}
              </p>
            </Card>
          ) : (
            <div className="space-y-2">
              {subnets.map((sub, idx) => (
                <TrustedCidrSubnetRow
                  key={`${sub.cidr}-${idx}`}
                  subnet={sub}
                  index={idx}
                  isCopied={copiedIndex === idx}
                  onCopy={(cidr, index) => void handleCopy(cidr, index)}
                  onRemove={(index) => {
                    clearErrors();
                    setSubnets((prev) => prev.filter((_, i) => i !== index));
                  }}
                />
              ))}
            </div>
          )}

          <TrustedCidrAddForm
            newCidr={newCidr}
            newLabel={newLabel}
            detectedIpCidr={detectedIpCidr}
            validationError={validationError ?? saveError}
            policyError={ignoreExternalPolicyError ? null : policyError}
            onCidrChange={(value) => {
              setNewCidr(value);
              clearErrors();
            }}
            onLabelChange={setNewLabel}
            onUseCurrentIp={handleUseCurrentIp}
            onAddSubnet={handleAddSubnet}
          />

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2 border-t border-nx-line">
            <div className="flex items-center gap-1.5 text-xs text-nx-ink-3">
              <Info className="h-3.5 w-3.5 text-nx-accent shrink-0" />
              <span>{t("profile.security.cidrAllowlistNotice")}</span>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              {savedNotice && (
                <span className="text-xs text-success flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  {t("profile.common.saved")}
                </span>
              )}
              <Button
                type="button"
                size="sm"
                onClick={handleSavePolicy}
                disabled={isUpdatingPolicy || !hasUnsavedChanges}
                data-testid="save-security-shield-btn"
                className="h-8 text-xs font-semibold bg-nx-accent-fill text-nx-on-fill gap-1.5"
              >
                {isUpdatingPolicy && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                <span>{t("profile.common.saveChanges")}</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <EmergencyLockdownShieldCard onOpenLockdown={onOpenLockdown} />
    </div>
  );
}
