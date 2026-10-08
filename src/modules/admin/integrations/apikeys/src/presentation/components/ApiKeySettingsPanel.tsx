/* eslint-disable unused-imports/no-unused-vars */
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@core/ui/card";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { Textarea } from "@core/ui/textarea";
import type { ApiKeyDetail, UpdateApiKeyDetailRequest } from "../../domain/entities/ApiKeyDetail";
import { useI18n } from "@core/providers/i18n-provider";

interface ApiKeySettingsPanelProps {
  detail: ApiKeyDetail;
  isUpdating: boolean;
  onUpdate: (request: UpdateApiKeyDetailRequest) => void;
  /** Gates editing/saving — mirrors the backend's apikeys.update requirement. */
  canUpdate: boolean;
}

/**
 * Documentation for ApiKeySettingsPanel
 */
export function ApiKeySettingsPanel({
  detail,
  isUpdating,
  onUpdate,
  canUpdate,
}: ApiKeySettingsPanelProps) {
  const { t } = useI18n();

  const [name, setName] = useState(detail.name);
  const [description, setDescription] = useState(detail.description);
  const [rateLimit, setRateLimit] = useState(detail.rateLimitPerMinute?.toString() ?? "");
  const [burstPercent, setBurstPercent] = useState(detail.burstAllowancePercent?.toString() ?? "");
  const [monthlyQuota, setMonthlyQuota] = useState(detail.monthlyQuota?.toString() ?? "");
  const [quotaResetDay, setQuotaResetDay] = useState(detail.quotaResetDay.toString());
  const [alertThreshold, setAlertThreshold] = useState(detail.alertThresholdPercent.toString());
  const [ipWhitelist, setIpWhitelist] = useState(detail.ipWhitelist ?? "");

  const hasChanges =
    name !== detail.name ||
    description !== detail.description ||
    rateLimit !== (detail.rateLimitPerMinute?.toString() ?? "") ||
    burstPercent !== (detail.burstAllowancePercent?.toString() ?? "") ||
    monthlyQuota !== (detail.monthlyQuota?.toString() ?? "") ||
    quotaResetDay !== detail.quotaResetDay.toString() ||
    alertThreshold !== detail.alertThresholdPercent.toString() ||
    ipWhitelist !== (detail.ipWhitelist ?? "");

  // Combines both gates the fields/button already render off of: the key must be usable
  // (isActive) AND the caller must actually hold apikeys.update. Backend enforcement was
  // always intact for this — this is closing the frontend-only defense-in-depth gap.
  const canEdit = detail.isActive && canUpdate;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit) return;

    onUpdate({
      name,
      description,
      rateLimitPerMinute: rateLimit ? parseInt(rateLimit) : null,
      burstAllowancePercent: burstPercent ? parseInt(burstPercent) : null,
      monthlyQuota: monthlyQuota ? parseInt(monthlyQuota) : null,
      quotaResetDay: parseInt(quotaResetDay),
      alertThresholdPercent: parseInt(alertThreshold),
      ipWhitelist: ipWhitelist || null,
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">
            {t("apikeys.settings.title")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="key-name">{t("apikeys.settings.name")}</Label>
              <Input
                id="key-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={!canEdit}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="rate-limit">
                {t("apikeys.settings.rateLimit")}
              </Label>
              <Input
                id="rate-limit"
                type="number"
                value={rateLimit}
                onChange={(e) => setRateLimit(e.target.value)}
                placeholder={t("apikeys.settings.rateLimitPlaceholder")}
                disabled={!canEdit}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="key-desc">{t("apikeys.settings.desc")}</Label>
            <Textarea
              id="key-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder={t("apikeys.settings.descPlaceholder")}
              disabled={!canEdit}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-1.5">
              <Label htmlFor="monthly-quota">
                {t("apikeys.settings.quota")}
              </Label>
              <Input
                id="monthly-quota"
                type="number"
                value={monthlyQuota}
                onChange={(e) => setMonthlyQuota(e.target.value)}
                placeholder={t("apikeys.settings.quotaPlaceholder")}
                disabled={!canEdit}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="reset-day">
                {t("apikeys.settings.resetDay")}
              </Label>
              <Input
                id="reset-day"
                type="number"
                min={1}
                max={28}
                value={quotaResetDay}
                onChange={(e) => setQuotaResetDay(e.target.value)}
                required
                disabled={!canEdit}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="alert-threshold">
                {t("apikeys.settings.alert")}
              </Label>
              <Input
                id="alert-threshold"
                type="number"
                min={0}
                max={100}
                value={alertThreshold}
                onChange={(e) => setAlertThreshold(e.target.value)}
                required
                disabled={!canEdit}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="ip-whitelist">
              {t("apikeys.settings.whitelist")}
            </Label>
            <Input
              id="ip-whitelist"
              value={ipWhitelist}
              onChange={(e) => setIpWhitelist(e.target.value)}
              placeholder="e.g. 192.168.1.1, 10.0.0.0/24 (Leave empty to allow all)"
              disabled={!canEdit}
            />
          </div>
        </CardContent>
        {canUpdate && (
          <CardFooter className="justify-end border-t border-nx-line bg-nx-raised px-6 py-3">
            <Button type="submit" size="sm" disabled={!hasChanges || isUpdating || !canEdit}>
              {isUpdating ? t("common.saving") : t("common.saveChanges")}
            </Button>
          </CardFooter>
        )}
      </Card>
    </form>
  );
}
