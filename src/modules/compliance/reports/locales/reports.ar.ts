/**
 * Compliance — Reports sub-module locale (Arabic)
 */
export const ar = {
  compliance: {
    reportsTitle: "تقارير الامتثال",
    reportType: "نوع التقرير",
    period: "الفترة",
    periodStart: "بداية الفترة",
    periodEnd: "نهاية الفترة",
    generateReport: "إنشاء تقرير",
    reportReady: "جاهز",
    reportPending: "قيد الإنشاء...",
    downloadReport: "تحميل",
    reportDetail: "تفاصيل التقرير",
    reportTypes: {
      gdprOverview: "نظرة عامة على اللائحة العامة لحماية البيانات (GDPR)",
      dsrSummary: "ملخص نشاط حقوق أصحاب البيانات (DSR)",
      consentAudit: "تدقيق الموافقة",
      retentionAnalysis: "تحليل الاحتفاظ",
      dataInventory: "تصدير مخزون البيانات",
    },
    status: {
      ready: "جاهز",
      generating: "قيد الإنشاء...",
      pending: "قيد الانتظار",
      failed: "فشل",
    },

    // Auto-refresh indicator
    autoRefreshing: "يتحدث تلقائياً…",

    // Format dropdown descriptions
    format: {
      csvDesc: "قيم مفصولة بفاصلة",
      xlsxDesc: "تنسيق Microsoft Excel",
      jsonDesc: "بيانات JSON منظمة",
      pdfDesc: "تنسيق المستند المحمول",
    },

    // Messages
    reportQueued: "تم جدولة إنشاء التقرير",
    reportQueuedDesc: "أعد تحديث الصفحة بعد دقائق قليلة لرؤية تقريرك.",
    generateReportDesc: "حدد نوع التقرير ونطاق التاريخ الاختياري لإنشاء تقرير امتثال.",
    reportQueuedInfo:
      "تُنشأ التقارير بشكل غير متزامن. أعد تحديث القائمة بعد دقائق قليلة لرؤية تقريرك.",

    // Empty states
    noReports: "لم يتم إنشاء تقارير",
    noReportsDesc: "أنشئ أول تقرير امتثال للبدء.",

    // Report detail actions
    mvpExportTitle: "تصدير أساسي",
    mvpExportDesc:
      "تصدير OpenXML/PDF الكامل مع الرسوم البيانية مخطط له. في الوقت الحالي، قم بالتنزيل بصيغة CSV أو TSV.",

    // Download format labels
    downloadCsv: "تحميل CSV",
    downloadTsv: "تحميل جدول بيانات (TSV)",
    downloadJson: "تحميل JSON",
    downloadTxt: "تحميل ملخص نصي",
  },
};
