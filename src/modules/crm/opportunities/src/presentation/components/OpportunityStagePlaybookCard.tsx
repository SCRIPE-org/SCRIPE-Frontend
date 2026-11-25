"use client";

import React, { useEffect, useState } from "react";
import { Building2, CheckCircle2, Trophy } from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { Card } from "@core/ui/card";
import { Checkbox } from "@core/ui/checkbox";
import { Label } from "@core/ui/label";
import { useCrmWorkflowsStore } from "@modules/crm";
import { useCrmTenantScope } from "@modules/crm/shared";
import type { CrmOpportunity } from "../../domain/entities/OpportunityEntity";

interface PlaybookStepItem {
  id: string;
  label: string;
}

interface OpportunityStagePlaybookCardProps {
  opp: CrmOpportunity;
  isRtl: boolean;
  venueHoldStatus: "idle" | "reserved";
  academyCohortStatus: "idle" | "provisioned";
  onVenueHold: () => void;
  onAcademyCohort: () => void;
}

function readStoredPlaybookIds(storageKey: string): Record<string, boolean> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(storageKey);
    return raw ? (JSON.parse(raw) as Record<string, boolean>) : {};
  } catch {
    return {};
  }
}

/** Interactive stage playbook checklist and Sports OS handoff actions for Deal Detail. */
export function OpportunityStagePlaybookCard({
  opp,
  isRtl,
  venueHoldStatus,
  academyCohortStatus,
  onVenueHold,
  onAcademyCohort,
}: OpportunityStagePlaybookCardProps) {
  const { t } = useI18n();
  const { tenantId, userId } = useCrmTenantScope();
  const activeDealWorkflow = useCrmWorkflowsStore((s) => s.getActiveWorkflow("deal"));
  const activeStage = activeDealWorkflow?.stages.find((s) => s.stageKey === opp.stageKey);
  const canPersistPlaybook = Boolean(userId && userId !== "anon");
  const storageKey = `scripe-crm-playbook:${tenantId}:${userId}:${opp.id}:${opp.stageKey}`;

  const [checkedSteps, setCheckedSteps] = useState<Record<string, boolean>>(() =>
    readStoredPlaybookIds(storageKey)
  );

  useEffect(() => {
    setCheckedSteps(readStoredPlaybookIds(storageKey));
  }, [storageKey]);

  const rawStageTasks = (
    activeStage as {
      playbookTasks?: Array<string | { id?: string; titleEn?: string; titleAr?: string; labelEn?: string; labelAr?: string }>;
    } | undefined
  )?.playbookTasks;

  const steps: PlaybookStepItem[] =
    Array.isArray(rawStageTasks) && rawStageTasks.length > 0
      ? rawStageTasks.map((task, idx) =>
          typeof task === "string"
            ? { id: `stage-task-${idx}`, label: task }
            : {
                id: task.id || `stage-task-${idx}`,
                label:
                  (isRtl ? task.titleAr || task.labelAr : task.titleEn || task.labelEn) ||
                  task.titleEn ||
                  task.labelEn ||
                  t("crmOpportunities.commercialSuite.playbookTaskInventory"),
              }
        )
      : [
          { id: "metrics", label: t("crmOpportunities.commercialSuite.playbookStepMetrics") },
          { id: "buyer", label: t("crmOpportunities.commercialSuite.playbookStepBuyer") },
          { id: "inventory", label: t("crmOpportunities.commercialSuite.playbookTaskInventory") },
          { id: "legal", label: t("crmOpportunities.commercialSuite.playbookTaskLegal") },
        ];

  const completedCount = steps.filter((s) => Boolean(checkedSteps[s.id])).length;
  const allComplete = steps.length > 0 && completedCount === steps.length;

  const toggleStep = (stepId: string, nextValue: boolean) => {
    setCheckedSteps((prev) => {
      const updated = { ...prev, [stepId]: nextValue };
      if (canPersistPlaybook && typeof window !== "undefined") {
        try {
          window.localStorage.setItem(storageKey, JSON.stringify(updated));
        } catch {
          // Ignore storage quota restrictions
        }
      }
      return updated;
    });
  };

  return (
    <>
      <Card className="p-4 border-nx-line bg-nx-surface space-y-2.5" data-testid="deal-stage-playbook-card">
        <div className="flex items-center justify-between gap-2">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-nx-ink">
              {t("crmOpportunities.commercialSuite.stagePlaybookTitle")}
            </span>
            <p className="text-[11px] text-nx-ink-3 mt-0.5">
              {t("crmOpportunities.commercialSuite.playbookSubtitle")}
            </p>
          </div>
          <Badge
            variant="outline"
            className={
              allComplete
                ? "text-[10px] font-mono border-success/40 bg-success/10 text-success shrink-0"
                : "text-[10px] font-mono border-nx-accent/40 text-nx-accent shrink-0"
            }
          >
            {completedCount}/{steps.length}{" "}
            {allComplete
              ? t("crmOpportunities.commercialSuite.playbookProgressSuffix")
              : t("crmOpportunities.commercialSuite.inProgressBadge")}
          </Badge>
        </div>

        <div className="space-y-1.5 text-xs">
          {steps.map((step) => {
            const isChecked = Boolean(checkedSteps[step.id]);
            const checkboxId = `playbook-step-${opp.id}-${step.id}`;
            return (
              <div
                key={step.id}
                className="rounded border border-nx-line bg-nx-raised/40 px-2.5 py-2 flex items-center justify-between gap-2"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Checkbox
                    id={checkboxId}
                    checked={isChecked}
                    onCheckedChange={(v) => toggleStep(step.id, Boolean(v))}
                  />
                  <Label
                    htmlFor={checkboxId}
                    className={`cursor-pointer truncate ${isChecked ? "text-nx-ink-3 line-through" : "text-nx-ink font-medium"}`}
                  >
                    {step.label}
                  </Label>
                </div>
                {isChecked && <CheckCircle2 className="size-3.5 text-success shrink-0" />}
              </div>
            );
          })}
        </div>
      </Card>

      <Card className="p-4 border-nx-line bg-nx-surface flex flex-wrap items-center justify-between gap-3" data-testid="deal-sports-os-handoff-card">
        <div className="flex items-center gap-2 text-xs">
          <Trophy className="size-4 text-nx-accent" />
          <span className="font-bold text-nx-ink">{t("crmOpportunities.commercialSuite.sportsOsHandoffLabel")}</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" variant="outline" className="h-7 text-xs" onClick={onVenueHold} data-testid="venue-block-booking-hold-btn">
            <Building2 className="size-3.5 me-1.5 text-info" />
            {venueHoldStatus === "reserved" ? t("crmOpportunities.commercialSuite.venueHoldActive") : t("crmOpportunities.commercialSuite.venueHoldAction")}
          </Button>
          <Button size="sm" variant="outline" className="h-7 text-xs" onClick={onAcademyCohort} data-testid="academy-b2b-sponsorship-btn">
            <Trophy className="size-3.5 me-1.5 text-success" />
            {academyCohortStatus === "provisioned" ? t("crmOpportunities.commercialSuite.academyProvisioned") : t("crmOpportunities.commercialSuite.academyProvisionAction")}
          </Button>
        </div>
      </Card>
    </>
  );
}
