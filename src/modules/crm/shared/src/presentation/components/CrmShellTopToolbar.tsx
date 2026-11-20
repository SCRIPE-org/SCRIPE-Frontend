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
import { CRM_CURRENCY_OPTIONS } from "../../constants/crmCurrencyConstants";

/** Props for `CrmShellTopToolbar`. */
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
  canManageSettings?: boolean;
}

/**
 * Right-aligned CRM shell toolbar with global currency switcher, PBAC-gated settings quick-jump,
 * smart guide launcher, and primary create actions.
 */
export function CrmShellTopToolbar({
  t,
  isRtl,
  baseCurrency,
  onBaseCurrencyChange,
  onOpenSmartGuide,
  searchQuery = "",
  onSearchChange,
  canCreateOpportunities,
  onCreateDeal,
  canCreateLeads,
  onCreateLead,
  canManageSettings = false,
}: CrmShellTopToolbarProps) {
  const router = useRouter();
  const selectedCurrency = CRM_CURRENCY_OPTIONS.find((curr) => curr.code === baseCurrency);

  return (
    <div
      className="flex flex-wrap items-center gap-1.5 shrink-0 ms-auto max-w-full"
      dir={isRtl ? "rtl" : "ltr"}
    >
      <div
        className="flex items-center gap-1.5 rounded-nx-md border border-nx-line bg-nx-surface px-2.5 py-0.5 shrink-0 w-auto min-w-[8.5rem]"
        title={t("crm.toolbar.currencyTooltip")}
      >
        <Coins className="size-3 text-nx-accent shrink-0" />
        <span className="text-[10px] font-bold uppercase tracking-wider text-nx-ink-3 hidden 2xl:inline whitespace-nowrap">
          {t("crm.toolbar.currencyLabel")}
        </span>
        <Select dir={isRtl ? "rtl" : "ltr"} value={baseCurrency} onValueChange={onBaseCurrencyChange}>
          <SelectTrigger
            data-testid="crm-global-currency-select"
            aria-label={t("crm.toolbar.currencyTooltip")}
            className="h-6 w-auto min-w-[7.25rem] shrink-0 gap-2 border-0 bg-transparent px-1.5 text-[11px] font-mono font-bold text-nx-ink shadow-none focus:ring-0 [&>span]:line-clamp-none [&>span]:overflow-visible [&>span]:whitespace-nowrap"
          >
            <SelectValue placeholder={baseCurrency}>
              <span dir="ltr" className="inline-flex items-center gap-1 whitespace-nowrap">
                <span>{selectedCurrency?.code ?? baseCurrency}</span>
                {selectedCurrency?.symbol ? (
                  <span className="font-sans text-nx-ink-2">
                    (<span dir="auto">{selectedCurrency.symbol}</span>)
                  </span>
                ) : null}
              </span>
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {CRM_CURRENCY_OPTIONS.map((curr) => (
              <SelectItem key={curr.code} value={curr.code}>
                <span dir="ltr" className="inline-flex items-center gap-1 whitespace-nowrap font-mono">
                  <span>{curr.code}</span>
                  <span className="font-sans text-nx-ink-2">
                    (<span dir="auto">{curr.symbol}</span>)
                  </span>
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {canManageSettings && (
        <Select onValueChange={(tabKey) => router.push(`/crm/settings?tab=${tabKey}`)}>
          <SelectTrigger
            data-testid="crm-header-settings-quickjump"
            className="h-7 w-auto min-w-[116px] px-2 text-[11px] bg-nx-surface border-nx-line hidden xl:inline-flex"
          >
            <SelectValue placeholder={t("crm.toolbar.quickSettingsPlaceholder")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pipeline-roles" className="text-xs">1. {t("crm.toolbar.quickJump.pipelineRoles")}</SelectItem>
            <SelectItem value="sla-escalation" className="text-xs">2. {t("crm.toolbar.quickJump.slaEscalation")}</SelectItem>
            <SelectItem value="field-locking" className="text-xs">3. {t("crm.toolbar.quickJump.fieldLocking")}</SelectItem>
            <SelectItem value="custom-fields" className="text-xs">4. {t("crm.toolbar.quickJump.customFields")}</SelectItem>
            <SelectItem value="dictionaries" className="text-xs">5. {t("crm.toolbar.quickJump.dictionaries")}</SelectItem>
            <SelectItem value="currency-fx" className="text-xs">6. {t("crm.toolbar.quickJump.currencyFx")}</SelectItem>
            <SelectItem value="quotes-approvals" className="text-xs">7. {t("crm.toolbar.quickJump.quotesApprovals")}</SelectItem>
            <SelectItem value="numbering-handoffs" className="text-xs">8. {t("crm.toolbar.quickJump.numberingHandoffs")}</SelectItem>
          </SelectContent>
        </Select>
      )}

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
          <Search className="absolute start-2.5 top-1/2 -translate-y-1/2 size-3.5 text-nx-ink-3" />
          <Input
            type="text"
            placeholder={t("crm.actions.searchPlaceholder")}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="h-7 ps-8 pe-2.5 text-xs bg-nx-surface border-nx-line focus-visible:ring-nx-accent text-nx-ink placeholder:text-nx-ink-3"
          />
        </div>
      )}

      {canCreateOpportunities && onCreateDeal && (
        <Button
          type="button"
          variant="default"
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
