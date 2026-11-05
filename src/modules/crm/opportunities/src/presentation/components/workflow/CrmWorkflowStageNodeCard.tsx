"use client";

import React from "react";
import { CheckCircle2, Clock, GripVertical, Lock, XCircle } from "lucide-react";
import { Badge } from "@core/ui/badge";
import type { CrmCustomFieldDefinition } from "@modules/crm";
import type {
  CrmWorkflowStageNode,
  CrmWorkflowTransition,
} from "./CrmWorkflowCanvas2D";
import {
  NODE_HEIGHT,
  NODE_WIDTH,
  STAGE_PORTS,
  StagePortId,
  formatExitFieldLabel,
  getPortCoords,
} from "./CrmWorkflowCanvasSubViews";

export interface CrmWorkflowStageNodeCardProps {
  t: (k: string) => string;
  isAr: boolean;
  stage: CrmWorkflowStageNode;
  isSelected: boolean;
  showPorts: boolean;
  globalIncoming: CrmWorkflowTransition[];
  crmCustomFields: CrmCustomFieldDefinition[];
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onClickNode: () => void;
  onPointerDownNode: (e: React.PointerEvent) => void;
  onStartWireDraft: (
    fromStageKey: string,
    portId: StagePortId,
    startX: number,
    startY: number,
  ) => void;
  onSelectGlobalTransition: (transitionId: string) => void;
}

export function CrmWorkflowStageNodeCard({
  t,
  isAr,
  stage,
  isSelected,
  showPorts,
  globalIncoming,
  crmCustomFields,
  onMouseEnter,
  onMouseLeave,
  onClickNode,
  onPointerDownNode,
  onStartWireDraft,
  onSelectGlobalTransition,
}: CrmWorkflowStageNodeCardProps) {
  return (
    <div
      style={{ left: stage.x, top: stage.y, width: NODE_WIDTH, height: NODE_HEIGHT }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onPointerDown={onPointerDownNode}
      onClick={(e) => {
        e.stopPropagation();
        onClickNode();
      }}
      data-testid={`canvas-node-${stage.stageKey}`}
      className={`absolute rounded-md border bg-nx-surface p-2.5 flex flex-col justify-between transition-colors cursor-grab active:cursor-grabbing ${
        isSelected
          ? "border-primary ring-2 ring-primary/30"
          : stage.isTerminalWon
            ? "border-success/60 hover:border-success"
            : stage.isTerminalLost
              ? "border-destructive/60 hover:border-destructive"
              : "border-nx-line-hi hover:border-primary/60"
      }`}
    >
      {/* 8 Connection Ports (2 per side: Top, Right, Bottom, Left) */}
      {STAGE_PORTS.map((port) => (
        <div
          key={port.id}
          data-testid={`node-port-${stage.stageKey}-${port.id}`}
          title={t("crmOpportunities.pipelinesPage.portConnectHint")}
          onPointerDown={(e) => {
            e.stopPropagation();
            const start = getPortCoords(stage, port.id);
            onStartWireDraft(stage.stageKey, port.id, start.x, start.y);
          }}
          style={{
            left: `${port.rx * 100}%`,
            top: `${port.ry * 100}%`,
            transform: "translate(-50%, -50%)",
          }}
          className={`absolute w-3 h-3 rounded-full border-2 border-nx-surface bg-primary cursor-crosshair transition-opacity z-30 ${
            showPorts ? "opacity-100 scale-100" : "opacity-0 scale-75 pointer-events-none"
          }`}
        />
      ))}

      <div className="flex items-center justify-between gap-1">
        <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold uppercase text-nx-ink-2">
          <GripVertical className="w-3 h-3 text-nx-ink-3" />
          {stage.isTerminalWon ? (
            <span className="inline-flex items-center gap-1 text-success">
              <CheckCircle2 className="w-3 h-3" />
              {t("crmOpportunities.pipelinesPage.stageBadgeWon")}
            </span>
          ) : stage.isTerminalLost ? (
            <span className="inline-flex items-center gap-1 text-destructive">
              <XCircle className="w-3 h-3" />
              {t("crmOpportunities.pipelinesPage.stageBadgeLost")}
            </span>
          ) : stage.convertsToDeal ? (
            <span className="text-info">
              {t("crmOpportunities.pipelinesPage.stageBadgeConverts")}
            </span>
          ) : (
            `${t("crmOpportunities.pipelinesPage.stageBadgeStep")} ${stage.order}`
          )}
        </span>
        <Badge variant="outline" className="text-[10px] font-mono px-1.5 py-0 text-nx-ink">
          {stage.probability}%
        </Badge>
      </div>

      <div className="text-xs font-bold text-nx-ink truncate">
        {isAr ? stage.labelAr : stage.labelEn}
      </div>

      <div className="flex items-center justify-between text-[10px] text-nx-ink-2 pt-1 border-t border-nx-line">
        <span className="inline-flex items-center gap-1">
          <Clock className="w-2.5 h-2.5" />
          {stage.slaDays > 0
            ? `${stage.slaDays}d`
            : t("crmOpportunities.pipelinesPage.nodeTerminalLabel")}
        </span>
        {stage.requiredExitFields.length > 0 ? (
          <span
            className="inline-flex items-center gap-1 text-nx-ink font-semibold"
            title={stage.requiredExitFields
              .map((f) => formatExitFieldLabel(f, t, isAr, crmCustomFields))
              .join(", ")}
          >
            <Lock className="w-2.5 h-2.5 text-warning" />
            {stage.requiredExitFields.length}{" "}
            {t("crmOpportunities.pipelinesPage.nodeGuardsCount")}
          </span>
        ) : (
          <span className="text-nx-ink-3">
            {t("crmOpportunities.pipelinesPage.nodeOpenGate")}
          </span>
        )}
      </div>

      {globalIncoming.map((gtr) => (
        <div
          key={gtr.id}
          onClick={(e) => {
            e.stopPropagation();
            onSelectGlobalTransition(gtr.id);
          }}
          className="absolute -bottom-6 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full border border-nx-line-hi bg-nx-raised text-[9px] font-semibold text-nx-ink whitespace-nowrap cursor-pointer hover:border-primary"
        >
          {t("crmOpportunities.pipelinesPage.globalAllTransitionBadge")}:{" "}
          {isAr ? gtr.nameAr : gtr.nameEn}
        </div>
      ))}
    </div>
  );
}
