"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, CheckCircle2, Compass, GitBranch, ShieldCheck, Sparkles, Users } from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@core/ui/dialog";

/** Props for `CrmSmartGuideModal`. */
export interface CrmSmartGuideModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isRtl?: boolean;
}

const USER_JOURNEYS = [
  {
    id: "pipeline-roles",
    icon: ShieldCheck,
    badgeKey: "crm.smartGuide.j1Badge",
    titleKey: "crm.smartGuide.j1Title",
    summaryKey: "crm.smartGuide.j1Summary",
    stepKeys: [
      "crm.smartGuide.j1Step1",
      "crm.smartGuide.j1Step2",
      "crm.smartGuide.j1Step3",
      "crm.smartGuide.j1Step4",
    ],
    ctaKey: "crm.smartGuide.j1Cta",
    ctaHref: "/crm/settings?tab=pipeline-roles",
  },
  {
    id: "workflow-studio",
    icon: GitBranch,
    badgeKey: "crm.smartGuide.j2Badge",
    titleKey: "crm.smartGuide.j2Title",
    summaryKey: "crm.smartGuide.j2Summary",
    stepKeys: [
      "crm.smartGuide.j2Step1",
      "crm.smartGuide.j2Step2",
      "crm.smartGuide.j2Step3",
      "crm.smartGuide.j2Step4",
    ],
    ctaKey: "crm.smartGuide.j2Cta",
    ctaHref: "/crm/pipelines",
  },
  {
    id: "deal-360",
    icon: Users,
    badgeKey: "crm.smartGuide.j3Badge",
    titleKey: "crm.smartGuide.j3Title",
    summaryKey: "crm.smartGuide.j3Summary",
    stepKeys: [
      "crm.smartGuide.j3Step1",
      "crm.smartGuide.j3Step2",
      "crm.smartGuide.j3Step3",
      "crm.smartGuide.j3Step4",
    ],
    ctaKey: "crm.smartGuide.j3Cta",
    ctaHref: "/crm/opportunities",
  },
] as const;

/**
 * Interactive CRM onboarding and governance coach modal guiding users through
 * pipeline roles, 2D workflow studio, and Deal 360 execution.
 */
export function CrmSmartGuideModal({ open, onOpenChange, isRtl = false }: CrmSmartGuideModalProps) {
  const router = useRouter();
  const { t } = useI18n();
  const [activeId, setActiveId] = useState<string>(USER_JOURNEYS[0].id);
  const current = USER_JOURNEYS.find((j) => j.id === activeId) ?? USER_JOURNEYS[0];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl" dir={isRtl ? "rtl" : "ltr"} data-testid="crm-smart-guide-modal">
        <DialogHeader>
          <div className="flex items-center justify-between gap-2">
            <Badge variant="default" className="text-[10px] font-mono gap-1">
              <Sparkles className="w-3 h-3" />{t("crm.smartGuide.coachBadge")}
            </Badge>
            <Badge variant="outline" className="text-[10px] font-mono">{t("crm.smartGuide.journeysCountBadge")}</Badge>
          </div>
          <DialogTitle className="text-base font-bold text-nx-ink flex items-center gap-2 pt-1">
            <BookOpen className="w-4 h-4 text-nx-accent" />
            {t("crm.smartGuide.modalTitle")}
          </DialogTitle>
          <DialogDescription className="text-xs text-nx-ink-2">
            {t("crm.smartGuide.modalSubtitle")}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 py-2">
          <div className="md:col-span-5 space-y-1.5 border-e border-nx-line pe-3 min-w-0">
            {USER_JOURNEYS.map((j) => {
              const Icon = j.icon;
              const isSelected = j.id === current.id;
              return (
                <Button
                  key={j.id}
                  type="button"
                  variant={isSelected ? "secondary" : "ghost"}
                  onClick={() => setActiveId(j.id)}
                  data-testid={`smart-guide-tab-${j.id}`}
                  className="w-full justify-start h-auto py-3 px-3 text-start flex flex-col items-start gap-1.5 whitespace-normal overflow-hidden"
                >
                  <div className="flex items-start gap-2 w-full min-w-0">
                    <Icon className="w-3.5 h-3.5 text-nx-accent shrink-0 mt-0.5" />
                    <span className="text-xs font-bold text-nx-ink line-clamp-2 break-words text-start leading-snug whitespace-normal">
                      {t(j.titleKey)}
                    </span>
                  </div>
                  <Badge variant="outline" className="text-[9px] font-mono shrink-0">{t(j.badgeKey)}</Badge>
                </Button>
              );
            })}
          </div>

          <div className="md:col-span-7 rounded-md border border-nx-line bg-nx-raised/40 p-4 space-y-3" data-testid={`smart-guide-panel-${current.id}`}>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-nx-ink">{t(current.titleKey)}</h4>
              <p className="text-xs text-nx-ink-2 leading-relaxed">{t(current.summaryKey)}</p>
            </div>
            <div className="space-y-1.5 pt-1">
              {current.stepKeys.map((stepKey) => (
                <div key={stepKey} className="flex items-start gap-2 rounded border border-nx-line bg-nx-surface px-2.5 py-1.5 text-xs">
                  <CheckCircle2 className="w-3.5 h-3.5 text-success shrink-0 mt-0.5" />
                  <span className="text-nx-ink">{t(stepKey)}</span>
                </div>
              ))}
            </div>
            <div className="pt-2 flex justify-end">
              <Button
                type="button"
                size="sm"
                className="h-8 text-xs gap-1.5"
                data-testid={`smart-guide-cta-${current.id}`}
                onClick={() => {
                  onOpenChange(false);
                  router.push(current.ctaHref);
                }}
              >
                <Compass className="w-3.5 h-3.5" />
                {t(current.ctaKey)}
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} data-testid="close-smart-guide-btn">
            {t("crm.smartGuide.closeBtn")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
