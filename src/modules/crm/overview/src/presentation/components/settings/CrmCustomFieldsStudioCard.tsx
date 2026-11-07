"use client";

import { useState } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { Button } from "@core/ui/button";
import { Card } from "@core/ui/card";
import { Badge } from "@core/ui/badge";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { Checkbox } from "@core/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@core/ui/select";
import { Layers, Plus, Trash2, CheckCircle2 } from "lucide-react";
import type { CrmEntityTypeKey, CrmModuleSettingsState, CrmCustomFieldDefinition } from "../../stores/useCrmSettingsStore";

/** Props for CrmCustomFieldsStudioCard. */
export interface CrmCustomFieldsStudioCardProps {
  settings: CrmModuleSettingsState;
  onCreateCustomField: (input: {
    entityTypeKey: CrmEntityTypeKey;
    key: string;
    labelEn: string;
    labelAr?: string;
    valueType: "Text" | "Number" | "Currency" | "Date" | "Select" | "Boolean";
    isRequired: boolean;
    optionsCsv?: string;
    defaultStageGateKey?: string;
  }) => Promise<CrmCustomFieldDefinition>;
  onNotifySaved: (msg: string) => void;
}

const STAGE_OPTIONS = [
  { key: "none", label: "No automatic stage gate" },
  { key: "default.discovery", label: "Discovery Exit Gate" },
  { key: "default.qualification", label: "Qualification Exit Gate" },
  { key: "default.solution_fit", label: "Solution Fit Exit Gate" },
  { key: "default.proposal", label: "Proposal Exit Gate" },
  { key: "default.negotiation", label: "Negotiation Exit Gate" },
];

/** Domain 3 Card: Cross-Module SCRIPE Sports OS Integrations Hub & Custom Fields Studio. */
export function CrmCustomFieldsStudioCard({ settings, onCreateCustomField, onNotifySaved }: CrmCustomFieldsStudioCardProps) {
  const { t, language } = useI18n();
  const [cfEntityType, setCfEntityType] = useState<CrmEntityTypeKey>("crm.opportunity");
  const [cfKey, setCfKey] = useState("");
  const [cfLabelEn, setCfLabelEn] = useState("");
  const [cfLabelAr, setCfLabelAr] = useState("");
  const [cfValueType, setCfValueType] = useState<"Text" | "Number" | "Currency" | "Date" | "Select" | "Boolean">("Text");
  const [cfOptionsCsv, setCfOptionsCsv] = useState("");
  const [cfRequired, setCfRequired] = useState(false);
  const [cfStageGate, setCfStageGate] = useState("default.proposal");
  const [isCreatingCf, setIsCreatingCf] = useState(false);

  const handleSubmitField = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cfKey.trim() || !cfLabelEn.trim()) return;
    setIsCreatingCf(true);
    try {
      const created = await onCreateCustomField({
        entityTypeKey: cfEntityType, key: cfKey, labelEn: cfLabelEn, labelAr: cfLabelAr,
        valueType: cfValueType, isRequired: cfRequired, optionsCsv: cfOptionsCsv, defaultStageGateKey: cfStageGate,
      });
      setCfKey(""); setCfLabelEn(""); setCfLabelAr(""); setCfOptionsCsv(""); setCfRequired(false);
      onNotifySaved(`Custom field "${created.labelEn}" (${created.key}) created & bound.`);
    } finally {
      setIsCreatingCf(false);
    }
  };

  return (
    <Card className="p-5 bg-nx-surface border-nx-line space-y-5" data-testid="crm-settings-custom-fields-card">
      <div className="flex items-start gap-3 border-b border-nx-line pb-4">
        <div className="size-9 rounded-nx-md bg-nx-raised border border-nx-line flex items-center justify-center shrink-0">
          <Layers className="size-4 text-nx-accent" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-nx-ink">{t("crm.settings.domains.integrations")}</h2>
          <p className="text-xs text-nx-ink-3 mt-0.5">{t("crm.settings.domains.integrationsDesc")}</p>
        </div>
      </div>

      {/* Cross-Module SCRIPE Sports OS Integrations Toggles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="rounded-nx-md border border-nx-line bg-nx-ground p-3.5 flex items-start gap-3">
          <Checkbox id="crm-int-catalog" checked={settings.enableCatalogPricingQuoteHandoff} onCheckedChange={(c) => settings.updateSettings({ enableCatalogPricingQuoteHandoff: Boolean(c) })} className="mt-0.5" />
          <div className="space-y-0.5">
            <Label htmlFor="crm-int-catalog" className="text-xs font-semibold text-nx-ink cursor-pointer">{t("crm.settings.integrations.catalogPricingTitle")}</Label>
            <p className="text-[11px] text-nx-ink-3">{t("crm.settings.integrations.catalogPricingDesc")}</p>
          </div>
        </div>
        <div className="rounded-nx-md border border-nx-line bg-nx-ground p-3.5 flex items-start gap-3">
          <Checkbox id="crm-int-venue" checked={settings.enableVenueAcademyCommercialHandoff} onCheckedChange={(c) => settings.updateSettings({ enableVenueAcademyCommercialHandoff: Boolean(c) })} className="mt-0.5" />
          <div className="space-y-0.5">
            <Label htmlFor="crm-int-venue" className="text-xs font-semibold text-nx-ink cursor-pointer">{t("crm.settings.integrations.venueAcademyTitle")}</Label>
            <p className="text-[11px] text-nx-ink-3">{t("crm.settings.integrations.venueAcademyDesc")}</p>
          </div>
        </div>
        <div className="rounded-nx-md border border-nx-line bg-nx-ground p-3.5 flex items-start gap-3">
          <Checkbox id="crm-int-work" checked={settings.autoCreateWorkItemsOnStageMove} onCheckedChange={(c) => settings.updateSettings({ autoCreateWorkItemsOnStageMove: Boolean(c) })} className="mt-0.5" />
          <div className="space-y-0.5">
            <Label htmlFor="crm-int-work" className="text-xs font-semibold text-nx-ink cursor-pointer">{t("crm.settings.integrations.workManagementTitle")}</Label>
            <p className="text-[11px] text-nx-ink-3">{t("crm.settings.integrations.workManagementDesc")}</p>
          </div>
        </div>
        <div className="rounded-nx-md border border-nx-line bg-nx-ground p-3.5 flex items-start gap-3">
          <Checkbox id="crm-int-party" checked={settings.autoSyncPartyKernelOnConvert} onCheckedChange={(c) => settings.updateSettings({ autoSyncPartyKernelOnConvert: Boolean(c) })} className="mt-0.5" />
          <div className="space-y-0.5">
            <Label htmlFor="crm-int-party" className="text-xs font-semibold text-nx-ink cursor-pointer">{t("crm.settings.integrations.partyKernelTitle")}</Label>
            <p className="text-[11px] text-nx-ink-3">{t("crm.settings.integrations.partyKernelDesc")}</p>
          </div>
        </div>
      </div>

      {/* Custom Fields Studio Form */}
      <form onSubmit={handleSubmitField} className="rounded-nx-md border border-nx-line bg-nx-raised/25 p-4 space-y-3" data-testid="crm-settings-create-cf-form">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-nx-ink">{t("crm.settings.integrations.customFieldsTitle")}</span>
          <Badge variant="outline" className="border-nx-line text-nx-ink-3 text-[10px] font-mono">custom:&lt;field_key&gt;</Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="space-y-1">
            <Label className="text-[11px] font-semibold text-nx-ink">{t("crm.settings.integrations.targetEntity")}</Label>
            <Select value={cfEntityType} onValueChange={(v) => setCfEntityType(v as CrmEntityTypeKey)}>
              <SelectTrigger data-testid="crm-cf-entity-select" className="h-8 text-xs bg-nx-ground border-nx-line text-nx-ink"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="crm.opportunity">{t("crm.settings.integrations.entityOpportunity")}</SelectItem>
                <SelectItem value="crm.lead">{t("crm.settings.integrations.entityLead")}</SelectItem>
                <SelectItem value="crm.account">{t("crm.settings.integrations.entityAccount")}</SelectItem>
                <SelectItem value="crm.contact">{t("crm.settings.integrations.entityContact")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-[11px] font-semibold text-nx-ink">{t("crm.settings.integrations.fieldKeyLabel")}</Label>
            <Input value={cfKey} onChange={(e) => setCfKey(e.target.value)} placeholder={t("crm.settings.integrations.fieldKeyPlaceholder")} data-testid="crm-cf-key-input" required className="h-8 text-xs font-mono bg-nx-ground border-nx-line text-nx-ink" />
          </div>
          <div className="space-y-1">
            <Label className="text-[11px] font-semibold text-nx-ink">{t("crm.settings.integrations.labelEnLabel")}</Label>
            <Input value={cfLabelEn} onChange={(e) => setCfLabelEn(e.target.value)} placeholder={t("crm.settings.integrations.labelEnPlaceholder")} data-testid="crm-cf-label-en-input" required className="h-8 text-xs bg-nx-ground border-nx-line text-nx-ink" />
          </div>
          <div className="space-y-1">
            <Label className="text-[11px] font-semibold text-nx-ink">{t("crm.settings.integrations.labelArLabel")}</Label>
            <Input value={cfLabelAr} onChange={(e) => setCfLabelAr(e.target.value)} placeholder={t("crm.settings.integrations.labelArPlaceholder")} data-testid="crm-cf-label-ar-input" className="h-8 text-xs bg-nx-ground border-nx-line text-nx-ink" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
          <div className="space-y-1">
            <Label className="text-[11px] font-semibold text-nx-ink">{t("crm.settings.integrations.dataTypeLabel")}</Label>
            <Select value={cfValueType} onValueChange={(v) => setCfValueType(v as typeof cfValueType)}>
              <SelectTrigger data-testid="crm-cf-type-select" className="h-8 text-xs bg-nx-ground border-nx-line text-nx-ink"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Text">Text</SelectItem>
                <SelectItem value="Number">Number</SelectItem>
                <SelectItem value="Currency">Currency</SelectItem>
                <SelectItem value="Date">Date</SelectItem>
                <SelectItem value="Select">Select</SelectItem>
                <SelectItem value="Boolean">Boolean</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {cfEntityType === "crm.opportunity" ? (
            <div className="space-y-1">
              <Label className="text-[11px] font-semibold text-nx-ink">{t("crm.settings.integrations.bindStageGateLabel")}</Label>
              <Select value={cfStageGate} onValueChange={setCfStageGate}>
                <SelectTrigger data-testid="crm-cf-stage-gate-select" className="h-8 text-xs bg-nx-ground border-nx-line text-nx-ink"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {STAGE_OPTIONS.map((st) => (<SelectItem key={st.key} value={st.key}>{st.label}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <div className="space-y-1">
              <Label className="text-[11px] font-semibold text-nx-ink">{t("crm.settings.integrations.selectOptionsCsvLabel")}</Label>
              <Input value={cfOptionsCsv} onChange={(e) => setCfOptionsCsv(e.target.value)} placeholder="Option A, Option B" className="h-8 text-xs bg-nx-ground border-nx-line text-nx-ink" />
            </div>
          )}

          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Checkbox id="crm-cf-required-check" checked={cfRequired} onCheckedChange={(c) => setCfRequired(Boolean(c))} />
              <Label htmlFor="crm-cf-required-check" className="text-xs text-nx-ink cursor-pointer">{t("crm.settings.integrations.requiredLabel")}</Label>
            </div>
            <Button type="submit" size="sm" disabled={isCreatingCf} data-testid="crm-cf-submit-btn" className="h-8 text-xs font-bold gap-1">
              <Plus className="size-3.5" /><span>{t("crm.settings.integrations.createFieldBtn")}</span>
            </Button>
          </div>
        </div>
      </form>

      {/* Registered Custom Fields List */}
      <div className="divide-y divide-nx-line rounded-nx-md border border-nx-line bg-nx-ground" data-testid="crm-settings-custom-fields-list">
        {settings.crmCustomFields.map((field) => (
          <div key={field.id} className="p-3 flex items-center justify-between gap-3" data-testid={`crm-cf-row-${field.key}`}>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-nx-ink">{language === "ar" ? field.labelAr : field.labelEn}</span>
              <Badge variant="outline" className="font-mono text-[10px] border-nx-line bg-nx-surface text-nx-ink-2">custom:{field.key}</Badge>
              <Badge variant="outline" className="text-[10px] border-nx-line text-nx-ink-3">{field.entityTypeKey}</Badge>
              <Badge variant="outline" className="text-[10px] border-nx-line text-nx-ink-3">{field.valueType}</Badge>
              {field.defaultStageGateKey && (
                <Badge variant="outline" className="border-nx-accent/40 bg-nx-accent-wash/20 text-nx-accent text-[10px] gap-1">
                  <CheckCircle2 className="size-2.5" /> {t("crm.settings.integrations.gatePrefix")}: {field.defaultStageGateKey}
                </Badge>
              )}
            </div>
            <Button type="button" variant="ghost" size="sm" onClick={() => settings.removeCrmCustomField(field.id)} className="h-7 w-7 p-0 text-nx-ink-3 hover:text-destructive">
              <Trash2 className="size-3.5" />
            </Button>
          </div>
        ))}
      </div>
    </Card>
  );
}
