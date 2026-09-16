"use client";

import React, { useState } from "react";
import { Button } from "@core/ui/button";
import { Badge } from "@core/ui/badge";
import { Clock, User, ChevronDown, ChevronUp, Code2 } from "lucide-react";
import { cn, formatUtc } from "@core/common/utils";
import type { TenantPlanVersionData } from "../../domain/entities/TenantPlan";
import type { TFn } from "./shared-helpers";

/**
 * Props for the VersionCard presentation component.
 */
export interface VersionCardProps {
  /** Snapshot data for this specific historical plan version. */
  version: TenantPlanVersionData;
  /** Whether this version represents the current active or newest release. */
  isLatest: boolean;
  /** Translation function. */
  t: TFn;
}

/**
 * Parses a JSON string safely and returns the array length if valid.
 *
 * @param json Serialized JSON string to inspect.
 * @returns The array element count, or zero if empty or invalid.
 */
export function countJsonArray(json: string | undefined): number {
  if (!json) return 0;
  try {
    const parsed = JSON.parse(json);
    return Array.isArray(parsed) ? parsed.length : 0;
  } catch {
    return 0;
  }
}

/**
 * Presentation card rendering metadata, publishing audit timestamps,
 * feature/price counts, and collapsible JSON snapshot data for an immutable plan version.
 *
 * @param props Version data, latest indicator flag, and translation helper.
 * @returns A styled version item with expandable snapshot details.
 */
export function VersionCard({ version, isLatest, t }: VersionCardProps): React.JSX.Element {
  const [showSnapshot, setShowSnapshot] = useState(false);

  const featureCount = countJsonArray(version.featureValuesJson);
  const priceCount = countJsonArray(version.pricingSnapshotJson);

  const statusVariant =
    version.status === "Published"
      ? "success"
      : version.status === "Archived"
        ? "secondary"
        : "outline";

  return (
    <div
      className={cn(
        "rounded-nx-md border transition-colors duration-nx-micro ease-nx-enter motion-reduce:transition-none",
        isLatest
          ? "border-[color:color-mix(in_srgb,var(--nx-accent)_40%,transparent)] bg-nx-accent-wash"
          : "border-nx-line bg-nx-surface"
      )}
    >
      <div className="flex items-start gap-3 p-3">
        {/* Version number badge */}
        <div
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold",
            isLatest ? "bg-nx-accent-fill text-nx-on-fill" : "bg-nx-raised text-nx-ink-2"
          )}
        >
          v{version.versionNumber}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold">
              {t("entitlements.tenantPlans.versionNumber")} {version.versionNumber}
            </span>
            <Badge variant={statusVariant} className="text-[10px]">
              {version.status}
            </Badge>
            {isLatest && (
              <Badge variant="default" className="text-[10px]">
                {t("entitlements.tenantPlans.latestBadge")}
              </Badge>
            )}
          </div>

          {version.changeNotes && (
            <p className="mt-0.5 text-xs leading-relaxed text-nx-ink-2">{version.changeNotes}</p>
          )}

          <div className="mt-1.5 flex flex-wrap items-center gap-4 text-xs text-nx-ink-2">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" aria-hidden="true" />
              {version.publishedAt
                ? formatUtc(version.publishedAt, "PPp")
                : formatUtc(version.createdAt, "PPp")}
            </span>
            {version.publishedBy && (
              <span className="flex items-center gap-1">
                <User className="h-3 w-3" aria-hidden="true" />
                {version.publishedBy}
              </span>
            )}
            <span>
              {featureCount} {t("entitlements.tenantPlans.features")}
            </span>
            <span>
              {priceCount} {t("entitlements.tenantPlans.priceCountPlural")}
            </span>
          </div>
        </div>

        {/* Snapshot inspection toggle button */}
        {version.featureValuesJson && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 shrink-0 text-xs"
            onClick={() => setShowSnapshot((s) => !s)}
            aria-expanded={showSnapshot}
            aria-label={t("entitlements.tenantPlans.viewSnapshot")}
          >
            <Code2 className="me-1 h-3 w-3" aria-hidden="true" />
            {showSnapshot ? (
              <ChevronUp className="h-3 w-3" aria-hidden="true" />
            ) : (
              <ChevronDown className="h-3 w-3" aria-hidden="true" />
            )}
          </Button>
        )}
      </div>

      {/* Collapsible raw snapshot view */}
      {showSnapshot && version.featureValuesJson && (
        <div className="px-3 pb-3">
          <div className="max-h-40 overflow-auto rounded-nx-md border border-nx-line bg-nx-raised p-2 font-mono text-[10px] leading-relaxed text-nx-ink-2">
            {JSON.stringify(JSON.parse(version.featureValuesJson), null, 2)}
          </div>
        </div>
      )}
    </div>
  );
}
