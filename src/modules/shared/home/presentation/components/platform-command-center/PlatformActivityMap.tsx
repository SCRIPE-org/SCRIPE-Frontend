/* eslint-disable unused-imports/no-unused-vars */
"use client";

import React from "react";
import { Globe } from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
import {
  PlatformActivityMapProps,
  RegionNodeInfo,
  EnrichedCountryData,
  useMapPanZoom,
  useMapData,
  MapSvgCanvas,
  MapControls,
  MapTooltip,
  MapRegionalSidebar,
} from "./activity-map";

export type { RegionNodeInfo, EnrichedCountryData, PlatformActivityMapProps };

export function PlatformActivityMap({
  summary,
  loginActivity,
  recentActivity = [],
  healthVm,
  regionNodes = [],
  isLoading = false,
}: PlatformActivityMapProps) {
  const { t } = useI18n();

  const { enrichedCountries, activeCountries, sortedCountries, countryStyles } = useMapData(
    regionNodes,
    summary,
    recentActivity
  );

  const {
    vb,
    mapStageRef,
    svgRef,
    isDraggingRef,
    hasDraggedRef,
    selectedCountry,
    hoveredCountry,
    setHoveredCountry,
    resetMap,
    zoomAt,
    handleCountrySelect,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handleWheel,
  } = useMapPanZoom();

  return (
    <div className="flex h-[520px] flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      {/* 1. Panel Header with Title & Legend matching Command Center */}
      <div className="flex h-[60px] items-center justify-between gap-4 border-b border-border bg-muted/40 px-4 py-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="shadow-xs flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#84cc16]/20 bg-[#84cc16]/10 text-[#84cc16]">
            <Globe className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <h2 className="truncate text-sm font-bold tracking-tight text-foreground sm:text-base">
              {t("platformCommandCenter.activity.globalTenantActivity") || "Global Tenant Activity"}
            </h2>
            <p className="truncate text-[11px] text-muted-foreground">
              {t("platformCommandCenter.activity.globalTenantActivitySub") ||
                "Deployment distribution and real-time activity across all regions."}
            </p>
          </div>
        </div>

        {/* Legend */}
        <div className="flex shrink-0 select-none items-center gap-3.5 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.7)]" />
            <span className="hidden sm:inline">
              {t("platformCommandCenter.activity.legendActive") || "Active Tenants"}
            </span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-rose-500 shadow-[0_0_6px_rgba(244,63,94,0.7)]" />
            <span className="hidden sm:inline">
              {t("platformCommandCenter.activity.legendIncident") || "Incident"}
            </span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-slate-500 opacity-60" />
            <span className="hidden sm:inline">
              {t("platformCommandCenter.activity.legendLowActivity") || "Low Activity"}
            </span>
          </span>
        </div>
      </div>

      {/* 2. Map Stage & Regional Sidebar Grid */}
      <div className="min-h-0 flex-1 p-3">
        <div className="grid h-full grid-cols-1 overflow-hidden rounded-lg border border-border bg-background shadow-inner lg:grid-cols-[minmax(0,1fr)_260px]">
          {/* LEFT: Interactive Vector Map Stage */}
          <div
            ref={mapStageRef}
            className="relative h-full min-w-0 select-none overflow-hidden bg-[radial-gradient(circle_at_55%_48%,rgba(14,165,233,0.12),transparent_36%),radial-gradient(circle_at_63%_46%,rgba(198,255,0,0.06),transparent_29%)]"
          >
            <MapSvgCanvas
              svgRef={svgRef}
              mapStageRef={mapStageRef}
              vb={vb}
              enrichedCountries={enrichedCountries}
              countryStyles={countryStyles}
              selectedCountry={selectedCountry}
              isDraggingRef={isDraggingRef}
              hasDraggedRef={hasDraggedRef}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onWheel={handleWheel}
              setHoveredCountry={setHoveredCountry}
              onSelectCountry={handleCountrySelect}
            />

            <MapControls
              summary={summary}
              recentActivity={recentActivity}
              healthVm={healthVm}
              enrichedCountries={enrichedCountries}
              activeCountries={activeCountries}
              sortedCountries={sortedCountries}
              selectedCountry={selectedCountry}
              onSelectCountry={handleCountrySelect}
              onReset={resetMap}
              onZoomIn={() => zoomAt(0.86)}
              onZoomOut={() => zoomAt(1.16)}
            />

            <MapTooltip hoveredCountry={hoveredCountry} mapStageRef={mapStageRef} />
          </div>

          {/* RIGHT: Regional Distribution & Live Activity Metrics */}
          <MapRegionalSidebar summary={summary} regionNodes={regionNodes} />
        </div>
      </div>
    </div>
  );
}
