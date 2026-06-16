"use client";

import React from "react";
import { ChevronDown, Building2, CreditCard, Clock } from "lucide-react";
import { Badge } from "@core/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@core/ui/tooltip";
import { cn } from "@core/common/utils";
import type { TenantTreeNode } from "../../../domain/entities/Tenant";

export type TenantStatus = "active" | "suspended" | "canceled" | "expired" | "inactive";

interface TenantNodeCardHeaderProps {
  node: TenantTreeNode;
  isExpanded: boolean;
  status: TenantStatus;
  daysLeft: number | null;
  config: {
    iconBg: string;
    badgeVariant: "success" | "destructive" | "outline" | "secondary";
    badgeClass: string;
    Icon: React.ComponentType<any>;
  };
  statusBadge: React.ReactNode;
  suspensionTooltip: string | null;
  hasChildren: boolean;
  onToggle: () => void;
}

export function TenantNodeCardHeader({
  node,
  isExpanded,
  status,
  daysLeft,
  config,
  statusBadge,
  suspensionTooltip,
  hasChildren,
  onToggle,
}: TenantNodeCardHeaderProps) {
  return (
    <button
      type="button"
      className={cn(
        "flex w-full items-center gap-3 p-4",
        "text-start transition-colors",
        "hover:bg-muted/30",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      )}
      onClick={onToggle}
      aria-expanded={isExpanded}
    >
      {/* Tenant icon */}
      <div
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
          "border border-border/50",
          config.iconBg,
          "transition-transform duration-300",
          "group-hover/card:scale-105"
        )}
      >
        <Building2 className="h-5 w-5" />
      </div>

      {/* Name + Code */}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="truncate font-semibold text-foreground">{node.name}</span>
          <span className="font-mono text-xs text-muted-foreground">({node.code})</span>
          {hasChildren && (
            <Badge variant="secondary" className="gap-1 px-1.5 py-0 text-xs">
              <Building2 className="h-3 w-3" />
              {node.children.length}
            </Badge>
          )}
        </div>
      </div>

      {/* Badges row */}
      <div className="flex shrink-0 flex-wrap items-center gap-2">
        {/* Edition badge */}
        {node.editionName && (
          <Badge variant="outline" className="text-xs">
            {node.editionName}
          </Badge>
        )}

        {/* Pending Payment badge */}
        {node.subscriptionStatus === "PendingPayment" && (
          <Badge
            variant="outline"
            className="gap-1 border-amber-500/50 bg-amber-500/10 text-xs text-amber-600 dark:text-amber-400"
          >
            <CreditCard className="h-3 w-3" />
            Pending Payment
          </Badge>
        )}

        {/* Days remaining chip */}
        {status === "active" && daysLeft !== null && daysLeft > 0 && (
          <Badge
            variant="outline"
            className={cn(
              "gap-1 text-xs",
              daysLeft <= 7
                ? "border-red-500/50 text-red-500"
                : daysLeft <= 30
                  ? "border-amber-500/50 text-amber-500"
                  : "border-muted-foreground/30 text-muted-foreground"
            )}
          >
            <Clock className="h-3 w-3" />
            {daysLeft} days left
          </Badge>
        )}

        {/* Status badge with optional tooltip */}
        {suspensionTooltip ? (
          <Tooltip>
            <TooltipTrigger asChild>{statusBadge}</TooltipTrigger>
            <TooltipContent>
              <p className="max-w-xs">{suspensionTooltip}</p>
            </TooltipContent>
          </Tooltip>
        ) : (
          statusBadge
        )}
      </div>

      {/* Chevron */}
      <ChevronDown
        className={cn(
          "h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-300",
          isExpanded && "rotate-180"
        )}
      />
    </button>
  );
}
