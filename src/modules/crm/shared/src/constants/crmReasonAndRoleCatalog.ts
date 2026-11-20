/** Canonical loss reason catalog for CRM Opportunities (localization keys resolved via i18n). */
export const LOSS_REASONS = [
  { code: "PRICE", labelKey: "crm.transitionDialog.lossReasonPrice" },
  { code: "COMPETITOR", labelKey: "crm.transitionDialog.lossReasonCompetitor" },
  { code: "TIMING", labelKey: "crm.transitionDialog.lossReasonTiming" },
  { code: "AUTHORITY", labelKey: "crm.transitionDialog.lossReasonAuthority" },
  { code: "FEATURE_GAP", labelKey: "crm.transitionDialog.lossReasonFeatureGap" },
  { code: "OTHER", labelKey: "crm.transitionDialog.lossReasonOther" },
];

/** Canonical disqualification reason catalog for CRM Leads (localization keys resolved via i18n). */
export const DISQUALIFICATION_REASONS = [
  { code: "BUDGET", labelKey: "crm.transitionDialog.disqualificationBudget" },
  { code: "NO_AUTHORITY", labelKey: "crm.transitionDialog.disqualificationNoAuthority" },
  { code: "NO_NEED", labelKey: "crm.transitionDialog.disqualificationNoNeed" },
  { code: "TIMING", labelKey: "crm.transitionDialog.disqualificationTiming" },
  { code: "FAKE_CONTACT", labelKey: "crm.transitionDialog.disqualificationFakeContact" },
  { code: "OTHER", labelKey: "crm.transitionDialog.disqualificationOther" },
];

/** Canonical buying committee stakeholder role options. */
export const STAKEHOLDER_ROLES = [
  { value: "Decision Maker", labelKey: "crm.transitionDialog.roleDecisionMaker" },
  { value: "Executive Sponsor", labelKey: "crm.transitionDialog.roleExecutiveSponsor" },
  { value: "Technical Evaluator", labelKey: "crm.transitionDialog.roleTechnicalEvaluator" },
  { value: "Procurement / Commercial", labelKey: "crm.transitionDialog.roleProcurementCommercial" },
  { value: "Champion", labelKey: "crm.transitionDialog.roleChampion" },
];
