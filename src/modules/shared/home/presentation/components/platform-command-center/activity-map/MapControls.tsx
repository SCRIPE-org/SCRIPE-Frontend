/* eslint-disable unused-imports/no-unused-vars */
"use client";

import React from "react";
import { RotateCcw, Plus, Minus } from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
import { Button } from "@core/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@core/ui/select";
import { EnrichedCountryData } from "./types";
import type {
  DashboardSummary,
  RecentChange,
} from "@modules/monitoring/dashboard/src/domain/entities/DashboardEntities";
import type { usePlatformHealthViewModel } from "@modules/monitoring/platform-health/src/presentation/viewmodels/usePlatformHealthViewModel";

interface MapControlsProps {
  summary?: DashboardSummary;
  recentActivity?: RecentChange[];
  healthVm?: ReturnType<typeof usePlatformHealthViewModel>;
  enrichedCountries: EnrichedCountryData[];
  activeCountries: EnrichedCountryData[];
  sortedCountries: EnrichedCountryData[];
  selectedCountry: EnrichedCountryData | null;
  onSelectCountry: (country: EnrichedCountryData, focus?: boolean) => void;
  onReset: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
}

export function MapControls({
  summary,
  recentActivity = [],
  healthVm,
  enrichedCountries,
  activeCountries,
  sortedCountries,
  selectedCountry,
  onSelectCountry,
  onReset,
  onZoomIn,
  onZoomOut,
}: MapControlsProps) {
  const { t } = useI18n();

  return (
    <>
      {/* 1. Host Node Badge (Top Start) */}
      <div className="absolute start-3 top-3 z-10 flex h-7 items-center gap-2 rounded-full border border-nx-line bg-nx-surface px-2.5 text-[10px] font-medium uppercase tracking-wider text-nx-ink-3">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-nx-accent opacity-75 motion-reduce:animate-none"></span>
          <span className="relative inline-flex h-2 w-2 rounded-full bg-nx-accent"></span>
        </span>
        <span className="font-semibold text-nx-ink">
          {t("platformCommandCenter.activity.hostNode") || "SCRIPE Platform Host"}
        </span>
        <b className="font-mono text-[11px] normal-case tracking-normal text-nx-ink-2">
          {t("platformCommandCenter.activity.hostNodeInfo", {
            provider: healthVm?.health?.infrastructure?.database?.provider ?? "PostgreSql",
            tenants: summary?.totalTenants ?? 0,
          }) ||
            `${healthVm?.health?.infrastructure?.database?.provider ?? "PostgreSql"} · ${summary?.totalTenants ?? 0} tenants`}
        </b>
      </div>

      {/* 2. Top End: Country Focus & Reset */}
      <div className="absolute end-3 top-3 z-10 flex items-center gap-2">
        <Select
          value={selectedCountry?.name ?? "__global__"}
          onValueChange={(val) => {
            if (!val || val === "__global__") {
              onReset();
            } else {
              const found = enrichedCountries.find((c) => c.name === val);
              if (found) {
                onSelectCountry(found, true);
              }
            }
          }}
        >
          <SelectTrigger
            aria-label={t("platformCommandCenter.activity.focusCountry") || "Focus country"}
            className="h-7 max-w-[150px] rounded-lg border-nx-line bg-nx-surface px-2 text-[11px] text-nx-ink hover:border-nx-line-hi"
          >
            <SelectValue
              placeholder={t("platformCommandCenter.activity.globalView") || "Global view"}
            />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__global__">
              {t("platformCommandCenter.activity.globalView") || "Global view"}
            </SelectItem>
            {activeCountries.length > 0 && (
              <SelectGroup>
                <SelectLabel>
                  {t("platformCommandCenter.activity.activeRegions") || "Active Regions"}
                </SelectLabel>
                {activeCountries.map((c) => (
                  <SelectItem key={`act-${c.name}`} value={c.name} className="font-medium">
                    {c.name}{" "}
                    {c.isHost
                      ? "· Host"
                      : `· ${c.tenantCount} tenant${c.tenantCount > 1 ? "s" : ""}`}
                  </SelectItem>
                ))}
              </SelectGroup>
            )}
            <SelectGroup>
              <SelectLabel>
                {t("platformCommandCenter.activity.allCountries") || "All Countries"}
              </SelectLabel>
              {sortedCountries.map((c) => (
                <SelectItem key={`all-${c.name}`} value={c.name}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          size="icon"
          type="button"
          onClick={onReset}
          aria-label={t("platformCommandCenter.activity.resetMap") || "Reset map view"}
          title={t("platformCommandCenter.activity.resetMap") || "Reset map view"}
          className="h-7 w-7 rounded-lg border-nx-line bg-nx-surface text-nx-ink-3 hover:border-nx-line-hi hover:text-nx-ink"
        >
          <RotateCcw className="h-3 w-3" aria-hidden="true" />
        </Button>
      </div>

      {/* 3. Bottom Legend (Bottom Start) */}
      <div className="absolute bottom-3 start-3 z-10 flex items-center gap-3 rounded-lg border border-nx-line bg-nx-surface px-2.5 py-1.5 text-[9.5px] font-medium text-nx-ink-3">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-nx-accent" aria-hidden="true"></span>
          {t("platformCommandCenter.activity.legend.host") || "Platform Host"}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-info" aria-hidden="true"></span>
          {t("platformCommandCenter.activity.legend.tenant") || "Tenant Region"}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-nx-line-hi" aria-hidden="true"></span>
          {t("platformCommandCenter.activity.legend.inactive") || "Inactive Region"}
        </span>
      </div>

      {/* 4. Zoom In/Out Buttons (Bottom End) */}
      <div className="absolute bottom-3 end-3 z-10 flex items-center gap-1">
        <Button
          variant="outline"
          size="icon"
          type="button"
          onClick={onZoomIn}
          aria-label={t("platformCommandCenter.activity.zoomIn") || "Zoom in"}
          title={t("platformCommandCenter.activity.zoomIn") || "Zoom in"}
          className="h-7 w-7 rounded-lg border-nx-line bg-nx-surface text-nx-ink-3 hover:border-nx-line-hi hover:text-nx-ink"
        >
          <Plus className="h-3.5 w-3.5" aria-hidden="true" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          type="button"
          onClick={onZoomOut}
          aria-label={t("platformCommandCenter.activity.zoomOut") || "Zoom out"}
          title={t("platformCommandCenter.activity.zoomOut") || "Zoom out"}
          className="h-7 w-7 rounded-lg border-nx-line bg-nx-surface text-nx-ink-3 hover:border-nx-line-hi hover:text-nx-ink"
        >
          <Minus className="h-3.5 w-3.5" aria-hidden="true" />
        </Button>
      </div>
    </>
  );
}
