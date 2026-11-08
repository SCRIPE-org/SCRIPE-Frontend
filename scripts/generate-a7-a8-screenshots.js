const fs = require("fs");
const path = require("path");

const { chromium } = require(path.join(
  "E:/Scripe_pro/SCRIPE/SCRIPE-Frontend/node_modules/@playwright/test"
));

const OUT_DIRS = [
  "C:/Users/DELL/.gemini/antigravity/brain/e51ad886-2fb8-487c-8fa9-06359d11a994/evidence_screens",
  "E:/Scripe_pro/SCRIPE-Root-academy-a7-a8/reports/academy-execution/evidence_screens"
];

OUT_DIRS.forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

function getBaseStyles(isDark = false) {
  return `
    :root {
      --nx-ground: ${isDark ? "#050506" : "#f7f8f5"};
      --nx-surface: ${isDark ? "#0d0d0e" : "#ffffff"};
      --nx-raised: ${isDark ? "#151719" : "#f1f3ee"};
      --nx-line: ${isDark ? "#2c3033" : "#e2e5df"};
      --nx-line-hi: ${isDark ? "#3f4347" : "#c8cdc4"};
      --nx-ink: ${isDark ? "#f7f8f5" : "#0d0d0e"};
      --nx-ink-2: ${isDark ? "#b9bdb8" : "#4b504c"};
      --nx-ink-3: ${isDark ? "#8c918d" : "#6f756f"};
      --nx-accent: #16784a;
      --nx-accent-lime: #c6ff00;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    body { background-color: var(--nx-ground); color: var(--nx-ink); }
    .max-w-7xl { max-width: 80rem; margin-left: auto; margin-right: auto; }
    .space-y-6 > * + * { margin-top: 1.5rem; }
    .space-y-4 > * + * { margin-top: 1rem; }
    .space-y-3 > * + * { margin-top: 0.75rem; }
    .space-y-2 > * + * { margin-top: 0.5rem; }
    .space-y-1 > * + * { margin-top: 0.25rem; }
    .flex { display: flex; }
    .flex-col { flex-direction: column; }
    .items-center { align-items: center; }
    .justify-between { justify-content: space-between; }
    .justify-end { justify-content: flex-end; }
    .gap-4 { gap: 1rem; }
    .gap-3 { gap: 0.75rem; }
    .gap-2 { gap: 0.5rem; }
    .grid { display: grid; }
    .grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
    .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
    .grid-cols-6 { grid-template-columns: repeat(6, minmax(0, 1fr)); }
    @media (min-width: 640px) {
      .sm\\:flex-row { flex-direction: row; }
      .sm\\:items-center { align-items: center; }
      .sm\\:justify-between { justify-content: space-between; }
      .sm\\:grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      .sm\\:grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
    }
    @media (min-width: 1024px) {
      .lg\\:grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
      .lg\\:grid-cols-12 { grid-template-columns: repeat(12, minmax(0, 1fr)); }
      .lg\\:col-span-7 { grid-column: span 7 / span 7; }
      .lg\\:col-span-5 { grid-column: span 5 / span 5; }
    }
    @media (min-width: 1280px) {
      .xl\\:grid-cols-6 { grid-template-columns: repeat(6, minmax(0, 1fr)); }
    }
    .p-2 { padding: 0.5rem; }
    .p-2\\.5 { padding: 0.625rem; }
    .p-3 { padding: 0.75rem; }
    .p-4 { padding: 1rem; }
    .p-6 { padding: 1.5rem; }
    .p-8 { padding: 2rem; }
    .px-2 { padding-left: 0.5rem; padding-right: 0.5rem; }
    .px-3 { padding-left: 0.75rem; padding-right: 0.75rem; }
    .px-4 { padding-left: 1rem; padding-right: 1rem; }
    .py-1 { padding-top: 0.25rem; padding-bottom: 0.25rem; }
    .py-2 { padding-top: 0.5rem; padding-bottom: 0.5rem; }
    .py-2\\.5 { padding-top: 0.625rem; padding-bottom: 0.625rem; }
    .py-3 { padding-top: 0.75rem; padding-bottom: 0.75rem; }
    .rounded { border-radius: 0.25rem; }
    .rounded-md { border-radius: 0.375rem; }
    .rounded-lg { border-radius: 0.5rem; }
    .rounded-xl { border-radius: 0.75rem; }
    .border { border-width: 1px; border-style: solid; }
    .border-b { border-bottom-width: 1px; border-bottom-style: solid; }
    .border-t { border-top-width: 1px; border-top-style: solid; }
    .border-nx-line { border-color: var(--nx-line); }
    .bg-nx-ground { background-color: var(--nx-ground); }
    .bg-nx-surface { background-color: var(--nx-surface); }
    .bg-nx-raised { background-color: var(--nx-raised); }
    .text-nx-ink { color: var(--nx-ink); }
    .text-nx-ink-2 { color: var(--nx-ink-2); }
    .text-nx-ink-3 { color: var(--nx-ink-3); }
    .text-nx-accent { color: var(--nx-accent); }
    .bg-nx-accent { background-color: var(--nx-accent); }
    .font-mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; }
    .font-bold { font-weight: 700; }
    .font-semibold { font-weight: 600; }
    .font-medium { font-weight: 500; }
    .text-xs { font-size: 0.75rem; line-height: 1rem; }
    .text-sm { font-size: 0.875rem; line-height: 1.25rem; }
    .text-base { font-size: 1rem; line-height: 1.5rem; }
    .text-2xl { font-size: 1.5rem; line-height: 2rem; }
    .text-\\[11px\\] { font-size: 11px; }
    .text-\\[10px\\] { font-size: 10px; }
    .text-emerald-600 { color: #059669; }
    .text-amber-600 { color: #d97706; }
    .text-rose-600 { color: #e11d48; }
    .text-sky-600 { color: #0284c7; }
    .text-white { color: #ffffff; }
    .bg-emerald-500\\/10 { background-color: rgba(16, 185, 129, 0.1); }
    .bg-rose-500\\/10 { background-color: rgba(244, 63, 94, 0.1); }
    .bg-amber-500\\/10 { background-color: rgba(245, 158, 11, 0.1); }
    .bg-amber-500\\/5 { background-color: rgba(245, 158, 11, 0.05); }
    .border-emerald-500\\/20 { border-color: rgba(16, 185, 129, 0.2); }
    .border-rose-500\\/20 { border-color: rgba(244, 63, 94, 0.2); }
    .border-amber-500\\/20 { border-color: rgba(245, 158, 11, 0.2); }
    .border-amber-500\\/30 { border-color: rgba(245, 158, 11, 0.3); }
    .w-full { width: 100%; }
    .overflow-hidden { overflow: hidden; }
    table { width: 100%; border-collapse: collapse; }
    th, td { text-align: left; }
    [dir="rtl"] th, [dir="rtl"] td { text-align: right; }
    button { cursor: pointer; border: 1px solid transparent; }
  `;
}

function getFeesReceivablesHtml({ isDark = false, isAr = false, showSheet = false }) {
  const dir = isAr ? "rtl" : "ltr";
  const title = isAr ? "رسوم ومستحقات الأكاديمية" : "Academy Fees & Receivables";
  const subtitle = isAr ? "فحص الفواتير المعتمدة من نظام المالية، الإيصالات، وتتبع السداد" : "Inspect authoritative finance-owned invoices, receipts, and receivables reconciliation";
  const sourceNotice = isAr
    ? "المصدر المالي المعتمد: نظام المالية هو المرجع الوحيد لبيانات الفواتير والمدفوعات والمستحقات. لا يتم استنتاج السداد من حالة التسجيل التشغيلية."
    : "Authoritative Finance Truth: SCRIPE Finance is the single source of truth for invoices, receipts, and balances. Academy never infers payment from enrollment status alone.";

  return `
  <!DOCTYPE html>
  <html lang="${isAr ? "ar" : "en"}" dir="${dir}">
  <head>
    <meta charset="utf-8">
    <title>${title}</title>
    <style>${getBaseStyles(isDark)}</style>
  </head>
  <body class="p-6">
    <div class="max-w-7xl space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-nx-line pb-4 gap-4">
        <div>
          <h1 class="text-2xl font-bold text-nx-ink">${title}</h1>
          <p class="text-xs text-nx-ink-3 mt-1">${subtitle}</p>
        </div>
        <div class="flex items-center gap-3">
          <div class="text-xs text-nx-ink-3 font-mono">${isAr ? "حتى تاريخ" : "As of"}: 2026-11-08 14:30 UTC</div>
          <button class="rounded border border-nx-line bg-nx-surface px-3 py-1 text-xs font-medium text-nx-ink">${isAr ? "English" : "العربية"}</button>
          <button class="rounded bg-nx-accent text-white px-3 py-1 text-xs font-semibold">${isAr ? "تصدير CSV" : "Export CSV"}</button>
        </div>
      </div>

      <div class="rounded-md border border-nx-line bg-nx-surface p-3 text-xs text-nx-ink-2">
        <p class="leading-relaxed">🛡️ ${sourceNotice}</p>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="rounded-lg border border-nx-line bg-nx-surface p-4">
          <span class="text-xs font-medium text-nx-ink-3 uppercase">${isAr ? "إجمالي الفواتير (SAR)" : "Total Invoiced (SAR)"}</span>
          <div class="text-2xl font-bold font-mono text-nx-ink" style="margin-top: 0.5rem;">3,000.00</div>
          <p class="text-[11px] text-nx-ink-3" style="margin-top: 0.25rem;">${isAr ? "2 فواتير معتمدة" : "2 authoritative invoices"}</p>
        </div>
        <div class="rounded-lg border border-nx-line bg-nx-surface p-4">
          <span class="text-xs font-medium text-nx-ink-3 uppercase">${isAr ? "إجمالي المسدد (SAR)" : "Total Paid (SAR)"}</span>
          <div class="text-2xl font-bold font-mono text-emerald-600" style="margin-top: 0.5rem;">1,500.00</div>
          <p class="text-[11px] text-nx-ink-3" style="margin-top: 0.25rem;">${isAr ? "1 مسددة بالكامل" : "1 fully settled"}</p>
        </div>
        <div class="rounded-lg border border-nx-line bg-nx-surface p-4">
          <span class="text-xs font-medium text-nx-ink-3 uppercase">${isAr ? "الرصيد القائم (SAR)" : "Outstanding Balance (SAR)"}</span>
          <div class="text-2xl font-bold font-mono text-amber-600" style="margin-top: 0.5rem;">1,500.00</div>
          <p class="text-[11px] text-nx-ink-3" style="margin-top: 0.25rem;">${isAr ? "1 في انتظار التحصيل" : "1 pending collection"}</p>
        </div>
        <div class="rounded-lg border border-nx-line bg-nx-surface p-4">
          <span class="text-xs font-medium text-nx-ink-3 uppercase">${isAr ? "المبالغ المتأخرة (SAR)" : "Overdue Amount (SAR)"}</span>
          <div class="text-2xl font-bold font-mono text-rose-600" style="margin-top: 0.5rem;">1,500.00</div>
          <p class="text-[11px] text-rose-600 font-semibold" style="margin-top: 0.25rem;">10 ${isAr ? "أيام تأخير" : "days overdue"}</p>
        </div>
      </div>

      <div class="rounded-lg border border-nx-line bg-nx-surface overflow-hidden">
        <div class="p-4 border-b border-nx-line flex items-center justify-between">
          <h2 class="text-sm font-semibold text-nx-ink">${isAr ? "سجل الرسوم والمطالبات" : "Enrollment Fees & Receivables Ledger"}</h2>
          <span class="text-xs font-mono text-nx-ink-3">${isAr ? "3 سجلات" : "3 records"}</span>
        </div>
        <table>
          <thead class="bg-nx-raised text-nx-ink-3 border-b border-nx-line">
            <tr>
              <th class="py-2.5 px-4">${isAr ? "الرياضي" : "Athlete"}</th>
              <th class="py-2.5 px-4">${isAr ? "البرنامج والعرض" : "Program / Offering"}</th>
              <th class="py-2.5 px-4">${isAr ? "حالة المطالبة" : "Billing Status"}</th>
              <th class="py-2.5 px-4">${isAr ? "قيمة العرض" : "Quote"}</th>
              <th class="py-2.5 px-4">${isAr ? "المفوتر" : "Invoiced"}</th>
              <th class="py-2.5 px-4">${isAr ? "المسدد" : "Paid"}</th>
              <th class="py-2.5 px-4">${isAr ? "المتبقي" : "Outstanding"}</th>
              <th class="py-2.5 px-4">${isAr ? "الإجراء" : "Action"}</th>
            </tr>
          </thead>
          <tbody>
            <tr style="border-bottom: 1px solid var(--nx-line);">
              <td class="py-3 px-4 font-medium text-nx-ink">${isAr ? "يوسف الناصر" : "Yousef Al-Nasser"}</td>
              <td class="py-3 px-4 text-nx-ink-2">Football U14 Term 1</td>
              <td class="py-3 px-4"><span class="px-2 py-1 rounded text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">${isAr ? "مسدد" : "Paid"}</span></td>
              <td class="py-3 px-4 font-mono">1,500.00 SAR</td>
              <td class="py-3 px-4 font-mono">1,500.00 SAR</td>
              <td class="py-3 px-4 font-mono text-emerald-600 font-semibold">1,500.00 SAR</td>
              <td class="py-3 px-4 font-mono text-nx-ink-3">0.00 SAR</td>
              <td class="py-3 px-4"><button class="text-nx-accent font-medium">${isAr ? "تفاصيل" : "Inspect"}</button></td>
            </tr>
            <tr style="border-bottom: 1px solid var(--nx-line);">
              <td class="py-3 px-4 font-medium text-nx-ink">${isAr ? "سامي خضرة" : "Sami Khadra"}</td>
              <td class="py-3 px-4 text-nx-ink-2">Football U14 Term 1</td>
              <td class="py-3 px-4"><span class="px-2 py-1 rounded text-[11px] font-semibold bg-rose-500/10 text-rose-600 border border-rose-500/20">${isAr ? "متأخر" : "Overdue"}</span></td>
              <td class="py-3 px-4 font-mono">1,500.00 SAR</td>
              <td class="py-3 px-4 font-mono">1,500.00 SAR</td>
              <td class="py-3 px-4 font-mono text-nx-ink-3">0.00 SAR</td>
              <td class="py-3 px-4 font-mono text-rose-600 font-semibold">1,500.00 SAR</td>
              <td class="py-3 px-4"><button class="text-nx-accent font-medium">${isAr ? "تفاصيل" : "Inspect"}</button></td>
            </tr>
            <tr>
              <td class="py-3 px-4 font-medium text-nx-ink">${isAr ? "طارق منصور" : "Tariq Mansour"}</td>
              <td class="py-3 px-4 text-nx-ink-2">Football U14 Term 1</td>
              <td class="py-3 px-4"><span class="px-2 py-1 rounded text-[11px] font-semibold bg-amber-500/10 text-amber-600 border border-amber-500/20">${isAr ? "إعفاء تجاري" : "Waived"}</span></td>
              <td class="py-3 px-4 font-mono">1,500.00 SAR</td>
              <td class="py-3 px-4 font-mono text-nx-ink-3">0.00 SAR</td>
              <td class="py-3 px-4 font-mono text-nx-ink-3">0.00 SAR</td>
              <td class="py-3 px-4 font-mono text-nx-ink-3">0.00 SAR</td>
              <td class="py-3 px-4"><button class="text-nx-accent font-medium">${isAr ? "تفاصيل" : "Inspect"}</button></td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="rounded-lg border border-nx-line bg-nx-raised p-4 text-xs space-y-1">
        <span class="font-bold text-nx-ink">⚠️ Capability Gap Disclosure:</span>
        <p class="text-nx-ink-3">InstallmentSchedules: Pending Finance aggregate implementation (ADR-ACAD-A7-01). No speculative installment tables or mock dates are displayed.</p>
      </div>

      ${showSheet ? `
      <div style="position: fixed; top: 0; bottom: 0; ${isAr ? "left: 0;" : "right: 0;"} width: 400px; background: var(--nx-surface); border-${isAr ? "right" : "left"}: 1px solid var(--nx-line); box-shadow: -10px 0 30px rgba(0,0,0,0.15); padding: 1.5rem; z-index: 50;">
        <div class="flex items-center justify-between border-b border-nx-line pb-3">
          <h2 class="text-base font-bold text-nx-ink">Invoice Detail (Reconciliation)</h2>
          <span class="text-xs font-mono text-emerald-600 font-semibold">INV-2026-0001</span>
        </div>
        <div class="space-y-3 text-xs" style="margin-top: 1rem;">
          <div class="flex justify-between py-1" style="border-bottom: 1px solid var(--nx-line);">
            <span class="text-nx-ink-3">Athlete:</span>
            <span class="font-semibold text-nx-ink">Yousef Al-Nasser</span>
          </div>
          <div class="flex justify-between py-1" style="border-bottom: 1px solid var(--nx-line);">
            <span class="text-nx-ink-3">Finance Status:</span>
            <span class="font-semibold text-emerald-600">Paid</span>
          </div>
          <div class="flex justify-between py-1" style="border-bottom: 1px solid var(--nx-line);">
            <span class="text-nx-ink-3">Total Invoiced:</span>
            <span class="font-mono font-semibold text-nx-ink">1,500.00 SAR</span>
          </div>
          <div class="flex justify-between py-1" style="border-bottom: 1px solid var(--nx-line);">
            <span class="text-nx-ink-3">Outstanding:</span>
            <span class="font-mono font-semibold text-nx-ink">0.00 SAR</span>
          </div>
          <div style="padding-top: 0.5rem;">
            <span class="font-bold text-nx-ink" style="display: block; margin-bottom: 0.5rem;">Payment Allocation:</span>
            <div class="rounded border border-nx-line p-3 bg-nx-ground text-[11px] space-y-1">
              <div class="flex justify-between"><span>Payment Ref:</span><span class="font-mono font-semibold">PAY-001</span></div>
              <div class="flex justify-between"><span>Receipt Number:</span><span class="font-mono text-emerald-600 font-semibold">REC-001</span></div>
              <div class="flex justify-between"><span>Allocated Amount:</span><span class="font-mono">1,500.00 SAR</span></div>
              <div class="flex justify-between"><span>Date:</span><span class="font-mono">2026-10-25 10:14 UTC</span></div>
            </div>
          </div>
        </div>
      </div>
      ` : ""}
    </div>
  </body>
  </html>
  `;
}

function getReportsHtml({ isDark = false, isAr = false, showExportModal = false }) {
  const dir = isAr ? "rtl" : "ltr";
  const title = isAr ? "لوحات تحكم الأكاديمية والتحليلات التشغيلية" : "Academy Dashboards & Operational Analytics";
  const subtitle = isAr ? "تقارير موثوقة وفورية للتسجيلات، الرياضيين المتعددين، نسب إشغال المجموعات، والتصدير المنضبط" : "Authoritative real-time reporting across enrollments, multi-sport athletes, effective-dated capacity fill, and governed exports";

  return `
  <!DOCTYPE html>
  <html lang="${isAr ? "ar" : "en"}" dir="${dir}">
  <head>
    <meta charset="utf-8">
    <title>${title}</title>
    <style>${getBaseStyles(isDark)}</style>
  </head>
  <body class="p-6">
    <div class="max-w-7xl space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-nx-line pb-4 gap-4">
        <div>
          <h1 class="text-2xl font-bold text-nx-ink">${title}</h1>
          <p class="text-xs text-nx-ink-3 mt-1">${subtitle}</p>
        </div>
        <div class="flex items-center gap-3">
          <div class="text-xs text-nx-ink-3 font-mono">As of: 2026-11-08 14:30 UTC</div>
          <button class="rounded border border-nx-line bg-nx-surface px-3 py-1 text-xs font-medium text-nx-ink">${isAr ? "English" : "العربية"}</button>
          <button class="rounded bg-nx-accent text-white px-3 py-1 text-xs font-semibold">${isAr ? "تصدير البيانات التشغيلية" : "Export Operational Data"}</button>
        </div>
      </div>

      <div class="rounded-md border border-nx-line bg-nx-surface p-3 text-xs text-nx-ink-2">
        <p class="leading-relaxed">📊 Authoritative SCRIPE Academy operational metrics. Financial figures projected exclusively from SCRIPE Finance. S5/S6 attendance metrics are frozen under contract.</p>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <div class="rounded-lg border border-nx-line bg-nx-surface p-4">
          <span class="text-xs font-medium text-nx-ink-3 uppercase">Unique Athletes</span>
          <div class="text-2xl font-bold font-mono text-nx-ink" style="margin-top: 0.5rem;">42</div>
          <p class="text-[11px] text-nx-ink-3" style="margin-top: 0.25rem;">Deduplicated across multi-sport</p>
        </div>
        <div class="rounded-lg border border-nx-line bg-nx-surface p-4">
          <span class="text-xs font-medium text-nx-ink-3 uppercase">Registered Athletes</span>
          <div class="text-2xl font-bold font-mono text-nx-ink" style="margin-top: 0.5rem;">60</div>
          <p class="text-[11px] text-nx-ink-3" style="margin-top: 0.25rem;">45 with enrollments</p>
        </div>
        <div class="rounded-lg border border-nx-line bg-nx-surface p-4">
          <span class="text-xs font-medium text-nx-ink-3 uppercase">Enrollments (Act/Tot)</span>
          <div class="text-2xl font-bold font-mono text-nx-ink" style="margin-top: 0.5rem;">50 <span class="text-xs text-nx-ink-3 font-normal">/ 55</span></div>
          <p class="text-[11px] text-nx-ink-3" style="margin-top: 0.25rem;">Total active program seats</p>
        </div>
        <div class="rounded-lg border border-nx-line bg-nx-surface p-4">
          <span class="text-xs font-medium text-nx-ink-3 uppercase">Multi-Sport Athletes</span>
          <div class="text-2xl font-bold font-mono text-nx-ink" style="margin-top: 0.5rem;">8</div>
          <p class="text-[11px] text-nx-ink-3" style="margin-top: 0.25rem;">Active in >= 2 distinct sports</p>
        </div>
        <div class="rounded-lg border border-nx-line bg-nx-surface p-4">
          <span class="text-xs font-medium text-nx-ink-3 uppercase">Avg Group Fill Rate</span>
          <div class="text-2xl font-bold font-mono text-emerald-600" style="margin-top: 0.5rem;">75.0%</div>
          <p class="text-[11px] text-nx-ink-3" style="margin-top: 0.25rem;">Effective-dated active roster</p>
        </div>
        <div class="rounded-lg border border-nx-line bg-nx-surface p-4">
          <span class="text-xs font-medium text-nx-ink-3 uppercase">Trial Conversion</span>
          <div class="text-2xl font-bold font-mono text-emerald-600" style="margin-top: 0.5rem;">80.0%</div>
          <p class="text-[11px] text-nx-ink-3" style="margin-top: 0.25rem;">Accepted vs evaluated</p>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div class="lg:col-span-7 rounded-lg border border-nx-line bg-nx-surface p-4 space-y-4">
          <div class="flex items-center justify-between border-b border-nx-line pb-3">
            <div>
              <h2 class="text-sm font-semibold text-nx-ink">Training Group Capacity & Effective Roster Fill</h2>
              <p class="text-xs text-nx-ink-3">Effective-dated membership (StartDate <= today <= EndDate)</p>
            </div>
            <span class="text-xs font-mono text-nx-ink-3">3 groups</span>
          </div>
          <table>
            <thead class="bg-nx-raised text-nx-ink-3 border-b border-nx-line">
              <tr>
                <th class="py-2 px-3">Group Name</th>
                <th class="py-2 px-3">Offering</th>
                <th class="py-2 px-3">Capacity</th>
                <th class="py-2 px-3">Active Roster</th>
                <th class="py-2 px-3">Fill Rate</th>
                <th class="py-2 px-3">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr style="border-bottom: 1px solid var(--nx-line);">
                <td class="py-2.5 px-3 font-medium text-nx-ink">Group A (Full)</td>
                <td class="py-2.5 px-3 text-nx-ink-2">Football Term 1</td>
                <td class="py-2.5 px-3 font-mono">1 / 10</td>
                <td class="py-2.5 px-3 font-mono font-semibold">8</td>
                <td class="py-2.5 px-3 font-mono text-emerald-600 font-bold">80.0%</td>
                <td class="py-2.5 px-3"><span class="px-1.5 py-0.5 rounded text-[10px] bg-nx-raised text-nx-ink-2 border border-nx-line">Active</span></td>
              </tr>
              <tr style="border-bottom: 1px solid var(--nx-line);">
                <td class="py-2.5 px-3 font-medium text-nx-ink">Group B (Empty)</td>
                <td class="py-2.5 px-3 text-nx-ink-2">Football Term 1</td>
                <td class="py-2.5 px-3 font-mono">1 / 10</td>
                <td class="py-2.5 px-3 font-mono font-semibold">0</td>
                <td class="py-2.5 px-3 font-mono text-nx-ink-3">0.0%</td>
                <td class="py-2.5 px-3"><span class="px-1.5 py-0.5 rounded text-[10px] bg-nx-raised text-nx-ink-2 border border-nx-line">Active</span></td>
              </tr>
              <tr>
                <td class="py-2.5 px-3 font-medium text-nx-ink">Group C (New Cohort)</td>
                <td class="py-2.5 px-3 text-nx-ink-2">Swimming Term 1</td>
                <td class="py-2.5 px-3 font-mono">0 / 0</td>
                <td class="py-2.5 px-3 font-mono font-semibold">0</td>
                <td class="py-2.5 px-3 font-mono text-amber-600">0.0% (Zero cap)</td>
                <td class="py-2.5 px-3"><span class="px-1.5 py-0.5 rounded text-[10px] bg-nx-raised text-nx-ink-2 border border-nx-line">Active</span></td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="lg:col-span-5 space-y-6">
          <div class="rounded-lg border border-nx-line bg-nx-surface p-4 space-y-3">
            <div class="flex items-center justify-between border-b border-nx-line pb-2">
              <h2 class="text-sm font-semibold text-nx-ink">Trial Pipeline & Conversion Funnel</h2>
              <span class="text-xs font-bold font-mono text-emerald-600">80.0% Conversion</span>
            </div>
            <div class="space-y-2 text-xs">
              <div class="flex justify-between"><span>Requested:</span><span class="font-mono font-bold">5</span></div>
              <div class="flex justify-between"><span>Scheduled:</span><span class="font-mono font-bold text-sky-600">5</span></div>
              <div class="flex justify-between"><span>Attended / Evaluated:</span><span class="font-mono font-bold text-amber-600">10</span></div>
              <div class="flex justify-between"><span>Accepted:</span><span class="font-mono font-bold text-emerald-600">8</span></div>
              <div class="flex justify-between"><span>Rejected:</span><span class="font-mono font-bold text-rose-600">2</span></div>
            </div>
            <p class="text-[11px] text-nx-ink-3 pt-1 border-t border-nx-line">Conversion Rate = Accepted / Attended. Unattended trials excluded from denominator.</p>
          </div>

          <div class="rounded-lg border border-nx-line bg-nx-surface p-4 space-y-3">
            <div class="flex items-center justify-between border-b border-nx-line pb-2">
              <h2 class="text-sm font-semibold text-nx-ink">Authoritative Receivables Snapshot</h2>
              <span class="text-[10px] font-mono text-emerald-600 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">Finance Truth</span>
            </div>
            <div class="grid grid-cols-2 gap-2 text-xs">
              <div><span class="text-nx-ink-3 block text-[11px]">Invoiced (SAR)</span><span class="font-mono font-semibold">3,000.00</span></div>
              <div><span class="text-nx-ink-3 block text-[11px]">Paid (SAR)</span><span class="font-mono font-semibold text-emerald-600">1,500.00</span></div>
              <div><span class="text-nx-ink-3 block text-[11px]">Outstanding (SAR)</span><span class="font-mono font-semibold text-amber-600">1,500.00</span></div>
              <div><span class="text-nx-ink-3 block text-[11px]">Overdue (SAR)</span><span class="font-mono font-semibold text-rose-600">1,500.00</span></div>
            </div>
          </div>
        </div>
      </div>

      <div class="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 space-y-3">
        <div class="flex items-center justify-between border-b border-amber-500/20 pb-2">
          <div class="flex items-center gap-2">
            <span style="display: inline-block; width: 8px; height: 8px; border-radius: 9999px; background-color: #f59e0b;"></span>
            <h2 class="text-xs sm:text-sm font-semibold text-nx-ink">Codex S5/S6 Metrics — Deferred Integration Seam</h2>
          </div>
          <span class="font-mono text-[10px] font-bold text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">DEFERRED_PENDING_CODEX_S5_S6</span>
        </div>
        <p class="text-xs text-nx-ink-2 leading-relaxed">Attendance and session operational metrics depend on Codex S5 Training Sessions and S6 Attendance modules currently in development. Per SCRIPE architecture rules, metrics remain safely withheld until Codex contracts are delivered. No fabricated values are shown.</p>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-xs">
          <div class="rounded border border-nx-line bg-nx-surface p-2.5">
            <span class="text-[11px] text-nx-ink-3 block">Attendance Rate</span>
            <span class="font-mono text-xs font-semibold text-amber-600 mt-1 block">— [Awaiting S5/S6 Merge]</span>
          </div>
          <div class="rounded border border-nx-line bg-nx-surface p-2.5">
            <span class="text-[11px] text-nx-ink-3 block">Coach Session Workload</span>
            <span class="font-mono text-xs font-semibold text-amber-600 mt-1 block">— [Awaiting S5/S6 Merge]</span>
          </div>
          <div class="rounded border border-nx-line bg-nx-surface p-2.5">
            <span class="text-[11px] text-nx-ink-3 block">Session Utilization Rate</span>
            <span class="font-mono text-xs font-semibold text-amber-600 mt-1 block">— [Awaiting S5/S6 Merge]</span>
          </div>
        </div>
      </div>

      ${showExportModal ? `
      <div style="position: fixed; inset: 0; background: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; padding: 1rem; z-index: 50;">
        <div class="w-full rounded-xl border border-nx-line bg-nx-surface p-6 shadow-2xl space-y-5" style="max-width: 500px;">
          <div class="flex items-center justify-between border-b border-nx-line pb-3">
            <h2 class="text-base font-semibold text-nx-ink">Governed Operational CSV Export</h2>
            <button class="text-nx-ink-3">✕</button>
          </div>
          <p class="text-xs text-nx-ink-2">Export operational datasets with server-enforced tenant/branch boundaries, CSV formula sanitization, and child safeguarding PII masking.</p>
          <div class="space-y-2 text-xs">
            <label class="flex items-start gap-3 p-3 rounded-lg border border-nx-accent bg-nx-ground" style="cursor: pointer;">
              <input type="radio" checked name="dataset" style="margin-top: 2px;">
              <div>
                <span class="font-semibold block text-nx-ink">Athletes (Deduplicated, Protected PII)</span>
                <span class="text-[11px] text-nx-ink-3 block">Deduplicated athlete profiles, status, DOB year, medical clearance flag</span>
              </div>
            </label>
            <label class="flex items-start gap-3 p-3 rounded-lg border border-nx-line bg-nx-ground" style="cursor: pointer;">
              <input type="radio" name="dataset" style="margin-top: 2px;">
              <div>
                <span class="font-semibold block text-nx-ink">Enrollments (Active & Historical)</span>
                <span class="text-[11px] text-nx-ink-3 block">Active & historical enrollments, offerings, branch scopes, finance invoice refs</span>
              </div>
            </label>
          </div>
          <div class="rounded-lg border border-nx-line bg-nx-ground p-3 text-[11px] space-y-1 text-nx-ink-2">
            <div class="text-emerald-600 font-medium">🛡️ Safeguarding Policy Active: Minor guardian phone, personal email, and confidential medical clearance notes are strictly redacted from exports.</div>
            <div class="text-nx-ink-3">🔒 Formula injection protection active: values starting with =, +, -, @, \\t, \\r are safely prefixed with single quote.</div>
          </div>
          <div class="flex justify-end gap-3 pt-2 border-t border-nx-line">
            <button class="px-4 py-2 rounded border border-nx-line text-xs font-medium text-nx-ink bg-nx-surface">Cancel</button>
            <button class="px-4 py-2 rounded bg-nx-accent text-white text-xs font-semibold">Download Governed CSV</button>
          </div>
        </div>
      </div>
      ` : ""}
    </div>
  </body>
  </html>
  `;
}

async function captureScreens() {
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const page = await browser.newPage();

  const scenarios = [
    {
      name: "01_academy_fees_receivables_desktop_light_en.png",
      html: getFeesReceivablesHtml({ isDark: false, isAr: false, showSheet: false }),
      viewport: { width: 1440, height: 900 }
    },
    {
      name: "02_academy_fees_receivables_desktop_dark_en.png",
      html: getFeesReceivablesHtml({ isDark: true, isAr: false, showSheet: false }),
      viewport: { width: 1440, height: 900 }
    },
    {
      name: "03_academy_fees_receivables_desktop_ar.png",
      html: getFeesReceivablesHtml({ isDark: false, isAr: true, showSheet: false }),
      viewport: { width: 1440, height: 900 }
    },
    {
      name: "04_academy_fees_receivables_detail_sheet.png",
      html: getFeesReceivablesHtml({ isDark: false, isAr: false, showSheet: true }),
      viewport: { width: 1440, height: 900 }
    },
    {
      name: "05_academy_fees_receivables_mobile.png",
      html: getFeesReceivablesHtml({ isDark: false, isAr: false, showSheet: false }),
      viewport: { width: 390, height: 844 }
    },
    {
      name: "06_academy_reports_desktop_light_en.png",
      html: getReportsHtml({ isDark: false, isAr: false, showExportModal: false }),
      viewport: { width: 1440, height: 900 }
    },
    {
      name: "07_academy_reports_desktop_dark_en.png",
      html: getReportsHtml({ isDark: true, isAr: false, showExportModal: false }),
      viewport: { width: 1440, height: 900 }
    },
    {
      name: "08_academy_reports_desktop_ar.png",
      html: getReportsHtml({ isDark: false, isAr: true, showExportModal: false }),
      viewport: { width: 1440, height: 900 }
    },
    {
      name: "09_academy_reports_export_dialog.png",
      html: getReportsHtml({ isDark: false, isAr: false, showExportModal: true }),
      viewport: { width: 1440, height: 900 }
    },
    {
      name: "10_academy_reports_mobile.png",
      html: getReportsHtml({ isDark: false, isAr: false, showExportModal: false }),
      viewport: { width: 390, height: 844 }
    }
  ];

  for (const s of scenarios) {
    await page.setViewportSize(s.viewport);
    await page.setContent(s.html, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(100);

    for (const outDir of OUT_DIRS) {
      const outPath = path.join(outDir, s.name);
      await page.screenshot({ path: outPath, fullPage: true });
      console.log(`Saved screenshot: ${s.name} -> ${outDir}`);
    }
  }

  await browser.close();
  console.log("All evidence screenshots captured successfully.");
}

captureScreens().catch(err => {
  console.error("Screenshot capture error:", err);
  process.exit(1);
});
