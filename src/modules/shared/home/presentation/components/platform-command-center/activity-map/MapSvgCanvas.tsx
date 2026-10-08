"use client";

import React from "react";
import { ViewBox, EnrichedCountryData } from "./types";

interface MapSvgCanvasProps {
  svgRef: React.RefObject<SVGSVGElement | null>;
  mapStageRef: React.RefObject<HTMLDivElement | null>;
  vb: ViewBox;
  enrichedCountries: EnrichedCountryData[];
  countryStyles: Map<
    string,
    { fill: string; stroke: string; strokeWidth: number; isHost: boolean; isTenantRegion: boolean }
  >;
  selectedCountry: EnrichedCountryData | null;
  isDraggingRef: React.MutableRefObject<boolean>;
  hasDraggedRef: React.MutableRefObject<boolean>;
  onPointerDown: (e: React.PointerEvent<SVGSVGElement>) => void;
  onPointerMove: (e: React.PointerEvent<SVGSVGElement>) => void;
  onPointerUp: (e: React.PointerEvent<SVGSVGElement>) => void;
  onWheel: (e: React.WheelEvent<SVGSVGElement>) => void;
  setHoveredCountry: (
    val: {
      country: EnrichedCountryData;
      x: number;
      y: number;
    } | null
  ) => void;
  onSelectCountry: (country: EnrichedCountryData, focus?: boolean) => void;
}

export function MapSvgCanvas({
  svgRef,
  mapStageRef,
  vb,
  enrichedCountries,
  countryStyles,
  selectedCountry,
  isDraggingRef,
  hasDraggedRef,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onWheel,
  setHoveredCountry,
  onSelectCountry,
}: MapSvgCanvasProps) {
  return (
    <svg
      ref={svgRef}
      id="worldSvg"
      viewBox={`${vb.x} ${vb.y} ${vb.w} ${vb.h}`}
      className="absolute inset-0 h-full w-full cursor-grab touch-none active:cursor-grabbing"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onPointerLeave={onPointerUp}
      onLostPointerCapture={onPointerUp}
      onWheel={onWheel}
      aria-label="Interactive global operations map"
    >
      <defs>
        <pattern id="gridPatternV4" width="34" height="34" patternUnits="userSpaceOnUse">
          <path
            d="M34 0H0V34"
            fill="none"
            stroke="currentColor"
            strokeOpacity=".08"
            strokeWidth=".65"
          />
        </pattern>
      </defs>

      {/* Background Grid Pattern */}
      <rect
        x="0"
        y="0"
        width="1000"
        height="460"
        fill="url(#gridPatternV4)"
        className="pointer-events-none text-muted-foreground opacity-40"
      />

      {/* 172 Country Vector Paths */}
      <g id="countryLayer">
        {enrichedCountries.map((p) => {
          const isSelected = selectedCountry?.name === p.name;
          const style = countryStyles.get(p.name);
          const fill = isSelected ? "var(--primary)" : (style?.fill ?? "#112330");
          const stroke = isSelected
            ? "var(--primary)"
            : (style?.stroke ?? "rgba(100,140,165,0.35)");
          const strokeWidth = isSelected ? 1.4 : (style?.strokeWidth ?? 0.62);

          return (
            <path
              key={p.name}
              d={p.d}
              fill={fill}
              stroke={stroke}
              strokeWidth={strokeWidth}
              vectorEffect="non-scaling-stroke"
              className="cursor-pointer transition-colors duration-150 hover:opacity-90"
              onPointerEnter={(e) => {
                if (!isDraggingRef.current) {
                  const rect = mapStageRef.current?.getBoundingClientRect();
                  if (rect) {
                    setHoveredCountry({
                      country: p,
                      x: e.clientX - rect.left,
                      y: e.clientY - rect.top,
                    });
                  }
                }
              }}
              onPointerMove={(e) => {
                if (!isDraggingRef.current && mapStageRef.current) {
                  const rect = mapStageRef.current.getBoundingClientRect();
                  setHoveredCountry({
                    country: p,
                    x: e.clientX - rect.left,
                    y: e.clientY - rect.top,
                  });
                }
              }}
              onPointerLeave={() => {
                setHoveredCountry(null);
              }}
              onClick={(e) => {
                e.stopPropagation();
                if (hasDraggedRef.current) {
                  hasDraggedRef.current = false;
                  return;
                }
                isDraggingRef.current = false;
                hasDraggedRef.current = false;
                onSelectCountry(p, true);
              }}
            />
          );
        })}
      </g>

      {/* Active Region Pulse Markers */}
      <g id="activeRegionMarkers" className="pointer-events-none">
        {enrichedCountries
          .filter((p) => p.isHost || p.isTenantRegion)
          .map((p) => {
            const [bx, by, bw, bh] = p.bbox.split(",").map(Number);
            const cx = bx + bw / 2;
            const cy = by + bh / 2;
            const isHost = p.isHost;

            return (
              <g key={`marker-${p.name}`}>
                <circle
                  cx={cx}
                  cy={cy}
                  r={isHost ? "7" : "5.5"}
                  fill="none"
                  stroke={isHost ? "var(--primary)" : "#0ea5e9"}
                  strokeWidth="1.2"
                  opacity="0.8"
                  className="origin-center animate-ping"
                  style={{ transformOrigin: `${cx}px ${cy}px` }}
                />
                <circle
                  cx={cx}
                  cy={cy}
                  r={isHost ? "8" : "6"}
                  fill={isHost ? "rgba(198,255,0,0.22)" : "rgba(14,165,233,0.25)"}
                />
                <circle
                  cx={cx}
                  cy={cy}
                  r={isHost ? "3.2" : "2.6"}
                  fill={isHost ? "var(--primary)" : "#0ea5e9"}
                  stroke="#0b1622"
                  strokeWidth="0.8"
                />
              </g>
            );
          })}
      </g>

      {/* Region Labels */}
      <g
        id="regionLabels"
        className="pointer-events-none select-none fill-muted-foreground text-[8px] font-semibold tracking-[0.22em] opacity-45"
      >
        <text x="495" y="88">
          EUROPE
        </text>
        <text x="575" y="168">
          MIDDLE EAST
        </text>
        <text x="535" y="245">
          AFRICA
        </text>
        <text x="760" y="184">
          ASIA PACIFIC
        </text>
      </g>
    </svg>
  );
}
