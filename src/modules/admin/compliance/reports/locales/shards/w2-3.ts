/**
 * Copy added while the reports views adopted the shared page/detail anatomy.
 *
 * `generatedAt` exists because the generation timestamp was labelled with
 * `compliance.period` ("Period"), which is the reporting window — two different
 * dates under one label.
 */
export const en = {
  compliance: {
    reportsDescription: "Generate and download compliance reports for each regulation.",
    reportMetadata: "Report metadata",
    reportId: "Report ID",
    generatedAt: "Generated",
    exportFormat: "Export format",
    reportNotFound: "Report not found",
    reportNotFoundDesc: "It may have been removed, or the link is no longer valid.",
  },
} as const;

export const ar = {
  compliance: {
    reportsDescription: "أنشئ تقارير الامتثال لكل لائحة ونزّلها.",
    reportMetadata: "بيانات التقرير",
    reportId: "معرّف التقرير",
    generatedAt: "تاريخ الإنشاء",
    exportFormat: "صيغة التصدير",
    reportNotFound: "لم يتم العثور على التقرير",
    reportNotFoundDesc: "ربما تمت إزالته، أو لم يعد الرابط صالحًا.",
  },
} as const;
