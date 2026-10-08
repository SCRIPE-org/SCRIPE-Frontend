/* eslint-disable @typescript-eslint/no-explicit-any */
// UI-EXCEPTION: compact studio layout
"use client";

import React from "react";
import { ChevronDown, Building2, CreditCard, Clock } from "lucide-react";
import { Badge } from "@core/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@core/ui/tooltip";
import { useI18n } from "@core/providers/i18n-provider";
import { cn } from "@core/common/utils";
import type { TenantTreeNode } from "../../../domain/entities/Tenant";

/**
 * Exported type defining parameters and fields for tenant status configurations.
 */
export type TenantStatus = "active" | "suspended" | "canceled" | "expired" | "inactive";

interface TenantNodeCardHeaderProps {
  node: TenantTreeNode;
  isExpanded: boolean;
  status: TenantStatus;
  daysLeft: number | null;
  config: {
    iconBg: string;
    badgeVariant: "success" | "warning" | "destructive" | "secondary";
    Icon: React.ComponentType<any>;
  };
  statusBadge: React.ReactNode;
  suspensionTooltip: string | null;
  hasChildren: boolean;
  onToggle: () => void;
}

/**
 * Presentation UI component rendering the tenant node card header.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
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
  const { t } = useI18n();

  return (
    <button
      type="button"
      className={cn(
        "flex w-full items-center gap-3 p-4",
        "text-start transition-colors duration-nx-micro ease-nx-enter motion-reduce:transition-none",
        "hover:bg-nx-hover",
        "focus-visible:shadow-nx-focus focus-visible:outline-none"
      )}
      onClick={onToggle}
      aria-expanded={isExpanded}
    >
      {/* Tenant icon */}
      <div
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-nx-md border border-nx-line",
          config.iconBg
        )}
        aria-hidden="true"
      >
        <Building2 className="h-5 w-5" />
      </div>

      {/* Name + Code */}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="truncate font-semibold text-nx-ink">{node.name}</span>
          <span className="font-mono text-xs text-nx-ink-3">({node.code})</span>
          {hasChildren && (
            <Badge variant="secondary" className="gap-1 px-1.5 py-0 text-xs">
              <Building2 className="h-3 w-3" aria-hidden="true" />
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
          <Badge variant="warning" className="gap-1 text-xs">
            <CreditCard className="h-3 w-3" aria-hidden="true" />
            {t("tenant.pendingPayment")}
          </Badge>
        )}

        {/* Days remaining chip */}
        {status === "active" && daysLeft !== null && daysLeft > 0 && (
          <Badge
            variant="outline"
            className={cn(
              "gap-1 text-xs",
              daysLeft <= 7
                ? "border-destructive/50 text-destructive"
                : daysLeft <= 30
                  ? "border-warning/50 text-warning"
                  : "border-nx-line-hi text-nx-ink-3"
            )}
          >
            <Clock className="h-3 w-3" aria-hidden="true" />
            {daysLeft} {t("tenant.daysLeft")}
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

      {/* Chevron — a disclosure flip tied to real state, not decoration */}
      <ChevronDown
        aria-hidden="true"
        className={cn(
          "h-5 w-5 shrink-0 text-nx-ink-3 transition-transform duration-nx-micro ease-nx-enter motion-reduce:transition-none",
          isExpanded && "rotate-180"
        )}
      />
    </button>
  );
}
