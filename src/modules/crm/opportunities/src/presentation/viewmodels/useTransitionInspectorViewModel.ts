"use client";

import { useEffect, useState } from "react";
import {
  CRM_RULE_CATALOG_DEFINITIONS,
  type CrmWorkflowCatalogRule,
  type CrmWorkflowRuleCategory,
} from "@modules/crm";
import type {
  CrmWorkflowStageNode,
  CrmWorkflowTransition,
} from "../components/workflow/CrmWorkflowCanvas2D";

export const CORE_EXIT_FIELD_KEYS = [
  "partyId",
  "estimatedAmount",
  "targetCloseDate",
  "primaryContactRole",
  "solutionFitConfirmed",
];

export const DOMAIN_EVENT_OPTION_KEYS = [
  { key: "GenericEvent", labelKey: "crmOpportunities.pipelinesPage.domainEventGeneric" },
  { key: "DealWonEvent", labelKey: "crmOpportunities.pipelinesPage.domainEventDealWon" },
  { key: "LeadConvertedEvent", labelKey: "crmOpportunities.pipelinesPage.domainEventLeadConverted" },
  { key: "ProposalSubmittedEvent", labelKey: "crmOpportunities.pipelinesPage.domainEventProposalSubmitted" },
] as const;

export const TRIGGER_OPTION_KEYS = [
  { key: "quote_accepted", labelKey: "crmOpportunities.pipelinesPage.triggerQuoteAccepted" },
  { key: "activity_completed", labelKey: "crmOpportunities.pipelinesPage.triggerActivityCompleted" },
  { key: "webhook_received", labelKey: "crmOpportunities.pipelinesPage.triggerWebhookReceived" },
  { key: "sla_breached", labelKey: "crmOpportunities.pipelinesPage.triggerSlaBreached" },
] as const;

export interface UseTransitionInspectorParams {
  t: (k: string) => string;
  isAr: boolean;
  stages: CrmWorkflowStageNode[];
  selectedTransition: CrmWorkflowTransition;
  openRuleCatalogSignal?: number;
  onTransitionChange: (updated: CrmWorkflowTransition) => void;
}

/**
 * ViewModel hook encapsulating all state, catalog filtering, triggers, and mutation handlers
 * for CrmWorkflowTransitionInspector and CrmWorkflowRuleCatalogModal.
 */
export function useTransitionInspectorViewModel({
  t,
  isAr,
  stages,
  selectedTransition,
  openRuleCatalogSignal,
  onTransitionChange,
}: UseTransitionInspectorParams) {
  const [openSection, setOpenSection] = useState<CrmWorkflowRuleCategory | null>("validate");
  const [showMultiFromSelector, setShowMultiFromSelector] = useState(false);
  const [ruleCatalogOpen, setRuleCatalogOpen] = useState(() =>
    Boolean(openRuleCatalogSignal && openRuleCatalogSignal > 0),
  );
  const [ruleCatalogFilter, setRuleCatalogFilter] = useState<"all" | CrmWorkflowRuleCategory>("all");
  const [ruleCatalogSearch, setRuleCatalogSearch] = useState("");
  const [newPropKey, setNewPropKey] = useState("");
  const [newPropVal, setNewPropVal] = useState("");
  const [showPropForm, setShowPropForm] = useState(false);
  const [showTriggerSelector, setShowTriggerSelector] = useState(false);

  useEffect(() => {
    if (openRuleCatalogSignal && openRuleCatalogSignal > 0) {
      setRuleCatalogFilter("all");
      setRuleCatalogOpen(true);
    }
  }, [openRuleCatalogSignal]);

  const stageLabel = (key: string) => {
    if (key === "*") return t("crmOpportunities.pipelinesPage.anyStageGlobal");
    const found = stages.find((s) => s.stageKey === key);
    return found ? (isAr ? found.labelAr : found.labelEn) : key;
  };

  const toggleField = (fieldKey: string, checked: boolean) => {
    const next = checked
      ? Array.from(new Set([...selectedTransition.requiredFields, fieldKey]))
      : selectedTransition.requiredFields.filter((f) => f !== fieldKey);
    onTransitionChange({ ...selectedTransition, requiredFields: next });
  };

  const currentFromKeys =
    selectedTransition.fromStageKeys && selectedTransition.fromStageKeys.length > 0
      ? selectedTransition.fromStageKeys
      : [selectedTransition.fromStageKey];

  const toggleFromStageKey = (stageKey: string) => {
    if (stageKey === "*") {
      onTransitionChange({ ...selectedTransition, fromStageKey: "*", fromStageKeys: ["*"] });
      return;
    }
    const withoutWildcard = currentFromKeys.filter((k) => k !== "*");
    const exists = withoutWildcard.includes(stageKey);
    const next = exists
      ? withoutWildcard.filter((k) => k !== stageKey)
      : [...withoutWildcard, stageKey];
    if (next.length === 0) return;
    onTransitionChange({
      ...selectedTransition,
      fromStageKey: next[0],
      fromStageKeys: next,
    });
  };

  const attachedCatalogRules = selectedTransition.catalogRules ?? [];

  const handleAddCatalogRule = (ruleTypeKey: string) => {
    const def = CRM_RULE_CATALOG_DEFINITIONS.find((d) => d.ruleTypeKey === ruleTypeKey);
    if (!def) return;
    const rule: CrmWorkflowCatalogRule = {
      id: `crule-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      category: def.category,
      ruleTypeKey: def.ruleTypeKey,
      titleEn: def.titleEn,
      titleAr: def.titleAr,
      descriptionEn: def.descriptionEn,
      descriptionAr: def.descriptionAr,
      config: def.defaultConfig ? { ...def.defaultConfig } : {},
    };
    const nextRules = [...attachedCatalogRules, rule];
    onTransitionChange({
      ...selectedTransition,
      catalogRules: nextRules,
      triggerDealConversion:
        def.ruleTypeKey === "action.convert_lead_to_deal"
          ? true
          : selectedTransition.triggerDealConversion,
      requireReason:
        def.ruleTypeKey === "input.require_reason_and_note"
          ? true
          : selectedTransition.requireReason,
    });
    setOpenSection(def.category);
    setRuleCatalogOpen(false);
  };

  const handleRemoveCatalogRule = (ruleId: string) => {
    onTransitionChange({
      ...selectedTransition,
      catalogRules: attachedCatalogRules.filter((r) => r.id !== ruleId),
    });
  };

  const openCatalogForCategory = (cat: "all" | CrmWorkflowRuleCategory) => {
    setRuleCatalogFilter(cat);
    setRuleCatalogOpen(true);
  };

  const filteredCatalogTemplates = CRM_RULE_CATALOG_DEFINITIONS.filter((tpl) => {
    if (ruleCatalogFilter !== "all" && tpl.category !== ruleCatalogFilter) return false;
    const q = ruleCatalogSearch.trim().toLowerCase();
    if (!q) return true;
    return (
      tpl.titleEn.toLowerCase().includes(q) ||
      tpl.titleAr.toLowerCase().includes(q) ||
      tpl.descriptionEn.toLowerCase().includes(q)
    );
  });

  const transitionProps = selectedTransition.properties ?? {};

  const handleAddProperty = () => {
    if (!newPropKey.trim()) return;
    onTransitionChange({
      ...selectedTransition,
      properties: { ...transitionProps, [newPropKey.trim()]: newPropVal.trim() },
    });
    setNewPropKey("");
    setNewPropVal("");
    setShowPropForm(false);
  };

  const handleRemoveProperty = (key: string) => {
    const next = { ...transitionProps };
    delete next[key];
    onTransitionChange({ ...selectedTransition, properties: next });
  };

  const triggers = selectedTransition.triggers ?? [];

  const handleAddTrigger = (triggerKey: string) => {
    if (triggers.includes(triggerKey)) return;
    onTransitionChange({
      ...selectedTransition,
      triggers: [...triggers, triggerKey],
    });
    setShowTriggerSelector(false);
  };

  const handleRemoveTrigger = (triggerKey: string) => {
    onTransitionChange({
      ...selectedTransition,
      triggers: triggers.filter((tr) => tr !== triggerKey),
    });
  };

  return {
    openSection,
    setOpenSection,
    showMultiFromSelector,
    setShowMultiFromSelector,
    ruleCatalogOpen,
    setRuleCatalogOpen,
    ruleCatalogFilter,
    setRuleCatalogFilter,
    ruleCatalogSearch,
    setRuleCatalogSearch,
    newPropKey,
    setNewPropKey,
    newPropVal,
    setNewPropVal,
    showPropForm,
    setShowPropForm,
    showTriggerSelector,
    setShowTriggerSelector,
    triggers,
    handleAddTrigger,
    handleRemoveTrigger,
    stageLabel,
    toggleField,
    currentFromKeys,
    toggleFromStageKey,
    attachedCatalogRules,
    handleAddCatalogRule,
    handleRemoveCatalogRule,
    openCatalogForCategory,
    filteredCatalogTemplates,
    transitionProps,
    handleAddProperty,
    handleRemoveProperty,
  };
}
