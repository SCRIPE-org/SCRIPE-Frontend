"use client";

import React, { memo } from "react";
import { Handle, Position } from "@xyflow/react";

export type StagePortId =
  | "top-1"
  | "top-2"
  | "top-3"
  | "right-1"
  | "right-2"
  | "right-3"
  | "bottom-1"
  | "bottom-2"
  | "bottom-3"
  | "left-1"
  | "left-2"
  | "left-3";

export interface CrmStageFlowHandlesProps {
  stageKey: string;
  onStartWireDraft?: (fromStageKey: string, fromPortId: any) => void;
  onFinishWireDraft?: (targetStageKey: string, targetPortId?: any) => void;
}

interface PortDef {
  id: StagePortId;
  type: "source" | "target";
  position: Position;
  style: React.CSSProperties;
}

const PORT_DEFINITIONS: readonly PortDef[] = [
  // Top Face (3 source ports — Direction preserved by ConnectionMode.Loose + connectOriginRef)
  { id: "top-1", type: "source", position: Position.Top, style: { left: "25%" } },
  { id: "top-2", type: "source", position: Position.Top, style: { left: "50%" } },
  { id: "top-3", type: "source", position: Position.Top, style: { left: "75%" } },

  // Right Face (3 source ports)
  { id: "right-1", type: "source", position: Position.Right, style: { top: "25%" } },
  { id: "right-2", type: "source", position: Position.Right, style: { top: "50%" } },
  { id: "right-3", type: "source", position: Position.Right, style: { top: "75%" } },

  // Bottom Face (3 source ports)
  { id: "bottom-1", type: "source", position: Position.Bottom, style: { left: "25%" } },
  { id: "bottom-2", type: "source", position: Position.Bottom, style: { left: "50%" } },
  { id: "bottom-3", type: "source", position: Position.Bottom, style: { left: "75%" } },

  // Left Face (3 source ports)
  { id: "left-1", type: "source", position: Position.Left, style: { top: "25%" } },
  { id: "left-2", type: "source", position: Position.Left, style: { top: "50%" } },
  { id: "left-3", type: "source", position: Position.Left, style: { top: "75%" } },
];

/** Non-interactive target companions across all 12 ports so existing targetHandle edges resolve cleanly. */
const BIDIRECTIONAL_COMPANION_HANDLES: readonly PortDef[] = PORT_DEFINITIONS.map((port) => ({
  id: port.id,
  type: "target",
  position: port.position,
  style: { ...port.style, pointerEvents: "none", opacity: 0 },
}));

const HANDLE_CLASS =
  "!w-[7px] !h-[7px] !rounded-full !bg-nx-raised !border !border-nx-line-hi opacity-55 " +
  "group-hover:opacity-100 group-hover:!opacity-100 group-hover:!w-[9px] group-hover:!h-[9px] " +
  "hover:!scale-150 hover:!bg-nx-accent hover:!border-nx-on-fill !cursor-crosshair z-30 transition-transform";

function CrmStageFlowHandlesComponent({
  stageKey,
  onStartWireDraft,
  onFinishWireDraft,
}: CrmStageFlowHandlesProps) {
  return (
    <>
      {PORT_DEFINITIONS.map((port) => (
        <Handle
          key={port.id}
          type={port.type}
          position={port.position}
          id={port.id}
          style={port.style}
          data-testid={`node-port-${stageKey}-${port.id}`}
          data-port-id={port.id}
          data-port-stage-key={stageKey}
          onPointerDown={(e) => {
            e.stopPropagation();
            onStartWireDraft?.(stageKey, port.id);
          }}
          onPointerUp={(e) => {
            e.stopPropagation();
            onFinishWireDraft?.(stageKey, port.id);
          }}
          className={HANDLE_CLASS}
        />
      ))}
      {BIDIRECTIONAL_COMPANION_HANDLES.map((port) => (
        <Handle
          key={`${port.type}-${port.id}`}
          type={port.type}
          position={port.position}
          id={port.id}
          style={port.style}
          isConnectable={false}
        />
      ))}
    </>
  );
}

export const CrmStageFlowHandles = memo(CrmStageFlowHandlesComponent);
