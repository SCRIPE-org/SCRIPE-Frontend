"use client";

import React from "react";
import Link from "next/link";
import {
  BarChart3,
  CircleDollarSign,
  CalendarDays,
  TrendingUp,
  Download,
  Upload,
  RefreshCw,
  Filter,
  Layers,
  Receipt,
  AlertCircle,
  FileSpreadsheet,
} from "lucide-react";
import { Button } from "@core/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@core/ui/card";
import { PageHeader } from "@core/ui/page-header";
import { Badge } from "@core/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@core/ui/tabs";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@core/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@core/ui/dropdown-menu";
import { useVenueReportsViewModel, ReportCategory } from "../viewmodels/useVenueReportsViewModel";
import { ImportDataModal } from "../components/ImportDataModal";

export function VenueReportsView() {
  const vm = useVenueReportsViewModel();
  const {
    category,
    setCategory,
    filters,
    setFilters,
    isLoading,
    error,
    refresh,
    sites,
    resources,
    invoices,
    bookings,
    courtPerformance,
    payments,
    currencyTotals,
    handleExport,
    isImportOpen,
    setIsImportOpen,
    importStep,
    setImportStep,
    importType,
    setImportType,
    parsedTable,
    columnMapping,
    setColumnMapping,
    validationReport,
    isCommitting,
    importSummaryResult,
    handleFileSelect,
    executeValidation,
    commitImport,
    resetImport,
    t,
    isRtl,
  } = vm;

  return (
    <div
      className="space-y-6 max-w-[1400px] mx-auto text-nx-ink"
      dir={isRtl ? "rtl" : "ltr"}
      data-testid="venue-reports-view"
    >
      {/* Page Header */}
      <PageHeader
        icon={BarChart3}
        title={t("venueNav.reports", { defaultValue: isRtl ? "التقارير وتصدير البيانات" : "Reports & Data Hub" })}
        description={
          isRtl
            ? "تحليلات تشغيلية ومالية معتمدة، تصدير ملفات Excel معزولة العملات، واستيراد آمن للبيانات."
            : "Authoritative financial and operational reports, multi-currency Excel export, and audited data import."
        }
      >
        <div className="flex flex-wrap items-center gap-2">
          {/* Refresh Action */}
          <Button
            variant="outline"
            size="sm"
            onClick={refresh}
            disabled={isLoading}
            className="text-xs h-9 gap-1.5"
          >
            <RefreshCw className={`size-3.5 ${isLoading ? "animate-spin" : ""}`} />
            <span>{isRtl ? "تحديث" : "Refresh"}</span>
          </Button>

          {/* Import Data Modal Trigger (A12-A14) */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsImportOpen(true)}
            className="text-xs h-9 gap-1.5 border-nx-line text-nx-ink hover:bg-nx-surfaceSubtle"
          >
            <Upload className="size-3.5" />
            <span>{isRtl ? "استيراد بيانات" : "Import Data"}</span>
          </Button>

          {/* Export to Excel Dropdown (A11) */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" className="text-xs h-9 gap-1.5 bg-nx-accent hover:bg-nx-accent/90 text-nx-accent-contrast font-semibold">
                <Download className="size-3.5" />
                <span>{isRtl ? "تصدير إلى Excel" : "Export Report"}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align={isRtl ? "start" : "end"} className="text-xs w-48 bg-nx-surface border-nx-line">
              <DropdownMenuItem onClick={() => handleExport("xls")} className="gap-2 cursor-pointer">
                <FileSpreadsheet className="size-4 text-emerald-600" />
                <span>{isRtl ? "ملف Excel Workbook (.xls)" : "Excel Workbook (.xls)"}</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport("csv")} className="gap-2 cursor-pointer">
                <Download className="size-4 text-nx-accent" />
                <span>{isRtl ? "ملف مرمز CSV (UTF-8 BOM)" : "CSV File (UTF-8 BOM)"}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </PageHeader>

      {/* Category Tabs (A8) */}
      <Tabs
        value={category}
        onValueChange={(val) => setCategory(val as ReportCategory)}
        className="w-full"
      >
        <TabsList className="grid grid-cols-2 md:grid-cols-4 w-full h-auto p-1 bg-nx-surfaceSubtle border border-nx-line rounded-nx-xl">
          <TabsTrigger
            value="financial"
            className="text-xs py-2.5 font-semibold gap-2 data-[state=active]:bg-nx-surface data-[state=active]:shadow-xs"
          >
            <CircleDollarSign className="size-4 text-emerald-600" />
            <span>{isRtl ? "التقرير المالي العام" : "Financial Report"}</span>
          </TabsTrigger>
          <TabsTrigger
            value="bookings"
            className="text-xs py-2.5 font-semibold gap-2 data-[state=active]:bg-nx-surface data-[state=active]:shadow-xs"
          >
            <CalendarDays className="size-4 text-nx-accent" />
            <span>{isRtl ? "تقرير الحجوزات والتشغيل" : "Booking Operations"}</span>
          </TabsTrigger>
          <TabsTrigger
            value="court-performance"
            className="text-xs py-2.5 font-semibold gap-2 data-[state=active]:bg-nx-surface data-[state=active]:shadow-xs"
          >
            <Layers className="size-4 text-nx-accent" />
            <span>{isRtl ? "أداء الملاعب والمساحات" : "Court Performance"}</span>
          </TabsTrigger>
          <TabsTrigger
            value="collections"
            className="text-xs py-2.5 font-semibold gap-2 data-[state=active]:bg-nx-surface data-[state=active]:shadow-xs"
          >
            <Receipt className="size-4 text-amber-600" />
            <span>{isRtl ? "سجل التحصيلات والمدفوعات" : "Payments & Collections"}</span>
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Currency Isolation KPI Cards (Requirement A11 & A10: Never sum unlike currencies) */}
      {Object.keys(currencyTotals).length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {Object.entries(currencyTotals).map(([curr, values]) => (
            <Card key={curr} className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-xs font-mono font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
                    {curr}
                  </Badge>
                  <span className="text-[11px] text-slate-500">
                    {isRtl ? "ملخص معزول العملة" : "Isolated Currency Balance"}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-100 dark:border-slate-800 text-center">
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase">{isRtl ? "القيمة التجارية" : "Commercial"}</div>
                    <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
                      {values.commercialValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase">{isRtl ? "المحصل" : "Collected"}</div>
                    <div className="text-xs sm:text-sm font-bold text-emerald-600 dark:text-emerald-400">
                      {values.collected.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase">{isRtl ? "المستحق" : "Outstanding"}</div>
                    <div className="text-xs sm:text-sm font-bold text-amber-600 dark:text-amber-400">
                      {values.outstanding.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Filter Bar (A9) */}
      <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {/* Date Range From */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-500">
                {isRtl ? "من تاريخ" : "From Date"}
              </label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilters((prev) => ({ ...prev, dateFrom: e.target.value }))}
                className="w-full text-xs h-9 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
              />
            </div>

            {/* Date Range To */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-500">
                {isRtl ? "إلى تاريخ" : "To Date"}
              </label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => setFilters((prev) => ({ ...prev, dateTo: e.target.value }))}
                className="w-full text-xs h-9 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
              />
            </div>

            {/* Court / Resource Filter */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-500">
                {isRtl ? "الملعب / المساحة" : "Court / Space"}
              </label>
              <select
                value={filters.resourceId}
                onChange={(e) => setFilters((prev) => ({ ...prev, resourceId: e.target.value }))}
                className="w-full text-xs h-9 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
              >
                <option value="">{isRtl ? "جميع الملاعب" : "All Courts & Spaces"}</option>
                {resources.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-500">
                {isRtl ? "الحالة" : "Status"}
              </label>
              <select
                value={filters.bookingStatus}
                onChange={(e) => setFilters((prev) => ({ ...prev, bookingStatus: e.target.value }))}
                className="w-full text-xs h-9 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
              >
                <option value="all">{isRtl ? "جميع الحالات" : "All Statuses"}</option>
                <option value="Confirmed">{isRtl ? "مؤكد" : "Confirmed"}</option>
                <option value="CheckedIn">{isRtl ? "تم الحضور" : "Checked In"}</option>
                <option value="Completed">{isRtl ? "مكتمل" : "Completed"}</option>
                <option value="Cancelled">{isRtl ? "ملغي" : "Cancelled"}</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Authoritative Live Preview Table (A10) */}
      <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs overflow-hidden">
        <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-sm font-bold">
              {category === "financial" && (isRtl ? "معاينة الفواتير والذمم المالية" : "Financial Invoices & Receivables")}
              {category === "bookings" && (isRtl ? "سجل حجوزات الملاعب" : "Reservations Audit Trail")}
              {category === "court-performance" && (isRtl ? "تحليل إيرادات وأداء الملاعب" : "Resource Performance Breakdown")}
              {category === "collections" && (isRtl ? "المدفوعات والتحصيلات الميدانية" : "Recorded Payments Register")}
            </CardTitle>
            <CardDescription className="text-xs">
              {isRtl
                ? "بيانات حقيقية معتمدة مسترجعة من محرك النظام الرئيسي."
                : "Live authoritative records retrieved from backend engine."}
            </CardDescription>
          </div>

          <Badge variant="secondary" className="text-xs font-mono">
            {category === "financial" && `${invoices.length} ${isRtl ? "فواتير" : "invoices"}`}
            {category === "bookings" && `${bookings.length} ${isRtl ? "حجوزات" : "bookings"}`}
            {category === "court-performance" && `${courtPerformance.length} ${isRtl ? "ملاعب" : "courts"}`}
            {category === "collections" && `${payments.length} ${isRtl ? "دفعات" : "payments"}`}
          </Badge>
        </CardHeader>

        <CardContent className="p-0">
          {isLoading ? (
            <div className="py-16 text-center text-xs text-nx-ink-2">
              <RefreshCw className="size-6 animate-spin mx-auto mb-2 text-nx-accent" />
              <span>{isRtl ? "جارٍ استرجاع البيانات المعتمدة..." : "Querying authoritative backend..."}</span>
            </div>
          ) : error ? (
            <div className="py-12 text-center text-xs text-rose-600 space-y-1">
              <AlertCircle className="size-6 mx-auto mb-1 text-rose-500" />
              <div className="font-semibold">{error}</div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              {/* Category 1: Financial */}
              {category === "financial" && (
                <Table>
                  <TableHeader className="bg-slate-50 dark:bg-slate-900/50">
                    <TableRow>
                      <TableHead>{isRtl ? "رقم الفاتورة" : "Invoice #"}</TableHead>
                      <TableHead>{isRtl ? "العميل / المدين" : "Customer / Payer"}</TableHead>
                      <TableHead>{isRtl ? "الحالة" : "Status"}</TableHead>
                      <TableHead>{isRtl ? "التاريخ" : "Issued Date"}</TableHead>
                      <TableHead>{isRtl ? "العملة" : "Currency"}</TableHead>
                      <TableHead className="text-end">{isRtl ? "الإجمالي" : "Total"}</TableHead>
                      <TableHead className="text-end">{isRtl ? "المسدد" : "Paid"}</TableHead>
                      <TableHead className="text-end">{isRtl ? "المتبقي" : "Outstanding"}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoices.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="py-12 text-center text-xs text-slate-400">
                          {isRtl ? "لا توجد فواتير مطابقة لمعايير البحث." : "No financial records matching current filters."}
                        </TableCell>
                      </TableRow>
                    ) : (
                      invoices.map((inv) => (
                        <TableRow key={inv.id}>
                          <TableCell className="font-mono text-xs font-semibold">{inv.invoiceNumber}</TableCell>
                          <TableCell className="text-xs">{inv.payerPartyId.slice(0, 8)}...</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-[10px]">
                              {inv.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs text-slate-500">{inv.issuedAtUtc.slice(0, 10)}</TableCell>
                          <TableCell className="font-mono text-xs">{inv.currencyCode}</TableCell>
                          <TableCell className="text-end font-mono text-xs font-semibold">
                            {inv.totalAmount.toFixed(2)}
                          </TableCell>
                          <TableCell className="text-end font-mono text-xs text-emerald-600">
                            {inv.paidAmount.toFixed(2)}
                          </TableCell>
                          <TableCell className="text-end font-mono text-xs text-amber-600">
                            {inv.outstandingAmount.toFixed(2)}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              )}

              {/* Category 2: Bookings */}
              {category === "bookings" && (
                <Table>
                  <TableHeader className="bg-slate-50 dark:bg-slate-900/50">
                    <TableRow>
                      <TableHead>{isRtl ? "مرجع الحجز" : "Reservation Ref"}</TableHead>
                      <TableHead>{isRtl ? "الملعب" : "Court / Space"}</TableHead>
                      <TableHead>{isRtl ? "الحالة" : "Status"}</TableHead>
                      <TableHead>{isRtl ? "وقت البدء" : "Start Time"}</TableHead>
                      <TableHead>{isRtl ? "وقت الانتهاء" : "End Time"}</TableHead>
                      <TableHead className="text-end">{isRtl ? "الفترات" : "Slots"}</TableHead>
                      <TableHead>{isRtl ? "تاريخ الإنشاء" : "Created"}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bookings.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="py-12 text-center text-xs text-slate-400">
                          {isRtl ? "لا توجد حجوزات مطابقة." : "No reservations found."}
                        </TableCell>
                      </TableRow>
                    ) : (
                      bookings.map((b) => (
                        <TableRow key={b.id}>
                          <TableCell className="font-mono text-xs font-semibold">{b.reservationNumber}</TableCell>
                          <TableCell className="text-xs font-medium">{b.resourceName || b.resourceId}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-[10px]">
                              {b.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs text-slate-500">
                            {new Date(b.requestedStartUtc).toLocaleString()}
                          </TableCell>
                          <TableCell className="text-xs text-slate-500">
                            {new Date(b.requestedEndUtc).toLocaleString()}
                          </TableCell>
                          <TableCell className="text-end font-mono text-xs">{b.quantity}</TableCell>
                          <TableCell className="text-xs text-slate-400">{b.createdAt.slice(0, 10)}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              )}

              {/* Category 3: Court Performance */}
              {category === "court-performance" && (
                <Table>
                  <TableHeader className="bg-slate-50 dark:bg-slate-900/50">
                    <TableRow>
                      <TableHead>{isRtl ? "الملعب / المساحة" : "Court / Space"}</TableHead>
                      <TableHead>{isRtl ? "العملة" : "Currency"}</TableHead>
                      <TableHead className="text-end">{isRtl ? "القيمة التجارية" : "Commercial Value"}</TableHead>
                      <TableHead className="text-end">{isRtl ? "المحصل" : "Collected"}</TableHead>
                      <TableHead className="text-end">{isRtl ? "المستحق" : "Outstanding"}</TableHead>
                      <TableHead className="text-end">{isRtl ? "عدد الفواتير" : "Invoices"}</TableHead>
                      <TableHead className="text-end">{isRtl ? "عدد الدفعات" : "Payments"}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {courtPerformance.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="py-12 text-center text-xs text-slate-400">
                          {isRtl ? "لا توجد بيانات أداء مسجلة." : "No court performance records."}
                        </TableCell>
                      </TableRow>
                    ) : (
                      courtPerformance.map((row, idx) => {
                        const courtName = resources.find((r) => r.id === row.resourceId)?.name || row.resourceId;
                        return (
                          <TableRow key={idx}>
                            <TableCell className="text-xs font-semibold">{courtName}</TableCell>
                            <TableCell className="font-mono text-xs">{row.currencyCode}</TableCell>
                            <TableCell className="text-end font-mono text-xs">
                              {row.commercialValue.toFixed(2)}
                            </TableCell>
                            <TableCell className="text-end font-mono text-xs text-emerald-600">
                              {row.collected.toFixed(2)}
                            </TableCell>
                            <TableCell className="text-end font-mono text-xs text-amber-600">
                              {row.outstanding.toFixed(2)}
                            </TableCell>
                            <TableCell className="text-end font-mono text-xs">{row.invoiceCount}</TableCell>
                            <TableCell className="text-end font-mono text-xs">{row.paymentCount}</TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              )}

              {/* Category 4: Collections */}
              {category === "collections" && (
                <Table>
                  <TableHeader className="bg-slate-50 dark:bg-slate-900/50">
                    <TableRow>
                      <TableHead>{isRtl ? "رقم الدفعة" : "Payment #"}</TableHead>
                      <TableHead>{isRtl ? "طريقة الدفع" : "Method"}</TableHead>
                      <TableHead>{isRtl ? "الحالة" : "Status"}</TableHead>
                      <TableHead>{isRtl ? "العملة" : "Currency"}</TableHead>
                      <TableHead className="text-end">{isRtl ? "المبلغ" : "Amount"}</TableHead>
                      <TableHead className="text-end">{isRtl ? "المخصص" : "Allocated"}</TableHead>
                      <TableHead>{isRtl ? "تاريخ القيد" : "Recorded Date"}</TableHead>
                      <TableHead>{isRtl ? "المرجع" : "External Ref"}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="py-12 text-center text-xs text-slate-400">
                          {isRtl ? "لا توجد دفعات مسجلة." : "No recorded payments found."}
                        </TableCell>
                      </TableRow>
                    ) : (
                      payments.map((p) => (
                        <TableRow key={p.id}>
                          <TableCell className="font-mono text-xs font-semibold">{p.paymentNumber}</TableCell>
                          <TableCell className="text-xs">
                            <Badge variant="outline" className="text-[10px]">
                              {p.method}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs">{p.status}</TableCell>
                          <TableCell className="font-mono text-xs">{p.currencyCode}</TableCell>
                          <TableCell className="text-end font-mono text-xs font-semibold text-emerald-600">
                            {p.amount.toFixed(2)}
                          </TableCell>
                          <TableCell className="text-end font-mono text-xs text-slate-500">
                            {p.allocatedAmount.toFixed(2)}
                          </TableCell>
                          <TableCell className="text-xs text-slate-500">{p.recordedAtUtc.slice(0, 10)}</TableCell>
                          <TableCell className="text-xs text-slate-400 font-mono">
                            {p.externalReference || "-"}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Staged Data Import Modal Component */}
      <ImportDataModal
        isOpen={isImportOpen}
        onClose={resetImport}
        importStep={importStep}
        setImportStep={setImportStep}
        importType={importType}
        setImportType={setImportType}
        parsedTable={parsedTable}
        columnMapping={columnMapping}
        setColumnMapping={setColumnMapping}
        validationReport={validationReport}
        isCommitting={isCommitting}
        importSummaryResult={importSummaryResult}
        onFileSelect={handleFileSelect}
        onExecuteValidation={executeValidation}
        onCommitImport={commitImport}
        onReset={resetImport}
        isRtl={isRtl}
      />
    </div>
  );
}
