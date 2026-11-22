"use client";

import React from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@core/ui/button";
import { Badge } from "@core/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@core/ui/tooltip";
import { cn } from "@core/common/utils";
import { useCopilotI18n } from "../localization/useCopilotI18n";

interface AiCopilotTriggerButtonProps {
  isOpen: boolean;
  onClick: () => void;
}

export function AiCopilotTriggerButton({ isOpen, onClick }: AiCopilotTriggerButtonProps) {
  const { tc } = useCopilotI18n();

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant={isOpen ? "default" : "outline"}
            size="sm"
            onClick={onClick}
            aria-expanded={isOpen}
            aria-label={tc("trigger.tooltip")}
            data-testid="ai-copilot-trigger"
            className={cn(
              "h-9 gap-1.5 rounded-nx-control px-2.5 text-xs font-semibold cursor-pointer",
              isOpen
                ? "border-nx-accent-fill bg-nx-accent-fill text-nx-on-fill"
                : "border-nx-line bg-nx-surface text-nx-ink hover:border-nx-line-hi hover:bg-nx-raised"
            )}
          >
            <span
              aria-hidden="true"
              className={cn(
                "inline-flex h-5 w-5 items-center justify-center rounded-nx-sm",
                isOpen
                  ? "bg-nx-on-fill/15 text-nx-on-fill"
                  : "bg-nx-accent-fill text-nx-on-fill"
              )}
            >
              <Sparkles className="h-3 w-3" />
            </span>
            <span className="hidden sm:inline">{tc("trigger.buttonLabel")}</span>
            <Badge
              variant={isOpen ? "outline" : "accent"}
              className={cn(
                "hidden md:inline-flex px-1.5 py-0 text-[10px] leading-4",
                isOpen && "border-nx-on-fill/30 bg-nx-on-fill/10 text-nx-on-fill"
              )}
            >
              {tc("trigger.demoTag")}
            </Badge>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">{tc("trigger.tooltip")}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
