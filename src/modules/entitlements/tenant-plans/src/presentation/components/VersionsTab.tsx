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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@core/ui/dialog";
import { GitBranch, Clock, User, Rocket, ChevronDown, ChevronUp, Code2 } from "lucide-react";
import { format } from "date-fns";
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
function VersionCard({ version, isLatest }: { version: TenantPlanVersionData; isLatest: boolean }) {
  const [showSnapshot, setShowSnapshot] = useState(false);

  const featureCount = countJsonArray(version.featureValuesJson);
  const priceCount = countJsonArray(version.pricingSnapshotJson);

  const statusVariant =
    version.status === "Published" ? "success" :
    version.status === "Archived" ? "secondary" : "outline";

  return (
    <div className={`rounded-lg border transition-colors ${isLatest ? "border-primary/40 bg-primary/5" : "bg-card"}`}>
      <div className="flex items-start gap-3 p-3">
        {/* Version badge */}
        <div className={`flex items-center justify-center h-9 w-9 rounded-full shrink-0 text-sm font-bold ${
          isLatest ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
        }`}>
          v{version.versionNumber}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold">Version {version.versionNumber}</span>
            <Badge variant={statusVariant} className="text-[10px]">{version.status}</Badge>
            {isLatest && <Badge variant="outline" className="text-[10px] border-primary/40 text-primary">Latest</Badge>}
          </div>

          {version.changeNotes && (
            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{version.changeNotes}</p>
          )}

          <div className="flex items-center gap-4 mt-1.5 text-xs text-muted-foreground flex-wrap">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {version.publishedAt ? format(new Date(version.publishedAt), "PPp") : format(new Date(version.createdAt), "PPp")}
            </span>
            {version.publishedBy && (
              <span className="flex items-center gap-1">
                <User className="h-3 w-3" />
                {version.publishedBy}
              </span>
            )}
            <span>{featureCount} features</span>
            <span>{priceCount} prices</span>
          </div>
        </div>

        {/* Snapshot toggle */}
        {version.featureValuesJson && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs shrink-0"
            onClick={() => setShowSnapshot(s => !s)}
          >
            <Code2 className="h-3 w-3 me-1" />
            {showSnapshot ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </Button>
        )}
      </div>

      {/* Collapsible snapshot */}
      {showSnapshot && version.featureValuesJson && (
        <div className="px-3 pb-3">
          <div className="rounded-md bg-muted/50 p-2 border text-[10px] font-mono overflow-auto max-h-40 text-muted-foreground leading-relaxed">
            {JSON.stringify(JSON.parse(version.featureValuesJson), null, 2)}
          </div>
        </div>
      )}
    </div>
  );
}

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
              <GitBranch className="h-4 w-4 text-primary" />
              <CardTitle className="text-base">
                {t("entitlements.tenantPlans.versionHistory") || "Version History"}
              </CardTitle>
              {versions.length > 0 && (
                <Badge variant="secondary" className="text-xs">{versions.length}</Badge>
              )}
            </div>

            {/* Publish button — only for Draft or Published plans */}
            {!plan.isArchived && (
              <Button
                size="sm"
                onClick={() => setIsPublishOpen(true)}
                loading={isPublishing}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {!isPublishing && <Rocket className="h-4 w-4 me-1" />}
                {t("entitlements.tenantPlans.publish") || "Publish New Version"}
              </Button>
            )}
          </div>
          <CardDescription>
            {t("entitlements.tenantPlans.versionHistoryDesc") ||
              "Each publish creates an immutable snapshot of features and pricing."}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {versions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <GitBranch className="h-10 w-10 text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground">
                {t("entitlements.tenantPlans.noVersions") || "No versions published yet."}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {t("entitlements.tenantPlans.noVersionsHint") ||
                  "Click 'Publish New Version' to create the first snapshot."}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {versions.map((v, i) => (
                <VersionCard key={v.id} version={v} isLatest={i === 0} />
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
              <Rocket className="h-4 w-4 text-green-600" />
              Publish New Version
            </DialogTitle>
            <DialogDescription>
              This will create an immutable snapshot of the current features and pricing.
              {plan.hasActiveSubscribers && (
                <span className="block mt-1 text-amber-600 font-medium">
                  ⚠ {plan.activeSubscriberCount} active subscriber(s) will be grandfathered to the current terms.
                </span>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="changeNotes">Change Notes <span className="text-muted-foreground text-xs">(optional)</span></Label>
              <Textarea
                id="changeNotes"
                placeholder="What changed in this version? e.g. 'Added storage limit, updated pricing'"
                value={changeNotes}
                onChange={e => setChangeNotes(e.target.value)}
                rows={3}
                className="text-sm resize-none"
              />
            </div>

            <div className="rounded-md bg-muted/50 border p-3 text-xs text-muted-foreground space-y-1">
              <div className="flex justify-between">
                <span>Current version</span>
                <span className="font-medium">v{plan.currentVersion}</span>
              </div>
              <div className="flex justify-between">
                <span>New version</span>
                <span className="font-medium text-primary">v{plan.currentVersion + 1}</span>
              </div>
              <div className="flex justify-between">
                <span>Features snapshot</span>
                <span className="font-medium">{plan.featureCount}</span>
              </div>
              <div className="flex justify-between">
                <span>Price points snapshot</span>
                <span className="font-medium">{plan.priceCount}</span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsPublishOpen(false)}>Cancel</Button>
            <Button
              onClick={handlePublish}
              loading={isPublishing}
              className="bg-green-600 hover:bg-green-700 text-white min-w-[120px]"
            >
              Publish
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
