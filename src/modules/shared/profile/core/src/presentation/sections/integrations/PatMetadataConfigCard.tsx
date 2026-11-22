"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@core/ui/card";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { Textarea } from "@core/ui/textarea";
import { Badge } from "@core/ui/badge";
import { DatePicker } from "@core/ui/date-picker";
import {
  daysToYmd,
  formatPatExpiryTargetDate,
  ymdToClampedDays,
} from "../../utils/patScopeTaxonomy";
import { Building2, CalendarDays, ShieldCheck } from "lucide-react";

const EXPIRY_PRESETS = [7, 30, 90, 180, 365] as const;

/** Props for PatMetadataConfigCard. */
export interface PatMetadataConfigCardProps {
  t: (key: string, params?: Record<string, string | number>) => string;
  language: string;
  tokenName: string;
  description: string;
  expiresInDays: number;
  isPlatformAdmin: boolean;
  ownerScopeLabel: string;
  nameError?: string | null;
  onTokenNameChange: (val: string) => void;
  onDescriptionChange: (val: string) => void;
  onExpiresInDaysChange: (days: number) => void;
}

/**
 * Shared identity, operational purpose description, verified principal owner,
 * and preset/custom calendar expiration card for PAT create & edit workflows.
 */
export function PatMetadataConfigCard({
  t,
  language,
  tokenName,
  description,
  expiresInDays,
  isPlatformAdmin,
  ownerScopeLabel,
  nameError,
  onTokenNameChange,
  onDescriptionChange,
  onExpiresInDaysChange,
}: PatMetadataConfigCardProps) {
  const [customDateMode, setCustomDateMode] = useState(
    !EXPIRY_PRESETS.includes(expiresInDays as (typeof EXPIRY_PRESETS)[number])
  );

  const resolvedExpiryFormatted = formatPatExpiryTargetDate(expiresInDays, language);

  return (
    <Card className="border border-nx-line bg-nx-surface hover:border-nx-line-hi transition-colors">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-bold text-nx-ink">
          {t("profile.integrations.metadataCardTitle")}
        </CardTitle>
        <CardDescription className="text-xs text-nx-ink-3">
          {t("profile.integrations.metadataCardDesc")}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-7 space-y-1.5">
            <Label htmlFor="pat-name-input" className="text-xs font-semibold text-nx-ink">
              {t("profile.integrations.tokenLabelInput")} <span className="text-destructive">*</span>
            </Label>
            <Input
              id="pat-name-input"
              data-testid="create-pat-name-input"
              value={tokenName}
              onChange={(e) => onTokenNameChange(e.target.value)}
              placeholder={t("profile.integrations.patNamePlaceholder")}
              maxLength={120}
              aria-invalid={Boolean(nameError)}
              className="h-9 text-xs"
            />
            {nameError ? (
              <p className="text-[11px] text-destructive font-medium">{nameError}</p>
            ) : (
              <p className="text-[11px] text-nx-ink-3">
                {t("profile.integrations.tokenNameHelper")}
              </p>
            )}
          </div>

          <div className="md:col-span-5 space-y-1.5">
            <Label className="text-xs font-semibold text-nx-ink">
              {t("profile.integrations.resourceOwnerLabel")}
            </Label>
            <div className="h-9 px-3 rounded-lg border border-nx-line bg-nx-ground flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                {isPlatformAdmin ? (
                  <ShieldCheck className="h-3.5 w-3.5 text-nx-accent shrink-0" aria-hidden="true" />
                ) : (
                  <Building2 className="h-3.5 w-3.5 text-nx-accent shrink-0" aria-hidden="true" />
                )}
                <span className="text-xs font-medium text-nx-ink truncate">{ownerScopeLabel}</span>
              </div>
              <Badge variant="outline" className="text-[10px] border-nx-line text-nx-ink-3 shrink-0">
                {isPlatformAdmin
                  ? t("profile.integrations.ownerKindPlatform")
                  : t("profile.integrations.ownerKindTenant")}
              </Badge>
            </div>
            <p className="text-[11px] text-nx-ink-3">
              {t("profile.integrations.resourceOwnerHelper")}
            </p>
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="pat-description-input" className="text-xs font-semibold text-nx-ink">
              {t("profile.integrations.tokenDescriptionLabel")}
            </Label>
            <span className="text-[11px] font-mono tabular-nums text-nx-ink-3">
              {description.length} / 500
            </span>
          </div>
          <Textarea
            id="pat-description-input"
            data-testid="create-pat-description-input"
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            placeholder={t("profile.integrations.tokenDescriptionPlaceholder")}
            maxLength={500}
            className="min-h-[72px] text-xs"
          />
        </div>

        <div className="space-y-2 pt-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Label className="text-xs font-semibold text-nx-ink">
              {t("profile.integrations.expiryPresetLabel")}
            </Label>
            <span
              data-testid="pat-resolved-expiry-date"
              className="inline-flex items-center gap-1.5 text-[11px] font-mono text-nx-ink-2 bg-nx-ground border border-nx-line rounded-md px-2 py-0.5"
            >
              <CalendarDays className="h-3 w-3 text-nx-accent" aria-hidden="true" />
              {t("profile.integrations.expiresOnSummary", {
                date: resolvedExpiryFormatted,
                days: expiresInDays,
              })}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {EXPIRY_PRESETS.map((days) => {
              const active = !customDateMode && expiresInDays === days;
              return (
                <Button
                  key={days}
                  type="button"
                  size="sm"
                  variant={active ? "default" : "outline"}
                  data-testid={`pat-expiry-preset-${days}`}
                  onClick={() => {
                    setCustomDateMode(false);
                    onExpiresInDaysChange(days);
                  }}
                  className={
                    active
                      ? "h-8 text-xs bg-nx-accent-fill text-nx-on-fill font-semibold"
                      : "h-8 text-xs"
                  }
                >
                  {t("profile.integrations.expiryDaysOption", { days })}
                </Button>
              );
            })}
            <Button
              type="button"
              size="sm"
              variant={customDateMode ? "default" : "outline"}
              data-testid="pat-expiry-custom-btn"
              onClick={() => setCustomDateMode(true)}
              className={
                customDateMode
                  ? "h-8 text-xs bg-nx-accent-fill text-nx-on-fill font-semibold"
                  : "h-8 text-xs"
              }
            >
              {t("profile.integrations.expiryCustomDateOption")}
            </Button>
          </div>

          {customDateMode && (
            <div className="max-w-xs pt-1">
              <DatePicker
                value={daysToYmd(expiresInDays)}
                minDate={daysToYmd(1)}
                maxDate={daysToYmd(365)}
                onChange={(ymd) => {
                  if (ymd) onExpiresInDaysChange(ymdToClampedDays(ymd));
                }}
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
