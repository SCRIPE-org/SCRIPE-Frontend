export const ar = {
  workItem: {
    title: "عناصر العمل",
    description: "إدارة المهام والمتابعات والتكليفات عبر السجلات",
    addNew: "إضافة عنصر عمل",
    editTitle: "تعديل عنصر عمل",
    deleteTitle: "حذف عنصر عمل",
    deleteConfirm: "هل أنت متأكد من حذف عنصر العمل هذا؟",
    noItems: "لا توجد عناصر عمل",
    searchPlaceholder: "ابحث في عناصر العمل...",

    // Field labels — shared between the table columns and the create/edit forms
    fields: {
      title: "العنوان",
      description: "الوصف",
      status: "الحالة",
      priority: "الأولوية",
      ownerEntityTypeKey: "نوع المالك",
      dueAt: "تاريخ الاستحقاق",
      isActive: "نشط",
    },

    // Form placeholders
    placeholders: {
      ownerEntityTypeKey: "مثال: party.person",
    },

    // WorkItemStatus enum (0..4)
    statuses: {
      toDo: "قيد الانتظار",
      inProgress: "قيد التنفيذ",
      blocked: "معلّق",
      done: "مكتمل",
      cancelled: "ملغى",
    },

    // WorkItemPriority enum (0..3)
    priorities: {
      low: "منخفضة",
      normal: "عادية",
      high: "مرتفعة",
      critical: "حرجة",
    },
  },
};
