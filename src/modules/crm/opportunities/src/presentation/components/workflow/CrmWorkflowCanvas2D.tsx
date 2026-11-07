"use client";

import React, { useRef, useState } from "react";
import { CheckCircle2, Eye, EyeOff, LayoutGrid, Play, Plus, RotateCcw, ShieldCheck, Zap, ZoomIn, ZoomOut } from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
import { Button } from "@core/ui/button";
import type { CrmCustomFieldDefinition, CrmStageColorToken, CrmWorkflowCatalogRule, CrmWorkflowStageCategory } from "@modules/crm";
import { CrmWorkflowClassicFlowView, CrmWorkflowTransitionsTableView, NODE_HEIGHT, NODE_WIDTH, StagePortId, getPortCoords } from "./CrmWorkflowCanvasSubViews";
import { chooseBestTargetPort, resolveDropTargetAtPointer } from "./crmWorkflowEdgeRouting";
import { CrmWorkflowStageNodeCard } from "./CrmWorkflowStageNodeCard";
import { CrmWorkflowMinimap } from "./CrmWorkflowMinimap";
import { CrmWorkflowSvgEdgesLayer } from "./CrmWorkflowSvgEdgesLayer";
import { CrmWorkflowSimulationSandbox } from "./CrmWorkflowSimulationSandbox";

export interface CrmWorkflowStageNode {
  stageKey: string; labelEn: string; labelAr: string; probability: number; slaDays: number; order: number;
  category?: CrmWorkflowStageCategory; color?: CrmStageColorToken; customColorHex?: string;
  properties?: Record<string, string>; allowInboundFromAny?: boolean;
  isTerminalWon: boolean; isTerminalLost: boolean; convertsToDeal?: boolean;
  requiredExitFields: string[]; x: number; y: number;
}

export interface CrmWorkflowTransition {
  id: string; nameEn: string; nameAr: string; fromStageKey: string; fromStageKeys?: string[];
  toStageKey: string; direction?: "forward" | "backward" | "global"; requiredFields: string[];
  sourcePort?: StagePortId; targetPort?: StagePortId;
  requireReason?: boolean; requireNote?: boolean; allowRollback?: boolean;
  blockIfLinkedDealProgressed?: boolean; requireVerifiedParty?: boolean;
  requireEstimatedAmountPositive?: boolean; triggerDealConversion?: boolean;
  autoCreateWorkTask?: boolean; restrictToRoles?: string[]; triggerWebhook?: string;
  domainEventKey?: string; triggers?: string[]; properties?: Record<string, string>;
  catalogRules?: CrmWorkflowCatalogRule[];
}

export interface CrmWorkflowCanvas2DProps {
  stages: CrmWorkflowStageNode[]; transitions: CrmWorkflowTransition[];
  selectedStageKey: string | null; selectedTransitionId: string | null;
  viewMode: "diagram" | "classic" | "text"; zoom: number;
  crmCustomFields?: CrmCustomFieldDefinition[]; onZoomChange: (zoom: number) => void;
  onSelectStage: (stageKey: string | null) => void; onSelectTransition: (transitionId: string | null) => void;
  onNodeMove: (stageKey: string, x: number, y: number) => void; onAutoLayout?: () => void;
  onOpenAddStage: () => void;
  onOpenAddTransition: (fromStageKey?: string, toStageKey?: string, sourcePort?: StagePortId, targetPort?: StagePortId) => void;
  onOpenRuleForStage: (stageKey: string) => void; onValidateRules?: () => void;
}

/** 2D interactive workflow canvas with 8 Jira perimeter ports per node, exact drop-target resolution, and 2D mini-map (<195 lines). */
export function CrmWorkflowCanvas2D({
  stages, transitions, selectedStageKey, selectedTransitionId, viewMode, zoom,
  crmCustomFields = [], onZoomChange, onSelectStage, onSelectTransition,
  onNodeMove, onAutoLayout, onOpenAddStage, onOpenAddTransition, onOpenRuleForStage, onValidateRules,
}: CrmWorkflowCanvas2DProps) {
  const { t, language } = useI18n();
  const isAr = language === "ar";
  const canvasRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const suppressClickRef = useRef(false);
  const [draggingKey, setDraggingKey] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ dx: 0, dy: 0 });
  const [hoveredStageKey, setHoveredStageKey] = useState<string | null>(null);
  const [showTransitionLabels, setShowTransitionLabels] = useState(true);
  const [simModeOpen, setSimModeOpen] = useState(false);
  const [scrollPos, setScrollPos] = useState({ left: 0, top: 0 });
  const [wireDraft, setWireDraft] = useState<{
    fromStageKey: string; originStageKey?: string; fromPortId: StagePortId; startX: number; startY: number; currX: number; currY: number;
    targetStageKey?: string | null; targetPortId?: StagePortId | null;
  } | null>(null);

  if (viewMode === "classic") return <CrmWorkflowClassicFlowView t={t} isAr={isAr} stages={stages} selectedStageKey={selectedStageKey} onSelectStage={(k) => { onSelectStage(k); onSelectTransition(null); }} />;
  if (viewMode === "text") return <CrmWorkflowTransitionsTableView t={t} isAr={isAr} stages={stages} transitions={transitions} selectedTransitionId={selectedTransitionId} crmCustomFields={crmCustomFields} onSelectTransition={(id) => { onSelectTransition(id); onSelectStage(null); }} onOpenAddTransition={() => onOpenAddTransition()} />;

  const scale = zoom / 100;
  const nodeMap = new Map(stages.map((s) => [s.stageKey, s]));
  const toCanvasCoords = (clientX: number, clientY: number) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect || (rect.width === 0 && rect.height === 0)) return { x: clientX, y: clientY };
    return { x: (clientX - rect.left) / scale, y: (clientY - rect.top) / scale };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    const pt = toCanvasCoords(e.clientX, e.clientY);
    if (wireDraft) {
      const excludeKey = wireDraft.originStageKey ?? wireDraft.fromStageKey;
      const hit = resolveDropTargetAtPointer(e.clientX, e.clientY, pt, stages, excludeKey, e.target);
      const fromNode = nodeMap.get(excludeKey);
      const toNode = hit.targetStageKey ? nodeMap.get(hit.targetStageKey) : undefined;
      const snappedPort = fromNode && toNode ? chooseBestTargetPort(fromNode, toNode, hit.targetPortId, wireDraft.fromPortId) : hit.targetPortId;
      const snapCoords = toNode && snappedPort ? getPortCoords(toNode, snappedPort) : pt;
      setHoveredStageKey(hit.targetStageKey);
      setWireDraft({ ...wireDraft, currX: snapCoords.x, currY: snapCoords.y, targetStageKey: hit.targetStageKey, targetPortId: snappedPort });
      return;
    }
    if (!draggingKey) return;
    onNodeMove(draggingKey, Math.max(24, Math.round((pt.x - dragOffset.dx) / 12) * 12), Math.max(24, Math.round((pt.y - dragOffset.dy) / 12) * 12));
  };

  const finishWireConnection = (explicitTargetKey?: string | null, explicitPortId?: StagePortId | null, e?: React.PointerEvent) => {
    if (wireDraft) {
      const excludeKey = wireDraft.originStageKey ?? wireDraft.fromStageKey;
      if (Math.hypot(wireDraft.currX - wireDraft.startX, wireDraft.currY - wireDraft.startY) > 6 || explicitTargetKey) suppressClickRef.current = true;
      let resolvedKey = explicitTargetKey ?? null, resolvedPort = explicitPortId ?? null;
      if (e && (!resolvedKey || !resolvedPort)) {
        const hasRealCoords = e.clientX !== 0 || e.clientY !== 0, pt = toCanvasCoords(e.clientX, e.clientY);
        const hit = resolveDropTargetAtPointer(e.clientX, e.clientY, pt, stages, excludeKey, e.target);
        if (!resolvedKey) resolvedKey = hit.targetStageKey ?? (hasRealCoords ? null : wireDraft.targetStageKey ?? hoveredStageKey);
        if (!resolvedPort) resolvedPort = hit.targetPortId ?? (wireDraft.targetStageKey === resolvedKey ? wireDraft.targetPortId ?? null : null);
      } else if (!resolvedKey) {
        resolvedKey = wireDraft.targetStageKey ?? hoveredStageKey;
        resolvedPort = wireDraft.targetPortId ?? null;
      } else if (!resolvedPort && wireDraft.targetStageKey === resolvedKey) {
        resolvedPort = wireDraft.targetPortId ?? null;
      }
      if (resolvedKey && resolvedKey !== excludeKey) {
        const fromNode = nodeMap.get(excludeKey), toNode = nodeMap.get(resolvedKey);
        const finalPort = fromNode && toNode ? chooseBestTargetPort(fromNode, toNode, resolvedPort, wireDraft.fromPortId) : (resolvedPort ?? undefined);
        onOpenAddTransition(wireDraft.fromStageKey, resolvedKey, wireDraft.fromPortId, finalPort);
      }
    }
    setWireDraft(null);
    setDraggingKey(null);
  };

  const handleTidyAutoLayout = () => {
    if (onAutoLayout) { onAutoLayout(); return; }
    const ordered = [...stages].sort((a, b) => a.order - b.order);
    ordered.filter((s) => !s.isTerminalWon && !s.isTerminalLost).forEach((st, idx) => {
      onNodeMove(st.stageKey, idx < 3 ? 110 + idx * 300 : 160 + ((idx - 3) % 3) * 300, idx < 3 ? 84 : 84 + Math.floor(idx / 3) * 276);
    });
    const wonStage = ordered.find((s) => s.isTerminalWon), lostStage = ordered.find((s) => s.isTerminalLost);
    if (wonStage) onNodeMove(wonStage.stageKey, 1010, 84);
    if (lostStage) onNodeMove(lostStage.stageKey, 1010, 360);
  };

  const firstStage = [...stages].sort((a, b) => a.order - b.order)[0];
  const directTransitions = transitions.filter((tr) => tr.fromStageKey !== "*");
  const wildcardTransitions = transitions.filter((tr) => tr.fromStageKey === "*" || tr.fromStageKeys?.includes("*"));
  const canvasWidth = Math.max(1280, ...stages.map((s) => s.x + 280));
  const canvasHeight = Math.max(580, ...stages.map((s) => s.y + 200));

  return (
    <div className="relative flex-1 flex flex-col bg-nx-ground overflow-hidden select-none" data-testid="crm-workflow-canvas-card">
      <div className="flex items-center justify-between px-4 py-2 border-b border-nx-line bg-nx-surface z-20">
        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" variant="outline" onClick={onOpenAddStage} data-testid="crm-toolbar-add-status"><Plus className="w-3.5 h-3.5 me-1.5 text-success" />{t("crmOpportunities.pipelinesPage.addStatusBtn").replace(/^\+\s*/, "")}</Button>
          <Button size="sm" variant="outline" onClick={() => onOpenAddTransition()} data-testid="crm-toolbar-add-transition"><Zap className="w-3.5 h-3.5 me-1.5 text-warning" />{t("crmOpportunities.pipelinesPage.addTransitionBtn").replace(/^\+\s*/, "")}</Button>
          <Button size="sm" variant="outline" data-testid="crm-toolbar-add-rule" onClick={() => { const target = selectedStageKey ?? firstStage?.stageKey; if (target) onOpenRuleForStage(target); }}><ShieldCheck className="w-3.5 h-3.5 me-1.5 text-info" />{t("crmOpportunities.pipelinesPage.addRuleBtn").replace(/^\+\s*/, "")}</Button>
          <Button size="sm" variant="outline" onClick={handleTidyAutoLayout} data-testid="canvas-tidy-auto-layout-btn"><LayoutGrid className="w-3.5 h-3.5 me-1.5 text-primary" />{t("crmOpportunities.pipelinesPage.tidyLayoutBtn")}</Button>
          <Button size="sm" variant={showTransitionLabels ? "secondary" : "outline"} onClick={() => setShowTransitionLabels((v) => !v)} data-testid="canvas-toggle-transition-labels">{showTransitionLabels ? <Eye className="w-3.5 h-3.5 me-1.5 text-primary" /> : <EyeOff className="w-3.5 h-3.5 me-1.5 text-nx-ink-3" />}{t("crmOpportunities.pipelinesPage.showTransitionLabelsCheck")}</Button>
          <Button size="sm" variant={simModeOpen ? "secondary" : "outline"} onClick={() => setSimModeOpen((v) => !v)} data-testid="canvas-simulate-workflow-btn"><Play className="w-3.5 h-3.5 me-1.5 text-success" />{t("crmOpportunities.workflowSandbox.simulateBtn")}</Button>
          {onValidateRules && <Button size="sm" variant="outline" onClick={onValidateRules} data-testid="canvas-validate-rules"><CheckCircle2 className="w-3.5 h-3.5 me-1.5 text-success" />{t("crmOpportunities.pipelinesPage.validateWorkflowRulesBtn")}</Button>}
        </div>
        <div className="flex items-center gap-1.5">
          <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => onZoomChange(Math.max(50, zoom - 10))} title={t("crmOpportunities.pipelinesPage.zoomOutTitle")}><ZoomOut className="w-3.5 h-3.5" /></Button>
          <span className="text-xs font-mono font-semibold text-nx-ink min-w-[44px] text-center">{zoom}%</span>
          <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => onZoomChange(Math.min(150, zoom + 10))} title={t("crmOpportunities.pipelinesPage.zoomInTitle")}><ZoomIn className="w-3.5 h-3.5" /></Button>
          <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => onZoomChange(80)} title={t("crmOpportunities.pipelinesPage.resetZoomTitle")}><RotateCcw className="w-3.5 h-3.5" /></Button>
        </div>
      </div>

      {simModeOpen && <CrmWorkflowSimulationSandbox isAr={isAr} stages={stages} transitions={transitions} selectedStageKey={selectedStageKey} onSelectTransition={(id) => { onSelectTransition(id); onSelectStage(null); }} onClose={() => setSimModeOpen(false)} />}

      <div
        ref={scrollContainerRef} className="relative flex-1 overflow-auto bg-[radial-gradient(var(--color-nx-line)_1px,transparent_1px)] [background-size:20px_20px]"
        onScroll={(e) => setScrollPos({ left: e.currentTarget.scrollLeft, top: e.currentTarget.scrollTop })} onPointerMove={handlePointerMove} onPointerUp={(e) => finishWireConnection(null, null, e)}
        onClick={() => { if (suppressClickRef.current) { suppressClickRef.current = false; return; } onSelectStage(null); onSelectTransition(null); }} data-testid="crm-2d-graph-surface"
      >
        <div ref={canvasRef} className="relative origin-top-left" style={{ width: canvasWidth, height: canvasHeight, transform: `scale(${scale})` }}>
          <CrmWorkflowSvgEdgesLayer isAr={isAr} firstStage={firstStage} directTransitions={directTransitions} nodeMap={nodeMap} selectedTransitionId={selectedTransitionId} showTransitionLabels={showTransitionLabels} wireDraft={wireDraft} onSelectTransition={onSelectTransition} onSelectStage={onSelectStage} />
          <div data-testid="canvas-node-start" className="absolute left-[18px] top-[112px] w-[52px] h-[48px] rounded-full border-2 border-nx-line-hi bg-nx-raised flex flex-col items-center justify-center text-[10px] font-bold text-nx-ink">{t("crmOpportunities.pipelinesPage.startNodeLabel")}</div>
          {stages.map((stage) => {
            const excludeKey = wireDraft?.originStageKey ?? wireDraft?.fromStageKey;
            const isDropTarget = Boolean(wireDraft && excludeKey !== stage.stageKey && (wireDraft.targetStageKey === stage.stageKey || hoveredStageKey === stage.stageKey));
            return (
              <CrmWorkflowStageNodeCard
                key={stage.stageKey} t={t} isAr={isAr} stage={stage} isSelected={selectedStageKey === stage.stageKey} selectedTransitionId={selectedTransitionId}
                showPorts={selectedStageKey === stage.stageKey || hoveredStageKey === stage.stageKey || Boolean(wireDraft)} isDropTarget={isDropTarget} hoveredDropPortId={isDropTarget ? wireDraft?.targetPortId : null}
                globalIncoming={wildcardTransitions.filter((w) => w.toStageKey === stage.stageKey)} crmCustomFields={crmCustomFields}
                onMouseEnter={() => { setHoveredStageKey(stage.stageKey); if (wireDraft && (wireDraft.originStageKey ?? wireDraft.fromStageKey) !== stage.stageKey) setWireDraft((prev) => prev ? { ...prev, targetStageKey: stage.stageKey } : null); }}
                onMouseLeave={() => { setHoveredStageKey((prev) => (prev === stage.stageKey ? null : prev)); if (wireDraft) setWireDraft((prev) => prev && prev.targetStageKey === stage.stageKey ? { ...prev, targetStageKey: null, targetPortId: null } : prev); }}
                onClickNode={() => { onSelectStage(stage.stageKey); onSelectTransition(null); }}
                onPointerDownNode={(e) => { e.stopPropagation(); onSelectStage(stage.stageKey); onSelectTransition(null); const pt = toCanvasCoords(e.clientX, e.clientY); setDraggingKey(stage.stageKey); setDragOffset({ dx: pt.x - stage.x, dy: pt.y - stage.y }); }}
                onStartWireDraft={(fromStageKey, fromPortId, startX, startY, originStageKey) => setWireDraft({ fromStageKey, originStageKey, fromPortId, startX, startY, currX: startX, currY: startY, targetStageKey: null, targetPortId: null })}
                onFinishWireDraft={(targetKey, portId, ev) => finishWireConnection(targetKey, portId, ev)} onSelectGlobalTransition={(id) => { onSelectTransition(id); onSelectStage(null); }}
              />
            );
          })}
        </div>
      </div>

      <CrmWorkflowMinimap
        t={t} isAr={isAr} stages={stages} selectedStageKey={selectedStageKey} zoom={zoom} canvasWidth={canvasWidth} canvasHeight={canvasHeight} nodeWidth={NODE_WIDTH} nodeHeight={NODE_HEIGHT}
        scrollLeft={scrollPos.left} scrollTop={scrollPos.top} onZoomChange={onZoomChange} onSelectStage={onSelectStage} onSelectTransition={onSelectTransition}
        onPanToNormalized={(rx, ry) => { if (scrollContainerRef.current) scrollContainerRef.current.scrollTo({ left: Math.max(0, rx * canvasWidth * scale - 320), top: Math.max(0, ry * canvasHeight * scale - 180), behavior: "smooth" }); }}
      />
    </div>
  );
}
