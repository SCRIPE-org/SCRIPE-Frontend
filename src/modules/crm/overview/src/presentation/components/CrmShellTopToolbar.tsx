"use client";

import { useRouter } from "next/navigation";
import { Coins, HelpCircle, Plus, Search } from "lucide-react";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@core/ui/select";
import { CRM_CURRENCY_OPTIONS } from "../stores/useCrmSettingsStore";

export interface CrmShellTopToolbarProps {
  t: (key: string) => string;
  isRtl: boolean;
  baseCurrency: string;
  onBaseCurrencyChange: (currency: string) => void;
  onOpenSmartGuide: () => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  canCreateOpportunities: boolean;
  onCreateDeal?: () => void;
  canCreateLeads: boolean;
  onCreateLead?: () => void;
}

export function CrmShellTopToolbar({
  t,
  baseCurrency,
  onBaseCurrencyChange,
  onOpenSmartGuide,
  searchQuery = "",
  onSearchChange,
  canCreateOpportunities,
  onCreateDeal,
  canCreateLeads,
  onCreateLead,
}: CrmShellTopToolbarProps) {
  const router = useRouter();

  return (
    <div className="flex flex-wrap items-center gap-1 shrink-0 ms-auto">
      <div
        className="flex items-center gap-1 rounded-nx-md border border-nx-line bg-nx-surface px-1.5 py-0.5 shrink-0 w-auto min-w-[140px]"
        title="CRM Base Reporting Currency (Live Exchange Rate Conversion)"
      >
        <Coins className="size-3 text-nx-accent shrink-0" />
        <span className="text-[10px] font-bold uppercase tracking-wider text-nx-ink-3 hidden 2xl:inline">
          {t("crm.toolbar.currencyLabel")}
        </span>
        <Select value={baseCurrency} onValueChange={onBaseCurrencyChange}>
          <SelectTrigger
            data-testid="crm-global-currency-select"
            className="h-6 min-w-[82px] w-auto border-0 bg-transparent px-1 text-[11px] font-mono font-bold text-nx-ink shadow-none focus:ring-0"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CRM_CURRENCY_OPTIONS.map((curr) => (
              <SelectItem key={curr.code} value={curr.code}>
                {curr.code} ({curr.symbol})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Select onValueChange={(tabKey) => router.push(`/crm/settings?tab=${tabKey}`)}>
        <SelectTrigger
          data-testid="crm-header-settings-quickjump"
          className="h-7 w-auto min-w-[116px] px-2 text-[11px] bg-nx-surface border-nx-line hidden xl:inline-flex"
        >
          <SelectValue placeholder={t("crm.toolbar.quickSettingsPlaceholder")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="pipeline-roles" className="text-xs">1. {t("crm.settings.sidebar.tabPipelineRoles")}</SelectItem>
          <SelectItem value="sla-escalation" className="text-xs">2. {t("crm.settings.sidebar.tabSlaEscalation")}</SelectItem>
          <SelectItem value="field-locking" className="text-xs">3. {t("crm.settings.sidebar.tabFieldLocking")}</SelectItem>
          <SelectItem value="custom-fields" className="text-xs">4. {t("crm.settings.sidebar.tabCustomFields")}</SelectItem>
          <SelectItem value="dictionaries" className="text-xs">5. {t("crm.settings.sidebar.tabDictionaries")}</SelectItem>
          <SelectItem value="currency-fx" className="text-xs">6. {t("crm.settings.sidebar.tabCurrencyFx")}</SelectItem>
          <SelectItem value="quotes-approvals" className="text-xs">7. {t("crm.settings.sidebar.tabQuotesApprovals")}</SelectItem>
          <SelectItem value="numbering-handoffs" className="text-xs">8. {t("crm.settings.sidebar.tabNumberingHandoffs")}</SelectItem>
        </SelectContent>
      </Select>

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={onOpenSmartGuide}
        data-testid="crm-smart-guide-trigger"
        className="h-7 px-2 text-[11px] gap-1 border-nx-line bg-nx-surface text-nx-ink hover:bg-nx-raised shrink-0"
      >
        <HelpCircle className="size-3 text-nx-accent" />
        <span className="hidden lg:inline">{t("crm.toolbar.smartGuideBtn")}</span>
      </Button>

      {onSearchChange && (
        <div className="relative w-full sm:w-56">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-nx-ink-3" />
          <Input
            type="text"
            placeholder={t("crm.actions.searchPlaceholder")}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="h-7 pl-8 pr-2.5 text-xs bg-nx-surface border-nx-line focus-visible:ring-nx-accent text-nx-ink placeholder:text-nx-ink-3"
          />
        </div>
      )}

      {canCreateOpportunities && onCreateDeal && (
        <Button
          type="button"
          size="sm"
          onClick={onCreateDeal}
          className="h-7 px-2.5 gap-1.5 font-bold transition-all text-xs shrink-0"
        >
          <Plus className="size-3.5" />
          <span>{t("crm.actions.createDeal")}</span>
        </Button>
      )}

      {canCreateLeads && onCreateLead && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onCreateLead}
          className="h-7 px-2.5 gap-1.5 border-nx-line bg-nx-surface text-nx-ink hover:bg-nx-raised text-xs shrink-0"
        >
          <Plus className="size-3.5" />
          <span>{t("crm.actions.createLead")}</span>
        </Button>
      )}
    </div>
  );
}
