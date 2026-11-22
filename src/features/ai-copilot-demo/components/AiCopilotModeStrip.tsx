"use client";

import React from "react";
import { Activity, BarChart3, MessageSquare, PlayCircle } from "lucide-react";
import { Button } from "@core/ui/button";
import { cn } from "@core/common/utils";
import { useCopilotI18n } from "../localization/useCopilotI18n";
import type { CopilotMode } from "../types";

interface AiCopilotModeStripProps {
  activeMode: CopilotMode;
  onSelectMode: (mode: CopilotMode) => void;
  isMaxLayout?: boolean;
}

const MODES: Array<{
  id: CopilotMode;
  labelKey: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { id: "ask", labelKey: "modes.ask.label", icon: MessageSquare },
  { id: "execute", labelKey: "modes.execute.label", icon: PlayCircle },
  { id: "analyze", labelKey: "modes.analyze.label", icon: BarChart3 },
  { id: "monitor", labelKey: "modes.monitor.label", icon: Activity },
];

export function AiCopilotModeStrip({
  activeMode,
  onSelectMode,
  isMaxLayout = false,
}: AiCopilotModeStripProps) {
  const { tc } = useCopilotI18n();

  return (
    <div className="shrink-0 border-b border-nx-line bg-nx-ground px-2.5 py-2">
      <div
        role="tablist"
        aria-label={tc("header.title")}
        className={cn(
          "flex items-center gap-1",
          isMaxLayout && "mx-auto w-full max-w-4xl"
        )}
      >
        {MODES.map((mode) => {
        const Icon = mode.icon;
        const isActive = activeMode === mode.id;
        return (
          <Button
            key={mode.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            variant={isActive ? "secondary" : "ghost"}
            size="sm"
            onClick={() => onSelectMode(mode.id)}
            data-testid={`copilot-mode-${mode.id}`}
            className={cn(
              "h-8 flex-1 cursor-pointer gap-1 rounded-nx-sm px-2 text-[11px] font-medium",
              isActive
                ? "border-nx-accent/40 bg-nx-accent-wash text-nx-accent font-semibold"
                : "text-nx-ink-3 hover:text-nx-ink"
            )}
          >
            <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span>{tc(mode.labelKey)}</span>
          </Button>
        );
      })}
      </div>
    </div>
  );
}
