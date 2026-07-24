/**
 * Copy for the dashboard builder — the palette, the canvas, the widget
 * property editor, the widget previews, and the studio panel's size pickers.
 *
 * The preview widgets deliberately render invented sample rows so the canvas
 * shows the SHAPE of a widget before it carries real numbers. That sample copy
 * is on screen, so it is translated like every other string in the product.
 *
 * Keys deepMerge onto `dashboard.builder.*` / `dashboard.studio.*` from
 * `../dashboard.en` / `../dashboard.ar`; siblings there are untouched.
 */
export const en = {
  dashboard: {
    studio: {
      // The radius / shadow scale steps. English keeps the two-letter
      // convention the rest of the design system uses; Arabic has no
      // equivalent abbreviation, so it spells the step out.
      sizeSm: "SM",
      sizeMd: "MD",
      sizeLg: "LG",
      sizeXl: "XL",
      size2xl: "2XL",
    },
    builder: {
      quickAdd: "Add to canvas",
      enterpriseShort: "ENT",
      enterpriseOnly: "Enterprise edition only",
      // The shortcut travels inside the accessible name: an icon-only control
      // has no visible label to hang it off, and title="" is not a name.
      undoShortcut: "Undo (Ctrl+Z)",
      redoShortcut: "Redo (Ctrl+Shift+Z)",
      fewerRows: "Fewer rows",
      moreRows: "More rows",
      canvas: {
        selectWidget: "Select the {name} widget",
      },
      props: {
        column: "Column",
        row: "Row",
        widgetTitle: "Title",
        widgetValue: "Value",
        widgetTrend: "Trend",
        widgetMessage: "Message",
        widgetUrl: "URL",
        showLegend: "Show legend",
        showGrid: "Show grid",
        showTimestamps: "Show timestamps",
        sendBackward: "Send backward",
        bringForward: "Bring forward",
      },
      preview: {
        metric: "Metric",
        current: "Current",
        previous: "Previous",
        columnDate: "Date",
        record: "Record {index}",
        action: "Action {index}",
        recentActivity: "Recent Activity",
        unreadCount: "{count} unread",
        announcementMessage: "Welcome to the platform! Check out our latest features.",
        customPlaceholder: "Configure a URL to embed custom content",
        openCustomSource: "Open the embedded source in a new tab",
        unknownWidget: "Unknown widget type: {type}",
        activity: {
          loginSuccess: "User login successful",
          loginFailed: "Failed login attempt",
          adminCreated: "New admin created",
          permissionsUpdated: "Permissions updated",
          sessionExpired: "Session expired",
          backupComplete: "System backup complete",
        },
        weekday: {
          mon: "Mon",
          tue: "Tue",
          wed: "Wed",
          thu: "Thu",
          fri: "Fri",
          sat: "Sat",
          sun: "Sun",
        },
        event: {
          teamMeeting: "Team Meeting",
          teamMeetingTime: "10:00 AM",
          releaseReview: "Release Review",
          releaseReviewTime: "2:00 PM",
          sprintPlanning: "Sprint Planning",
          sprintPlanningTime: "4:00 PM",
        },
        notification: {
          userRegistered: "New user registered",
          backupCompleted: "Backup completed",
          certificateExpiring: "Certificate expiring in 7 days",
          updateAvailable: "System update available",
          weeklyReport: "Weekly report generated",
        },
      },
    },
  },
} as const;

export const ar = {
  dashboard: {
    studio: {
      sizeSm: "صغير",
      sizeMd: "متوسط",
      sizeLg: "كبير",
      sizeXl: "كبير جداً",
      size2xl: "ضخم",
    },
    builder: {
      quickAdd: "إضافة إلى اللوحة",
      enterpriseShort: "مؤسسات",
      enterpriseOnly: "متاح لإصدار المؤسسات فقط",
      undoShortcut: "تراجع (Ctrl+Z)",
      redoShortcut: "إعادة (Ctrl+Shift+Z)",
      fewerRows: "صفوف أقل",
      moreRows: "صفوف أكثر",
      canvas: {
        selectWidget: "تحديد أداة {name}",
      },
      props: {
        column: "العمود",
        row: "الصف",
        widgetTitle: "العنوان",
        widgetValue: "القيمة",
        widgetTrend: "الاتجاه",
        widgetMessage: "الرسالة",
        widgetUrl: "الرابط",
        showLegend: "إظهار وسيلة الإيضاح",
        showGrid: "إظهار الشبكة",
        showTimestamps: "إظهار الأوقات",
        sendBackward: "إرسال إلى الخلف",
        bringForward: "إحضار إلى الأمام",
      },
      preview: {
        metric: "مؤشر",
        current: "الحالي",
        previous: "السابق",
        columnDate: "التاريخ",
        record: "سجل {index}",
        action: "إجراء {index}",
        recentActivity: "النشاط الأخير",
        unreadCount: "{count} غير مقروء",
        announcementMessage: "مرحباً بك في المنصة! تعرّف على أحدث الميزات.",
        customPlaceholder: "أدخل رابطاً لتضمين محتوى مخصص",
        openCustomSource: "فتح المصدر المضمّن في تبويب جديد",
        unknownWidget: "نوع أداة غير معروف: {type}",
        activity: {
          loginSuccess: "تم تسجيل الدخول بنجاح",
          loginFailed: "محاولة تسجيل دخول فاشلة",
          adminCreated: "تم إنشاء مسؤول جديد",
          permissionsUpdated: "تم تحديث الصلاحيات",
          sessionExpired: "انتهت الجلسة",
          backupComplete: "اكتمل النسخ الاحتياطي للنظام",
        },
        weekday: {
          mon: "إثن",
          tue: "ثلا",
          wed: "أرب",
          thu: "خمي",
          fri: "جمع",
          sat: "سبت",
          sun: "أحد",
        },
        event: {
          teamMeeting: "اجتماع الفريق",
          teamMeetingTime: "10:00 ص",
          releaseReview: "مراجعة الإصدار",
          releaseReviewTime: "2:00 م",
          sprintPlanning: "تخطيط السبرنت",
          sprintPlanningTime: "4:00 م",
        },
        notification: {
          userRegistered: "تسجيل مستخدم جديد",
          backupCompleted: "اكتمل النسخ الاحتياطي",
          certificateExpiring: "تنتهي صلاحية الشهادة خلال 7 أيام",
          updateAvailable: "يتوفر تحديث للنظام",
          weeklyReport: "تم إنشاء التقرير الأسبوعي",
        },
      },
    },
  },
} as const;
