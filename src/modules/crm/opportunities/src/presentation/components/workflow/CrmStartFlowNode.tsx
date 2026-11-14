"use client";

import React, { memo } from "react";
import { Handle, Position, type Node, type NodeProps } from "@xyflow/react";
import { useI18n } from "@core/providers/i18n-provider";

export interface StartNodeData extends Record<string, unknown> {
  isAr?: boolean;
  label?: string;
  onSelectStart?: () => void;
}

export type StartFlowNode = Node<StartNodeData, "startNode">;

function CrmStartFlowNodeComponent({ id, data, selected }: NodeProps<StartFlowNode>) {
  const { t } = useI18n();
  const label = data?.label || t("crmOpportunities.workflowStudio.startNode");

  return (
    <div
      data-testid="canvas-node-start"
      data-node-id={id}
      onClick={(e) => {
        e.stopPropagation();
        data?.onSelectStart?.();
      }}
      className={`group relative w-[92px] h-[48px] rounded-full border-2 bg-nx-surface flex items-center justify-center gap-2 px-3 shadow-none transition-colors cursor-default ${
        selected
          ? "border-nx-accent ring-2 ring-nx-accent/50"
          : "border-success/60 hover:border-success"
      }`}
    >
      <span className="relative flex h-2 w-2 shrink-0" aria-hidden="true">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-success" />
      </span>

      <span className="text-[11px] font-mono font-bold tracking-wider text-nx-ink uppercase select-none">
        {label}
      </span>

      {/* Outbound connection handles: Right for LTR LR layout, Left for RTL LR layout, Bottom for TB layout */}
      <Handle
        type="source"
        position={Position.Left}
        id="left-2"
        data-testid="node-port-start-left-2"
        data-port-id="left-2"
        className="!w-2 !h-2 !rounded-full !bg-success !border !border-nx-surface hover:!scale-150 transition-transform !cursor-crosshair opacity-80 hover:opacity-100 z-30"
      />
      <Handle
        type="source"
        position={Position.Right}
        id="right-2"
        data-testid="node-port-start-right-2"
        data-port-id="right-2"
        className="!w-2 !h-2 !rounded-full !bg-success !border !border-nx-surface hover:!scale-150 transition-transform !cursor-crosshair opacity-80 hover:opacity-100 z-30"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom-2"
        data-testid="node-port-start-bottom-2"
        data-port-id="bottom-2"
        className="!w-2 !h-2 !rounded-full !bg-success !border !border-nx-surface hover:!scale-150 transition-transform !cursor-crosshair opacity-80 hover:opacity-100 z-30"
      />
    </div>
  );
}

export const CrmStartFlowNode = memo(CrmStartFlowNodeComponent);
