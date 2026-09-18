"use client";

import React from "react";
import { Globe, ChevronRight } from "lucide-react";
import Link from "next/link";
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
  MapLiveFeed,
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

  const { enrichedCountries, activeCountries, sortedCountries, countryStyles } =
    useMapData(regionNodes, summary, recentActivity);

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
    <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden flex flex-col h-[520px]">
      {/* 1. Panel Header */}
      <div className="h-[60px] px-4 py-3 flex items-center justify-between border-b border-border bg-muted/40">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 text-primary flex items-center justify-center shadow-xs">
            <Globe className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-foreground tracking-tight">
              {t("platformCommandCenter.activity.title") || "Geographic footprint & telemetry"}
            </h2>
            <p className="text-[11px] text-muted-foreground">
              {t("platformCommandCenter.activity.subtitle") ||
                "Deployment topology, tenant regions, and audit events"}
            </p>
          </div>
        </div>

        <Link
          href="/overview"
          className="text-xs font-semibold text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors group"
        >
          <span>
            {t("platformCommandCenter.activity.viewDashboard") || "Telemetry dashboard"}
          </span>
          <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {/* 2. Map Stage & Activity Feed Grid */}
      <div className="flex-1 p-3 min-h-0">
        <div className="h-full grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_220px] rounded-lg border border-border bg-background overflow-hidden shadow-inner">
          {/* LEFT: Interactive Vector Map Stage */}
          <div
            ref={mapStageRef}
            className="relative min-w-0 h-full overflow-hidden select-none bg-[radial-gradient(circle_at_55%_48%,rgba(14,165,233,0.12),transparent_36%),radial-gradient(circle_at_63%_46%,rgba(198,255,0,0.06),transparent_29%)]"
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

          {/* RIGHT: Live Activity Stream Feed Grounded to RecentChanges */}
          <MapLiveFeed recentActivity={recentActivity} />
        </div>
      </div>
    </div>
  );
}
