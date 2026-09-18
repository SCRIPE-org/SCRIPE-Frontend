"use client";

import React from "react";
import { RotateCcw, Plus, Minus } from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
import { Button } from "@core/ui/button";
import { EnrichedCountryData } from "./types";
import { MapTelemetryCard } from "./MapTelemetryCard";
import type { DashboardSummary, RecentChange } from "@modules/monitoring/dashboard/src/domain/entities/DashboardEntities";
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
      {/* 1. Host Node Badge (Top Left) */}
      <div className="absolute left-3 top-3 z-10 h-7 flex items-center gap-2 px-2.5 rounded-full border border-primary/20 bg-card/85 backdrop-blur-md text-[10px] text-muted-foreground font-medium tracking-wider uppercase shadow-sm">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-primary shadow-[0_0_8px_rgba(198,255,0,0.6)]"></span>
        </span>
        <span className="text-foreground font-semibold">
          {t("platformCommandCenter.activity.hostNode") || "SCRIPE Platform Host"}
        </span>
        <b className="text-foreground normal-case font-mono tracking-normal text-[11px]">
          {t("platformCommandCenter.activity.hostNodeInfo", {
            provider: healthVm?.health?.infrastructure?.database?.provider ?? "PostgreSql",
            tenants: summary?.totalTenants ?? 0,
          }) || `${healthVm?.health?.infrastructure?.database?.provider ?? "PostgreSql"} · ${summary?.totalTenants ?? 0} tenants`}
        </b>
      </div>

      {/* 2. Top Right: Country Focus & Reset */}
      <div className="absolute right-3 top-3 z-10 flex items-center gap-2">
        <select
          aria-label={t("platformCommandCenter.activity.focusCountry") || "Focus country"}
          value={selectedCountry?.name ?? ""}
          onChange={(e) => {
            const val = e.target.value;
            if (!val) {
              onReset();
            } else {
              const found = enrichedCountries.find((c) => c.name === val);
              if (found) {
                onSelectCountry(found, true);
              }
            }
          }}
          className="h-7 px-2 rounded-lg border border-border bg-card/85 text-[11px] text-foreground backdrop-blur-md outline-none hover:border-primary/40 transition-colors max-w-[170px]"
        >
          <option value="">
            {t("platformCommandCenter.activity.globalView") || "Global view"}
          </option>
          {activeCountries.length > 0 && (
            <optgroup label={t("platformCommandCenter.activity.activeRegions") || "Active Regions"}>
              {activeCountries.map((c) => (
                <option key={`act-${c.name}`} value={c.name} className="bg-popover text-popover-foreground font-medium">
                  {c.name} {c.isHost ? "· Host" : `· ${c.tenantCount} tenant${c.tenantCount > 1 ? "s" : ""}`}
                </option>
              ))}
            </optgroup>
          )}
          <optgroup label={t("platformCommandCenter.activity.allCountries") || "All Countries"}>
            {sortedCountries.map((c) => (
              <option key={`all-${c.name}`} value={c.name} className="bg-popover text-popover-foreground">
                {c.name}
              </option>
            ))}
          </optgroup>
        </select>

        <Button
          variant="outline"
          size="icon"
          type="button"
          onClick={onReset}
          title={t("platformCommandCenter.activity.resetMap") || "Reset map view"}
          className="h-7 w-7 rounded-lg border-border bg-card/85 text-muted-foreground hover:text-foreground hover:border-primary/40 backdrop-blur-md"
        >
          <RotateCcw className="h-3 w-3" />
        </Button>
      </div>

      {/* 3. Floating Live Telemetry Card (Top Right below controls) */}
      <MapTelemetryCard summary={summary} recentActivity={recentActivity} healthVm={healthVm} />

      {/* 4. Bottom Legend (Bottom Left) */}
      <div className="absolute left-3 bottom-3 z-10 flex items-center gap-3 px-2.5 py-1.5 rounded-lg border border-border bg-card/85 backdrop-blur-md text-[9.5px] text-muted-foreground font-medium">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-primary shadow-[0_0_6px_rgba(198,255,0,0.6)]"></span>
          {t("platformCommandCenter.activity.legend.host") || "Platform Host"}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-sky-500 shadow-[0_0_6px_rgba(14,165,233,0.6)]"></span>
          {t("platformCommandCenter.activity.legend.tenant") || "Tenant Region"}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-muted-foreground/30"></span>
          {t("platformCommandCenter.activity.legend.inactive") || "Inactive Region"}
        </span>
      </div>

      {/* 5. Zoom In/Out Buttons (Bottom Right) */}
      <div className="absolute right-3 sm:right-[185px] bottom-3 z-10 flex items-center gap-1">
        <Button
          variant="outline"
          size="icon"
          type="button"
          onClick={onZoomIn}
          title={t("platformCommandCenter.activity.zoomIn") || "Zoom in"}
          className="h-7 w-7 rounded-lg border-border bg-card/85 text-muted-foreground hover:text-foreground hover:border-primary/40 backdrop-blur-md"
        >
          <Plus className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          type="button"
          onClick={onZoomOut}
          title={t("platformCommandCenter.activity.zoomOut") || "Zoom out"}
          className="h-7 w-7 rounded-lg border-border bg-card/85 text-muted-foreground hover:text-foreground hover:border-primary/40 backdrop-blur-md"
        >
          <Minus className="h-3.5 w-3.5" />
        </Button>
      </div>
    </>
  );
}
