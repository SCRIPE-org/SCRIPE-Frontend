export const ar = {
  guestPortal: {
    badge: "دخول الضيوف",
    noAppRequired: "بدون تطبيق",
    eyebrow: "بوابة حجز الضيوف",
    title: "تفاصيل الحجز",
    reservationNumber: "رقم الحجز",
    venue: "المنشأة",
    facility: "المرفق",
    resource: "الملعب / المساحة",
    schedule: "الموعد والوقت",
    startsAt: "يبدأ",
    endsAt: "ينتهي",
    duration: "المدة",
    timeZone: "المنطقة الزمنية",
    quantity: "السعة / الحصص",
    customer: "محجوز لصالح",
    instructions: "توجيهات وتعليمات الدخول",
    noInstructions: "لا توجد تعليمات خاصة مقدمة من المنشأة.",
    status: {
      Confirmed: "مؤكد",
      CheckedIn: "تم الحضور",
      Completed: "مكتمل",
      Cancelled: "ملغى",
      Held: "معلّق",
      Requested: "قيد المراجعة",
      Expired: "منتهي الصلاحية",
      Rejected: "مرفوض",
      PartiallyFulfilled: "منفذ جزئياً",
      NoShow: "عدم حضور",
    },
    finance: {
      title: "ملخص السداد",
      invoiceNumber: "رقم الفاتورة",
      totalAmount: "المبلغ الإجمالي",
      paidAmount: "المدفوع",
      outstandingAmount: "الرصيد المستحق",
      status: {
        Paid: "مدفوع بالكامل",
        Pending: "في انتظار السداد",
        PartiallyPaid: "مدفوع جزئياً",
        Overdue: "متأخر السداد",
      },
    },
    actions: {
      cancelBooking: "إلغاء الحجز",
      cancelling: "جارٍ الإلغاء...",
      keepBooking: "الاحتفاظ بالحجز",
      confirmCancel: "نعم، إلغاء الحجز",
      downloadConfirmation: "حفظ التأكيد",
      backToHome: "رجوع",
    },
    cancelModal: {
      title: "هل تريد إلغاء هذا الحجز؟",
      description:
        "هل أنت متأكد من رغبتك في إلغاء الحجز {{reservationNumber}}؟ سيتم تحرير الفترة الزمنية المحجوزة فوراً وإتاحتها للضيوف الآخرين.",
      reasonLabel: "سبب الإلغاء (اختياري)",
      reasonPlaceholder: "مثال: تعارض في المواعيد، تغيير الخطط...",
      warning: "لا يمكن التراجع عن هذا الإجراء بعد التأكيد.",
    },
    messages: {
      cancelSuccess: "تم إلغاء حجزك بنجاح.",
      cancelFailed: "تعذر إلغاء الحجز. يرجى التواصل مع المنشأة.",
      cancelNotEligible:
        "هذا الحجز غير مؤهل للإلغاء الذاتي. يرجى التواصل مع إدارة المنشأة مباشرة.",
    },
    errors: {
      invalidOrExpiredTitle: "الرابط منتهي أو غير صالح",
      invalidOrExpiredDescription:
        "رابط وصول الضيف هذا لم يعد صالحاً. قد يكون منتهي الصلاحية، أو تم إلغاؤه، أو استُخدم مسبقاً.",
      sessionExpiredTitle: "انتهت صلاحية الجلسة",
      sessionExpiredDescription:
        "انتهت صلاحية جلسة الضيف الآمنة. يرجى النقر على الرابط الأصلي المستلم عبر البريد أو الرسائل النصية مرة أخرى.",
      generalError:
        "حدث خطأ غير متوقع أثناء تحميل تفاصيل الحجز. يرجى إعادة المحاولة.",
      contactVenue:
        "إذا كنت بحاجة إلى مساعدة بشأن حجزك، يرجى التواصل مع إدارة المنشأة مباشرة.",
    },
    loading: {
      securing: "جارٍ تأمين جلسة الضيف...",
      loadingBooking: "جارٍ تحميل تفاصيل حجزك...",
    },
  },
};
