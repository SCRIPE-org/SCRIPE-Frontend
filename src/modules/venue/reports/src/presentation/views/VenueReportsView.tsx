"use client";

import React from "react";
import {
  BarChart3,
  CircleDollarSign,
  CalendarDays,
  Download,
  Upload,
  RefreshCw,
  Layers,
  Receipt,
  AlertCircle,
  FileSpreadsheet,
} from "lucide-react";
import { Button } from "@core/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@core/ui/select";
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
      className="mx-auto max-w-[1400px] space-y-6 text-nx-ink"
      dir={isRtl ? "rtl" : "ltr"}
      data-testid="venue-reports-view"
    >
      {/* Page Header */}
      <PageHeader
        icon={BarChart3}
        title={t("venueReports.title")}
        description={t("venueReports.description")}
      >
        <div className="flex flex-wrap items-center gap-2">
          {/* Refresh Action */}
          <Button
            variant="outline"
            size="sm"
            onClick={refresh}
            disabled={isLoading}
            className="h-9 gap-1.5 text-xs"
          >
            <RefreshCw className={`size-3.5 ${isLoading ? "animate-spin" : ""}`} />
            <span>{t("venueReports.refresh")}</span>
          </Button>

          {/* Import Data Modal Trigger (A12-A14) */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsImportOpen(true)}
            className="hover:bg-nx-surfaceSubtle h-9 gap-1.5 border-nx-line text-xs text-nx-ink"
          >
            <Upload className="size-3.5" />
            <span>{t("venueReports.importAction")}</span>
          </Button>

          {/* Export to Excel Dropdown (A11) */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="sm"
                className="hover:bg-nx-accent/90 text-nx-on-fill h-9 gap-1.5 bg-nx-accent text-xs font-semibold"
              >
                <Download className="size-3.5" />
                <span>{t("venueReports.ui.exportReport")}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align={isRtl ? "start" : "end"}
              className="w-48 border-nx-line bg-nx-surface text-xs"
            >
              <DropdownMenuItem
                onClick={() => handleExport("xls")}
                className="cursor-pointer gap-2"
              >
                <FileSpreadsheet className="size-4 text-success" />
                <span>{t("venueReports.ui.xlsWorkbook")}</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleExport("csv")}
                className="cursor-pointer gap-2"
              >
                <Download className="size-4 text-nx-accent" />
                <span>{t("venueReports.ui.csvUtf8")}</span>
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
        <TabsList className="bg-nx-surfaceSubtle rounded-nx-xl grid h-auto w-full grid-cols-2 border border-nx-line p-1 md:grid-cols-4">
          <TabsTrigger
            value="financial"
            className="data-[state=active]:shadow-xs gap-2 py-2.5 text-xs font-semibold data-[state=active]:bg-nx-surface"
          >
            <CircleDollarSign className="size-4 text-success" />
            <span>{t("venueReports.ui.financialReport")}</span>
          </TabsTrigger>
          <TabsTrigger
            value="bookings"
            className="data-[state=active]:shadow-xs gap-2 py-2.5 text-xs font-semibold data-[state=active]:bg-nx-surface"
          >
            <CalendarDays className="size-4 text-nx-accent" />
            <span>{t("venueReports.ui.bookingOperations")}</span>
          </TabsTrigger>
          <TabsTrigger
            value="court-performance"
            className="data-[state=active]:shadow-xs gap-2 py-2.5 text-xs font-semibold data-[state=active]:bg-nx-surface"
          >
            <Layers className="size-4 text-nx-accent" />
            <span>{t("venueReports.ui.courtPerformance")}</span>
          </TabsTrigger>
          <TabsTrigger
            value="collections"
            className="data-[state=active]:shadow-xs gap-2 py-2.5 text-xs font-semibold data-[state=active]:bg-nx-surface"
          >
            <Receipt className="size-4 text-warning" />
            <span>{t("venueReports.ui.collectionsReport")}</span>
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Currency Isolation KPI Cards (Requirement A11 & A10: Never sum unlike currencies) */}
      {Object.keys(currencyTotals).length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1 text-xs text-nx-ink-3">
            <span className="text-[11px] font-semibold uppercase tracking-wider">
              {category === "financial"
                ? t("venueReports.ui.financeSummary")
                : t("venueReports.ui.loadedRecordsSummary")}
            </span>
            <span className="font-mono text-[11px]">
              {category === "financial"
                ? t("venueReports.ui.financeSummaryScope")
                : t("venueReports.ui.currentLoadedScope")}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            {Object.entries(currencyTotals).map(([curr, values]) => {
              const isUnspecified = curr === "UNSPECIFIED";
              return (
                <Card
                  key={curr}
                  className={`rounded-nx-xl shadow-xs border-nx-line bg-nx-surface ${
                    isUnspecified ? "border-warning/30 bg-warning/5" : ""
                  }`}
                >
                  <CardContent className="space-y-3 p-4">
                    <div className="flex items-center justify-between">
                      <Badge
                        variant={isUnspecified ? "destructive" : "outline"}
                        className="bg-nx-surfaceSubtle border-nx-line font-mono text-xs font-bold text-nx-ink"
                      >
                        {isUnspecified ? t("venueReports.ui.unspecifiedCurrency") : curr}
                      </Badge>
                      <span className="text-[11px] text-nx-ink-3">
                        {t("venueReports.ui.isolatedCurrencyBalance")}
                      </span>
                    </div>
                    <div className="border-nx-line/50 grid grid-cols-3 gap-2 border-t pt-1 text-center">
                      <div>
                        <div className="text-[10px] font-semibold uppercase text-nx-ink-3">
                          {t("venueReports.ui.commercialValue")}
                        </div>
                        <div className="font-mono text-xs font-bold text-nx-ink sm:text-sm">
                          {values.commercialValue.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] font-semibold uppercase text-nx-ink-3">
                          {t("venueReports.ui.collected")}
                        </div>
                        <div className="font-mono text-xs font-bold text-success sm:text-sm">
                          {values.collected.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] font-semibold uppercase text-nx-ink-3">
                          {t("venueReports.ui.outstanding")}
                        </div>
                        <div className="font-mono text-xs font-bold text-warning sm:text-sm">
                          {values.outstanding.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Filter Bar (A9) */}
      {category === "bookings" && (
        <Card className="rounded-nx-xl shadow-xs border-nx-line bg-nx-surface">
          <CardContent className="p-4">
            <div className="max-w-sm space-y-1">
              <label className="text-[11px] font-semibold text-nx-ink-2">
                {t("venueReports.ui.court")}
              </label>
              <Select
                value={filters.resourceId || "all"}
                onValueChange={(resourceId) =>
                  setFilters((prev) => ({
                    ...prev,
                    resourceId: resourceId === "all" ? "" : resourceId,
                  }))
                }
              >
                <SelectTrigger aria-label={t("venueReports.ui.court")} className="h-9 text-xs">
                  <SelectValue placeholder={t("venueReports.filters.allResources")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("venueReports.filters.allResources")}</SelectItem>
                  {resources.map((resource) => (
                    <SelectItem key={resource.id} value={resource.id}>
                      {resource.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-[11px] text-nx-ink-3">{t("venueReports.ui.bookingFilterScope")}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Authoritative Live Preview Table (A10) */}
      <Card className="rounded-nx-xl shadow-xs overflow-hidden border-nx-line bg-nx-surface">
        <CardHeader className="border-nx-line/60 bg-nx-surfaceSubtle/30 flex flex-row items-center justify-between border-b pb-3">
          <div>
            <CardTitle className="text-sm font-bold">
              {category === "financial" && t("venueReports.ui.financialPreview")}
              {category === "bookings" && t("venueReports.ui.bookingPreview")}
              {category === "court-performance" && t("venueReports.ui.performancePreview")}
              {category === "collections" && t("venueReports.ui.collectionsPreview")}
            </CardTitle>
            <CardDescription className="text-xs">
              {t("venueReports.ui.previewDescription")}
            </CardDescription>
          </div>

          <Badge variant="secondary" className="font-mono text-xs">
            {category === "financial" &&
              t("venueReports.ui.invoiceCount", { count: invoices.length })}
            {category === "bookings" &&
              t("venueReports.ui.bookingCount", { count: bookings.length })}
            {category === "court-performance" &&
              t("venueReports.ui.courtCount", { count: courtPerformance.length })}
            {category === "collections" &&
              t("venueReports.ui.paymentCount", { count: payments.length })}
          </Badge>
        </CardHeader>

        <CardContent className="p-0">
          {isLoading ? (
            <div className="py-16 text-center text-xs text-nx-ink-2">
              <RefreshCw className="mx-auto mb-2 size-6 animate-spin text-nx-accent" />
              <span>{t("venueReports.ui.loading")}</span>
            </div>
          ) : error ? (
            <div className="space-y-1 py-12 text-center text-xs text-destructive">
              <AlertCircle className="mx-auto mb-1 size-6 text-destructive" />
              <div className="font-semibold">{error}</div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              {/* Category 1: Financial */}
              {category === "financial" && (
                <Table>
                  <TableHeader className="bg-nx-surfaceSubtle/80">
                    <TableRow>
                      <TableHead>{t("venueReports.ui.invoiceNumber")}</TableHead>
                      <TableHead>{t("venueReports.ui.payer")}</TableHead>
                      <TableHead>{t("venueReports.ui.status")}</TableHead>
                      <TableHead>{t("venueReports.ui.issuedDate")}</TableHead>
                      <TableHead>{t("venueReports.table.currency")}</TableHead>
                      <TableHead className="text-end">{t("venueReports.ui.total")}</TableHead>
                      <TableHead className="text-end">{t("venueReports.ui.paid")}</TableHead>
                      <TableHead className="text-end">{t("venueReports.ui.outstanding")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoices.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="py-12 text-center text-xs text-nx-ink-3">
                          {t("venueReports.ui.noInvoices")}
                        </TableCell>
                      </TableRow>
                    ) : (
                      invoices.map((inv) => (
                        <TableRow key={inv.id}>
                          <TableCell className="font-mono text-xs font-semibold">
                            {inv.invoiceNumber}
                          </TableCell>
                          <TableCell className="text-xs">
                            {inv.payerPartyId.slice(0, 8)}...
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-[10px]">
                              {inv.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs text-nx-ink-2">
                            {inv.issuedAtUtc.slice(0, 10)}
                          </TableCell>
                          <TableCell className="font-mono text-xs">{inv.currencyCode}</TableCell>
                          <TableCell className="text-end font-mono text-xs font-semibold">
                            {inv.totalAmount.toFixed(2)}
                          </TableCell>
                          <TableCell className="text-end font-mono text-xs text-success">
                            {inv.paidAmount.toFixed(2)}
                          </TableCell>
                          <TableCell className="text-end font-mono text-xs text-warning">
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
                  <TableHeader className="bg-nx-surfaceSubtle/80">
                    <TableRow>
                      <TableHead>{t("venueReports.ui.reservationReference")}</TableHead>
                      <TableHead>{t("venueReports.ui.court")}</TableHead>
                      <TableHead>{t("venueReports.ui.status")}</TableHead>
                      <TableHead>{t("venueReports.ui.startTime")}</TableHead>
                      <TableHead>{t("venueReports.ui.endTime")}</TableHead>
                      <TableHead className="text-end">{t("venueReports.ui.slots")}</TableHead>
                      <TableHead>{t("venueReports.ui.created")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bookings.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="py-12 text-center text-xs text-nx-ink-3">
                          {t("venueReports.ui.noBookings")}
                        </TableCell>
                      </TableRow>
                    ) : (
                      bookings.map((b) => (
                        <TableRow key={b.id}>
                          <TableCell className="font-mono text-xs font-semibold">
                            {b.reservationNumber}
                          </TableCell>
                          <TableCell className="text-xs font-medium">
                            {b.resourceName || b.resourceId}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-[10px]">
                              {b.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs text-nx-ink-2">
                            {new Date(b.requestedStartUtc).toLocaleString()}
                          </TableCell>
                          <TableCell className="text-xs text-nx-ink-2">
                            {new Date(b.requestedEndUtc).toLocaleString()}
                          </TableCell>
                          <TableCell className="text-end font-mono text-xs">{b.quantity}</TableCell>
                          <TableCell className="text-xs text-nx-ink-3">
                            {b.createdAt.slice(0, 10)}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              )}

              {/* Category 3: Court Performance */}
              {category === "court-performance" && (
                <Table>
                  <TableHeader className="bg-nx-surfaceSubtle/80">
                    <TableRow>
                      <TableHead>{t("venueReports.ui.court")}</TableHead>
                      <TableHead>{t("venueReports.table.currency")}</TableHead>
                      <TableHead className="text-end">
                        {t("venueReports.ui.commercialValue")}
                      </TableHead>
                      <TableHead className="text-end">{t("venueReports.ui.collected")}</TableHead>
                      <TableHead className="text-end">{t("venueReports.ui.outstanding")}</TableHead>
                      <TableHead className="text-end">{t("venueReports.ui.invoices")}</TableHead>
                      <TableHead className="text-end">{t("venueReports.ui.payments")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {courtPerformance.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="py-12 text-center text-xs text-nx-ink-3">
                          {t("venueReports.ui.noPerformance")}
                        </TableCell>
                      </TableRow>
                    ) : (
                      courtPerformance.map((row, idx) => {
                        const courtName =
                          resources.find((r) => r.id === row.resourceId)?.name || row.resourceId;
                        return (
                          <TableRow key={idx}>
                            <TableCell className="text-xs font-semibold">{courtName}</TableCell>
                            <TableCell className="font-mono text-xs">{row.currencyCode}</TableCell>
                            <TableCell className="text-end font-mono text-xs">
                              {row.commercialValue.toFixed(2)}
                            </TableCell>
                            <TableCell className="text-end font-mono text-xs text-success">
                              {row.collected.toFixed(2)}
                            </TableCell>
                            <TableCell className="text-end font-mono text-xs text-warning">
                              {row.outstanding.toFixed(2)}
                            </TableCell>
                            <TableCell className="text-end font-mono text-xs">
                              {row.invoiceCount}
                            </TableCell>
                            <TableCell className="text-end font-mono text-xs">
                              {row.paymentCount}
                            </TableCell>
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
                  <TableHeader className="bg-nx-surfaceSubtle/80">
                    <TableRow>
                      <TableHead>{t("venueReports.ui.paymentNumber")}</TableHead>
                      <TableHead>{t("venueReports.ui.method")}</TableHead>
                      <TableHead>{t("venueReports.ui.status")}</TableHead>
                      <TableHead>{t("venueReports.table.currency")}</TableHead>
                      <TableHead className="text-end">{t("venueReports.ui.amount")}</TableHead>
                      <TableHead className="text-end">{t("venueReports.ui.allocated")}</TableHead>
                      <TableHead>{t("venueReports.ui.recordedDate")}</TableHead>
                      <TableHead>{t("venueReports.ui.externalReference")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="py-12 text-center text-xs text-nx-ink-3">
                          {t("venueReports.ui.noPayments")}
                        </TableCell>
                      </TableRow>
                    ) : (
                      payments.map((p) => (
                        <TableRow key={p.id}>
                          <TableCell className="font-mono text-xs font-semibold">
                            {p.paymentNumber}
                          </TableCell>
                          <TableCell className="text-xs">
                            <Badge variant="outline" className="text-[10px]">
                              {p.method}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs">{p.status}</TableCell>
                          <TableCell className="font-mono text-xs">{p.currencyCode}</TableCell>
                          <TableCell className="text-end font-mono text-xs font-semibold text-success">
                            {p.amount.toFixed(2)}
                          </TableCell>
                          <TableCell className="text-end font-mono text-xs text-nx-ink-2">
                            {p.allocatedAmount.toFixed(2)}
                          </TableCell>
                          <TableCell className="text-xs text-nx-ink-2">
                            {p.recordedAtUtc.slice(0, 10)}
                          </TableCell>
                          <TableCell className="font-mono text-xs text-nx-ink-3">
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
        onCommitImport={() => commitImport(false)}
        onRetryFailedCustomers={() => commitImport(true)}
        onReset={resetImport}
        isRtl={isRtl}
      />
    </div>
  );
}
