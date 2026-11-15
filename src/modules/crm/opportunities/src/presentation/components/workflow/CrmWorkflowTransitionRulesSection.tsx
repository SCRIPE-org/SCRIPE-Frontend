"use client";

import React from "react";
import { ChevronDown, ChevronRight, Plus, ShieldCheck, X } from "lucide-react";
import { Button } from "@core/ui/button";
import { Checkbox } from "@core/ui/checkbox";
import { Label } from "@core/ui/label";
import type { CrmCustomFieldDefinition, CrmWorkflowCatalogRule, CrmWorkflowRuleCategory } from "@modules/crm";
import type { CrmWorkflowTransition } from "./CrmWorkflowCanvas2D";
import { formatExitFieldLabel } from "./CrmWorkflowCanvasSubViews";
import { CORE_EXIT_FIELD_KEYS } from "../../viewmodels/useTransitionInspectorViewModel";
import { LEAD_EXIT_FIELD_KEYS } from "../../viewmodels/useStageInspectorViewModel";

export interface CrmWorkflowTransitionRulesSectionProps {
  t: (k: string) => string;
  isAr: boolean;
  activeEntity?: "deal" | "lead";
  selectedTransition: CrmWorkflowTransition;
  crmCustomFields: CrmCustomFieldDefinition[];
  openSection: CrmWorkflowRuleCategory | null;
  onSetOpenSection: (sec: CrmWorkflowRuleCategory | null) => void;
  onOpenCatalogForCategory: (cat: "all" | CrmWorkflowRuleCategory) => void;
  attachedCatalogRules: CrmWorkflowCatalogRule[];
  onRemoveCatalogRule: (ruleId: string) => void;
  onToggleField: (fieldKey: string, checked: boolean) => void;
  onTransitionChange: (updated: CrmWorkflowTransition) => void;
}

const RULE_CATEGORY_CARDS = [
  { id: "restrict", titleKey: "crmOpportunities.pipelinesPage.rule1RestrictTitle" },
  { id: "input", titleKey: "crmOpportunities.pipelinesPage.rule2InputScreenTitle" },
  { id: "validate", titleKey: "crmOpportunities.pipelinesPage.rule3ValidatorsTitle" },
  { id: "actions", titleKey: "crmOpportunities.pipelinesPage.rule4PostActionsTitle" },
] as const;

/** Pure declarative 4-category Rule Accordion section for CrmWorkflowTransitionInspector. */
export function CrmWorkflowTransitionRulesSection({
  t, isAr, activeEntity = "deal", selectedTransition, crmCustomFields,
  openSection, onSetOpenSection, onOpenCatalogForCategory, attachedCatalogRules,
  onRemoveCatalogRule, onToggleField, onTransitionChange,
}: CrmWorkflowTransitionRulesSectionProps) {
  const exitFieldKeys = activeEntity === "lead" ? LEAD_EXIT_FIELD_KEYS : CORE_EXIT_FIELD_KEYS;
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between pt-1">
        <span className="text-[11px] font-mono uppercase tracking-wider text-nx-ink-2 font-semibold">
          {t("crmOpportunities.pipelinesPage.rulesFourCategoriesHeader")}
        </span>
        <Button size="sm" variant="outline" className="h-6 px-2 text-[10px]" onClick={() => onOpenCatalogForCategory("all")} data-testid="inspector-open-rule-catalog-btn">
          <Plus className="w-3 h-3 me-1 text-primary" />{t("crmOpportunities.pipelinesPage.ruleCatalogBtn")}
        </Button>
      </div>

      {RULE_CATEGORY_CARDS.map((cat) => (
        <div key={cat.id} className="rounded-md border border-nx-line bg-nx-raised/40 overflow-hidden">
          <div className="flex items-center justify-between pe-2">
            <Button
              variant="ghost"
              onClick={() => onSetOpenSection(openSection === cat.id ? null : cat.id)}
              data-testid={`transition-rule-card-${cat.id}`}
              className="flex-1 justify-between px-3 py-2 h-auto text-xs font-bold text-nx-ink"
            >
              <span className="inline-flex items-center gap-1.5">
                {cat.id === "validate" && <ShieldCheck className="w-3.5 h-3.5 text-info" />}
                {t(cat.titleKey)}
              </span>
              {openSection === cat.id ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </Button>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="h-6 w-6"
              onClick={() => onOpenCatalogForCategory(cat.id)}
              data-testid={`open-rule-catalog-${cat.id}`}
              aria-label={`${t("crmOpportunities.pipelinesPage.addRuleInCategoryLabel")}: ${t(cat.titleKey)}`}
            >
              <Plus className="w-3 h-3" />
            </Button>
          </div>
          {openSection === cat.id && (
            <div className="p-3 pt-1 space-y-2 border-t border-nx-line bg-nx-surface">
              {cat.id === "restrict" && (
                <div className="flex items-center gap-2">
                  <Checkbox id="tr-allow-rollback" checked={selectedTransition.allowRollback ?? true} onCheckedChange={(v) => onTransitionChange({ ...selectedTransition, allowRollback: Boolean(v) })} data-testid="transition-rule-allow-rollback" />
                  <Label htmlFor="tr-allow-rollback" className="text-xs cursor-pointer">{t("crmOpportunities.pipelinesPage.rule1RestrictDesc")}</Label>
                </div>
              )}
              {cat.id === "input" && (
                <div className="flex items-center gap-2">
                  <Checkbox id="tr-require-reason" checked={Boolean(selectedTransition.requireReason)} onCheckedChange={(v) => onTransitionChange({ ...selectedTransition, requireReason: Boolean(v) })} data-testid="transition-rule-prompt-comment" />
                  <Label htmlFor="tr-require-reason" className="text-xs cursor-pointer">{t("crmOpportunities.pipelinesPage.requireStructuredReasonToggle")}</Label>
                </div>
              )}
              {cat.id === "validate" && (
                <>
                  {exitFieldKeys.map((fk) => (
                    <div key={fk} className="flex items-center gap-2">
                      <Checkbox id={`tr-field-${fk}`} checked={selectedTransition.requiredFields.includes(fk)} onCheckedChange={(v) => onToggleField(fk, Boolean(v))} />
                      <Label htmlFor={`tr-field-${fk}`} className="text-xs cursor-pointer">{formatExitFieldLabel(fk, t, isAr, crmCustomFields)}</Label>
                    </div>
                  ))}
                  {crmCustomFields.map((cf) => {
                    const fk = `custom:${cf.key}`;
                    return (
                      <div key={fk} className="flex items-center gap-2">
                        <Checkbox
                          id={`tr-cf-${cf.key}`}
                          checked={selectedTransition.requiredFields.includes(fk)}
                          onCheckedChange={(v) => onToggleField(fk, Boolean(v))}
                        />
                        <Label htmlFor={`tr-cf-${cf.key}`} className="text-xs cursor-pointer">
                          {isAr ? cf.labelAr : cf.labelEn}
                        </Label>
                      </div>
                    );
                  })}
                </>
              )}
              {cat.id === "actions" && (
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="tr-convert-deal"
                    checked={Boolean(selectedTransition.triggerDealConversion)}
                    onCheckedChange={(v) => onTransitionChange({ ...selectedTransition, triggerDealConversion: Boolean(v) })}
                    data-testid="transition-action-convert-deal"
                  />
                  <Label htmlFor="tr-convert-deal" className="text-xs cursor-pointer">
                    {t("crmOpportunities.pipelinesPage.convertsToDealToggleTitle")}
                  </Label>
                </div>
              )}
              {attachedCatalogRules
                .filter((r) => r.category === cat.id)
                .map((r) => {
                  const cfgSummary = r.config
                    ? r.config.approverRoles || r.config.allowedPrincipals || r.config.fieldKeys || r.config.fieldKey || r.config.committeeRoles || r.config.priorStageKeys || ""
                    : "";
                  return (
                    <div
                      key={r.id}
                      data-testid={`attached-catalog-rule-${r.ruleTypeKey}`}
                      className="flex items-center justify-between gap-1.5 rounded border border-nx-line bg-nx-raised px-2 py-1 text-[11px]"
                    >
                      <div className="min-w-0 flex-1">
                        <span className="truncate font-medium text-nx-ink block">
                          {isAr ? r.titleAr : r.titleEn}
                        </span>
                        {cfgSummary && (
                          <span className="truncate font-mono text-[10px] text-nx-ink-3 block">
                            {cfgSummary}
                          </span>
                        )}
                      </div>
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="h-5 w-5 text-destructive shrink-0"
                        onClick={() => onRemoveCatalogRule(r.id)}
                        data-testid={`remove-catalog-rule-${r.id}`}
                        aria-label={`${t("crmOpportunities.pipelinesPage.removeRuleLabel")}: ${isAr ? r.titleAr : r.titleEn}`}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
