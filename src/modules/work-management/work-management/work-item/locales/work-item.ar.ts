export const ar = {
  workItem: {
    title: "عناصر العمل",
    description: "إدارة المهام والمتابعات والتكليفات عبر السجلات",
    addNew: "إضافة عنصر عمل",
    noItems: "لا توجد عناصر عمل",
    searchPlaceholder: "ابحث في عناصر العمل...",

    // Field labels — shared between the table columns and the create/edit forms
    fields: {
      title: "العنوان",
      description: "الوصف",
      status: "الحالة",
      priority: "الأولوية",
      ownerEntityTypeKey: "نوع المالك",
      ownerEntityId: "معرّف سجل المالك",
      assignedToId: "مُسند إلى",
      dueAt: "تاريخ الاستحقاق",
      isActive: "نشط",
    },

    // Form placeholders
    placeholders: {
      ownerEntityTypeKey: "مثال: party.person",
      ownerEntityId: "معرّف السجل المرتبط بهذه المهمة (اختياري)",
      assignedToId: "اختر المسؤول عن المهمة (اختياري)",
      assignedToSearch: "ابحث بالاسم أو اسم المستخدم أو البريد الإلكتروني...",
    },

    // Short captions shown under the Owner and Assigned To fields so the two
    // don't read as duplicates of each other -- Owner is WHAT the task is
    // about, Assigned To is WHO does it.
    help: {
      owner: "ما تتعلق به هذه المهمة — سجل موجود مثل شخص أو حجز. اتركه فارغًا لمهمة مستقلة.",
      assignedTo: "الشخص المسؤول عن تنفيذ هذه المهمة. ابحث بالاسم للعثور على أحد مشرفي المستأجر.",
    },

    // Assigned To search-select states
    search: {
      noAdminsFound: "لم يتم العثور على مشرفين مطابقين",
      searchingAdmins: "جارٍ البحث عن المشرفين...",
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
