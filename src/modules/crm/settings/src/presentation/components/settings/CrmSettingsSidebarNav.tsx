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
import { useI18n } from "@core/providers/i18n-provider";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { Card } from "@core/ui/card";
import { Input } from "@core/ui/input";
import type { CrmSettingsTabKey } from "../../viewmodels/useCrmSettingsViewModel";

const SETTINGS_NAV_GROUPS: Array<{
  groupKey: string;
  items: Array<{ key: CrmSettingsTabKey; labelKey: string; icon: typeof ShieldCheck }>;
}> = [
  {
    groupKey: "crm.settings.sidebar.group1",
    items: [
      { key: "pipeline-roles", labelKey: "crm.settings.sidebar.tabPipelineRoles", icon: ShieldCheck },
      { key: "sla-escalation", labelKey: "crm.settings.sidebar.tabSlaEscalation", icon: Clock },
      { key: "field-locking", labelKey: "crm.settings.sidebar.tabFieldLocking", icon: Lock },
    ],
  },
  {
    groupKey: "crm.settings.sidebar.group2",
    items: [
      { key: "custom-fields", labelKey: "crm.settings.sidebar.tabCustomFields", icon: Database },
      { key: "dictionaries", labelKey: "crm.settings.sidebar.tabDictionaries", icon: BookOpen },
    ],
  },
  {
    groupKey: "crm.settings.sidebar.group3",
    items: [
      { key: "currency-fx", labelKey: "crm.settings.sidebar.tabCurrencyFx", icon: Coins },
      { key: "quotes-approvals", labelKey: "crm.settings.sidebar.tabQuotesApprovals", icon: FileCheck2 },
      { key: "numbering-handoffs", labelKey: "crm.settings.sidebar.tabNumberingHandoffs", icon: Trophy },
    ],
  },
];

/** Props for `CrmSettingsSidebarNav`. */
export interface CrmSettingsSidebarNavProps {
  isRtl: boolean;
  selectedSection: CrmSettingsTabKey;
  onSelectSection: (section: CrmSettingsTabKey) => void;
  navSearch: string;
  onNavSearchChange: (query: string) => void;
}

/** Left navigation rail inside `/crm/settings` for filtering settings domains. */
export function CrmSettingsSidebarNav({
  selectedSection,
  onSelectSection,
  navSearch,
  onNavSearchChange,
}: CrmSettingsSidebarNavProps) {
  const { t } = useI18n();

  return (
    <Card
      className="lg:col-span-3 border-nx-line bg-nx-surface p-3 space-y-3 lg:sticky lg:top-4"
      data-testid="crm-settings-left-sidebar"
    >
      <div className="flex items-center justify-between px-1">
        <span className="text-[11px] font-bold uppercase tracking-wider text-nx-ink-2">
          {t("crm.settings.sidebar.controlCenterTitle")}
        </span>
        <Badge variant="outline" className="text-[9px] font-mono">
          {t("crm.settings.sidebar.modulesBadge")}
        </Badge>
      </div>
      <Input
        value={navSearch}
        onChange={(e) => onNavSearchChange(e.target.value)}
        placeholder={t("crm.settings.sidebar.searchPlaceholder")}
        className="h-7 text-xs"
        data-testid="crm-settings-nav-search"
      />
      <Button
        type="button"
        size="sm"
        variant={selectedSection === "all" ? "secondary" : "ghost"}
        onClick={() => onSelectSection("all")}
        data-testid="settings-nav-all"
        className="w-full justify-start h-8 text-xs gap-2"
      >
        <LayoutGrid className="size-3.5" />
        <span>{t("crm.settings.sidebar.allOverviewBtn")}</span>
      </Button>

      {SETTINGS_NAV_GROUPS.map((group) => {
        const filtered = group.items.filter(
          (i) =>
            !navSearch.trim() ||
            t(i.labelKey).toLowerCase().includes(navSearch.toLowerCase()) ||
            i.key.toLowerCase().includes(navSearch.toLowerCase())
        );
        if (filtered.length === 0) return null;
        return (
          <div key={group.groupKey} className="space-y-1 pt-1 border-t border-nx-line/60">
            <div className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-nx-ink-3">
              {t(group.groupKey)}
            </div>
            {filtered.map((item) => {
              const Icon = item.icon;
              const active = selectedSection === item.key;
              return (
                <Button
                  key={item.key}
                  type="button"
                  size="sm"
                  variant={active ? "secondary" : "ghost"}
                  onClick={() => onSelectSection(item.key)}
                  data-testid={`settings-nav-${item.key}`}
                  className="w-full justify-start h-8 text-xs gap-2"
                >
                  <Icon className="size-3.5 shrink-0" />
                  <span className="truncate">{t(item.labelKey)}</span>
                </Button>
              );
            })}
          </div>
        );
      })}
    </Card>
  );
}
