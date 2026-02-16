"use client";

import React from "react";
import { cn } from "@core/common/utils";
import { Button } from "@core/ui/button";
import {
      Tooltip,
      TooltipContent,
      TooltipProvider,
      TooltipTrigger,
} from "@core/ui/tooltip";

// ─── Types ──────────────────────────────────────────────────
export interface ToolbarButtonProps {
      onClick: () => void;
      active?: boolean;
      disabled?: boolean;
      title: string;
      children: React.ReactNode;
}

// ─── Component ──────────────────────────────────────────────
export function ToolbarButton({
      onClick,
      active,
      disabled,
      title,
      children,
}: ToolbarButtonProps) {
      return (
            <TooltipProvider delayDuration={300}>
                  <Tooltip>
                        <TooltipTrigger asChild>
                              <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className={cn(
                                          "h-8 w-8 p-0",
                                          active && "bg-accent text-accent-foreground"
                                    )}
                                    onClick={onClick}
                                    disabled={disabled}
                              >
                                    {children}
                              </Button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" className="text-xs">
                              {title}
                        </TooltipContent>
                  </Tooltip>
            </TooltipProvider>
      );
}
