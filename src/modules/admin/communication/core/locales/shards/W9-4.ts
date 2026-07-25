/**
 * Corrected copy for the template create/edit mutation toasts and the
 * delete-confirmation dialog.
 *
 * The base dictionary shipped these six keys as literal placeholder labels
 * ("Create Success", "Delete Title", …) with no real sentence behind them,
 * and the Arabic side hadn't been translated at all ("[missing] Create
 * Success"). Every call site masked this with a `t(key) || "real copy"`
 * fallback — but since the key always resolved to the placeholder (a
 * non-empty string), the `||` never ran, so the placeholder text is what
 * actually shipped to users. This shard supplies the real sentence in both
 * languages so removing the dead fallback doesn't regress the visible copy.
 */
export const en = {
  messaging: {
    templates: {
      createSuccess: "Template created",
      createError: "Failed to create template",
      updateSuccess: "Template updated",
      updateError: "Failed to update template",
      deleteTitle: "Delete Template",
      deleteDescription:
        "Are you sure you want to delete {name}? This action cannot be undone.",
    },
  },
} as const;

export const ar = {
  messaging: {
    templates: {
      createSuccess: "تم إنشاء القالب",
      createError: "فشل في إنشاء القالب",
      updateSuccess: "تم تحديث القالب",
      updateError: "فشل في تحديث القالب",
      deleteTitle: "حذف القالب",
      deleteDescription: "هل أنت متأكد من حذف {name}؟ لا يمكن التراجع عن هذا الإجراء.",
    },
  },
} as const;
