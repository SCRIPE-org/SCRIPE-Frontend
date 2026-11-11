"use client";

import React, { useEffect, useState } from "react";
import { ArrowLeft, Search, ShieldCheck } from "lucide-react";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@core/ui/dialog";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@core/ui/select";
import type { CrmCustomFieldDefinition, CrmWorkflowRuleCatalogTemplate as CrmRuleCatalogDefinition, CrmWorkflowRuleCategory } from "@modules/crm";
import type { CrmWorkflowStageNode } from "./CrmWorkflowCanvas2D";
import { CrmWorkflowRuleStep2Configurator } from "./CrmWorkflowRuleStep2Configurator";

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
  transitionSummary?: string;
  activeEntity?: "deal" | "lead";
  stages?: CrmWorkflowStageNode[];
  crmCustomFields?: CrmCustomFieldDefinition[];
  onAddCrmCustomField?: (def: CrmCustomFieldDefinition) => void;
  onSelectRule: (ruleTypeKey: string, config?: Record<string, string>) => void;
}

const RULE_CATEGORY_TABS = [
  { id: "all", labelKey: "crmOpportunities.pipelinesPage.ruleCatalogTabAll" },
  { id: "restrict", labelKey: "crmOpportunities.pipelinesPage.ruleCatalogTabRestrict" },
  { id: "input", labelKey: "crmOpportunities.pipelinesPage.ruleCatalogTabInput" },
  { id: "validate", labelKey: "crmOpportunities.pipelinesPage.ruleCatalogTabValidate" },
  { id: "actions", labelKey: "crmOpportunities.pipelinesPage.ruleCatalogTabActions" },
] as const;

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
  transitionSummary,
  activeEntity = "deal",
  stages = [],
  crmCustomFields = [],
  onAddCrmCustomField,
  onSelectRule,
}: CrmWorkflowRuleCatalogModalProps) {
  const [selectedTpl, setSelectedTpl] = useState<CrmRuleCatalogDefinition | null>(null);
  const [configDraft, setConfigDraft] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!open) {
      setSelectedTpl(null);
      setConfigDraft({});
    }
  }, [open]);

  const handleChooseTemplate = (tpl: CrmRuleCatalogDefinition) => {
    setSelectedTpl(tpl);
    setConfigDraft(tpl.defaultConfig ? { ...tpl.defaultConfig } : {});
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl z-[10002] max-h-[90vh] overflow-y-auto" data-testid="workflow-rule-catalog-modal">
        <DialogHeader>
          <DialogTitle>{t("crmOpportunities.pipelinesPage.ruleCatalogModalTitle")}</DialogTitle>
          <DialogDescription>{t("crmOpportunities.pipelinesPage.ruleCatalogModalDesc")}</DialogDescription>
        </DialogHeader>

        {selectedTpl ? (
          <div className="space-y-3 py-1" data-testid="rule-catalog-step2-config">
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-nx-ink-2">Rule</Label>
              <div className="rounded-md border border-nx-line bg-nx-raised/60 p-2.5 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-bold text-nx-ink flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-primary shrink-0" />
                    {isAr ? selectedTpl.titleAr : selectedTpl.titleEn}
                  </p>
                  <p className="text-[11px] text-nx-ink-2 mt-0.5">
                    {isAr ? selectedTpl.descriptionAr : selectedTpl.descriptionEn}
                  </p>
                </div>
                <Button size="sm" variant="outline" className="h-7 px-2.5 text-xs shrink-0" onClick={() => setSelectedTpl(null)} data-testid="change-catalog-rule-btn">
                  <ArrowLeft className="w-3 h-3 me-1" />{t("crmOpportunities.ruleConfig.changeRuleBtn")}
                </Button>
              </div>
            </div>

            {transitionSummary && (
              <div className="space-y-1" data-testid="rule-catalog-transition-label">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold text-nx-ink-2">{t("crmOpportunities.ruleConfig.forTransitionLabel")}</Label>
                  <Badge variant="outline" className="text-[10px]">{selectedTpl.category}</Badge>
                </div>
                <Select value="active">
                  <SelectTrigger className="h-8 text-xs font-mono" data-testid="rule-catalog-transition-select">
                    <SelectValue>{transitionSummary}</SelectValue>
                  </SelectTrigger>
                  <SelectContent className="z-[10005]">
                    <SelectItem value="active" className="text-xs font-mono">{transitionSummary}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="rounded-md border border-nx-line bg-nx-raised/30 p-3">
              <CrmWorkflowRuleStep2Configurator
                isAr={isAr}
                activeEntity={activeEntity}
                selectedTpl={selectedTpl}
                configDraft={configDraft}
                onChangeConfig={setConfigDraft}
                stages={stages}
                crmCustomFields={crmCustomFields}
                onAddCrmCustomField={onAddCrmCustomField}
              />
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)}>{t("crmOpportunities.pipelinesPage.cancelBtn")}</Button>
              <Button onClick={() => onSelectRule(selectedTpl.ruleTypeKey, configDraft)} data-testid="confirm-add-catalog-rule-btn">
                {t("crmOpportunities.pipelinesPage.addBtn")}
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-12 gap-4 py-2">
              <div className="col-span-4 space-y-1 border-e border-nx-line pe-3">
                {RULE_CATEGORY_TABS.map((cat) => (
                  <Button key={cat.id} size="sm" variant={activeFilter === cat.id ? "secondary" : "ghost"} className="w-full justify-start h-8 text-xs" onClick={() => onFilterChange(cat.id)} data-testid={`rule-catalog-tab-${cat.id}`}>
                    {t(cat.labelKey)}
                  </Button>
                ))}
              </div>
              <div className="col-span-8 space-y-2.5">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-nx-ink-3 absolute start-2.5 top-2.5" />
                  <Input value={searchQuery} onChange={(e) => onSearchChange(e.target.value)} placeholder={t("crmOpportunities.pipelinesPage.ruleCatalogSearchPlaceholder")} className="ps-8 h-8 text-xs" data-testid="rule-catalog-search-input" />
                </div>
                <div className="max-h-72 overflow-y-auto space-y-2 pe-1">
                  {templates.map((tpl) => (
                    <div key={tpl.ruleTypeKey} data-testid={`rule-catalog-item-${tpl.ruleTypeKey}`} className="rounded-md border border-nx-line bg-nx-raised/50 p-2.5 flex items-center justify-between gap-3 hover:border-nx-line-hi">
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-nx-ink">{isAr ? tpl.titleAr : tpl.titleEn}</p>
                        <p className="text-[11px] text-nx-ink-2 mt-0.5">{isAr ? tpl.descriptionAr : tpl.descriptionEn}</p>
                      </div>
                      <Button size="sm" variant="outline" className="h-7 px-2.5 text-xs shrink-0" onClick={() => handleChooseTemplate(tpl)} data-testid={`select-catalog-rule-${tpl.ruleTypeKey}`}>
                        {t("crmOpportunities.pipelinesPage.selectRuleBtn")}
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)}>{t("crmOpportunities.pipelinesPage.cancelBtn")}</Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
