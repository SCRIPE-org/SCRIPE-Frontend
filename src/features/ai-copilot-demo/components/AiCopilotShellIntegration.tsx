"use client";

import React from "react";
import { useAiCopilotDemo } from "../hooks/useAiCopilotDemo";
import { AiCopilotTriggerButton } from "./AiCopilotTriggerButton";
import { AiCopilotPanel } from "./AiCopilotPanel";

export function isAiCopilotDemoEnabled(): boolean {
  return process.env.NEXT_PUBLIC_SCRIPE_AI_DEMO === "true";
}

interface AiCopilotDemoHostProps {
  children: (slots: {
    triggerNode: React.ReactNode;
    panelNode: React.ReactNode;
  }) => React.ReactNode;
}

/**
 * Single self-contained integration host for the authenticated SCRIPE shell (`NexusLayout`).
 * Mounted only when `NEXT_PUBLIC_SCRIPE_AI_DEMO === "true"`.
 */
export function AiCopilotDemoHost({ children }: AiCopilotDemoHostProps) {
  const demo = useAiCopilotDemo();

  const triggerNode = (
    <AiCopilotTriggerButton isOpen={demo.isOpen} onClick={demo.toggleCopilot} />
  );

  const panelNode = <AiCopilotPanel demo={demo} />;

  return <>{children({ triggerNode, panelNode })}</>;
}
