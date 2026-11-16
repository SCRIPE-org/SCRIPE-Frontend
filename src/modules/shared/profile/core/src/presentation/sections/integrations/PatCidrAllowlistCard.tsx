"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@core/ui/card";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { Network, Plus, ShieldCheck, X } from "lucide-react";

const CIDR_PATTERN = /^(\d{1,3}\.){3}\d{1,3}\/(3[0-2]|[12]?\d)$/;

/** Parses free-text comma-separated CIDR input into trimmed entries and validates them. */
export function parseCidrEntries(raw: string): { entries: string[]; invalidEntry: string | null } {
  const entries = Array.from(
    new Set(
      raw
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    )
  );
  const invalidEntry = entries.find((entry) => !CIDR_PATTERN.test(entry)) ?? null;
  return { entries, invalidEntry };
}

/** Props for PatCidrAllowlistCard. */
export interface PatCidrAllowlistCardProps {
  t: (key: string, params?: Record<string, string | number>) => string;
  cidrAllowlistRaw: string;
  currentClientIp?: string | null;
  onCidrAllowlistChange: (nextRaw: string) => void;
}

/**
 * Per-token zero-trust IPv4 CIDR network perimeter card with structured chips
 * and 1-click current workstation IP pinning (shared across PAT create & edit flows).
 */
export function PatCidrAllowlistCard({
  t,
  cidrAllowlistRaw,
  currentClientIp,
  onCidrAllowlistChange,
}: PatCidrAllowlistCardProps) {
  const [chipError, setChipError] = useState<string | null>(null);
  const { entries, invalidEntry } = parseCidrEntries(cidrAllowlistRaw);

  const normalizedClientCidr =
    currentClientIp && CIDR_PATTERN.test(`${currentClientIp.trim()}/32`)
      ? `${currentClientIp.trim()}/32`
      : null;
  const alreadyIncludesCurrent = Boolean(
    normalizedClientCidr && entries.includes(normalizedClientCidr)
  );

  const handleAddCurrentIp = () => {
    if (!normalizedClientCidr || alreadyIncludesCurrent) return;
    setChipError(null);
    const next = [...entries, normalizedClientCidr];
    onCidrAllowlistChange(next.join(", "));
  };

  const handleRemoveEntry = (target: string) => {
    setChipError(null);
    const next = entries.filter((item) => item !== target);
    onCidrAllowlistChange(next.join(", "));
  };

  const handleBlurOrNormalize = () => {
    if (invalidEntry) {
      setChipError(t("profile.integrations.invalidCidrError", { cidr: invalidEntry }));
    } else {
      setChipError(null);
    }
  };

  return (
    <Card className="border border-nx-line bg-nx-surface hover:border-nx-line-hi transition-colors">
      <CardHeader className="pb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Network className="h-4 w-4 text-nx-accent shrink-0" aria-hidden="true" />
            <CardTitle className="text-base font-bold text-nx-ink">
              {t("profile.integrations.cidrAllowlistLabel")}
            </CardTitle>
            <Badge
              variant="outline"
              className={
                entries.length > 0 && !invalidEntry
                  ? "text-[10px] border-info/40 bg-info/10 text-info"
                  : "text-[10px] border-nx-line text-nx-ink-3"
              }
            >
              {entries.length > 0
                ? t("profile.integrations.cidrPinnedCountBadge", { count: entries.length })
                : t("profile.integrations.cidrUnrestrictedBadge")}
            </Badge>
          </div>
          <CardDescription className="text-xs text-nx-ink-3 mt-1">
            {t("profile.integrations.cidrPerimeterDesc")}
          </CardDescription>
        </div>

        {normalizedClientCidr && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            data-testid="create-pat-add-current-ip-btn"
            disabled={alreadyIncludesCurrent}
            onClick={handleAddCurrentIp}
            className="h-8 text-xs font-medium gap-1.5 shrink-0 w-fit"
          >
            {alreadyIncludesCurrent ? (
              <ShieldCheck className="h-3.5 w-3.5 text-success" aria-hidden="true" />
            ) : (
              <Plus className="h-3.5 w-3.5 text-nx-accent" aria-hidden="true" />
            )}
            <span>
              {t("profile.integrations.pinCurrentIpBtn")}{" "}
              <bdi dir="ltr" className="font-mono">
                ({normalizedClientCidr})
              </bdi>
            </span>
          </Button>
        )}
      </CardHeader>

      <CardContent className="space-y-3">
        <Input
          id="pat-cidr-input"
          data-testid="create-pat-cidr-input"
          dir="ltr"
          value={cidrAllowlistRaw}
          onChange={(e) => {
            setChipError(null);
            onCidrAllowlistChange(e.target.value);
          }}
          onBlur={handleBlurOrNormalize}
          placeholder="198.51.100.0/24, 203.0.113.10/32"
          aria-invalid={Boolean(chipError || invalidEntry)}
          className="h-9 text-xs font-mono"
        />

        {entries.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {entries.map((cidr) => {
              const valid = CIDR_PATTERN.test(cidr);
              return (
                <Badge
                  key={cidr}
                  variant="outline"
                  className={
                    valid
                      ? "bg-info/10 text-info border-info/30 text-[11px] font-mono gap-1.5 py-0.5 ps-2 pe-1"
                      : "bg-destructive/10 text-destructive border-destructive/30 text-[11px] font-mono gap-1.5 py-0.5 ps-2 pe-1"
                  }
                >
                  <bdi dir="ltr">{cidr}</bdi>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveEntry(cidr)}
                    aria-label={t("profile.integrations.removeCidrAria", { cidr })}
                    className="h-4 w-4 p-0 rounded-sm hover:bg-nx-ground/60"
                  >
                    <X className="h-3 w-3" aria-hidden="true" />
                  </Button>
                </Badge>
              );
            })}
          </div>
        )}

        {(chipError || invalidEntry) && (
          <p className="text-[11px] text-destructive font-medium">
            {chipError || t("profile.integrations.invalidCidrError", { cidr: invalidEntry ?? "" })}
          </p>
        )}
        <p className="text-[11px] text-nx-ink-3">{t("profile.passkeys.cidrFormatHelper")}</p>
      </CardContent>
    </Card>
  );
}
