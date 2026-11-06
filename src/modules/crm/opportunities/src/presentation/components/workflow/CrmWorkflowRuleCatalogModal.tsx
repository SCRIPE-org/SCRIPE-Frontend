"use client";

import React from "react";
import { Search } from "lucide-react";
import { Button } from "@core/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@core/ui/dialog";
import { Input } from "@core/ui/input";
import type { CrmRuleCatalogDefinition, CrmWorkflowRuleCategory } from "@modules/crm";

export interface CrmWorkflowRuleCatalogModalProps {
  t: (k: string) => string;
  isAr: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activeFilter: "all" | CrmWorkflowRuleCategory;
  onFilterChange: (filter: "all" | CrmWorkflowRuleCategory) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  templates: CrmRuleCatalogDefinition[];
  onSelectRule: (ruleTypeKey: string) => void;
}

const RULE_CATEGORY_TABS = [
  { id: "all", labelKey: "crmOpportunities.pipelinesPage.ruleCatalogTabAll" },
  { id: "restrict", labelKey: "crmOpportunities.pipelinesPage.ruleCatalogTabRestrict" },
  { id: "input", labelKey: "crmOpportunities.pipelinesPage.ruleCatalogTabInput" },
  { id: "validate", labelKey: "crmOpportunities.pipelinesPage.ruleCatalogTabValidate" },
  { id: "actions", labelKey: "crmOpportunities.pipelinesPage.ruleCatalogTabActions" },
] as const;

/**
 * Pure declarative Dialog component presenting the Searchable 4-Category Rule Catalog Modal.
 */
export function CrmWorkflowRuleCatalogModal({
  t,
  isAr,
  open,
  onOpenChange,
  activeFilter,
  onFilterChange,
  searchQuery,
  onSearchChange,
  templates,
  onSelectRule,
}: CrmWorkflowRuleCatalogModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl z-[10002]" data-testid="workflow-rule-catalog-modal">
        <DialogHeader>
          <DialogTitle>
            {t("crmOpportunities.pipelinesPage.ruleCatalogModalTitle")}
          </DialogTitle>
          <DialogDescription>
            {t("crmOpportunities.pipelinesPage.ruleCatalogModalDesc")}
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-12 gap-4 py-2">
          <div className="col-span-4 space-y-1 border-e border-nx-line pe-3">
            {RULE_CATEGORY_TABS.map((cat) => (
              <Button
                key={cat.id}
                size="sm"
                variant={activeFilter === cat.id ? "secondary" : "ghost"}
                className="w-full justify-start h-8 text-xs"
                onClick={() => onFilterChange(cat.id)}
                data-testid={`rule-catalog-tab-${cat.id}`}
              >
                {t(cat.labelKey)}
              </Button>
            ))}
          </div>
          <div className="col-span-8 space-y-2.5">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-nx-ink-3 absolute start-2.5 top-2.5" />
              <Input
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={t("crmOpportunities.pipelinesPage.ruleCatalogSearchPlaceholder")}
                className="ps-8 h-8 text-xs"
                data-testid="rule-catalog-search-input"
              />
            </div>
            <div className="max-h-72 overflow-y-auto space-y-2 pe-1">
              {templates.map((tpl) => (
                <div
                  key={tpl.ruleTypeKey}
                  data-testid={`rule-catalog-item-${tpl.ruleTypeKey}`}
                  className="rounded-md border border-nx-line bg-nx-raised/50 p-2.5 flex items-center justify-between gap-3 hover:border-nx-line-hi"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-nx-ink">
                      {isAr ? tpl.titleAr : tpl.titleEn}
                    </p>
                    <p className="text-[11px] text-nx-ink-2 mt-0.5">
                      {isAr ? tpl.descriptionAr : tpl.descriptionEn}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 px-2.5 text-xs shrink-0"
                    onClick={() => onSelectRule(tpl.ruleTypeKey)}
                    data-testid={`select-catalog-rule-${tpl.ruleTypeKey}`}
                  >
                    {t("crmOpportunities.pipelinesPage.selectRuleBtn")}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("crmOpportunities.pipelinesPage.cancelBtn")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
