"use client";

import {
  ShieldCheck,
  Clock,
  Lock,
  Database,
  BookOpen,
  Coins,
  FileCheck2,
  Trophy,
  LayoutGrid,
} from "lucide-react";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";

export type CrmSettingsTabKey =
  | "all"
  | "pipeline-roles"
  | "sla-escalation"
  | "field-locking"
  | "custom-fields"
  | "dictionaries"
  | "currency-fx"
  | "quotes-approvals"
  | "numbering-handoffs";

const SETTINGS_NAV_GROUPS: Array<{
  groupEn: string;
  groupAr: string;
  items: Array<{ key: CrmSettingsTabKey; labelEn: string; labelAr: string; icon: typeof ShieldCheck }>;
}> = [
  {
    groupEn: "1. Workflow & Governance",
    groupAr: "1. سير العمل والحوكمة",
    items: [
      { key: "pipeline-roles", labelEn: "Pipeline & Workflow Roles", labelAr: "أدوار المسارات والاعتماد", icon: ShieldCheck },
      { key: "sla-escalation", labelEn: "Stage SLA & Escalation", labelAr: "اتفاقية SLA والتصعيد", icon: Clock },
      { key: "field-locking", labelEn: "Field-Locking & Playbooks", labelAr: "قفل الحقول ودليل المراحل", icon: Lock },
    ],
  },
  {
    groupEn: "2. Data & Schemas",
    groupAr: "2. البيانات والنماذج",
    items: [
      { key: "custom-fields", labelEn: "Custom Fields & Schemas", labelAr: "الحقول المخصصة والنماذج", icon: Database },
      { key: "dictionaries", labelEn: "Commercial Dictionaries", labelAr: "القواميس التجارية", icon: BookOpen },
    ],
  },
  {
    groupEn: "3. Commercial & Finance",
    groupAr: "3. التجارة والمالية",
    items: [
      { key: "currency-fx", labelEn: "Multi-Currency & FX Table", labelAr: "العملات وأسعار الصرف", icon: Coins },
      { key: "quotes-approvals", labelEn: "Quote Rules & Approvals", labelAr: "قواعد عروض الأسعار", icon: FileCheck2 },
      { key: "numbering-handoffs", labelEn: "Numbering & Sports OS", labelAr: "الترقيم وتكامل Sports OS", icon: Trophy },
    ],
  },
];

export interface CrmSettingsSidebarNavProps {
  isRtl: boolean;
  selectedSection: CrmSettingsTabKey;
  onSelectSection: (section: CrmSettingsTabKey) => void;
  navSearch: string;
  onNavSearchChange: (query: string) => void;
}

export function CrmSettingsSidebarNav({
  isRtl,
  selectedSection,
  onSelectSection,
  navSearch,
  onNavSearchChange,
}: CrmSettingsSidebarNavProps) {
  return (
    <aside className="lg:col-span-3 rounded-xl border border-nx-line bg-nx-surface p-3 space-y-3 lg:sticky lg:top-4" data-testid="crm-settings-left-sidebar">
      <div className="flex items-center justify-between px-1">
        <span className="text-[11px] font-bold uppercase tracking-wider text-nx-ink-2">
          {isRtl ? "أقسام إعدادات CRM" : "CRM Control Center"}
        </span>
        <Badge variant="outline" className="text-[9px] font-mono">8 Modules</Badge>
      </div>
      <Input
        value={navSearch}
        onChange={(e) => onNavSearchChange(e.target.value)}
        placeholder={isRtl ? "بحث في الإعدادات..." : "Filter settings domains..."}
        className="h-7 text-xs"
        data-testid="crm-settings-nav-search"
      />
      <Button
        type="button"
        size="sm"
        variant={selectedSection === "all" ? "default" : "ghost"}
        onClick={() => onSelectSection("all")}
        data-testid="settings-nav-all"
        className="w-full justify-start h-8 text-xs gap-2"
      >
        <LayoutGrid className="size-3.5" />
        <span>{isRtl ? "عرض جميع الإعدادات (الكل)" : "All Settings Overview"}</span>
      </Button>

      {SETTINGS_NAV_GROUPS.map((group) => {
        const filtered = group.items.filter(
          (i) =>
            !navSearch.trim() ||
            i.labelEn.toLowerCase().includes(navSearch.toLowerCase()) ||
            i.labelAr.includes(navSearch)
        );
        if (filtered.length === 0) return null;
        return (
          <div key={group.groupEn} className="space-y-1 pt-1 border-t border-nx-line/60">
            <div className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-nx-ink-3">
              {isRtl ? group.groupAr : group.groupEn}
            </div>
            {filtered.map((item) => {
              const Icon = item.icon;
              const active = selectedSection === item.key;
              return (
                <Button
                  key={item.key}
                  type="button"
                  size="sm"
                  variant={active ? "default" : "ghost"}
                  onClick={() => onSelectSection(item.key)}
                  data-testid={`settings-nav-${item.key}`}
                  className="w-full justify-start h-8 text-xs gap-2"
                >
                  <Icon className="size-3.5 shrink-0" />
                  <span className="truncate">{isRtl ? item.labelAr : item.labelEn}</span>
                </Button>
              );
            })}
          </div>
        );
      })}
    </aside>
  );
}
