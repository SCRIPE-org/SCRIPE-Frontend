"use client";

/**
 * SecurityAdvancedShieldSection
 *
 * Sovereign Enterprise Trusted IP CIDR Perimeter Allowlist Manager &
 * Emergency Nuclear Account Lockdown Shield for B2B Administrators.
 * Features:
 *   - Structured Subnet List with IPv4/IPv6 badges & friendly labels
 *   - Add / Append subnet form with live CIDR syntax validation
 *   - Copy CIDR to clipboard
 *   - Remove subnet item with dirty-state change tracking
 *   - "Current Workstation IP" quick-fill shortcut
 *   - Nuclear Emergency Lockdown Shield trigger
 */
import { useState, useEffect } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@core/ui/card";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { Badge } from "@core/ui/badge";
import { Label } from "@core/ui/label";
import { toast } from "@core/ui/sileo-toast";
import {
  isConcurrencyConflictError,
  resolveProfileSaveErrorMessage,
} from "../utils/concurrency";
import {
  Globe,
  ShieldAlert,
  ShieldX,
  CheckCircle2,
  Plus,
  Trash2,
  Copy,
  Check,
  AlertCircle,
  Network,
  Laptop,
  Loader2,
  Info,
} from "lucide-react";

interface SubnetEntry {
  cidr: string;
  label?: string;
}

interface SecurityAdvancedShieldSectionProps {
  trustedCidrs: string[];
  rowVersion?: string;
  onUpdatePolicy: (payload: {
    trustedCidrs?: string[];
    rowVersion?: string;
  }) => Promise<unknown>;
  isUpdatingPolicy: boolean;
  policyError?: unknown;
  onOpenLockdown: () => void;
}

// Helper to parse "CIDR" or "CIDR#Label"
function parseInitialCidrs(cidrs: string[]): SubnetEntry[] {
  return cidrs.map((item) => {
    const trimmed = item.trim();
    if (trimmed.includes("#")) {
      const [cidr, label] = trimmed.split("#");
      return { cidr: cidr.trim(), label: label.trim() };
    }
    return { cidr: trimmed };
  });
}

// Regex validation for IPv4 and IPv6 CIDRs
const IPV4_CIDR_REGEX =
  /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])(\/([0-9]|[1-2][0-9]|3[0-2]))?$/;
const IPV6_CIDR_REGEX =
  /^\s*((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))(\/([0-9]|[1-9][0-9]|1[0-1][0-9]|12[0-8]))?$/;

export function SecurityAdvancedShieldSection({
  trustedCidrs,
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
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [savedNotice, setSavedNotice] = useState(false);

  // Sync when prop updates
  useEffect(() => {
    setSubnets(parseInitialCidrs(trustedCidrs));
  }, [trustedCidrs]);

  const hasUnsavedChanges =
    JSON.stringify(subnets.map((s) => (s.label ? `${s.cidr}#${s.label}` : s.cidr))) !==
    JSON.stringify(trustedCidrs);

  const handleAddSubnet = () => {
    let clean = newCidr.trim();
    setValidationError(null);

    if (!clean) {
      setValidationError(t("profile.security.cidrEmptyError"));
      return;
    }

    // Auto-append /32 if user inputs single IPv4 without mask
    if (!clean.includes("/") && !clean.includes(":")) {
      clean = `${clean}/32`;
    }

    const isIpv4 = IPV4_CIDR_REGEX.test(clean);
    const isIpv6 = IPV6_CIDR_REGEX.test(clean);

    if (!isIpv4 && !isIpv6) {
      setValidationError(t("profile.security.cidrFormatError"));
      return;
    }

    if (subnets.some((s) => s.cidr.toLowerCase() === clean.toLowerCase())) {
      setValidationError(t("profile.security.cidrDuplicateError"));
      return;
    }

    setSubnets((prev) => [
      ...prev,
      {
        cidr: clean,
        label: newLabel.trim() || undefined,
      },
    ]);

    setNewCidr("");
    setNewLabel("");
  };

  const handleRemoveSubnet = (index: number) => {
    setSubnets((prev) => prev.filter((_, i) => i !== index));
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
    // Fill client's localhost / loopback or gateway placeholder
    setNewCidr("127.0.0.1/32");
    setNewLabel(t("profile.security.currentWorkstationLabel"));
    setValidationError(null);
  };

  const handleSavePolicy = async () => {
    setValidationError(null);
    const rawList = subnets.map((s) => (s.label ? `${s.cidr}#${s.label}` : s.cidr));
    try {
      await onUpdatePolicy({
        trustedCidrs: rawList,
        rowVersion,
      });
      setSavedNotice(true);
      setTimeout(() => setSavedNotice(false), 2500);
    } catch (error: unknown) {
      const message = resolveProfileSaveErrorMessage(error, t);
      setValidationError(message);
      if (isConcurrencyConflictError(error)) {
        toast.warning(message);
      } else {
        toast.error(message);
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* Enterprise Trusted IP CIDR Perimeter Allowlist */}
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
          {/* Subnet List */}
          {subnets.length === 0 ? (
            <div className="p-6 rounded-xl border border-nx-line bg-nx-raised text-center space-y-2">
              <Network className="h-6 w-6 text-nx-accent mx-auto" />
              <p className="text-xs font-semibold text-nx-ink">
                {t("profile.security.noCidrsTitle")}
              </p>
              <p className="text-[11px] text-nx-ink-3 max-w-sm mx-auto">
                {t("profile.security.noCidrsDesc")}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {subnets.map((sub, idx) => {
                const isIpv6 = sub.cidr.includes(":");
                return (
                  <div
                    key={`${sub.cidr}-${idx}`}
                    className="flex items-center justify-between p-3 rounded-xl border border-nx-line bg-nx-ground hover:border-nx-line-hi transition-colors gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-8 w-8 rounded-lg bg-nx-raised border border-nx-line flex items-center justify-center text-nx-ink-2 shrink-0">
                        <Network className="h-4 w-4 text-nx-accent" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-mono font-bold text-nx-ink select-all">
                            {sub.cidr}
                          </span>
                          <Badge
                            variant="outline"
                            className={`font-mono text-[9px] py-0 px-1.5 ${
                              isIpv6
                                ? "border-info/30 bg-info/10 text-info font-semibold"
                                : "border-nx-line text-nx-ink-3"
                            }`}
                          >
                            {isIpv6 ? "IPv6" : "IPv4"}
                          </Badge>
                          <Badge className="bg-success/15 text-success border border-success/30 text-[9px] font-semibold py-0 px-1.5 flex items-center gap-1">
                            <span className="h-1.5 w-1.5 rounded-full bg-success" />
                            <span>{t("profile.security.cidrAllowedStatus")}</span>
                          </Badge>
                        </div>
                        {sub.label && (
                          <p className="text-[11px] text-nx-ink-2 truncate mt-0.5">
                            {sub.label}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        data-testid={`copy-cidr-btn-${idx}`}
                        onClick={() => void handleCopy(sub.cidr, idx)}
                        className="h-8 w-8 p-0 text-nx-ink-3 hover:text-nx-ink"
                        title={t("profile.common.copy")}
                      >
                        {copiedIndex === idx ? (
                          <Check className="h-3.5 w-3.5 text-success" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        data-testid={`remove-cidr-btn-${idx}`}
                        onClick={() => handleRemoveSubnet(idx)}
                        className="h-8 w-8 p-0 text-destructive/70 hover:text-destructive hover:bg-destructive/10"
                        title={t("profile.common.delete")}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Add Subnet Form */}
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
                onClick={handleUseCurrentIp}
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
                  onChange={(e) => {
                    setNewCidr(e.target.value);
                    setValidationError(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddSubnet();
                    }
                  }}
                  placeholder="197.55.12.0/24 or 10.24.0.0/16"
                  className="h-8 text-xs font-mono bg-nx-surface border-nx-line text-nx-ink"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="subnet-label" className="text-[11px] font-semibold text-nx-ink">
                  {t("profile.security.friendlyLabelOptional")}
                </Label>
                <Input
                  id="subnet-label"
                  data-testid="subnet-label-input"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddSubnet();
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
              onClick={handleAddSubnet}
              className="text-xs font-semibold gap-1.5 bg-nx-accent-fill text-nx-on-fill w-full sm:w-auto"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>{t("profile.security.appendSubnetBtn")}</span>
            </Button>
          </div>

          {/* Save Changes Footer */}
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

      {/* Emergency Account Lockdown (Nuclear Shield) */}
      <Card className="border border-destructive/40 bg-destructive/5 hover:border-destructive/60 transition-colors">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-destructive">
              <ShieldX className="h-4 w-4" style={{ minWidth: 16, minHeight: 16 }} />
              <CardTitle className="text-sm font-bold">
                {t("profile.lockdown.sectionTitle")}
              </CardTitle>
            </div>
            <CardDescription className="text-xs text-destructive/80 mt-1">
              {t("profile.lockdown.sectionDesc")}
            </CardDescription>
          </div>

          <Button
            variant="destructive"
            size="sm"
            onClick={onOpenLockdown}
            data-testid="trigger-lockdown-btn"
            className="text-xs font-semibold gap-1.5"
          >
            <ShieldAlert className="h-3.5 w-3.5" />
            <span>{t("profile.lockdown.triggerBtn")}</span>
          </Button>
        </CardHeader>
      </Card>
    </div>
  );
}
