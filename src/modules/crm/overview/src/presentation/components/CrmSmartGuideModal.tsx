"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, CheckCircle2, Compass, GitBranch, Layers, ShieldCheck, Sparkles, Users } from "lucide-react";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@core/ui/dialog";

export interface CrmSmartGuideModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isRtl?: boolean;
}

const USER_JOURNEYS = [
  {
    id: "pipeline-roles",
    icon: ShieldCheck,
    badge: "Governance & Queues",
    titleEn: "1. Decoupled Pipeline Roles vs. Identity RBAC",
    titleAr: "1. فصل أدوار خطوط البيع عن أدوار الهوية (Identity RBAC)",
    summaryEn:
      "All commercial reps share Identity role 'CRM Sales Rep', while functional approval authority inside pipelines is governed by decoupled CRM Pipeline Roles (pipe_role:deal_desk, pipe_role:commercial_director, pipe_role:finance_gatekeeper) with monetary limits and backup delegation.",
    summaryAr:
      "يشترك مندوبو المبيعات في دور الهوية القياسي، بينما تُدار صلاحيات الاعتماد داخل المراحل عبر أدوار خطوط البيع المستقلة مع حدود مالية وتفويض بديل تلقائي.",
    stepsEn: [
      "Layer 1 — Platform Identity RBAC: Controls module access &crm.workflow_roles.manage.",
      "Layer 2 — CRM Pipeline Roles (pipe_role:*): Functional approval queues with members, monetary caps & backup role.",
      "Layer 3 — Record-Relative Principals (ABAC): Record Owner, Creator, Line Manager & Four-Eyes.",
      "Layer 4 — Buying Committee Roles: Customer stakeholders (Decision Maker, CFO, Legal).",
    ],
    ctaLabelEn: "Open Pipeline Roles Settings",
    ctaLabelAr: "فتح إعدادات أدوار خطوط البيع",
    ctaHref: "/crm/settings?tab=pipeline-roles",
  },
  {
    id: "workflow-studio",
    icon: GitBranch,
    badge: "2D Studio v4",
    titleEn: "2. 2D Workflow Studio, Harmonic Colors & Live Simulator",
    titleAr: "2. استوديو مسارات العمل ثنائي الأبعاد والمحاكي الفوري",
    summaryEn:
      "Design Deal & Lead pipelines visually with 18 Nexus color tokens + Custom Hex (#RRGGBB) auto-harmonized via CSS color-mix(), SAP-style Stage Field-Locking, Stage Playbook Auto-Tasks, and the Live Simulation Sandbox.",
    summaryAr:
      "صمّم مسارات الصفقات والعملاء المحتملين بصرياً مع 18 لوناً قياسياً وألوان Hex مخصصة متناغمة تلقائياً، وقفل الحقول في المراحل، ومهام الدليل التلقائية، ومحاكي المسارات.",
    stepsEn: [
      "Click any Stage Node to pick from 18 semantic swatches or any Custom Hex (#RRGGBB).",
      "Configure Stage Playbook mandatory tasks and SAP-style Read-Only Field Locks per stage.",
      "Open the 4-Category Rule Catalog to configure Multi-Tier Approval Matrices (Any/All Quorum).",
      "Click 'Simulate Workflow' on the 2D Canvas toolbar to test Allowed (Emerald) vs Blocked (Rose) transitions live.",
    ],
    ctaLabelEn: "Launch 2D Workflow Studio",
    ctaLabelAr: "تشغيل استوديو مسارات العمل",
    ctaHref: "/crm/pipelines",
  },
  {
    id: "deal-360",
    icon: Users,
    badge: "Deal 360 & Sports OS",
    titleEn: "3. Deal 360 Buying Committee, Quotes & Audit Ledger",
    titleAr: "3. نظرة شاملة للصفقة ولجنة الشراء وسجل الاعتمادات",
    summaryEn:
      "Manage customer Buying Committee stakeholders, build multi-item commercial quotes with automatic >15% discount approval gates, complete Stage Playbook checklists, and trigger native Venue & Academy B2B provisioning.",
    summaryAr:
      "أدر أصحاب المصلحة في لجنة الشراء، وأنشئ عروض الأسعار مع بوابة اعتماد الخصومات (>15%)، وتابع سجل انتقالات المراحل والتكامل المباشر مع المنشآت والأكاديمية.",
    stepsEn: [
      "Assign customer contacts to Buying Committee roles or add new stakeholder roles inline.",
      "Verify Stage Dwell-Time SLA status and check off Stage Playbook tasks.",
      "Inspect the Bidirectional Stage Transition & Approval Audit Ledger.",
      "Place Venue Block-Booking Holds or provision Academy B2B Scholarship Cohorts in 1 click.",
    ],
    ctaLabelEn: "Explore Opportunities Kanban",
    ctaLabelAr: "استعراض لوحة الفرص البيعية",
    ctaHref: "/crm/opportunities",
  },
] as const;

export function CrmSmartGuideModal({ open, onOpenChange, isRtl = false }: CrmSmartGuideModalProps) {
  const router = useRouter();
  const [activeId, setActiveId] = useState<string>(USER_JOURNEYS[0].id);
  const current = USER_JOURNEYS.find((j) => j.id === activeId) ?? USER_JOURNEYS[0];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl z-[10010]" dir={isRtl ? "rtl" : "ltr"} data-testid="crm-smart-guide-modal">
        <DialogHeader>
          <div className="flex items-center justify-between gap-2">
            <Badge variant="default" className="text-[10px] font-mono gap-1">
              <Sparkles className="w-3 h-3" />SCRIPE CRM v4 INTERACTIVE COACH
            </Badge>
            <Badge variant="outline" className="text-[10px] font-mono">3 Guided Journeys</Badge>
          </div>
          <DialogTitle className="text-base font-bold text-nx-ink flex items-center gap-2 pt-1">
            <BookOpen className="w-4 h-4 text-nx-accent" />
            {isRtl ? "الدليل الذكي ومسارات الاستخدام التفاعلية لنظام CRM" : "CRM Smart Guide & Interactive User Journeys"}
          </DialogTitle>
          <DialogDescription className="text-xs text-nx-ink-2">
            {isRtl
              ? "استكشف المعمارية الرباعية للأدوار، واستوديو مسارات العمل ثنائي الأبعاد، وإعدادات الحوكمة المتقدمة."
              : "Master the 4-layer role architecture, 2D Workflow Studio v4, SAP-style stage field locks, and Deal 360 execution."}
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
                      {isRtl ? j.titleAr : j.titleEn}
                    </span>
                  </div>
                  <Badge variant="outline" className="text-[9px] font-mono shrink-0">{j.badge}</Badge>
                </Button>
              );
            })}
          </div>

          <div className="md:col-span-7 rounded-md border border-nx-line bg-nx-raised/40 p-4 space-y-3" data-testid={`smart-guide-panel-${current.id}`}>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-nx-ink">{isRtl ? current.titleAr : current.titleEn}</h4>
              <p className="text-xs text-nx-ink-2 leading-relaxed">{isRtl ? current.summaryAr : current.summaryEn}</p>
            </div>
            <div className="space-y-1.5 pt-1">
              {current.stepsEn.map((step, idx) => (
                <div key={idx} className="flex items-start gap-2 rounded border border-nx-line bg-nx-surface px-2.5 py-1.5 text-xs">
                  <CheckCircle2 className="w-3.5 h-3.5 text-success shrink-0 mt-0.5" />
                  <span className="text-nx-ink">{step}</span>
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
                {isRtl ? current.ctaLabelAr : current.ctaLabelEn}
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} data-testid="close-smart-guide-btn">
            {isRtl ? "إغلاق الدليل" : "Close Guide"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
