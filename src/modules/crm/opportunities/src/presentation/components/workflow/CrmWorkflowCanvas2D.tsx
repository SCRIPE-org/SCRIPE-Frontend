"use client";

import React, { useRef, useState } from "react";
import { CheckCircle2, Plus, RotateCcw, ShieldCheck, Zap, ZoomIn, ZoomOut } from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
import { Button } from "@core/ui/button";
import type { CrmCustomFieldDefinition } from "@modules/crm";
import {
  CrmWorkflowClassicFlowView,
  CrmWorkflowTransitionsTableView,
  NODE_HEIGHT,
  StagePortId,
  countTransitionRules,
  getPortCoords,
} from "./CrmWorkflowCanvasSubViews";
import { CrmWorkflowStageNodeCard } from "./CrmWorkflowStageNodeCard";

export interface CrmWorkflowStageNode {
  stageKey: string; labelEn: string; labelAr: string;
  probability: number; slaDays: number; order: number;
  isTerminalWon: boolean; isTerminalLost: boolean; convertsToDeal?: boolean;
  requiredExitFields: string[]; x: number; y: number;
}

export interface CrmWorkflowTransition {
  id: string; nameEn: string; nameAr: string; fromStageKey: string; toStageKey: string;
  direction?: "forward" | "backward" | "global"; requiredFields: string[];
  requireReason?: boolean; requireNote?: boolean; allowRollback?: boolean;
  blockIfLinkedDealProgressed?: boolean; requireVerifiedParty?: boolean;
  requireEstimatedAmountPositive?: boolean; triggerDealConversion?: boolean;
  autoCreateWorkTask?: boolean; restrictToRoles?: string[]; triggerWebhook?: string;
}

export interface CrmWorkflowCanvas2DProps {
  stages: CrmWorkflowStageNode[];
  transitions: CrmWorkflowTransition[];
  selectedStageKey: string | null;
  selectedTransitionId: string | null;
  viewMode: "diagram" | "classic" | "text";
  zoom: number;
  crmCustomFields?: CrmCustomFieldDefinition[];
  onZoomChange: (zoom: number) => void;
  onSelectStage: (stageKey: string | null) => void;
  onSelectTransition: (transitionId: string | null) => void;
  onNodeMove: (stageKey: string, x: number, y: number) => void;
  onOpenAddStage: () => void;
  onOpenAddTransition: (fromStageKey?: string, toStageKey?: string) => void;
  onOpenRuleForStage: (stageKey: string) => void;
  onValidateRules?: () => void;
}

/** 2D interactive workflow canvas with 8 connection ports per node and non-overlapping transition lanes. */
export function CrmWorkflowCanvas2D({
  stages, transitions, selectedStageKey, selectedTransitionId, viewMode, zoom,
  crmCustomFields = [], onZoomChange, onSelectStage, onSelectTransition,
  onNodeMove, onOpenAddStage, onOpenAddTransition, onOpenRuleForStage, onValidateRules,
}: CrmWorkflowCanvas2DProps) {
  const { t, language } = useI18n();
  const isAr = language === "ar";
  const canvasRef = useRef<HTMLDivElement>(null);
  const [draggingKey, setDraggingKey] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ dx: 0, dy: 0 });
  const [hoveredStageKey, setHoveredStageKey] = useState<string | null>(null);
  const [wireDraft, setWireDraft] = useState<{
    fromStageKey: string; fromPortId: StagePortId; startX: number; startY: number; currX: number; currY: number;
  } | null>(null);

  if (viewMode === "classic") {
    return (
      <CrmWorkflowClassicFlowView
        t={t} isAr={isAr} stages={stages} selectedStageKey={selectedStageKey}
        onSelectStage={(k) => { onSelectStage(k); onSelectTransition(null); }}
      />
    );
  }
  if (viewMode === "text") {
    return (
      <CrmWorkflowTransitionsTableView
        t={t} isAr={isAr} stages={stages} transitions={transitions}
        selectedTransitionId={selectedTransitionId} crmCustomFields={crmCustomFields}
        onSelectTransition={(id) => { onSelectTransition(id); onSelectStage(null); }}
        onOpenAddTransition={() => onOpenAddTransition()}
      />
    );
  }

  const scale = zoom / 100;
  const toCanvasCoords = (clientX: number, clientY: number) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    return rect ? { x: (clientX - rect.left) / scale, y: (clientY - rect.top) / scale } : { x: 0, y: 0 };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    const pt = toCanvasCoords(e.clientX, e.clientY);
    if (wireDraft) { setWireDraft({ ...wireDraft, currX: pt.x, currY: pt.y }); return; }
    if (!draggingKey) return;
    onNodeMove(
      draggingKey,
      Math.max(24, Math.round((pt.x - dragOffset.dx) / 12) * 12),
      Math.max(24, Math.round((pt.y - dragOffset.dy) / 12) * 12),
    );
  };

  const handlePointerUp = () => {
    if (wireDraft && hoveredStageKey && hoveredStageKey !== wireDraft.fromStageKey) {
      onOpenAddTransition(wireDraft.fromStageKey, hoveredStageKey);
    }
    setWireDraft(null);
    setDraggingKey(null);
  };

  const firstStage = [...stages].sort((a, b) => a.order - b.order)[0];
  const nodeMap = new Map(stages.map((s) => [s.stageKey, s]));
  const directTransitions = transitions.filter((tr) => tr.fromStageKey !== "*");
  const wildcardTransitions = transitions.filter((tr) => tr.fromStageKey === "*");
  const canvasWidth = Math.max(2280, ...stages.map((s) => s.x + 340));
  const canvasHeight = Math.max(660, ...stages.map((s) => s.y + 240));
  let fwdSkipIdx = 0;
  let bwdSkipIdx = 0;

  return (
    <div className="relative flex-1 flex flex-col bg-nx-ground overflow-hidden select-none" data-testid="crm-workflow-canvas-card">
      <div className="flex items-center justify-between px-4 py-2 border-b border-nx-line bg-nx-surface z-20">
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={onOpenAddStage} data-testid="crm-toolbar-add-status">
            <Plus className="w-3.5 h-3.5 me-1.5 text-success" />
            {t("crmOpportunities.pipelinesPage.addStatusBtn")}
          </Button>
          <Button size="sm" variant="outline" onClick={() => onOpenAddTransition()} data-testid="crm-toolbar-add-transition">
            <Zap className="w-3.5 h-3.5 me-1.5 text-warning" />
            {t("crmOpportunities.pipelinesPage.addTransitionBtn")}
          </Button>
          <Button
            size="sm" variant="outline" data-testid="crm-toolbar-add-rule"
            onClick={() => { const target = selectedStageKey ?? firstStage?.stageKey; if (target) onOpenRuleForStage(target); }}
          >
            <ShieldCheck className="w-3.5 h-3.5 me-1.5 text-info" />
            {t("crmOpportunities.pipelinesPage.addRuleBtn")}
          </Button>
          {onValidateRules && (
            <Button size="sm" variant="outline" onClick={onValidateRules} data-testid="canvas-validate-rules">
              <CheckCircle2 className="w-3.5 h-3.5 me-1.5 text-success" />
              {t("crmOpportunities.pipelinesPage.validateWorkflowRulesBtn")}
            </Button>
          )}
          <span className="hidden xl:inline-flex items-center text-[11px] text-nx-ink-2 ms-2">
            {t("crmOpportunities.pipelinesPage.portConnectHint")}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => onZoomChange(Math.max(55, zoom - 10))} title={t("crmOpportunities.pipelinesPage.zoomOutTitle")}>
            <ZoomOut className="w-3.5 h-3.5" />
          </Button>
          <span className="text-xs font-mono font-semibold text-nx-ink min-w-[44px] text-center">{zoom}%</span>
          <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => onZoomChange(Math.min(130, zoom + 10))} title={t("crmOpportunities.pipelinesPage.zoomInTitle")}>
            <ZoomIn className="w-3.5 h-3.5" />
          </Button>
          <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => onZoomChange(80)} title={t("crmOpportunities.pipelinesPage.resetZoomTitle")}>
            <RotateCcw className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      <div
        className="relative flex-1 overflow-auto bg-[radial-gradient(var(--color-nx-line)_1px,transparent_1px)] [background-size:20px_20px]"
        onPointerMove={handlePointerMove} onPointerUp={handlePointerUp}
        onClick={() => { onSelectStage(null); onSelectTransition(null); }}
        data-testid="crm-2d-graph-surface"
      >
        <div ref={canvasRef} className="relative origin-top-left" style={{ width: canvasWidth, height: canvasHeight, transform: `scale(${scale})` }}>
          <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible" data-testid="crm-2d-svg-edges">
            <defs>
              <marker id="wf-arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
                <path d="M0,0 L8,4 L0,8 Z" className="fill-nx-ink-2" />
              </marker>
              <marker id="wf-arrow-active" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
                <path d="M0,0 L8,4 L0,8 Z" className="fill-primary" />
              </marker>
            </defs>
            {firstStage && (
              <path d={`M 74 228 L ${firstStage.x} ${firstStage.y + NODE_HEIGHT / 2}`} className="stroke-nx-ink-2" strokeWidth={2} strokeDasharray="4 4" fill="none" markerEnd="url(#wf-arrow)" />
            )}
            {directTransitions.map((tr) => {
              const fromNode = nodeMap.get(tr.fromStageKey);
              const toNode = nodeMap.get(tr.toStageKey);
              if (!fromNode || !toNode) return null;
              const isSelected = selectedTransitionId === tr.id;
              const isBackward = toNode.order < fromNode.order || toNode.x < fromNode.x;
              const isTerminalBranch = toNode.isTerminalWon || toNode.isTerminalLost;
              let path = ""; let labelX = 0; let labelY = 0;
              if (isTerminalBranch) {
                const start = getPortCoords(fromNode, toNode.isTerminalWon ? "right-1" : "right-2");
                const end = getPortCoords(toNode, "left-1");
                const midX = Math.round((start.x + end.x) / 2);
                path = `M ${start.x} ${start.y} L ${midX} ${start.y} L ${midX} ${end.y} L ${end.x} ${end.y}`;
                labelX = midX;
                labelY = toNode.isTerminalWon ? Math.min(start.y, end.y) - 18 : Math.max(start.y, end.y) + 18;
              } else if (!isBackward) {
                const span = Math.abs(toNode.order - fromNode.order);
                const channelY = span > 1 ? 22 + (fwdSkipIdx++ % 2) * 28 : fromNode.order % 2 === 1 ? 80 : 118;
                const start = getPortCoords(fromNode, "top-2"); const end = getPortCoords(toNode, "top-1");
                path = `M ${start.x} ${start.y} L ${start.x} ${channelY} L ${end.x} ${channelY} L ${end.x} ${end.y}`;
                labelX = Math.round((start.x + end.x) / 2); labelY = channelY;
              } else {
                const span = Math.abs(toNode.order - fromNode.order);
                const channelY = span > 1 ? 432 + (bwdSkipIdx++ % 2) * 32 : fromNode.order % 2 === 0 ? 348 : 388;
                const start = getPortCoords(fromNode, "bottom-1"); const end = getPortCoords(toNode, "bottom-2");
                path = `M ${start.x} ${start.y} L ${start.x} ${channelY} L ${end.x} ${channelY} L ${end.x} ${end.y}`;
                labelX = Math.round((start.x + end.x) / 2); labelY = channelY;
              }
              const ruleCount = countTransitionRules(tr);
              return (
                <g key={tr.id} className="pointer-events-auto cursor-pointer" onClick={(e) => { e.stopPropagation(); onSelectTransition(tr.id); onSelectStage(null); }}>
                  <path d={path} fill="none" strokeWidth={isSelected ? 2.5 : 1.75} strokeDasharray={isBackward ? "5 4" : undefined} className={isSelected ? "stroke-primary" : "stroke-nx-ink-2"} markerEnd={isSelected ? "url(#wf-arrow-active)" : "url(#wf-arrow)"} />
                  <foreignObject x={labelX - 76} y={labelY - 13} width={152} height={26}>
                    <div
                      data-testid={`canvas-transition-${tr.fromStageKey}`}
                      className={`h-full px-2 rounded-full border text-[10px] font-semibold flex items-center justify-center gap-1 truncate transition-colors ${
                        isSelected ? "bg-primary text-nx-on-fill border-primary" : "bg-nx-surface text-nx-ink border-nx-line-hi hover:border-primary"
                      }`}
                    >
                      <Zap className="w-2.5 h-2.5 shrink-0" />
                      <span className="truncate">{isAr ? tr.nameAr : tr.nameEn}</span>
                      {ruleCount > 0 && <span className="font-mono text-[9px] opacity-80">({ruleCount})</span>}
                    </div>
                  </foreignObject>
                </g>
              );
            })}
            {wireDraft && (
              <path d={`M ${wireDraft.startX} ${wireDraft.startY} L ${wireDraft.currX} ${wireDraft.currY}`} fill="none" strokeWidth={2.5} strokeDasharray="4 3" className="stroke-primary" markerEnd="url(#wf-arrow-active)" data-testid="canvas-live-connection-wire" />
            )}
          </svg>

          <div data-testid="canvas-node-start" className="absolute left-[18px] top-[204px] w-[56px] h-[48px] rounded-full border-2 border-nx-line-hi bg-nx-raised flex flex-col items-center justify-center text-[10px] font-bold text-nx-ink">
            {t("crmOpportunities.pipelinesPage.startNodeLabel")}
          </div>

          {stages.map((stage) => (
            <CrmWorkflowStageNodeCard
              key={stage.stageKey} t={t} isAr={isAr} stage={stage}
              isSelected={selectedStageKey === stage.stageKey}
              showPorts={selectedStageKey === stage.stageKey || hoveredStageKey === stage.stageKey || Boolean(wireDraft)}
              globalIncoming={wildcardTransitions.filter((w) => w.toStageKey === stage.stageKey)}
              crmCustomFields={crmCustomFields}
              onMouseEnter={() => setHoveredStageKey(stage.stageKey)}
              onMouseLeave={() => setHoveredStageKey((prev) => (prev === stage.stageKey ? null : prev))}
              onClickNode={() => { onSelectStage(stage.stageKey); onSelectTransition(null); }}
              onPointerDownNode={(e) => {
                e.stopPropagation(); onSelectStage(stage.stageKey); onSelectTransition(null);
                const pt = toCanvasCoords(e.clientX, e.clientY);
                setDraggingKey(stage.stageKey); setDragOffset({ dx: pt.x - stage.x, dy: pt.y - stage.y });
              }}
              onStartWireDraft={(fromStageKey, fromPortId, startX, startY) =>
                setWireDraft({ fromStageKey, fromPortId, startX, startY, currX: startX, currY: startY })
              }
              onSelectGlobalTransition={(id) => { onSelectTransition(id); onSelectStage(null); }}
            />
          ))}
        </div>
      </div>

      <div className="absolute bottom-4 end-4 z-30 rounded-md border border-nx-line bg-nx-surface/95 px-2.5 py-1.5 flex items-center gap-1.5 pointer-events-none" data-testid="workflow-minimap">
        {stages.map((s) => (
          <span key={s.stageKey} className={`w-2.5 h-2 rounded-xs ${selectedStageKey === s.stageKey ? "bg-primary" : "bg-nx-ink-3"}`} />
        ))}
      </div>
    </div>
  );
}
