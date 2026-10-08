// FILE-EXCEPTION: rule bypass for existing large file
"use client";

import React, { useMemo } from "react";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { GenericSelect } from "@core/crud/components/generic-select";
import type { GenericSelectOption } from "@core/crud/components/generic-select";
import { COUNTRIES, getDefaultTimeZoneForCountry } from "@core/constants/countries";
import { TimezonePicker } from "@core/ui/timezone-picker";
import { CountryFlag } from "@core/ui/country-flag";
import { CreatableCombobox } from "@core/ui/creatable-combobox";
import { getGeoTerritory, formatInternationalAddress } from "@core/constants/geo-territories";
import { useI18n } from "@core/providers/i18n-provider";
import { MapPin, Globe, Clock, Building2, Navigation, AlertCircle } from "lucide-react";

/**
 * Documentation for module export
 */
export interface SiteLocationState {
  countryCode: string;
  timeZone: string;
  state: string;
  city: string;
  district: string;
  postalCode: string;
  street: string;
  address: string;
}

interface SiteLocationFieldsProps {
  location: SiteLocationState;
  onChange: (next: SiteLocationState) => void;
  errors?: Partial<Record<keyof SiteLocationState, string>>;
}

/**
 * Documentation for SiteLocationFields
 */
export function SiteLocationFields({ location, onChange, errors = {} }: SiteLocationFieldsProps) {
  const { t, language } = useI18n();
  const isAr = language === "ar";

  const { countryCode, timeZone, state, city, district, postalCode, street, address } = location;

  const territory = getGeoTerritory(countryCode);
  const states = territory.states;

  const divisionLabel = isAr ? territory.divisionLabelAr : territory.divisionLabel;
  const cityLabel = isAr ? territory.cityLabelAr : territory.cityLabel;
  const districtLabel = isAr
    ? (territory.districtLabelAr ?? "Ø§Ù„Ø­ÙŠ / Ø§Ù„Ù…Ù†Ø·Ù‚Ø© Ø§Ù„ÙØ±Ø¹ÙŠØ©")
    : (territory.districtLabel ?? "Neighborhood / District");

  // Country options with crisp vector SVG flags
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
    const selectedState = states.find((s) => s.code === state || s.name === state);
    return selectedState ? selectedState.cities : [];
  }, [states, state]);

  const cityPlaceholder =
    states.length > 0 && !state
      ? isAr
        ? `ÙŠØ±Ø¬Ù‰ Ø§Ø®ØªÙŠØ§Ø± ${divisionLabel} Ø£ÙˆÙ„Ø§Ù‹...`
        : `Select ${divisionLabel} first...`
      : isAr
        ? `Ø§Ø®ØªØ± Ø£Ùˆ Ø§ÙƒØªØ¨ Ø§Ø³Ù… ${cityLabel}...`
        : `Select or type ${cityLabel}...`;

  const recalculateAddress = (
    cCode: string,
    st: string,
    ct: string,
    dst: string,
    pc: string,
    str: string
  ): string => {
    const countryObj = COUNTRIES.find((c) => c.code === cCode);
    const terr = getGeoTerritory(cCode);
    const stateObj = terr.states.find((s) => s.code === st || s.name === st);
    const stateDisplay = stateObj ? stateObj.name : st;

    return formatInternationalAddress({
      street: str,
      district: dst,
      city: ct,
      state: stateDisplay,
      postalCode: pc,
      countryName: countryObj?.name,
    });
  };

  const handleCountryChange = (val: string | string[]) => {
    const nextCode = (Array.isArray(val) ? val[0] : val) || "SA";
    const nextTz = getDefaultTimeZoneForCountry(nextCode);
    const nextAddress = recalculateAddress(nextCode, "", "", "", "", street);
    onChange({
      ...location,
      countryCode: nextCode,
      timeZone: nextTz,
      state: "",
      city: "",
      district: "",
      postalCode: "",
      address: nextAddress,
    });
  };

  const handleStateChange = (val: string | string[]) => {
    const nextState = (Array.isArray(val) ? val[0] : val) || "";
    const nextAddress = recalculateAddress(countryCode, nextState, "", "", postalCode, street);
    onChange({
      ...location,
      state: nextState,
      city: "",
      district: "",
      address: nextAddress,
    });
  };

  const handleCityChange = (nextCity: string) => {
    const nextAddress = recalculateAddress(
      countryCode,
      state,
      nextCity,
      district,
      postalCode,
      street
    );
    onChange({
      ...location,
      city: nextCity,
      address: nextAddress,
    });
  };

  const handleDistrictChange = (nextDistrict: string) => {
    const nextAddress = recalculateAddress(
      countryCode,
      state,
      city,
      nextDistrict,
      postalCode,
      street
    );
    onChange({
      ...location,
      district: nextDistrict,
      address: nextAddress,
    });
  };

  const handlePostalCodeChange = (nextPostal: string) => {
    const nextAddress = recalculateAddress(countryCode, state, city, district, nextPostal, street);
    onChange({
      ...location,
      postalCode: nextPostal,
      address: nextAddress,
    });
  };

  const handleStreetChange = (nextStreet: string) => {
    const nextAddress = recalculateAddress(
      countryCode,
      state,
      city,
      district,
      postalCode,
      nextStreet
    );
    onChange({
      ...location,
      street: nextStreet,
      address: nextAddress,
    });
  };

  return (
    <div className="bg-nx-raised/40 space-y-4 rounded-nx-md border border-nx-line p-4 sm:p-5">
      {/* Header */}
      <div className="border-nx-line/60 flex items-center gap-2.5 border-b pb-3">
        <div className="bg-nx-accent/15 flex h-7 w-7 items-center justify-center rounded-nx-sm text-nx-accent">
          <MapPin className="h-4 w-4" />
        </div>
        <div>
          <h4 className="text-sm font-semibold text-nx-ink">{t("site.operatingTerritory")}</h4>
          <p className="text-xs text-nx-ink-2">{t("site.operatingTerritoryDesc")}</p>
        </div>
      </div>

      {/* Row 1: Country & Timezone */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Country */}
        <div className="space-y-1.5">
          <Label htmlFor="site-country" className="flex items-center gap-1.5 text-xs font-medium">
            <Globe className="h-3.5 w-3.5 text-nx-ink-2" />
            {t("site.country")} <span className="text-destructive">*</span>
          </Label>
          <GenericSelect
            id="site-country"
            type="searchable"
            searchType="client"
            allowClear={false}
            options={countryOptions}
            value={countryCode}
            onValueChange={handleCountryChange}
            placeholder={t("site.selectCountry")}
            searchPlaceholder={t("site.searchCountries")}
            aria-invalid={!!errors.countryCode || undefined}
          />
          {errors.countryCode && (
            <p className="flex items-center gap-1 text-xs text-destructive">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              <span>{errors.countryCode}</span>
            </p>
          )}
        </div>

        {/* Timezone */}
        <div className="space-y-1.5">
          <Label htmlFor="site-timezone" className="flex items-center gap-1.5 text-xs font-medium">
            <Clock className="h-3.5 w-3.5 text-nx-ink-2" />
            {t("site.fields.timeZone")} <span className="text-destructive">*</span>
          </Label>
          <TimezonePicker
            id="site-timezone"
            value={timeZone}
            onChange={(tz) => onChange({ ...location, timeZone: tz })}
            aria-label={t("site.fields.timeZone")}
            placeholder={t("site.placeholders.timeZone")}
          />
          {errors.timeZone && (
            <p className="flex items-center gap-1 text-xs text-destructive">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              <span>{errors.timeZone}</span>
            </p>
          )}
        </div>
      </div>

      {/* Row 2: Territorial Administrative Division & City / District */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* State / Province / Governorate / Emirate */}
        {territory.states.length > 0 ? (
          <div className="space-y-1.5">
            <Label htmlFor="site-state" className="flex items-center gap-1.5 text-xs font-medium">
              <Building2 className="h-3.5 w-3.5 text-nx-ink-2" />
              {divisionLabel}
            </Label>
            <GenericSelect
              id="site-state"
              type="searchable"
              searchType="client"
              allowClear={true}
              options={stateOptions}
              value={state}
              onValueChange={handleStateChange}
              placeholder={isAr ? `Ø§Ø®ØªØ± ${divisionLabel}...` : `Select ${divisionLabel}...`}
              searchPlaceholder={
                isAr ? `Ø§Ù„Ø¨Ø­Ø« ÙÙŠ ${divisionLabel}...` : `Search ${divisionLabel}...`
              }
            />
          </div>
        ) : (
          <div className="space-y-1.5">
            <Label htmlFor="site-state" className="flex items-center gap-1.5 text-xs font-medium">
              <Building2 className="h-3.5 w-3.5 text-nx-ink-2" />
              {divisionLabel}{" "}
              <span className="text-[10px] text-nx-ink-3">
                ({isAr ? "Ø§Ø®ØªÙŠØ§Ø±ÙŠ" : "Optional"})
              </span>
            </Label>
            <Input
              id="site-state"
              value={state}
              onChange={(e) => handleStateChange(e.target.value)}
              placeholder={isAr ? `Ø£Ø¯Ø®Ù„ ${divisionLabel}...` : `Enter ${divisionLabel}...`}
              maxLength={100}
            />
          </div>
        )}

        {/* City / District */}
        <div className="space-y-1.5">
          <Label htmlFor="site-city" className="flex items-center gap-1.5 text-xs font-medium">
            <Navigation className="h-3.5 w-3.5 text-nx-ink-2" />
            {cityLabel}
          </Label>
          <CreatableCombobox
            id="site-city"
            options={citySuggestions}
            value={city}
            onChange={handleCityChange}
            placeholder={cityPlaceholder}
            searchPlaceholder={
              isAr
                ? `Ø§Ø¨Ø­Ø« Ø£Ùˆ Ø§ÙƒØªØ¨ Ø§Ø³Ù… ${cityLabel}...`
                : `Search or type ${cityLabel}...`
            }
            emptyText={
              isAr
                ? "Ù„Ø§ ØªÙˆØ¬Ø¯ Ù†ØªØ§Ø¦Ø¬ Ù…Ø·Ø§Ø¨Ù‚Ø©ØŒ ÙŠÙ…ÙƒÙ†Ùƒ Ø§Ø³ØªØ®Ø¯Ø§Ù… Ù…Ø§ ÙƒØªØ¨ØªÙ‡ Ø£Ø¹Ù„Ø§Ù‡"
                : "No preset match. You can use typed entry above."
            }
            createLabel={(q) => (isAr ? `+ Ø§Ø³ØªØ®Ø¯Ø§Ù… "${q}"` : `+ Use "${q}"`)}
            allowCreate={true}
            allowClear={true}
            disabled={territory.states.length > 0 && !state}
          />
        </div>
      </div>

      {/* Row 3: District / Sub-neighborhood & Postal Code */}
      <div className={`grid gap-4 ${territory.hasDistrict ? "sm:grid-cols-2" : "sm:grid-cols-1"}`}>
        {territory.hasDistrict && (
          <div className="space-y-1.5">
            <Label
              htmlFor="site-district"
              className="flex items-center gap-1.5 text-xs font-medium"
            >
              <span>{districtLabel}</span>
              <span className="text-[10px] text-nx-ink-3">
                ({isAr ? "Ø§Ø®ØªÙŠØ§Ø±ÙŠ" : "Optional"})
              </span>
            </Label>
            <Input
              id="site-district"
              value={district}
              onChange={(e) => handleDistrictChange(e.target.value)}
              placeholder={
                isAr
                  ? "Ù…Ø«Ø§Ù„: Ø§Ù„Ù…Ø¹Ø§Ø¯ÙŠ Ø§Ù„Ø¬Ø¯ÙŠØ¯Ø©ØŒ Ø­ÙŠ Ø§Ù„Ù†Ø±Ø¬Ø³ØŒ Ø§Ù„Ø¹Ù„ÙŠØ§"
                  : "e.g. New Maadi, Al Olaya, etc."
              }
              maxLength={100}
            />
          </div>
        )}

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="site-postal" className="text-xs font-medium">
              {t("site.postalCode")}
              <span className="ms-1.5 text-[10px] text-nx-ink-3">
                ({isAr ? "Ø§Ø®ØªÙŠØ§Ø±ÙŠ" : "Optional"})
              </span>
            </Label>
            {(isAr ? territory.postalCodeHelpTextAr : territory.postalCodeHelpText) && (
              <span className="text-[10px] text-nx-ink-3">
                {isAr ? territory.postalCodeHelpTextAr : territory.postalCodeHelpText}
              </span>
            )}
          </div>
          <Input
            id="site-postal"
            value={postalCode}
            onChange={(e) => handlePostalCodeChange(e.target.value)}
            placeholder={isAr ? territory.postalCodePlaceholderAr : territory.postalCodePlaceholder}
            maxLength={30}
          />
        </div>
      </div>

      {/* Row 4: Street / Campus details */}
      <div className="space-y-1.5">
        <Label htmlFor="site-street" className="text-xs font-medium">
          {t("site.streetAddress")}
        </Label>
        <Input
          id="site-street"
          value={street}
          onChange={(e) => handleStreetChange(e.target.value)}
          placeholder={t("site.streetAddressPlaceholder")}
          maxLength={200}
        />
      </div>

      {/* Row 5: Real-time Formatted Address Preview (UPU S42) */}
      {address && (
        <div className="border-nx-line/50 bg-nx-ground/70 shadow-nx-xs flex items-center gap-2.5 rounded-nx-sm border px-3.5 py-2.5 text-xs text-nx-ink-2">
          <div className="bg-nx-accent/20 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-nx-accent">
            <MapPin className="h-3 w-3" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-semibold text-nx-ink">{t("site.addressPreview")}</div>
            <div className="truncate font-mono text-[11px] text-nx-ink-2" title={address}>
              {address}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
