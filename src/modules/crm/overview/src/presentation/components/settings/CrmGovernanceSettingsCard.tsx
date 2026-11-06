"use client";

import { useI18n } from "@core/providers/i18n-provider";
import { Card } from "@core/ui/card";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { Checkbox } from "@core/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@core/ui/select";
import { ShieldCheck, Sliders } from "lucide-react";
import type {
  CrmModuleSettingsState,
  CrmStageGateStrictness,
} from "../../viewmodels/useCrmSettingsStore";

/** Props for CrmGovernanceSettingsCard. */
export interface CrmGovernanceSettingsCardProps {
  settings: CrmModuleSettingsState;
}

/**
 * Domain 2 & Domain 4 Card: Lead & Deal Governance Policies + User Workspace Personalization (<210 lines).
 */
export function CrmGovernanceSettingsCard({ settings }: CrmGovernanceSettingsCardProps) {
  const { t } = useI18n();

  return (
    <div className="space-y-6">
      <Card className="p-5 bg-nx-surface border-nx-line space-y-5" data-testid="crm-settings-governance-card">
        <div className="flex items-start gap-3 border-b border-nx-line pb-4">
          <div className="size-9 rounded-nx-md bg-nx-raised border border-nx-line flex items-center justify-center shrink-0">
            <ShieldCheck className="size-4 text-nx-accent" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-nx-ink">{t("crm.settings.domains.governance")}</h2>
            <p className="text-xs text-nx-ink-3 mt-0.5">{t("crm.settings.domains.governanceDesc")}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-nx-ink">{t("crm.settings.governance.stageGateStrictness")}</Label>
            <Select value={settings.stageGateStrictness} onValueChange={(val) => settings.setStageGateStrictness(val as CrmStageGateStrictness)}>
              <SelectTrigger data-testid="crm-settings-strictness-select" className="h-9 text-xs bg-nx-ground border-nx-line text-nx-ink">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="strict">{t("crm.settings.governance.strictMode")}</SelectItem>
                <SelectItem value="advisory">{t("crm.settings.governance.advisoryMode")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-nx-ink">{t("crm.settings.governance.duplicateMode")}</Label>
            <Select
              value={settings.duplicateDetectionMode}
              onValueChange={(val) => settings.updateSettings({ duplicateDetectionMode: val as "strict" | "fuzzy" | "advisory" })}
            >
              <SelectTrigger className="h-9 text-xs bg-nx-ground border-nx-line text-nx-ink"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="strict">{t("crm.settings.governance.dupStrict")}</SelectItem>
                <SelectItem value="fuzzy">{t("crm.settings.governance.dupFuzzy")}</SelectItem>
                <SelectItem value="advisory">{t("crm.settings.governance.dupAdvisory")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-nx-ink">{t("crm.settings.governance.assignmentRule")}</Label>
            <Select
              value={settings.leadAutoAssignmentRule}
              onValueChange={(val) => settings.updateSettings({ leadAutoAssignmentRule: val as "round_robin" | "territory" | "manual" })}
            >
              <SelectTrigger className="h-9 text-xs bg-nx-ground border-nx-line text-nx-ink"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="round_robin">{t("crm.settings.governance.assignRoundRobin")}</SelectItem>
                <SelectItem value="territory">{t("crm.settings.governance.assignTerritory")}</SelectItem>
                <SelectItem value="manual">{t("crm.settings.governance.assignManual")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-nx-ink">{t("crm.settings.governance.defaultLeadSource")}</Label>
            <Select value={settings.defaultLeadSource} onValueChange={(val) => settings.setDefaultLeadSource(val)}>
              <SelectTrigger className="h-9 text-xs bg-nx-ground border-nx-line text-nx-ink"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Inbound">{t("crm.settings.governance.sourceInbound")}</SelectItem>
                <SelectItem value="Website">{t("crm.settings.governance.sourceWebsite")}</SelectItem>
                <SelectItem value="Referral">{t("crm.settings.governance.sourceReferral")}</SelectItem>
                <SelectItem value="DirectOutreach">{t("crm.settings.governance.sourceDirectOutreach")}</SelectItem>
                <SelectItem value="Event">{t("crm.settings.governance.sourceEvent")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-nx-ink">{t("crm.settings.governance.slaHours")}</Label>
            <Input
              type="number" min={1} max={168} value={settings.slaLeadResponseHours}
              onChange={(e) => settings.setSlaLeadResponseHours(Number(e.target.value) || 4)}
              className="h-9 text-xs font-mono bg-nx-ground border-nx-line text-nx-ink"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-nx-ink">{t("crm.settings.governance.stalledDays")}</Label>
            <Input
              type="number" min={1} max={365} value={settings.stalledDealThresholdDays}
              onChange={(e) => settings.setStalledDealThresholdDays(Number(e.target.value) || 14)}
              className="h-9 text-xs font-mono bg-nx-ground border-nx-line text-nx-ink"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
          <div className="rounded-nx-md border border-nx-line bg-nx-ground p-3.5 flex items-start gap-3">
            <Checkbox id="crm-party-gate-toggle" checked={settings.requirePartyOnProposal} onCheckedChange={(c) => settings.setRequirePartyOnProposal(Boolean(c))} className="mt-0.5" />
            <Label htmlFor="crm-party-gate-toggle" className="text-xs font-semibold text-nx-ink cursor-pointer">
              {t("crm.settings.governance.requirePartyProposal")}
            </Label>
          </div>
          <div className="rounded-nx-md border border-nx-line bg-nx-ground p-3.5 flex items-start gap-3">
            <Checkbox id="crm-close-notes-win-toggle" checked={settings.requireCloseNotesOnWin} onCheckedChange={(c) => settings.setRequireCloseNotesOnWin(Boolean(c))} className="mt-0.5" />
            <Label htmlFor="crm-close-notes-win-toggle" className="text-xs font-semibold text-nx-ink cursor-pointer">
              {t("crm.settings.governance.requireCloseNotes")}
            </Label>
          </div>
        </div>
      </Card>

      <Card className="p-5 bg-nx-surface border-nx-line space-y-4" data-testid="crm-settings-user-workspace-card">
        <div className="flex items-start gap-3 border-b border-nx-line pb-3">
          <div className="size-9 rounded-nx-md bg-nx-raised border border-nx-line flex items-center justify-center shrink-0">
            <Sliders className="size-4 text-nx-accent" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-nx-ink">{t("crm.settings.governance.userWorkspaceTitle")}</h2>
            <p className="text-xs text-nx-ink-3 mt-0.5">{t("crm.settings.governance.userWorkspaceSubtitle")}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-nx-ink">{t("crm.settings.governance.defaultViewMode")}</Label>
            <Select value={settings.defaultDealViewMode} onValueChange={(val) => settings.updateSettings({ defaultDealViewMode: val as "Kanban" | "Table" | "SplitPane" })}>
              <SelectTrigger data-testid="crm-settings-view-mode-select" className="h-9 text-xs bg-nx-ground border-nx-line text-nx-ink"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Kanban">{t("crm.settings.governance.viewKanban")}</SelectItem>
                <SelectItem value="Table">{t("crm.settings.governance.viewTable")}</SelectItem>
                <SelectItem value="SplitPane">{t("crm.settings.governance.viewSplitPane")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-nx-ink">{t("crm.settings.governance.defaultPipeline")}</Label>
            <Select value={settings.defaultPipelineCode} onValueChange={(val) => settings.updateSettings({ defaultPipelineCode: val })}>
              <SelectTrigger className="h-9 text-xs bg-nx-ground border-nx-line text-nx-ink"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="default">{t("crm.settings.governance.pipelineDefault")}</SelectItem>
                <SelectItem value="enterprise">{t("crm.settings.governance.pipelineEnterprise")}</SelectItem>
                <SelectItem value="sponsorship">{t("crm.settings.governance.pipelineSponsorship")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-nx-ink">{t("crm.settings.governance.cardDensity")}</Label>
            <Select value={settings.cardDensity} onValueChange={(val) => settings.updateSettings({ cardDensity: val as "Comfortable" | "Compact" })}>
              <SelectTrigger className="h-9 text-xs bg-nx-ground border-nx-line text-nx-ink"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Comfortable">{t("crm.settings.governance.densityComfortable")}</SelectItem>
                <SelectItem value="Compact">{t("crm.settings.governance.densityCompact")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
          <div className="rounded-nx-md border border-nx-line bg-nx-ground p-3 flex items-center gap-3">
            <Checkbox id="crm-daily-digest-toggle" checked={settings.dailyDigestEnabled} onCheckedChange={(c) => settings.updateSettings({ dailyDigestEnabled: Boolean(c) })} />
            <Label htmlFor="crm-daily-digest-toggle" className="text-xs font-semibold text-nx-ink cursor-pointer">{t("crm.settings.governance.dailyDigest")}</Label>
          </div>
          <div className="rounded-nx-md border border-nx-line bg-nx-ground p-3 flex items-center gap-3">
            <Checkbox id="crm-stage-notif-toggle" checked={settings.stageMoveNotificationsEnabled} onCheckedChange={(c) => settings.updateSettings({ stageMoveNotificationsEnabled: Boolean(c) })} />
            <Label htmlFor="crm-stage-notif-toggle" className="text-xs font-semibold text-nx-ink cursor-pointer">{t("crm.settings.governance.stageNotifications")}</Label>
          </div>
        </div>
      </Card>
    </div>
  );
}
