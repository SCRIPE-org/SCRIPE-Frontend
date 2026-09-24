/**
 * CreateTenantSummary — Summary of planned tenant configuration before provisioning
 *
 * Extracted from CreateTenantStep3 to respect Clean Architecture < 200 lines per file.
 *
 * @module tenants/presentation/components
 */
"use client";

import React from "react";
import { DetailRow } from "@core/ui/detail-row";
import { SUPPORTED_CURRENCIES } from "@core/constants/currencies";
import { getCountryByCode } from "@core/constants/countries";
import type { CreateTenantVM } from "../../viewmodels/useCreateTenantViewModel";

interface CreateTenantSummaryProps {
  vm: CreateTenantVM;
  t: (key: string) => string;
}

export function CreateTenantSummary({ vm, t }: CreateTenantSummaryProps) {
  const isFree = vm.selectedEdition?.isFree === true;
  const subType = vm.form.subscriptionType;
  const subMap: Record<string, string> = {
    Monthly: t("tenant.subscriptionTypes.monthly"),
    Yearly: t("tenant.subscriptionTypes.yearly"),
    Lifetime: t("tenant.subscriptionTypes.lifetime"),
    Trial: t("tenant.subscriptionTypes.trial"),
  };
  const subscriptionLabel = isFree ? t("tenant.freeEditionLifetime") : (subMap[subType] || subType || "-");

  const currencyInfo = SUPPORTED_CURRENCIES.find((c) => c.code === vm.form.currency);
  const currencyLabel = currencyInfo
    ? `${currencyInfo.code} (${currencyInfo.symbol})`
    : vm.form.currency;

  const countryInfo = getCountryByCode(vm.form.countryCode);
  const territoryLabel = countryInfo
    ? `${countryInfo.flag} ${countryInfo.name} (${vm.form.timeZone})`
    : vm.form.timeZone || "-";

  return (
    <div className="space-y-2 rounded-nx-md border border-nx-line bg-nx-raised p-4 duration-nx-standard ease-nx-enter motion-safe:animate-in fade-in-0">
      <h4 className="mb-3 text-sm font-semibold">{t("tenant.summary")}</h4>
      <DetailRow label={t("tenant.name")} value={`${vm.form.name} (${vm.form.code})`} />
      <DetailRow label={t("tenant.operatingTerritory")} value={territoryLabel} />
      <DetailRow
        label={t("tenant.stepAdministrator")}
        value={`${[vm.form.adminFirstName, vm.form.adminLastName].filter(Boolean).join(" ") || vm.form.adminFullName || vm.form.adminUsername} (${vm.form.adminEmail})`}
      />
      {vm.form.adminPhone && (
        <DetailRow label={t("tenant.adminPhone")} value={vm.form.adminPhone} />
      )}
      <DetailRow label={t("tenant.edition")} value={vm.selectedEdition?.name || "-"} />
      <DetailRow label={t("tenant.subscriptionType")} value={subscriptionLabel} />
      {!isFree && <DetailRow label={t("tenant.currency")} value={currencyLabel} />}
      {vm.form.promotionId && (
        <DetailRow
          label={t("tenant.promotion")}
          value={
            vm.availablePromotions.find((p) => p.id === vm.form.promotionId)?.name ||
            vm.form.promoCode ||
            t("tenant.promoApplied")
          }
          valueClassName="text-warning"
        />
      )}
      {!vm.form.promotionId && vm.form.promoCode && (
        <DetailRow label={t("tenant.promotion")} value={vm.form.promoCode} valueClassName="text-warning" />
      )}
      {vm.form.skipPayment && (
        <DetailRow label={t("tenant.payment")} value={t("tenant.skipped")} valueClassName="text-warning" />
      )}
    </div>
  );
}
