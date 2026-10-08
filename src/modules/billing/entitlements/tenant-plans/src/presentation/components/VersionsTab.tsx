/**
 * VersionsTab — Immutable version history with publish dialog.
 *
 * Provides:
 * - Ordered version history (newest first)
 * - "Publish New Version" dialog with optional change notes
 * - Status badge (Published / Archived)
 * - Snapshot feature/pricing counts derived from version payloads
 */
"use client";

import React, { useState } from "react";
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
import { GitBranch, Rocket } from "lucide-react";
import type { TenantPlan } from "../../domain/entities/TenantPlan";
import type { TFn } from "./shared-helpers";
import { VersionCard } from "./VersionCard";

/**
 * Documentation for module export
 */
export interface VersionsTabProps {
  /** The tenant plan aggregate whose version history is being managed. */
  plan: TenantPlan;
  /** Translation function. */
  t: TFn;
  /** Callback fired when the operator publishes a new plan version snapshot. */
  onPublish: (changeNotes?: string) => void;
  /** Indicates whether an active version publishing operation is in progress. */
  isPublishing: boolean;
}

/**
 * Presentation UI component rendering the plan versions tab.
 * Arranges layout boundaries and accessibility targets using the core design system.
 * Coordinates version history listing and publish new version dialog workflows.
 *
 * @param props The plan entity, translation helper, and publish callback.
 * @returns An accessible interface for version auditing and deployment.
 */
export function VersionsTab({ plan, t, onPublish, isPublishing }: VersionsTabProps): React.JSX.Element {
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
      {/* Header card container */}
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

            {/* Publish button — available for non-archived plans */}
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

      {/* Publish New Version Dialog */}
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
