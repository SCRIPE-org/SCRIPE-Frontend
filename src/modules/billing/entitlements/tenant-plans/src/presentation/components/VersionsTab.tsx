/**
 * VersionsTab — Immutable version history with publish dialog.
 *
 * Elevated Tier 2 — Tier 1 parity:
 * - Shows ordered version history (newest first)
 * - "Publish New Version" dialog with optional change notes
 * - Status badge (Published / Archived)
 * - Snapshot feature/pricing count derived from JSON
 */
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@core/ui/card";
import { Button } from "@core/ui/button";
import { Badge } from "@core/ui/badge";
import { Label } from "@core/ui/label";
import { Textarea } from "@core/ui/textarea";
import { EmptyState } from "@core/ui/empty-state";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@core/ui/dialog";
import { GitBranch, Clock, User, Rocket, ChevronDown, ChevronUp, Code2 } from "lucide-react";
import { cn, formatUtc } from "@core/common/utils";
import type { TenantPlan, TenantPlanVersionData } from "../../domain/entities/TenantPlan";
import type { TFn } from "./shared-helpers";

interface VersionsTabProps {
  plan: TenantPlan;
  t: TFn;
  onPublish: (changeNotes?: string) => void;
  isPublishing: boolean;
}

// ── Safe JSON count helper ──
function countJsonArray(json: string | undefined): number {
  if (!json) return 0;
  try {
    const parsed = JSON.parse(json);
    return Array.isArray(parsed) ? parsed.length : 0;
  } catch {
    return 0;
  }
}

// ── Version Card ──
function VersionCard({
  version,
  isLatest,
  t,
}: {
  version: TenantPlanVersionData;
  isLatest: boolean;
  t: TFn;
}) {
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
        {/* Version badge */}
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

        {/* Snapshot toggle */}
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

      {/* Collapsible snapshot */}
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

/**
 * Presentation UI component rendering the versions tab.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function VersionsTab({ plan, t, onPublish, isPublishing }: VersionsTabProps) {
  const [isPublishOpen, setIsPublishOpen] = useState(false);
  const [changeNotes, setChangeNotes] = useState("");

  const versions = [...(plan.versions ?? [])].sort((a, b) => b.versionNumber - a.versionNumber);

  const handlePublish = () => {
    onPublish(changeNotes.trim() || undefined);
    setIsPublishOpen(false);
    setChangeNotes("");
  };

  return (
    <div className="space-y-4">
      {/* Header card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GitBranch className="h-4 w-4 text-nx-accent" aria-hidden="true" />
              <CardTitle className="text-base">
                {t("entitlements.tenantPlans.versionHistory")}
              </CardTitle>
              {versions.length > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {versions.length.toLocaleString()}
                </Badge>
              )}
            </div>

            {/* Publish button — only for Draft or Published plans */}
            {!plan.isArchived && (
              <Button
                size="sm"
                onClick={() => setIsPublishOpen(true)}
                loading={isPublishing}
                className="bg-success text-success-foreground hover:bg-success/90"
              >
                {!isPublishing && <Rocket className="me-1 h-4 w-4" aria-hidden="true" />}
                {t("entitlements.tenantPlans.publish")}
              </Button>
            )}
          </div>
          <CardDescription>{t("entitlements.tenantPlans.versionHistoryDesc")}</CardDescription>
        </CardHeader>

        <CardContent>
          {versions.length === 0 ? (
            <EmptyState
              bare
              size="sm"
              icon={GitBranch}
              title={t("entitlements.tenantPlans.noVersions")}
              description={t("entitlements.tenantPlans.noVersionsHint")}
            />
          ) : (
            <div className="space-y-2">
              {versions.map((v, i) => (
                <VersionCard key={v.id} version={v} isLatest={i === 0} t={t} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Publish Dialog */}
      <Dialog open={isPublishOpen} onOpenChange={setIsPublishOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Rocket className="h-4 w-4 text-success" aria-hidden="true" />
              {t("entitlements.tenantPlans.publish")}
            </DialogTitle>
            <DialogDescription>
              {t("entitlements.tenantPlans.publishDesc")}
              {plan.hasActiveSubscribers && (
                <span className="mt-1 block font-medium text-warning">
                  <span aria-hidden="true">⚠ </span>
                  {plan.activeSubscriberCount} {t("entitlements.tenantPlans.grandfatheredWarning")}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="changeNotes">
                {t("entitlements.tenantPlans.versionNotes")}{" "}
                <span className="text-xs text-nx-ink-3">({t("common.optional")})</span>
              </Label>
              <Textarea
                id="changeNotes"
                placeholder={t("entitlements.tenantPlans.versionNotesPlaceholder")}
                value={changeNotes}
                onChange={(e) => setChangeNotes(e.target.value)}
                rows={3}
                className="resize-none text-sm"
              />
            </div>
            <div className="space-y-1 rounded-nx-md border border-nx-line bg-nx-raised p-3 text-xs text-nx-ink-2">
              <div className="flex justify-between">
                <span>{t("entitlements.tenantPlans.currentVersionLabel")}</span>
                <span className="font-medium">v{plan.currentVersion}</span>
              </div>
              <div className="flex justify-between">
                <span>{t("entitlements.tenantPlans.newVersionLabel")}</span>
                <span className="font-medium text-nx-accent">v{plan.currentVersion + 1}</span>
              </div>
              <div className="flex justify-between">
                <span>{t("entitlements.tenantPlans.featuresSnapshotLabel")}</span>
                <span className="font-medium">{plan.featureCount}</span>
              </div>
              <div className="flex justify-between">
                <span>{t("entitlements.tenantPlans.priceCountSnapshotLabel")}</span>
                <span className="font-medium">{plan.priceCount}</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsPublishOpen(false)}>
              {t("common.cancel")}
            </Button>
            <Button
              onClick={handlePublish}
              loading={isPublishing}
              className="min-w-[120px] bg-success text-success-foreground hover:bg-success/90"
            >
              {t("entitlements.tenantPlans.publish")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
