"use client";

import { Checkbox } from "@core/ui/checkbox";
import { Label } from "@core/ui/label";
import type { CrmSettingsCardModel } from "../../viewmodels/useCrmSettingsViewModel";

/** Props for `CrmIntegrationsToggleGrid`. */
export interface CrmIntegrationsToggleGridProps {
  t: (key: string) => string;
  settings: CrmSettingsCardModel;
}

/** Renders the 4 cross-module SCRIPE Sports OS integration toggles in CRM Settings. */
export function CrmIntegrationsToggleGrid({ t, settings }: CrmIntegrationsToggleGridProps) {
  const toggles: Array<{
    id: string;
    checked: boolean;
    titleKey: string;
    descKey: string;
    onChange: (checked: boolean) => void;
  }> = [
    {
      id: "crm-int-catalog",
      checked: settings.enableCatalogPricingQuoteHandoff,
      titleKey: "crm.settings.integrations.catalogPricingTitle",
      descKey: "crm.settings.integrations.catalogPricingDesc",
      onChange: (c) => settings.updateSettings({ enableCatalogPricingQuoteHandoff: c }),
    },
    {
      id: "crm-int-venue",
      checked: settings.enableVenueAcademyCommercialHandoff,
      titleKey: "crm.settings.integrations.venueAcademyTitle",
      descKey: "crm.settings.integrations.venueAcademyDesc",
      onChange: (c) => settings.updateSettings({ enableVenueAcademyCommercialHandoff: c }),
    },
    {
      id: "crm-int-work",
      checked: settings.autoCreateWorkItemsOnStageMove,
      titleKey: "crm.settings.integrations.workManagementTitle",
      descKey: "crm.settings.integrations.workManagementDesc",
      onChange: (c) => settings.updateSettings({ autoCreateWorkItemsOnStageMove: c }),
    },
    {
      id: "crm-int-party",
      checked: settings.autoSyncPartyKernelOnConvert,
      titleKey: "crm.settings.integrations.partyKernelTitle",
      descKey: "crm.settings.integrations.partyKernelDesc",
      onChange: (c) => settings.updateSettings({ autoSyncPartyKernelOnConvert: c }),
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {toggles.map((item) => (
        <div
          key={item.id}
          className="rounded-nx-md border border-nx-line bg-nx-ground p-3.5 flex items-start gap-3"
        >
          <Checkbox
            id={item.id}
            checked={item.checked}
            onCheckedChange={(c) => item.onChange(Boolean(c))}
            className="mt-0.5"
          />
          <div className="space-y-0.5">
            <Label htmlFor={item.id} className="text-xs font-semibold text-nx-ink cursor-pointer">
              {t(item.titleKey)}
            </Label>
            <p className="text-[11px] text-nx-ink-3">{t(item.descKey)}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
