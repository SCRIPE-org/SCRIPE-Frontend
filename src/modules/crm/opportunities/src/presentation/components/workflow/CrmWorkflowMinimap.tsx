"use client";

import React, { useState } from "react";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import type { CrmWorkflowStageNode } from "./CrmWorkflowCanvas2D";

export interface CrmWorkflowMinimapProps {
  t: (k: string) => string;
  isAr: boolean;
  stages: CrmWorkflowStageNode[];
  selectedStageKey: string | null;
  zoom: number;
  canvasWidth: number;
  canvasHeight: number;
  nodeWidth: number;
  nodeHeight: number;
  onZoomChange: (zoom: number) => void;
  onSelectStage: (stageKey: string | null) => void;
  onSelectTransition: (id: string | null) => void;
  onPanToNormalized: (rx: number, ry: number) => void;
}

/**
 * True Proportional 2D Spatial Mini-Map & Viewport Navigator component (<170 lines).
 */
export function CrmWorkflowMinimap({
  t,
  isAr,
  stages,
  selectedStageKey,
  zoom,
  canvasWidth,
  canvasHeight,
  nodeWidth,
  nodeHeight,
  onZoomChange,
  onSelectStage,
  onSelectTransition,
  onPanToNormalized,
}: CrmWorkflowMinimapProps) {
  const [viewportLeftPct, setViewportLeftPct] = useState(2);
  const [viewportTopPct, setViewportTopPct] = useState(4);
  const viewportWidthPct = Math.min(72, Math.max(28, Math.round((80 / Math.max(50, zoom)) * 46)));

  return (
    <div
      className="absolute bottom-4 end-4 z-30 w-[212px] rounded-md border border-nx-line bg-nx-surface/95 p-2 space-y-1.5"
      data-testid="workflow-minimap"
    >
      <div className="flex items-center justify-between text-[10px] font-semibold text-nx-ink-2">
        <span>{t("crmOpportunities.pipelinesPage.minimapHeader")}</span>
        <span className="font-mono text-nx-ink">{zoom}%</span>
      </div>
      <div
        className="relative w-full h-[74px] rounded-xs border border-nx-line bg-nx-ground overflow-hidden cursor-pointer"
        data-testid="workflow-minimap-surface"
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const rx = rect.width > 0 ? (e.clientX - rect.left) / rect.width : 0.25;
          const ry = rect.height > 0 ? (e.clientY - rect.top) / rect.height : 0.25;
          setViewportLeftPct(Math.min(100 - viewportWidthPct, Math.max(2, Math.round(rx * 100 - viewportWidthPct / 2))));
          setViewportTopPct(Math.min(20, Math.max(2, Math.round(ry * 20))));
          onPanToNormalized(rx, ry);
        }}
      >
        <div
          data-testid="minimap-viewport-box"
          style={{
            left: `${viewportLeftPct}%`,
            top: `${viewportTopPct}%`,
            width: `${viewportWidthPct}%`,
            height: "88%",
          }}
          className="absolute rounded-xs border border-primary/60 bg-primary/5 pointer-events-none transition-all"
        />
        {stages.map((s) => {
          const leftPct = Math.min(88, Math.max(4, Math.round((s.x / canvasWidth) * 100)));
          const topPct = Math.min(78, Math.max(8, Math.round((s.y / canvasHeight) * 100)));
          const widthPct = Math.max(7, Math.round((nodeWidth / canvasWidth) * 100));
          const heightPct = Math.max(14, Math.round((nodeHeight / canvasHeight) * 100));
          const isSel = selectedStageKey === s.stageKey;
          const colorCls =
            s.isTerminalWon || s.category === "done"
              ? "bg-success/80 border-success"
              : s.isTerminalLost || s.category === "lost"
                ? "bg-destructive/80 border-destructive"
                : s.category === "todo"
                  ? "bg-nx-ink-3/70 border-nx-line-hi"
                  : "bg-info/80 border-info";
          return (
            <div
              key={s.stageKey}
              role="button"
              tabIndex={0}
              data-testid={`minimap-node-${s.stageKey}`}
              title={isAr ? s.labelAr : s.labelEn}
              onClick={(ev) => {
                ev.stopPropagation();
                onSelectStage(s.stageKey);
                onSelectTransition(null);
              }}
              onKeyDown={(ev) => {
                if (ev.key === "Enter" || ev.key === " ") {
                  ev.stopPropagation();
                  onSelectStage(s.stageKey);
                  onSelectTransition(null);
                }
              }}
              style={{
                left: `${leftPct}%`,
                top: `${topPct}%`,
                width: `${widthPct}%`,
                height: `${heightPct}%`,
              }}
              className={`absolute rounded-xs border transition-transform ${colorCls} ${
                isSel ? "ring-2 ring-primary scale-110 z-10" : "opacity-85 hover:opacity-100"
              }`}
            />
          );
        })}
      </div>
      <div className="flex items-center gap-1.5 pt-0.5">
        <span className="text-[9px] text-nx-ink-3 shrink-0">
          {t("crmOpportunities.pipelinesPage.minimapZoomSliderLabel")}
        </span>
        <Input
          type="range"
          min={50}
          max={150}
          step={5}
          value={zoom}
          onChange={(e) => onZoomChange(Math.max(50, Math.min(150, Number(e.target.value) || 80)))}
          className="h-4 px-0 py-0 border-0 bg-transparent cursor-pointer"
          data-testid="minimap-zoom-slider"
        />
      </div>
      <div className="flex items-center justify-between gap-1">
        <Button size="sm" variant="ghost" className="h-5 px-1.5 text-[10px]" onClick={() => onZoomChange(Math.max(50, zoom - 15))}>
          -15%
        </Button>
        <Button size="sm" variant="ghost" className="h-5 px-1.5 text-[10px]" onClick={() => onZoomChange(80)}>
          {t("crmOpportunities.pipelinesPage.resetZoomTitle")}
        </Button>
        <Button size="sm" variant="ghost" className="h-5 px-1.5 text-[10px]" onClick={() => onZoomChange(Math.min(150, zoom + 15))}>
          +15%
        </Button>
      </div>
    </div>
  );
}
