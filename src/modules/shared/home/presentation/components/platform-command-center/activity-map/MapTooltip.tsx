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

export function MapTooltip({ hoveredCountry, mapStageRef }: MapTooltipProps) {
  const { t } = useI18n();
  const [dimensions, setDimensions] = React.useState({ width: 600, height: 400 });

  React.useEffect(() => {
    if (mapStageRef?.current) {
      queueMicrotask(() => {
        if (mapStageRef.current) {
          setDimensions({
            width: mapStageRef.current.clientWidth,
            height: mapStageRef.current.clientHeight,
          });
        }
      });
    }
  }, [mapStageRef, hoveredCountry]);

  if (!hoveredCountry) return null;

  const left = Math.min(hoveredCountry.x + 12, dimensions.width - 200);
  const top = Math.max(12, Math.min(hoveredCountry.y - 30, dimensions.height - 100));

  return (
    <div
      className="pointer-events-none absolute z-20 min-w-[170px] rounded-lg border border-border bg-card/95 p-2.5 text-[11px] shadow-xl backdrop-blur-md"
      style={{ left, top }}
    >
      <div className="flex items-center justify-between gap-2">
        <b className="block font-semibold text-foreground">{hoveredCountry.country.name}</b>
        {hoveredCountry.country.isHost && (
          <span className="py-0.2 shrink-0 rounded border border-primary/30 bg-primary/20 px-1.5 font-mono text-[9px] text-primary">
            Host
          </span>
        )}
        {hoveredCountry.country.tenantCount > 0 && !hoveredCountry.country.isHost && (
          <span className="py-0.2 shrink-0 rounded border border-sky-500/30 bg-sky-500/20 px-1.5 font-mono text-[9px] text-sky-400">
            {hoveredCountry.country.tenantCount}{" "}
            {hoveredCountry.country.tenantCount === 1 ? "tenant" : "tenants"}
          </span>
        )}
      </div>

      {hoveredCountry.country.tenantCount > 0 ||
      hoveredCountry.country.isHost ||
      hoveredCountry.country.requests > 0 ? (
        <>
          <span className="mt-0.5 block text-[10px] text-muted-foreground">
            {fmt(hoveredCountry.country.requests)} requests · {fmt(hoveredCountry.country.signins)}{" "}
            sign-ins
          </span>
          <span className="block text-[10px] text-muted-foreground">
            {fmt(hoveredCountry.country.events)} events · {fmt(hoveredCountry.country.errors)}{" "}
            errors
          </span>
          {hoveredCountry.country.tenantNames?.length > 0 && (
            <span className="mt-1 block max-w-[210px] truncate font-mono text-[9.5px] text-primary/90">
              {hoveredCountry.country.tenantNames.join(", ")}
            </span>
          )}
        </>
      ) : (
        <span className="mt-0.5 block text-[10px] text-muted-foreground">
          {t("platformCommandCenter.activity.noTenantSites") ||
            "No tenant sites registered in this region"}
        </span>
      )}
      <span className="mt-1 block text-[9px] font-medium text-primary">
        {t("platformCommandCenter.activity.clickToFocus") || "Click to focus"}
      </span>
    </div>
  );
}
