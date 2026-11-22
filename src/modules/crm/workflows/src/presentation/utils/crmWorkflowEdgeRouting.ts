"use client";

/** Re-exported 2D stage node dimensions, port definitions, and edge-routing helpers. */
export {
  NODE_WIDTH,
  NODE_HEIGHT,
  STAGE_PORTS,
  normalizePortId,
  getPortSpec,
  getPortCoords,
  resolveDropTargetAtPointer,
  findDropTargetStage,
  chooseBestTargetPort,
  type StagePortSide,
  type StagePortId,
  type StagePortSpec,
} from "./crmWorkflowPortHelpers";
