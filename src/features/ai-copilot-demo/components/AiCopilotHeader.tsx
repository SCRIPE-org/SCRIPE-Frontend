"use client";

import React, { useState } from "react";
import {
  Maximize2,
  Minimize2,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@core/ui/avatar";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@core/ui/tooltip";
import { useCopilotI18n } from "../localization/useCopilotI18n";
import type { ScenarioId } from "../types";

export const ARAB_CONTRACTORS_LOGO_URL =
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTKNO2YJAHPQRSoUjwD_gpvhZvFJ4FKF9YmVC480jvRuA&s=10";

interface AiCopilotHeaderProps {
  activeScenarioId: ScenarioId | null;
  isExpandedWorkspace: boolean;
  hasMessages: boolean;
  onToggleExpand: () => void;
  onReset: () => void;
  onClose: () => void;
  closeButtonRef?: React.Ref<HTMLButtonElement>;
}

export function AiCopilotHeader({
  activeScenarioId,
  isExpandedWorkspace,
  hasMessages,
  onToggleExpand,
  onReset,
  onClose,
  closeButtonRef,
}: AiCopilotHeaderProps) {
  const { tc } = useCopilotI18n();
  const [logoError, setLogoError] = useState(false);

  const contextLabel =
    activeScenarioId === "financial-q3-report"
      ? tc("header.financeContextBadge")
      : tc("header.academyContextBadge");

  return (
    <div className="shrink-0 border-b border-nx-line bg-nx-surface px-4 py-3">
      {/* Top row: Brand mark + Title + Window controls */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-nx-md bg-nx-accent-fill text-nx-on-fill">
            <Sparkles className="h-4 w-4" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-1.5">
              <h2 className="truncate text-sm font-semibold tracking-tight text-nx-ink">
                {tc("header.title")}
              </h2>
              <Badge variant="accent" className="px-1.5 py-0 text-[10px]">
                {tc("trigger.demoTag")}
              </Badge>
            </div>
            <p className="truncate text-[11px] text-nx-ink-3">
              {tc("header.subtitle")}
            </p>
          </div>
        </div>

        <TooltipProvider>
          <div className="flex shrink-0 items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant={isExpandedWorkspace ? "outline" : "ghost"}
                  size={isExpandedWorkspace ? "sm" : "icon"}
                  onClick={onToggleExpand}
                  aria-label={
                    isExpandedWorkspace
                      ? tc("header.collapseWorkspace")
                      : tc("header.expandWorkspace")
                  }
                  data-testid="copilot-expand-btn"
                  className={
                    isExpandedWorkspace
                      ? "h-8 cursor-pointer gap-1.5 px-2.5 text-xs font-medium text-nx-ink"
                      : "h-8 w-8 cursor-pointer text-nx-ink-2 hover:text-nx-ink"
                  }
                >
                  {isExpandedWorkspace ? (
                    <>
                      <Minimize2 className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>{tc("header.collapseWorkspace")}</span>
                    </>
                  ) : (
                    <Maximize2 className="h-4 w-4" aria-hidden="true" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {isExpandedWorkspace
                  ? tc("header.collapseWorkspace")
                  : tc("header.expandWorkspace")}
              </TooltipContent>
            </Tooltip>

            {hasMessages && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={onReset}
                    aria-label={tc("header.reset")}
                    data-testid="copilot-reset-btn"
                    className="h-8 w-8 cursor-pointer text-nx-ink-2 hover:text-nx-ink"
                  >
                    <RotateCcw className="h-4 w-4" aria-hidden="true" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{tc("header.reset")}</TooltipContent>
              </Tooltip>
            )}

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  ref={closeButtonRef}
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  aria-label={tc("header.close")}
                  data-testid="copilot-close-btn"
                  className="h-8 w-8 cursor-pointer text-nx-ink-2 hover:text-nx-ink"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{tc("header.close")}</TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
      </div>

      {/* Club Branding + Presentation Safety + Context Indicator Strip */}
      <div className="mt-2.5 flex flex-wrap items-center justify-between gap-1.5 rounded-nx-md border border-nx-line bg-nx-raised px-2.5 py-1.5">
        <div className="flex min-w-0 items-center gap-2">
          <Avatar
            size="sm"
            data-testid="copilot-club-avatar"
            className="h-6 w-6 shrink-0 border border-nx-line-hi bg-nx-surface text-[10px]"
          >
            {!logoError && (
              <AvatarImage
                src={ARAB_CONTRACTORS_LOGO_URL}
                alt={tc("header.tenantName")}
                onError={() => setLogoError(true)}
                className="bg-nx-surface object-contain p-0.5"
              />
            )}
            <AvatarFallback className="bg-nx-surface text-[10px] font-bold text-nx-ink">
              {tc("header.tenantInitials")}
            </AvatarFallback>
          </Avatar>
          <span
            data-testid="copilot-club-name"
            className="truncate text-xs font-medium text-nx-ink"
          >
            {tc("header.tenantName")}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <Badge
            variant="secondary"
            className="border-nx-line-hi bg-nx-surface text-[10px] text-nx-ink-2"
          >
            {contextLabel}
          </Badge>
          <Badge variant="info" className="gap-1 text-[10px]">
            <ShieldCheck className="h-3 w-3" aria-hidden="true" />
            <span>{tc("header.previewBadge")}</span>
          </Badge>
        </div>
      </div>
    </div>
  );
}
