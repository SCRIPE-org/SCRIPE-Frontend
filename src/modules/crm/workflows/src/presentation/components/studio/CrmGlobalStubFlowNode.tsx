"use client";

import React, { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { Globe } from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";

/** Node data payload for the global wildcard (`* ALL STATUSES`) React Flow stub node. */
export interface CrmGlobalStubNodeData extends Record<string, unknown> {
  isAr?: boolean;
  onSelectGlobalTransition?: () => void;
}

/**
 * Jira-style External Satellite "* ALL STATUSES" Origin Node (<65 lines).
 * Emits clean dashed global wires when global wires are toggled ON.
 */
function CrmGlobalStubFlowNodeComponent({ data }: NodeProps) {
  const { t } = useI18n();
  const onSelect = (data as CrmGlobalStubNodeData)?.onSelectGlobalTransition;

  return (
    <div
      data-testid="canvas-node-global-all"
      onClick={() => onSelect?.()}
      title={t("crmWorkflows.workflowStudio.globalInboundTooltip")}
      className="px-3 py-1.5 rounded-full border border-dashed border-info/50 bg-nx-surface text-info flex items-center gap-1.5 text-[11px] font-bold shadow-none select-none cursor-pointer hover:border-info hover:bg-info/10 transition-colors relative"
    >
      <Globe className="w-3.5 h-3.5 text-info shrink-0" />
      <span>{t("crmWorkflows.workflowStudio.globalAnyPillLabel")}</span>
      <span className="text-[10px] font-mono text-nx-ink-3">(*)</span>
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom-2"
        className="!w-2.5 !h-2.5 !rounded-full !bg-info !border !border-nx-line opacity-0 pointer-events-none"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom-3"
        className="!w-2.5 !h-2.5 !rounded-full !bg-info !border !border-nx-line opacity-0 pointer-events-none"
      />
    </div>
  );
}

/** Memoized React Flow satellite node representing global wildcard inbound transitions. */
export const CrmGlobalStubFlowNode = memo(CrmGlobalStubFlowNodeComponent);
