/**
 * CreateTenantLocationFields — Structured Geographic & Operating Territory
 *
 * Collects country, operating timezone, city, street, and postal code.
 * Replaces unstructured address textarea with structured geospatial fields.
 *
 * @module tenants/presentation/components
 */
"use client";

import React, { useMemo } from "react";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { GenericSelect } from "@core/crud/components/generic-select";
import type { GenericSelectOption } from "@core/crud/components/generic-select";
import { COUNTRIES } from "@core/constants/countries";
import { TimezonePicker } from "@/modules/custom-fields/custom-fields/custom-field/src/presentation/controls/DateTime/TimezonePicker";
import { MapPin, Globe, Clock } from "lucide-react";
import type { CreateTenantVM } from "../../viewmodels/useCreateTenantViewModel";

interface CreateTenantLocationFieldsProps {
  vm: CreateTenantVM;
  t: (key: string) => string;
}

export function CreateTenantLocationFields({ vm, t }: CreateTenantLocationFieldsProps) {
  const touched = vm.stepTouched[1];
  const errors = vm.stepErrors[1];
  const countryError = touched && errors.includes("countryCode");
  const timeZoneError = touched && errors.includes("timeZone");

  const countryOptions: GenericSelectOption[] = useMemo(
    () =>
      COUNTRIES.map((c) => ({
        value: c.code,
        label: `${c.flag}  ${c.name} (${c.code})`,
      })),
    []
  );

  return (
    <div className="space-y-4 rounded-nx-md border border-nx-line bg-nx-raised/40 p-4 sm:p-5">
      <div className="flex items-center gap-2.5 border-b border-nx-line/60 pb-3">
        <MapPin className="h-4 w-4 text-nx-accent" />
        <div>
          <h3 className="text-sm font-semibold text-nx-ink">
            {t("tenant.operatingTerritory")}
          </h3>
          <p className="text-xs text-nx-ink-2">
            {t("tenant.operatingTerritoryDesc")}
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {/* Country */}
        <div className="space-y-1.5">
          <Label htmlFor="tenant-country" className="flex items-center gap-1.5 text-xs font-medium">
            <Globe className="h-3.5 w-3.5 text-nx-ink-2" />
            {t("tenant.country")} <span className="text-destructive">*</span>
          </Label>
          <GenericSelect
            id="tenant-country"
            type="searchable"
            searchType="client"
            allowClear={false}
            options={countryOptions}
            value={vm.form.countryCode}
            onValueChange={(v: string | string[]) =>
              vm.updateField("countryCode", (Array.isArray(v) ? v[0] : v) || "")
            }
            placeholder={t("tenant.selectCountry")}
            searchPlaceholder={t("tenant.searchCountries")}
            aria-invalid={countryError || undefined}
          />
          {countryError && (
            <p className="text-xs text-destructive">{t("validation.required")}</p>
          )}
        </div>

        {/* Timezone */}
        <div className="space-y-1.5">
          <Label htmlFor="tenant-timezone" className="flex items-center gap-1.5 text-xs font-medium">
            <Clock className="h-3.5 w-3.5 text-nx-ink-2" />
            {t("tenant.timeZone")} <span className="text-destructive">*</span>
          </Label>
          <TimezonePicker
            id="tenant-timezone"
            value={vm.form.timeZone}
            onChange={(tz) => vm.updateField("timeZone", tz)}
            aria-label={t("tenant.timeZone")}
            placeholder={t("tenant.selectTimeZone")}
          />
          {timeZoneError && (
            <p className="text-xs text-destructive">{t("validation.required")}</p>
          )}
        </div>
      </div>

      {/* Structured Address: City + Postal Code */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="tenant-city" className="text-xs font-medium">
            {t("tenant.city")}
          </Label>
          <Input
            id="tenant-city"
            value={vm.form.city}
            onChange={(e) => vm.updateField("city", e.target.value)}
            placeholder={t("tenant.cityPlaceholder")}
            maxLength={100}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="tenant-postal" className="text-xs font-medium">
            {t("tenant.postalCode")}
          </Label>
          <Input
            id="tenant-postal"
            value={vm.form.postalCode}
            onChange={(e) => vm.updateField("postalCode", e.target.value)}
            placeholder={t("tenant.postalCodePlaceholder")}
            maxLength={30}
          />
        </div>
      </div>

      {/* Street / Facility Campus */}
      <div className="space-y-1.5">
        <Label htmlFor="tenant-street" className="text-xs font-medium">
          {t("tenant.streetAddress")}
        </Label>
        <Input
          id="tenant-street"
          value={vm.form.street}
          onChange={(e) => vm.updateField("street", e.target.value)}
          placeholder={t("tenant.streetAddressPlaceholder")}
          maxLength={200}
        />
      </div>

      {/* Formatted Address Preview */}
      {vm.form.address && (
        <div className="flex items-center gap-2 rounded-nx-sm bg-nx-ground px-3 py-2 text-xs text-nx-ink-2">
          <span className="font-medium text-nx-ink">{t("tenant.addressPreview")}:</span>
          <span className="truncate">{vm.form.address}</span>
        </div>
      )}
    </div>
  );
}
