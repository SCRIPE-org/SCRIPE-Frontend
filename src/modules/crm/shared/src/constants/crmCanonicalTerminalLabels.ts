/** Canonical terminal stage and workflow creation fallback labels shared across CRM sub-modules. */
export const CANONICAL_TERMINAL_LABELS = {
  wonStageEn: "Closed Won",
  wonStageAr: "مغلق ناجح",
  lostStageEn: "Closed Lost",
  lostStageAr: "مغلق خاسر",
  wonColumnAr: "مغلقة — رابحة",
  lostColumnAr: "مغلقة — خاسرة",
  closeWonTransitionEn: "Close as Won",
  closeWonTransitionAr: "إغلاق كصفقة رابحة",
  markLostTransitionEn: "Mark as Lost",
  markLostTransitionAr: "تسجيل كصفقة خاسرة",
  reopenLostTransitionEn: "Reopen Deal",
  reopenLostTransitionAr: "إعادة فتح الصفقة",
  moveToPrefixEn: "Move to",
  moveToPrefixAr: "الانتقال إلى",
} as const;

/** Default labels used when constructing new workflows or fallback scoped roles. */
export const DEFAULT_NEW_WORKFLOW_META = {
  roleNameEn: "Custom Pipeline Role",
  roleNameAr: "دور خط بيع مخصص",
  roleDescEn: "Decoupled CRM Pipeline / Workflow Approval Queue.",
  roleDescAr: "دور اعتماد ومراجعة مخصص لخطوط البيع ومسارات العمل.",
  relationalPipelineDescEn: "Relational CRM Pipeline",
  relationalPipelineDescAr: "مسار عمل لائحة CRM",
  leadNewEn: "New",
  leadNewAr: "جديد",
  leadConvertedEn: "Converted",
  leadConvertedAr: "تم التحويل",
  dealDiscoveryEn: "Discovery",
  dealDiscoveryAr: "استكشاف",
  dealProposalClosingEn: "Proposal & Closing",
  dealProposalClosingAr: "العرض والإغلاق",
  advanceToPrefixEn: "Advance to",
  advanceToPrefixAr: "الانتقال إلى",
  returnToPrefixEn: "Return to",
  returnToPrefixAr: "العودة إلى",
  customWfNameEn: "Custom CRM Workflow",
  customWfNameAr: "مسار مخصص",
  customWfDescEn: "Custom tenant workflow created in SCRIPE Workflow Studio.",
  customWfDescAr: "مسار عمل مخصص تم إنشاؤه في استوديو مسارات العمل.",
  copySuffixEn: "(Copy)",
  copySuffixAr: "(نسخة)",
} as const;

/** Neutral fallback hex passed exclusively to `<Input type="color" />` when no custom hex is set. */
export const DEFAULT_CUSTOM_STAGE_HEX_FALLBACK = "#0EA5E9";
