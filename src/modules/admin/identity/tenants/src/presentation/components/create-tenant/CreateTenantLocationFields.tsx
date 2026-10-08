/**
 * CreateTenantLocationFields — Country-Adaptive Geographic Territory & Address Engine
 *
 * Implements Google i18n & Universal Postal Union (UPU S42) compliant administrative division
 * hierarchy: Country -> State/Governorate/Emirate -> City/District (Creatable) -> Neighborhood -> Postal Code.
 * Overcomes OS emoji limitations by rendering vector SVG flags via CountryFlag.
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
import { CountryFlag } from "@core/ui/country-flag";
import { CreatableCombobox } from "@core/ui/creatable-combobox";
import { getGeoTerritory } from "@core/constants/geo-territories";
import { useI18n } from "@core/providers/i18n-provider";
import { MapPin, Globe, Clock, Building2, Navigation, AlertCircle } from "lucide-react";
import { cn } from "@core/common/utils";
import type { CreateTenantVM } from "../../viewmodels/useCreateTenantViewModel";

interface CreateTenantLocationFieldsProps {
  vm: CreateTenantVM;
  t: (key: string, params?: Record<string, any>) => string;
}

/**
 * Documentation for module export
 */
export function CreateTenantLocationFields({ vm, t }: CreateTenantLocationFieldsProps) {
  const { language } = useI18n();
  const isAr = language === "ar";

  const touched = vm.stepTouched[1];
  const errors = vm.stepErrors[1];

  const countryError = touched && errors.includes("countryCode");
  const timeZoneError = touched && errors.includes("timeZone");
  const stateError = touched && errors.includes("state");
  const cityError = touched && errors.includes("city");
  const postalError = touched && errors.includes("postalCode");
  const postalRequiredError = touched && errors.includes("postalCodeRequired");

  // Dynamic territorial administrative configuration based on selected country
  const countryCode = vm.form.countryCode;
  const selectedStateValue = vm.form.state;
  const territory = getGeoTerritory(countryCode);
  const states = territory.states;

  const divisionLabel = isAr ? territory.divisionLabelAr : territory.divisionLabel;
  const cityLabel = isAr ? territory.cityLabelAr : territory.cityLabel;
  const districtLabel = isAr
    ? territory.districtLabelAr ?? "الحي / المنطقة الفرعية"
    : territory.districtLabel ?? "Neighborhood / District";

  // Country options with crisp vector SVG flags (never raw emoji characters)
  const countryOptions: GenericSelectOption[] = useMemo(
    () =>
      COUNTRIES.map((c) => ({
        value: c.code,
        label: `${c.name} (${c.code})`,
        icon: <CountryFlag countryCode={c.code} countryName={c.name} size="sm" />,
      })),
    []
  );

  // Administrative subdivisions (Governorates, Provinces, Emirates, States)
  const stateOptions: GenericSelectOption[] = useMemo(
    () =>
      states.map((s) => ({
        value: s.code,
        label: isAr ? `${s.nameAr} (${s.name})` : `${s.name} (${s.nameAr})`,
      })),
    [states, isAr]
  );

  // Available cities / districts for the selected administrative division
  const citySuggestions = useMemo(() => {
    if (states.length === 0) return [];
    const selectedState = states.find(
      (s) => s.code === selectedStateValue || s.name === selectedStateValue
    );
    return selectedState ? selectedState.cities : [];
  }, [states, selectedStateValue]);

  const cityPlaceholder =
    states.length > 0 && !selectedStateValue
      ? isAr
        ? `يرجى اختيار ${divisionLabel} أولاً...`
        : `Select ${divisionLabel} first...`
      : isAr
      ? `اختر أو اكتب اسم ${cityLabel}...`
      : `Select or type ${cityLabel}...`;

  return (
    <div className="space-y-4 rounded-nx-md border border-nx-line bg-nx-raised/40 p-4 sm:p-5">
      {/* Header */}
      <div className="flex items-center gap-2.5 border-b border-nx-line/60 pb-3">
        <div className="flex h-7 w-7 items-center justify-center rounded-nx-sm bg-nx-accent/15 text-nx-accent">
          <MapPin className="h-4 w-4" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-nx-ink">
            {t("tenant.operatingTerritory")}
          </h3>
          <p className="text-xs text-nx-ink-2">
            {t("tenant.operatingTerritoryDesc")}
          </p>
        </div>
      </div>

      {/* Row 1: Country & Timezone */}
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
            <p className="flex items-center gap-1 text-xs text-destructive">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              <span>{t("validation.required")}</span>
            </p>
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
            <p className="flex items-center gap-1 text-xs text-destructive">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              <span>{t("validation.required")}</span>
            </p>
          )}
        </div>
      </div>

      {/* Row 2: Territorial Administrative Division & City / District */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* State / Province / Governorate / Emirate */}
        {territory.states.length > 0 ? (
          <div className="space-y-1.5">
            <Label htmlFor="tenant-state" className="flex items-center gap-1.5 text-xs font-medium">
              <Building2 className="h-3.5 w-3.5 text-nx-ink-2" />
              {divisionLabel} <span className="text-destructive">*</span>
            </Label>
            <GenericSelect
              id="tenant-state"
              type="searchable"
              searchType="client"
              allowClear={false}
              options={stateOptions}
              value={vm.form.state}
              onValueChange={(v: string | string[]) =>
                vm.updateField("state", (Array.isArray(v) ? v[0] : v) || "")
              }
              placeholder={
                isAr
                  ? `اختر ${divisionLabel}...`
                  : `Select ${divisionLabel}...`
              }
              searchPlaceholder={
                isAr
                  ? `البحث في ${divisionLabel}...`
                  : `Search ${divisionLabel}...`
              }
              aria-invalid={stateError || undefined}
            />
            {stateError && (
              <p className="flex items-center gap-1 text-xs text-destructive">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                <span>{t("validation.required")}</span>
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-1.5">
            <Label htmlFor="tenant-state" className="flex items-center gap-1.5 text-xs font-medium">
              <Building2 className="h-3.5 w-3.5 text-nx-ink-2" />
              {divisionLabel} <span className="text-[10px] text-nx-ink-3">({isAr ? "اختياري" : "Optional"})</span>
            </Label>
            <Input
              id="tenant-state"
              value={vm.form.state}
              onChange={(e) => vm.updateField("state", e.target.value)}
              placeholder={isAr ? `أدخل ${divisionLabel}...` : `Enter ${divisionLabel}...`}
              maxLength={100}
            />
          </div>
        )}

        {/* City / District (Creatable Combobox with Hadayek El Maadi support) */}
        <div className="space-y-1.5">
          <Label htmlFor="tenant-city" className="flex items-center gap-1.5 text-xs font-medium">
            <Navigation className="h-3.5 w-3.5 text-nx-ink-2" />
            {cityLabel} <span className="text-destructive">*</span>
          </Label>
          <CreatableCombobox
            id="tenant-city"
            options={citySuggestions}
            value={vm.form.city}
            onChange={(val) => vm.updateField("city", val)}
            placeholder={cityPlaceholder}
            searchPlaceholder={
              isAr
                ? `ابحث أو اكتب اسم ${cityLabel}...`
                : `Search or type ${cityLabel}...`
            }
            emptyText={
              isAr
                ? `لا توجد نتائج مطابقة، يمكنك استخدام ما كتبته أعلاه`
                : `No preset match. You can use typed entry above.`
            }
            createLabel={(q) =>
              isAr ? `+ استخدام "${q}"` : `+ Use "${q}"`
            }
            allowCreate={true}
            allowClear={true}
            disabled={territory.states.length > 0 && !vm.form.state}
            aria-invalid={cityError || undefined}
          />
          {cityError && (
            <p className="flex items-center gap-1 text-xs text-destructive">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              <span>{t("validation.required")}</span>
            </p>
          )}
        </div>
      </div>

      {/* Row 3: District / Sub-neighborhood (if applicable) & Postal Code */}
      <div className={`grid gap-4 ${territory.hasDistrict ? "sm:grid-cols-2" : "sm:grid-cols-1"}`}>
        {/* District / Neighborhood */}
        {territory.hasDistrict && (
          <div className="space-y-1.5">
            <Label htmlFor="tenant-district" className="flex items-center gap-1.5 text-xs font-medium">
              <span>{districtLabel}</span>
              <span className="text-[10px] text-nx-ink-3">({isAr ? "اختياري" : "Optional"})</span>
            </Label>
            <Input
              id="tenant-district"
              value={vm.form.district}
              onChange={(e) => vm.updateField("district", e.target.value)}
              placeholder={
                isAr
                  ? "مثال: المعادي الجديدة، حي النرجس، العليا"
                  : "e.g. New Maadi, Al Olaya, etc."
              }
              maxLength={100}
            />
          </div>
        )}

        {/* Postal Code / ZIP */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="tenant-postal" className="text-xs font-medium">
              {t("tenant.postalCode")}
              {territory.postalCodeRequired ? (
                <span className="text-destructive ms-0.5">*</span>
              ) : (
                <span className="text-[10px] text-nx-ink-3 ms-1.5">
                  ({isAr ? "اختياري / غير معتمد" : "Optional / Not in use"})
                </span>
              )}
            </Label>
            {(isAr ? territory.postalCodeHelpTextAr : territory.postalCodeHelpText) && (
              <span className="text-[10px] text-nx-ink-3">
                {isAr ? territory.postalCodeHelpTextAr : territory.postalCodeHelpText}
              </span>
            )}
          </div>
          <Input
            id="tenant-postal"
            value={vm.form.postalCode}
            onChange={(e) => vm.updateField("postalCode", e.target.value)}
            placeholder={
              isAr ? territory.postalCodePlaceholderAr : territory.postalCodePlaceholder
            }
            maxLength={30}
            className={cn((postalError || postalRequiredError) && "border-destructive focus-visible:ring-destructive")}
            aria-invalid={postalError || postalRequiredError || undefined}
          />
          {postalRequiredError && (
            <p className="flex items-center gap-1 text-xs text-destructive">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              <span>{t("tenant.postalCodeRequired")}</span>
            </p>
          )}
          {postalError && (
            <p className="flex items-center gap-1 text-xs text-destructive">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              <span>
                {isAr
                  ? `صيغة الرمز البريدي غير متوافقة مع معايير ${territory.nameAr}`
                  : `Invalid postal code format for ${territory.name}`}
              </span>
            </p>
          )}
        </div>
      </div>

      {/* Row 4: Street / Facility Campus */}
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

      {/* Row 5: Real-time Formatted Address Preview (UPU S42) */}
      {vm.form.address && (
        <div className="flex items-center gap-2.5 rounded-nx-sm border border-nx-line/50 bg-nx-ground/70 px-3.5 py-2.5 text-xs text-nx-ink-2 shadow-nx-xs">
          <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-nx-accent/20 text-nx-accent">
            <MapPin className="h-3 w-3" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-semibold text-nx-ink">{t("tenant.addressPreview")}</div>
            <div className="truncate font-mono text-[11px] text-nx-ink-2" title={vm.form.address}>
              {vm.form.address}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
