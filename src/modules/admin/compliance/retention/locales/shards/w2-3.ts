/**
 * Copy added while the retention views adopted the shared page/card anatomy.
 *
 * `retentionYears` exists because the years figure was labelled with
 * `compliance.retentionCategory` ("Category") — the wrong label on the wrong
 * number.
 */
export const en = {
  compliance: {
    retentionDescription: "How long each data category is kept before it is deleted or anonymized.",
    retentionYears: "Retention (Years)",
    noPoliciesDesc: "Add a policy to control how long each data category is kept.",
    policiesLoadFailed: "Retention policies could not be loaded.",
    editPolicyFor: "Edit {category}",
    lastExecution: "Last Execution",
  },
} as const;

export const ar = {
  compliance: {
    retentionDescription: "مدة الاحتفاظ بكل فئة بيانات قبل حذفها أو تجهيلها.",
    retentionYears: "الاحتفاظ (بالسنوات)",
    noPoliciesDesc: "أضف سياسة للتحكم في مدة الاحتفاظ بكل فئة بيانات.",
    policiesLoadFailed: "تعذّر تحميل سياسات الاحتفاظ.",
    editPolicyFor: "تعديل {category}",
    lastExecution: "آخر تنفيذ",
  },
} as const;
