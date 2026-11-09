const { chromium } = require("@playwright/test");
const fs = require("fs");
const path = require("path");

const OUT_DIRS = [
  path.resolve("C:/Users/DELL/.gemini/antigravity/brain/e51ad886-2fb8-487c-8fa9-06359d11a994/evidence_screens"),
  path.resolve("E:/Scripe_pro/SCRIPE-Root-academy-a7-a8/reports/academy-execution/evidence_screens")
];

for (const outDir of OUT_DIRS) {
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }
}

function getBaseStyles(isDark = false, isAr = false) {
  const bgGround = isDark ? "#090d16" : "#f8fafc";
  const bgSurface = isDark ? "#0f172a" : "#ffffff";
  const bgRaised = isDark ? "#1e293b" : "#f1f5f9";
  const borderLine = isDark ? "#334155" : "#e2e8f0";
  const borderLineHi = isDark ? "#475569" : "#cbd5e1";
  const textInk = isDark ? "#f8fafc" : "#0f172a";
  const textInk2 = isDark ? "#cbd5e1" : "#334155";
  const textInk3 = isDark ? "#94a3b8" : "#64748b";
  const textAccent = "#0284c7";

  return `
    :root {
      --nx-ground: ${bgGround};
      --nx-surface: ${bgSurface};
      --nx-raised: ${bgRaised};
      --nx-line: ${borderLine};
      --nx-line-hi: ${borderLineHi};
      --nx-ink: ${textInk};
      --nx-ink-2: ${textInk2};
      --nx-ink-3: ${textInk3};
      --nx-accent: ${textAccent};
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background-color: var(--nx-ground);
      color: var(--nx-ink);
      font-family: ${isAr ? "'Segoe UI', Tahoma, Arial, sans-serif" : "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"};
      direction: ${isAr ? "rtl" : "ltr"};
      text-align: ${isAr ? "right" : "left"};
      line-height: 1.5;
      font-size: 14px;
    }
    .font-mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; }
    .border-nx-line { border-color: var(--nx-line); }
    .bg-nx-surface { background-color: var(--nx-surface); }
    .bg-nx-ground { background-color: var(--nx-ground); }
    .bg-nx-raised { background-color: var(--nx-raised); }
    .text-nx-ink { color: var(--nx-ink); }
    .text-nx-ink-2 { color: var(--nx-ink-2); }
    .text-nx-ink-3 { color: var(--nx-ink-3); }
    .text-nx-accent { color: var(--nx-accent); }
    .bg-nx-accent { background-color: var(--nx-accent); }
    .rounded-lg { border-radius: 0.5rem; }
    .rounded-xl { border-radius: 0.75rem; }
    .rounded-md { border-radius: 0.375rem; }
    .rounded { border-radius: 0.25rem; }
    .border { border-width: 1px; border-style: solid; }
    .p-4 { padding: 1rem; }
    .p-6 { padding: 1.5rem; }
    .p-8 { padding: 2rem; }
    .p-3 { padding: 0.75rem; }
    .p-2 { padding: 0.5rem; }
    .p-2\\.5 { padding: 0.625rem; }
    .py-3 { padding-top: 0.75rem; padding-bottom: 0.75rem; }
    .px-4 { padding-left: 1rem; padding-right: 1rem; }
    .py-2\\.5 { padding-top: 0.625rem; padding-bottom: 0.625rem; }
    .py-2 { padding-top: 0.5rem; padding-bottom: 0.5rem; }
    .px-3 { padding-left: 0.75rem; padding-right: 0.75rem; }
    .space-y-6 > * + * { margin-top: 1.5rem; }
    .space-y-4 > * + * { margin-top: 1rem; }
    .space-y-3 > * + * { margin-top: 0.75rem; }
    .space-y-2 > * + * { margin-top: 0.5rem; }
    .flex { display: flex; }
    .items-center { align-items: center; }
    .items-start { align-items: flex-start; }
    .justify-between { justify-content: space-between; }
    .justify-end { justify-content: flex-end; }
    .grid { display: grid; }
    .grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
    .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
    .grid-cols-6 { grid-template-columns: repeat(6, minmax(0, 1fr)); }
    .gap-4 { gap: 1rem; }
    .gap-6 { gap: 1.5rem; }
    .gap-3 { gap: 0.75rem; }
    .gap-2 { gap: 0.5rem; }
    .text-xs { font-size: 0.75rem; line-height: 1rem; }
    .text-sm { font-size: 0.875rem; line-height: 1.25rem; }
    .text-base { font-size: 1rem; line-height: 1.5rem; }
    .text-xl { font-size: 1.25rem; line-height: 1.75rem; }
    .text-2xl { font-size: 1.5rem; line-height: 2rem; }
    .font-medium { font-weight: 500; }
    .font-semibold { font-weight: 600; }
    .font-bold { font-weight: 700; }
    .text-emerald-500 { color: #10b981; }
    .text-emerald-600 { color: #059669; }
    .text-amber-500 { color: #f59e0b; }
    .text-amber-600 { color: #d97706; }
    .text-rose-500 { color: #f43f5e; }
    .text-rose-600 { color: #e11d48; }
    .text-sky-600 { color: #0284c7; }
    .bg-emerald-500\\/10 { background-color: rgba(16, 185, 129, 0.1); }
    .bg-amber-500\\/10 { background-color: rgba(245, 158, 11, 0.1); }
    .bg-amber-500\\/5 { background-color: rgba(245, 158, 11, 0.05); }
    .bg-rose-500\\/10 { background-color: rgba(244, 63, 94, 0.1); }
    .border-emerald-500\\/20 { border-color: rgba(16, 185, 129, 0.2); }
    .border-amber-500\\/20 { border-color: rgba(245, 158, 11, 0.2); }
    .border-amber-500\\/30 { border-color: rgba(245, 158, 11, 0.3); }
    .border-rose-500\\/20 { border-color: rgba(244, 63, 94, 0.2); }
    .w-full { width: 100%; }
    .overflow-hidden { overflow: hidden; }
    table { width: 100%; border-collapse: collapse; }
    button { cursor: pointer; border: none; background: none; }
    .btn-outline { border: 1px solid var(--nx-line); background: var(--nx-surface); color: var(--nx-ink); padding: 0.375rem 0.75rem; border-radius: 0.375rem; font-size: 0.75rem; font-weight: 500; }
    .btn-accent { background: var(--nx-accent); color: white; padding: 0.375rem 0.75rem; border-radius: 0.375rem; font-size: 0.75rem; font-weight: 600; }
  `;
}

function renderA7Html({ isDark = false, isAr = false, isMobile = false, showSheet = false }) {
  const styles = getBaseStyles(isDark, isAr);

  return `
  <!DOCTYPE html>
  <html lang="${isAr ? "ar" : "en"}" dir="${isAr ? "rtl" : "ltr"}">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>SCRIPE Academy Fees & Receivables</title>
    <style>${styles}</style>
  </head>
  <body class="p-4 sm:p-6 lg:p-8">
    <div class="space-y-6" style="max-width: 1400px; margin: 0 auto;">
      <!-- SYNTHETIC VISUALIZATION NOTICE -->
      <div style="background: ${isDark ? "#1e293b" : "#f1f5f9"}; border: 1px dashed ${isDark ? "#475569" : "#cbd5e1"}; border-radius: 6px; padding: 6px 12px; font-size: 11px; font-weight: 600; color: ${isDark ? "#94a3b8" : "#475569"}; display: flex; align-items: center; justify-content: space-between;">
        <span>[SYNTHETIC VISUALIZATION MOCKUP — LAYOUT &amp; DESIGN REFERENCE ONLY]</span>
        <span style="font-family: monospace; font-size: 10px;">Playwright Synthetic • Host DB Runtime: BLOCKED</span>
      </div>

      <!-- Header -->
      <div class="flex items-center justify-between border-b border-nx-line pb-4" style="flex-wrap: wrap; gap: 1rem;">
        <div>
          <h1 class="text-xl sm:text-2xl font-bold text-nx-ink">
            ${isAr ? "الرسوم والمستحقات المالية" : "Fees & Receivables"}
          </h1>
          <p class="text-xs text-nx-ink-3" style="margin-top: 0.25rem;">
            ${isAr ? "المطابقة المالية المعتمدة بين تسجيلات الأكاديمية ومستحقات الإدارة المالية." : "Authoritative financial reconciliation between Academy enrollments and Finance receivables."}
          </p>
        </div>
        <div class="flex items-center gap-3">
          <div class="text-xs text-nx-ink-3">
            <span>${isAr ? "بتاريخ" : "As of"}: </span>
            <span class="font-mono text-nx-ink-2">12:00:00 UTC</span>
          </div>
          <span class="btn-outline">${isAr ? "العربية (AR)" : "English (EN)"}</span>
        </div>
      </div>

      <!-- Finance Governance Notice -->
      <div class="rounded-md border border-nx-line bg-nx-surface p-3 text-xs text-nx-ink-2">
        ${isAr 
          ? "الحقيقة المالية مملوكة حصرياً لنظام المالية (SCRIPE Finance). الحالات التشغيلية في الأكاديمية لا تفترض السداد تلقائياً." 
          : "Financial truth is owned exclusively by SCRIPE Finance. Academy operational states do not infer payment."}
      </div>

      <!-- Financial Summary Cards (Reconciled SAR Partition: 5,000 Invoiced, 3,000 Paid, 2,000 Outstanding, 1,500 Overdue, 1 Waived) -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div class="rounded-lg border border-nx-line bg-nx-surface p-4">
          <span class="text-xs font-medium text-nx-ink-3 uppercase">${isAr ? "إجمالي المفوتر (SAR)" : "Total Invoiced (SAR)"}</span>
          <div class="text-2xl font-bold font-mono text-nx-ink" style="margin-top: 0.5rem;">5,000.00</div>
          <p class="text-[11px] text-nx-ink-3" style="margin-top: 0.25rem;">${isAr ? "4 فواتير صادرة" : "4 invoices issued"}</p>
        </div>
        <div class="rounded-lg border border-nx-line bg-nx-surface p-4">
          <span class="text-xs font-medium text-nx-ink-3 uppercase">${isAr ? "المحصل / المدفوع (SAR)" : "Total Paid (SAR)"}</span>
          <div class="text-2xl font-bold font-mono text-emerald-600" style="margin-top: 0.5rem;">3,000.00</div>
          <p class="text-[11px] text-nx-ink-3" style="margin-top: 0.25rem;">${isAr ? "2 مسددة بالكامل • 1 جزئياً" : "2 fully paid • 1 partial"}</p>
        </div>
        <div class="rounded-lg border border-nx-line bg-nx-surface p-4">
          <span class="text-xs font-medium text-nx-ink-3 uppercase">${isAr ? "المتبقي المستحق (SAR)" : "Outstanding Balance (SAR)"}</span>
          <div class="text-2xl font-bold font-mono text-amber-600" style="margin-top: 0.5rem;">2,000.00</div>
          <p class="text-[11px] text-nx-ink-3" style="margin-top: 0.25rem;">${isAr ? "2 فواتير قيد التحصيل" : "2 invoices with balance"}</p>
        </div>
        <div class="rounded-lg border border-nx-line bg-nx-surface p-4">
          <span class="text-xs font-medium text-nx-ink-3 uppercase">${isAr ? "إجمالي المتأخرات (SAR)" : "Total Overdue (SAR)"}</span>
          <div class="text-2xl font-bold font-mono text-rose-600" style="margin-top: 0.5rem;">1,500.00</div>
          <p class="text-[11px] text-nx-ink-3" style="margin-top: 0.25rem;">${isAr ? "1 فاتورة متأخرة (25 يوماً)" : "1 invoice overdue (25d)"}</p>
        </div>
        <div class="rounded-lg border border-nx-line bg-nx-surface p-4">
          <span class="text-xs font-medium text-nx-ink-3 uppercase">${isAr ? "التسجيلات المعفاة" : "Waived Enrollments"}</span>
          <div class="text-2xl font-bold font-mono text-nx-ink" style="margin-top: 0.5rem;">1</div>
          <p class="text-[11px] text-nx-ink-3" style="margin-top: 0.25rem;">${isAr ? "إعفاء تجاري معتمد (0 فاتورة)" : "Governed waiver (0 invoices)"}</p>
        </div>
      </div>

      <!-- Filter Bar -->
      <div class="rounded-lg border border-nx-line bg-nx-surface p-3 flex items-center justify-between" style="flex-wrap: wrap; gap: 0.5rem;">
        <div class="flex items-center gap-2" style="flex-wrap: wrap;">
          <input type="text" placeholder="${isAr ? "البحث بالرياضي، الفاتورة..." : "Search athlete, invoice..."}" class="btn-outline font-sans" style="min-width: 200px; padding: 0.375rem 0.5rem;" />
          <span class="btn-outline">${isAr ? "الفرع: فرع الرياض 01" : "Branch: Riyadh 01"}</span>
          <span class="btn-outline">${isAr ? "العملة: SAR" : "Currency: SAR"}</span>
          <span class="btn-outline">${isAr ? "جميع الحالات" : "All Statuses"}</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="btn-outline">${isAr ? "تحديث" : "Refresh"}</span>
          <span class="btn-accent">${isAr ? "تصدير CSV" : "Export CSV"}</span>
        </div>
      </div>

      <!-- Contractual Gap Disclosure (ADR-ACAD-A7-01 Installments) -->
      <div class="rounded-lg border border-amber-500/20 bg-amber-500/5 p-4 text-xs text-nx-ink-2 space-y-1">
        <div class="flex items-center gap-2">
          <span style="display:inline-block; width:8px; height:8px; border-radius:9999px; background-color:#f59e0b;"></span>
          <span class="font-semibold text-amber-600">${isAr ? "إفصاحات الفجوات التعاقدية الموثقة" : "Documented Contract Gap Disclosures"}</span>
        </div>
        <p class="text-[11px] text-nx-ink-3">
          ${isAr 
            ? "عرض جدول الأقساط محظور حالياً: في انتظار إطلاق مجمع الأقساط في نظام المالية (ADR-ACAD-A7-01)." 
            : "Installment schedule projection is BLOCKED: awaiting Finance module installment aggregate release (ADR-ACAD-A7-01)."}
        </p>
      </div>

      <!-- Table / Mobile Cards -->
      ${isMobile ? `
      <!-- Mobile Compact Record Cards (390px Viewport) -->
      <div class="space-y-3">
        <!-- Card 1: Ziyad (Paid) -->
        <div class="rounded-lg border border-nx-line bg-nx-surface p-4 space-y-3 shadow-xs">
          <div class="flex items-start justify-between border-b border-nx-line pb-2">
            <div>
              <span class="block font-semibold text-nx-ink text-sm">${isAr ? "زياد الحربي" : "Ziyad Al-Harbi"}</span>
              <span class="block text-xs text-nx-ink-3">${isAr ? "كرة القدم • الفصل 1" : "Football Development • Term 1"}</span>
            </div>
            <span class="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">${isAr ? "مسددة بالكامل" : "Paid"}</span>
          </div>
          <div class="flex justify-between text-xs text-nx-ink-3">
            <div><span>${isAr ? "رقم الفاتورة:" : "Invoice #:"} </span><span class="font-mono text-nx-ink font-medium">INV-2026-001</span></div>
            <div><span>${isAr ? "الاستحقاق:" : "Due:"} </span><span class="font-mono text-nx-ink">2026-11-15</span></div>
          </div>
          <div class="grid grid-cols-3 gap-2 rounded-md bg-nx-ground p-2.5 text-center text-xs">
            <div><span class="block text-[10px] text-nx-ink-3">${isAr ? "المفوتر" : "Invoiced"}</span><span class="font-mono font-medium">1,500.00</span></div>
            <div><span class="block text-[10px] text-nx-ink-3">${isAr ? "المدفوع" : "Paid"}</span><span class="font-mono font-medium text-emerald-600">1,500.00</span></div>
            <div><span class="block text-[10px] text-nx-ink-3">${isAr ? "المتبقي" : "Balance"}</span><span class="font-mono font-bold text-nx-ink-3">0.00 SAR</span></div>
          </div>
          <button class="btn-outline w-full">${isAr ? "عرض تفاصيل المطابقة" : "View Reconciliation"}</button>
        </div>

        <!-- Card 2: Ziyad (Partially Paid) -->
        <div class="rounded-lg border border-nx-line bg-nx-surface p-4 space-y-3 shadow-xs">
          <div class="flex items-start justify-between border-b border-nx-line pb-2">
            <div>
              <span class="block font-semibold text-nx-ink text-sm">${isAr ? "زياد الحربي" : "Ziyad Al-Harbi"}</span>
              <span class="block text-xs text-nx-ink-3">${isAr ? "السباحة • الفصل 1" : "Elite Swimming • Term 1"}</span>
            </div>
            <span class="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/10 text-amber-600 border border-amber-500/20">${isAr ? "مسددة جزئياً" : "Partially Paid"}</span>
          </div>
          <div class="flex justify-between text-xs text-nx-ink-3">
            <div><span>${isAr ? "رقم الفاتورة:" : "Invoice #:"} </span><span class="font-mono text-nx-ink font-medium">INV-2026-002</span></div>
            <div><span>${isAr ? "الاستحقاق:" : "Due:"} </span><span class="font-mono text-nx-ink">2026-11-25</span></div>
          </div>
          <div class="grid grid-cols-3 gap-2 rounded-md bg-nx-ground p-2.5 text-center text-xs">
            <div><span class="block text-[10px] text-nx-ink-3">${isAr ? "المفوتر" : "Invoiced"}</span><span class="font-mono font-medium">1,000.00</span></div>
            <div><span class="block text-[10px] text-nx-ink-3">${isAr ? "المدفوع" : "Paid"}</span><span class="font-mono font-medium text-emerald-600">500.00</span></div>
            <div><span class="block text-[10px] text-nx-ink-3">${isAr ? "المتبقي" : "Balance"}</span><span class="font-mono font-bold text-amber-600">500.00 SAR</span></div>
          </div>
          <button class="btn-outline w-full">${isAr ? "عرض تفاصيل المطابقة" : "View Reconciliation"}</button>
        </div>

        <!-- Card 3: Rayan (Overdue) -->
        <div class="rounded-lg border border-rose-500/30 bg-nx-surface p-4 space-y-3 shadow-xs">
          <div class="flex items-start justify-between border-b border-nx-line pb-2">
            <div>
              <span class="block font-semibold text-nx-ink text-sm">${isAr ? "ريان العتيبي" : "Rayan Al-Otaibi"}</span>
              <span class="block text-xs text-nx-ink-3">${isAr ? "كرة القدم • الفصل 1" : "Football Development • Term 1"}</span>
            </div>
            <span class="px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-500/10 text-rose-600 border border-rose-500/20">${isAr ? "متأخرة" : "Overdue"}</span>
          </div>
          <div class="flex justify-between text-xs text-nx-ink-3">
            <div><span>${isAr ? "رقم الفاتورة:" : "Invoice #:"} </span><span class="font-mono text-nx-ink font-medium">INV-2026-003</span></div>
            <div><span>${isAr ? "الاستحقاق:" : "Due:"} </span><span class="font-mono text-rose-600 font-semibold">2026-10-15 (${isAr ? "متأخرة 25 يوماً" : "25d overdue"})</span></div>
          </div>
          <div class="grid grid-cols-3 gap-2 rounded-md bg-nx-ground p-2.5 text-center text-xs">
            <div><span class="block text-[10px] text-nx-ink-3">${isAr ? "المفوتر" : "Invoiced"}</span><span class="font-mono font-medium">1,500.00</span></div>
            <div><span class="block text-[10px] text-nx-ink-3">${isAr ? "المدفوع" : "Paid"}</span><span class="font-mono font-medium text-emerald-600">0.00</span></div>
            <div><span class="block text-[10px] text-nx-ink-3">${isAr ? "المتبقي" : "Balance"}</span><span class="font-mono font-bold text-rose-600">1,500.00 SAR</span></div>
          </div>
          <button class="btn-outline w-full">${isAr ? "عرض تفاصيل المطابقة" : "View Reconciliation"}</button>
        </div>

        <!-- Card 4: Sami (Waived) -->
        <div class="rounded-lg border border-nx-line bg-nx-surface p-4 space-y-3 shadow-xs">
          <div class="flex items-start justify-between border-b border-nx-line pb-2">
            <div>
              <span class="block font-semibold text-nx-ink text-sm">${isAr ? "سامي الدوسري" : "Sami Al-Dosari"}</span>
              <span class="block text-xs text-nx-ink-3">${isAr ? "كرة القدم • الفصل 1" : "Football Development • Term 1"}</span>
            </div>
            <span class="px-2 py-0.5 rounded text-[10px] font-semibold bg-nx-raised text-nx-ink-2 border border-nx-line">${isAr ? "معفاة بتصريح" : "Waived"}</span>
          </div>
          <div class="flex justify-between text-xs text-nx-ink-3">
            <div><span>${isAr ? "رقم الفاتورة:" : "Invoice #:"} </span><span class="text-nx-ink-3 font-italic">— (${isAr ? "إعفاء تجاري" : "Policy Waiver"})</span></div>
            <div><span>${isAr ? "الاستحقاق:" : "Due:"} </span><span class="text-nx-ink-3">—</span></div>
          </div>
          <div class="grid grid-cols-3 gap-2 rounded-md bg-nx-ground p-2.5 text-center text-xs">
            <div><span class="block text-[10px] text-nx-ink-3">${isAr ? "عرض السعر" : "Quote"}</span><span class="font-mono font-medium">1,500.00</span></div>
            <div><span class="block text-[10px] text-nx-ink-3">${isAr ? "المفوتر" : "Invoiced"}</span><span class="font-mono font-medium text-nx-ink-3">0.00</span></div>
            <div><span class="block text-[10px] text-nx-ink-3">${isAr ? "المتبقي" : "Balance"}</span><span class="font-mono font-bold text-nx-ink-3">0.00 SAR</span></div>
          </div>
          <button class="btn-outline w-full">${isAr ? "عرض تفاصيل الإعفاء" : "View Waiver Details"}</button>
        </div>
      </div>
      ` : `
      <!-- Desktop Full Table View -->
      <div class="rounded-lg border border-nx-line bg-nx-surface overflow-hidden">
        <table>
          <thead class="bg-nx-raised text-nx-ink-3 border-b border-nx-line text-xs">
            <tr>
              <th class="py-3 px-4 text-start font-medium">${isAr ? "الرياضي" : "Athlete"}</th>
              <th class="py-3 px-4 text-start font-medium">${isAr ? "البرنامج والعرض" : "Program & Offering"}</th>
              <th class="py-3 px-4 text-start font-medium">${isAr ? "رقم الفاتورة" : "Invoice #"}</th>
              <th class="py-3 px-4 text-end font-medium">${isAr ? "المفوتر" : "Invoiced"}</th>
              <th class="py-3 px-4 text-end font-medium">${isAr ? "المدفوع" : "Paid"}</th>
              <th class="py-3 px-4 text-end font-medium">${isAr ? "المتبقي المستحق" : "Balance Due"}</th>
              <th class="py-3 px-4 text-start font-medium">${isAr ? "تاريخ الاستحقاق" : "Due Date"}</th>
              <th class="py-3 px-4 text-center font-medium">${isAr ? "الحالة" : "Status"}</th>
              <th class="py-3 px-4 text-end font-medium">${isAr ? "الإجراءات" : "Actions"}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-nx-line text-xs">
            <!-- Row 1: Ziyad (Paid) -->
            <tr style="border-bottom: 1px solid var(--nx-line);">
              <td class="py-3 px-4 font-medium text-nx-ink">${isAr ? "زياد الحربي" : "Ziyad Al-Harbi"}</td>
              <td class="py-3 px-4 text-nx-ink-2">${isAr ? "كرة القدم • الفصل 1" : "Football Development • Term 1"}</td>
              <td class="py-3 px-4 font-mono">INV-2026-001</td>
              <td class="py-3 px-4 text-end font-mono">1,500.00 SAR</td>
              <td class="py-3 px-4 text-end font-mono text-emerald-600">1,500.00 SAR</td>
              <td class="py-3 px-4 text-end font-mono text-nx-ink-3">0.00 SAR</td>
              <td class="py-3 px-4 font-mono">2026-11-15</td>
              <td class="py-3 px-4 text-center"><span class="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">${isAr ? "مسددة بالكامل" : "Paid"}</span></td>
              <td class="py-3 px-4 text-end"><button class="btn-outline" style="padding: 0.2rem 0.5rem;">${isAr ? "عرض التفاصيل" : "View Reconciliation"}</button></td>
            </tr>
            <!-- Row 2: Ziyad (Partially Paid) -->
            <tr style="border-bottom: 1px solid var(--nx-line);">
              <td class="py-3 px-4 font-medium text-nx-ink">${isAr ? "زياد الحربي" : "Ziyad Al-Harbi"}</td>
              <td class="py-3 px-4 text-nx-ink-2">${isAr ? "السباحة • الفصل 1" : "Elite Swimming • Term 1"}</td>
              <td class="py-3 px-4 font-mono">INV-2026-002</td>
              <td class="py-3 px-4 text-end font-mono">1,000.00 SAR</td>
              <td class="py-3 px-4 text-end font-mono text-emerald-600">500.00 SAR</td>
              <td class="py-3 px-4 text-end font-mono font-bold text-amber-600">500.00 SAR</td>
              <td class="py-3 px-4 font-mono">2026-11-25</td>
              <td class="py-3 px-4 text-center"><span class="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/10 text-amber-600 border border-amber-500/20">${isAr ? "مسددة جزئياً" : "Partially Paid"}</span></td>
              <td class="py-3 px-4 text-end"><button class="btn-outline" style="padding: 0.2rem 0.5rem;">${isAr ? "عرض التفاصيل" : "View Reconciliation"}</button></td>
            </tr>
            <!-- Row 3: Rayan (Overdue) -->
            <tr style="border-bottom: 1px solid var(--nx-line);">
              <td class="py-3 px-4 font-medium text-nx-ink">${isAr ? "ريان العتيبي" : "Rayan Al-Otaibi"}</td>
              <td class="py-3 px-4 text-nx-ink-2">${isAr ? "كرة القدم • الفصل 1" : "Football Development • Term 1"}</td>
              <td class="py-3 px-4 font-mono">INV-2026-003</td>
              <td class="py-3 px-4 text-end font-mono">1,500.00 SAR</td>
              <td class="py-3 px-4 text-end font-mono text-emerald-600">0.00 SAR</td>
              <td class="py-3 px-4 text-end font-mono font-bold text-rose-600">1,500.00 SAR</td>
              <td class="py-3 px-4 font-mono text-rose-600">2026-10-15 <span class="text-[10px]">(${isAr ? "متأخرة 25 يوماً" : "25d overdue"})</span></td>
              <td class="py-3 px-4 text-center"><span class="px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-500/10 text-rose-600 border border-rose-500/20">${isAr ? "متأخرة" : "Overdue"}</span></td>
              <td class="py-3 px-4 text-end"><button class="btn-outline" style="padding: 0.2rem 0.5rem;">${isAr ? "عرض التفاصيل" : "View Reconciliation"}</button></td>
            </tr>
            <!-- Row 4: Sami (Waived) -->
            <tr style="border-bottom: 1px solid var(--nx-line);">
              <td class="py-3 px-4 font-medium text-nx-ink">${isAr ? "سامي الدوسري" : "Sami Al-Dosari"}</td>
              <td class="py-3 px-4 text-nx-ink-2">${isAr ? "كرة القدم • الفصل 1" : "Football Development • Term 1"}</td>
              <td class="py-3 px-4 text-nx-ink-3 font-italic">— (${isAr ? "إعفاء تجاري" : "Policy Waiver"})</td>
              <td class="py-3 px-4 text-end font-mono text-nx-ink-3">0.00 SAR</td>
              <td class="py-3 px-4 text-end font-mono text-nx-ink-3">0.00 SAR</td>
              <td class="py-3 px-4 text-end font-mono text-nx-ink-3">0.00 SAR</td>
              <td class="py-3 px-4 text-nx-ink-3">—</td>
              <td class="py-3 px-4 text-center"><span class="px-2 py-0.5 rounded text-[10px] font-semibold bg-nx-raised text-nx-ink-2 border border-nx-line">${isAr ? "معفاة بتصريح" : "Waived"}</span></td>
              <td class="py-3 px-4 text-end"><button class="btn-outline" style="padding: 0.2rem 0.5rem;">${isAr ? "عرض الإعفاء" : "View Waiver"}</button></td>
            </tr>
            <!-- Row 5: Kareem (Paid) -->
            <tr>
              <td class="py-3 px-4 font-medium text-nx-ink">${isAr ? "كريم الغامدي" : "Kareem Al-Ghamdi"}</td>
              <td class="py-3 px-4 text-nx-ink-2">${isAr ? "السباحة • الفصل 1" : "Elite Swimming • Term 1"}</td>
              <td class="py-3 px-4 font-mono">INV-2026-004</td>
              <td class="py-3 px-4 text-end font-mono">1,000.00 SAR</td>
              <td class="py-3 px-4 text-end font-mono text-emerald-600">1,000.00 SAR</td>
              <td class="py-3 px-4 text-end font-mono text-nx-ink-3">0.00 SAR</td>
              <td class="py-3 px-4 font-mono">2026-11-10</td>
              <td class="py-3 px-4 text-center"><span class="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">${isAr ? "مسددة بالكامل" : "Paid"}</span></td>
              <td class="py-3 px-4 text-end"><button class="btn-outline" style="padding: 0.2rem 0.5rem;">${isAr ? "عرض التفاصيل" : "View Reconciliation"}</button></td>
            </tr>
          </tbody>
        </table>
      </div>
      `}

      <!-- Slide-over Drawer for 04_detail_sheet -->
      ${showSheet ? `
      <div style="position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; justify-content: flex-end; z-index: 50;">
        <div class="bg-nx-surface border-s border-nx-line p-6 space-y-6 shadow-2xl" style="width: 100%; max-width: 480px; overflow-y: auto;">
          <div class="flex items-start justify-between border-b border-nx-line pb-4">
            <div>
              <h2 class="text-base font-bold text-nx-ink">${isAr ? "تفاصيل المطابقة المالية" : "Financial Reconciliation Details"}</h2>
              <p class="text-xs text-nx-ink-3" style="margin-top: 0.25rem;">
                ${isAr ? "زياد الحربي — السباحة • الفصل 1" : "Ziyad Al-Harbi — Elite Swimming • Term 1"}
              </p>
            </div>
            <button class="btn-outline" style="padding: 0.2rem 0.5rem;">✕</button>
          </div>

          <div class="grid grid-cols-2 gap-4 rounded-md border border-nx-line bg-nx-ground p-4 text-xs">
            <div>
              <span class="block text-nx-ink-3">${isAr ? "مرجع فاتورة المالية" : "Finance Invoice Reference"}</span>
              <span class="font-mono font-semibold text-nx-ink text-sm">INV-2026-002</span>
            </div>
            <div>
              <span class="block text-nx-ink-3">${isAr ? "الحالة" : "Status"}</span>
              <span class="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/10 text-amber-600 border border-amber-500/20">${isAr ? "مسددة جزئياً" : "Partially Paid"}</span>
            </div>
            <div>
              <span class="block text-nx-ink-3">${isAr ? "تاريخ الإصدار" : "Issued Date"}</span>
              <span class="font-mono text-nx-ink">2026-11-01</span>
            </div>
            <div>
              <span class="block text-nx-ink-3">${isAr ? "تاريخ الاستحقاق" : "Due Date"}</span>
              <span class="font-mono text-nx-ink">2026-11-25</span>
            </div>
            <div>
              <span class="block text-nx-ink-3">${isAr ? "إجمالي الفاتورة" : "Invoiced Amount"}</span>
              <span class="font-mono font-bold text-nx-ink">1,000.00 SAR</span>
            </div>
            <div>
              <span class="block text-nx-ink-3">${isAr ? "المسدد حتى الآن" : "Paid Amount"}</span>
              <span class="font-mono font-bold text-emerald-600">500.00 SAR</span>
            </div>
            <div style="grid-column: span 2; border-top: 1px solid var(--nx-line); padding-top: 0.5rem;">
              <span class="block text-nx-ink-3">${isAr ? "الرصيد القائم المستحق" : "Outstanding Balance"}</span>
              <span class="font-mono text-base font-bold text-amber-600">500.00 SAR</span>
            </div>
          </div>

          <!-- Payment Allocations Section -->
          <div class="space-y-3">
            <span class="text-xs font-semibold uppercase tracking-wider text-nx-ink-3">
              ${isAr ? "توزيعات المدفوعات والإيصالات" : "Payment & Receipt Allocations"}
            </span>
            <div class="rounded-md border border-nx-line bg-nx-ground p-3 text-xs flex items-center justify-between">
              <div>
                <span class="block font-medium font-mono text-nx-ink">PAY-002</span>
                <span class="block text-[11px] text-nx-ink-3 font-mono">2026-11-05</span>
              </div>
              <div class="text-end">
                <span class="block font-semibold font-mono text-emerald-600">500.00 SAR</span>
                <span class="block text-[11px] text-nx-ink-3 font-mono">REC-002</span>
              </div>
            </div>
          </div>

          <!-- Installment Disclosure -->
          <div class="rounded-md border border-amber-500/20 bg-amber-500/5 p-3 text-xs text-nx-ink-3">
            <span class="block font-semibold text-amber-600">${isAr ? "إفصاحات الفجوات التعاقدية الموثقة" : "Documented Contract Gap Disclosures"}</span>
            <p class="text-[11px] leading-relaxed" style="margin-top: 0.25rem;">
              ${isAr 
                ? "عرض جدول الأقساط محظور حالياً: في انتظار إطلاق مجمع الأقساط في نظام المالية (ADR-ACAD-A7-01)." 
                : "Installment schedule projection is BLOCKED: awaiting Finance module installment aggregate release (ADR-ACAD-A7-01)."}
            </p>
          </div>

          <button class="btn-outline w-full" style="padding: 0.5rem;">${isAr ? "إغلاق" : "Close"}</button>
        </div>
      </div>
      ` : ""}
    </div>
  </body>
  </html>
  `;
}

function renderA8Html({ isDark = false, isAr = false, isMobile = false, showExportModal = false }) {
  const styles = getBaseStyles(isDark, isAr);

  return `
  <!DOCTYPE html>
  <html lang="${isAr ? "ar" : "en"}" dir="${isAr ? "rtl" : "ltr"}">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>SCRIPE Academy Dashboards & Analytics</title>
    <style>${styles}</style>
  </head>
  <body class="p-4 sm:p-6 lg:p-8">
    <div class="space-y-6" style="max-width: 1400px; margin: 0 auto;">
      <!-- SYNTHETIC VISUALIZATION NOTICE -->
      <div style="background: ${isDark ? "#1e293b" : "#f1f5f9"}; border: 1px dashed ${isDark ? "#475569" : "#cbd5e1"}; border-radius: 6px; padding: 6px 12px; font-size: 11px; font-weight: 600; color: ${isDark ? "#94a3b8" : "#475569"}; display: flex; align-items: center; justify-content: space-between;">
        <span>[SYNTHETIC VISUALIZATION MOCKUP — LAYOUT &amp; DESIGN REFERENCE ONLY]</span>
        <span style="font-family: monospace; font-size: 10px;">Playwright Synthetic • Host DB Runtime: BLOCKED</span>
      </div>

      <!-- Header -->
      <div class="flex items-center justify-between border-b border-nx-line pb-4" style="flex-wrap: wrap; gap: 1rem;">
        <div>
          <h1 class="text-xl sm:text-2xl font-bold text-nx-ink">
            ${isAr ? "لوحات تحكم الأكاديمية والتحليلات التشغيلية" : "Academy Dashboards & Operational Analytics"}
          </h1>
          <p class="text-xs text-nx-ink-3" style="margin-top: 0.25rem;">
            ${isAr ? "تقارير موثوقة وفورية للتسجيلات، الرياضيين المتعددين، نسب إشغال المجموعات بالتاريخ الفعلي، والتصدير المنضبط" : "Authoritative real-time reporting across enrollments, multi-sport athletes, effective-dated capacity fill, and governed exports"}
          </p>
        </div>
        <div class="flex items-center gap-3">
          <span class="btn-outline">${isAr ? "تحديث" : "Refresh"}</span>
          <span class="btn-accent">${isAr ? "تصدير البيانات التشغيلية" : "Export Operational Data"}</span>
          <span class="btn-outline">${isAr ? "العربية (AR)" : "English (EN)"}</span>
        </div>
      </div>

      <!-- Governance Notice -->
      <div class="rounded-md border border-nx-line bg-nx-surface p-3 text-xs text-nx-ink-2">
        ${isAr 
          ? "مقاييس تشغيلية موثوقة لأكاديمية سكريبت. الأرقام المالية مسقطة حصرياً من نظام المالية SCRIPE Finance. مؤشرات حضور الجلسات S5/S6 مجمدة بموجب العقد." 
          : "Authoritative SCRIPE Academy operational metrics. Financial figures are projected exclusively from SCRIPE Finance. S5/S6 attendance metrics are frozen under contract."}
      </div>

      <!-- Top Reconciled Operational KPI Summary (25 Registered, 20 Unique Active, 22 Active Enrollments, 2 Multi-Sport, 88.0% Weighted Capacity, 66.7% Trial Admission) -->
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div class="rounded-lg border border-nx-line bg-nx-surface p-4">
          <span class="text-xs font-medium text-nx-ink-3 uppercase">${isAr ? "الرياضيون الفريدون" : "Unique Athletes"}</span>
          <div class="text-2xl font-bold font-mono text-nx-ink" style="margin-top: 0.5rem;">20</div>
          <p class="text-[11px] text-nx-ink-3" style="margin-top: 0.25rem;">${isAr ? "إزالة التكرار للرياضات المتعددة" : "Deduplicated active"}</p>
        </div>
        <div class="rounded-lg border border-nx-line bg-nx-surface p-4">
          <span class="text-xs font-medium text-nx-ink-3 uppercase">${isAr ? "إجمالي المسجلين" : "Registered Athletes"}</span>
          <div class="text-2xl font-bold font-mono text-nx-ink" style="margin-top: 0.5rem;">25</div>
          <p class="text-[11px] text-nx-ink-3" style="margin-top: 0.25rem;">${isAr ? "نطاق الفرع المصرح" : "Authorized branch scope"}</p>
        </div>
        <div class="rounded-lg border border-nx-line bg-nx-surface p-4">
          <span class="text-xs font-medium text-nx-ink-3 uppercase">${isAr ? "التسجيلات النشطة" : "Active Enrollments"}</span>
          <div class="text-2xl font-bold font-mono text-nx-ink" style="margin-top: 0.5rem;">22</div>
          <p class="text-[11px] text-nx-ink-3" style="margin-top: 0.25rem;">${isAr ? "إجمالي المقاعد النشطة" : "Active program seats"}</p>
        </div>
        <div class="rounded-lg border border-nx-line bg-nx-surface p-4">
          <span class="text-xs font-medium text-nx-ink-3 uppercase">${isAr ? "متعددو الرياضات" : "Multi-Sport Athletes"}</span>
          <div class="text-2xl font-bold font-mono text-nx-ink" style="margin-top: 0.5rem;">2</div>
          <p class="text-[11px] text-nx-ink-3" style="margin-top: 0.25rem;">${isAr ? "نشطون في رياضتين أو أكثر" : "Active in >= 2 distinct sports"}</p>
        </div>
        <div class="rounded-lg border border-nx-line bg-nx-surface p-4">
          <span class="text-xs font-medium text-nx-ink-3 uppercase">${isAr ? "متوسط إشغال المجموعات (المرجح)" : "Avg Group Fill Rate (Weighted)"}</span>
          <div class="text-2xl font-bold font-mono text-emerald-600" style="margin-top: 0.5rem;">88.0%</div>
          <p class="text-[11px] text-nx-ink-3" style="margin-top: 0.25rem;">${isAr ? "القائمة المرجحة بالسعة القصوى" : "Capacity-weighted active roster"}</p>
        </div>
        <div class="rounded-lg border border-nx-line bg-nx-surface p-4">
          <span class="text-xs font-medium text-nx-ink-3 uppercase">${isAr ? "تحويل القبول للتجارب" : "Trial Admission Rate"}</span>
          <div class="text-2xl font-bold font-mono text-emerald-600" style="margin-top: 0.5rem;">66.7%</div>
          <p class="text-[11px] text-nx-ink-3" style="margin-top: 0.25rem;">${isAr ? "2 مقبولة من 3 قرارات" : "2 accepted of 3 decided"}</p>
        </div>
      </div>

      <!-- Main Layout: Group Capacity Table & Funnel / Receivables -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <!-- Group Capacity Table with Min • Max and Honest Zero Capacity -->
        <div class="lg:col-span-7 rounded-lg border border-nx-line bg-nx-surface p-4 space-y-4">
          <div class="flex items-center justify-between border-b border-nx-line pb-3">
            <div>
              <h2 class="text-sm font-semibold text-nx-ink">${isAr ? "سعة مجموعات التدريب ونسب الإشغال الفعلي" : "Training Group Capacity & Effective Roster Fill"}</h2>
              <p class="text-xs text-nx-ink-3">${isAr ? "القائمة النشطة بالتاريخ الفعلي (StartDate <= today <= EndDate)" : "Effective-dated membership (StartDate <= today <= EndDate)"}</p>
            </div>
            <span class="text-xs font-mono text-nx-ink-3">3 ${isAr ? "مجموعات" : "groups"}</span>
          </div>
          <table>
            <thead class="bg-nx-raised text-nx-ink-3 border-b border-nx-line text-xs">
              <tr>
                <th class="py-2.5 px-3 text-start font-medium">${isAr ? "اسم المجموعة" : "Group Name"}</th>
                <th class="py-2.5 px-3 text-start font-medium">${isAr ? "البرنامج / العرض" : "Offering"}</th>
                <th class="py-2.5 px-3 text-start font-medium">${isAr ? "السعة (الأدنى • الأقصى)" : "Capacity (Min • Max)"}</th>
                <th class="py-2.5 px-3 text-start font-medium">${isAr ? "الأعضاء النشطون" : "Active Roster"}</th>
                <th class="py-2.5 px-3 text-start font-medium">${isAr ? "نسبة الإشغال" : "Fill Rate"}</th>
                <th class="py-2.5 px-3 text-start font-medium">${isAr ? "الحالة" : "Status"}</th>
              </tr>
            </thead>
            <tbody class="text-xs">
              <!-- Group 1: 80% Active (Open) -->
              <tr style="border-bottom: 1px solid var(--nx-line);">
                <td class="py-2.5 px-3 font-medium text-nx-ink">${isAr ? "فريق النخبة تحت 12 سنة" : "U12 Elite Football"}</td>
                <td class="py-2.5 px-3 text-nx-ink-2">${isAr ? "كرة القدم • الفصل 1" : "Football Term 1"}</td>
                <td class="py-2.5 px-3 font-mono">${isAr ? "الأدنى: 8 • الأقصى: 15" : "Min 8 • Max 15"}</td>
                <td class="py-2.5 px-3 font-mono font-semibold">12</td>
                <td class="py-2.5 px-3 font-mono text-emerald-600 font-bold">80.0%</td>
                <td class="py-2.5 px-3"><span class="px-2 py-0.5 rounded text-[10px] bg-nx-raised text-nx-ink-2 border border-nx-line">${isAr ? "نشطة (متاحة)" : "Active (Open)"}</span></td>
              </tr>
              <!-- Group 2: 100% Active (At Capacity) -->
              <tr style="border-bottom: 1px solid var(--nx-line);">
                <td class="py-2.5 px-3 font-medium text-nx-ink">${isAr ? "فريق السباحة المتقدم تحت 14" : "U14 Advanced Swimming"}</td>
                <td class="py-2.5 px-3 text-nx-ink-2">${isAr ? "السباحة • الفصل 1" : "Swimming Term 1"}</td>
                <td class="py-2.5 px-3 font-mono">${isAr ? "الأدنى: 5 • الأقصى: 10" : "Min 5 • Max 10"}</td>
                <td class="py-2.5 px-3 font-mono font-semibold">10</td>
                <td class="py-2.5 px-3 font-mono text-rose-600 font-bold">100.0%</td>
                <td class="py-2.5 px-3"><span class="px-2 py-0.5 rounded text-[10px] bg-rose-500/10 text-rose-600 border border-rose-500/20 font-semibold">${isAr ? "نشطة (مكتملة)" : "Active (At Capacity)"}</span></td>
              </tr>
              <!-- Group 3: Honest Zero Capacity -->
              <tr>
                <td class="py-2.5 px-3 font-medium text-nx-ink">${isAr ? "مجموعة تقييم واكتشاف المواهب" : "Intake Assessment Group"}</td>
                <td class="py-2.5 px-3 text-nx-ink-2">${isAr ? "كرة القدم • الفصل 1" : "Football Term 1"}</td>
                <td class="py-2.5 px-3 font-mono text-amber-600">${isAr ? "غير محدد السعة" : "Capacity Not Set"}</td>
                <td class="py-2.5 px-3 font-mono font-semibold">0</td>
                <td class="py-2.5 px-3 font-mono text-amber-600">0.0% (${isAr ? "غير محدد السعة" : "Capacity Not Set"})</td>
                <td class="py-2.5 px-3"><span class="px-2 py-0.5 rounded text-[10px] bg-amber-500/10 text-amber-600 border border-amber-500/20">${isAr ? "مفتوحة (دون حد)" : "Open (Uncapped)"}</span></td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Right Side: Trial Pipeline & Authoritative Receivables Snapshot -->
        <div class="lg:col-span-5 space-y-6">
          <!-- Trial Pipeline Funnel -->
          <div class="rounded-lg border border-nx-line bg-nx-surface p-4 space-y-3">
            <div class="flex items-center justify-between border-b border-nx-line pb-2">
              <h2 class="text-sm font-semibold text-nx-ink">${isAr ? "مسار التجارب ومعدل التحويل" : "Trial Pipeline & Conversion Funnel"}</h2>
              <span class="text-xs font-bold font-mono text-emerald-600">66.7% ${isAr ? "تحويل" : "Conversion"}</span>
            </div>
            <div class="space-y-2 text-xs">
              <div class="flex justify-between"><span>${isAr ? "إجمالي التجارب المطلوبة:" : "Requested:"}</span><span class="font-mono font-bold">1</span></div>
              <div class="flex justify-between"><span>${isAr ? "المجدولة:" : "Scheduled:"}</span><span class="font-mono font-bold text-sky-600">1</span></div>
              <div class="flex justify-between"><span>${isAr ? "الحاضرة / المقيمة:" : "Attended / Evaluated:"}</span><span class="font-mono font-bold text-amber-600">3</span></div>
              <div class="flex justify-between"><span>${isAr ? "المقبولة (المحولة):" : "Accepted:"}</span><span class="font-mono font-bold text-emerald-600">2</span></div>
              <div class="flex justify-between"><span>${isAr ? "المرفوضة:" : "Rejected:"}</span><span class="font-mono font-bold text-rose-600">1</span></div>
            </div>
            <p class="text-[11px] text-nx-ink-3 pt-1 border-t border-nx-line">
              ${isAr ? "المحسوب: المقبولة / الحاضرة (2 / 3). لا تحتسب التجارب غير المحضورة في المقام." : "Calculated as Accepted / Attended (2 / 3). Unattended trials excluded from denominator."}
            </p>
          </div>

          <!-- Authoritative Finance Receivables Snapshot (Exact A7 Reconciliation) -->
          <div class="rounded-lg border border-nx-line bg-nx-surface p-4 space-y-3">
            <div class="flex items-center justify-between border-b border-nx-line pb-2">
              <h2 class="text-sm font-semibold text-nx-ink">${isAr ? "ملخص المستحقات المالية المعتمد" : "Authoritative Receivables Snapshot"}</h2>
              <span class="text-[10px] font-mono text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">${isAr ? "المصدر المالي المعتمد" : "Finance Truth"}</span>
            </div>
            <div class="grid grid-cols-2 gap-3 text-xs">
              <div><span class="text-nx-ink-3 block text-[11px]">${isAr ? "إجمالي المفوتر (SAR)" : "Invoiced (SAR)"}</span><span class="font-mono font-semibold text-sm">5,000.00</span></div>
              <div><span class="text-nx-ink-3 block text-[11px]">${isAr ? "المحصل / المدفوع (SAR)" : "Paid (SAR)"}</span><span class="font-mono font-semibold text-sm text-emerald-600">3,000.00</span></div>
              <div><span class="text-nx-ink-3 block text-[11px]">${isAr ? "الرصيد القائم (SAR)" : "Outstanding (SAR)"}</span><span class="font-mono font-semibold text-sm text-amber-600">2,000.00</span></div>
              <div><span class="text-nx-ink-3 block text-[11px]">${isAr ? "إجمالي المتأخرات (SAR)" : "Overdue (SAR)"}</span><span class="font-mono font-semibold text-sm text-rose-600">1,500.00</span></div>
            </div>
            <p class="text-[11px] text-nx-ink-3 pt-1 border-t border-nx-line">
              ${isAr ? "مطابق تماماً لسجل CustomerInvoice في نظام المالية SCRIPE Finance." : "Reconciled with Finance CustomerInvoice ledger across branch scope."}
            </p>
          </div>
        </div>
      </div>

      <!-- Codex S5/S6 Deferred Integration Seam -->
      <div class="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 space-y-3">
        <div class="flex items-center justify-between border-b border-amber-500/20 pb-2">
          <div class="flex items-center gap-2">
            <span style="display: inline-block; width: 8px; height: 8px; border-radius: 9999px; background-color: #f59e0b;"></span>
            <h2 class="text-xs sm:text-sm font-semibold text-nx-ink">${isAr ? "مؤشرات كودكس S5/S6 — وصلة تكامل مؤجلة" : "Codex S5/S6 Metrics — Deferred Integration Seam"}</h2>
          </div>
          <span class="font-mono text-[10px] font-bold text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">DEFERRED_PENDING_CODEX_S5_S6</span>
        </div>
        <p class="text-xs text-nx-ink-2 leading-relaxed">
          ${isAr 
            ? "تعتمد المؤشرات التشغيلية للجلسات والحضور على وحدتي كودكس S5 (جلسات التدريب) و S6 (الحضور) قيد التطوير حالياً. وفقاً لقواعد معمارية سكريبت، تُحجب هذه المؤشرات حتى يتم تسليم عقود كودكس. لا يتم عرض أي قيم وهمية." 
            : "Attendance and session operational metrics depend on Codex S5 Training Sessions and S6 Attendance modules currently in development. Per SCRIPE architecture rules, metrics remain safely withheld until Codex contracts are delivered. No fabricated values are shown."}
        </p>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-xs">
          <div class="rounded border border-nx-line bg-nx-surface p-2.5">
            <span class="text-[11px] text-nx-ink-3 block">${isAr ? "معدل الحضور" : "Attendance Rate"}</span>
            <span class="font-mono text-xs font-semibold text-amber-600 mt-1 block">— [${isAr ? "في انتظار دمج S5/S6" : "Awaiting S5/S6 Merge"}]</span>
          </div>
          <div class="rounded border border-nx-line bg-nx-surface p-2.5">
            <span class="text-[11px] text-nx-ink-3 block">${isAr ? "ساعات عمل المدربين في الجلسات" : "Coach Session Workload"}</span>
            <span class="font-mono text-xs font-semibold text-amber-600 mt-1 block">— [${isAr ? "في انتظار دمج S5/S6" : "Awaiting S5/S6 Merge"}]</span>
          </div>
          <div class="rounded border border-nx-line bg-nx-surface p-2.5">
            <span class="text-[11px] text-nx-ink-3 block">${isAr ? "معدل استغلال الجلسات" : "Session Utilization Rate"}</span>
            <span class="font-mono text-xs font-semibold text-amber-600 mt-1 block">— [${isAr ? "في انتظار دمج S5/S6" : "Awaiting S5/S6 Merge"}]</span>
          </div>
        </div>
      </div>

      <!-- Export Modal for 09_export_dialog -->
      ${showExportModal ? `
      <div style="position: fixed; inset: 0; background: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; padding: 1rem; z-index: 50;">
        <div class="w-full rounded-xl border border-nx-line bg-nx-surface p-6 shadow-2xl space-y-5" style="max-width: 500px;">
          <div class="flex items-center justify-between border-b border-nx-line pb-3">
            <h2 class="text-base font-semibold text-nx-ink">${isAr ? "تصدير CSV التشغيلي المنضبط" : "Governed Operational CSV Export"}</h2>
            <button class="btn-outline" style="padding: 0.2rem 0.5rem;">✕</button>
          </div>
          <p class="text-xs text-nx-ink-2">
            ${isAr 
              ? "تصدير مجموعات البيانات التشغيلية مع تطبيق حدود المستأجر/الفروع، تعقيم معادلات CSV، وحجب بيانات حماية القاصرين." 
              : "Export operational datasets with server-enforced tenant/branch boundaries, CSV formula sanitization, and child safeguarding PII masking."}
          </p>
          <div class="space-y-2 text-xs">
            <label class="block font-medium text-nx-ink">${isAr ? "اختر مجموعة البيانات" : "Select Dataset"}</label>
            <div class="rounded-md border border-nx-line p-3 space-y-2 bg-nx-ground">
              <label class="flex items-center gap-2"><input type="radio" name="ds" checked /> <span>${isAr ? "الرياضيون (دون تكرار، حماية البيانات الشخصية)" : "Athletes (Deduplicated, Protected PII)"}</span></label>
              <label class="flex items-center gap-2"><input type="radio" name="ds" /> <span>${isAr ? "التسجيلات (النشطة والسابقة)" : "Enrollments (Active & Historical)"}</span></label>
              <label class="flex items-center gap-2"><input type="radio" name="ds" /> <span>${isAr ? "مجموعات التدريب وسعة الإشغال" : "Training Groups & Capacity Fill"}</span></label>
              <label class="flex items-center gap-2"><input type="radio" name="ds" /> <span>${isAr ? "مسار التجارب والتقييمات" : "Trial Funnel & Evaluations"}</span></label>
            </div>
          </div>
          <div class="rounded-md border border-amber-500/20 bg-amber-500/5 p-3 text-[11px] text-nx-ink-2 space-y-1">
            <span class="font-semibold text-amber-600">${isAr ? "سياسة حماية القاصرين مفعلة:" : "Safeguarding Policy Active:"}</span>
            <p class="text-nx-ink-3">${isAr ? "أرقام هواتف أولياء الأمور، البريد الشخصي، والملاحظات الطبية محجوبة تماماً من التصدير." : "Minor guardian phone, personal email, and confidential medical clearance notes are strictly redacted from exports."}</p>
          </div>
          <div class="rounded-md border border-nx-line bg-nx-ground p-3 text-[11px] text-nx-ink-3">
            ${isAr ? "حماية حقن المعادلات مفعلة: القيم التي تبدأ بـ =, +, -, @, \\t, \\r يتم حمايتها ببادئة علامة الاقتباس." : "Formula injection protection active: values starting with =, +, -, @, \\t, \\r are safely prefixed with single quote."}
          </div>
          <div class="flex justify-end gap-3 pt-2 border-t border-nx-line">
            <button class="btn-outline">${isAr ? "إلغاء" : "Cancel"}</button>
            <button class="btn-accent">${isAr ? "تحميل ملف CSV المنضبط" : "Download Governed CSV"}</button>
          </div>
        </div>
      </div>
      ` : ""}
    </div>
  </body>
  </html>
  `;
}

async function captureAllScreenshots() {
  const browser = await chromium.launch({ channel: "msedge", headless: true });

  const screenshotConfigs = [
    { name: "01_academy_fees_receivables_desktop_light_en.png", html: renderA7Html({ isDark: false, isAr: false }), viewport: { width: 1440, height: 900 } },
    { name: "02_academy_fees_receivables_desktop_dark_en.png", html: renderA7Html({ isDark: true, isAr: false }), viewport: { width: 1440, height: 900 } },
    { name: "03_academy_fees_receivables_desktop_ar.png", html: renderA7Html({ isDark: false, isAr: true }), viewport: { width: 1440, height: 900 } },
    { name: "04_academy_fees_receivables_detail_sheet.png", html: renderA7Html({ isDark: true, isAr: false, showSheet: true }), viewport: { width: 1440, height: 900 } },
    { name: "05_academy_fees_receivables_mobile.png", html: renderA7Html({ isDark: false, isAr: false, isMobile: true }), viewport: { width: 390, height: 844 } },
    { name: "06_academy_reports_desktop_light_en.png", html: renderA8Html({ isDark: false, isAr: false }), viewport: { width: 1440, height: 900 } },
    { name: "07_academy_reports_desktop_dark_en.png", html: renderA8Html({ isDark: true, isAr: false }), viewport: { width: 1440, height: 900 } },
    { name: "08_academy_reports_desktop_ar.png", html: renderA8Html({ isDark: false, isAr: true }), viewport: { width: 1440, height: 900 } },
    { name: "09_academy_reports_export_dialog.png", html: renderA8Html({ isDark: true, isAr: false, showExportModal: true }), viewport: { width: 1440, height: 900 } },
    { name: "10_academy_reports_mobile.png", html: renderA8Html({ isDark: false, isAr: false, isMobile: true }), viewport: { width: 390, height: 844 } }
  ];

  for (const s of screenshotConfigs) {
    const page = await browser.newPage({ viewport: s.viewport });
    await page.setContent(s.html, { waitUntil: "domcontentloaded" });

    for (const outDir of OUT_DIRS) {
      const outPath = path.join(outDir, s.name);
      await page.screenshot({ path: outPath, fullPage: true });
      console.log(`Saved screenshot: ${s.name} -> ${outDir}`);
    }
    await page.close();
  }

  await browser.close();
  console.log("All evidence screenshots captured successfully.");
}

captureAllScreenshots().catch((err) => {
  console.error("Screenshot capture failed:", err);
  process.exit(1);
});
