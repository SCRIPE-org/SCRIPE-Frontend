"use client";

import React from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { EnrichedCountryData, fmt } from "./types";

interface MapTooltipProps {
  hoveredCountry: {
    country: EnrichedCountryData;
    x: number;
    y: number;
  } | null;
  mapStageRef?: React.RefObject<HTMLDivElement | null>;
}

export function MapTooltip({ hoveredCountry }: MapTooltipProps) {
  const { t } = useI18n();
  const [dimensions, setDimensions] = React.useState({ width: 600, height: 400 });

  React.useEffect(() => {
    if (mapStageRef.current) {
      setDimensions({
        width: mapStageRef.current.clientWidth,
        height: mapStageRef.current.clientHeight,
      });
    }
  }, [mapStageRef, hoveredCountry]);

  if (!hoveredCountry) return null;

  const left = Math.min(hoveredCountry.x + 12, dimensions.width - 200);
  const top = Math.max(12, Math.min(hoveredCountry.y - 30, dimensions.height - 100));

  return (
    <div
      className="absolute z-20 pointer-events-none p-2.5 rounded-lg border border-border bg-card/95 backdrop-blur-md shadow-xl text-[11px] min-w-[170px]"
      style={{ left, top }}
    >
      <div className="flex items-center justify-between gap-2">
        <b className="text-foreground font-semibold block">{hoveredCountry.country.name}</b>
        {hoveredCountry.country.isHost && (
          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-primary/20 text-primary border border-primary/30 shrink-0">
            Host
          </span>
        )}
        {hoveredCountry.country.tenantCount > 0 && !hoveredCountry.country.isHost && (
          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-sky-500/20 text-sky-400 border border-sky-500/30 shrink-0">
            {hoveredCountry.country.tenantCount} {hoveredCountry.country.tenantCount === 1 ? "tenant" : "tenants"}
          </span>
        )}
      </div>

      {hoveredCountry.country.tenantCount > 0 || hoveredCountry.country.isHost || hoveredCountry.country.requests > 0 ? (
        <>
          <span className="text-muted-foreground text-[10px] block mt-0.5">
            {fmt(hoveredCountry.country.requests)} requests · {fmt(hoveredCountry.country.signins)} sign-ins
          </span>
          <span className="text-muted-foreground text-[10px] block">
            {fmt(hoveredCountry.country.events)} events · {fmt(hoveredCountry.country.errors)} errors
          </span>
          {hoveredCountry.country.tenantNames?.length > 0 && (
            <span className="text-primary/90 text-[9.5px] font-mono block mt-1 truncate max-w-[210px]">
              {hoveredCountry.country.tenantNames.join(", ")}
            </span>
          )}
        </>
      ) : (
        <span className="text-muted-foreground text-[10px] block mt-0.5">
          {t("platformCommandCenter.activity.noTenantSites") || "No tenant sites registered in this region"}
        </span>
      )}
      <span className="text-[9px] text-primary font-medium block mt-1">
        {t("platformCommandCenter.activity.clickToFocus") || "Click to focus"}
      </span>
    </div>
  );
}
