/** Rule category classification in the CRM workflow transition rule engine. */
export type CrmWorkflowRuleCategory = "restrict" | "input" | "validate" | "actions";

/** Definition of an available rule template in the 4-Category Rule Catalog Modal. */
export interface CrmWorkflowRuleCatalogTemplate {
  ruleTypeKey: string;
  category: CrmWorkflowRuleCategory;
  titleEn: string;
  titleAr: string;
  descriptionEn: string;
  descriptionAr: string;
  defaultConfig?: Record<string, string>;
}

/** Master catalog of 18 Jira-surpassing CRM Workflow Rules across all 4 categories. */
export const CRM_RULE_CATALOG_DEFINITIONS: CrmWorkflowRuleCatalogTemplate[] = [
  {
    ruleTypeKey: "restrict.approval_required", category: "restrict",
    titleEn: "Block transition until approval", titleAr: "حظر الانتقال حتى اعتماد الدور أو المسؤول",
    descriptionEn: "Require explicit Role or Record Principal approval (with Any/Unanimous Quorum) before moving into the target stage.",
    descriptionAr: "يتطلب موافقة صريحة من الدور أو المسؤول المحدد (نصاب فردي أو إجماع) قبل الانتقال إلى المرحلة المستهدفة.",
    defaultConfig: { principals: "role:sales_manager,principal:record.owner_manager", quorum: "any" },
  },
  {
    ruleTypeKey: "restrict.approval_matrix", category: "restrict",
    titleEn: "Multi-Tier Value & Risk Approval Matrix", titleAr: "مصفوفة الاعتماد متعددة المستويات حسب القيمة والمخاطر",
    descriptionEn: "Route high-value deals through tiered approval thresholds (e.g. >= 100k Sales Manager; >= 500k Commercial Director + Finance Controller).",
    descriptionAr: "توجيه الصفقات الكبرى عبر مستويات اعتماد متدرجة حسب القيمة المالية ونصاب الموافقة.",
    defaultConfig: { tier1MinAmount: "100000", tier1Roles: "role:sales_manager", tier2MinAmount: "500000", tier2Roles: "role:commercial_director,role:finance_controller", quorum: "all" },
  },
  {
    ruleTypeKey: "restrict.subtasks_completed", category: "restrict",
    titleEn: "Restrict based on subtasks & activities", titleAr: "تقييد بناءً على اكتمال المهام والأنشطة",
    descriptionEn: "Block transition when there are open mandatory Activities or Subtasks on this record.",
    descriptionAr: "منع الانتقال عند وجود أنشطة أو مهام فرعية مفتوحة غير مكتملة.",
  },
  {
    ruleTypeKey: "restrict.api_only", category: "restrict",
    titleEn: "Restrict from all users (API / Automation only)", titleAr: "تقييد عن جميع المستخدمين (الأتمتة فقط)",
    descriptionEn: "Hide manual Kanban drag/move for users; allow transition only via webhooks or system events.",
    descriptionAr: "قصر الانتقال على الأتمتة وأحداث النظام فقط ومنع السحب اليدوي.",
  },
  {
    ruleTypeKey: "restrict.field_value", category: "restrict",
    titleEn: "Restrict based on field value", titleAr: "تقييد بناءً على قيمة حقل محدد",
    descriptionEn: "Allow transition only when a specified CRM or custom field matches the configured threshold.",
    descriptionAr: "السماح بالانتقال فقط عندما تطابق قيمة الحقل الشرط المحدد.",
    defaultConfig: { fieldKey: "estimatedAmount", operator: "greater_than", value: "0" },
  },
  {
    ruleTypeKey: "restrict.prior_status", category: "restrict",
    titleEn: "Restrict based on prior status history", titleAr: "تقييد بناءً على المرور بمرحلة سابقة",
    descriptionEn: "Ensure the record has previously passed through a required qualification or compliance stage.",
    descriptionAr: "التأكد من مرور السجل بمرحلة تأهيل أو امتثال سابقة مطلوبة.",
    defaultConfig: { requiredStageKey: "default.discovery" },
  },
  {
    ruleTypeKey: "restrict.separation_of_duties", category: "restrict",
    titleEn: "Restrict to or from last user (Four-Eyes Principle)", titleAr: "مبدأ الرقابة الثنائية (منع نفس المستخدم الأخير)",
    descriptionEn: "Prevent the user who performed the previous transition from executing this approval transition.",
    descriptionAr: "منع المستخدم الذي نفذ الانتقال السابق من اعتماد هذا الانتقال.",
  },
  {
    ruleTypeKey: "restrict.roles_permissions", category: "restrict",
    titleEn: "Restrict to roles, principals or permissions", titleAr: "تقييد حسب الأدوار أو المسؤولين أو الصلاحيات",
    descriptionEn: "Only users matching the selected CRM Role, Record Principal, or PBAC permission can execute this transition.",
    descriptionAr: "السماح فقط للمستخدمين الذين يطابقون الدور أو المسؤول النسبى أو الصلاحية المحددة.",
    defaultConfig: { principals: "role:sales_manager,principal:record.owner", permissions: "crm.opportunities.stage.override", quorum: "any" },
  },
  {
    ruleTypeKey: "input.prompt_fields", category: "input",
    titleEn: "Prompt for fields during transition", titleAr: "طلب إدخال حقول أثناء الانتقال",
    descriptionEn: "Open a dynamic transition screen prompting the user to fill missing exit/entry fields inline.",
    descriptionAr: "فتح نافذة ديناميكية لطلب استكمال الحقول المطلوبة أثناء الانتقال.",
    defaultConfig: { fields: "estimatedAmount,targetCloseDate" },
  },
  {
    ruleTypeKey: "input.require_reason_and_note", category: "input",
    titleEn: "Require structured reason code & audit note", titleAr: "إلزام برمز السبب وملاحظة التدقيق",
    descriptionEn: "Prompt for a structured reason code and mandatory audit comment before completing the move.",
    descriptionAr: "طلب رمز سبب مهيكل وتعليق تدقيق إلزامي قبل إتمام الانتقال.",
  },
  {
    ruleTypeKey: "validate.verified_party", category: "validate",
    titleEn: "Validate verified Customer Account / Party linked", titleAr: "التحقق من ربط حساب عميل موثق",
    descriptionEn: "Ensure a verified Company Account or Individual Party is linked to the Deal/Lead.",
    descriptionAr: "التأكد من ربط حساب شركة أو عميل موثق بالصفقة.",
  },
  {
    ruleTypeKey: "validate.buying_committee_role", category: "validate",
    titleEn: "Validate Buying Committee Contact Role present", titleAr: "التحقق من وجود صاحب قرار في لجنة الشراء",
    descriptionEn: "Require a linked Contact with a designated Buying Committee Role (e.g. Decision Maker, Legal).",
    descriptionAr: "اشتراط وجود جهة اتصال بدور محدد في لجنة الشراء (مثل صانع القرار أو القانوني).",
    defaultConfig: { requiredRole: "DecisionMaker" },
  },
  {
    ruleTypeKey: "validate.financial_forecast", category: "validate",
    titleEn: "Validate Estimated Amount & Future Close Date", titleAr: "التحقق من القيمة المالية وتاريخ الإغلاق المستقبلي",
    descriptionEn: "Verify that Estimated Amount > 0 and Target Close Date is a valid future date.",
    descriptionAr: "التحقق من أن القيمة المقدرة أكبر من صفر وتاريخ الإغلاق في المستقبل.",
    defaultConfig: { minAmount: "1000" },
  },
  {
    ruleTypeKey: "validate.active_quote", category: "validate",
    titleEn: "Validate active Commercial Quote attached", titleAr: "التحقق من إرفاق عرض سعر تجاري نشط",
    descriptionEn: "Verify that an approved or active commercial proposal/quote is attached before negotiation.",
    descriptionAr: "التأكد من وجود عرض سعر نشط مرتبط بالصفقة قبل التفاوض.",
  },
  {
    ruleTypeKey: "action.convert_lead_to_deal", category: "actions",
    titleEn: "Auto-Convert Lead to Deal in target pipeline", titleAr: "تحويل العميل المحتمل تلقائياً إلى صفقة",
    descriptionEn: "Automatically convert the Lead into a Deal, link the Account/Contact, and place in the target Deal pipeline.",
    descriptionAr: "تحويل العميل المحتمل تلقائياً إلى صفقة وربط الحساب وجهة الاتصال.",
  },
  {
    ruleTypeKey: "action.create_followup_task", category: "actions",
    titleEn: "Auto-create SLA follow-up Activity / Task", titleAr: "إنشاء مهمة متابعة تلقائية",
    descriptionEn: "Automatically generate a follow-up Activity/Task assigned to the record owner upon transition.",
    descriptionAr: "إنشاء نشاط أو مهمة متابعة تلقائياً لمالك السجل فور الانتقال.",
    defaultConfig: { taskSubject: "Follow up on stage transition", dueInDays: "2" },
  },
  {
    ruleTypeKey: "action.update_field", category: "actions",
    titleEn: "Update record field or win probability", titleAr: "تحديث حقل في السجل أو نسبة الفوز",
    descriptionEn: "Automatically set or clear a specified field or synchronize stage win probability.",
    descriptionAr: "تحديث قيمة حقل محدد أو مزامنة احتمالية الفوز تلقائياً.",
    defaultConfig: { fieldKey: "winProbabilityPercent", value: "75" },
  },
  {
    ruleTypeKey: "action.emit_event_webhook", category: "actions",
    titleEn: "Emit Domain Event & Outbound CRM Webhook", titleAr: "إطلاق حدث النظام وإشعار Webhook خارجي",
    descriptionEn: "Publish the configured Domain Event to the Outbox and trigger external CRM/webhook integrations.",
    descriptionAr: "نشر حدث النطاق وإطلاق تكامل Webhook للأنظمة الخارجية.",
    defaultConfig: { eventKey: "DealStageTransitionedEvent" },
  },
];
