"use client";

import React from "react";
import { cn } from "@core/common/utils";
import type { TenantTreeNode } from "../../../domain/entities/Tenant";
import type { TenantStatus } from "./TenantNodeCardHeader";

interface TenantNodeCardProgressProps {
  node: TenantTreeNode;
  status: TenantStatus;
  daysLeft: number | null;
  progress: number;
  progressColor: string;
  t: (key: string) => string;
}

export function TenantNodeCardProgress({
  node,
  status,
  daysLeft,
  progress,
  progressColor,
  t,
}: TenantNodeCardProgressProps) {
  return (
    <>
      {status === "active" && node.editionName && (
        <div className="mt-3">
          <div className="mb-1.5 flex items-center justify-between text-xs text-muted-foreground">
            <span>
              {node.editionName}
              {daysLeft !== null
                ? ` • ${daysLeft} ${t("tenant.daysLeft")}`
                : ` • ${t("tenant.lifetime") || "Lifetime"}`}
            </span>
            {node.editionEndDate && (
              <span>
                {t("tenant.endDate")}: {new Date(node.editionEndDate).toLocaleDateString()}
              </span>
            )}
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted/50">
            <div
              className={cn("h-full rounded-full transition-all duration-500", progressColor)}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {status === "expired" && (
        <div className="mt-3">
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted/50">
            <div className="h-full w-0 rounded-full bg-destructive" />
          </div>
        </div>
      )}
    </>
  );
}
