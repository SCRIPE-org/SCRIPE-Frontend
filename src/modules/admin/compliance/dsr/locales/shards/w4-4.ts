/**
 * Copy added during the design-bar pass over the DSR module's presentation
 * layer: the submit form's example-email placeholder, and the detail page's
 * not-found state — neither existed as a translated key before this pass
 * (the not-found branch previously rendered nothing at all).
 */
export const en = {
  compliance: {
    subjectEmailPlaceholder: "subject@example.com",
    dsrNotFoundDesc:
      "This data subject request could not be found. It may have been cancelled, or the link may be incorrect.",
  },
} as const;

export const ar = {
  compliance: {
    subjectEmailPlaceholder: "subject@example.com",
    dsrNotFoundDesc: "تعذّر العثور على طلب موضوع البيانات هذا. ربما تم إلغاؤه أو أن الرابط غير صحيح.",
  },
} as const;
