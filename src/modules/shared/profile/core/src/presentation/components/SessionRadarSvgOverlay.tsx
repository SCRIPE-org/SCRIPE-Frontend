"use client";

/**
 * SessionRadarSvgOverlay
 *
 * Interactive OpenStreetMap tile grid, GeoJSON vector coastline overlay,
 * anti-collision pin layer, and map zoom toolbar for `SovereignSessionRadar`.
 */
import { useI18n } from "@core/providers/i18n-provider";
import { Button } from "@core/ui/button";
import { Minus, Navigation, Plus, RotateCcw } from "lucide-react";
import type { PositionedRadarNode } from "../utils/session-radar.utils";
import { SessionRadarBackdropSvg } from "./SessionRadarBackdropSvg";

const OSM_TILE_COORDS: ReadonlyArray<[number, number, number]> = [
  [5, 17, 12],
  [5, 18, 12],
  [5, 19, 12],
  [5, 20, 12],
  [5, 17, 13],
  [5, 18, 13],
  [5, 19, 13],
  [5, 20, 13],
];

interface SessionRadarSvgOverlayProps {
  positionedNodes: PositionedRadarNode[];
  activeNodeId?: string;
  zoom: number;
  isLight: boolean;
  onZoomChange: (nextZoom: number) => void;
  onSelectNode: (nodeId: string) => void;
}

/** Interactive OpenStreetMap + SVG vector radar map viewport with zoom controls. */
export function SessionRadarSvgOverlay({
  positionedNodes,
  activeNodeId,
  zoom,
  isLight,
  onZoomChange,
  onSelectNode,
}: SessionRadarSvgOverlayProps) {
  const { t } = useI18n();
  const tileStyle = isLight ? "light_all" : "dark_all";

  return (
    <div
      data-testid="interactive-osm-map-container"
      className="relative w-full h-72 rounded-xl border border-nx-line overflow-hidden select-none bg-nx-raised"
    >
      <div
        className="absolute inset-0 grid grid-cols-4 grid-rows-2 pointer-events-none transition-transform duration-300"
        style={{
          transform: `scale(${zoom})`,
          transformOrigin: "45% 58%",
          filter: isLight
            ? "saturate(0.8) contrast(1.03) brightness(1.02)"
            : "invert(92%) hue-rotate(185deg) brightness(86%) contrast(108%) saturate(65%)",
        }}
      >
        {OSM_TILE_COORDS.map(([z, x, y], idx) => (
          <div
            key={`${tileStyle}-${idx}`}
            className="w-full h-full bg-cover bg-center"
            style={{ backgroundImage: `url(https://tile.openstreetmap.org/${z}/${x}/${y}.png)` }}
          />
        ))}
      </div>

      <svg
        viewBox="0 0 800 340"
        className="relative z-10 w-full h-full transition-transform duration-300"
        style={{ transform: `scale(${zoom})`, transformOrigin: "45% 58%" }}
        role="img"
        aria-label={t("profile.sessions.radarAriaLabel")}
      >
        <SessionRadarBackdropSvg isLight={isLight} />

        {positionedNodes[0] && (
          <g pointerEvents="none">
            <circle
              cx={positionedNodes[0].cx}
              cy={positionedNodes[0].cy}
              r="34"
              fill="none"
              stroke={isLight ? "rgba(15, 23, 42, 0.14)" : "rgba(196, 240, 66, 0.18)"}
              strokeWidth="1"
              strokeDasharray="3 3"
            />
            <circle
              cx={positionedNodes[0].cx}
              cy={positionedNodes[0].cy}
              r="68"
              fill="none"
              stroke={isLight ? "rgba(15, 23, 42, 0.08)" : "rgba(196, 240, 66, 0.1)"}
              strokeWidth="1"
              strokeDasharray="4 4"
            />
          </g>
        )}

        {positionedNodes.length > 1 &&
          positionedNodes.slice(1).map((node) => {
            const origin = positionedNodes[0];
            const midX = (origin.cx + node.cx) / 2;
            const midY = Math.min(origin.cy, node.cy) - 28;
            return (
              <path
                key={`arc-${node.id}`}
                d={`M ${origin.cx} ${origin.cy} Q ${midX} ${midY} ${node.cx} ${node.cy}`}
                fill="none"
                stroke="rgba(196, 240, 66, 0.45)"
                strokeWidth="1.4"
                strokeDasharray="4 4"
              />
            );
          })}

        {positionedNodes.map((node) => {
          const isSelected = activeNodeId === node.id;
          const pillWidth = Math.max(98, node.cityLabel.length * 6.2 + 24);
          return (
            <g
              key={node.id}
              data-testid={`session-map-pin-${node.id}`}
              className="cursor-pointer"
              onClick={() => onSelectNode(node.id)}
            >
              <line
                x1={node.cx}
                y1={node.cy}
                x2={node.lx + 12}
                y2={node.ly}
                stroke={node.isCurrent ? "var(--nx-accent)" : "hsl(var(--info))"}
                strokeWidth="1.2"
                strokeOpacity="0.75"
              />
              <circle
                cx={node.cx}
                cy={node.cy}
                r={isSelected ? "14" : "9"}
                fill={
                  node.isCurrent
                    ? "color-mix(in srgb, var(--nx-accent) 22%, transparent)"
                    : "color-mix(in srgb, hsl(var(--info)) 18%, transparent)"
                }
              />
              <circle
                cx={node.cx}
                cy={node.cy}
                r={isSelected ? "5.5" : "4.2"}
                fill={node.isCurrent ? "var(--nx-accent)" : "hsl(var(--info))"}
                stroke="var(--nx-ink)"
                strokeWidth="1.5"
              />
              <rect
                x={node.lx}
                y={node.ly - 11}
                width={pillWidth}
                height="20"
                rx="6"
                fill="var(--nx-surface)"
                stroke={isSelected ? "var(--nx-accent)" : "var(--nx-line-hi)"}
                strokeWidth={isSelected ? "1.4" : "1"}
              />
              <text
                x={node.lx + 8}
                y={node.ly + 2.5}
                fill="var(--nx-ink)"
                fontSize="9.5"
                fontFamily="monospace"
                fontWeight="700"
              >
                {node.cityLabel}
              </text>
            </g>
          );
        })}
      </svg>

      <div className="absolute top-3 right-3 z-20 flex flex-col gap-1 rounded-lg border border-nx-line bg-nx-surface text-nx-ink p-1">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          data-testid="map-zoom-in-btn"
          onClick={() => onZoomChange(Math.min(2.2, Number((zoom + 0.2).toFixed(2))))}
          className="h-7 w-7 p-0 text-nx-ink hover:bg-nx-raised"
          aria-label={t("profile.sessions.mapZoomIn")}
        >
          <Plus className="h-3.5 w-3.5" style={{ minWidth: 14, minHeight: 14 }} />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          data-testid="map-zoom-out-btn"
          onClick={() => onZoomChange(Math.max(1.0, Number((zoom - 0.2).toFixed(2))))}
          className="h-7 w-7 p-0 text-nx-ink hover:bg-nx-raised"
          aria-label={t("profile.sessions.mapZoomOut")}
        >
          <Minus className="h-3.5 w-3.5" style={{ minWidth: 14, minHeight: 14 }} />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          data-testid="map-reset-view-btn"
          onClick={() => onZoomChange(1.35)}
          className="h-7 w-7 p-0 text-nx-ink hover:bg-nx-raised"
          aria-label={t("profile.sessions.mapResetView")}
        >
          <RotateCcw className="h-3.5 w-3.5" style={{ minWidth: 14, minHeight: 14 }} />
        </Button>
      </div>

      <div className="absolute bottom-2.5 left-3 right-3 z-20 flex items-center justify-between text-[10px] font-mono text-nx-ink bg-nx-surface px-2.5 py-1 rounded-md border border-nx-line">
        <span className="flex items-center gap-1.5">
          <Navigation className="h-3 w-3 text-nx-accent" style={{ minWidth: 12, minHeight: 12 }} />
          <span>{t("profile.sessions.radarLegendCurrent")}</span>
        </span>
        <span>© OpenStreetMap contributors • © CARTO ({Math.round(zoom * 100)}%)</span>
      </div>
    </div>
  );
}
