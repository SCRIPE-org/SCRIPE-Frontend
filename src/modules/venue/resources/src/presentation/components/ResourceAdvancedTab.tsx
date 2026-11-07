"use client";

import { useState } from "react";
import {
  Boxes,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Send,
  Layers,
  Users,
} from "lucide-react";
import { Button } from "@core/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@core/ui/card";
import { Label } from "@core/ui/label";
import { Input } from "@core/ui/input";
import { Badge } from "@core/ui/badge";
import { Alert, AlertDescription } from "@core/ui/alert";
import { LoadingSpinner } from "@core/ui/loading-spinner";
import { useI18n } from "@core/providers/i18n-provider";
import type { ResourceAllocationMode } from "@modules/venue";
import type { useResourceDetailViewModel } from "../viewmodels/useResourceDetailViewModel";

interface Props {
  vm: ReturnType<typeof useResourceDetailViewModel>;
}

export function ResourceAdvancedTab({ vm }: Props) {
  const { t } = useI18n();

  const [allocationMode, setAllocationMode] = useState<ResourceAllocationMode>(
    vm.resource?.capacity?.allocationMode ?? "SingleUnit"
  );
  const [maxConcurrency, setMaxConcurrency] = useState<number>(
    vm.resource?.capacity?.maxConcurrentUsage ?? vm.resource?.unitCount ?? 1
  );
  const [isComposite, setIsComposite] = useState<boolean>(
    Boolean(vm.resource?.isComposite)
  );
  const [parentId, setParentId] = useState<string>(
    vm.resource?.parentSchedulableResourceId ?? ""
  );
  const [unitLabel, setUnitLabel] = useState<string>(
    vm.resource?.namedUnitLabel ?? ""
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void vm.updateAdvanced({
      allocationMode,
      maxConcurrentUsage: maxConcurrency,
      isComposite,
      parentSchedulableResourceId: parentId ? parentId : null,
      namedUnitLabel: unitLabel ? unitLabel.trim() : null,
    });
  };

  const isPublished = Boolean(vm.resource?.isPublished);

  return (
    <div className="space-y-6">
      {/* 1. Publication Readiness & Audit Card */}
      <Card className="rounded-2xl border border-nx-line bg-nx-surface">
        <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <CardTitle className="text-base font-bold text-nx-ink">
                {t("resources.advanced.publicationAudit", {
                  defaultValue: "Publication Audit & Readiness",
                })}
              </CardTitle>
              {isPublished ? (
                <Badge
                  variant="success"
                  className="border-success/20 bg-success/10 text-xs text-success"
                >
                  {t("resources.card.statusPublished", { defaultValue: "Published" })}
                </Badge>
              ) : (
                <Badge
                  variant="outline"
                  className="border-warning/20 bg-warning/10 text-xs text-warning"
                >
                  {t("resources.card.statusDraft", { defaultValue: "Draft" })}
                </Badge>
              )}
            </div>
            <CardDescription className="mt-1 text-xs text-nx-ink-2">
              {t("resources.advanced.publicationAuditDesc", {
                defaultValue:
                  "Inspect publication blockers and verify operational readiness for customer bookings.",
              })}
            </CardDescription>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={vm.checklistLoading}
              onClick={() => void vm.loadChecklist()}
              className="gap-1.5 text-xs"
            >
              <RefreshCw
                className={`size-3.5 ${vm.checklistLoading ? "animate-spin" : ""}`}
                aria-hidden="true"
              />
              <span>
                {vm.checklistLoading
                  ? t("resources.advanced.auditing", { defaultValue: "Checking..." })
                  : t("resources.advanced.auditButton", { defaultValue: "Check Readiness" })}
              </span>
            </Button>

            {!isPublished && (
              <Button
                type="button"
                size="sm"
                disabled={vm.saving}
                onClick={() => void vm.publishCourt()}
                className="gap-1.5 bg-nx-accent text-xs font-bold text-nx-on-fill hover:bg-nx-accent/90"
              >
                <Send className="size-3.5" aria-hidden="true" />
                <span>
                  {vm.saving
                    ? t("resources.card.activatingButton", { defaultValue: "Publishing..." })
                    : t("resources.advanced.publishNow", { defaultValue: "Publish Court" })}
                </span>
              </Button>
            )}
          </div>
        </CardHeader>

        {vm.checklist && (
          <CardContent className="pt-0">
            {vm.checklist.canPublish ? (
              <Alert variant="success" className="py-2.5">
                <CheckCircle2 className="size-4 text-success" aria-hidden="true" />
                <AlertDescription className="text-xs font-semibold">
                  {t("resources.advanced.canPublish", {
                    defaultValue: "All publication criteria satisfied. Court is ready for live bookings.",
                  })}
                </AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-2">
                <Alert className="border-warning/30 bg-warning/10 py-2.5 text-warning">
                  <AlertCircle className="size-4 shrink-0 text-warning" aria-hidden="true" />
                  <AlertDescription className="text-xs font-semibold">
                    {t("resources.advanced.hasBlockers", {
                      defaultValue: "Publication blockers found:",
                    })}
                  </AlertDescription>
                </Alert>
                <ul className="space-y-1.5 pl-6 text-xs text-nx-ink-2">
                  {vm.checklist.blockers.map((b) => (
                    <li key={b.code} className="flex items-center gap-2">
                      <span className="size-1.5 rounded-full bg-warning" />
                      <span>{b.message}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        )}
      </Card>

      {/* 2. Allocation & Concurrency Settings Form */}
      <Card className="rounded-2xl border border-nx-line bg-nx-surface">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle className="text-base font-bold text-nx-ink">
              {t("resources.advanced.title", { defaultValue: "Advanced Configuration" })}
            </CardTitle>
            <CardDescription className="text-xs text-nx-ink-2">
              {t("resources.advanced.description", {
                defaultValue:
                  "Configure capacity limits, allocation mode, and composite resource relationships.",
              })}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-5">
            {/* Allocation Mode selection */}
            <div className="space-y-2">
              <Label className="text-xs font-bold text-nx-ink">
                {t("resources.advanced.allocationMode", { defaultValue: "Allocation Mode" })}
              </Label>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div
                  onClick={() => setAllocationMode("SingleUnit")}
                  className={`cursor-pointer rounded-xl border p-3.5 transition-colors ${
                    allocationMode === "SingleUnit"
                      ? "border-nx-accent bg-nx-accent/5 ring-1 ring-nx-accent"
                      : "border-nx-line bg-nx-surface hover:border-nx-line/80"
                  }`}
                >
                  <div className="flex items-center gap-2 text-xs font-bold text-nx-ink">
                    <Layers className="size-4 text-nx-accent" aria-hidden="true" />
                    <span>
                      {t("resources.advanced.allocationExclusive", {
                        defaultValue: "Single Unit (Exclusive booking)",
                      })}
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] text-nx-ink-3">
                    One booking occupies the entire court/space for the reserved time window.
                  </p>
                </div>

                <div
                  onClick={() => setAllocationMode("PooledUnits")}
                  className={`cursor-pointer rounded-xl border p-3.5 transition-colors ${
                    allocationMode === "PooledUnits"
                      ? "border-nx-accent bg-nx-accent/5 ring-1 ring-nx-accent"
                      : "border-nx-line bg-nx-surface hover:border-nx-line/80"
                  }`}
                >
                  <div className="flex items-center gap-2 text-xs font-bold text-nx-ink">
                    <Users className="size-4 text-nx-accent" aria-hidden="true" />
                    <span>
                      {t("resources.advanced.allocationPooled", {
                        defaultValue: "Pooled Units (Shared / Multi-occupant)",
                      })}
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] text-nx-ink-3">
                    Multiple concurrent bookings share this resource up to the concurrency limit.
                  </p>
                </div>
              </div>
            </div>

            {/* Max Concurrent Usage */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="adv-concurrency" className="text-xs font-bold text-nx-ink">
                  {t("resources.advanced.maxConcurrentUsage", {
                    defaultValue: "Max Concurrency Capacity",
                  })}
                </Label>
                <Input
                  id="adv-concurrency"
                  type="number"
                  min={1}
                  max={500}
                  value={maxConcurrency}
                  onChange={(e) => setMaxConcurrency(Math.max(1, parseInt(e.target.value, 10) || 1))}
                  className="h-9 rounded-lg text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="adv-unit-label" className="text-xs font-bold text-nx-ink">
                  {t("resources.advanced.unitLabel", { defaultValue: "Unit Label (Optional)" })}
                </Label>
                <Input
                  id="adv-unit-label"
                  value={unitLabel}
                  onChange={(e) => setUnitLabel(e.target.value)}
                  placeholder={t("resources.advanced.unitLabelPlaceholder", {
                    defaultValue: "e.g. Court, Lane, Player",
                  })}
                  className="h-9 rounded-lg text-xs"
                />
              </div>
            </div>

            {/* Composite Court Settings */}
            <div className="space-y-3 rounded-xl border border-nx-line bg-nx-raised/40 p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-nx-ink">
                    <Boxes className="size-4 text-nx-accent" aria-hidden="true" />
                    <span>
                      {t("resources.advanced.composite", { defaultValue: "Composite Resource" })}
                    </span>
                  </div>
                  <p className="text-[11px] text-nx-ink-3">
                    {t("resources.advanced.isComposite", {
                      defaultValue: "This resource groups or contains multiple sub-courts.",
                    })}
                  </p>
                </div>
                <input
                  type="checkbox"
                  id="is-composite-toggle"
                  checked={isComposite}
                  onChange={(e) => setIsComposite(e.target.checked)}
                  className="size-4 rounded border-nx-line text-nx-accent focus:ring-nx-accent"
                />
              </div>

              {/* Parent Resource dropdown */}
              <div className="space-y-1.5 pt-2">
                <Label htmlFor="adv-parent" className="text-xs font-bold text-nx-ink">
                  {t("resources.advanced.parentCourt", { defaultValue: "Parent Court / Space" })}
                </Label>
                <select
                  id="adv-parent"
                  value={parentId}
                  onChange={(e) => setParentId(e.target.value)}
                  className="h-9 w-full rounded-lg border border-nx-line bg-nx-surface px-3 text-xs text-nx-ink focus:outline-hidden focus:ring-1 focus:ring-nx-accent"
                >
                  <option value="">
                    {t("resources.advanced.parentCourtNone", {
                      defaultValue: "None (Top-Level Court)",
                    })}
                  </option>
                  {vm.availableParentResources.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                type="submit"
                disabled={vm.saving}
                size="sm"
                className="gap-1.5 bg-nx-accent text-xs font-bold text-nx-on-fill hover:bg-nx-accent/90"
              >
                {vm.saving ? (
                  <LoadingSpinner size="sm" showText={false} />
                ) : (
                  <span>
                    {t("resources.advanced.save", { defaultValue: "Save Advanced Settings" })}
                  </span>
                )}
              </Button>
            </div>
          </CardContent>
        </form>
      </Card>
    </div>
  );
}
