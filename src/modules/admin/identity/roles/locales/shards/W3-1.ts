/**
 * Copy for the role delete confirmation and the permission-save toasts.
 *
 * These six `role.*` keys shipped as placeholders: English read as label case
 * lifted straight off the key ("Delete Confirm", "Has Admins"), and Arabic
 * carried a "[مفقود]" marker in front of the same English words, so the Arabic
 * build showed an untranslated string in a destructive confirmation.
 *
 * Keys deepMerge onto `role.*` from `../roles.en` / `../roles.ar`; the siblings
 * there are untouched.
 */
export const en = {
  role: {
    // The confirmation names the record — recognising WHAT is about to be
    // deleted is the whole job of this sentence.
    deleteConfirm: "Are you sure you want to delete the role “{{name}}”?",
    hasAdmins: "This role is currently assigned to {{count}} administrator(s).",
    selectFallback: "Choose a fallback role to move those administrators to before deleting.",
    selectFallbackPlaceholder: "Select a role...",
    permissionsSaved: "Permissions saved",
    permissionsSaveError: "Permissions could not be saved",
  },
} as const;

export const ar = {
  role: {
    deleteConfirm: "هل أنت متأكد من حذف الدور «{{name}}»؟",
    hasAdmins: "هذا الدور معيَّن حالياً لـ {{count}} مسؤول.",
    selectFallback: "اختر دوراً بديلاً لنقل هؤلاء المسؤولين إليه قبل الحذف.",
    selectFallbackPlaceholder: "اختر دوراً...",
    permissionsSaved: "تم حفظ الصلاحيات",
    permissionsSaveError: "تعذّر حفظ الصلاحيات",
  },
} as const;
