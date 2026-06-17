export const ar = {
  leads: {
    title: "عملاء المبيعات المحتملون",
    subtitle: "طلبات التواصل مع فريق المبيعات",
    searchPlaceholder: "بحث بالشركة أو البريد الإلكتروني أو الاسم…",
    allStatuses: "جميع الحالات",
    totalCount: "{{count}} إجمالي",
    createButton: "+ إنشاء عميل محتمل",

    columns: {
      company: "الشركة",
      contact: "جهة الاتصال",
      email: "البريد الإلكتروني",
      phone: "الهاتف",
      edition: "الإصدار",
      status: "الحالة",
      source: "المصدر",
      created: "تاريخ الإنشاء",
    },

    status: {
      New: "جديد",
      Contacted: "تم التواصل",
      Qualified: "مؤهل",
      Converted: "تحول عميل",
      Closed: "مغلق",
    },

    source: {
      Website: "🌐 الموقع الإلكتروني",
      Admin: "🔑 المسؤول",
      Import: "📦 استيراد",
    },

    discovery: {
      sectionTitle: "معلومات الاكتشاف",
      industry: "القطاع",
      teamSize: "حجم الفريق",
      teamSizeSuffix: "أشخاص",
      priority: "الأولوية الرئيسية",
      noData: "لا توجد بيانات اكتشاف",
      industryLabels: {
        general: "عام",
        erp: "نظام ERP",
        healthcare: "الرعاية الصحية",
      },
      teamSizeLabels: {
        solo: "فردي",
        "2-10": "٢–١٠",
        "11-50": "١١–٥٠",
        "51-200": "٥١–٢٠٠",
        "200+": "+٢٠٠",
      },
    },

    updateDialog: {
      title: "تحديث حالة العميل المحتمل",
      newStatus: "الحالة الجديدة",
      notes: "ملاحظات داخلية (اختياري)",
      notesPlaceholder: "أضف ملاحظات حول هذا العميل…",
      cancel: "إلغاء",
      confirm: "تحديث الحالة",
      updating: "جارٍ التحديث…",
    },

    pagination: {
      page: "صفحة {{page}} من {{total}}",
      previous: "السابق",
      next: "التالي",
    },

    empty: "لا توجد عملاء محتملون.",
    loading: "جارٍ تحميل العملاء المحتملين…",
    loadError: "فشل تحميل العملاء المحتملين. يرجى تحديث الصفحة والمحاولة مرة أخرى.",

    drawer: {
      loadingDetail: "جارٍ تحميل تفاصيل العميل…",
      notFound: "العميل المحتمل غير موجود.",
      editionLabel: "إصدار {{edition}}",

      sections: {
        contact: "بيانات التواصل",
        discovery: "معلومات الاكتشاف",
        message: "الرسالة",
        crmStatus: "حالة CRM",
        salesNotes: "ملاحظات المبيعات",
        conversion: "التحويل",
      },

      contact: {
        email: "البريد الإلكتروني",
        phone: "الهاتف",
        phoneMissing: "غير مُدرج",
        source: "المصدر",
        submitted: "تاريخ التقديم",
      },

      status: {
        changeLabel: "تغيير الحالة",
        notePlaceholder: "أضف سبب تغيير هذه الحالة…",
        noteLabel: "إضافة ملاحظة داخلية (اختياري)",
        save: "حفظ التغييرات",
        saving: "جارٍ الحفظ…",
        saved: "✓ تم الحفظ",
        noChanges: "لا توجد تغييرات",
      },

      conversion: {
        converted: "✓ تحول إلى مستأجر",
      },
    },

    statsBar: {
      total: "الإجمالي",
      new: "جديد",
      qualified: "مؤهل",
      converted: "محوّل",
    },
    createDialog: {
      title: "إنشاء عميل محتمل",
      subtitle: "إنشاء عميل محتمل يدوياً من لوحة إدارة المنصة.",
      company: "الشركة",
      companyPlaceholder: "شركة الأمثلة",
      contact: "اسم جهة الاتصال",
      contactPlaceholder: "محمد أحمد",
      email: "البريد الإلكتروني للعمل",
      phone: "الهاتف (اختياري)",
      editionInterest: "الإصدار المطلوب",
      editionPlaceholder: "اختر إصداراً…",
      editionNone: "غير محدد",
      message: "الرسالة",
      messagePlaceholder: "ما الذي يريد العميل تحقيقه؟",
      notes: "ملاحظات داخلية",
      notesPlaceholder: "ملاحظات خاصة بفريق المبيعات…",
      cancel: "إلغاء",
      create: "إنشاء العميل المحتمل",
      creating: "جارٍ الإنشاء…",
      errors: {
        companyRequired: "اسم الشركة مطلوب.",
        contactRequired: "اسم جهة الاتصال مطلوب.",
        emailInvalid: "يرجى إدخال عنوان بريد إلكتروني صالح.",
      },
    },

    convertDialog: {
      title: "تحويل العميل إلى مستأجر",
      subtitle: "إنشاء حساب مستأجر جديد لهذا العميل المحتمل.",
      editionId: "الإصدار",
      editionPlaceholder: "اختر إصداراً (تجاوز اختياري)…",
      editionHint: "اتركه فارغاً لاستخدام الإصدار المحدد من اهتمام العميل.",
      tenantCode: "معرّف المستأجر (اختياري)",
      tenantCodePlaceholder: "acme-corp",
      tenantCodeHint: "يُنشأ تلقائياً من اسم الشركة إذا تُرك فارغاً.",
      adminEmail: "بريد المدير (اختياري)",
      adminEmailPlaceholder: "ceo@acme.com",
      adminEmailHint: "يُستخدم بريد العميل المحتمل افتراضياً.",
      subscriptionType: "نوع الاشتراك",
      subscriptionMonthly: "شهري",
      subscriptionYearly: "سنوي",
      subscriptionLifetime: "مدى الحياة",
      currency: "العملة",
      conversionNote: "ملاحظة التحويل (اختيارية)",
      conversionNotePlaceholder: "أضف ملاحظة حول هذا التحويل…",
      cancel: "إلغاء",
      convert: "تحويل إلى مستأجر",
      converting: "جارٍ التحويل…",
      successTitle: "تم التحويل!",
      successMessage: "تم إنشاء المستأجر. تم إرسال بريد الإعداد إلى {{email}}.",
      errorTitle: "فشل التحويل",
      warning: {
        title: "تحذير الإصدار",
        message:
          "حدثت مشكلة في تعيين الإصدار: {{error}}. تم إنشاء المستأجر لكن قد يحتاج إلى إعداد الخطة يدوياً.",
      },
      negotiatedPrice: {
        toggle: "سعر الصفقة المخصص",
        toggleHint: "تجاوز السعر القياسي للإصدار لصفقة المؤسسة هذه.",
        amount: "المبلغ المتفق عليه",
        currency: "عملة الصفقة",
        warning: "يتجاوز هذا التسعير القياسي. سيُصنَّف الاشتراك كصفقة سعر مفاوض عليه.",
        amountRequired: "يرجى إدخال مبلغ الصفقة المتفق عليه.",
        amountInvalid: "يجب أن يكون المبلغ رقماً موجباً.",
      },
    },

    assignDialog: {
      title: "تعيين العميل المحتمل",
      subtitle: "عيِّن هذا العميل المحتمل إلى مدير للمتابعة.",
      adminId: "تعيين إلى مدير",
      adminPlaceholder: "ابحث باسم المستخدم أو البريد أو الاسم...",
      adminSearchPlaceholder: "اكتب للبحث عن المديرين...",
      noAdminsFound: "لم يتم العثور على مديرين نشطين.",
      searchingAdmins: "جارٍ البحث عن المديرين...",
      platformScope: "مدير المنصة",
      adminIdHint: "يتم عرض المديرين النشطين فقط ضمن نطاق مؤسستك المسموح.",
      currentlyAssigned: "هذا العميل المحتمل مُعيَّن بالفعل إلى مدير.",
      unassign: "إلغاء التعيين",
      note: "ملاحظة (اختيارية)",
      notePlaceholder: "سبب التعيين…",
      cancel: "إلغاء",
      assign: "تعيين",
      assigning: "جارٍ التعيين…",
      success: "تم تعيين العميل المحتمل بنجاح.",
    },

    note: {
      sectionTitle: "إضافة ملاحظة",
      placeholder: "اكتب ملاحظة CRM…",
      save: "إضافة ملاحظة",
      saving: "جارٍ الحفظ…",
      saved: "✓ تمت إضافة الملاحظة",
      added: "تمت إضافة الملاحظة إلى السجل.",
      error: "فشل في إضافة الملاحظة. يرجى المحاولة مجدداً.",
    },

    activity: {
      title: "سجل الأنشطة",
      empty: "لم يُسجَّل أي نشاط بعد.",
      types: {
        Submitted: "تم الإرسال",
        StatusChanged: "تغيير الحالة",
        NoteAdded: "تمت إضافة ملاحظة",
        Assigned: "تم التعيين",
        Converted: "تم التحويل",
        Closed: "تم الإغلاق",
      },
      by: "بواسطة {{actor}}",
      system: "النظام",
    },

    actions: {
      delete: "حذف",
      deleteConfirm: "إغلاق هذا العميل المحتمل؟",
      deleteSuccess: "تم إغلاق العميل المحتمل.",
      convert: "تحويل إلى مستأجر",
      assign: "تعيين",
      viewActivity: "الأنشطة",
      statusUpdateError: "تعذر تحديث حالة العميل المحتمل. حدّث الصفحة وحاول مرة أخرى.",
      tableView: "عرض الجدول",
      kanbanView: "عرض كانبان",
    },

    bulk: {
      // شريط الإجراءات العائم
      selectedCount: "{{count}} محدد",
      closeSelected: "إغلاق {{count}}",
      deleteSelected: "حذف {{count}}",
      clearSelection: "إلغاء التحديد",
      selectAll: "تحديد جميع العملاء في هذه الصفحة",
      selectRow: "تحديد {{company}}",
      closing: "جارٍ الإغلاق…",
      processing: "جارٍ المعالجة…",

      // مربع تأكيد — الإغلاق
      confirmCloseTitle: "إغلاق {{count}} عميل محتمل؟",
      confirmCloseDesc:
        "سيتم وضع علامة على هؤلاء العملاء بأنهم مغلقون. سيتم تخطي العملاء المحوَّلين تلقائيًا.",
      confirmClose: "إغلاق العملاء",

      // مربع تأكيد — الحذف
      confirmDeleteTitle: "حذف {{count}} عميل محتمل؟",
      confirmDeleteDesc:
        "سيتم حذف العملاء المحتملين المحددين بشكل مبدئي. لا يمكن التراجع عن هذا الإجراء.",
      confirmDelete: "حذف العملاء",

      cancel: "إلغاء",

      // رسائل التنبيه
      closeSuccess: "اكتمل الإغلاق الجماعي",
      closeError: "فشل إغلاق العملاء. يرجى المحاولة مرة أخرى.",
      deleteSuccess: "تم حذف {{count}} عميل محتمل.",
      deleteError: "فشل حذف بعض العملاء. يرجى المحاولة مرة أخرى.",
      toastUpdated: "تم تحديث {{count}}",
      toastSkipped: "تم تخطي {{count}}",
      toastNotFound: "{{count}} غير موجود",

      // ملاحظات داخلية في سجل النشاط
      closedNote: "إغلاق جماعي من قِبل المشرف",
      deletedNote: "حذف جماعي من قِبل المشرف",
    },
  },
};
